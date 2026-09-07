import { Sparkles } from "lucide-react";
import { ChatMessage, ChatMessageBubble } from "@astryxdesign/core/Chat";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Text } from "@astryxdesign/core/Text";
import { EntryCard } from "@/components/chat/entry-card";
import type { ChatMessage as ChatMessageType, FormattedEntry } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessageType;
  onConfirmEntry: (chatLogId: string, entry: FormattedEntry) => Promise<void>;
}

function cleanAiText(text: string): string {
  if (!text) return "";
  return text
    .replace(/'''(?:python|text)\?[^\n]*[\s\S]*?'''/g, "")
    .replace(/```(?:python|text)\?[^\n]*[\s\S]*?```/g, "")
    .trim();
}

export function MessageBubble({ message, onConfirmEntry }: MessageBubbleProps): React.JSX.Element {
  if (message.role === "user") {
    return (
      <ChatMessage sender="user">
        <ChatMessageBubble>
          {message.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={message.imageUrl} alt="Pasted screenshot" style={{ maxHeight: 192, borderRadius: 8 }} />
          )}
          {message.text && <Text color="inherit">{message.text}</Text>}
        </ChatMessageBubble>
      </ChatMessage>
    );
  }

  return (
    <ChatMessage sender="assistant" avatar={<NavIcon icon={<Sparkles size={14} strokeWidth={2} />} />}>
      {message.role === "ai-answer" ? (
        <ChatMessageBubble variant="ghost">
          <Markdown density="compact" autolink="gfm">{cleanAiText(message.text || "")}</Markdown>
        </ChatMessageBubble>
      ) : (
        <ChatMessageBubble variant="ghost" width="100%">
          <EntryCard
            entry={message.entry}
            confirmed={message.confirmed}
            onConfirm={(entry) => onConfirmEntry(message.chatLogId, entry)}
          />
        </ChatMessageBubble>
      )}
    </ChatMessage>
  );
}
