"use client";

import { Plus, MessageSquare, History } from "lucide-react";
import { LayoutPanel } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { formatRelativeTime } from "@/lib/date";
import { useChatStore } from "@/store/chat.store";

export function ChatHistorySidebar(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
  const threads = useChatStore((state) => state.threadsByMode[mode]);
  const activeThreadId = useChatStore((state) => state.activeThreadIdByMode[mode]);
  const setActiveThread = useChatStore((state) => state.setActiveThread);
  const setMessages = useChatStore((state) => state.setMessages);

  return (
    <LayoutPanel hasDivider width={260} padding={3} label="Lịch sử hội thoại">
      <VStack gap={3} className="h-full flex flex-col">
        <Button
          label="Đoạn chat mới"
          variant="primary"
          size="sm"
          width="100%"
          icon={<Plus size={15} />}
          onClick={() => {
            setActiveThread(mode, null);
            setMessages(mode, []);
          }}
        />

        <div className="flex items-center justify-between px-1 pt-1">
          <HStack gap={1.5} vAlign="center">
            <History size={13} className="text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Hội thoại gần đây
            </span>
          </HStack>
          {threads.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] text-neutral-400 border border-white/[0.06]">
              {threads.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 -mr-1 scrollbar-thin">
          {threads.length === 0 ? (
            <div className="px-3 py-8 text-center flex flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-neutral-500 flex items-center justify-center mb-2">
                <MessageSquare size={16} />
              </div>
              <p className="text-xs font-medium text-neutral-400">Chưa có hội thoại</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Bắt đầu nhắn tin để lưu lịch sử
              </p>
            </div>
          ) : (
            threads.map((thread) => {
              const isSelected = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThread(mode, thread.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 group cursor-pointer border ${isSelected
                    ? "bg-sky-500/15 border-sky-500/30 text-white shadow-sm"
                    : "bg-transparent border-transparent hover:bg-white/[0.04] text-neutral-300 hover:text-white"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      size={13}
                      className={`flex-shrink-0 transition-colors ${isSelected ? "text-sky-400" : "text-neutral-500 group-hover:text-neutral-300"
                        }`}
                    />
                    <span className="text-sm font-medium truncate flex-1 leading-snug">
                      {thread.title || "Cuộc trò chuyện mới"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pl-5">
                    <span>{formatRelativeTime(thread.updatedAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </VStack>
    </LayoutPanel>
  );
}

