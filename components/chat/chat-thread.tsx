"use client";

import { useEffect, useRef } from "react";
import { NotebookPen, Search, Sparkles } from "lucide-react";
import { ChatMessageList, ChatMessage, ChatMessageBubble } from "@astryxdesign/core/Chat";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Spinner } from "@astryxdesign/core/Spinner";
import { VStack } from "@astryxdesign/core/Stack";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessage as ChatMessageType, ChatMode, FormattedEntry } from "@/types/chat";

interface ChatThreadProps {
  mode: ChatMode;
  messages: ChatMessageType[];
  loading: boolean;
  thinking: boolean;
  onConfirmEntry: (chatLogId: string, entry: FormattedEntry) => Promise<void>;
}

const EMPTY_STATE = {
  devops: { icon: NotebookPen, text: "Paste a task update or a screenshot to log your work." },
  leader: { icon: Search, text: "Ask about team workload, capacity, or project status." },
};

export function ChatThread({ mode, messages, loading, thinking, onConfirmEntry }: ChatThreadProps): React.JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      };

      // Immediate scroll followed by short delay for element measurement
      scrollToBottom();
      const t1 = setTimeout(scrollToBottom, 60);
      const t2 = setTimeout(scrollToBottom, 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [messages.length, thinking, loading, mode]);

  if (loading) {
    return (
      <VStack gap={4}>
        <Skeleton height={56} width="66%" />
        <Skeleton height={56} width="75%" />
      </VStack>
    );
  }

  return (
    <ChatMessageList
      isStreaming={thinking}
      emptyState={
        <EmptyState icon={<Icon icon={EMPTY_STATE[mode].icon} size="lg" />} title={EMPTY_STATE[mode].text} isCompact />
      }
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onConfirmEntry={onConfirmEntry} />
      ))}
      {thinking && (
        <ChatMessage sender="assistant" avatar={<NavIcon icon={<Sparkles size={14} strokeWidth={2} />} />}>
          <ChatMessageBubble>
            <Spinner size="sm" label="Thinking" />
          </ChatMessageBubble>
        </ChatMessage>
      )}
      <div ref={bottomRef} />
    </ChatMessageList>
  );
}
