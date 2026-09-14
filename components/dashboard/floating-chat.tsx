"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ExternalLink } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { Divider } from "@astryxdesign/core/Divider";
import { ChatBox } from "@/components/chat/chat-box";

export function FloatingChat(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[100]">
        <Button
          variant="primary"
          size="lg"
          elevation="high"
          onClick={() => setIsOpen(true)}
          icon={<Icon icon={Sparkles} size="sm" />}
          label="AI Chat"
        />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-48px)] flex flex-col">
      <Card elevation="high" width="100%" height="100%">
        <VStack gap={3} height="100%">
          {/* Header */}
          <HStack vAlign="center" gap={2} wrap="nowrap">
            <Icon icon={Sparkles} color="accent" size="sm" />
            <VStack gap={0}>
              <Text weight="semibold">AI Assistant</Text>
              <Text type="supporting" color="secondary">
                Quick Task &amp; Capacity Logging
              </Text>
            </VStack>
            <StackItem size="fill" />
            <Link href="/chat" title="Open Full Chat View">
              <IconButton
                label="Open full chat"
                variant="ghost"
                size="sm"
                icon={<Icon icon={ExternalLink} size="sm" />}
              />
            </Link>
            <IconButton
              label="Close chat"
              variant="ghost"
              size="sm"
              icon={<Icon icon={X} size="sm" />}
              onClick={() => setIsOpen(false)}
            />
          </HStack>

          <Divider isFullBleed />

          <StackItem size="fill">
            <ChatBox compact />
          </StackItem>
        </VStack>
      </Card>
    </div>
  );
}
