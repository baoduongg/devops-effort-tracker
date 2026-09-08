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
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort } from "@/lib/effort";
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
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function calculateDays(startDate: string, endDate: string | null): number {
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : start;
  return Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1);
}

const STATUS_LABELS: Record<TaskStatus, { label: string; colorClass: string; bgClass: string }> = {
  in_progress: {
    label: "Đang thực hiện",
    colorClass: "text-sky-400 border-sky-500/30",
    bgClass: "bg-sky-500/10",
  },
  planned: {
    label: "Kế hoạch",
    colorClass: "text-purple-400 border-purple-500/30",
    bgClass: "bg-purple-500/10",
  },
  done: {
    label: "Đã hoàn thành",
    colorClass: "text-emerald-400 border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
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
  const totalWindowDuration = windowEndMs - windowStartMs;

  const selectedProject = selectedTask ? projectMap.get(selectedTask.task.projectId) : null;
  const selectedTaskOverdue = selectedTask ? isOverdue(selectedTask.task) : false;
  const selectedTaskOverdueDays =
    selectedTask && selectedTaskOverdue && selectedTask.task.endDate
      ? daysOverdue(selectedTask.task.endDate)
      : 0;

  return (
    <Card elevation="low">
      <VStack gap={4}>
        {/* Timeline Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <HStack gap={2} vAlign="center">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CalendarIcon size={16} />
            </span>
            <div className="flex flex-col">
              <Text weight="semibold" size="base">
                Lịch trình Phân bổ & Tiến độ
              </Text>
              <span className="text-xs text-neutral-400">
                {days[0].toLocaleDateString("vi-VN", { month: "short", day: "numeric" })} -{" "}
                {days[days.length - 1].toLocaleDateString("vi-VN", { month: "short", day: "numeric", year: "numeric" })}
              </span>
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
              <div className="text-xs font-semibold text-neutral-400 px-3 uppercase tracking-wider">DevOps Member</div>
              <div className="grid grid-cols-14 gap-1 text-center">
                {days.map((day, idx) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={idx}
                      className={`text-xs py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                        isToday
                          ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shadow-sm"
                          : isWeekend
                          ? "text-neutral-500 bg-white/[0.01]"
                          : "text-neutral-300 bg-white/[0.02]"
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
            <div className="divide-y divide-white/[0.05]">
              {members.map((member) => {
                const memberTasks = tasks.filter((t) => {
                  if (t.memberId !== member.id) return false;
                  if (t.status !== "in_progress" && t.status !== "planned" && t.status !== "done") return false;
                  const taskStart = new Date(t.startDate).getTime();
                  const taskEnd = t.endDate ? new Date(t.endDate).getTime() : taskStart + 7 * 24 * 60 * 60 * 1000;
                  return taskEnd >= windowStartMs && taskStart <= windowEndMs;
                });

                return (
                  <div key={member.id} className="grid grid-cols-[220px_1fr] py-3 items-center">
                    {/* Member Info */}
                    <div className="px-3 flex items-center gap-2.5">
                      <Avatar name={member.name} src={member.photoURL ?? undefined} size="sm" tooltip={false} />
                      <div className="truncate">
                        <Link href={`/members/${member.id}`} className="hover:underline font-medium text-neutral-200">
                          <Text weight="medium" size="sm" maxLines={1}>
                            {member.name}
                          </Text>
                        </Link>
                        <span className="text-[11px] text-neutral-400">
                          {memberTasks.length} task{memberTasks.length === 1 ? "" : "s"} trong kỳ
                        </span>
                      </div>
                    </div>

                    {/* Timeline Bar Area */}
                    <div className="relative min-h-[56px] bg-white/[0.015] rounded-xl border border-white/[0.04] overflow-hidden flex flex-col justify-center gap-1.5 p-1.5">
                      {/* Grid background day lines */}
                      <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                        {days.map((d, i) => {
                          const isToday = d.toDateString() === new Date().toDateString();
                          return (
                            <div
                              key={i}
                              className={`border-r border-white/[0.03] h-full ${
                                isToday ? "bg-sky-500/[0.08]" : ""
                              }`}
                            />
                          );
                        })}
                      </div>

                      {memberTasks.length === 0 ? (
                        <div className="text-center relative z-10 py-1">
                          <span className="text-xs text-neutral-500 italic">Chưa có task trong khoảng này</span>
                        </div>
                      ) : (
                        memberTasks.map((task) => {
                          const project = projectMap.get(task.projectId);
                          const isDone = task.status === "done";
                          const isPlanned = task.status === "planned";
                          const taskStart = new Date(task.startDate).getTime();
                          const taskEnd = isDone
                            ? taskStart + 24 * 60 * 60 * 1000
                            : task.endDate
                            ? new Date(task.endDate).getTime()
                            : taskStart + 7 * 24 * 60 * 60 * 1000;

                          // Calculate positioning percentage in the 14-day window
                          const leftPct = Math.max(
                            0,
                            Math.min(100, ((taskStart - windowStartMs) / totalWindowDuration) * 100)
                          );
                          const rightPct = Math.max(
                            0,
                            Math.min(100, ((taskEnd - windowStartMs) / totalWindowDuration) * 100)
                          );
                          const widthPct = Math.max(7.14, rightPct - leftPct);

                          // Hide if completely outside current window
                          if (taskEnd < windowStartMs || taskStart > windowEndMs) return null;

                          const color = project?.color ?? "#38bdf8";

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask({ task, memberName: member.name })}
                              className={`h-7 rounded-lg px-2 text-xs flex items-center justify-between text-white shadow-sm transition-all z-10 cursor-pointer hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] ${
                                isPlanned ? "border border-dashed border-white/50 opacity-85" : "border border-white/10"
                              } ${isDone ? "opacity-50 grayscale" : ""}`}
                              style={{
                                marginLeft: `${leftPct}%`,
                                width: `${widthPct}%`,
                                backgroundColor: color,
                              }}
                              title={`Nhấn để xem chi tiết: ${task.title} (${project?.name ?? "Project"}) | Effort: ${formatTaskEffort(task)}`}
                            >
                              <div className="flex items-center gap-1 min-w-0 pr-1 truncate">
                                {isDone && <CheckCircle2 size={11} className="flex-shrink-0" />}
                                {isPlanned && <Clock size={11} className="flex-shrink-0 opacity-80" />}
                                <span className="font-bold text-[10px] opacity-90 flex-shrink-0">
                                  [{project?.name ?? "Project"}]
                                </span>
                                <span className="truncate font-medium text-[11px] drop-shadow-sm">
                                  {task.title}
                                </span>
                              </div>
                              <span className="text-[10px] ml-1 px-1 rounded bg-black/40 font-bold flex-shrink-0">
                                {formatTaskEffort(task)}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/[0.06] text-xs text-neutral-400">
          <span className="font-semibold text-neutral-300">Dự án:</span>
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-neutral-300">{p.name}</span>
            </div>
          ))}
          <span className="text-neutral-500">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2.5 rounded bg-sky-500" />
            <span>Đang làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2.5 rounded bg-purple-500 border border-dashed border-white/60" />
            <span>Kế hoạch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2.5 rounded bg-neutral-600 opacity-50" />
            <span>Đã xong</span>
          </div>
        </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                  style={{
                    backgroundColor: `${selectedProject?.color ?? "#38bdf8"}20`,
                    color: selectedProject?.color ?? "#38bdf8",
                    borderColor: `${selectedProject?.color ?? "#38bdf8"}40`,
                  }}
                >
                  {selectedProject?.name ?? "General"}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    STATUS_LABELS[selectedTask.task.status]?.bgClass ?? "bg-sky-500/10"
                  } ${STATUS_LABELS[selectedTask.task.status]?.colorClass ?? "text-sky-400"}`}
                >
                  {STATUS_LABELS[selectedTask.task.status]?.label ?? selectedTask.task.status}
                </span>

                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/25 flex items-center gap-1">
                  <Layers size={13} />
                  {formatTaskEffort(selectedTask.task)} Effort
                </span>

                {selectedTaskOverdue && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle size={13} />
                    Trễ {selectedTaskOverdueDays} ngày
                  </span>
                )}
              </div>

              {/* Task Details Card */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-sky-400" />
                    Thời gian thực hiện:
                  </span>
                  <span className="font-semibold text-neutral-200">
                    {formatDateVN(selectedTask.task.startDate)}
                    {selectedTask.task.endDate ? ` → ${formatDateVN(selectedTask.task.endDate)}` : " (Chưa kết thúc)"}
                    {" "}
                    <span className="text-neutral-400 font-normal">
                      ({calculateDays(selectedTask.task.startDate, selectedTask.task.endDate)} ngày)
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" />
                    Nguồn ghi nhận:
                  </span>
                  <span className="font-medium text-neutral-300">
                    {selectedTask.task.source === "ai_chat" ? "Ghi nhận qua AI Assistant" : "Nhập thủ công"}
                  </span>
                </div>
              </div>

              {/* Description Section */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
                  <Info size={13} />
                  Mô tả chi tiết:
                </span>
                <div className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] text-xs text-neutral-300 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                  {selectedTask.task.description ? selectedTask.task.description : "Chưa có mô tả chi tiết cho công việc này."}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end pt-2 border-t border-white/[0.06]">
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
