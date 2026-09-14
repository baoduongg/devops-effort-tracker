"use client";

import { useState } from "react";
import { Plus, MessageSquare, History, Trash2 } from "lucide-react";
import { LayoutPanel } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { formatRelativeTime } from "@/lib/date";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { deleteThread, deleteThreadsByMember } from "@/services/chatThreads.service";
import type { ChatThread } from "@/types/chat";

export function ChatHistorySidebar(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
  const threads = useChatStore((state) => state.threadsByMode[mode]);
  const activeThreadId = useChatStore((state) => state.activeThreadIdByMode[mode]);
  const setActiveThread = useChatStore((state) => state.setActiveThread);
  const setMessages = useChatStore((state) => state.setMessages);
  const removeThread = useChatStore((state) => state.removeThread);
  const clearThreads = useChatStore((state) => state.clearThreads);
  const user = useAuthStore((state) => state.user);

  const [deletingThread, setDeletingThread] = useState<ChatThread | null>(null);
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  async function handleConfirmDeleteThread(): Promise<void> {
    if (!deletingThread) return;
    setIsDeletingThread(true);
    try {
      await deleteThread(deletingThread.id);
      removeThread(mode, deletingThread.id);
      setDeletingThread(null);
    } catch (err) {
      console.error("Failed to delete chat thread:", err);
    } finally {
      setIsDeletingThread(false);
    }
  }

  async function handleConfirmClearAll(): Promise<void> {
    const memberId = user?.memberId || user?.uid;
    if (!memberId) return;
    setIsClearingAll(true);
    try {
      await deleteThreadsByMember(memberId, mode);
      clearThreads(mode);
      setIsClearAllOpen(false);
    } catch (err) {
      console.error("Failed to delete all chat threads:", err);
    } finally {
      setIsClearingAll(false);
    }
  }

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
            <HStack gap={1.5} vAlign="center">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] text-neutral-400 border border-white/[0.06]">
                {threads.length}
              </span>
              <IconButton
                label="Xóa tất cả hội thoại"
                icon={<Trash2 size={13} />}
                variant="ghost"
                size="sm"
                onClick={() => setIsClearAllOpen(true)}
                tooltip="Xóa tất cả"
              />
            </HStack>
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
                <div key={thread.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => setActiveThread(mode, thread.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 cursor-pointer border ${isSelected
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
                      <span className="text-sm font-medium truncate flex-1 leading-snug pr-6">
                        {thread.title || "Cuộc trò chuyện mới"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pl-5">
                      <span>{formatRelativeTime(thread.updatedAt)}</span>
                    </div>
                  </button>
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton
                      label="Xóa hội thoại"
                      icon={<Trash2 size={12} />}
                      variant="ghost"
                      size="sm"
                      tooltip="Xóa"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingThread(thread);
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </VStack>

      <AlertDialog
        isOpen={Boolean(deletingThread)}
        onOpenChange={(open) => !open && setDeletingThread(null)}
        title="Xóa hội thoại này?"
        description={`Hội thoại "${deletingThread?.title ?? ""}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        actionLabel="Xóa hội thoại"
        onAction={handleConfirmDeleteThread}
        isActionLoading={isDeletingThread}
      />

      <AlertDialog
        isOpen={isClearAllOpen}
        onOpenChange={(open) => !open && setIsClearAllOpen(false)}
        title="Xóa tất cả hội thoại?"
        description="Toàn bộ lịch sử hội thoại trong chế độ này sẽ bị xóa vĩnh viễn và không thể khôi phục."
        actionLabel="Xóa tất cả"
        onAction={handleConfirmClearAll}
        isActionLoading={isClearingAll}
      />
    </LayoutPanel>
  );
}
