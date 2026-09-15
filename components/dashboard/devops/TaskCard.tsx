import React from "react";
import { AlertTriangle, Calendar, CheckCircle2, Layers } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort } from "@/lib/effort";
import { getProjectColor } from "@/lib/project-colors";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";
import { TASK_CARD_CONFIG, type TaskCardTab } from "./task-card-config";

interface TaskCardProps {
  tab: TaskCardTab;
  task: Task;
  project: Project | undefined;
  isUpdating: boolean;
  onToggleStatus: () => void;
}

export function TaskCard({ tab, task, project, isUpdating, onToggleStatus }: TaskCardProps): React.JSX.Element {
  const config = TASK_CARD_CONFIG[tab];
  const projColor = getProjectColor(project?.color);
  const overdue = config.showOverdue && isOverdue(task);

  return (
    <Card elevation="low">
      <div className="flex flex-col justify-between h-full gap-3 p-1">
        <div className="flex items-start justify-between gap-2">
          {tab === "done" ? (
            <>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border ${config.badgeClass}`}>
                <CheckCircle2 size={13} />
                {project?.name || "General"}
              </span>
              <span className="text-xs font-semibold text-neutral-400">{formatTaskEffort(task)}</span>
            </>
          ) : (
            <>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-lg truncate"
                style={{
                  backgroundColor: `${projColor}20`,
                  color: projColor,
                  border: `1px solid ${projColor}35`,
                }}
              >
                {project?.name || (tab === "active" ? "General Project" : "General")}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border ${config.badgeClass}`}>
                {tab === "active" && <Layers size={12} />}
                {formatTaskEffort(task)}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Text
            weight={tab === "done" ? "semibold" : "bold"}
            size="base"
            className={config.titleClassName ?? "text-neutral-100"}
          >
            {task.title}
          </Text>
          {tab !== "done" && task.description && (
            <Text type="supporting" size="sm" maxLines={2}>
              {task.description}
            </Text>
          )}
        </div>

        {tab === "active" ? (
          <>
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.04]">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-neutral-500" />
                {config.dateLabel(task)}
              </span>
              {overdue && (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle size={13} />
                  Trễ {task.endDate ? daysOverdue(task.endDate) : 0} ngày
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="text-sm text-neutral-500">
                {task.source === "ai_chat" ? "Tạo qua AI Chat" : "Nhập thủ công"}
              </span>
              {config.action(task, isUpdating, onToggleStatus)}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <span className={tab === "planned" ? "text-xs text-neutral-400" : "text-xs text-neutral-500"}>
              {config.dateLabel(task)}
            </span>
            {config.action(task, isUpdating, onToggleStatus)}
          </div>
        )}
      </div>
    </Card>
  );
}
