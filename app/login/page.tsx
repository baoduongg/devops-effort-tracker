"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { signInWithGoogle, signInAnon } from "@/services/auth.service";
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
    <HStack height="100dvh" hAlign="center" vAlign="center" padding={6}>
      <Card maxWidth={360} width="100%" elevation="high">
        <VStack gap={4} hAlign="center">
          <NavIcon icon={<Activity size={20} strokeWidth={2} />} />
          <VStack gap={1} hAlign="center">
            <Heading level={1}>DevOps Effort Tracker</Heading>
            <Text type="supporting">Sign in to see what your team is working on.</Text>
          </VStack>
          <Button label="Sign in with Google" onClick={() => signInWithGoogle()} variant="primary" width="100%" />
          <Button label="Continue as guest" onClick={() => signInAnon()} variant="ghost" width="100%" />
        </VStack>
      </Card>
    </HStack>
  );
}
