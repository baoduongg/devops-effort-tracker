import React from "react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { AlertTriangle } from "lucide-react";
import type { Member } from "@/types/member";
import type { Task } from "@/types/task";
import { formatEffortDurationLabel, SelectField } from "./shared";

interface RemoveFormProps {
  members: Member[];
  selectedMemberName: string;
  onMemberChange: (value: string) => void;
  taskTitle: string;
  onTaskTitleChange: (value: string) => void;
  memberTasks: Task[];
  loadingMemberTasks: boolean;
  isCustomTaskTitle: boolean;
}

export function RemoveForm({
  members,
  selectedMemberName,
  onMemberChange,
  taskTitle,
  onTaskTitleChange,
  memberTasks,
  loadingMemberTasks,
  isCustomTaskTitle,
}: RemoveFormProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
        <AlertTriangle size={16} />
        <span>Xóa task khỏi hệ thống nếu yêu cầu bị hủy hoặc trùng lặp.</span>
      </div>
      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center justify-center font-bold">
            1
          </span>
          Thành viên đang phụ trách task
        </label>
        <SelectField
          value={selectedMemberName}
          options={members.map((m) => ({
            value: m.id,
            label: `${m.name} (${m.role === "leader" ? "Leader" : m.status || "DevOps"})`,
          }))}
          onChange={onMemberChange}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center justify-center font-bold">
            2
          </span>
          Chọn task cần xóa / hủy
        </label>
        {loadingMemberTasks ? (
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2.5 text-sm text-neutral-300">
            <Spinner size="sm" label="Đang tải task..." />
            <span>Đang tải danh sách task của nhân sự...</span>
          </div>
        ) : memberTasks.length > 0 && !isCustomTaskTitle ? (
          <SelectField
            value={taskTitle}
            options={memberTasks.map((t) => ({
              value: t.title,
              label: `${t.title} (${formatEffortDurationLabel(t.effortMinutes)})`,
            }))}
            className="w-full p-3 pr-9 rounded-xl bg-[#0d1322] border border-white/[0.1] text-rose-300 text-sm font-medium focus:outline-none focus:border-sky-500/70 appearance-none cursor-pointer"
            onChange={onTaskTitleChange}
          />
        ) : (
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => onTaskTitleChange(e.target.value)}
            placeholder="VD: Test Cấu hình Deprecated OpenSSL v1..."
            className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-rose-300 font-medium text-sm focus:outline-none focus:border-sky-500/70"
          />
        )}
      </div>
    </div>
  );
}
