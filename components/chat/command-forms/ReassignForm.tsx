import React from "react";
import { Spinner } from "@astryxdesign/core/Spinner";
import { ChevronDown } from "lucide-react";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import { formatEffortDurationLabel, SelectField } from "./shared";

interface ReassignFormProps {
  members: Member[];
  assignableMembers: Member[];
  projects: Project[];
  selectedMemberName: string;
  onMemberChange: (value: string) => void;
  newAssigneeName: string;
  onNewAssigneeChange: (value: string) => void;
  taskTitle: string;
  onTaskTitleChange: (value: string) => void;
  memberTasks: Task[];
  loadingMemberTasks: boolean;
  isCustomTaskTitle: boolean;
  onToggleCustomTaskTitle: () => void;
}

export function ReassignForm({
  members,
  assignableMembers,
  projects,
  selectedMemberName,
  onMemberChange,
  newAssigneeName,
  onNewAssigneeChange,
  taskTitle,
  onTaskTitleChange,
  memberTasks,
  loadingMemberTasks,
  isCustomTaskTitle,
  onToggleCustomTaskTitle,
}: ReassignFormProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
        🔄 Điều chuyển task sang nhân sự khác để cân bằng tải và giảm nguy cơ quá tải (&gt;8h/ngày).
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">
            1
          </span>
          Người đang phụ trách task (Hiện tại)
        </label>
        <SelectField
          value={selectedMemberName}
          options={members.map((m) => ({
            value: m.id,
            label: `${m.name} (${m.role === "leader" ? "Leader" : m.status || "DevOps"})`,
          }))}
          className="w-full p-3 pr-9 rounded-xl bg-[#0d1322] border border-white/[0.1] text-rose-300 text-sm focus:outline-none focus:border-sky-500/70 transition-colors appearance-none cursor-pointer font-medium"
          onChange={(value) => {
            onMemberChange(value);
            if (newAssigneeName === value) {
              const alt = assignableMembers.find((m) => m.id !== value);
              onNewAssigneeChange(alt?.id || "");
            }
          }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">
              2
            </span>
            Chọn task cần chuyển giao
            {memberTasks.length > 0 && (
              <span className="text-sky-300 font-normal">({memberTasks.length} task)</span>
            )}
          </label>
          {memberTasks.length > 0 && (
            <button
              type="button"
              onClick={onToggleCustomTaskTitle}
              className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer font-medium"
            >
              {isCustomTaskTitle ? "Chọn từ danh sách có sẵn" : "Nhập tay tên task khác"}
            </button>
          )}
        </div>

        {loadingMemberTasks ? (
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2.5 text-sm text-neutral-300">
            <Spinner size="sm" label="Đang tải task..." />
            <span>Đang tải danh sách task của nhân sự...</span>
          </div>
        ) : memberTasks.length > 0 && !isCustomTaskTitle ? (
          <div className="relative">
            <select
              value={taskTitle}
              onChange={(e) => onTaskTitleChange(e.target.value)}
              className="w-full p-3 pr-9 rounded-xl bg-[#0d1322] border border-white/[0.1] text-white text-sm font-medium focus:outline-none focus:border-sky-500/70 appearance-none cursor-pointer"
            >
              {memberTasks.map((t) => {
                const proj = projects.find((p) => p.id === t.projectId)?.name;
                const duration = formatEffortDurationLabel(t.effortMinutes);
                return (
                  <option key={t.id} value={t.title}>
                    {t.title} {proj ? `(${proj} • ${duration})` : `(${duration})`}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
            />
          </div>
        ) : (
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => onTaskTitleChange(e.target.value)}
            placeholder="VD: Audit IAM Roles AWS Production..."
            className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm focus:outline-none focus:border-sky-500/70"
          />
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">
            3
          </span>
          Chuyển sang cho nhân sự mới tiếp nhận
        </label>
        <SelectField
          value={newAssigneeName}
          options={assignableMembers
            .filter((m) => m.id !== selectedMemberName)
            .map((m) => ({ value: m.id, label: `${m.name} (${m.status || "DevOps"})` }))}
          className="w-full p-3 pr-9 rounded-xl bg-[#0d1322] border border-white/[0.1] text-emerald-300 text-sm focus:outline-none focus:border-sky-500/70 transition-colors appearance-none cursor-pointer font-medium"
          onChange={onNewAssigneeChange}
        />
      </div>
    </div>
  );
}
