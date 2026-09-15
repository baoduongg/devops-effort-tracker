"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ExternalLink } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { IconButton } from "@astryxdesign/core/IconButton";
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
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group inline-flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] hover:brightness-105 active:scale-[0.96] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
        >
          <Sparkles size={16} className="text-white animate-pulse" />
          <span>AI Copilot</span>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </span>
        </button>
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
