"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { GanttDayHeader } from "@/components/dashboard/gantt-day-header";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort } from "@/lib/effort";
import { parseDateLocal, calculateDefaultEndDate } from "@/lib/date";
import { assignLanes } from "@/lib/gantt-lanes";
import { getProjectColor } from "@/lib/project-colors";
import { getGanttTaskStyle } from "@/lib/status-colors";
import type { Member } from "@/types/member";
import type { Task, TaskStatus } from "@/types/task";
import type { Project } from "@/types/project";

interface TeamTimelineChartProps {
  members: Member[];
  tasks: Task[];
  projects: Project[];
}

function formatDateVN(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = parseDateLocal(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function calculateDays(startDate: string, endDate: string | null, effortMinutes?: number): number {
  const start = parseDateLocal(startDate).getTime();
  const resolvedEndStr = endDate || calculateDefaultEndDate(startDate, effortMinutes ?? 60);
  const end = parseDateLocal(resolvedEndStr).getTime();
  return Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1);
}

/** Converts a task's real date range into inclusive day-index offsets within the visible window (0 = first visible day). Clamps to the window bounds. */
function toDayIndexRange(
  task: Task,
  windowStart: Date,
  dayCount: number
): { start: number; end: number } {
  const taskStart = parseDateLocal(task.startDate);
  const resolvedEndStr = task.endDate || calculateDefaultEndDate(task.startDate, task.effortMinutes);
  const taskEnd = parseDateLocal(resolvedEndStr);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const rawStart = Math.round((taskStart.getTime() - windowStart.getTime()) / MS_PER_DAY);
  const rawEnd = Math.round((taskEnd.getTime() - windowStart.getTime()) / MS_PER_DAY);

  return {
    start: Math.max(0, Math.min(dayCount - 1, rawStart)),
    end: Math.max(0, Math.min(dayCount - 1, rawEnd)),
  };
}

const STATUS_LABELS: Record<TaskStatus, { label: string; variant: "info" | "purple" | "success" }> = {
  in_progress: {
    label: "Đang thực hiện",
    variant: "info",
  },
  planned: {
    label: "Kế hoạch",
    variant: "purple",
  },
  done: {
    label: "Đã hoàn thành",
    variant: "success",
  },
};

export function TeamTimelineChart({ members, tasks, projects }: TeamTimelineChartProps): React.JSX.Element {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState<{ task: Task; memberName: string } | null>(null);

  // Build a 14-day window starting from today + offset
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() + weekOffset * 7 - 3); // Start 3 days before today

  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const windowStartMs = days[0].getTime();
  const windowEndMs = days[days.length - 1].getTime() + 24 * 60 * 60 * 1000;

  const selectedProject = selectedTask ? projectMap.get(selectedTask.task.projectId) : null;
  const selectedTaskOverdue = selectedTask ? isOverdue(selectedTask.task) : false;
  const selectedTaskOverdueDays =
    selectedTask && selectedTaskOverdue && selectedTask.task.endDate
      ? daysOverdue(selectedTask.task.endDate)
      : 0;
  const selectedProjectColor = getProjectColor(selectedProject?.color);
  const selectedStatusInfo = selectedTask ? STATUS_LABELS[selectedTask.task.status] : null;

  return (
    <Card elevation="low">
      <VStack gap={4}>
        {/* Timeline Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <HStack gap={2} vAlign="center">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CalendarIcon size={16} />
            </span>
            <div className="flex flex-col">
              <Text weight="semibold" size="lg">
                Lịch trình Phân bổ &amp; Tiến độ (Gantt)
              </Text>
              <Text type="supporting" size="sm" className="font-mono">
                {days[0].toLocaleDateString("vi-VN", { month: "short", day: "numeric" })} -{" "}
                {days[days.length - 1].toLocaleDateString("vi-VN", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
            </div>
          </HStack>

          <HStack gap={2} vAlign="center">
            <Button
              label="Trước"
              icon={<ChevronLeft size={15} />}
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset((prev) => prev - 1)}
            />
            <Button
              label="Hôm nay"
              size="sm"
              variant={weekOffset === 0 ? "secondary" : "ghost"}
              onClick={() => setWeekOffset(0)}
            />
            <Button
              label="Sau"
              icon={<ChevronRight size={15} />}
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset((prev) => prev + 1)}
            />
          </HStack>
        </div>

        {/* Timeline Grid Container */}
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            {/* Days Header */}
            <div className="grid grid-cols-[220px_1fr] border-b border-white/[0.08] pb-2">
              <Text type="supporting" size="sm" weight="semibold" className="px-3 uppercase tracking-wider font-mono">
                Kỹ sư / Thành viên
              </Text>
              <GanttDayHeader days={days} />
            </div>

            {/* Member Timeline Rows */}
            <VStack gap={0} className="divide-y divide-white/[0.06]">
              {members.map((member) => {
                const memberTasks = tasks.filter((t) => {
                  if (t.memberId !== member.id) return false;
                  if (t.status !== "in_progress" && t.status !== "planned" && t.status !== "done") return false;
                  const taskStart = parseDateLocal(t.startDate).getTime();
                  const resolvedEndStr = t.endDate || calculateDefaultEndDate(t.startDate, t.effortMinutes);
                  const taskEnd = parseDateLocal(resolvedEndStr).getTime() + 24 * 60 * 60 * 1000;
                  return taskEnd >= windowStartMs && taskStart <= windowEndMs;
                });

                const dayRanges = memberTasks.map((t) => ({
                  task: t,
                  ...toDayIndexRange(t, days[0], days.length),
                }));
                const lanes = assignLanes(dayRanges);
                const laneCount = Math.max(1, ...lanes.map((l) => l.lane + 1));
                const rowHeight = laneCount * 28;

                return (
                  <HStack key={member.id} gap={0} vAlign="center" className="py-2.5" style={{ minHeight: rowHeight + 12 }}>
                    <div className="w-[220px] flex-shrink-0 px-3 flex items-center gap-2.5">
                      <Avatar name={member.name} src={member.photoURL ?? undefined} size="md" tooltip={false} />
                      <div className="truncate">
                        <Link href={`/members/${member.id}`}>
                          <Text weight="semibold" maxLines={1}>
                            {member.name}
                          </Text>
                        </Link>
                        <Text type="supporting" size="xsm" className="font-mono text-neutral-400">
                          {memberTasks.length} task{memberTasks.length === 1 ? "" : "s"}
                        </Text>
                      </div>
                    </div>

                    <div className="relative flex-1 rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden" style={{ minHeight: rowHeight }}>
                      <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                        {days.map((d, i) => {
                          const isToday = d.toDateString() === new Date().toDateString();
                          return <div key={i} className={`border-r border-white/[0.04] h-full ${isToday ? "bg-sky-500/[0.07]" : ""}`} />;
                        })}
                      </div>

                      {lanes.length === 0 ? (
                        <div className="relative z-10 flex items-center gap-1.5 text-xs text-emerald-400/90 italic font-mono px-3 py-1.5">
                          <CheckCircle2 size={13} />
                          <span>Trống lịch trình — Có thể gán task mới</span>
                        </div>
                      ) : (
                        lanes.map(({ task, start, end, lane }) => {
                          const project = projectMap.get(task.projectId);
                          const isDone = task.status === "done";
                          const isPlanned = task.status === "planned";
                          const visual = getGanttTaskStyle(task);
                          const leftPct = (start / days.length) * 100;
                          const widthPct = ((end - start + 1) / days.length) * 100;
                          const durationLabel = formatTaskEffort(task);

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask({ task, memberName: member.name })}
                              className={`absolute h-[24px] rounded-lg px-2 text-xs flex items-center justify-between gap-1.5 text-white cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:brightness-110 z-10 bg-gradient-to-r ${visual.gradient} border ${visual.border} ${visual.shadow} ${
                                isPlanned ? "border-dashed opacity-90" : ""
                              } ${isDone ? "opacity-85" : ""}`}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                top: lane * 28 + 2,
                              }}
                              title={`${task.title} · ${project?.name ?? "Project"} · ${durationLabel}${visual.isOverdue ? ` · Quá hạn ${visual.overdueDays} ngày` : ""}`}
                            >
                              <span className="truncate font-semibold flex items-center gap-1.5 min-w-0">
                                {isDone && <CheckCircle2 size={12} className="flex-shrink-0 text-emerald-300" />}
                                {isPlanned && <Clock size={12} className="flex-shrink-0 text-purple-300" />}
                                {visual.isOverdue && <AlertTriangle size={12} className="flex-shrink-0 text-amber-300 animate-pulse" />}
                                <span className="truncate">{task.title}</span>
                              </span>

                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                                  visual.isOverdue
                                    ? "bg-rose-950/80 text-rose-200 border border-rose-400/30 font-bold"
                                    : "bg-black/30 text-white/90"
                                }`}
                              >
                                {visual.isOverdue ? `Trễ ${visual.overdueDays}d` : durationLabel}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </HStack>
                );
              })}
            </VStack>
          </div>
        </div>

        {/* Legend */}
        <HStack gap={4} wrap="wrap" vAlign="center" className="pt-3 border-t border-white/[0.08] text-xs">
          <Text type="supporting" size="sm" weight="semibold">
            Trạng thái Task:
          </Text>
          <HStack gap={1.5} vAlign="center">
            <span className="w-5 h-2.5 rounded bg-gradient-to-r from-sky-500 to-blue-600 border border-sky-400/50 shadow-sm" />
            <Text size="sm">Đang làm</Text>
          </HStack>
          <HStack gap={1.5} vAlign="center">
            <span className="w-5 h-2.5 rounded bg-gradient-to-r from-purple-500 to-indigo-600 border border-purple-400/50 border-dashed shadow-sm" />
            <Text size="sm">Kế hoạch</Text>
          </HStack>
          <HStack gap={1.5} vAlign="center">
            <span className="w-5 h-2.5 rounded bg-gradient-to-r from-rose-500 to-amber-600 border border-rose-400/50 shadow-sm" />
            <Text size="sm" className="text-rose-300 font-semibold">Trễ hạn</Text>
          </HStack>
          <HStack gap={1.5} vAlign="center">
            <span className="w-5 h-2.5 rounded bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400/50 shadow-sm" />
            <Text size="sm">Hoàn thành</Text>
          </HStack>
        </HStack>
      </VStack>

      {/* Task Detail Modal Dialog */}
      <Dialog
        isOpen={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
        purpose="info"
        width={520}
      >
        {selectedTask && (
          <>
            <DialogHeader
              title={selectedTask.task.title}
              subtitle={`Thành viên: ${selectedTask.memberName} • Dự án: ${selectedProject?.name ?? "General"}`}
              onOpenChange={() => setSelectedTask(null)}
            />
            <div className="p-5 flex flex-col gap-4">
              {/* Badges Overview */}
              <HStack gap={2} wrap="wrap" vAlign="center">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                  style={{
                    backgroundColor: `${selectedProjectColor}20`,
                    color: selectedProjectColor,
                    borderColor: `${selectedProjectColor}40`,
                  }}
                >
                  {selectedProject?.name ?? "General"}
                </span>

                {selectedStatusInfo && <Badge variant={selectedStatusInfo.variant} label={selectedStatusInfo.label} />}

                <Badge variant="blue" icon={<Layers size={13} />} label={`${formatTaskEffort(selectedTask.task)} Effort`} />

                {selectedTaskOverdue && (
                  <Badge variant="error" icon={<AlertTriangle size={13} />} label={`Trễ ${selectedTaskOverdueDays} ngày`} />
                )}
              </HStack>

              {/* Task Details Card */}
              <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col gap-3">
                <HStack vAlign="center" justify="between" className="text-xs">
                  <HStack gap={1.5} vAlign="center">
                    <CalendarIcon size={14} className="text-accent" />
                    <Text type="supporting" size="xsm">
                      Thời gian thực hiện:
                    </Text>
                  </HStack>
                  <Text size="xsm" weight="semibold">
                    {formatDateVN(selectedTask.task.startDate)}
                    {selectedTask.task.endDate ? ` → ${formatDateVN(selectedTask.task.endDate)}` : " (Chưa kết thúc)"}
                    {" "}
                    <Text as="span" type="supporting" size="xsm" color="inherit" weight="normal">
                      ({calculateDays(selectedTask.task.startDate, selectedTask.task.endDate)} ngày)
                    </Text>
                  </Text>
                </HStack>

                <HStack vAlign="center" justify="between" className="text-xs pt-2 border-t border-border">
                  <HStack gap={1.5} vAlign="center">
                    <Sparkles size={14} className="text-purple-400" />
                    <Text type="supporting" size="xsm">
                      Nguồn ghi nhận:
                    </Text>
                  </HStack>
                  <Text size="xsm" weight="medium">
                    {selectedTask.task.source === "ai_chat" ? "Ghi nhận qua AI Assistant" : "Nhập thủ công"}
                  </Text>
                </HStack>
              </div>

              {/* Description Section */}
              <div className="flex flex-col gap-1.5">
                <HStack gap={1} vAlign="center">
                  <Info size={13} className="text-secondary" />
                  <Text type="supporting" size="xsm" weight="semibold">
                    Mô tả chi tiết:
                  </Text>
                </HStack>
                <div className="p-3 rounded-xl bg-surface border border-border min-h-[60px]">
                  <Text size="xsm" textWrap="pretty" className="whitespace-pre-wrap leading-relaxed">
                    {selectedTask.task.description ? selectedTask.task.description : "Chưa có mô tả chi tiết cho công việc này."}
                  </Text>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end pt-2 border-t border-border">
                <Button
                  label="Đóng"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                />
              </div>
            </div>
          </>
        )}
      </Dialog>
    </Card>
  );
}
