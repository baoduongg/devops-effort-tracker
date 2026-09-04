"use client";

import { useEffect, useState } from "react";
import { subscribeNotifications } from "@/services/notifications.service";
import { NotificationList } from "@/components/notifications/notification-list";
import type { Notification } from "@/types/notification";

export default function NotificationsPage(): React.JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeNotifications(setNotifications);
    return () => unsubscribe();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <NotificationList notifications={notifications} />
    </div>
  );
}
