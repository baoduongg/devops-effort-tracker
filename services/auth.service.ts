import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where, Timestamp } from "firebase/firestore";
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

export async function signInAnon(): Promise<void> {
  await signInAnonymously(auth);
}

export async function signInWithEmailPassword(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const uidRef = doc(db, "users", uid);
  await setDoc(uidRef, { role }, { merge: true });
}

export async function getUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((d) => toAppUser(d.id, d.data()));
}

export function subscribeUsers(callback: (users: AppUser[]) => void): () => void {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    callback(snapshot.docs.map((d) => toAppUser(d.id, d.data())));
  });
}


export async function linkOrCreateUser(firebaseUser: User): Promise<AppUser> {
  const uidRef = doc(db, "users", firebaseUser.uid);
  const existingByUid = await getDoc(uidRef);
  const email = firebaseUser.email ?? "";
  const base = {
    email,
    displayName: firebaseUser.displayName ?? email,
    photoURL: firebaseUser.photoURL ?? null,
  };

  let appUser: AppUser;

  if (existingByUid.exists()) {
    const data = existingByUid.data();
    let memberId = (data.memberId as string | null) ?? null;
    if (!memberId) {
      memberId = `member-${firebaseUser.uid}`;
      await setDoc(uidRef, { ...data, memberId }, { merge: true });
    }
    appUser = toAppUser(firebaseUser.uid, { ...data, memberId });
  } else {
    const usersQuery = query(collection(db, "users"), where("email", "==", email));
    const matchByEmail = await getDocs(usersQuery);

    if (!matchByEmail.empty) {
      const seededDoc = matchByEmail.docs[0];
      const seededData = seededDoc.data();
      const memberId = (seededData.memberId as string | null) ?? `member-${firebaseUser.uid}`;
      await setDoc(uidRef, {
        ...base,
        role: seededData.role,
        memberId,
      });
      appUser = toAppUser(firebaseUser.uid, { ...base, role: seededData.role, memberId });
    } else {
      const memberId = `member-${firebaseUser.uid}`;
      const newUser = { ...base, role: "devops" as UserRole, memberId };
      await setDoc(uidRef, newUser);
      appUser = toAppUser(firebaseUser.uid, newUser);
    }
  }

  // Ensure member document exists in members collection
  if (appUser.memberId) {
    const memberRef = doc(db, "members", appUser.memberId);
    const memberSnap = await getDoc(memberRef);
    if (!memberSnap.exists()) {
      await setDoc(memberRef, {
        name: appUser.displayName || email || "DevOps Engineer",
        email: appUser.email,
        photoURL: appUser.photoURL,
        skills: ["DevOps", "CI/CD"],
        status: "available",
        currentTaskId: null,
        effortMinutes: 0,
        // F-11/ISSUE-15: role must be synced from AppUser.role at creation time, otherwise
        // resolveIsLeader() (answer-query route) can never identify real leaders (matched.role
        // stays undefined forever) and blocks them like devops.
        role: appUser.role,
        updatedAt: Timestamp.now(),
      });
    }
  }

  return appUser;
}
