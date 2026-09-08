import { test, expect, type Page } from "@playwright/test";

// Regression coverage for spec rev 3 (Chat AI F-06/F-07/F-08), the AC that QC has verified
// PASS across the last few dev-qc rounds (docs/product/qc-report.md). Runs against the real
// dev server + live Firestore (no test doubles/emulator in this repo) using the existing
// "Continue as guest" anonymous sign-in — this environment's guest session persists as a
// fixed account with real seed data already present (project "LineFX", members
// "Bảo Dương 2005" / "Bao Duong 98"), so tests key off that data rather than creating new
// records (non-destructive, matches how QC tested these AC by hand).
//
// AI calls in this app go to a real NVIDIA-backed endpoint, so waits are generous (up to 90s).

const THINKING_TIMEOUT = 90000;

async function signInAsGuest(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByText("Tiếp tục với vai trò Khách (Guest)").click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

/** Ensures the current session's role is Leader (toggles via sidebar if currently DevOps). */
async function ensureLeaderRole(page: Page): Promise<void> {
  const body = await page.locator("body").innerText();
  if (body.includes("Đổi sang DevOps")) {
    // Already Leader (button offers switching TO DevOps) — nothing to do.
    return;
  }
  await page.getByText("Đổi sang Leader").click();
  await page.waitForTimeout(1500);
}

/** Ensures the current session's role is DevOps (toggles via sidebar if currently Leader). */
async function ensureDevopsRole(page: Page): Promise<void> {
  const body = await page.locator("body").innerText();
  if (body.includes("Đổi sang Leader")) {
    // Already DevOps.
    return;
  }
  await page.getByText("Đổi sang DevOps").click();
  await page.waitForTimeout(1500);
}

async function openChatOnModeRadio(page: Page, radioLabel: "Log / Plan" | "Ask"): Promise<void> {
  await page.goto("/chat");
  const checkedRadio = page.getByRole("radio", { checked: true });
  await expect(checkedRadio).toBeVisible({ timeout: 10000 });
  const currentLabel = await checkedRadio.innerText();
  if (currentLabel !== radioLabel) {
    await page.getByRole("radio", { name: radioLabel }).click();
  }
  await expect(page.getByRole("radio", { checked: true })).toHaveText(radioLabel, { timeout: 10000 });
  // Let the per-mode chat history finish loading before counting/interacting with messages.
  await page.waitForTimeout(3000);
}

async function sendMessage(page: Page, text: string) {
  const input = page.getByLabel("Nhập tin nhắn");
  await input.fill(text);
  await page.keyboard.press("Enter");
  const lastArticle = page.locator("article").last();
  await expect(lastArticle).not.toHaveText("Thinking", { timeout: THINKING_TIMEOUT });
  return lastArticle;
}

test.describe("Chat AI rev 3 regression (F-06/F-07/F-08)", () => {
  test.describe.configure({ mode: "serial" });

  test("AC-CHAT-01-1: raw unfilled template is rejected, no entry card", async ({ page }) => {
    await signInAsGuest(page);
    await ensureDevopsRole(page);
    await openChatOnModeRadio(page, "Log / Plan");

    const reply = await sendMessage(
      page,
      "Giao task [Tên công việc] cho [Tên nhân sự] thuộc dự án [Tên dự án] thời gian [1 tiếng]"
    );

    await expect(reply).toContainText("chưa điền");
    await expect(reply.getByRole("button", { name: "Xác nhận" })).toHaveCount(0);
  });

  test("AC-CHAT-06: task without a project name is asked back, not fabricated", async ({ page }) => {
    await signInAsGuest(page);
    await ensureDevopsRole(page);
    await openChatOnModeRadio(page, "Log / Plan");

    const uniqueTitle = `E2E log server check ${Date.now()}`;
    const reply = await sendMessage(
      page,
      `Giao task ${uniqueTitle} cho Bảo Dương 2005, thời gian 1 tiếng`
    );

    // Must ask which project — must NOT create an entry card with a made-up project.
    await expect(reply).toContainText("dự án nào");
    await expect(reply.getByRole("button", { name: "Xác nhận" })).toHaveCount(0);
  });

  test("AC-CHAT-04/08: valid task with a real project still creates an entry card", async ({ page }) => {
    await signInAsGuest(page);
    await ensureDevopsRole(page);
    await openChatOnModeRadio(page, "Log / Plan");

    const uniqueTitle = `E2E valid task ${Date.now()}`;
    const reply = await sendMessage(
      page,
      `Giao task ${uniqueTitle} cho Bảo Dương 2005 thuộc dự án LineFX thời gian 1 tiếng`
    );

    await expect(reply).toContainText("LineFX");
    await expect(reply).toContainText("Bảo Dương 2005");
    await expect(reply.getByRole("button", { name: "Xác nhận" })).toHaveCount(1);
  });

  test("AC-CHAT-10/12: DevOps role via Ask tab never sees other members' data", async ({ page }) => {
    await signInAsGuest(page);
    await ensureDevopsRole(page);
    await openChatOnModeRadio(page, "Ask");

    const reply = await sendMessage(page, "/report");

    await expect(reply).not.toContainText("Bảo Dương 2005");
    await expect(reply).not.toContainText("Bao Duong 98");
  });

  test("AC-CHAT-13: Leader role via Ask tab still sees full team report (no regression)", async ({ page }) => {
    await signInAsGuest(page);
    await ensureLeaderRole(page);
    await openChatOnModeRadio(page, "Ask");

    const reply = await sendMessage(page, "/report");

    await expect(reply).toContainText("Bảo Dương 2005");
    await expect(reply).toContainText("Bao Duong 98");
  });
});
