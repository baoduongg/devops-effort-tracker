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
import { isOverdue, daysOverdue } from "@/lib/overdue";
import type { Member, MemberStatus } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface PMTeamRosterProps {
  members: Member[];
  tasks: Task[];
  projects: Project[];
}

function getMemberBandwidthInfo(effort: number, activeTasksCount: number): {
  status: MemberStatus;
  label: string;
  dotColor: string;
  isIdle: boolean;
  colorClass: string;
} {
  if (activeTasksCount === 0 || effort === 0) {
    return {
      status: "available",
      label: "Trống việc (100% rảnh)",
      dotColor: "bg-emerald-400",
      isIdle: true,
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    };
  }
  if (effort > 100) {
    return {
      status: "overloaded",
      label: `Quá tải ${effort}%`,
      dotColor: "bg-rose-400 animate-pulse",
      isIdle: false,
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/25",
    };
  }
  if (effort >= 80) {
    return {
      status: "busy",
      label: `Bận ${effort}%`,
      dotColor: "bg-amber-400",
      isIdle: false,
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    };
  }
  if (effort >= 50) {
    return {
      status: "busy",
      label: `Vừa tải ${effort}%`,
      dotColor: "bg-sky-400",
      isIdle: false,
      colorClass: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    };
  }
  return {
    status: "busy",
    label: `Đang làm ${effort}%`,
    dotColor: "bg-sky-400",
    isIdle: false,
    colorClass: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  };
}

function formatTaskDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function PMTeamRoster({ members, tasks, projects }: PMTeamRosterProps): React.JSX.Element {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <VStack gap={3}>
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.memberId === member.id);
        const inProgressTasks = memberTasks.filter((t) => t.status === "in_progress");
        const plannedTasks = memberTasks.filter((t) => t.status === "planned");
        const computedEffort = inProgressTasks.reduce((sum, t) => sum + t.effortPercent, 0);
        const bandwidth = getMemberBandwidthInfo(computedEffort, inProgressTasks.length);
        const isLeader = member.role === "leader";

        return (
          <Card key={member.id} elevation="low">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
              {/* Member Col (Identity & Bandwidth) */}
              <div className="lg:w-[28%] flex-shrink-0">
                <HStack gap={3} vAlign="center">
                  <Avatar name={member.name} src={member.photoURL ?? undefined} size="md" tooltip={false} />
                  <StackItem size="fill">
                    <VStack gap={1}>
                      <HStack gap={2} vAlign="center">
                        <Link
                          href={`/members/${member.id}`}
                          className="hover:underline font-semibold text-neutral-100 transition-colors"
                        >
                          <Text weight="semibold" size="base">
                            {member.name}
                          </Text>
                        </Link>
                      </HStack>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isLeader ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-gradient-to-r from-amber-500/15 to-purple-500/15 text-amber-300 border border-amber-500/30">
                            <Crown size={11} className="text-amber-400" />
                            Leader
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            <Cpu size={11} className="text-sky-400" />
                            DevOps
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${bandwidth.colorClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${bandwidth.dotColor}`} />
                          {bandwidth.label}
                        </span>
                      </div>
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 text-[11px] rounded bg-white/[0.04] border border-white/[0.08] text-neutral-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="text-[10px] text-neutral-400 self-center">
                              +{member.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </VStack>
                  </StackItem>
                </HStack>
              </div>

              {/* Center Col 1: Active Doing Tasks */}
              <div className="lg:w-[38%] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] lg:pl-4 pt-3 lg:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={13} className="text-sky-400" />
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Đang làm ({inProgressTasks.length})
                  </span>
                </div>

                {inProgressTasks.length === 0 ? (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                    <UserCheck size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Đang trống task — Sẵn sàng nhận việc</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {inProgressTasks.map((task) => {
                      const project = projectMap.get(task.projectId);
                      const overdue = isOverdue(task);
                      const overdueDaysCount = overdue ? daysOverdue(task.endDate as string) : 0;
                      const projColor = project?.color ?? "#38bdf8";

                      return (
                        <div
                          key={task.id}
                          className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-2 text-xs ${
                            overdue
                              ? "bg-rose-500/10 border-rose-500/30"
                              : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Project Badge */}
                            <span
                              className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 truncate max-w-[110px]"
                              style={{
                                backgroundColor: `${projColor}20`,
                                color: projColor,
                                border: `1px solid ${projColor}40`,
                              }}
                            >
                              {project?.name ?? "General"}
                            </span>
                            <span className="font-medium text-neutral-200 truncate" title={task.title}>
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {overdue ? (
                              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <AlertCircle size={11} />
                                Trễ {overdueDaysCount}d
                              </span>
                            ) : task.endDate ? (
                              <span className="text-[11px] text-neutral-400">
                                Hạn {formatTaskDate(task.endDate)}
                              </span>
                            ) : null}

                            <span className="font-semibold px-2 py-0.5 rounded-md text-xs bg-sky-500/15 text-sky-300 border border-sky-500/30">
                              {task.effortPercent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Center Col 2: Upcoming Plan */}
              <div className="lg:w-[24%] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] lg:pl-4 pt-3 lg:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={13} className="text-purple-400" />
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Kế hoạch ({plannedTasks.length})
                  </span>
                </div>

                {plannedTasks.length === 0 ? (
                  <div className="py-2 px-3 rounded-lg bg-white/[0.01] border border-white/[0.03] text-neutral-500 text-xs italic">
                    Chưa có plan tiếp theo
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {plannedTasks.slice(0, 2).map((task) => {
                      const project = projectMap.get(task.projectId);
                      const projColor = project?.color ?? "#c084fc";

                      return (
                        <div
                          key={task.id}
                          className="p-1.5 px-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: projColor }}
                            />
                            <span className="text-neutral-300 truncate font-normal" title={task.title}>
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-neutral-400">
                              Từ {formatTaskDate(task.startDate)}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[11px] bg-purple-500/15 text-purple-300 font-medium">
                              {task.effortPercent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {plannedTasks.length > 2 && (
                      <span className="text-[11px] text-neutral-400 pl-1">
                        +{plannedTasks.length - 2} task khác
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Column */}
              <div className="flex items-center justify-end lg:pl-2">
                <Button
                  label="Chi tiết"
                  icon={<ArrowUpRight size={14} />}
                  variant="ghost"
                  href={`/members/${member.id}`}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </VStack>
  );
}
