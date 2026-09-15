import type { Task, TaskStatus } from "@/types/task";
import { isOverdue, daysOverdue } from "@/lib/overdue";

/** Fill color for a Gantt task bar, keyed by status. Overdue (non-done, past deadline) overrides to red. */
export const STATUS_BAR_COLOR: Record<TaskStatus, string> = {
  in_progress: "#38bdf8",
  planned: "#a855f7",
  done: "#34d399",
};
const OVERDUE_BAR_COLOR = "#f87171";

export function getTaskStatusColor(task: Task): string {
  if (task.status !== "done" && isOverdue(task)) return OVERDUE_BAR_COLOR;
  return STATUS_BAR_COLOR[task.status];
}

export interface GanttTaskVisual {
  gradient: string;
  border: string;
  shadow: string;
  isOverdue: boolean;
  overdueDays: number;
}

export function getGanttTaskStyle(task: Task): GanttTaskVisual {
  const isDone = task.status === "done";
  const overdue = !isDone && isOverdue(task);
  const overdueDays = overdue && task.endDate ? daysOverdue(task.endDate) : 0;

  if (overdue) {
    return {
      gradient: "from-rose-500/90 to-amber-600/90",
      border: "border-rose-400/60",
      shadow: "shadow-[0_2px_12px_rgba(244,63,94,0.35)]",
      isOverdue: true,
      overdueDays,
    };
  }

  if (task.status === "in_progress") {
    return {
      gradient: "from-sky-500/90 to-blue-600/90",
      border: "border-sky-400/50",
      shadow: "shadow-[0_2px_12px_rgba(56,189,248,0.3)]",
      isOverdue: false,
      overdueDays: 0,
    };
  }

  if (task.status === "planned") {
    return {
      gradient: "from-purple-500/85 to-indigo-600/85",
      border: "border-purple-400/50",
      shadow: "shadow-[0_2px_12px_rgba(168,85,247,0.3)]",
      isOverdue: false,
      overdueDays: 0,
    };
  }

  // Done
  return {
    gradient: "from-emerald-500/85 to-teal-600/85",
    border: "border-emerald-400/50",
    shadow: "shadow-[0_2px_12px_rgba(16,185,129,0.3)]",
    isOverdue: false,
    overdueDays: 0,
  };
}
