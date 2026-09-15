import { useState } from "react";
import { updateTask } from "@/services/tasks.service";
import { updateMember } from "@/services/members.service";
import type { Task, TaskStatus } from "@/types/task";
import type { MemberStatus } from "@/types/member";

export function useTaskStatusUpdate(memberId: string | null | undefined, myTasks: Task[]) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  async function handleToggleStatus(task: Task, nextStatus: TaskStatus): Promise<void> {
    setUpdatingTaskId(task.id);
    try {
      await updateTask(task.id, { status: nextStatus });
      if (memberId) {
        const updatedTasks = myTasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t));
        const activeTasks = updatedTasks.filter((t) => t.status === "in_progress");
        const newTotalEffortMinutes = activeTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
        const newStatus: MemberStatus =
          activeTasks.length === 0 || newTotalEffortMinutes === 0
            ? "available"
            : newTotalEffortMinutes > 480
              ? "overloaded"
              : "busy";
        await updateMember(memberId, {
          effortMinutes: newTotalEffortMinutes,
          status: newStatus,
          currentTaskId: activeTasks[0]?.id || null,
        });
      }
    } catch (err) {
      console.error("Failed to update task status", err);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  return { updatingTaskId, handleToggleStatus };
}
