export type UserRole = "leader" | "devops";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  memberId: string | null;
  createdAt: string;
}
