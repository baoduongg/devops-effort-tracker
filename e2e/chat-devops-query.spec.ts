import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Regression for F-12 / ISSUE-14,16,17,18 (spec.md rev 2, AC-12-1/AC-12-2): a devops
// account asking a natural question (no "?", no obvious question keyword) on the
// Ask tab must get answered from real data, not misrouted into a create-task EntryCard.
test("devops natural query is answered, not misread as a create-task command", async ({ page }) => {
  await loginAs(page, "dev@test.com");

  await page.goto("/chat");

  // Switch to the "Ask" tab (mode "leader" in the toggle, used for Q&A by any role).
  await page.getByRole("radio", { name: "Ask" }).click();

  // A prior test/run against this same seeded account may have left older messages
  // (including unconfirmed EntryCards) in chat history — count from before this send
  // so assertions below only look at what this question actually produced.
  const confirmButtonsBefore = await page.getByRole("button", { name: "Xác nhận" }).count();

  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill("task của tôi hôm nay là gì?");
  await composer.press("Enter");

  // Wait directly for a real answer bubble to land (NVIDIA call can take a while).
  const answerText = page.getByText(/task|công việc/i).last();
  await expect(answerText).toBeVisible({ timeout: 45000 });

  // Must not have been misrouted into a create-task proposal (no *new* EntryCard).
  await expect(page.getByRole("button", { name: "Xác nhận" })).toHaveCount(confirmButtonsBefore);

  // Must have gotten a real, non-generic answer — not the generic "not found" fallback.
  await expect(page.getByText(/không tìm thấy/i)).toHaveCount(0);
});
