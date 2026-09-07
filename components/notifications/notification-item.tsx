"use client";

import { Info, TriangleAlert, OctagonAlert, Check, Clock } from "lucide-react";
import { Token } from "@astryxdesign/core/Token";
import { Text } from "@astryxdesign/core/Text";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { markNotificationRead } from "@/services/notifications.service";
import type { Notification, NotificationSeverity } from "@/types/notification";

const severityConfig: Record<
  NotificationSeverity,
  { badgeColor: "red" | "orange" | "blue"; icon: typeof Info; iconColor: string }
> = {
  info: { badgeColor: "blue", icon: Info, iconColor: "text-sky-400" },
  warning: { badgeColor: "orange", icon: TriangleAlert, iconColor: "text-amber-400" },
  critical: { badgeColor: "red", icon: OctagonAlert, iconColor: "text-rose-400" },
};

export function NotificationItem({ notification }: { notification: Notification }): React.JSX.Element {
  const { badgeColor, icon: SeverityIcon, iconColor } = severityConfig[notification.severity] || severityConfig.info;

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
        notification.read
          ? "bg-white/[0.01] border-white/[0.04] opacity-70"
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className={`p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] ${iconColor} flex-shrink-0 mt-0.5`}>
          <SeverityIcon size={16} />
        </span>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-100 text-sm">{notification.title}</span>
            <Token label={notification.severity} color={badgeColor} size="sm" />
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </div>

          <Text type="supporting" size="sm">
            {notification.message}
          </Text>

          <div className="flex items-center gap-1 text-xs text-neutral-500 pt-0.5">
            <Clock size={12} />
            <Timestamp value={notification.createdAt} type="supporting" />
          </div>
        </div>
      </div>

      {!notification.read && (
        <button
          type="button"
          onClick={() => markNotificationRead(notification.id)}
          className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Check size={13} />
          <span>Đã đọc</span>
        </button>
      )}
    </div>
  );
}
