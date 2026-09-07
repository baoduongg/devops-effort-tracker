import { collection, doc, getDocs, onSnapshot, orderBy, query, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification, NotificationInput } from "@/types/notification";

const notificationsCol = collection(db, "notifications");

function toNotification(id: string, data: Record<string, unknown>): Notification {
  return {
    id,
    type: data.type as Notification["type"],
    title: data.title as string,
    message: data.message as string,
    severity: data.severity as Notification["severity"],
    relatedProjectId: (data.relatedProjectId as string | null) ?? null,
    relatedTaskId: (data.relatedTaskId as string | null) ?? null,
    relatedMemberId: (data.relatedMemberId as string | null) ?? null,
    read: (data.read as boolean) ?? false,
    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
  };
}

export async function getNotifications(): Promise<Notification[]> {
  const q = query(notificationsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toNotification(d.id, d.data()));
}

export function subscribeNotifications(callback: (notifications: Notification[]) => void): () => void {
  const q = query(notificationsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => toNotification(d.id, d.data())));
  });
}

/**
 * Create a notification. Pass `id` for types that must dedup deterministically
 * (e.g. overdue_task uses `overdue_task_<taskId>`) — `setDoc` + fixed id means
 * concurrent callers (multiple snapshots, multiple tabs) collapse onto the same
 * doc instead of racing to create duplicates via auto-id `addDoc`.
 */
export async function createNotification(input: NotificationInput, id?: string): Promise<string> {
  const ref = id ? doc(db, "notifications", id) : doc(notificationsCol);
  await setDoc(ref, { ...input, createdAt: Timestamp.now() }, { merge: true });
  return ref.id;
}
