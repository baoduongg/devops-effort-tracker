import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Regression for F-12 / AC-12-4 (spec.md rev 2, ISSUE-16 fix per docs/product/issues.md
// rev 12 verify note): a devops self-log sentence that doesn't name anyone must default
// the proposed EntryCard's assignee to the person chatting ("dev@test.com"), not to some
// other devops auto-suggested by findBestSuitableMember (the bug reproduced "qc1@test.com").
test("devops self-log entry defaults assignee to the person chatting", async ({ page }) => {
  await loginAs(page, "dev@test.com");

  await page.goto("/chat");

  // Default tab is "Log / Plan" (mode devops) — no need to switch.
  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill("Fix lỗi connect AWS bên service Hook, 30 phút");
  await composer.press("Enter");

  // Prior test runs may leave older unconfirmed EntryCards in this account's chat
  // history, so scope to the newest one (appended last) rather than assuming a single match.
  const confirmButton = page.getByRole("button", { name: "Xác nhận" }).last();
  await expect(confirmButton).toBeVisible({ timeout: 45000 });

  await expect(page.getByText("Assignee: dev@test.com").last()).toBeVisible();
});
