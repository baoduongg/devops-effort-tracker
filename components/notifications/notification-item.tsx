import { Info, TriangleAlert, OctagonAlert } from "lucide-react";
import { ListItem } from "@astryxdesign/core/List";
import { Icon } from "@astryxdesign/core/Icon";
import { Token } from "@astryxdesign/core/Token";
import { Text } from "@astryxdesign/core/Text";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import type { Notification, NotificationSeverity } from "@/types/notification";

const severityConfig: Record<NotificationSeverity, { color: "accent" | "warning" | "error"; icon: typeof Info }> = {
  info: { color: "accent", icon: Info },
  warning: { color: "warning", icon: TriangleAlert },
  critical: { color: "error", icon: OctagonAlert },
};

export function NotificationItem({ notification }: { notification: Notification }): React.JSX.Element {
  const { color, icon } = severityConfig[notification.severity];
  return (
    <ListItem
      isDisabled={notification.read}
      startContent={<Icon icon={icon} color={color} />}
      label={notification.title}
      endContent={<Token label={notification.severity} size="sm" />}
      description={
        <VStack gap={0.5}>
          <Text type="supporting">{notification.message}</Text>
          <HStack>
            <Timestamp value={notification.createdAt} type="supporting" />
          </HStack>
        </VStack>
      }
    />
  );
}
