import { collection, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString } from "@/lib/date";
import type { Notification, NotificationInput } from "@/types/notification";

const notificationsCol = collection(db, "notifications");

function toNotification(id: string, data: Record<string, unknown>): Notification {
  return {
    id,
    type: data.type as Notification["type"],
    title: (data.title as string) ?? "",
    message: (data.message as string) ?? "",
    severity: (data.severity as Notification["severity"]) ?? "info",
    relatedProjectId: (data.relatedProjectId as string | null) ?? null,
    relatedTaskId: (data.relatedTaskId as string | null) ?? null,
    relatedMemberId: (data.relatedMemberId as string | null) ?? null,
    read: (data.read as boolean) ?? false,
    createdAt: toIsoString(data.createdAt),
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

export async function markNotificationRead(id: string): Promise<void> {
  const ref = doc(db, "notifications", id);
  await updateDoc(ref, { read: true });
}

export async function markAllNotificationsRead(notificationIds: string[]): Promise<void> {
  await Promise.all(
    notificationIds.map((id) => {
      const ref = doc(db, "notifications", id);
      return updateDoc(ref, { read: true });
    })
  );
}
