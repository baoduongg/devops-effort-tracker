"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { ChatComposer, ChatComposerInput, ChatComposerDrawer } from "@astryxdesign/core/Chat";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { TriangleAlert } from "lucide-react";
import { ModeToggle } from "@/components/chat/mode-toggle";
import { ChatThread } from "@/components/chat/chat-thread";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { storage } from "@/lib/firebase";
import { createTask } from "@/services/tasks.service";
import { getProjectByName, createProject } from "@/services/projects.service";
import { updateMember } from "@/services/members.service";
import { confirmChatLog, getChatLogsByMember, chatLogsToMessages } from "@/services/chatLogs.service";
import type { FormattedEntry } from "@/types/chat";

export function ChatBox(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
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
  const uidRef = useRef("");

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
          setError("Couldn't load chat history. Try refreshing the page.");
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
    if (!uidRef.current) {
      uidRef.current = `${Date.now()}`;
    }
    setUploadingImage(true);
    const storageRef = ref(storage, `chatImages/${uidRef.current}/${Date.now()}.png`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setImageUrl(url);
    setUploadingImage(false);
  }

  async function handleSubmit(): Promise<void> {
    if (!user?.memberId && mode === "devops") {
      setError("Your account isn't linked to a member profile yet.");
      return;
    }
    if (!text && !imageUrl) return;
    const submittedText = text;
    const submittedImageUrl = imageUrl;
    setError(null);
    setText("");
    setImageUrl(null);
    appendMessage(mode, { role: "user", id: `local-${Date.now()}`, text: submittedText || null, imageUrl: submittedImageUrl });
    setThinking(true);
    try {
      if (mode === "devops") {
        const { data } = await axios.post("/api/ai/format-entry", {
          text: submittedText,
          imageUrl: submittedImageUrl,
          memberId: user!.memberId,
        });
        appendMessage(mode, { role: "ai-entry", id: `local-ai-${Date.now()}`, chatLogId: data.chatLogId, entry: data.entry, confirmed: false });
      } else {
        const { data } = await axios.post("/api/ai/answer-query", { question: submittedText });
        appendMessage(mode, { role: "ai-answer", id: `local-ai-${Date.now()}`, text: data.answer });
      }
    } catch {
      setError("Something went wrong reaching the AI service. Your input is preserved, try again.");
      setText(submittedText);
      setImageUrl(submittedImageUrl);
    } finally {
      setThinking(false);
    }
  }

  async function handleConfirmEntry(chatLogId: string, entry: FormattedEntry): Promise<void> {
    let project = await getProjectByName(entry.projectName);
    if (!project) {
      const id = await createProject({ name: entry.projectName, description: "", color: "#6366f1" });
      project = { id, name: entry.projectName, description: "", color: "#6366f1", createdAt: new Date().toISOString() };
    }
    const taskId = await createTask({
      memberId: user!.memberId!,
      projectId: project.id,
      title: entry.title,
      description: "",
      effortPercent: entry.effortPercent,
      status: entry.status,
      startDate: entry.startDate,
      endDate: entry.endDate,
      source: "ai_chat",
    });
    await updateMember(user!.memberId!, {
      currentTaskId: taskId,
      effortPercent: entry.effortPercent,
      status: entry.effortPercent > 100 ? "overloaded" : entry.effortPercent > 60 ? "busy" : "available",
    });
    await confirmChatLog(chatLogId);
    updateEntryConfirmed(mode, chatLogId, true);
  }

  return (
    <VStack gap={3} height="100%">
      <ModeToggle />
      <VStack gap={3} height="100%" isScrollable>
        <ChatThread mode={mode} messages={messages} loading={loadingHistory} thinking={thinking} onConfirmEntry={handleConfirmEntry} />
      </VStack>
      {error && (
        <HStack gap={2}>
          <Icon icon={TriangleAlert} color="error" />
          <Text color="accent">{error}</Text>
        </HStack>
      )}
      <ChatComposer
        onSubmit={handleSubmit}
        isDisabled={thinking}
        drawer={
          (uploadingImage || imageUrl) && (
            <ChatComposerDrawer>
              {uploadingImage ? (
                <HStack gap={2} vAlign="center">
                  <Spinner size="sm" label="Uploading image" />
                  <Text type="supporting">Uploading image…</Text>
                </HStack>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl!} alt="Pasted screenshot" style={{ maxHeight: 128, borderRadius: 8 }} />
              )}
            </ChatComposerDrawer>
          )
        }
        input={
          <ChatComposerInput
            label="Message"
            placeholder="Paste text or an image (Cmd/Ctrl+V)…"
            value={text}
            onChange={setText}
            onSubmit={handleSubmit}
            onFiles={(files) => {
              const image = files.find((f) => f.type.startsWith("image/"));
              if (image) handleUploadImage(image);
            }}
          />
        }
      />
    </VStack>
  );
}
