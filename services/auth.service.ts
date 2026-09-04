import {
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { AppUser, UserRole } from "@/types/user";

function toAppUser(uid: string, data: Record<string, unknown>): AppUser {
  return {
    uid,
    email: data.email as string,
    displayName: data.displayName as string,
    photoURL: (data.photoURL as string | null) ?? null,
    role: data.role as UserRole,
    memberId: (data.memberId as string | null) ?? null,
    createdAt: new Date().toISOString(),
  };
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function linkOrCreateUser(firebaseUser: User): Promise<AppUser> {
  const uidRef = doc(db, "users", firebaseUser.uid);
  const existingByUid = await getDoc(uidRef);
  if (existingByUid.exists()) {
    return toAppUser(firebaseUser.uid, existingByUid.data());
  }

  const email = firebaseUser.email ?? "";
  const usersQuery = query(collection(db, "users"), where("email", "==", email));
  const matchByEmail = await getDocs(usersQuery);

  const base = {
    email,
    displayName: firebaseUser.displayName ?? email,
    photoURL: firebaseUser.photoURL ?? null,
  };

  if (!matchByEmail.empty) {
    const seededDoc = matchByEmail.docs[0];
    const seededData = seededDoc.data();
    await setDoc(uidRef, {
      ...base,
      role: seededData.role,
      memberId: seededData.memberId ?? null,
    });
    return toAppUser(firebaseUser.uid, { ...base, role: seededData.role, memberId: seededData.memberId });
  }

  const newUser = { ...base, role: "devops" as UserRole, memberId: null };
  await setDoc(uidRef, newUser);
  return toAppUser(firebaseUser.uid, newUser);
}
