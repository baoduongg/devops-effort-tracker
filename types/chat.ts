import type { TaskStatus } from "@/types/task";

export type ChatMode = "devops" | "leader";

export interface FormattedEntry {
  title: string;
  projectName: string;
  effortMinutes: number;
  assigneeName?: string | null;
  startDate: string;
  endDate: string | null;
  status: "planned" | "in_progress" | "done";
  suggestionNote?: string | null;
}

export type ProposedAction = "create" | "update" | "delete";

export interface TaskChangeProposal {
  action: "update" | "delete";
  taskId: string; // id task Firestore đã xác định rõ ràng (không mơ hồ)
  taskSnapshot: {
    // dữ liệu task hiện tại, để UI hiện "trước -> sau"
    title: string;
    projectName: string;
    assigneeName: string | null;
    status: TaskStatus;
    startDate: string;
    endDate: string | null;
    effortMinutes: number;
  };
  changes: Partial<{
    // chỉ field được đổi (rỗng cho action "delete")
    title: string;
    projectName: string;
    assigneeName: string | null;
    status: TaskStatus;
    startDate: string;
    endDate: string | null;
    effortMinutes: number;
  }>;
}

export interface ClarificationRequest {
  reason: "missing_field" | "ambiguous_match" | "no_match" | "target_is_leader";
  missingFields?: string[]; // vd ["projectName", "effortMinutes"]
  candidates?: Array<{ id: string; label: string }>; // vd danh sách task/member trùng khớp để chọn
}

export type AiResponsePayload =
  | FormattedEntry
  | { answer: string }
  | { answer?: string; entry: FormattedEntry }
  | { answer?: string; proposal: TaskChangeProposal }
  | { answer: string; clarification: ClarificationRequest };

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
  | { role: "ai-entry"; id: string; chatLogId: string; entry: FormattedEntry; confirmed: boolean }
  | { role: "ai-proposal"; id: string; chatLogId: string; proposal: TaskChangeProposal; confirmed: boolean }
  | { role: "ai-clarification"; id: string; text: string; clarification: ClarificationRequest };
