import React from "react";
import Link from "next/link";
import { FolderGit2, Users, Layers, CheckCircle2, Clock } from "lucide-react";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Card } from "@astryxdesign/core/Card";
import { formatTaskEffort, formatEffortDuration } from "@/lib/effort";
import { getProjectColor } from "@/lib/project-colors";
import type { Member } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface ProjectAllocationGridProps {
  projects: Project[];
  tasks: Task[];
  members: Member[];
}

export function ProjectAllocationGrid({ projects, tasks, members }: ProjectAllocationGridProps): React.JSX.Element {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => {
        const projectTasks = tasks.filter((t) => t.projectId === project.id);
        const activeTasks = projectTasks.filter((t) => t.status !== "done");

        const totalEffortMinutes = activeTasks.reduce((sum, t) => sum + t.effortMinutes, 0);

        // Find unique members contributing to this project and their subtotal effort
        const memberEffortMap = new Map<string, number>();
        activeTasks.forEach((t) => {
          memberEffortMap.set(t.memberId, (memberEffortMap.get(t.memberId) ?? 0) + t.effortMinutes);
        });

        const assignedMembers = Array.from(memberEffortMap.entries()).map(([memberId, effort]) => ({
          member: memberMap.get(memberId),
          effort,
        }));

        const projColor = getProjectColor(project.color);

        return (
          <Card key={project.id} elevation="low">
            <VStack gap={4}>
              {/* Project Header */}
              <div className="flex items-start justify-between gap-3">
                <HStack gap={3} vAlign="center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0"
                    style={{ backgroundColor: `${projColor}20`, border: `1px solid ${projColor}40` }}
                  >
                    <FolderGit2 size={18} style={{ color: projColor }} />
                  </div>
                  <div className="min-w-0">
                    <Text weight="bold" size="base">
                      {project.name}
                    </Text>
                    <Text type="supporting" maxLines={1}>
                      {project.description || "Chưa có mô tả dự án"}
                    </Text>
                  </div>
                </HStack>

                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0"
                  style={{
                    backgroundColor: `${projColor}15`,
                    color: projColor,
                    border: `1px solid ${projColor}35`,
                  }}
                >
                  <Layers size={12} />
                  <span>{formatEffortDuration(totalEffortMinutes)} Effort</span>
                </div>
              </div>

              {/* Assigned DevOps Engineers */}
              <div className="bg-surface p-3 rounded-xl border border-border flex flex-col gap-2">
                <HStack gap={1} vAlign="center">
                  <Users size={13} className="text-secondary" />
                  <Text type="supporting" size="xsm" className="font-semibold">
                    Nhân sự phân bổ ({assignedMembers.length})
                  </Text>
                </HStack>

                {assignedMembers.length === 0 ? (
                  <Text type="supporting" size="xsm" className="text-disabled italic">
                    Chưa có nhân sự DevOps nào được gán task.
                  </Text>
                ) : (
                  <VStack gap={1.5}>
                    {assignedMembers.map(({ member, effort }) => {
                      if (!member) return null;
                      return (
                        <HStack key={member.id} gap={2} vAlign="center" className="text-xs py-0.5">
                          <Avatar name={member.name} src={member.photoURL ?? undefined} size="xsm" tooltip={false} />
                          <StackItem size="fill">
                            <Link href={`/members/${member.id}`} className="hover:underline text-primary">
                              {member.name}
                            </Link>
                          </StackItem>
                          <span className="font-semibold text-accent">{formatEffortDuration(effort)} effort</span>
                        </HStack>
                      );
                    })}
                  </VStack>
                )}
              </div>

              {/* Tasks List */}
              <VStack gap={2}>
                <Text type="supporting" size="xsm" className="font-semibold uppercase tracking-wider">
                  Nhiệm vụ dự án
                </Text>

                {projectTasks.length === 0 ? (
                  <Text type="supporting" size="xsm" className="text-disabled italic">
                    Chưa có task nào được ghi nhận cho dự án này.
                  </Text>
                ) : (
                  <VStack gap={1.5}>
                    {projectTasks.slice(0, 3).map((task) => {
                      const assignee = memberMap.get(task.memberId);
                      const isDone = task.status === "done";
                      const isPlanned = task.status === "planned";

                      return (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            {isDone ? (
                              <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                            ) : isPlanned ? (
                              <Clock size={13} className="text-purple-400 flex-shrink-0" />
                            ) : (
                              // ponytail: project color has no Astryx StatusDot support (semantic variants only) — sanctioned hand-rolled dot, same exception as pm-team-roster.tsx
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: projColor }}
                              />
                            )}
                            <span className="truncate text-primary">{task.title}</span>
                          </div>
                          <span className="text-secondary text-[11px] ml-2 flex-shrink-0">
                            {assignee?.name.split(" ")[0] ?? "Unassigned"} ({formatTaskEffort(task)})
                          </span>
                        </div>
                      );
                    })}
                    {projectTasks.length > 3 && (
                      <Text type="supporting" size="xsm" className="text-center pt-1">
                        +{projectTasks.length - 3} task khác
                      </Text>
                    )}
                  </VStack>
                )}
              </VStack>
            </VStack>
          </Card>
        );
      })}
    </div>
  );
}
