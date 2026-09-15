"use client";

import type { TaskListPayload } from "@/types/chat";

interface TaskListCardProps {
  taskList: TaskListPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function TaskListCard({ taskList, onRunSlashCommand }: TaskListCardProps): React.JSX.Element {
  const { title = "📋 Danh sách các task đang thực hiện và kế hoạch:", tasks, suggestedActions = [] } = taskList;

  return (
    <div className="space-y-3">
      <p className="text-neutral-200 font-semibold leading-relaxed text-xs sm:text-sm">
        {title}
      </p>

      {tasks.length === 0 ? (
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 text-xs">
          Hiện chưa có task nào đang thực hiện hoặc lên kế hoạch trong hệ thống.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, idx) => {
            const isOverdue = task.statusVariant === "overdue" || task.statusLabel === "Trễ hạn";
            const isInProgress = task.statusVariant === "in_progress" || task.statusLabel === "Đang làm";
            const isDone = task.statusVariant === "done" || task.statusLabel === "Hoàn thành";
            const isPlanned = task.statusVariant === "planned" || task.statusLabel === "Kế hoạch";

            let badgeStyles = "bg-neutral-800 text-neutral-300 border border-white/[0.08]";
            if (isOverdue) {
              badgeStyles = "bg-rose-500/20 text-rose-300 border border-rose-500/30";
            } else if (isInProgress) {
              badgeStyles = "bg-sky-500/20 text-sky-300 border border-sky-500/25";
            } else if (isDone) {
              badgeStyles = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/25";
            } else if (isPlanned) {
              badgeStyles = "bg-neutral-800 text-neutral-300 border border-white/[0.08]";
            }

            return (
              <div
                key={task.id || `${task.title}-${idx}`}
                className={`p-3 sm:p-3.5 rounded-xl bg-black/40 border transition-all flex items-center justify-between gap-3 ${
                  isOverdue
                    ? "border-rose-500/25 hover:border-rose-500/40"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-xs sm:text-sm leading-snug truncate">
                    {task.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>{task.memberName} &bull; {task.duration}</span>
                    {task.projectName && (
                      <>
                        <span>&bull;</span>
                        <span className="text-neutral-400 truncate max-w-[160px] sm:max-w-xs">
                          {task.projectName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded font-mono text-[11px] sm:text-xs shrink-0 ${badgeStyles}`}
                >
                  {task.statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {suggestedActions.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-400 font-medium">Gợi ý hành động:</span>
          {suggestedActions.map((action) => (
            <button
              key={action.slashCommand}
              type="button"
              onClick={() => onRunSlashCommand?.(action.slashCommand)}
              className="px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-medium border border-white/[0.08]"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
