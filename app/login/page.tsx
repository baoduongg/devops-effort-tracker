"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, LogIn } from "lucide-react";
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
      <VStack
        gap={4}
        hAlign="center"
        vAlign="center"
        className="min-h-[100dvh] w-full relative overflow-hidden bg-body p-4"
      >
        <span
          aria-hidden
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "rgba(61,123,255,0.14)", filter: "blur(100px)" }}
        />
        <span
          aria-hidden
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "rgba(124,92,255,0.10)", filter: "blur(100px)" }}
        />

        <VStack gap={4} hAlign="center" className="w-full max-w-sm relative z-10 text-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-xl">
              <ShieldCheck size={28} strokeWidth={2.2} />
            </div>
            <div className="absolute -inset-1 rounded-xl border-2 border-accent/30 border-t-accent animate-spin" />
          </div>

          <VStack gap={1} hAlign="center">
            <Heading level={1}>DevOps Tracker</Heading>
            <HStack gap={2} vAlign="center" className="text-secondary text-sm mt-2">
              <Loader2 size={15} className="animate-spin text-accent shrink-0" />
              <span>{user ? "Đang chuyển đến Dashboard..." : "Đang kiểm tra phiên đăng nhập..."}</span>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack
      gap={0}
      hAlign="center"
      vAlign="center"
      className="min-h-[100dvh] w-full relative overflow-hidden bg-body p-4"
    >
      <span
        aria-hidden
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full pointer-events-none"
        style={{ background: "rgba(61,123,255,0.14)", filter: "blur(100px)" }}
      />
      <span
        aria-hidden
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "rgba(124,92,255,0.10)", filter: "blur(100px)" }}
      />

      <div className="w-full max-w-sm relative z-10">
        <Card elevation="high" padding={2}>
          <VStack gap={5} hAlign="center" className="py-2">
            <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-lg">
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>

            <VStack gap={1} hAlign="center" className="text-center">
              <Heading level={1}>DevOps Tracker</Heading>
              <Text type="supporting">
                Theo dõi phân bổ nguồn lực, tải công việc và lịch trình của team DevOps.
              </Text>
            </VStack>

            {isAuthenticating && (
              <HStack
                gap={2}
                vAlign="center"
                className="w-full justify-center p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-xs text-accent"
              >
                <Loader2 size={14} className="animate-spin shrink-0" />
                <span>
                  {authAction === "google"
                    ? "Đang kết nối Google và đồng bộ tài khoản..."
                    : authAction === "email"
                    ? "Đang xác thực thông tin đăng nhập..."
                    : "Đang xử lý đăng nhập..."}
                </span>
              </HStack>
            )}

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
            </VStack>

            <VStack gap={3} width="100%">
              <Button
                label={authAction === "email" ? "Đang đăng nhập..." : "Đăng nhập"}
                icon={
                  authAction === "email" ? (
                    <Loader2 size={15} className="animate-spin" />
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

            <VStack gap={2} width="100%">
              <Button
                label={authAction === "google" ? "Đang kết nối Google..." : "Đăng nhập với Google"}
                icon={authAction === "google" ? <Loader2 size={15} className="animate-spin" /> : undefined}
                onClick={handleGoogleSignIn}
                variant="secondary"
                width="100%"
                isDisabled={isAuthenticating}
              />
            </VStack>

            <HStack gap={1.5} vAlign="center" className="pt-1">
              <ShieldCheck size={13} className="text-success" />
              <Text type="supporting" size="sm" color="disabled">
                Bảo mật dữ liệu Firebase &amp; AI Grounding
              </Text>
            </HStack>
          </VStack>
        </Card>
      </div>
    </VStack>
  );
}

