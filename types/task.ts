export type TaskStatus = "planned" | "in_progress" | "done";
export type TaskSource = "manual" | "ai_chat";

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "in_progress", label: "Đang thực hiện (In Progress)" },
  { value: "planned", label: "Kế hoạch (Planned)" },
  { value: "done", label: "Hoàn thành (Done)" },
];

export interface Task {
  id: string;
  memberId: string;
  projectId: string;
  title: string;
  description: string;
  effortMinutes: number;
  status: TaskStatus;
  startDate: string;
  endDate: string | null;
  source: TaskSource;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
