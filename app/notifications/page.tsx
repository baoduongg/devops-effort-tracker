"use client";

import { useEffect, useState, useMemo } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { subscribeNotifications, markAllNotificationsRead } from "@/services/notifications.service";
import { useAuthStore } from "@/store/auth.store";
import { NotificationList } from "@/components/notifications/notification-list";
import type { Notification } from "@/types/notification";

type FilterTab = "all" | "mine" | "unread" | "overdue";

export default function NotificationsPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((next) => {
      setNotifications(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const myNotificationsCount = useMemo(
    () => notifications.filter((n) => n.relatedMemberId === user?.memberId).length,
    [notifications, user?.memberId]
  );

  const filteredNotifications = useMemo(() => {
    if (tab === "mine") {
      return notifications.filter((n) => n.relatedMemberId === user?.memberId);
    }
    if (tab === "unread") {
      return notifications.filter((n) => !n.read);
    }
    if (tab === "overdue") {
      return notifications.filter((n) => n.type === "overdue_task");
    }
    return notifications;
  }, [notifications, tab, user?.memberId]);


  async function handleMarkAllRead(): Promise<void> {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(unreadIds);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <VStack gap={5}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bell size={16} />
            </span>
            <Heading level={1}>Notifications & Alerts</Heading>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {unreadCount} mới
              </span>
            )}
          </div>
          <Text type="supporting">
            Cảnh báo tự động về các task quá hạn, thay đổi phân bổ và cập nhật trạng thái của team.
          </Text>
        </div>

        <HStack gap={2} vAlign="center">
          <SegmentedControl
            label="Lọc thông báo"
            value={tab}
            onChange={(v) => setTab(v as FilterTab)}
          >
            <SegmentedControlItem value="all" label="Tất cả" />
            {user?.memberId && (
              <SegmentedControlItem
                value="mine"
                label={`Của tôi (${myNotificationsCount})`}
              />
            )}
            <SegmentedControlItem value="unread" label={`Chưa đọc (${unreadCount})`} />
            <SegmentedControlItem value="overdue" label="Trễ hạn" />
          </SegmentedControl>


          {unreadCount > 0 && (
            <Button
              label={markingAll ? "Đang xử lý..." : "Đọc tất cả"}
              icon={<CheckCheck size={14} />}
              variant="ghost"
              onClick={handleMarkAllRead}
              isDisabled={markingAll}
            />
          )}
        </HStack>
      </div>

      {loading ? (
        <VStack gap={3}>
          <Skeleton height={72} />
          <Skeleton height={72} />
          <Skeleton height={72} />
        </VStack>
      ) : (
        <NotificationList notifications={filteredNotifications} />
      )}
    </VStack>
  );
}
