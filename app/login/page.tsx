"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck } from "lucide-react";
import { VStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Divider } from "@astryxdesign/core/Divider";
import { signInWithGoogle, signInAnon, signInWithEmailPassword } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

function firebaseLoginErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-email":
      return "Email không hợp lệ.";
    case "auth/user-disabled":
      return "Tài khoản đã bị vô hiệu hóa.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email hoặc mật khẩu không đúng.";
    default:
      return "Đăng nhập thất bại. Vui lòng thử lại.";
  }
}

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [authenticating, setAuthenticating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

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

  async function handleEmailPasswordSignIn(): Promise<void> {
    if (!email || !password) {
      setLoginError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoginError(null);
    setAuthenticating(true);
    try {
      await signInWithEmailPassword(email, password);
    } catch (error) {
      setLoginError(firebaseLoginErrorMessage(error));
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

            {/* Email/password login */}
            <VStack gap={3} width="100%">
              <TextInput
                type="email"
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="ban@congty.com"
                isDisabled={authenticating}
                width="100%"
              />
              <TextInput
                type="password"
                label="Mật khẩu"
                value={password}
                onChange={setPassword}
                placeholder="Nhập mật khẩu"
                isDisabled={authenticating}
                onEnter={handleEmailPasswordSignIn}
                status={loginError ? { type: "error", message: loginError } : undefined}
                width="100%"
              />
              <Button
                label={authenticating ? "Đang xử lý..." : "Đăng nhập"}
                onClick={handleEmailPasswordSignIn}
                variant="primary"
                width="100%"
                isDisabled={authenticating}
              />
            </VStack>

            <Divider label="hoặc" isFullBleed />

            {/* Actions */}
            <VStack gap={2} width="100%">
              <Button
                label={authenticating ? "Đang xử lý..." : "Đăng nhập với Google"}
                onClick={handleGoogleSignIn}
                variant="secondary"
                width="100%"
                isDisabled={authenticating}
              />
              {/* <Button
                label="Tiếp tục với vai trò Khách (Guest / Demo)"
                onClick={handleAnonSignIn}
                variant="ghost"
                width="100%"
                isDisabled={authenticating}
              /> */}
            </VStack>

            {/* <a
              href="/landing"
              className="text-xs text-sky-400/90 hover:text-sky-300 transition-colors flex items-center justify-center gap-1 pt-1 font-medium"
            >
              <span>Khám phá tính năng nổi bật (Landing Page)</span>
              <span>→</span>
            </a> */}

            {/* Security note */}
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Bảo mật dữ liệu Firebase & AI Grounding</span>
            </div>
          </VStack>
        </Card>
      </div>
    </div>
  );
}
