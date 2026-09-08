"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck } from "lucide-react";
import { VStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { signInWithGoogle, signInAnon } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  async function handleGoogleSignIn(): Promise<void> {
    setAuthenticating(true);
    try {
      await signInWithGoogle();
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleAnonSignIn(): Promise<void> {
    setAuthenticating(true);
    try {
      await signInAnon();
    } finally {
      setAuthenticating(false);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#090d14]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <Card elevation="high">
          <VStack gap={5} hAlign="center" className="py-2">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
              <Activity size={24} strokeWidth={2.2} />
            </div>

            {/* Title & Tagline */}
            <VStack gap={1} hAlign="center" className="text-center">
              <Heading level={1}>DevOps Tracker</Heading>
              <Text type="supporting">
                Theo dõi phân bổ nguồn lực, tải công việc và lịch trình của team DevOps.
              </Text>
            </VStack>

            {/* Actions */}
            <VStack gap={2} width="100%">
              <Button
                label={authenticating ? "Đang xử lý..." : "Đăng nhập với Google"}
                onClick={handleGoogleSignIn}
                variant="primary"
                width="100%"
                isDisabled={authenticating}
              />
              <Button
                label="Tiếp tục với vai trò Khách (Guest)"
                onClick={handleAnonSignIn}
                variant="ghost"
                width="100%"
                isDisabled={authenticating}
              />
            </VStack>

            {/* Security note & Back to Landing */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Bảo mật dữ liệu Firebase & AI Grounding</span>
              </div>
              <a
                href="/landing"
                className="text-xs text-sky-400 hover:text-sky-300 hover:underline transition-colors mt-1"
              >
                ← Xem trang giới thiệu tính năng
              </a>
            </div>
          </VStack>
        </Card>
      </div>
    </div>
  );
}
