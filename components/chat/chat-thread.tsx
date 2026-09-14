"use client";

import {
  NotebookPen,
  Sparkles,
  Users,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";
import { ChatMessageList, ChatMessage, ChatMessageBubble } from "@astryxdesign/core/Chat";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Spinner } from "@astryxdesign/core/Spinner";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessage as ChatMessageType, ChatMode, FormattedEntry, TaskChangeProposal } from "@/types/chat";

interface ChatThreadProps {
  mode: ChatMode;
  messages: ChatMessageType[];
  loading: boolean;
  thinking: boolean;
  onConfirmEntry: (chatLogId: string, entry: FormattedEntry) => Promise<void>;
  onConfirmProposal: (
    chatLogId: string,
    proposal: TaskChangeProposal,
    appliedChanges: TaskChangeProposal["changes"]
  ) => Promise<void>;
  onCancelProposal: (chatLogId: string, proposal: TaskChangeProposal) => Promise<void>;
  onSelectClarificationCandidate: (label: string) => void;
  onSelectPromptSuggestion?: (prompt: string) => void;
}

const LEADER_STARTERS = [
  {
    icon: Users,
    title: "Tra cứu nhân sự rảnh",
    desc: "Tìm thành viên có effort trống để phân công công việc mới",
    prompt: "Ai trong team đang rảnh việc có thể nhận thêm task?",
    tag: "Nguồn lực",
  },
  {
    icon: Flame,
    title: "Rà soát task trễ hạn",
    desc: "Tổng hợp các đầu việc quá hạn hoặc đang có rủi ro chậm tiến độ",
    prompt: "Tổng hợp các task đang bị trễ hạn cần xử lý gấp?",
    tag: "Cảnh báo",
  },
  {
    icon: Layers,
    title: "Phân bổ Effort dự án",
    desc: "Xem bức tranh tổng quan phân bổ tải theo từng dự án của team",
    prompt: "Tình hình phân bổ Effort của team theo từng dự án như thế nào?",
    tag: "Báo cáo",
  },
];

const DEVOPS_STARTERS = [
  {
    icon: NotebookPen,
    title: "Ghi nhận công việc mới",
    desc: "Khai báo task nâng cấp hạ tầng, CI/CD kèm thời lượng thực hiện",
    prompt: "Nâng cấp cụm EKS lên v1.30 cho dự án Core Platform, tải 50%, xong vào thứ 6",
    tag: "Ghi nhận",
  },
  {
    icon: Zap,
    title: "Tối ưu hóa & Hạ tầng",
    desc: "Log task tối ưu chi phí AWS và cấu hình Auto-scaling",
    prompt: "Tối ưu chi phí AWS và cấu hình Auto-scaling cho team Backend 30%",
    tag: "Effort",
  },
  {
    icon: Calendar,
    title: "Kế hoạch tuần tới",
    desc: "Lên lịch trước các đầu việc CI/CD và bàn giao tài liệu",
    prompt: "Lên kế hoạch tuần sau: Setup CI/CD pipeline GitLab cho dự án Mobile 40%",
    tag: "Kế hoạch",
  },
];

function WelcomeHero({
  mode,
  onSelectPrompt,
}: {
  mode: ChatMode;
  onSelectPrompt?: (prompt: string) => void;
}): React.JSX.Element {
  const starters = mode === "leader" ? LEADER_STARTERS : DEVOPS_STARTERS;

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* Animated Glowing Icon */}
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/15 to-cyan-400/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <div className="absolute -inset-1 bg-sky-500/20 rounded-2xl blur-lg -z-10" />
      </div>

      {/* Hero Title & Subtitle */}
      <h2 className="text-xl font-bold text-neutral-100 tracking-tight mb-2">
        {mode === "leader" ? "Trợ lý Điều phối & Phân tích Effort" : "Trợ lý Ghi nhận & Lập kế hoạch Công việc"}
      </h2>
      <p className="text-sm text-neutral-400 max-w-md leading-relaxed mb-8">
        {mode === "leader"
          ? "Hỏi đáp nhanh về nguồn lực, rà soát tiến độ task, hoặc yêu cầu gán/điều chỉnh task cho thành viên trong team."
          : "Mô tả công việc bạn vừa thực hiện, dán ảnh chụp màn hình hoặc dùng lệnh nhanh để ghi nhận effort chuẩn xác."}
      </p>

      {/* Suggestion Starter Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        {starters.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt?.(item.prompt)}
              className="group p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-sky-500/40 transition-all duration-200 flex flex-col justify-between gap-3 text-left cursor-pointer hover:shadow-lg hover:shadow-sky-500/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <IconComp size={15} />
                </div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-neutral-200 group-hover:text-sky-300 transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-sky-400/80 group-hover:text-sky-300 font-medium pt-1 border-t border-white/[0.04]">
                <span>Thử ngay</span>
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcut tip */}
      <div className="mt-8 flex items-center gap-2 text-xs text-neutral-500">
        <span>Mẹo: Gõ</span>
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-neutral-300 border border-white/10">
          /
        </kbd>
        <span>bất kỳ lúc nào để xem toàn bộ danh mục lệnh nhanh.</span>
      </div>
    </div>
  );
}

export function ChatThread({
  mode,
  messages,
  loading,
  thinking,
  onConfirmEntry,
  onConfirmProposal,
  onCancelProposal,
  onSelectClarificationCandidate,
  onSelectPromptSuggestion,
}: ChatThreadProps): React.JSX.Element {
  if (loading) {
    return (
      <VStack gap={4} className="py-6">
        <Skeleton height={64} width="70%" />
        <Skeleton height={80} width="85%" />
        <Skeleton height={64} width="60%" />
      </VStack>
    );
  }

  if (messages.length === 0 && !thinking) {
    return (
      <div className="py-6 sm:py-12 flex items-center justify-center min-h-[420px]">
        <WelcomeHero mode={mode} onSelectPrompt={onSelectPromptSuggestion} />
      </div>
    );
  }

  return (
    <ChatMessageList isStreaming={thinking}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onConfirmEntry={onConfirmEntry}
          onConfirmProposal={onConfirmProposal}
          onCancelProposal={onCancelProposal}
          onSelectClarificationCandidate={onSelectClarificationCandidate}
        />
      ))}
      {thinking && (
        <ChatMessage
          sender="assistant"
          avatar={
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-indigo-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-sm">
              <Sparkles size={13} className="animate-spin" />
            </div>
          }
        >
          <ChatMessageBubble>
            <HStack gap={2} vAlign="center" className="py-1 px-2">
              <Spinner size="sm" label="Đang suy nghĩ" />
              <Text type="supporting" size="sm" className="text-neutral-400">
                AI đang xử lý thông tin…
              </Text>
            </HStack>
          </ChatMessageBubble>
        </ChatMessage>
      )}
    </ChatMessageList>
  );
}

