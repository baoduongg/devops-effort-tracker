import React from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Calendar } from "lucide-react";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Token } from "@astryxdesign/core/Token";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatEffortDuration, formatTaskEffort, minutesToWorkdayPercent } from "@/lib/effort";
import type { Member, MemberStatus } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface WorkloadMatrixProps {
  members: Member[];
  tasks: Task[];
  projects: Project[];
}

// Thresholds scaled from an 8h/480m workday (100% = 480m, 80% = 384m, 50% = 240m)
function getEffortStatus(effortMinutes: number): {
  status: MemberStatus;
  label: string;
  dotVariant: "success" | "warning" | "error";
} {
  if (effortMinutes > 480) {
    return {
      status: "overloaded",
      label: "Overloaded (>8h)",
      dotVariant: "error",
    };
  }
  if (effortMinutes >= 384) {
    return {
      status: "busy",
      label: "Busy (6.4h-8h)",
      dotVariant: "warning",
    };
  }
  if (effortMinutes >= 240) {
    return {
      status: "busy",
      label: "Balanced (4h-6.4h)",
      dotVariant: "success",
    };
  }
  return {
    status: "available",
    label: "Available (<4h)",
    dotVariant: "success",
  };
}

function formatDaysRemaining(dateStr: string | null): string {
  if (!dateStr) return "";
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays}d`;
}

export function WorkloadMatrix({ members, tasks, projects }: WorkloadMatrixProps): React.JSX.Element {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <VStack gap={4}>
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.memberId === member.id);
        const inProgressTasks = memberTasks.filter((t) => t.status === "in_progress");
        const plannedTasks = memberTasks.filter((t) => t.status === "planned");
        const doneTasks = memberTasks
          .filter((t) => t.status === "done")
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3);

        // Dynamically compute effort from active tasks
        const computedEffortMinutes = inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
        const effortInfo = getEffortStatus(computedEffortMinutes);

        return (
          <Card key={member.id} elevation="low">
            <VStack gap={4}>
              {/* Member Header Row */}
              <HStack gap={4} vAlign="center">
                <Avatar name={member.name} src={member.photoURL ?? undefined} size="md" tooltip={false} />
                <StackItem size="fill">
                  <VStack gap={1}>
                    <HStack gap={2} vAlign="center">

                      <Link href={`/members/${member.id}`} className="hover:underline">
                        <Text weight="semibold" size="base">
                          {member.name}
                        </Text>
                      </Link>
                      <StatusBadge status={effortInfo.status} />
                    </HStack>
                    <HStack gap={2} vAlign="center">
                      <Text type="supporting">
                        {member.email}
                      </Text>
                      <Text type="supporting">•</Text>
                      <HStack gap={1}>
                        {member.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs rounded-md bg-white/5 border border-white/10 text-neutral-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 text-xs rounded-md bg-white/5 text-neutral-400">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </HStack>
                    </HStack>
                  </VStack>
                </StackItem>

                {/* Overall Effort Meter */}
                <Token
                  label={`${formatEffortDuration(computedEffortMinutes)} Bandwidth (${effortInfo.label})`}
                  icon={<StatusDot variant={effortInfo.dotVariant} label={effortInfo.label} />}
                />

                <Button
                  label="Profile"
                  icon={<ArrowUpRight size={15} strokeWidth={2} />}
                  variant="ghost"
                  href={`/members/${member.id}`}
                />
              </HStack>

              {/* Workload Progress Breakdown Bar */}
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden flex">
                {inProgressTasks.map((task) => {
                  const project = projectMap.get(task.projectId);
                  const color = project?.color ?? "#3b82f6";
                  const widthPercent = Math.min(minutesToWorkdayPercent(task.effortMinutes), 100);
                  return (
                    <div
                      key={task.id}
                      title={`${task.title} (${project?.name ?? "Project"}): ${formatTaskEffort(task)}`}
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: color,
                      }}
                      className="h-full border-r border-neutral-900 transition-all duration-300"
                    />
                  );
                })}
              </div>

              {/* Two-Column Task Grid: Active Doing vs. Upcoming Plan */}
              <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
                {/* Active in-progress tasks */}
                <Card elevation="low">
                  <VStack gap={3}>
                    <HStack gap={2} vAlign="center">
                      <Clock size={15} className="text-sky-400" />
                      <Text weight="semibold" size="sm">
                        Active Tasks ({inProgressTasks.length})
                      </Text>
                    </HStack>

                    {inProgressTasks.length === 0 ? (
                      <div className="py-3 text-center">
                        <Text type="supporting">
                          No tasks in progress. Member has 100% free bandwidth.
                        </Text>
                      </div>
                    ) : (
                      <VStack gap={2}>
                        {inProgressTasks.map((task) => {
                          const project = projectMap.get(task.projectId);
                          const dueText = formatDaysRemaining(task.endDate);
                          return (
                            <div
                              key={task.id}
                              className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <HStack gap={2} vAlign="center">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: project?.color ?? "#3b82f6" }}
                                  />
                                  <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                    style={{
                                      backgroundColor: `${project?.color ?? "#3b82f6"}25`,
                                      color: project?.color ?? "#93c5fd",
                                    }}
                                  >
                                    {project?.name ?? "General"}
                                  </span>
                                  <Text weight="medium" size="sm" maxLines={1}>
                                    {task.title}
                                  </Text>
                                </HStack>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                  {formatTaskEffort(task)}
                                </span>
                              </div>

                              {task.description && (
                                <Text type="supporting" maxLines={1}>
                                  {task.description}
                                </Text>
                              )}

                              {dueText && (
                                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                  <Calendar size={12} />
                                  <span>{dueText}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </VStack>
                    )}
                  </VStack>
                </Card>

                {/* Upcoming Planned Tasks */}
                <Card elevation="low">
                  <VStack gap={3}>
                    <HStack gap={2} vAlign="center">
                      <Calendar size={15} className="text-purple-400" />
                      <Text weight="semibold" size="sm">
                        Upcoming Plan ({plannedTasks.length})
                      </Text>
                    </HStack>

                    {plannedTasks.length === 0 ? (
                      <div className="py-3 text-center">
                        <Text type="supporting">
                          No planned tasks queued. Good time to schedule next sprint.
                        </Text>
                      </div>
                    ) : (
                      <VStack gap={2}>
                        {plannedTasks.map((task) => {
                          const project = projectMap.get(task.projectId);
                          return (
                            <div
                              key={task.id}
                              className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <HStack gap={2} vAlign="center">
                                  <span
                                    className="w-2 h-2 rounded-full flex-shrink-0 opacity-70"
                                    style={{ backgroundColor: project?.color ?? "#9333ea" }}
                                  />
                                  <span className="text-xs text-neutral-300 font-medium">
                                    {project?.name ?? "General"}
                                  </span>
                                  <Text size="sm" maxLines={1} className="text-neutral-200">
                                    {task.title}
                                  </Text>
                                </HStack>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                                  {formatTaskEffort(task)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                <Clock size={12} />
                                <span>Starts {new Date(task.startDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </VStack>
                    )}
                  </VStack>
                </Card>
              </Grid>

              {doneTasks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                  <Text type="supporting">Recently done:</Text>
                  {doneTasks.map((task) => {
                    const project = projectMap.get(task.projectId);
                    return (
                      <span
                        key={task.id}
                        className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        title={project?.name ?? "General"}
                      >
                        ✓ {task.title}
                      </span>
                    );
                  })}
                </div>
              )}
            </VStack>
          </Card>
        );
      })}
    </VStack>
  );
}
