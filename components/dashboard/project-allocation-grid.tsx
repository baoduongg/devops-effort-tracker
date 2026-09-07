import React from "react";
import Link from "next/link";
import { FolderGit2, Users, Layers, CheckCircle2, Clock } from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Card } from "@astryxdesign/core/Card";
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

        const totalEffort = activeTasks.reduce((sum, t) => sum + t.effortPercent, 0);

        // Find unique members contributing to this project and their subtotal effort
        const memberEffortMap = new Map<string, number>();
        activeTasks.forEach((t) => {
          memberEffortMap.set(t.memberId, (memberEffortMap.get(t.memberId) ?? 0) + t.effortPercent);
        });

        const assignedMembers = Array.from(memberEffortMap.entries()).map(([memberId, effort]) => ({
          member: memberMap.get(memberId),
          effort,
        }));

        const projColor = project.color || "#38bdf8";

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
                  <span>{totalEffort}% Effort</span>
                </div>
              </div>

              {/* Assigned DevOps Engineers */}
              <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <HStack gap={1} vAlign="center">
                    <Users size={13} className="text-neutral-400" />

                    <span className="text-xs font-semibold text-neutral-300">
                      Nhân sự phân bổ ({assignedMembers.length})
                    </span>
                  </HStack>
                </div>

                {assignedMembers.length === 0 ? (
                  <span className="text-xs text-neutral-500 italic">
                    Chưa có nhân sự DevOps nào được gán task.
                  </span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {assignedMembers.map(({ member, effort }) => {
                      if (!member) return null;
                      return (
                        <div key={member.id} className="flex items-center justify-between text-xs py-0.5">
                          <HStack gap={2} vAlign="center">
                            <Avatar name={member.name} src={member.photoURL ?? undefined} size="xsm" tooltip={false} />
                            <Link href={`/members/${member.id}`} className="hover:underline text-neutral-200">
                              {member.name}
                            </Link>
                          </HStack>
                          <span className="font-semibold text-sky-400">{effort}% effort</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Nhiệm vụ dự án
                </span>

                {projectTasks.length === 0 ? (
                  <span className="text-xs text-neutral-500 italic">
                    Chưa có task nào được ghi nhận cho dự án này.
                  </span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {projectTasks.slice(0, 3).map((task) => {
                      const assignee = memberMap.get(task.memberId);
                      const isDone = task.status === "done";
                      const isPlanned = task.status === "planned";

                      return (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            {isDone ? (
                              <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                            ) : isPlanned ? (
                              <Clock size={13} className="text-purple-400 flex-shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                            )}
                            <span className="truncate text-neutral-200">{task.title}</span>
                          </div>
                          <span className="text-neutral-400 text-[11px] ml-2 flex-shrink-0">
                            {assignee?.name.split(" ")[0] ?? "Unassigned"} ({task.effortPercent}%)
                          </span>
                        </div>
                      );
                    })}
                    {projectTasks.length > 3 && (
                      <span className="text-center text-[11px] text-neutral-400 pt-1">
                        +{projectTasks.length - 3} task khác
                      </span>
                    )}
                  </div>
                )}
              </div>
            </VStack>
          </Card>
        );
      })}
    </div>
  );
}
