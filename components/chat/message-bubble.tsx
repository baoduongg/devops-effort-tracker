import { Sparkles } from "lucide-react";
import { ChatMessage, ChatMessageBubble } from "@astryxdesign/core/Chat";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Text } from "@astryxdesign/core/Text";
import { EntryCard } from "@/components/chat/entry-card";
import { ProposalCard } from "@/components/chat/proposal-card";
import { ClarificationCard } from "@/components/chat/clarification-card";
import type { ChatMessage as ChatMessageType, FormattedEntry, TaskChangeProposal } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessageType;
  onConfirmEntry: (chatLogId: string, entry: FormattedEntry) => Promise<void>;
  onConfirmProposal: (chatLogId: string, proposal: TaskChangeProposal, appliedChanges: TaskChangeProposal["changes"]) => Promise<void>;
  onCancelProposal: (chatLogId: string, proposal: TaskChangeProposal) => Promise<void>;
  onSelectClarificationCandidate: (label: string) => void;
}

function cleanAiText(text: string): string {
  if (!text) return "";
  return text
    .replace(/'''(?:python|text)\?[^\n]*[\s\S]*?'''/g, "")
    .replace(/```(?:python|text)\?[^\n]*[\s\S]*?```/g, "")
    .replace(/```json[\s\S]*?```/g, "")
    .trim();
}

export function MessageBubble({
  message,
  onConfirmEntry,
  onConfirmProposal,
  onCancelProposal,
  onSelectClarificationCandidate,
}: MessageBubbleProps): React.JSX.Element {
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
        <ChatMessageBubble variant="ghost" className="w-full text-sm leading-relaxed">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-200">
            <Markdown density="compact" autolink="gfm">{cleanAiText(message.text || "")}</Markdown>
          </div>
        </ChatMessageBubble>
      ) : message.role === "ai-entry" ? (
        <ChatMessageBubble variant="ghost" width="100%">
          <EntryCard
            entry={message.entry}
            confirmed={message.confirmed}
            onConfirm={(entry) => onConfirmEntry(message.chatLogId, entry)}
          />
        </ChatMessageBubble>
      ) : message.role === "ai-proposal" ? (
        <ChatMessageBubble variant="ghost" width="100%">
          <ProposalCard
            proposal={message.proposal}
            confirmed={message.confirmed}
            onConfirm={(proposal, appliedChanges) => onConfirmProposal(message.chatLogId, proposal, appliedChanges)}
            onCancel={(proposal) => onCancelProposal(message.chatLogId, proposal)}
          />
        </ChatMessageBubble>
      ) : (
        <ChatMessageBubble variant="ghost" width="100%">
          <ClarificationCard
            text={cleanAiText(message.text || "")}
            clarification={message.clarification}
            onSelectCandidate={onSelectClarificationCandidate}
          />
        </ChatMessageBubble>
      )}
    </ChatMessage>
  );
}
