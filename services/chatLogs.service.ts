import { collection, doc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ChatLog, ChatMode } from "@/types/chat";

const chatLogsCol = collection(db, "chatLogs");

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
