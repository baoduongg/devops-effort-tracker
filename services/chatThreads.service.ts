import { collection, doc, addDoc, updateDoc, query, where, getDocs, writeBatch, Timestamp, type DocumentReference } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString, sortByDateDesc } from "@/lib/date";
import type { ChatThread, ChatMode } from "@/types/chat";

const chatThreadsCol = collection(db, "chatThreads");
const chatLogsCol = collection(db, "chatLogs");

// ponytail: Firestore batches cap at 500 writes; chunk to stay under that.
const BATCH_LIMIT = 500;

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

async function deleteRefsInChunks(refs: DocumentReference[]): Promise<void> {
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    refs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

export async function deleteThread(threadId: string): Promise<void> {
  const q = query(chatLogsCol, where("threadId", "==", threadId));
  const snapshot = await getDocs(q);

  const refs: DocumentReference[] = snapshot.docs.map((d) => d.ref);
  refs.push(doc(db, "chatThreads", threadId));
  await deleteRefsInChunks(refs);
}

export async function deleteThreadsByMember(memberId: string, mode: ChatMode): Promise<void> {
  const threads = await getThreadsByMember(memberId, mode);
  if (threads.length === 0) return;

  const refs: DocumentReference[] = [];
  for (const thread of threads) {
    const logsSnapshot = await getDocs(query(chatLogsCol, where("threadId", "==", thread.id)));
    logsSnapshot.docs.forEach((d) => refs.push(d.ref));
    refs.push(doc(db, "chatThreads", thread.id));
  }

  await deleteRefsInChunks(refs);
}
