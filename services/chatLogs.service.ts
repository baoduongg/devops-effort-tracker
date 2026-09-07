import { collection, doc, addDoc, updateDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString } from "@/lib/date";
import type { ChatLog, ChatMessage, ChatMode, FormattedEntry, AiResponsePayload } from "@/types/chat";

const chatLogsCol = collection(db, "chatLogs");

export async function getChatLogsByMember(memberId: string, mode: ChatMode): Promise<ChatLog[]> {
  const q = query(chatLogsCol, where("memberId", "==", memberId), where("mode", "==", mode), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      memberId: data.memberId,
      mode: data.mode,
      rawInput: data.rawInput,
      imageUrl: data.imageUrl,
      aiResponse: data.aiResponse,
      confirmed: data.confirmed,
      createdAt: toIsoString(data.createdAt),
    } satisfies ChatLog;
  });
}

interface CreateChatLogInput {
  memberId: string;
  mode: ChatMode;
  rawInput: string | null;
  imageUrl: string | null;
  aiResponse: AiResponsePayload;
  confirmed: boolean;
}

export async function createChatLog(input: CreateChatLogInput): Promise<string> {
  const ref = await addDoc(chatLogsCol, { ...input, createdAt: Timestamp.now() });
  return ref.id;
}

export async function confirmChatLog(id: string): Promise<void> {
  await updateDoc(doc(db, "chatLogs", id), { confirmed: true });
}

export function chatLogsToMessages(logs: ChatLog[]): ChatMessage[] {
  return logs.flatMap((log): ChatMessage[] => {
    const userMessage: ChatMessage = {
      role: "user",
      id: `${log.id}-user`,
      text: log.rawInput,
      imageUrl: log.imageUrl,
    };

    const messages: ChatMessage[] = [userMessage];
    const resp = log.aiResponse as Record<string, unknown>;

    if (resp && typeof resp === "object") {
      if ("entry" in resp && resp.entry) {
        if ("answer" in resp && typeof resp.answer === "string" && resp.answer) {
          messages.push({
            role: "ai-answer",
            id: `${log.id}-ai-answer`,
            text: resp.answer,
          });
        }
        messages.push({
          role: "ai-entry",
          id: `${log.id}-ai-entry`,
          chatLogId: log.id,
          entry: resp.entry as FormattedEntry,
          confirmed: log.confirmed,
        });
      } else if ("answer" in resp && typeof resp.answer === "string") {
        messages.push({
          role: "ai-answer",
          id: `${log.id}-ai`,
          text: resp.answer,
        });
      } else if ("title" in resp && "projectName" in resp) {
        messages.push({
          role: "ai-entry",
          id: `${log.id}-ai`,
          chatLogId: log.id,
          entry: resp as unknown as FormattedEntry,
          confirmed: log.confirmed,
        });
      }
    }

    return messages;
  });
}
