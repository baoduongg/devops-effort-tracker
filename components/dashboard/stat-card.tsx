import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Stack";
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

const toneTileClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-accent/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-error/10",
};

export function StatCard({ label, value, icon, tone = "primary" }: StatCardProps): React.JSX.Element {
  return (
    <Card>
      <VStack gap={3}>
        <div className={`p-1.5 rounded-lg w-fit ${toneTileClass[tone]}`}>
          <Icon icon={icon} size="md" color={toneColor[tone]} />
        </div>
        <VStack gap={1}>
          <Text type="display-3" hasTabularNumbers weight="semibold">

            {value}
          </Text>
          <Text type="supporting">{label}</Text>
        </VStack>
      </VStack>
    </Card>
  );
}
