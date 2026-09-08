import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capture() {
  console.log("Starting browser for real UI capture...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });

  const page = await context.newPage();
  const outputDir = path.join(process.cwd(), "public", "images", "real");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Navigating to login page...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // 1. Capture Real Login UI
  await page.screenshot({ path: path.join(outputDir, "real_login.png") });
  console.log("Captured real_login.png");

  // Click Guest Sign-In button
  console.log("Clicking Guest sign in button...");
  const guestBtn = page.locator('button:has-text("Khách"), button:has-text("Guest")');
  if (await guestBtn.count() > 0) {
    await guestBtn.first().click();
    console.log("Clicked Guest sign in button, waiting for redirect to dashboard...");
  } else {
    console.log("Guest button not found, navigating directly...");
  }

  await page.waitForTimeout(4000);

  // 2. Navigate to Dashboard
  console.log("Navigating to dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Take Dashboard Master Screenshot (Roster & Capacity)
  await page.screenshot({ path: path.join(outputDir, "real_dashboard_roster.png") });
  console.log("Captured real_dashboard_roster.png");

  // 3. Switch to Timeline Gantt Tab
  console.log("Switching to Gantt Timeline tab...");
  const timelineTab = page.locator('button:has-text("Lịch trình Gantt"), [role="tab"]:has-text("Lịch trình Gantt")');
  if (await timelineTab.count() > 0) {
    await timelineTab.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outputDir, "real_timeline_gantt.png") });
    console.log("Captured real_timeline_gantt.png");
  }

  // 4. Switch to Projects Tab
  console.log("Switching to Project Allocation tab...");
  const projectsTab = page.locator('button:has-text("Theo Dự án"), [role="tab"]:has-text("Theo Dự án")');
  if (await projectsTab.count() > 0) {
    await projectsTab.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outputDir, "real_project_allocation.png") });
    console.log("Captured real_project_allocation.png");
  }

  // 5. Floating AI Chat & Slash Commands (dashboard widget)
  console.log("Navigating to /dashboard for floating AI Chat...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const openChatBtn = page.locator('button:has-text("AI Chat")');
  if (await openChatBtn.count() > 0) {
    await openChatBtn.first().click();
    await page.waitForTimeout(1000);

    const chatInput = page.locator('textarea, input[type="text"]').first();
    if (await chatInput.count() > 0) {
      await chatInput.click();
      await chatInput.fill("/");
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outputDir, "real_chat_slash_commands.png") });
      console.log("Captured real_chat_slash_commands.png with popup");
    } else {
      console.log("Chat input not found inside floating chat.");
    }
  } else {
    console.log("AI Chat floating button not found.");
  }

  // 6. Members Management Page
  console.log("Navigating to /members...");
  await page.goto("http://localhost:3000/members", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outputDir, "real_members_list.png") });
  console.log("Captured real_members_list.png");

  // 7. Notifications Hub
  console.log("Navigating to /notifications...");
  await page.goto("http://localhost:3000/notifications", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outputDir, "real_notifications.png") });
  console.log("Captured real_notifications.png");

  await browser.close();
  console.log("Successfully captured all real UI screenshots!");
}

capture().catch((err) => {
  console.error("Capture error:", err);
  process.exit(1);
});
