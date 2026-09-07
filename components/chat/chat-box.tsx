"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { ChatComposer, ChatComposerInput, ChatComposerDrawer, ChatSendButton } from "@astryxdesign/core/Chat";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { TriangleAlert, Sparkles, MessageSquare, X } from "lucide-react";
import { ModeToggle } from "@/components/chat/mode-toggle";
import { ChatThread } from "@/components/chat/chat-thread";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useMembersStore } from "@/store/members.store";
import { createTask, getTasksByMember } from "@/services/tasks.service";
import { getProjectByName, createProject } from "@/services/projects.service";
import { getMembers, updateMember } from "@/services/members.service";
import { confirmChatLog, getChatLogsByMember, chatLogsToMessages } from "@/services/chatLogs.service";
import type { FormattedEntry } from "@/types/chat";
import type { Member, MemberStatus } from "@/types/member";

function findMemberByName(allMembers: Member[], targetName?: string | null): Member | null {
  if (!targetName || !targetName.trim()) return null;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const queryNorm = normalize(targetName);
  if (!queryNorm) return null;

  // 1. Exact normalized match
  const exact = allMembers.find((m) => normalize(m.name) === queryNorm);
  if (exact) return exact;

  // 2. Substring match (either member name contains target or target contains member name)
  const sub = allMembers.find((m) => {
    const mNorm = normalize(m.name);
    return mNorm.includes(queryNorm) || queryNorm.includes(mNorm);
  });
  if (sub) return sub;

  // 3. Word overlap match (e.g. "Dương Bao 98" vs "Bao Duong")
  const queryWords = queryNorm.split(" ").filter((w) => w.length > 1);
  let bestMatch: Member | null = null;
  let maxMatchedWords = 0;

  for (const m of allMembers) {
    const mWords = normalize(m.name).split(" ").filter((w) => w.length > 1);
    const matchedCount = queryWords.filter((w) => mWords.some((mw) => mw.includes(w) || w.includes(mw))).length;
    if (matchedCount > maxMatchedWords && matchedCount >= 1) {
      maxMatchedWords = matchedCount;
      bestMatch = m;
    }
  }

  return bestMatch;
}

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
        ctx.drawImage(img, 0, width, height);
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

  async function handleSubmit(overrideText?: string): Promise<void> {
    const textToSend = (overrideText !== undefined ? overrideText : text).trim();
    if (!textToSend && !imageUrl) return;

    const userMessage = {
      id: `${Date.now()}`,
      role: "user" as const,
      text: textToSend || null,
      imageUrl: imageUrl || null,
    };

    appendMessage(mode, userMessage);
    const currentText = textToSend;
    const currentImageUrl = imageUrl;
    setText("");
    setImageUrl(null);
    setThinking(true);
    setError(null);

    try {
      if (mode === "devops") {
        const res = await axios.post("/api/ai/format-entry", {
          memberId: user?.memberId || user?.id || "leader",
          text: currentText,
          userInput: currentText,
          imageUrl: currentImageUrl,
        });
        const { entry, chatLogId } = res.data;
        appendMessage("devops", {
          id: `${Date.now()}-ai`,
          role: "ai-entry",
          entry,
          chatLogId,
          confirmed: false,
        });
      } else {
        const res = await axios.post("/api/ai/answer-query", {
          question: currentText,
          query: currentText,
        });
        const { answer, entry, chatLogId } = res.data;
        if (entry) {
          if (answer) {
            appendMessage("leader", {
              id: `${Date.now()}-ai-text`,
              role: "ai-answer",
              text: answer,
            });
          }
          appendMessage("leader", {
            id: `${Date.now()}-ai-entry`,
            role: "ai-entry",
            entry,
            chatLogId: chatLogId || `${Date.now()}`,
            confirmed: false,
          });
        } else {
          appendMessage("leader", {
            id: `${Date.now()}-ai`,
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
      if (entry.assigneeName) {
        setError(`Không tìm thấy nhân sự "${entry.assigneeName}" trong danh sách thành viên. Vui lòng kiểm tra lại tên.`);
      } else {
        setError("Vui lòng chỉ định nhân sự (Assignee) để gán task.");
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

    const taskId = await createTask({
      memberId: targetMemberId,
      projectId: project.id,
      title: entry.title,
      description: entry.title,
      effortPercent: entry.effortPercent,
      startDate: entry.startDate || new Date().toISOString().split("T")[0],
      endDate: entry.endDate,
      status: entry.status || "in_progress",
      source: "ai_chat",
    });

    const isTaskActive = (entry.status || "in_progress") === "in_progress";
    try {
      const existingTasks = await getTasksByMember(targetMemberId);
      const otherActiveTasks = existingTasks.filter((t) => t.id !== taskId && t.status === "in_progress");
      const totalEffort = otherActiveTasks.reduce((sum, t) => sum + t.effortPercent, 0) + (isTaskActive ? entry.effortPercent : 0);
      const activeCount = otherActiveTasks.length + (isTaskActive ? 1 : 0);
      const newStatus: MemberStatus =
        activeCount === 0 || totalEffort === 0
          ? "available"
          : totalEffort > 100
          ? "overloaded"
          : "busy";

      await updateMember(targetMemberId, {
        currentTaskId: isTaskActive ? taskId : (otherActiveTasks[0]?.id || null),
        effortPercent: totalEffort,
        status: newStatus,
      });
    } catch (e) {
      console.warn("Could not sync member status immediately:", e);
    }

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

  return (
    <VStack gap={2} height="100%" className="h-full min-h-0 flex-1 overflow-hidden">
      <StackItem size="static">
        <ModeToggle />
      </StackItem>

      {/* Quick Prompt Suggestions when chat is empty or fresh */}
      {messages.length === 0 && !loadingHistory && (
        <StackItem size="static">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
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
                  className="text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs text-neutral-300 transition-colors flex items-center gap-2"
                >
                  <MessageSquare size={12} className="text-neutral-500 flex-shrink-0" />
                  <span className="truncate">{sug}</span>
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

      <StackItem size="static">
        <ChatComposer
          value={text}
          onChange={setText}
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
                  ? "Mô tả công việc bạn vừa làm hoặc dán ảnh chụp màn hình (Cmd/Ctrl+V)..."
                  : "Đặt câu hỏi về phân bổ nhân sự, task quá hạn, tải công việc..."
              }
              value={text}
              onChange={setText}
              onSubmit={(submittedText) => handleSubmit(submittedText)}
              onKeyDown={(e) => {
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
      </StackItem>
    </VStack>
  );
}
