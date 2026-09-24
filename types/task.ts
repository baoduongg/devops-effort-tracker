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
  /** Approved infra deployment datetime (ISO). Alarm is off when null. */
  deployAt: string | null;
  /** Minutes before deployAt to fire the alarm. Only meaningful when deployAt is set. */
  reminderMinutesBefore: number | null;
  /** ISO timestamp of when the deploy alarm was sent, for dedup by the alarm cron. */
  alarmFiredAt: string | null;
}

export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;

export const REMINDER_PRESET_OPTIONS: { value: string; label: string }[] = [
  { value: "15", label: "15 phút trước" },
  { value: "30", label: "30 phút trước" },
  { value: "60", label: "60 phút trước" },
  { value: "custom", label: "Tùy chọn..." },
];
