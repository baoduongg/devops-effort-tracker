import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Member, MemberInput } from "@/types/member";

const membersCol = collection(db, "members");

function toMember(id: string, data: Record<string, unknown>): Member {
  return {
    id,
    name: data.name as string,
    email: data.email as string,
    photoURL: (data.photoURL as string | null) ?? null,
    skills: (data.skills as string[]) ?? [],
    status: data.status as Member["status"],
    currentTaskId: (data.currentTaskId as string | null) ?? null,
    effortPercent: (data.effortPercent as number) ?? 0,
    updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() ?? new Date().toISOString(),
  };
}

export async function getMembers(): Promise<Member[]> {
  const snapshot = await getDocs(membersCol);
  return snapshot.docs.map((d) => toMember(d.id, d.data()));
}

export async function getMember(id: string): Promise<Member | null> {
  const snapshot = await getDoc(doc(db, "members", id));
  if (!snapshot.exists()) return null;
  return toMember(snapshot.id, snapshot.data());
}

export async function createMember(input: MemberInput): Promise<string> {
  const ref = await addDoc(membersCol, { ...input, updatedAt: Timestamp.now() });
  return ref.id;
}

export async function updateMember(id: string, input: Partial<MemberInput>): Promise<void> {
  await updateDoc(doc(db, "members", id), { ...input, updatedAt: Timestamp.now() });
}

export async function deleteMember(id: string): Promise<void> {
  await deleteDoc(doc(db, "members", id));
}

export function subscribeMembers(callback: (members: Member[]) => void): () => void {
  return onSnapshot(membersCol, (snapshot) => {
    callback(snapshot.docs.map((d) => toMember(d.id, d.data())));
  });
}
