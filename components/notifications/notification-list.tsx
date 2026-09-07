import { BellOff } from "lucide-react";
import { List } from "@astryxdesign/core/List";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { NotificationItem } from "@/components/notifications/notification-item";
import type { Notification } from "@/types/notification";

export function NotificationList({ notifications }: { notifications: Notification[] }): React.JSX.Element {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Icon icon={BellOff} size="lg" />}
        title="You're all caught up"
        description="No notifications right now."
      />
    );
  }
  return (
    <List hasDividers>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </List>
  );
}
