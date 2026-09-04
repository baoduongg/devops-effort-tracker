import { create } from "zustand";
import type { ChatMode, FormattedEntry } from "@/types/chat";

interface ChatState {
  mode: ChatMode;
  pendingEntry: FormattedEntry | null;
  pendingChatLogId: string | null;
  setMode: (mode: ChatMode) => void;
  setPendingEntry: (entry: FormattedEntry | null, chatLogId: string | null) => void;
  clearPending: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  mode: "devops",
  pendingEntry: null,
  pendingChatLogId: null,
  setMode: (mode) => set({ mode }),
  setPendingEntry: (entry, chatLogId) => set({ pendingEntry: entry, pendingChatLogId: chatLogId }),
  clearPending: () => set({ pendingEntry: null, pendingChatLogId: null }),
}));
