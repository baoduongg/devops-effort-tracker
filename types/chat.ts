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

export interface TaskSummaryItem {
  id?: string;
  title: string;
  memberName: string;
  duration: string;
  statusLabel: string;
  statusVariant: "in_progress" | "overdue" | "planned" | "done";
  projectName?: string;
}

export interface TaskListPayload {
  title?: string;
  tasks: TaskSummaryItem[];
  suggestedActions?: Array<{ label: string; slashCommand: string }>;
}

export interface OverloadMemberItem {
  name: string;
  role: string;
  effortMinutes: number;
  capacityMinutes: number;
  percentage: number;
  taskCount: number;
  taskTitles: string[];
  suggestedReassignTarget?: string | null;
}

export interface OverloadPayload {
  overloadedMembers: OverloadMemberItem[];
  suggestedActions?: Array<{ label: string; slashCommand: string }>;
}

export interface EffortMemberItem {
  name: string;
  effortMinutes: number;
  capacityMinutes: number;
  percentage: number;
  color?: string;
}

export interface EffortPayload {
  totalEffortMinutes: number;
  totalCapacityMinutes: number;
  overallPercentage: number;
  members: EffortMemberItem[];
}

export interface LoadMemberItem {
  name: string;
  role: string;
  effortMinutes: number;
  capacityMinutes: number;
  percentage: number;
  statusLabel: string;
  statusVariant: "free" | "normal" | "overload" | "busy";
}

export interface LoadPayload {
  members: LoadMemberItem[];
}

export interface ReportProjectItem {
  name: string;
  totalEffortMinutes: number;
  totalHours: string;
  activeTaskCount: number;
  doneTaskCount: number;
  assignedMembers: string[];
  warning?: string | null;
}

export interface ReportPayload {
  projects: ReportProjectItem[];
}

export interface OverdueTaskItem {
  title: string;
  projectName: string;
  memberName: string;
  endDate: string;
  daysOverdue: number;
}

export interface OverduePayload {
  tasks: OverdueTaskItem[];
}

export interface MembersListItem {
  id: string;
  name: string;
  role: string;
  effortMinutes: number;
  capacityMinutes: number;
  statusLabel: string;
  statusVariant: "free" | "normal" | "overload" | "busy";
  skills: string[];
}

export interface MembersListPayload {
  members: MembersListItem[];
}

export interface ProjectsListItem {
  name: string;
  totalEffortMinutes: number;
  totalHours: string;
  activeTaskCount: number;
  doneTaskCount: number;
  assignedMembers: string[];
}

export interface ProjectsListPayload {
  projects: ProjectsListItem[];
}

export interface HelpCommandItem {
  command: string;
  description: string;
}

export interface HelpPayload {
  categories?: Array<{
    name: string;
    commands: HelpCommandItem[];
  }>;
}

export interface MemberInfoPayload {
  name: string;
  role: string;
  position: string;
  effortMinutes: number;
  capacityMinutes: number;
  percentage: number;
  statusLabel: string;
  statusVariant: "free" | "normal" | "overload" | "busy";
  skills: string[];
  activeTasks: Array<{ title: string; project: string; duration: string }>;
  plannedTasks: Array<{ title: string; project: string; duration: string }>;
  projects: string[];
}

export interface MemberAvailability {
  members: Array<{
    id: string;
    name: string;
    role: "leader" | "devops";
    statusLabel: string;
    statusVariant: "success" | "warning" | "error";
    effortMinutes: number;
    capacityMinutes: number;
    skills: string[];
    activeTaskTitle: string | null;
  }>;
  suggestedActions: Array<{ label: string; slashCommand: string }>;
}

export type AiResponsePayload =
  | FormattedEntry
  | { answer: string }
  | { answer?: string; entry: FormattedEntry }
  | { answer?: string; proposal: TaskChangeProposal }
  | { answer: string; clarification: ClarificationRequest }
  | { answer: string; memberAvailability: MemberAvailability }
  | { answer: string; taskList: TaskListPayload }
  | { answer: string; overloadData: OverloadPayload }
  | { answer: string; effortData: EffortPayload }
  | { answer: string; loadData: LoadPayload }
  | { answer: string; reportData: ReportPayload }
  | { answer: string; overdueData: OverduePayload }
  | { answer: string; membersListData: MembersListPayload }
  | { answer: string; projectsListData: ProjectsListPayload }
  | { answer: string; helpData: HelpPayload }
  | { answer: string; memberInfoData: MemberInfoPayload };

export interface ChatLog {
  id: string;
  memberId: string;
  mode: ChatMode;
  threadId: string;
  rawInput: string | null;
  imageUrl: string | null;
  aiResponse: AiResponsePayload;
  confirmed: boolean;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  memberId: string;
  mode: ChatMode;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatMessage =
  | { role: "user"; id: string; text: string | null; imageUrl: string | null; command?: string; senderName?: string; time?: string }
  | { role: "ai-answer"; id: string; text: string; latency?: string }
  | { role: "ai-entry"; id: string; chatLogId: string; entry: FormattedEntry; confirmed: boolean }
  | { role: "ai-proposal"; id: string; chatLogId: string; proposal: TaskChangeProposal; confirmed: boolean }
  | { role: "ai-clarification"; id: string; text: string; clarification: ClarificationRequest }
  | { role: "ai-member-availability"; id: string; text: string; availability: MemberAvailability }
  | { role: "ai-task-list"; id: string; text: string; taskList: TaskListPayload }
  | { role: "ai-overload"; id: string; text: string; overloadData: OverloadPayload }
  | { role: "ai-effort"; id: string; text: string; effortData: EffortPayload }
  | { role: "ai-load"; id: string; text: string; loadData: LoadPayload }
  | { role: "ai-report"; id: string; text: string; reportData: ReportPayload }
  | { role: "ai-overdue"; id: string; text: string; overdueData: OverduePayload }
  | { role: "ai-members-list"; id: string; text: string; membersListData: MembersListPayload }
  | { role: "ai-projects-list"; id: string; text: string; projectsListData: ProjectsListPayload }
  | { role: "ai-help"; id: string; text: string; helpData: HelpPayload }
  | { role: "ai-member-info"; id: string; text: string; memberInfoData: MemberInfoPayload };

