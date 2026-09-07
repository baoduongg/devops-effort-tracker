import type { Metadata } from "next";
import Link from "next/link";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import "./globals.css";
import "./theme.css";
import { devopsTrackerTheme } from "./devops-tracker";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "DevOps Effort Tracker",
  description: "Track DevOps team effort, tasks, and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Theme theme={devopsTrackerTheme}>
          <LinkProvider component={Link}>
            <AppShell>{children}</AppShell>
          </LinkProvider>
        </Theme>
      </body>
    </html>
  );
}
