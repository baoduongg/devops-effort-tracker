import { collection, doc, addDoc, updateDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString, sortByDateDesc } from "@/lib/date";
import type { ChatThread, ChatMode } from "@/types/chat";

const chatThreadsCol = collection(db, "chatThreads");

function toChatThread(id: string, data: Record<string, unknown>): ChatThread {
  return {
    id,
    memberId: data.memberId as string,
    mode: data.mode as ChatMode,
    title: (data.title as string) ?? "New conversation",
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function getThreadsByMember(memberId: string, mode: ChatMode): Promise<ChatThread[]> {
  // Sorted client-side (not orderBy in the query) to avoid requiring a composite Firestore index
  // for the memberId + mode + updatedAt combination.
  const q = query(chatThreadsCol, where("memberId", "==", memberId), where("mode", "==", mode));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toChatThread(d.id, d.data())).sort(sortByDateDesc("updatedAt"));
}

interface CreateThreadInput {
  memberId: string;
  mode: ChatMode;
  title: string;
}

export async function createThread(input: CreateThreadInput): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(chatThreadsCol, { ...input, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function touchThread(id: string, title?: string): Promise<void> {
  await updateDoc(doc(db, "chatThreads", id), {
    updatedAt: Timestamp.now(),
    ...(title ? { title } : {}),
  });
}
