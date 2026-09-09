"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Loader2, LogIn } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Divider } from "@astryxdesign/core/Divider";
import { signInWithGoogle, signInWithEmailPassword } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

type AuthAction = "email" | "google" | null;

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
    case "auth/too-many-requests":
      return "Quá nhiều yêu cầu không thành công. Vui lòng thử lại sau ít phút.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    default:
      return "Đăng nhập thất bại. Vui lòng thử lại.";
  }
}

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [authAction, setAuthAction] = useState<AuthAction>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthenticating = authAction !== null;

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  async function handleGoogleSignIn(): Promise<void> {
    if (isAuthenticating) return;
    setLoginError(null);
    setAuthAction("google");
    try {
      await signInWithGoogle();
      // Keep authAction === "google" so loading spinner stays visible until redirected
    } catch (error) {
      const msg = firebaseLoginErrorMessage(error);
      if (msg) setLoginError(msg);
      setAuthAction(null);
    }
  }

  async function handleEmailPasswordSignIn(): Promise<void> {
    if (isAuthenticating) return;
    if (!email || !password) {
      setLoginError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoginError(null);
    setAuthAction("email");
    try {
      await signInWithEmailPassword(email, password);
      // Keep authAction === "email" until redirect
    } catch (error) {
      setLoginError(firebaseLoginErrorMessage(error));
      setAuthAction(null);
    }
  }

  // Show full-page transition screen when checking session or already authenticated & redirecting
  if (loading || user) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#090d14]">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/15">
              <Activity size={28} strokeWidth={2.2} />
            </div>
            <div className="absolute -inset-1 rounded-2xl border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
          </div>

          <VStack gap={1} hAlign="center">
            <Heading level={1}>DevOps Tracker</Heading>
            <HStack gap={2} vAlign="center" className="text-neutral-400 text-sm mt-2">
              <Loader2 size={15} className="animate-spin text-sky-400 shrink-0" />
              <span>{user ? "Đang chuyển đến Dashboard..." : "Đang kiểm tra phiên đăng nhập..."}</span>
            </HStack>
          </VStack>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#090d14]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Top subtle indeterminate progress bar when authenticating */}
          {isAuthenticating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 animate-pulse z-20" />
          )}

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

              {/* Live Status indicator when authenticating */}
              {isAuthenticating && (
                <div className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
                  <Loader2 size={14} className="animate-spin shrink-0 text-sky-400" />
                  <span>
                    {authAction === "google"
                      ? "Đang kết nối Google và đồng bộ tài khoản..."
                      : authAction === "email"
                      ? "Đang xác thực thông tin đăng nhập..."
                      : "Đang xử lý đăng nhập..."}
                  </span>
                </div>
              )}

              {/* Email/password login */}
              <VStack gap={3} width="100%">
                <TextInput
                  type="email"
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="ban@congty.com"
                  isDisabled={isAuthenticating}
                  width="100%"
                />
                <TextInput
                  type="password"
                  label="Mật khẩu"
                  value={password}
                  onChange={setPassword}
                  placeholder="Nhập mật khẩu"
                  isDisabled={isAuthenticating}
                  onEnter={handleEmailPasswordSignIn}
                  status={loginError ? { type: "error", message: loginError } : undefined}
                  width="100%"
                />
                <Button
                  label={authAction === "email" ? "Đang đăng nhập..." : "Đăng nhập"}
                  icon={
                    authAction === "email" ? (
                      <Loader2 size={15} className="animate-spin text-white" />
                    ) : (
                      <LogIn size={15} />
                    )
                  }
                  onClick={handleEmailPasswordSignIn}
                  variant="primary"
                  width="100%"
                  isDisabled={isAuthenticating}
                />
              </VStack>

              <Divider label="hoặc" isFullBleed />

              {/* Actions */}
              <VStack gap={2} width="100%">
                <Button
                  label={authAction === "google" ? "Đang kết nối Google..." : "Đăng nhập với Google"}
                  icon={
                    authAction === "google" ? (
                      <Loader2 size={15} className="animate-spin text-sky-400" />
                    ) : undefined
                  }
                  onClick={handleGoogleSignIn}
                  variant="secondary"
                  width="100%"
                  isDisabled={isAuthenticating}
                />
              </VStack>

              {/* Security note */}
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Bảo mật dữ liệu Firebase & AI Grounding</span>
              </div>
            </VStack>
          </Card>
        </div>
      </div>
    </div>
  );
}

