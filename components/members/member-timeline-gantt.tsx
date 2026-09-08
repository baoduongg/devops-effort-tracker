"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  CalendarRange,
  ListFilter,
  Eye,
} from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort } from "@/lib/effort";
import type { Task, TaskStatus } from "@/types/task";
import type { Project } from "@/types/project";

interface MemberTimelineGanttProps {
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
  const diffDays = Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1);
  return diffDays;
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

export function MemberTimelineGantt({ tasks, projects }: MemberTimelineGanttProps): React.JSX.Element {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"both" | "gantt" | "list">("both");

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

  // Filter tasks active or falling within this window
  const validTasks = tasks.filter((t) => {
    if (t.status !== "in_progress" && t.status !== "planned" && t.status !== "done") return false;
    const taskStart = new Date(t.startDate).getTime();
    const taskEnd = t.endDate ? new Date(t.endDate).getTime() : taskStart + 7 * 24 * 60 * 60 * 1000;
    return taskEnd >= windowStartMs && taskStart <= windowEndMs;
  });

  const selectedProject = selectedTask ? projectMap.get(selectedTask.projectId) : null;
  const selectedTaskOverdue = selectedTask ? isOverdue(selectedTask) : false;
  const selectedTaskOverdueDays =
    selectedTask && selectedTaskOverdue && selectedTask.endDate ? daysOverdue(selectedTask.endDate) : 0;

  return (
    <Card elevation="low">
      <VStack gap={4}>
        {/* Timeline Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <HStack gap={2} vAlign="center">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">

              <CalendarRange size={18} />
            </span>
            <div className="flex flex-col">
              <HStack gap={2} vAlign="center">
                <Text weight="semibold" size="base">
                  Lịch trình công việc
                </Text>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 font-medium">
                  {validTasks.length} task trong kỳ
                </span>
              </HStack>
              <span className="text-xs text-neutral-400">
                {days[0].toLocaleDateString("vi-VN", { month: "short", day: "numeric" })} –{" "}
                {days[days.length - 1].toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </HStack>

          <HStack gap={2} vAlign="center" wrap="wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06] text-xs">
              <button
                type="button"
                onClick={() => setViewMode("both")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  viewMode === "both"
                    ? "bg-sky-500/20 text-sky-300 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setViewMode("gantt")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  viewMode === "gantt"
                    ? "bg-sky-500/20 text-sky-300 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Gantt
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  viewMode === "list"
                    ? "bg-sky-500/20 text-sky-300 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Danh sách
              </button>
            </div>

            <HStack gap={1} vAlign="center">
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
          </HStack>
        </div>

        {/* View: Gantt Timeline Visual */}
        {(viewMode === "both" || viewMode === "gantt") && (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Days Header */}
              <div className="grid grid-cols-14 gap-1 text-center border-b border-white/10 pb-2">
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

              {/* Task Timeline Bars Container */}
              <div className="relative min-h-[140px] bg-white/[0.015] rounded-xl border border-white/[0.06] p-3 my-3 flex flex-col gap-2.5">
                {/* Background vertical grid day lines */}
                <div className="absolute inset-0 grid grid-cols-14 pointer-events-none rounded-xl overflow-hidden">
                  {days.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={i}
                        className={`border-r border-white/[0.03] h-full ${
                          isToday ? "bg-sky-500/[0.06]" : ""
                        }`}
                      />
                    );
                  })}
                </div>

                {validTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                    <Clock size={24} className="text-neutral-500 mb-2 opacity-60" />
                    <Text type="supporting">
                      Thành viên chưa có task nào trong khoảng thời gian này (100% thời gian trống).
                    </Text>
                  </div>
                ) : (
                  validTasks.map((task) => {
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
                    const isHovered = hoveredTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className="relative z-10 h-8 flex items-center"
                      >
                        <div
                          onClick={() => setSelectedTask(task)}
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                          className={`absolute h-8 rounded-lg px-2.5 text-xs flex items-center justify-between text-white shadow-md transition-all cursor-pointer group ${
                            isPlanned
                              ? "border border-dashed border-white/60 opacity-90 hover:opacity-100"
                              : "border border-white/15"
                          } ${isDone ? "opacity-55 grayscale hover:opacity-80" : ""} ${
                            isHovered ? "ring-2 ring-sky-400 scale-[1.01] z-20 brightness-110 shadow-lg" : ""
                          }`}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            backgroundColor: color,
                          }}
                          title={`Nhấn để xem chi tiết: ${task.title} (${project?.name ?? "Project"})`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 pr-1 truncate">
                            {isDone && <CheckCircle2 size={13} className="text-white flex-shrink-0" />}
                            {isPlanned && <Clock size={13} className="text-white/80 flex-shrink-0" />}
                            <span className="font-bold text-[11px] px-1 py-0.2 rounded bg-black/25 flex-shrink-0">
                              {project?.name ?? "Project"}
                            </span>
                            <span className="truncate font-medium text-xs drop-shadow-sm">
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/40 font-bold">
                              {formatTaskEffort(task)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* View: Synchronized Task List Breakdown (Clear, readable, complete task content) */}
        {(viewMode === "both" || viewMode === "list") && (
          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-center justify-between">
              <HStack gap={1} vAlign="center">
                <ListFilter size={15} className="text-sky-400" />

                <span className="text-xs font-semibold text-neutral-300">
                  Chi tiết công việc trong khoảng thời gian này:
                </span>
              </HStack>
              <span className="text-[11px] text-neutral-400">
                (Nhấn vào task để xem chi tiết)
              </span>
            </div>

            {validTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                Không có công việc nào cần thực hiện trong kỳ này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {validTasks.map((task) => {
                  const project = projectMap.get(task.projectId);
                  const projColor = project?.color ?? "#38bdf8";
                  const statusInfo = STATUS_LABELS[task.status] || STATUS_LABELS.in_progress;
                  const overdue = isOverdue(task);
                  const isHovered = hoveredTaskId === task.id;
                  const daysCount = calculateDays(task.startDate, task.endDate);

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group ${
                        isHovered
                          ? "bg-white/[0.07] border-sky-500/50 shadow-md ring-1 ring-sky-500/30"
                          : "bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                      }`}
                    >
                      {/* Top Row: Project Tag + Status + Effort */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md truncate"
                            style={{
                              backgroundColor: `${projColor}20`,
                              color: projColor,
                              border: `1px solid ${projColor}35`,
                            }}
                          >
                            {project?.name ?? "General"}
                          </span>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusInfo.bgClass} ${statusInfo.colorClass}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/25 flex-shrink-0">
                          {formatTaskEffort(task)}
                        </span>
                      </div>

                      {/* Main Task Title & Description */}
                      <div className="flex flex-col gap-1">
                        <Text weight="semibold" size="sm" className="text-neutral-100 group-hover:text-sky-300 transition-colors">
                          {task.title}
                        </Text>
                        {task.description ? (
                          <Text type="supporting" size="sm" maxLines={2}>
                            {task.description}
                          </Text>
                        ) : null}
                      </div>

                      {/* Bottom Meta: Dates + Overdue + View Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon size={12} className="text-neutral-500" />
                          <span>
                            {formatDateVN(task.startDate)}
                            {task.endDate ? ` → ${formatDateVN(task.endDate)}` : " (Đang làm)"}
                          </span>
                          <span className="text-neutral-500">({daysCount} ngày)</span>
                        </div>

                        {overdue ? (
                          <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                            <AlertTriangle size={11} />
                            Trễ hạn
                          </span>
                        ) : (
                          <span className="text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-medium">
                            <Eye size={12} />
                            Xem
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/[0.06] text-xs text-neutral-400">
          <span className="font-semibold text-neutral-300">Chú thích:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-sky-500" />
            <span>Đang thực hiện (In Progress)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-purple-500 border border-dashed border-white/60" />
            <span>Kế hoạch (Planned)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-neutral-600 opacity-60" />
            <span>Đã hoàn thành (Done)</span>
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
              title={selectedTask.title}
              subtitle={`Dự án: ${selectedProject?.name ?? "General"}`}
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
                    STATUS_LABELS[selectedTask.status]?.bgClass ?? "bg-sky-500/10"
                  } ${STATUS_LABELS[selectedTask.status]?.colorClass ?? "text-sky-400"}`}
                >
                  {STATUS_LABELS[selectedTask.status]?.label ?? selectedTask.status}
                </span>

                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/25 flex items-center gap-1">
                  <Layers size={13} />
                  {formatTaskEffort(selectedTask)}
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
                    {formatDateVN(selectedTask.startDate)}
                    {selectedTask.endDate ? ` → ${formatDateVN(selectedTask.endDate)}` : " (Chưa kết thúc)"}
                    {" "}
                    <span className="text-neutral-400 font-normal">
                      ({calculateDays(selectedTask.startDate, selectedTask.endDate)} ngày)
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" />
                    Nguồn ghi nhận:
                  </span>
                  <span className="font-medium text-neutral-300">
                    {selectedTask.source === "ai_chat" ? "Ghi nhận qua AI Assistant" : "Nhập thủ công"}
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
                  {selectedTask.description ? selectedTask.description : "Chưa có mô tả chi tiết cho công việc này."}
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
