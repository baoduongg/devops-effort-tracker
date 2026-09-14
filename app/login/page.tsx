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
import { Link } from "@astryxdesign/core/Link";
import { signInWithGoogle, signInWithEmailPassword } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

type AuthAction = "email" | "google" | null;

function GoogleIcon({ size = 16 }: { size?: number }): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.6-2-6.5-4.8H1.7v3A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.5 14.6a7.2 7.2 0 0 1 0-4.6v-3H1.7a12 12 0 0 0 0 10.6z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.7 6l3.8 3a7.1 7.1 0 0 1 6.5-4.2z" />
    </svg>
  );
}

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
          className="login-blob absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "rgba(61,123,255,0.14)", filter: "blur(100px)" }}
        />
        <span
          aria-hidden
          className="login-blob-reverse absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "rgba(124,92,255,0.10)", filter: "blur(100px)" }}
        />

        <VStack gap={4} hAlign="center" className="w-full max-w-sm relative z-10 text-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white shadow-xl">
              <ShieldCheck size={28} strokeWidth={2.2} />
            </div>
            <div className="absolute -inset-1 rounded-xl border-2 border-accent/30 border-t-accent animate-spin" />
          </div>

          <VStack gap={1} hAlign="center">
            <Heading level={1}>DevOps Effort Hub</Heading>
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
        className="login-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(61,123,255,0.30), rgba(61,123,255,0) 62%)",
          filter: "blur(30px)",
        }}
      />
      <span
        aria-hidden
        className="login-blob-reverse absolute top-1/2 left-1/2 -translate-x-[calc(50%+260px)] translate-y-[calc(-50%+220px)] w-[620px] h-[620px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,92,255,0.22), rgba(124,92,255,0) 65%)",
          filter: "blur(30px)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <Card elevation="high" padding={8}>
          <VStack gap={5}>
            <HStack gap={2} vAlign="center">
              <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white shadow-lg shrink-0">
                <ShieldCheck size={16} strokeWidth={2.2} />
              </div>
              <Text weight="semibold">DevOps Effort Hub</Text>
            </HStack>

            <VStack gap={1}>
              <Heading level={1}>Đăng nhập</Heading>
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
              <VStack gap={1} width="100%">
                <Text type="supporting" size="xsm" color="secondary" className="uppercase tracking-wide">
                  Email
                </Text>
                <TextInput
                  type="email"
                  label="Email"
                  isLabelHidden
                  value={email}
                  onChange={setEmail}
                  placeholder="ban@congty.com"
                  isDisabled={isAuthenticating}
                  width="100%"
                />
              </VStack>
              <VStack gap={1} width="100%">
                <Text type="supporting" size="xsm" color="secondary" className="uppercase tracking-wide">
                  Mật khẩu
                </Text>
                <TextInput
                  type="password"
                  label="Mật khẩu"
                  isLabelHidden
                  value={password}
                  onChange={setPassword}
                  placeholder="Nhập mật khẩu"
                  isDisabled={isAuthenticating}
                  onEnter={handleEmailPasswordSignIn}
                  status={loginError ? { type: "error", message: loginError } : undefined}
                  width="100%"
                />
              </VStack>
            </VStack>

            <HStack width="100%" hAlign="end">
              <Link href="#" isStandalone>
                Quên mật khẩu?
              </Link>
            </HStack>

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
                icon={authAction === "google" ? <Loader2 size={15} className="animate-spin" /> : <GoogleIcon />}
                onClick={handleGoogleSignIn}
                variant="secondary"
                width="100%"
                isDisabled={isAuthenticating}
              />
            </VStack>

            <HStack gap={2} vAlign="center" hAlign="center" width="100%" className="-mt-2">
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

