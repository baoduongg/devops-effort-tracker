import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// UI layer: composer should not allow sending an empty message.
test("empty message cannot be sent via composer", async ({ page }) => {
  await loginAs(page, "dev@test.com");
  await page.goto("/chat");

  const sendButton = page.getByRole("button", { name: /gửi|send/i }).first();
  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill("");

  // No user bubble should ever appear for a blank send attempt.
  const bubblesBefore = await page.getByRole("article").count();
  if (await sendButton.isVisible().catch(() => false)) {
    await expect(sendButton).toBeDisabled();
  }
  await composer.press("Enter");
  await page.waitForTimeout(500);
  const bubblesAfter = await page.getByRole("article").count();
  expect(bubblesAfter).toBe(bubblesBefore);
});

// UI layer: "Đang suy nghĩ" loading indicator must appear while the AI call is in flight.
test("thinking indicator is shown while awaiting AI response", async ({ page }) => {
  await loginAs(page, "dev@test.com");
  await page.goto("/chat");

  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill("task của tôi hôm nay là gì?");

  const thinking = page.getByText("Đang suy nghĩ");
  await composer.press("Enter");

  await expect(thinking).toBeVisible({ timeout: 10000 });
  // Resolves (success or error) within the AI timeout budget; indicator must clear either way.
  await expect(thinking).toBeHidden({ timeout: 45000 });
});

// UI layer: a rejected/5xx AI response must surface the error banner, not hang silently.
test("AI request failure surfaces an error banner", async ({ page }) => {
  await loginAs(page, "dev@test.com");
  await page.goto("/chat");

  // Force the underlying route call to fail so we exercise the catch/setError path
  // in components/chat/chat-box.tsx without relying on a real NVIDIA outage.
  await page.route("**/api/ai/answer-query", (route) => route.abort("failed"));

  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill("task của tôi hôm nay là gì?");
  await composer.press("Enter");

  await expect(page.getByText("Lỗi khi xử lý yêu cầu với AI. Vui lòng kiểm tra lại kết nối / API Key.")).toBeVisible({
    timeout: 15000,
  });

  // Thinking indicator must clear even on failure, not hang forever.
  await expect(page.getByText("Đang suy nghĩ")).toBeHidden();
});

// UI layer: connection lost mid-flight (request hangs then aborts) must not leave the
// composer stuck in a permanently disabled/loading state.
test("connection lost while awaiting response recovers the composer", async ({ page }) => {
  await loginAs(page, "dev@test.com");
  await page.goto("/chat");

  await page.route("**/api/ai/answer-query", async (route) => {
    // Simulate the connection dropping partway through the wait, rather than an
    // immediate failure, before aborting.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.abort("connectionreset");
  });

  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill("task của tôi hôm nay là gì?");
  await composer.press("Enter");

  await expect(page.getByText("Lỗi khi xử lý yêu cầu với AI. Vui lòng kiểm tra lại kết nối / API Key.")).toBeVisible({
    timeout: 15000,
  });

  // Composer must be usable again (not stuck disabled) after the dropped connection.
  await expect(composer).toBeEnabled();
});
