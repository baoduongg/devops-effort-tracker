import React from "react";
import { Calendar, CheckCircle2, Check, Clock, RotateCcw } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import type { Task } from "@/types/task";

export type TaskCardTab = "active" | "planned" | "done";

export interface TaskCardConfig {
  badgeClass: string;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
  titleClassName?: string;
  showOverdue?: boolean;
  dateLabel: (task: Task) => string;
  action: (task: Task, isUpdating: boolean, onClick: () => void) => React.ReactNode;
}

export const TASK_CARD_CONFIG: Record<TaskCardTab, TaskCardConfig> = {
  active: {
    badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    emptyIcon: <CheckCircle2 size={36} className="text-emerald-400 opacity-80" />,
    emptyMessage: "Bạn hiện không có task nào đang chạy (100% rảnh)",
    showOverdue: true,
    dateLabel: (task) => `Hạn chót: ${task.endDate || "Chưa đặt"}`,
    action: (task, isUpdating, onClick) => (
      <Button
        label={isUpdating ? "Đang lưu..." : "Đánh dấu Hoàn thành"}
        icon={<Check size={14} />}
        variant="secondary"
        size="sm"
        isDisabled={isUpdating}
        onClick={onClick}
      />
    ),
  },
  planned: {
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    emptyIcon: <Calendar size={32} className="text-neutral-500 opacity-60" />,
    emptyMessage: "Chưa có task nào trong kế hoạch tiếp theo",
    dateLabel: (task) => `Bắt đầu: ${task.startDate || "Sắp tới"}`,
    action: (task, isUpdating, onClick) => (
      <Button
        label={isUpdating ? "Đang lưu..." : "Bắt đầu làm (In Progress)"}
        icon={<Clock size={14} />}
        variant="primary"
        size="sm"
        isDisabled={isUpdating}
        onClick={onClick}
      />
    ),
  },
  done: {
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    emptyIcon: <CheckCircle2 size={32} className="text-neutral-500 opacity-60" />,
    emptyMessage: "Chưa có task nào đã hoàn thành trong sprint",
    titleClassName: "text-neutral-200 line-through opacity-80",
    dateLabel: () => "Hoàn thành",
    action: (task, isUpdating, onClick) => (
      <Button
        label={isUpdating ? "Đang lưu..." : "Mở lại task"}
        icon={<RotateCcw size={13} />}
        variant="ghost"
        size="sm"
        isDisabled={isUpdating}
        onClick={onClick}
      />
    ),
  },
};

export const NEXT_STATUS_BY_TAB: Record<TaskCardTab, Task["status"]> = {
  active: "done",
  planned: "in_progress",
  done: "in_progress",
};
