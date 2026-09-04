"use client";

import { useAuthListener } from "@/lib/auth";
import { NavBar } from "@/components/layout/nav-bar";

export function AppShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  useAuthListener();
  return (
    <>
      <NavBar />
      <main className="p-6">{children}</main>
    </>
  );
}
