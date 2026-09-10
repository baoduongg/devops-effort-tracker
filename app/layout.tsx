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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Theme theme={devopsTrackerTheme} mode="dark">
          <LinkProvider component={Link}>
            <AppShell>{children}</AppShell>
          </LinkProvider>
        </Theme>
      </body>
    </html>
  );
}
