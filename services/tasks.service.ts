import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  type UpdateData,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString, calculateDefaultEndDate, parseDateLocal, formatDateLocal } from "@/lib/date";
import type { Task, TaskInput } from "@/types/task";

const tasksCol = collection(db, "tasks");

function toTask(id: string, data: Record<string, unknown>): Task {
  const effortMinutes = typeof data.effortMinutes === "number" ? data.effortMinutes : undefined;
  const legacyEffortPercent = typeof data.effortPercent === "number" ? data.effortPercent : undefined;
  const resolvedMinutes =
    effortMinutes !== undefined
      ? effortMinutes
      : legacyEffortPercent !== undefined
        ? Math.round((legacyEffortPercent / 100) * 480)
        : 60;

  return {
    id,
    memberId: (data.memberId as string) ?? "",
    projectId: (data.projectId as string) ?? "",
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    effortMinutes: resolvedMinutes,
    status: (data.status as Task["status"]) ?? "in_progress",
    startDate: toIsoString(data.startDate),
    endDate: data.endDate ? toIsoString(data.endDate) : null,
    source: (data.source as Task["source"]) ?? "manual",
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function getTasksByMember(memberId: string): Promise<Task[]> {
  const q = query(tasksCol, where("memberId", "==", memberId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toTask(d.id, d.data()));
}

export async function getAllTasks(): Promise<Task[]> {
  const snapshot = await getDocs(tasksCol);
  return snapshot.docs.map((d) => toTask(d.id, d.data()));
}

export async function getAllActiveTasks(): Promise<Task[]> {
  const q = query(tasksCol, where("status", "in", ["planned", "in_progress"]));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toTask(d.id, d.data()));
}

export function subscribeAllTasks(callback: (tasks: Task[]) => void): () => void {
  return onSnapshot(tasksCol, (snapshot) => {
    callback(snapshot.docs.map((d) => toTask(d.id, d.data())));
  });
}

export async function createTask(input: TaskInput): Promise<string> {
  const resolvedStartDate = input.startDate || formatDateLocal(new Date());
  const resolvedEndDate =
    input.endDate || calculateDefaultEndDate(resolvedStartDate, input.effortMinutes);

  const ref = await addDoc(tasksCol, {
    ...input,
    startDate: Timestamp.fromDate(parseDateLocal(resolvedStartDate)),
    endDate: Timestamp.fromDate(parseDateLocal(resolvedEndDate)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<void> {
  const payload: UpdateData<DocumentData> = {
    ...input,
    updatedAt: Timestamp.now(),
  };
  if (input.startDate) {
    payload.startDate = Timestamp.fromDate(new Date(input.startDate));
  }
  if (input.endDate !== undefined) {
    payload.endDate = input.endDate ? Timestamp.fromDate(new Date(input.endDate)) : null;
  }
  await updateDoc(doc(db, "tasks", id), payload);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, "tasks", id));
}

