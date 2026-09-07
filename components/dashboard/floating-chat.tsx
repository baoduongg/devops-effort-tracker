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
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 100,
        }}
      >
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
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        width: 420,
        maxWidth: "calc(100vw - 32px)",
        height: 620,
        maxHeight: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card elevation="high" width="100%" height="100%">
        <VStack gap={3} height="100%">
          {/* Header */}
          <HStack vAlign="center" gap={2} wrap="nowrap">
            <Icon icon={Sparkles} color="accent" size="sm" />
            <VStack gap={0}>
              <Text weight="semibold">AI Assistant</Text>
              <Text type="supporting" color="secondary">
                Quick Task & Capacity Logging
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

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "0 -8px" }} />

          {/* Chat content */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <ChatBox />
          </div>
        </VStack>
      </Card>
    </div>
  );
}
