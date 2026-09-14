import { Sparkles, User } from "lucide-react";
import { ChatMessage, ChatMessageBubble } from "@astryxdesign/core/Chat";
import { Markdown } from "@astryxdesign/core/Markdown";
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
      <ChatMessage
        sender="user"
        avatar={
          <div className="w-7 h-7 rounded-xl bg-white/10 text-neutral-200 border border-white/15 flex items-center justify-center shadow-sm">
            <User size={13} />
          </div>
        }
      >
        <ChatMessageBubble className="bg-sky-600/90 text-white border border-sky-500/30 rounded-2xl px-4 py-3 shadow-md shadow-sky-950/30 text-sm leading-relaxed">
          {message.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.imageUrl}
              alt="Pasted screenshot"
              style={{ maxHeight: 220, borderRadius: 10 }}
              className="mb-2 border border-white/20 shadow"
            />
          )}
          {message.text && <p className="font-normal text-white selection:bg-sky-700 whitespace-pre-wrap">{message.text}</p>}
        </ChatMessageBubble>
      </ChatMessage>
    );
  }

  return (
    <ChatMessage
      sender="assistant"
      avatar={
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-indigo-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-sm flex-shrink-0">
          <Sparkles size={13} />
        </div>
      }
    >
      {message.role === "ai-answer" ? (
        <ChatMessageBubble variant="ghost" className="w-full text-[15px] leading-relaxed">
          <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-white/[0.08] shadow-lg shadow-black/20 text-neutral-200 backdrop-blur-sm [&_.astryx-markdown]:text-[15px] [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-white/15 [&_table]:bg-white/[0.02] [&_thead]:bg-white/[0.08] [&_th]:text-neutral-100 [&_th]:font-semibold [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:border-b [&_th]:border-white/15 [&_th]:text-[14px] [&_th]:tracking-normal [&_td]:px-4 [&_td]:py-3.5 [&_td]:border-b [&_td]:border-white/[0.06] [&_td]:text-neutral-200 [&_td]:text-[14.5px] [&_td]:leading-relaxed [&_tr:last-child_td]:border-0 [&_tr:hover]:bg-white/[0.04] [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-sky-300 [&_h2]:mt-3.5 [&_h2]:mb-2 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-sky-200 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:space-y-2 [&_li]:text-neutral-200 [&_li]:text-[15px] [&_li]:leading-relaxed [&_p]:my-3 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:text-sky-300 [&_strong]:font-semibold [&_a]:text-sky-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium hover:[&_a]:text-sky-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-white/10 [&_code]:font-mono [&_code]:text-[13.5px] [&_code]:text-sky-300 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-black/60 [&_pre]:border [&_pre]:border-white/10 [&_pre]:overflow-x-auto [&_pre]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-sky-500/60 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-neutral-400 [&_blockquote]:text-[14.5px]">
            <Markdown autolink="gfm">{cleanAiText(message.text || "")}</Markdown>
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

