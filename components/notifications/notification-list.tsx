"use client";

import { BellOff } from "lucide-react";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { NotificationItem } from "@/components/notifications/notification-item";
import type { Notification } from "@/types/notification";

export function NotificationList({ notifications }: { notifications: Notification[] }): React.JSX.Element {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Icon icon={BellOff} size="lg" />}
        title="Không có thông báo mới"
        description="Mọi thứ đang hoạt động ổn định và đúng tiến độ."
      />
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}
