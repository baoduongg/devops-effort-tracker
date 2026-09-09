import { create } from "zustand";
import type { ChatMessage, ChatMode } from "@/types/chat";

export type AiProvider = "nvidia" | "claude";

const AI_PROVIDER_STORAGE_KEY = "devops-tracker:ai-provider";

function loadStoredProvider(): AiProvider {
  if (typeof window === "undefined") return "nvidia";
  try {
    const stored = window.localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
    return stored === "claude" ? "claude" : "nvidia";
  } catch {
    return "nvidia";
  }
}

interface ChatState {
  mode: ChatMode;
  aiProvider: AiProvider;
  messagesByMode: Record<ChatMode, ChatMessage[]>;
  setMode: (mode: ChatMode) => void;
  setAiProvider: (provider: AiProvider) => void;
  setMessages: (mode: ChatMode, messages: ChatMessage[]) => void;
  appendMessage: (mode: ChatMode, message: ChatMessage) => void;
  updateEntryConfirmed: (mode: ChatMode, chatLogId: string, confirmed: boolean) => void;
  updateProposalConfirmed: (mode: ChatMode, chatLogId: string, confirmed: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  mode: "devops",
  aiProvider: loadStoredProvider(),
  messagesByMode: { devops: [], leader: [] },
  setMode: (mode) => set({ mode }),
  setAiProvider: (provider) => {
    try {
      window.localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
    } catch {
      // ignore storage errors (private mode, disabled storage)
    }
    set({ aiProvider: provider });
  },
  setMessages: (mode, messages) =>
    set((state) => ({ messagesByMode: { ...state.messagesByMode, [mode]: messages } })),
  appendMessage: (mode, message) =>
    set((state) => ({
      messagesByMode: { ...state.messagesByMode, [mode]: [...state.messagesByMode[mode], message] },
    })),
  updateEntryConfirmed: (mode, chatLogId, confirmed) =>
    set((state) => ({
      messagesByMode: {
        ...state.messagesByMode,
        [mode]: state.messagesByMode[mode].map((m) =>
          m.role === "ai-entry" && m.chatLogId === chatLogId ? { ...m, confirmed } : m
        ),
      },
    })),
  updateProposalConfirmed: (mode, chatLogId, confirmed) =>
    set((state) => ({
      messagesByMode: {
        ...state.messagesByMode,
        [mode]: state.messagesByMode[mode].map((m) =>
          m.role === "ai-proposal" && m.chatLogId === chatLogId ? { ...m, confirmed } : m
        ),
      },
    })),
}));
