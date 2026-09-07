import { collection, doc, addDoc, updateDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ChatLog, ChatMessage, ChatMode } from "@/types/chat";

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
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } satisfies ChatLog;
  });
}

interface CreateChatLogInput {
  memberId: string;
  mode: ChatMode;
  rawInput: string | null;
  imageUrl: string | null;
  aiResponse: ChatLog["aiResponse"];
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
    const aiMessage: ChatMessage =
      "answer" in log.aiResponse
        ? { role: "ai-answer", id: `${log.id}-ai`, text: log.aiResponse.answer }
        : { role: "ai-entry", id: `${log.id}-ai`, chatLogId: log.id, entry: log.aiResponse, confirmed: log.confirmed };
    return [userMessage, aiMessage];
  });
}
