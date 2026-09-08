export type TaskStatus = "planned" | "in_progress" | "done";
export type TaskSource = "manual" | "ai_chat";

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
