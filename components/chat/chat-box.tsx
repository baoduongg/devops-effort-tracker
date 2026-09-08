"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { ChatComposer, ChatComposerInput, ChatComposerDrawer, ChatSendButton } from "@astryxdesign/core/Chat";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import {
  TriangleAlert,
  Sparkles,
  MessageSquare,
  X,
  Zap,
  UserCheck,
  BarChart2,
  Clock,
  UserPlus,
  CalendarPlus,
  ListTodo,
  Users,
  FolderGit2,
  Flame,
  Activity,
  BarChart3,
  NotebookPen,
  ArrowRightLeft,
  Trash2,
} from "lucide-react";
import { ModeToggle } from "@/components/chat/mode-toggle";
import { ChatThread } from "@/components/chat/chat-thread";
import { SlashCommandPopup } from "@/components/chat/slash-command-popup";
import { CommandTemplateModal } from "@/components/chat/command-template-modal";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useMembersStore } from "@/store/members.store";
import { createTask, getTasksByMember } from "@/services/tasks.service";
import { getProjectByName, createProject, getProjects } from "@/services/projects.service";
import { getMembers, updateMember, findBestSuitableMember, findMemberByName } from "@/services/members.service";
import { confirmChatLog, getChatLogsByMember, chatLogsToMessages } from "@/services/chatLogs.service";
import { notifyTaskCreated } from "@/services/chatops.service";
import { getAvailableSlashCommands, resolveSlashCommand, SLASH_COMMANDS, type SlashCommand } from "@/lib/slash-commands";
import { isTaskCreationIntent } from "@/lib/intent";
import type { FormattedEntry } from "@/types/chat";
import type { Member, MemberStatus } from "@/types/member";
import type { Project } from "@/types/project";

async function compressImageToBase64(file: File, maxDimension = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Optimized JPEG compression for fast transfer & AI processing
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Không thể tải ảnh"));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh"));
    reader.readAsDataURL(file);
  });
}

function generateMessageId(suffix = ""): string {
  const ts = new Date().getTime();
  const rand = Math.random().toString(36).substring(2, 7);
  return suffix ? `${ts}-${suffix}-${rand}` : `${ts}-${rand}`;
}

// Visual styling for the quick-action pills, keyed by the SlashCommand id it represents.
const PILL_STYLES: Record<string, { label: string; icon: React.ElementType; iconColor: string; hoverBorder: string }> = {
  "coord-log": { label: "Ghi log", icon: NotebookPen, iconColor: "text-emerald-400", hoverBorder: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
  "coord-add": { label: "Lên kế hoạch", icon: CalendarPlus, iconColor: "text-amber-400", hoverBorder: "hover:border-amber-500/50 hover:bg-amber-500/10" },
  "basic-tasks": { label: "Công việc", icon: ListTodo, iconColor: "text-purple-400", hoverBorder: "hover:border-purple-500/50 hover:bg-purple-500/10" },
  "basic-members": { label: "Thành viên", icon: Users, iconColor: "text-emerald-400", hoverBorder: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
  "basic-projects": { label: "Dự án", icon: FolderGit2, iconColor: "text-sky-400", hoverBorder: "hover:border-sky-500/50 hover:bg-sky-500/10" },
  "resource-free": { label: "Ai đang rảnh?", icon: UserCheck, iconColor: "text-emerald-400", hoverBorder: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
  "resource-overload": { label: "Quá tải", icon: Flame, iconColor: "text-amber-400", hoverBorder: "hover:border-amber-500/50 hover:bg-amber-500/10" },
  "resource-effort": { label: "% Effort", icon: Activity, iconColor: "text-purple-400", hoverBorder: "hover:border-purple-500/50 hover:bg-purple-500/10" },
  "resource-load": { label: "Tải công việc", icon: BarChart3, iconColor: "text-sky-400", hoverBorder: "hover:border-sky-500/50 hover:bg-sky-500/10" },
  "coord-assign": { label: "Giao task", icon: UserPlus, iconColor: "text-purple-400", hoverBorder: "hover:border-purple-500/50 hover:bg-purple-500/10" },
  "coord-reassign": { label: "Chuyển task", icon: ArrowRightLeft, iconColor: "text-amber-400", hoverBorder: "hover:border-amber-500/50 hover:bg-amber-500/10" },
  "coord-remove": { label: "Xóa task", icon: Trash2, iconColor: "text-rose-400", hoverBorder: "hover:border-rose-500/50 hover:bg-rose-500/10" },
  "report-allocation": { label: "Báo cáo Effort", icon: BarChart2, iconColor: "text-sky-400", hoverBorder: "hover:border-sky-500/50 hover:bg-sky-500/10" },
  "report-overdue": { label: "Task trễ hạn", icon: Clock, iconColor: "text-rose-400", hoverBorder: "hover:border-rose-500/50 hover:bg-rose-500/10" },
};

const DEVOPS_PROMPT_SUGGESTIONS = [
  "Nâng cấp cụm EKS lên v1.30 cho dự án Core Platform, tải 50%, xong vào thứ 6",
  "Tối ưu chi phí AWS và cấu hình Auto-scaling cho team Backend 30%",
  "Lên kế hoạch tuần sau: Setup CI/CD pipeline GitLab cho dự án Mobile 40%",
];

const LEADER_PROMPT_SUGGESTIONS = [
  "Ai trong team đang rảnh việc có thể nhận thêm task?",
  "Tổng hợp các task đang bị trễ hạn cần xử lý gấp?",
  "Tình hình phân bổ Effort của team theo từng dự án như thế nào?",
];

export function ChatBox(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
  const setMode = useChatStore((state) => state.setMode);
  const messages = useChatStore((state) => state.messagesByMode[mode]);
  const setMessages = useChatStore((state) => state.setMessages);
  const appendMessage = useChatStore((state) => state.appendMessage);
  const updateEntryConfirmed = useChatStore((state) => state.updateEntryConfirmed);
  const user = useAuthStore((state) => state.user);

  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Members & Projects data for template modal & grounding
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Template command modal state
  const [activeTemplateCommand, setActiveTemplateCommand] = useState<SlashCommand | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Slash command state
  const [isCommandPopupOpen, setIsCommandPopupOpen] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  // Load members and projects for command templates
  useEffect(() => {
    getMembers().then(setAllMembers).catch(console.warn);
    getProjects().then(setAllProjects).catch(console.warn);
  }, []);

  // Compute search keyword when user types with "/"
  const commandSearchQuery = useMemo(() => {
    if (text.startsWith("/")) {
      return text.trim();
    }
    return "";
  }, [text]);

  const filteredCommands = useMemo(() => {
    return getAvailableSlashCommands(mode, commandSearchQuery);
  }, [mode, commandSearchQuery]);

  // Sync mode with user role when available
  useEffect(() => {
    if (user?.role && (user.role === "leader" || user.role === "devops")) {
      setMode(user.role);
    }
  }, [user?.role, setMode]);

  useEffect(() => {
    let ignore = false;
    const memberId = mode === "devops" ? user?.memberId : "leader";
    if (!memberId) {
      return;
    }

    Promise.resolve().then(() => {
      if (!ignore) setLoadingHistory(true);
    });

    getChatLogsByMember(memberId, mode)
      .then((logs) => {
        if (!ignore) {
          setMessages(mode, chatLogsToMessages(logs));
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load chat history:", err);
          setError("Không thể tải lịch sử trò chuyện. Thử tải lại trang.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingHistory(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [mode, user?.memberId, setMessages]);

  async function handleUploadImage(file: File): Promise<void> {
    setUploadingImage(true);
    setError(null);
    try {
      const base64Data = await compressImageToBase64(file);
      setImageUrl(base64Data);
    } catch (err) {
      console.error("Lỗi nén/đọc ảnh:", err);
      setError("Không thể đọc tệp hình ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleTextChange(newText: string) {
    setText(newText);
    if (newText.startsWith("/")) {
      setIsCommandPopupOpen(true);
      setSelectedCommandIndex(0);
    } else if (!newText) {
      setIsCommandPopupOpen(false);
    }
  }

  function handleSelectCommand(cmd: SlashCommand) {
    setIsCommandPopupOpen(false);
    setSelectedCommandIndex(0);

    if (cmd.id === "general-clear") {
      setText("");
      return;
    }

    // If command requires filling a template, open interactive modal
    if (cmd.template) {
      setText("");
      setActiveTemplateCommand(cmd);
      setIsTemplateModalOpen(true);
      return;
    }

    if (cmd.isInstantPrompt && cmd.prompt) {
      // Direct execution for quick queries
      handleSubmit(cmd.prompt);
      return;
    }

    if (cmd.prompt) {
      setText(cmd.prompt);
      return;
    }

    setText(`${cmd.command} `);
  }

  async function handleSubmit(overrideText?: string): Promise<void> {
    const rawTextToSend = (overrideText !== undefined ? overrideText : text).trim();
    if (!rawTextToSend && !imageUrl) return;

    // Check if user typed a bare template command (e.g. "/assign", "/plan", "/log", "/status")
    if (rawTextToSend.startsWith("/") && overrideText === undefined) {
      const parts = rawTextToSend.split(/\s+/);
      const cmdName = parts[0].toLowerCase();
      const hasArgs = parts.length > 1 && parts.slice(1).join("").trim().length > 0;
      if (!hasArgs) {
        const matched = SLASH_COMMANDS.find(
          (c) =>
            (c.mode === "all" || c.mode === mode) &&
            (c.command.toLowerCase() === cmdName || c.aliases?.includes(cmdName))
        );
        if (matched && matched.template) {
          setIsCommandPopupOpen(false);
          setText("");
          setActiveTemplateCommand(matched);
          setIsTemplateModalOpen(true);
          return;
        }
      }
    }

    // Resolve any slash commands to full natural language prompts
    const resolvedText = resolveSlashCommand(rawTextToSend, mode);

    setIsCommandPopupOpen(false);
    setSelectedCommandIndex(0);

    const userMessage = {
      id: generateMessageId("user"),
      role: "user" as const,
      text: resolvedText || null,
      imageUrl: imageUrl || null,
    };

    appendMessage(mode, userMessage);
    const currentText = resolvedText;
    const currentImageUrl = imageUrl;
    setText("");
    setImageUrl(null);
    setThinking(true);
    setError(null);

    try {
      if (mode === "devops" && (currentImageUrl || isTaskCreationIntent(currentText))) {
        const res = await axios.post("/api/ai/format-entry", {
          memberId: user?.memberId || user?.uid || "leader",
          text: currentText,
          userInput: currentText,
          imageUrl: currentImageUrl,
        });
        const { entry, chatLogId, message } = res.data;
        if (message) {
          appendMessage("devops", {
            id: generateMessageId("ai-notice"),
            role: "ai-answer",
            text: message,
          });
        }
        appendMessage("devops", {
          id: generateMessageId("ai-entry"),
          role: "ai-entry",
          entry,
          chatLogId,
          confirmed: false,
        });
      } else {
        const res = await axios.post("/api/ai/answer-query", {
          question: currentText,
          query: currentText,
          memberId: user?.memberId || user?.uid || (mode === "devops" ? "" : "leader"),
          mode,
        });
        const { answer, entry, chatLogId } = res.data;
        if (entry) {
          if (answer) {
            appendMessage(mode, {
              id: generateMessageId("ai-text"),
              role: "ai-answer",
              text: answer,
            });
          }
          appendMessage(mode, {
            id: generateMessageId("ai-entry"),
            role: "ai-entry",
            entry,
            chatLogId: chatLogId || generateMessageId("log"),
            confirmed: false,
          });
        } else {
          appendMessage(mode, {
            id: generateMessageId("ai-answer"),
            role: "ai-answer",
            text: answer,
          });
        }
      }
    } catch (err: unknown) {
      console.error("AI Error:", err);
      setError("Lỗi khi xử lý yêu cầu với AI. Vui lòng kiểm tra lại kết nối / API Key.");
    } finally {
      setThinking(false);
    }
  }

  const members = useMembersStore((state) => state.members);

  async function handleConfirmEntry(chatLogId: string, entry: FormattedEntry): Promise<void> {
    let targetMemberId = user?.memberId || "";
    const allMembers = members.length > 0 ? members : await getMembers();

    if (entry.assigneeName) {
      const matched = findMemberByName(allMembers, entry.assigneeName);
      if (matched) {
        targetMemberId = matched.id;
      }
    }

    if (!targetMemberId) {
      const fallbackMember = findBestSuitableMember(allMembers, entry.title, entry.projectName);
      if (fallbackMember) {
        targetMemberId = fallbackMember.id;
      }
    }

    if (!targetMemberId) {
      if (entry.assigneeName) {
        setError(`Không tìm thấy nhân sự "${entry.assigneeName}" trong danh sách thành viên. Vui lòng kiểm tra lại tên.`);
      } else {
        setError("Không có nhân sự nào khả dụng trong hệ thống để gán task.");
      }
      return;
    }

    let project = await getProjectByName(entry.projectName);
    if (!project) {
      const projectId = await createProject({
        name: entry.projectName,
        description: `Dự án ${entry.projectName}`,
        color: "#6366f1",
      });
      project = {
        id: projectId,
        name: entry.projectName,
        description: `Dự án ${entry.projectName}`,
        color: "#6366f1",
        createdAt: new Date().toISOString(),
      };
    }

    const effortMinutes = entry.effortMinutes || 60;

    const taskId = await createTask({
      memberId: targetMemberId,
      projectId: project.id,
      title: entry.title,
      description: entry.title,
      effortMinutes,
      startDate: entry.startDate || new Date().toISOString().split("T")[0],
      endDate: entry.endDate,
      status: entry.status || "in_progress",
      source: "ai_chat",
    });

    const isTaskActive = (entry.status || "in_progress") === "in_progress";
    try {
      const existingTasks = await getTasksByMember(targetMemberId);
      const otherActiveTasks = existingTasks.filter((t) => t.id !== taskId && t.status === "in_progress");
      const totalEffortMinutes = otherActiveTasks.reduce((sum, t) => sum + (t.effortMinutes || 0), 0) + (isTaskActive ? effortMinutes : 0);
      const activeCount = otherActiveTasks.length + (isTaskActive ? 1 : 0);
      const newStatus: MemberStatus =
        activeCount === 0 || totalEffortMinutes === 0
          ? "available"
          : totalEffortMinutes > 480
            ? "overloaded"
            : "busy";

      await updateMember(targetMemberId, {
        currentTaskId: isTaskActive ? taskId : (otherActiveTasks[0]?.id || null),
        effortMinutes: totalEffortMinutes,
        status: newStatus,
      });
    } catch (e) {
      console.warn("Could not sync member status immediately:", e);
    }

    const targetMember = allMembers.find((m) => m.id === targetMemberId);
    const memberName = targetMember?.name ?? targetMemberId;
    notifyTaskCreated({
      title: entry.title,
      memberName,
      memberEmail: targetMember?.email,
      projectName: project.name,
      link: `${window.location.origin}/dashboard`,
      creatorName: user?.displayName ?? "Admin",
      endDate: entry.endDate,
    });

    if (chatLogId) {
      try {
        await confirmChatLog(chatLogId);
      } catch (logErr) {
        console.warn("Could not update chat log confirmation:", logErr);
      }
      updateEntryConfirmed(mode, chatLogId, true);
    }
  }

  const suggestions = mode === "devops" ? DEVOPS_PROMPT_SUGGESTIONS : LEADER_PROMPT_SUGGESTIONS;

  // Key quick commands for the current mode, styled by id and sourced from SLASH_COMMANDS
  const quickPillCommands = useMemo(() => {
    const pillIds =
      mode === "devops"
        ? ["devops-log", "devops-plan", "devops-my-tasks", "devops-my-effort"]
        : ["leader-free", "leader-overloaded", "leader-report", "leader-overdue", "leader-assign"];

    return pillIds
      .map((id) => {
        const cmd = SLASH_COMMANDS.find((c) => c.id === id);
        const style = PILL_STYLES[id];
        if (!cmd || !style) return null;
        return { cmd, ...style };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [mode]);

  return (
    <VStack gap={2} height="100%" className="h-full min-h-0 flex-1 overflow-hidden">
      <StackItem size="static">
        <ModeToggle />
      </StackItem>

      {/* Quick Prompt Suggestions when chat is empty or fresh */}
      {messages.length === 0 && !loadingHistory && (
        <StackItem size="static">
          <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <Sparkles size={13} className="text-sky-400" />
              <span>Gợi ý câu lệnh nhanh ({mode === "devops" ? "Ghi nhận công việc" : "Hỏi đáp Quản lý"}):</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setText(sug)}
                  className="text-left p-2.5 rounded-lg bg-neutral-800/70 hover:bg-neutral-700/80 border border-neutral-700/50 hover:border-sky-500/40 text-xs text-neutral-200 hover:text-white transition-all flex items-center justify-between gap-2 cursor-pointer shadow-sm group hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare size={13} className="text-sky-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{sug}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.04] flex-shrink-0">
                    Sử dụng
                  </span>
                </button>
              ))}
            </div>
          </div>
        </StackItem>
      )}

      <StackItem size="fill" isScrollable className="min-h-0 pr-1">
        <ChatThread mode={mode} messages={messages} loading={loadingHistory} thinking={thinking} onConfirmEntry={handleConfirmEntry} />
      </StackItem>

      {error && (
        <StackItem size="static">
          <HStack gap={2} vAlign="center" className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
            <Icon icon={TriangleAlert} color="error" />
            <Text color="accent">{error}</Text>
          </HStack>
        </StackItem>
      )}

      {/* Quick slash command toolbar */}
      <StackItem size="static">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none">
          {/* Main Slash Command Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setIsCommandPopupOpen((prev) => !prev);
              if (!text.startsWith("/")) {
                setText("/");
              }
            }}
            className={`group flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer shadow-sm ${isCommandPopupOpen
              ? "bg-sky-500/20 text-sky-200 border border-sky-400/40 ring-1 ring-sky-500/30"
              : "bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 hover:border-sky-500/50"
              }`}
            title="Mở danh sách toàn bộ câu lệnh nhanh (Gõ '/')"
          >
            <Zap size={13} className="text-sky-400 transition-transform group-hover:scale-110" />
            <span>Xem lệnh</span>
          </button>

          <div className="h-4 w-[1px] bg-neutral-700/60 flex-shrink-0 mx-0.5" />

          {/* Quick Action Pill Buttons */}
          <div className="flex items-center gap-1.5 flex-nowrap">
            {quickPillCommands.map((pill) => {
              const IconComp = pill.icon;
              return (
                <button
                  key={pill.cmd.command}
                  type="button"
                  onClick={() => handleSelectCommand(pill.cmd)}
                  title={pill.cmd.prompt ? `Nhấn để hỏi nhanh: ${pill.cmd.prompt}` : `Nhấn để soạn lệnh ${pill.cmd.command}`}
                  className={`group flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800/80 hover:bg-neutral-700/90 text-neutral-200 hover:text-white border border-neutral-700/80 transition-all duration-150 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 ${pill.hoverBorder}`}
                >
                  <IconComp size={12} className={`${pill.iconColor} transition-transform group-hover:scale-110`} />
                  <span>{pill.label}</span>
                  <span className="text-[10px] text-neutral-400 group-hover:text-neutral-300 font-mono bg-white/[0.06] px-1 py-0.2 rounded border border-white/[0.04]">
                    {pill.cmd.command}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </StackItem>

      {/* Input area with Slash Command Popup */}
      <StackItem size="static">
        <div className="relative">
          <SlashCommandPopup
            isOpen={isCommandPopupOpen}
            commands={filteredCommands}
            selectedIndex={selectedCommandIndex}
            mode={mode}
            searchQuery={commandSearchQuery}
            onSelect={handleSelectCommand}
            onClose={() => setIsCommandPopupOpen(false)}
          />

          <ChatComposer
            value={text}
            onChange={handleTextChange}
            onSubmit={(submittedText) => handleSubmit(submittedText)}
            isDisabled={thinking}
            sendButton={
              <ChatSendButton
                isDisabled={(!text.trim() && !imageUrl) || thinking}
                onSend={() => handleSubmit()}
              />
            }
            drawer={
              (uploadingImage || imageUrl) && (
                <ChatComposerDrawer>
                  {uploadingImage ? (
                    <HStack gap={2} vAlign="center">
                      <Spinner size="sm" label="Đang xử lý ảnh" />
                      <Text type="supporting">Đang tối ưu hình ảnh…</Text>
                    </HStack>
                  ) : (
                    <div className="relative inline-block my-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl!}
                        alt="Ảnh chụp màn hình"
                        style={{ maxHeight: 120, maxWidth: 260, borderRadius: 8, objectFit: "contain" }}
                        className="border border-white/10 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        title="Gỡ ảnh đính kèm"
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-rose-600 transition-colors shadow-lg cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </ChatComposerDrawer>
              )
            }
            input={
              <ChatComposerInput
                label="Nhập tin nhắn"
                placeholder={
                  mode === "devops"
                    ? "Gõ '/' để mở danh sách lệnh hoặc mô tả công việc (Cmd/Ctrl+V ảnh)..."
                    : "Gõ '/' để mở danh sách lệnh hoặc hỏi về nhân sự, phân bổ effort..."
                }
                value={text}
                onChange={handleTextChange}
                onSubmit={(submittedText) => handleSubmit(submittedText)}
                onKeyDown={(e) => {
                  if (isCommandPopupOpen && filteredCommands.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedCommandIndex((prev) => (prev + 1) % filteredCommands.length);
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                      return;
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSelectCommand(filteredCommands[selectedCommandIndex]);
                        return;
                      }
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsCommandPopupOpen(false);
                      return;
                    }
                  }

                  if (e.key === "/" && (!text || text === "/")) {
                    setIsCommandPopupOpen(true);
                  }

                  if (e.key === "Enter" && !e.shiftKey && imageUrl && !text.trim()) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onFiles={(files) => {
                  const image = files.find((f) => f.type.startsWith("image/"));
                  if (image) handleUploadImage(image);
                }}
              />
            }
          />
        </div>
      </StackItem>

      {/* Interactive Command Template Modal */}
      <CommandTemplateModal
        isOpen={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        command={activeTemplateCommand}
        members={allMembers}
        projects={allProjects}
        onInsertToChat={(preparedPrompt) => {
          setText(preparedPrompt);
        }}
        onSubmitPrompt={(preparedPrompt) => {
          handleSubmit(preparedPrompt);
        }}
      />
    </VStack>
  );
}
