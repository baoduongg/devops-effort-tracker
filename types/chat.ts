export type ChatMode = "devops" | "leader";

export interface FormattedEntry {
  title: string;
  projectName: string;
  effortPercent: number;
  startDate: string;
  endDate: string | null;
  status: "planned" | "in_progress" | "done";
}

export interface ChatLog {
  id: string;
  memberId: string;
  mode: ChatMode;
  rawInput: string | null;
  imageUrl: string | null;
  aiResponse: FormattedEntry | { answer: string };
  confirmed: boolean;
  createdAt: string;
}

export type ChatMessage =
  | { role: "user"; id: string; text: string | null; imageUrl: string | null }
  | { role: "ai-answer"; id: string; text: string }
  | { role: "ai-entry"; id: string; chatLogId: string; entry: FormattedEntry; confirmed: boolean };
