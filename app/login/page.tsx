"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => signInWithGoogle()}>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
