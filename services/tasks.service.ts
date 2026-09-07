import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Task, TaskInput } from "@/types/task";

const tasksCol = collection(db, "tasks");

function toTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    memberId: data.memberId as string,
    projectId: data.projectId as string,
    title: data.title as string,
    description: (data.description as string) ?? "",
    effortPercent: (data.effortPercent as number) ?? 0,
    status: data.status as Task["status"],
    startDate: (data.startDate as Timestamp).toDate().toISOString(),
    endDate: data.endDate ? (data.endDate as Timestamp).toDate().toISOString() : null,
    source: data.source as Task["source"],
    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
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
  const ref = await addDoc(tasksCol, {
    ...input,
    startDate: Timestamp.fromDate(new Date(input.startDate)),
    endDate: input.endDate ? Timestamp.fromDate(new Date(input.endDate)) : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<void> {
  const payload: Record<string, unknown> = {
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

