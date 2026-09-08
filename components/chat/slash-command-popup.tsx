"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
import { HStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
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

const CATEGORY_TABS: Array<{ key: SlashCategory | "all"; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "basic", label: "Cơ bản" },
  { key: "resource", label: "Nguồn lực" },
  { key: "coordination", label: "Điều phối" },
  { key: "detail", label: "Chi tiết" },
  { key: "report", label: "Báo cáo" },
];

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
  const [selectedCategory, setSelectedCategory] = useState<SlashCategory | "all">("all");

  const displayCommands = useMemo(() => {
    if (selectedCategory === "all") return commands;
    return commands.filter((c) => c.category === selectedCategory);
  }, [commands, selectedCategory]);

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
      className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col"
      style={{
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header bar */}
      <div className="px-3 py-2 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
        <HStack gap={2} vAlign="center">
          <div className="p-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Zap size={14} />
          </div>
          <Text type="label" weight="semibold" className="text-neutral-200">
            Lệnh nhanh Slash (/) &bull; {mode === "devops" ? "Chế độ DevOps" : "Chế độ Leader"}
          </Text>
          {searchQuery && (
            <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
              {searchQuery}
            </span>
          )}
        </HStack>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          title="Đóng bảng lệnh"
        >
          <X size={14} />
        </button>
      </div>

      {/* Category filter pills */}
      {!searchQuery && (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-black/20 border-b border-white/[0.04] overflow-x-auto scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isTabActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex-shrink-0 ${
                  isTabActive
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Command List */}
      <div
        ref={listRef}
        className="max-h-[290px] overflow-y-auto p-1.5 space-y-1 divide-y divide-white/[0.03] scrollbar-thin scrollbar-thumb-white/10"
      >
        {displayCommands.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <Text type="supporting">
              Không tìm thấy lệnh nào khớp với &ldquo;{searchQuery || selectedCategory}&rdquo;
            </Text>
            <p className="text-xs text-neutral-500 mt-1">
              Thử gõ <span className="font-mono text-sky-400">/help</span> hoặc chọn danh mục khác
            </p>
          </div>
        ) : (
          displayCommands.map((cmd, idx) => {
            const isSelected = idx === selectedIndex;
            const IconComp = COMMAND_ICONS[cmd.id] || Zap;

            return (
              <button
                key={cmd.id}
                type="button"
                data-index={idx}
                onClick={() => onSelect(cmd)}
                className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                  isSelected
                    ? "bg-sky-600/20 border border-sky-500/30 text-white shadow-sm"
                    : "hover:bg-white/[0.04] text-neutral-300 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                        : "bg-white/[0.06] text-neutral-400 group-hover:text-white group-hover:bg-white/[0.1]"
                    }`}
                  >
                    <IconComp size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 group-hover:text-sky-300">
                        {cmd.command}
                      </span>
                      <span className="text-xs font-semibold text-neutral-200 truncate">{cmd.label}</span>
                      {cmd.badgeText && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded font-medium bg-white/[0.06] text-neutral-400 border border-white/[0.06]">
                          {cmd.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{cmd.description}</p>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-1.5">
                  {cmd.isInstantPrompt ? (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                        isSelected
                          ? "bg-sky-500/30 text-sky-200 border border-sky-400/30"
                          : "bg-white/[0.04] text-neutral-400"
                      }`}
                    >
                      ⚡ Hỏi ngay
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                          : "bg-white/[0.04] text-neutral-400"
                      }`}
                    >
                      📝 Điền mẫu
                    </span>
                  )}
                  {isSelected && (
                    <div className="p-1 rounded bg-sky-500/20 text-sky-300">
                      <CornerDownLeft size={12} />
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer shortcut tips */}
      <div className="px-3 py-1.5 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-300">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-300">↓</kbd>
            <span>Điều hướng</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-300">Enter</kbd>
            <span>Chọn lệnh</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-300">Esc</kbd>
            <span>Đóng</span>
          </span>
        </div>
        <div className="hidden sm:block text-neutral-500 text-[10px]">Gõ / bất kỳ lúc nào để mở</div>
      </div>
    </div>
  );
}
