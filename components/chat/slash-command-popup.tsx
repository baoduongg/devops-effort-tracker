"use client";

import { useEffect, useRef } from "react";
import {
  Zap,
  Users,
  FolderGit2,
  ListTodo,
  UserCheck,
  Flame,
  Activity,
  BarChart3,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  CalendarPlus,
  NotebookPen,
  Search,
  FileText,
  Folder,
  BarChart2,
  Clock,
  HelpCircle,
  CornerDownLeft,
  X,
} from "lucide-react";
import type { ChatMode } from "@/types/chat";
import type { SlashCommand, SlashCategory } from "@/lib/slash-commands";

interface SlashCommandPopupProps {
  isOpen: boolean;
  commands: SlashCommand[];
  selectedIndex: number;
  mode: ChatMode;
  searchQuery: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

const COMMAND_ICONS: Record<string, React.ElementType> = {
  // Basic
  "basic-help": HelpCircle,
  "basic-members": Users,
  "basic-projects": FolderGit2,
  "basic-tasks": ListTodo,

  // Resource
  "resource-free": UserCheck,
  "resource-overload": Flame,
  "resource-effort": Activity,
  "resource-load": BarChart3,

  // Coordination
  "coord-assign": UserPlus,
  "coord-reassign": ArrowRightLeft,
  "coord-remove": Trash2,
  "coord-add": CalendarPlus,
  "coord-log": NotebookPen,

  // Detail
  "detail-info": Search,
  "detail-task": FileText,
  "detail-project": Folder,

  // Reports & System
  "report-allocation": BarChart2,
  "report-overdue": Clock,
  "general-clear": Trash2,
};

const CATEGORY_NAMES: Record<SlashCategory, string> = {
  basic: "Cơ bản",
  resource: "Nguồn lực",
  coordination: "Điều phối",
  detail: "Chi tiết",
  report: "Báo cáo",
  system: "Tiện ích",
};

export function SlashCommandPopup({
  isOpen,
  commands,
  selectedIndex,
  mode,
  searchQuery,
  onSelect,
  onClose,
}: SlashCommandPopupProps): React.JSX.Element | null {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Danh sách lệnh nhanh"
      className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col max-h-[320px]"
      style={{
        boxShadow: "0 16px 36px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header bar */}
      <div className="px-3 py-2 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-sky-400" />
          <span className="text-xs font-semibold text-neutral-200">Lệnh nhanh</span>
          <span className="text-[10px] text-neutral-400 font-medium">
            &bull; {mode === "devops" ? "DevOps" : "Leader"}
          </span>
          {searchQuery && (
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
              {searchQuery}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-200 p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
          title="Đóng bảng lệnh (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* Command List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10"
      >
        {commands.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <p className="text-xs text-neutral-400">
              Không tìm thấy lệnh khớp với &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Thử gõ <span className="font-mono text-sky-400">/help</span> để xem danh sách lệnh
            </p>
          </div>
        ) : (
          commands.map((cmd, idx) => {
            const isSelected = idx === selectedIndex;
            const IconComp = COMMAND_ICONS[cmd.id] || Zap;
            const showCategoryHeader =
              !searchQuery && (idx === 0 || commands[idx - 1]?.category !== cmd.category);

            return (
              <div key={cmd.id}>
                {showCategoryHeader && (
                  <div className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    {CATEGORY_NAMES[cmd.category] || cmd.category}
                  </div>
                )}
                <button
                  type="button"
                  data-index={idx}
                  onClick={() => onSelect(cmd)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between gap-2.5 group cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/20 text-white border border-sky-500/30 shadow-sm"
                      : "hover:bg-white/[0.04] text-neutral-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`p-1 rounded-md flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                          : "bg-white/[0.06] text-neutral-400 group-hover:text-neutral-200"
                      }`}
                    >
                      <IconComp size={13} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 group-hover:text-sky-300">
                          {cmd.command}
                        </span>
                        <span className="text-xs font-medium text-neutral-200 truncate">
                          {cmd.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-1">
                    {isSelected && (
                      <span className="text-[10px] font-medium text-sky-300 bg-sky-500/20 border border-sky-400/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                        {cmd.isInstantPrompt ? "Hỏi ngay" : "Điền mẫu"}
                        <CornerDownLeft size={10} />
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer shortcut tips */}
      <div className="px-3 py-1.5 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-neutral-400 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 rounded bg-white/10 font-mono text-neutral-300">↑↓</kbd>
            <span>Di chuyển</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 rounded bg-white/10 font-mono text-neutral-300">Enter</kbd>
            <span>Chọn</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.2 rounded bg-white/10 font-mono text-neutral-300">Esc</kbd>
            <span>Đóng</span>
          </span>
        </div>
        <div className="text-neutral-400">{commands.length} lệnh</div>
      </div>
    </div>
  );
}

