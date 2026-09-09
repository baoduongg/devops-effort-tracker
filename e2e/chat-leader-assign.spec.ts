import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Regression for F-11 / ISSUE-15 (spec.md rev 2, AC-11-2): a real leader account
// issuing a natural-language task-assignment command via chat must not be denied
// with the "không đủ quyền" message that's meant for devops accounts.
test("leader assigning a task via chat is not denied for lacking permission", async ({ page }) => {
  await loginAs(page, "admin@test.com");

  await page.goto("/chat");

  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill(
    "Giao task viết lại tài liệu vận hành cho Dương Bảo thuộc dự án Phoenix CI/CD, effort 1 tiếng, bắt đầu hôm nay"
  );
  await composer.press("Enter");

  // Wait directly for the AI response outcome (proposal surfaced, or the
  // regression's permission-denied banner) — the NVIDIA call can take a while,
  // so don't gate on the "Thinking" indicator disappearing first.
  const proposalSurfaced = page
    .getByRole("button", { name: "Xác nhận" })
    .or(page.getByText(/Đề xuất: (SỬA|XÓA) task/));
  const deniedForPermission = page.getByText("Bạn không đủ quyền để thêm/sửa/xóa task qua chat");

  await expect(proposalSurfaced.first().or(deniedForPermission)).toBeVisible({ timeout: 45000 });

  await expect(deniedForPermission).toHaveCount(0);
  await expect(proposalSurfaced.first()).toBeVisible();
});
