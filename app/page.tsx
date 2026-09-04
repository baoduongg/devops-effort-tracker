"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function Home(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return <div className="p-6 text-muted-foreground">Loading…</div>;
}
