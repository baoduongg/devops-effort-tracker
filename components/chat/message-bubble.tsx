import { Sparkles, User, Zap } from "lucide-react";
import { ChatMessage, ChatMessageBubble } from "@astryxdesign/core/Chat";
import { Token } from "@astryxdesign/core/Token";
import { Markdown } from "@astryxdesign/core/Markdown";
import { EntryCard } from "@/components/chat/entry-card";
import { ProposalCard } from "@/components/chat/proposal-card";
import { ClarificationCard } from "@/components/chat/clarification-card";
import { MemberAvailabilityCard } from "@/components/chat/member-availability-card";
import {
  OverloadCard,
  EffortCard,
  LoadCard,
  ReportCard,
  OverdueCard,
  MembersListCard,
  ProjectsListCard,
  HelpCard,
  MemberInfoCard,
} from "@/components/chat/cards";
import { TaskListCard } from "@/components/chat/task-list-card";
import type { ChatMessage as ChatMessageType, FormattedEntry, TaskChangeProposal } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessageType;
  onConfirmEntry: (chatLogId: string, entry: FormattedEntry) => Promise<void>;
  onConfirmProposal: (chatLogId: string, proposal: TaskChangeProposal, appliedChanges: TaskChangeProposal["changes"]) => Promise<void>;
  onCancelProposal: (chatLogId: string, proposal: TaskChangeProposal) => Promise<void>;
  onSelectClarificationCandidate: (label: string) => void;
  onRunSlashCommand?: (slashCommand: string) => void;
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
  onRunSlashCommand,
}: MessageBubbleProps): React.JSX.Element {
  if (message.role === "user") {
    return (
      <ChatMessage
        sender="user"
        avatar={
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white border border-white/15 flex items-center justify-center shadow-md shrink-0">
            <User size={14} />
          </div>
        }
      >
        <div className="space-y-1.5 text-right flex flex-col items-end max-w-full">
          <div className="text-xs text-neutral-400 flex items-center justify-end gap-1.5 font-medium px-1">
            <span className="text-neutral-300 font-semibold">{message.senderName || "Tech Lead"}</span>
            <span>&bull;</span>
            <span className="font-mono text-[11px]">{message.time || "Vừa xong"}</span>
          </div>
          <ChatMessageBubble className="bg-gradient-to-r from-sky-600/90 to-blue-600/90 text-white border border-sky-500/30 rounded-2xl rounded-tr-sm p-3.5 sm:p-4 shadow-lg shadow-sky-600/15 text-xs sm:text-sm leading-relaxed text-left inline-block">
            {message.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.imageUrl}
                alt="Pasted screenshot"
                style={{ maxHeight: 220, borderRadius: 10 }}
                className="mb-2 border border-white/20 shadow"
              />
            )}
            {message.command && (
              <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-mono text-sky-200 bg-black/20 px-2 py-0.5 rounded w-fit">
                <Zap size={11} />
                <span>Lệnh: {message.command}</span>
              </div>
            )}
            {message.text && (
              <p className="font-normal text-white selection:bg-sky-700 whitespace-pre-wrap">
                {message.text}
              </p>
            )}
          </ChatMessageBubble>
        </div>
      </ChatMessage>
    );
  }

  return (
    <ChatMessage
      sender="assistant"
      avatar={
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-sky-500 text-white border border-purple-500/30 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles size={15} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-neutral-950 animate-pulse" />
        </div>
      }
    >
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-bold text-white">DevOps Effort Hub AI</span>
          <Token color="purple" size="sm" label="PRO" />
          <span className="text-neutral-500 text-xs">&bull;</span>
          <span className="text-[11px] font-mono text-neutral-400">
            {"latency" in message && message.latency ? message.latency : "320ms"}
          </span>
        </div>

        {message.role === "ai-answer" ? (
          <ChatMessageBubble variant="ghost" className="w-full text-[14.5px] leading-relaxed p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm [&_.astryx-markdown]:text-[14.5px] [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-white/15 [&_table]:bg-white/[0.02] [&_thead]:bg-white/[0.08] [&_th]:text-neutral-100 [&_th]:font-semibold [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:border-b [&_th]:border-white/15 [&_th]:text-[13.5px] [&_td]:px-4 [&_td]:py-3 [&_td]:border-b [&_td]:border-white/[0.06] [&_td]:text-neutral-200 [&_td]:text-[14px] [&_td]:leading-relaxed [&_tr:last-child_td]:border-0 [&_tr:hover]:bg-white/[0.04] [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-sky-300 [&_h2]:mt-3.5 [&_h2]:mb-2 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-sky-200 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2.5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2.5 [&_ol]:space-y-1.5 [&_li]:text-neutral-200 [&_li]:text-[14px] [&_li]:leading-relaxed [&_p]:my-2.5 [&_p]:text-[14px] [&_p]:leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:text-sky-300 [&_strong]:font-semibold [&_a]:text-sky-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium hover:[&_a]:text-sky-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-white/10 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-sky-300 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-black/60 [&_pre]:border [&_pre]:border-white/10 [&_pre]:overflow-x-auto [&_pre]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-sky-500/60 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-neutral-400 [&_blockquote]:text-[14px]">
              <Markdown autolink="gfm">{cleanAiText(message.text || "")}</Markdown>
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-task-list" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <TaskListCard taskList={message.taskList} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-member-availability" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <MemberAvailabilityCard availability={message.availability} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-overload" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <OverloadCard overloadData={message.overloadData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-effort" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <EffortCard effortData={message.effortData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-load" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <LoadCard loadData={message.loadData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-report" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <ReportCard reportData={message.reportData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-overdue" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <OverdueCard overdueData={message.overdueData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-members-list" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <MembersListCard membersListData={message.membersListData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-projects-list" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <ProjectsListCard projectsListData={message.projectsListData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-help" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <HelpCard helpData={message.helpData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-member-info" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#0b0f19] sm:bg-[#0e131f]/90 border border-white/[0.08] shadow-2xl shadow-black/20 text-neutral-200 backdrop-blur-sm">
              <MemberInfoCard memberInfoData={message.memberInfoData} onRunSlashCommand={onRunSlashCommand} />
            </div>
          </ChatMessageBubble>
        ) : message.role === "ai-entry" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <EntryCard
              entry={message.entry}
              confirmed={message.confirmed}
              onConfirm={(entry) => onConfirmEntry(message.chatLogId, entry)}
            />
          </ChatMessageBubble>
        ) : message.role === "ai-proposal" ? (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <ProposalCard
              proposal={message.proposal}
              confirmed={message.confirmed}
              onConfirm={(proposal, appliedChanges) => onConfirmProposal(message.chatLogId, proposal, appliedChanges)}
              onCancel={(proposal) => onCancelProposal(message.chatLogId, proposal)}
            />
          </ChatMessageBubble>
        ) : (
          <ChatMessageBubble variant="ghost" width="100%" className="p-0">
            <ClarificationCard
              text={cleanAiText(message.text || "")}
              clarification={message.clarification}
              onSelectCandidate={onSelectClarificationCandidate}
            />
          </ChatMessageBubble>
        )}
      </div>
    </ChatMessage>
  );
}

