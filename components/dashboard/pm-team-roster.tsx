import { Crown } from "lucide-react";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Badge } from "@astryxdesign/core/Badge";
import { StatusBadge } from "./status-badge";
import { isOverdue } from "@/lib/overdue";
import { formatEffortDuration, minutesToWorkdayPercent, getEffortStatus } from "@/lib/effort";
import type { Member } from "@/types/member";
import type { Task } from "@/types/task";

interface PMTeamRosterProps {
  members: Member[];
  tasks: Task[];
}

export function PMTeamRoster({ members, tasks }: PMTeamRosterProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.memberId === member.id);
        const inProgressTasks = memberTasks.filter((t) => t.status === "in_progress");
        const plannedTasks = memberTasks.filter((t) => t.status === "planned");
        const overdueCount = memberTasks.filter(isOverdue).length;
        const computedEffortMinutes = inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
        const bandwidth = getEffortStatus(computedEffortMinutes, inProgressTasks.length);
        const isLeader = member.role === "leader";

        return (
          <ClickableCard key={member.id} href={`/members/${member.id}`} label={member.name} elevation="low">
            <VStack gap={3}>
              <HStack gap={3} vAlign="center">
                <Avatar name={member.name} src={member.photoURL ?? undefined} size="md" tooltip={false} />
                <StackItem size="fill">
                  <Text weight="semibold" maxLines={1}>
                    {member.name}
                  </Text>
                  <Text type="supporting" size="sm" maxLines={1}>
                    {member.email}
                  </Text>
                </StackItem>
                <div className="shrink-0">
                  <StatusBadge status={bandwidth.status} />
                </div>
              </HStack>

              <ProgressBar
                label={bandwidth.label}
                value={Math.min(minutesToWorkdayPercent(computedEffortMinutes), 100)}
                hasValueLabel
                formatValueLabel={() => formatEffortDuration(computedEffortMinutes)}
                variant={bandwidth.variant}
              />

              <HStack gap={1.5} wrap="wrap">
                {isLeader && <Badge label="Leader" icon={<Crown size={11} />} variant="yellow" />}
                {member.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} label={skill} variant="neutral" />
                ))}
                {member.skills.length > 3 && (
                  <Text type="supporting" size="sm">
                    +{member.skills.length - 3}
                  </Text>
                )}
              </HStack>

              <HStack gap={3} vAlign="center" className="pt-1 border-t border-border">
                <Text type="code" size="sm" color="secondary">
                  {inProgressTasks.length} đang làm
                </Text>
                <Text type="code" size="sm" color="secondary">
                  {plannedTasks.length} kế hoạch
                </Text>
                {overdueCount > 0 && (
                  <Text type="code" size="sm" className="text-error">
                    {overdueCount} trễ hạn
                  </Text>
                )}
              </HStack>
            </VStack>
          </ClickableCard>
        );
      })}
    </div>
  );
}
