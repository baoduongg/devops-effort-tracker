export type NotificationType = "budget" | "overdue_task" | "other";
export type NotificationSeverity = "info" | "warning" | "critical";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  relatedProjectId: string | null;
  relatedTaskId?: string | null;
  relatedMemberId?: string | null;
  read: boolean;
  createdAt: string;
}

export type NotificationInput = Omit<Notification, "id" | "createdAt">;
