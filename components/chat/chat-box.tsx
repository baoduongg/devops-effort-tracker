"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/chat/mode-toggle";
import { ImagePasteInput } from "@/components/chat/image-paste-input";
import { EntryPreviewDialog } from "@/components/chat/entry-preview-dialog";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { createTask } from "@/services/tasks.service";
import { getProjectByName, createProject } from "@/services/projects.service";
import { updateMember } from "@/services/members.service";
import { confirmChatLog } from "@/services/chatLogs.service";
import type { FormattedEntry } from "@/types/chat";

export function ChatBox(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
  const pendingEntry = useChatStore((state) => state.pendingEntry);
  const pendingChatLogId = useChatStore((state) => state.pendingChatLogId);
  const setPendingEntry = useChatStore((state) => state.setPendingEntry);
  const clearPending = useChatStore((state) => state.clearPending);
  const user = useAuthStore((state) => state.user);

  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    if (!user?.memberId && mode === "devops") {
      setError("Your account isn't linked to a member profile yet.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      if (mode === "devops") {
        const { data } = await axios.post("/api/ai/format-entry", { text, imageUrl, memberId: user!.memberId });
        setPendingEntry(data.entry, data.chatLogId);
      } else {
        const { data } = await axios.post("/api/ai/answer-query", { question: text });
        setAnswer(data.answer);
      }
      setText("");
      setImageUrl(null);
    } catch {
      setError("Something went wrong reaching the AI service. Your input is preserved — try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(entry: FormattedEntry): Promise<void> {
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
    if (pendingChatLogId) await confirmChatLog(pendingChatLogId);
    clearPending();
  }

  return (
    <div className="space-y-4">
      <ModeToggle />
      <ImagePasteInput text={text} onTextChange={setText} onImageUploaded={setImageUrl} />
      <Button onClick={handleSubmit} disabled={loading || (!text && !imageUrl)}>
        {loading ? "Thinking…" : mode === "devops" ? "Format entry" : "Ask"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {answer && <p className="rounded-md border bg-muted p-3 text-sm">{answer}</p>}
      {pendingEntry && (
        <EntryPreviewDialog
          entry={pendingEntry}
          open={!!pendingEntry}
          onConfirm={handleConfirm}
          onCancel={() => clearPending()}
        />
      )}
    </div>
  );
}
