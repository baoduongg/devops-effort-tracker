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
import { toIsoString } from "@/lib/date";
import type { Alarm, AlarmInput, AlarmStatus } from "@/types/alarm";

const alarmsCol = collection(db, "alarms");

function toAlarm(id: string, data: Record<string, unknown>): Alarm {
  return {
    id,
    memberId: (data.memberId as string) ?? "",
    supervisorId: (data.supervisorId as string | null) ?? null,
    content: (data.content as string) ?? "",
    projectName: (data.projectName as string | null) ?? null,
    time: toIsoString(data.time),
    status: (data.status as AlarmStatus) ?? "active",
    firedAt: data.firedAt ? toIsoString(data.firedAt) : null,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function getAllAlarms(): Promise<Alarm[]> {
  const snapshot = await getDocs(alarmsCol);
  return snapshot.docs.map((d) => toAlarm(d.id, d.data()));
}

export function subscribeAllAlarms(callback: (alarms: Alarm[]) => void): () => void {
  return onSnapshot(alarmsCol, (snapshot) => {
    callback(snapshot.docs.map((d) => toAlarm(d.id, d.data())));
  });
}

export async function createAlarm(input: AlarmInput): Promise<string> {
  const ref = await addDoc(alarmsCol, {
    ...input,
    time: Timestamp.fromDate(new Date(input.time)),
    firedAt: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateAlarm(id: string, input: Partial<AlarmInput>): Promise<void> {
  const payload: UpdateData<DocumentData> = { ...input, updatedAt: Timestamp.now() };
  if (input.time) {
    payload.time = Timestamp.fromDate(new Date(input.time));
    // Rescheduling re-arms the alarm so the cron can fire again.
    payload.firedAt = null;
    if (!input.status) payload.status = "active";
  }
  await updateDoc(doc(db, "alarms", id), payload);
}

export async function cancelAlarm(id: string): Promise<void> {
  await updateDoc(doc(db, "alarms", id), { status: "cancelled", updatedAt: Timestamp.now() });
}

export async function deleteAlarm(id: string): Promise<void> {
  await deleteDoc(doc(db, "alarms", id));
}

/** Active alarms not yet fired — candidates for the alarm cron. */
export async function getPendingAlarms(): Promise<Alarm[]> {
  const q = query(alarmsCol, where("status", "==", "active"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toAlarm(d.id, d.data()));
}

export async function markAlarmFired(id: string): Promise<void> {
  await updateDoc(doc(db, "alarms", id), { status: "done", firedAt: Timestamp.now() });
}
