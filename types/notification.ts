export type NotificationType = "budget" | "other";
export type NotificationSeverity = "info" | "warning" | "critical";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  relatedProjectId: string | null;
  read: boolean;
  createdAt: string;
}
