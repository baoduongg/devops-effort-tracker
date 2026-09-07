export type MemberStatus = "available" | "busy" | "overloaded";

export interface Member {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  skills: string[];
  status: MemberStatus;
  currentTaskId: string | null;
  effortPercent: number;
  role?: "leader" | "devops";
  updatedAt: string;
}

export type MemberInput = Omit<Member, "id" | "updatedAt">;
