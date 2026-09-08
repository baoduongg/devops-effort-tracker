export type ChatMode = "devops" | "leader";

export interface FormattedEntry {
  title: string;
  projectName: string;
  effortMinutes: number;
  effortPercent?: number;
  assigneeName?: string | null;
  startDate: string;
  endDate: string | null;
  status: "planned" | "in_progress" | "done";
  suggestionNote?: string | null;
}

export type AiResponsePayload =
  | FormattedEntry
  | { answer: string }
  | { answer?: string; entry: FormattedEntry };

export interface ChatLog {
  id: string;
  memberId: string;
  mode: ChatMode;
  rawInput: string | null;
  imageUrl: string | null;
  aiResponse: AiResponsePayload;
  confirmed: boolean;
  createdAt: string;
}

export type ChatMessage =
  | { role: "user"; id: string; text: string | null; imageUrl: string | null }
  | { role: "ai-answer"; id: string; text: string }
  | { role: "ai-entry"; id: string; chatLogId: string; entry: FormattedEntry; confirmed: boolean };
