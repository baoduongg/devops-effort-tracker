import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Calendar,
  AlertCircle,
  UserCheck,
  Crown,
  Cpu,
} from "lucide-react";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Badge } from "@astryxdesign/core/Badge";
import { StatusBadge } from "./status-badge";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort, formatEffortDuration, minutesToWorkdayPercent } from "@/lib/effort";
import { getProjectColor } from "@/lib/project-colors";
import type { Member, MemberStatus } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface PMTeamRosterProps {
  members: Member[];
  tasks: Task[];
  projects: Project[];
}

// Thresholds scaled from an 8h/480m workday
function getMemberBandwidthInfo(effortMinutes: number, activeTasksCount: number): {
  status: MemberStatus;
  label: string;
} {
  const durationStr = formatEffortDuration(effortMinutes);
  if (activeTasksCount === 0 || effortMinutes === 0) {
    return { status: "available", label: "Trống việc (rảnh)" };
  }
  if (effortMinutes > 480) {
    return { status: "overloaded", label: `Quá tải ${durationStr}` };
  }
  if (effortMinutes >= 384) {
    return { status: "busy", label: `Bận ${durationStr}` };
  }
  if (effortMinutes >= 240) {
    return { status: "busy", label: `Vừa tải ${durationStr}` };
  }
  return { status: "busy", label: `Đang làm ${durationStr}` };
}

function formatTaskDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const effortVariant: Record<MemberStatus, "success" | "warning" | "error"> = {
  available: "success",
  busy: "warning",
  overloaded: "error",
};

export function PMTeamRoster({ members, tasks, projects }: PMTeamRosterProps): React.JSX.Element {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <VStack gap={3}>
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.memberId === member.id);
        const inProgressTasks = memberTasks.filter((t) => t.status === "in_progress");
        const plannedTasks = memberTasks.filter((t) => t.status === "planned");
        const computedEffortMinutes = inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
        const bandwidth = getMemberBandwidthInfo(computedEffortMinutes, inProgressTasks.length);
        const isLeader = member.role === "leader";

        return (
          <Card key={member.id} elevation="low">
            <VStack gap={3}>
              <HStack gap={3} vAlign="center" wrap="wrap">
                <Avatar name={member.name} src={member.photoURL ?? undefined} size="md" tooltip={false} />
                <StackItem size="fill">
                  <VStack gap={1}>
                    <Link href={`/members/${member.id}`}>
                      <Text weight="semibold" size="base">
                        {member.name}
                      </Text>
                    </Link>
                    <HStack gap={1.5} vAlign="center" wrap="wrap">
                      <Badge label={isLeader ? "Leader" : "DevOps"} icon={isLeader ? <Crown size={11} /> : <Cpu size={11} />} variant={isLeader ? "yellow" : "neutral"} />
                      <StatusBadge status={bandwidth.status} />
                      {member.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} label={skill} variant="neutral" />
                      ))}
                      {member.skills.length > 3 && (
                        <Text type="supporting" size="xsm">
                          +{member.skills.length - 3}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </StackItem>
                <Button label="Chi tiết" icon={<ArrowUpRight size={14} />} variant="ghost" href={`/members/${member.id}`} />
              </HStack>

              <ProgressBar
                label={bandwidth.label}
                value={Math.min(minutesToWorkdayPercent(computedEffortMinutes), 100)}
                variant={effortVariant[bandwidth.status]}
              />

              <HStack gap={4} wrap="wrap">
                <StackItem size="fill">
                  <VStack gap={1.5}>
                    <HStack gap={1.5} vAlign="center">
                      <Clock size={13} className="text-accent" />
                      <Text type="supporting" size="xsm" className="uppercase tracking-wide">
                        Đang làm ({inProgressTasks.length})
                      </Text>
                    </HStack>
                    {inProgressTasks.length === 0 ? (
                      <HStack gap={2} vAlign="center" className="py-2 px-3 rounded-lg bg-success/10 border border-success/25">
                        <UserCheck size={14} className="text-success" />
                        <Text size="xsm" className="text-success">Đang trống task — Sẵn sàng nhận việc</Text>
                      </HStack>
                    ) : (
                      <VStack gap={1.5}>
                        {inProgressTasks.map((task) => {
                          const project = projectMap.get(task.projectId);
                          const overdue = isOverdue(task);
                          const overdueDaysCount = overdue ? daysOverdue(task.endDate as string) : 0;
                          return (
                            <HStack key={task.id} gap={2} vAlign="center" className={`p-2 rounded-lg border text-xs ${overdue ? "bg-error/10 border-error/30" : "bg-surface border-border"}`}>
                              <Badge label={project?.name ?? "General"} variant="neutral" />
                              <StackItem size="fill">
                                <Text size="xsm" maxLines={1}>{task.title}</Text>
                              </StackItem>
                              {overdue ? (
                                <Badge label={`Trễ ${overdueDaysCount}d`} icon={<AlertCircle size={11} />} variant="error" />
                              ) : task.endDate ? (
                                <Text type="supporting" size="xsm">Hạn {formatTaskDate(task.endDate)}</Text>
                              ) : null}
                              <Badge label={formatTaskEffort(task)} variant="blue" />
                            </HStack>
                          );
                        })}
                      </VStack>
                    )}
                  </VStack>
                </StackItem>

                <StackItem size="fill">
                  <VStack gap={1.5}>
                    <HStack gap={1.5} vAlign="center">
                      <Calendar size={13} className="text-purple-400" />
                      <Text type="supporting" size="xsm" className="uppercase tracking-wide">
                        Kế hoạch ({plannedTasks.length})
                      </Text>
                    </HStack>
                    {plannedTasks.length === 0 ? (
                      <Text type="supporting" size="xsm">Chưa có plan tiếp theo</Text>
                    ) : (
                      <VStack gap={1.5}>
                        {plannedTasks.slice(0, 2).map((task) => {
                          const project = projectMap.get(task.projectId);
                          const projColor = getProjectColor(project?.color);
                          return (
                            <HStack key={task.id} gap={1.5} vAlign="center" className="p-1.5 px-2 rounded-lg bg-surface border border-border text-xs">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: projColor }} />
                              <StackItem size="fill">
                                <Text size="xsm" maxLines={1}>{task.title}</Text>
                              </StackItem>
                              <Text type="supporting" size="xsm">Từ {formatTaskDate(task.startDate)}</Text>
                              <Badge label={formatTaskEffort(task)} variant="purple" />
                            </HStack>
                          );
                        })}
                        {plannedTasks.length > 2 && (
                          <Text type="supporting" size="xsm">+{plannedTasks.length - 2} task khác</Text>
                        )}
                      </VStack>
                    )}
                  </VStack>
                </StackItem>
              </HStack>
            </VStack>
          </Card>
        );
      })}
    </VStack>
  );
}
