"use client";

import { useEffect, useState } from "react";
import { VStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { subscribeNotifications } from "@/services/notifications.service";
import { NotificationList } from "@/components/notifications/notification-list";
import type { Notification } from "@/types/notification";

export default function NotificationsPage(): React.JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((next) => {
      setNotifications(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <VStack gap={8}>
      <VStack gap={1}>
        <Heading level={1}>Notifications</Heading>
        <Text type="supporting">Budget alerts and system updates for your team.</Text>
      </VStack>
      {loading ? (
        <VStack gap={3}>
          <Skeleton height={64} />
          <Skeleton height={64} />
          <Skeleton height={64} />
        </VStack>
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </VStack>
  );
}
