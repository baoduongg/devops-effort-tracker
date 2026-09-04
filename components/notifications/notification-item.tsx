import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Notification, NotificationSeverity } from "@/types/notification";

const severityStyles: Record<NotificationSeverity, string> = {
  info: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  warning: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  critical: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function NotificationItem({ notification }: { notification: Notification }): React.JSX.Element {
  return (
    <div className={cn("rounded-md border p-3", notification.read && "opacity-60")}>
      <div className="flex items-center justify-between">
        <p className="font-medium">{notification.title}</p>
        <Badge className={severityStyles[notification.severity]}>{notification.severity}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{notification.message}</p>
      <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
    </div>
  );
}
