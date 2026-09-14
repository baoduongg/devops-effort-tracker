import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Backend layer: every AI interaction (confirm/discard/neither) is persisted via createChatLog,
// so reloading the page and re-opening the same thread must still show the exchange.
test("chat interaction persists across reload even without confirming", async ({ page }) => {
  await loginAs(page, "dev@test.com");
  await page.goto("/chat");

  await page.getByRole("radio", { name: "Ask" }).click();

  const uniqueMarker = `ping-${Date.now()}`;
  const composer = page.getByLabel("Nhập tin nhắn");
  await composer.fill(`task của tôi hôm nay là gì? (${uniqueMarker})`);
  await composer.press("Enter");

  // Wait for the AI response to actually land (not just the optimistic user bubble): the
  // thinking indicator mounts while the request is in flight and unmounts only once the
  // answer/persistence round-trip completes client-side, so waiting for it to clear (rather
  // than grabbing the last "article" right after send, which can still be the user's own
  // optimistically-rendered message) avoids racing the reload against the server-side write.
  await expect(page.getByText("AI đang xử lý thông tin…")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("AI đang xử lý thông tin…")).toHaveCount(0, { timeout: 45000 });

  await page.reload();
  await page.getByRole("radio", { name: "Ask" }).click();

  // The user's own message (containing the unique marker) must still be present after reload,
  // proving the interaction was logged/persisted rather than only held in client state.
  await expect(page.getByText(uniqueMarker)).toBeVisible({ timeout: 15000 });
});
