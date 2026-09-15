import { useEffect } from "react";
import { createNotification } from "@/services/notifications.service";
import { notifyTaskOverdue } from "@/services/chatops.service";
import { daysOverdue } from "@/lib/overdue";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { Notification } from "@/types/notification";

export function useOverdueNotifications(
  overdueTasks: Task[],
  projectsLoaded: boolean,
  members: Member[],
  projects: Project[],
  notifications: Notification[]
): void {
  useEffect(() => {
    if (!projectsLoaded) return;
    if (overdueTasks.length === 0) return;
    const alreadyNotified = new Set(
      notifications.filter((n) => n.type === "overdue_task").map((n) => n.relatedTaskId)
    );
    overdueTasks.forEach((task) => {
      if (alreadyNotified.has(task.id)) return;
      const member = members.find((m) => m.id === task.memberId);
      const project = projects.find((p) => p.id === task.projectId);
      const overdueDays = daysOverdue(task.endDate as string);
      const dueDate = new Date(task.endDate as string);
      const formattedDate = `${String(dueDate.getDate()).padStart(2, "0")}/${String(
        dueDate.getMonth() + 1
      ).padStart(2, "0")}/${dueDate.getFullYear()}`;
      createNotification(
        {
          type: "overdue_task",
          title: `${task.title} đã quá hạn`,
          message: `${member?.name ?? "Unassigned"} — ${project?.name ?? "No project"} — trễ ${overdueDays} ngày (hạn ${formattedDate})`,
          severity: "warning",
          relatedProjectId: task.projectId,
          relatedTaskId: task.id,
          relatedMemberId: task.memberId,
          read: false,
        },
        `overdue_task_${task.id}`
      );
      notifyTaskOverdue({
        title: task.title,
        memberName: member?.name ?? "Unassigned",
        memberEmail: member?.email,
        projectName: project?.name ?? "No project",
        overdueDays,
        dueDate: formattedDate,
        link: `${window.location.origin}/tasks`,
      });
    });
  }, [overdueTasks, projectsLoaded, members, projects, notifications]);
}
