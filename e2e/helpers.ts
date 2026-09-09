import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Logs in via the email/password form and waits for redirect off /login.
 * Requires the account to already exist in Firebase Auth (seeded manually,
 * per docs/product/qc-report.md — admin@test.com / dev@test.com, pass 123456).
 */
export async function loginAs(page: Page, email: string, password = "123456"): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}
