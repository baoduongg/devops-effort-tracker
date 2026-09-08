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
      <AstryxAppShell contentPadding={6} sideNav={<Sidebar />}>
        {null}
      </AstryxAppShell>
    );
  }

  return (
    <AstryxAppShell contentPadding={6} sideNav={<Sidebar />}>
      {children}
    </AstryxAppShell>
  );
}
