import { create } from "zustand";
import type { Member } from "@/types/member";

interface MembersState {
  members: Member[];
  setMembers: (members: Member[]) => void;
  removeMember: (id: string) => void;
}

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
  removeMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
}));
