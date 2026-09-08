import React from "react";
import { Clock, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort, formatEffortDuration } from "@/lib/effort";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface MemberTaskBreakdownProps {
  tasks: Task[];
  projects: Project[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function MemberTaskBreakdown({ tasks, projects }: MemberTaskBreakdownProps): React.JSX.Element {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const plannedTasks = tasks.filter((t) => t.status === "planned");
  const doneTasks = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const totalInProgressMinutes = inProgressTasks.reduce((s, t) => s + t.effortMinutes, 0);

  return (
    <Grid columns={{ minWidth: 320, max: 3 }} gap={4}>
      {/* Col 1: Active In-Progress Tasks */}
      <Card elevation="low">
        <VStack gap={3}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <HStack gap={2} vAlign="center">
              <Clock size={16} className="text-sky-400" />
              <Text weight="semibold" size="base">
                Đang Thực Hiện ({inProgressTasks.length})
              </Text>
            </HStack>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
              {formatEffortDuration(totalInProgressMinutes)} tải
            </span>
          </div>

          {inProgressTasks.length === 0 ? (
            <div className="py-8 text-center bg-emerald-500/5 rounded-xl border border-emerald-500/15">
              <Text weight="semibold" className="text-emerald-400">
                🟢 Đang trống task
              </Text>
              <Text type="supporting" className="mt-1">
                Thành viên sẵn sàng nhận việc mới.
              </Text>
            </div>
          ) : (
            <VStack gap={3}>
              {inProgressTasks.map((task) => {
                const project = projectMap.get(task.projectId);
                const overdue = isOverdue(task);
                const overdueDaysCount = overdue ? daysOverdue(task.endDate as string) : 0;
                const projColor = project?.color ?? "#3b82f6";

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                      overdue
                        ? "bg-rose-500/10 border-rose-500/30"
                        : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md truncate"
                            style={{
                              backgroundColor: `${projColor}25`,
                              color: projColor,
                              border: `1px solid ${projColor}40`,
                            }}
                          >
                            {project?.name ?? "General"}
                          </span>
                        </div>
                        <Text weight="semibold" size="sm" className="text-neutral-100">
                          {task.title}
                        </Text>
                      </div>

                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 flex-shrink-0">
                        {formatTaskEffort(task)}
                      </span>
                    </div>

                    {task.description && (
                      <Text type="supporting" size="sm">
                        {task.description}
                      </Text>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span>{formatDate(task.startDate)}</span>
                        {task.endDate && <span>→ {formatDate(task.endDate)}</span>}
                      </div>

                      {overdue && (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Trễ {overdueDaysCount} ngày
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Card>

      {/* Col 2: Upcoming Planned Tasks */}
      <Card elevation="low">
        <VStack gap={3}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <HStack gap={2} vAlign="center">
              <Calendar size={16} className="text-purple-400" />
              <Text weight="semibold" size="base">
                Kế Hoạch Tiếp Theo ({plannedTasks.length})
              </Text>
            </HStack>
          </div>

          {plannedTasks.length === 0 ? (
            <div className="py-8 text-center bg-white/[0.01] rounded-xl border border-white/[0.04]">
              <Text type="supporting">
                Chưa có task kế hoạch nào được lên lịch tiếp theo.
              </Text>
            </div>
          ) : (
            <VStack gap={3}>
              {plannedTasks.map((task) => {
                const project = projectMap.get(task.projectId);
                const projColor = project?.color ?? "#a855f7";

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md self-start"
                          style={{
                            backgroundColor: `${projColor}20`,
                            color: projColor,
                            border: `1px solid ${projColor}30`,
                          }}
                        >
                          {project?.name ?? "General"}
                        </span>
                        <Text weight="medium" size="sm" className="text-neutral-200">
                          {task.title}
                        </Text>
                      </div>

                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20 font-semibold flex-shrink-0">
                        {formatTaskEffort(task)}
                      </span>
                    </div>

                    {task.description && (
                      <Text type="supporting" size="sm">
                        {task.description}
                      </Text>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 pt-1 border-t border-white/5">
                      <Clock size={12} />
                      <span>Dự kiến bắt đầu: {formatDate(task.startDate)}</span>
                    </div>
                  </div>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Card>

      {/* Col 3: Done Tasks History */}
      <Card elevation="low">
        <VStack gap={3}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <HStack gap={2} vAlign="center">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <Text weight="semibold" size="base">
                Lịch Sử Hoàn Thành ({doneTasks.length})
              </Text>
            </HStack>
          </div>

          {doneTasks.length === 0 ? (
            <div className="py-8 text-center bg-white/[0.01] rounded-xl border border-white/[0.04]">
              <Text type="supporting">
                Chưa có task nào được đánh dấu hoàn thành.
              </Text>
            </div>
          ) : (
            <VStack gap={2}>
              {doneTasks.slice(0, 6).map((task) => {
                const project = projectMap.get(task.projectId);

                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.03] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-400 font-bold flex-shrink-0">✓</span>
                      <span className="font-semibold text-neutral-400 flex-shrink-0">
                        [{project?.name ?? "General"}]
                      </span>
                      <span className="truncate text-neutral-300">{task.title}</span>
                    </div>

                    <span className="text-neutral-500 text-[11px] flex-shrink-0">
                      {formatDate(task.updatedAt)}
                    </span>
                  </div>
                );
              })}
              {doneTasks.length > 6 && (
                <Text type="supporting" className="text-center pt-1 text-xs">
                  +{doneTasks.length - 6} task đã hoàn thành trước đó
                </Text>
              )}
            </VStack>
          )}
        </VStack>
      </Card>
    </Grid>
  );
}
