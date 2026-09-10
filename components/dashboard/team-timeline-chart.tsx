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
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort } from "@/lib/effort";
import { parseDateLocal, calculateDefaultEndDate } from "@/lib/date";
import { assignLanes } from "@/lib/gantt-lanes";
import { getProjectColor } from "@/lib/project-colors";
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
    start: Math.max(0, rawStart),
    end: Math.min(dayCount - 1, rawEnd),
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <HStack gap={2} vAlign="center">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
              <CalendarIcon size={16} />
            </span>
            <div className="flex flex-col">
              <Text weight="semibold" size="base">
                Lịch trình Phân bổ & Tiến độ
              </Text>
              <Text type="supporting" size="xsm">
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
            <div className="grid grid-cols-[220px_1fr] border-b border-border pb-2">
              <Text type="supporting" size="xsm" weight="semibold" className="px-3 uppercase tracking-wider">
                DevOps Member
              </Text>
              <div className="grid grid-cols-14 gap-1 text-center">
                {days.map((day, idx) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={idx}
                      className={`text-xs py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                        isToday
                          ? "bg-accent/20 text-accent font-bold border border-accent/40 shadow-sm"
                          : isWeekend
                          ? "text-secondary bg-surface"
                          : "text-primary bg-surface"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold opacity-70">
                        {day.toLocaleDateString("en-US", { weekday: "narrow" })}
                      </span>
                      <span className="text-xs">{day.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Member Timeline Rows */}
            <VStack gap={0} className="divide-y divide-border">
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
                const rowHeight = laneCount * 26;

                return (
                  <HStack key={member.id} gap={0} vAlign="center" className="py-3" style={{ minHeight: rowHeight + 12 }}>
                    <div className="w-[220px] flex-shrink-0 px-3 flex items-center gap-2.5">
                      <Avatar name={member.name} src={member.photoURL ?? undefined} size="sm" tooltip={false} />
                      <div className="truncate">
                        <Link href={`/members/${member.id}`}>
                          <Text weight="medium" size="sm" maxLines={1}>
                            {member.name}
                          </Text>
                        </Link>
                        <Text type="supporting" size="xsm">
                          {memberTasks.length} task{memberTasks.length === 1 ? "" : "s"} trong kỳ
                        </Text>
                      </div>
                    </div>

                    <div className="relative flex-1 rounded-xl bg-surface border border-border overflow-hidden" style={{ minHeight: rowHeight }}>
                      <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                        {days.map((d, i) => {
                          const isToday = d.toDateString() === new Date().toDateString();
                          return <div key={i} className={`border-r border-border h-full ${isToday ? "bg-accent/[0.08]" : ""}`} />;
                        })}
                      </div>

                      {lanes.length === 0 ? (
                        <Text type="supporting" size="xsm" className="relative z-10 text-center py-1 block">
                          Chưa có task trong khoảng này
                        </Text>
                      ) : (
                        lanes.map(({ task, start, end, lane }) => {
                          const project = projectMap.get(task.projectId);
                          const isDone = task.status === "done";
                          const isPlanned = task.status === "planned";
                          const color = getProjectColor(project?.color);
                          const leftPct = (start / days.length) * 100;
                          const widthPct = ((end - start + 1) / days.length) * 100;

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask({ task, memberName: member.name })}
                              className={`absolute h-[22px] rounded-md px-2 text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-[1.01] z-10 ${
                                isPlanned ? "border border-dashed border-white/50 opacity-85" : "border border-white/10"
                              } ${isDone ? "opacity-50 grayscale" : ""}`}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                top: lane * 26 + 2,
                                backgroundColor: color,
                                color: isDone ? undefined : "#08090C",
                              }}
                              title={`${task.title} · ${project?.name ?? "Project"} · ${formatTaskEffort(task)}`}
                            >
                              {isDone && <CheckCircle2 size={11} className="flex-shrink-0" />}
                              {isPlanned && <Clock size={11} className="flex-shrink-0 opacity-80" />}
                              <span className="truncate font-medium text-[11px]">{task.title}</span>
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
        <HStack gap={4} wrap="wrap" vAlign="center" className="pt-3 border-t border-border">
          <Text type="supporting" size="xsm" weight="semibold">
            Dự án:
          </Text>
          {projects.map((p) => (
            <HStack key={p.id} gap={1.5} vAlign="center">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getProjectColor(p.color) }} />
              <Text size="xsm">{p.name}</Text>
            </HStack>
          ))}
          <Text type="supporting" size="xsm">
            •
          </Text>
          <HStack gap={1.5} vAlign="center">
            <span className="w-3.5 h-2.5 rounded bg-sky-500" />
            <Text type="supporting" size="xsm">
              Đang làm
            </Text>
          </HStack>
          <HStack gap={1.5} vAlign="center">
            <span className="w-3.5 h-2.5 rounded bg-purple-500 border border-dashed border-white/60" />
            <Text type="supporting" size="xsm">
              Kế hoạch
            </Text>
          </HStack>
          <HStack gap={1.5} vAlign="center">
            <span className="w-3.5 h-2.5 rounded bg-neutral-600 opacity-50" />
            <Text type="supporting" size="xsm">
              Đã xong
            </Text>
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
