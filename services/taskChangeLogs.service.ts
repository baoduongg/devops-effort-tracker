import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString } from "@/lib/date";
import type { TaskChangeLog, TaskChangeLogInput } from "@/types/taskChangeLog";

const taskChangeLogsCol = collection(db, "taskChangeLogs");

function toTaskChangeLog(id: string, data: Record<string, unknown>): TaskChangeLog {
  return {
    id,
    actorUid: (data.actorUid as string) ?? "",
    actorName: (data.actorName as string) ?? "",
    action: (data.action as TaskChangeLog["action"]) ?? "update",
    taskId: (data.taskId as string | null) ?? null,
    taskTitle: (data.taskTitle as string) ?? "",
    proposedChanges: (data.proposedChanges as Record<string, unknown>) ?? {},
    appliedChanges: (data.appliedChanges as Record<string, unknown>) ?? {},
    status: (data.status as TaskChangeLog["status"]) ?? "confirmed",
    chatLogId: (data.chatLogId as string) ?? "",
    createdAt: toIsoString(data.createdAt),
  };
}

export async function createTaskChangeLog(input: TaskChangeLogInput): Promise<string> {
  const ref = await addDoc(taskChangeLogsCol, { ...input, createdAt: Timestamp.now() });
  return ref.id;
}

/**
 * Audit trail lookup for F-08/AC-08-6 — no AI involved, direct Firestore read.
 * ISSUE-10: no `orderBy` here on purpose — where + orderBy on a different field needs a Firestore
 * composite index that doesn't exist in this project. Sort in JS after fetching instead.
 */
export async function getTaskChangeLogsByActor(actorUid: string): Promise<TaskChangeLog[]> {
  const q = query(taskChangeLogsCol, where("actorUid", "==", actorUid));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => toTaskChangeLog(d.id, d.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllTaskChangeLogs(): Promise<TaskChangeLog[]> {
  const q = query(taskChangeLogsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toTaskChangeLog(d.id, d.data()));
}
