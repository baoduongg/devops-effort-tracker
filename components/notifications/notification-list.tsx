import { NotificationItem } from "@/components/notifications/notification-item";
import type { Notification } from "@/types/notification";

export function NotificationList({ notifications }: { notifications: Notification[] }): React.JSX.Element {
  if (notifications.length === 0) {
    return <p className="text-muted-foreground">No notifications.</p>;
  }
  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}
