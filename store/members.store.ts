import { create } from "zustand";
import type { Member } from "@/types/member";

interface MembersState {
  members: Member[];
  setMembers: (members: Member[]) => void;
  upsertMember: (member: Member) => void;
  removeMember: (id: string) => void;
}

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
  upsertMember: (member) =>
    set((state) => {
      const exists = state.members.some((m) => m.id === member.id);
      return {
        members: exists
          ? state.members.map((m) => (m.id === member.id ? member : m))
          : [...state.members, member],
      };
    }),
  removeMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
}));
