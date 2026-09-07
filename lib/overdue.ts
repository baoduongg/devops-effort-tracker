import type { Task } from "@/types/task";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Full calendar days elapsed since `endDate` (0 = today, negative = future). */
export function daysOverdue(endDate: string): number {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(endDate));
  return Math.floor((today.getTime() - due.getTime()) / MS_PER_DAY);
}

/** F-01: endDate has passed (strictly before today) and status isn't done. */
export function isOverdue(task: Task): boolean {
  if (!task.endDate || task.status === "done") return false;
  return daysOverdue(task.endDate) > 0;
}
