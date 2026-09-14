"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell as AstryxAppShell } from "@astryxdesign/core/AppShell";
import { useAuthListener } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  useAuthListener();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const isPublicPage = pathname === "/login" || pathname === "/landing";
  // Chat is a full-bleed 3-pane layout (sidebar + messages + composer) with its own internal
  // spacing, so it opts out of the ambient page padding every other route uses.
  const contentPadding = pathname === "/chat" ? 0 : 6;

  useEffect(() => {
    if (!isPublicPage && !loading && !user) {
      router.replace("/login");
    }
  }, [isPublicPage, loading, user, router]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <AstryxAppShell contentPadding={contentPadding} sideNav={<Sidebar />}>
        {null}
      </AstryxAppShell>
    );
  }

  return (
    <AstryxAppShell contentPadding={contentPadding} sideNav={<Sidebar />}>
      {children}
    </AstryxAppShell>
  );
}
