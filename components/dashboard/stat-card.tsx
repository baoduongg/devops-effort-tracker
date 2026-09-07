import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive";
}

const toneColor: Record<NonNullable<StatCardProps["tone"]>, "accent" | "success" | "warning" | "error"> = {
  primary: "accent",
  success: "success",
  warning: "warning",
  destructive: "error",
};

export function StatCard({ label, value, icon, tone = "primary" }: StatCardProps): React.JSX.Element {
  return (
    <Card>
      <HStack gap={4} vAlign="center">
        <Icon icon={icon} size="lg" color={toneColor[tone]} />
        <VStack gap={0.5}>
          <Text type="display-3" hasTabularNumbers weight="semibold">
            {value}
          </Text>
          <Text type="supporting">{label}</Text>
        </VStack>
      </HStack>
    </Card>
  );
}
