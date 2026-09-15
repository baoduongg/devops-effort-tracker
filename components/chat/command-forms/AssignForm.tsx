import React from "react";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { TaskStatus } from "@/types/task";
import { DurationPresetPicker, SelectField, STATUS_OPTIONS } from "./shared";

interface AssignFormProps {
  taskTitle: string;
  onTaskTitleChange: (value: string) => void;
  assignableMembers: Member[];
  selectedMemberName: string;
  onMemberChange: (value: string) => void;
  projects: Project[];
  selectedProjectName: string;
  onProjectChange: (value: string) => void;
  effortMinutes: number;
  durationStr: string;
  onEffortChange: (minutes: number) => void;
  status: TaskStatus;
  onStatusChange: (value: TaskStatus) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export function AssignForm({
  taskTitle,
  onTaskTitleChange,
  assignableMembers,
  selectedMemberName,
  onMemberChange,
  projects,
  selectedProjectName,
  onProjectChange,
  effortMinutes,
  durationStr,
  onEffortChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  notes,
  onNotesChange,
}: AssignFormProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
          Tiêu đề công việc (Task) <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => onTaskTitleChange(e.target.value)}
          placeholder="VD: Cấu hình Prometheus & Grafana Dashboard cho K8s Cluster"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm focus:outline-none focus:border-sky-500/70 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Giao cho nhân sự (Assignee)
          </label>
          <SelectField
            value={selectedMemberName}
            options={assignableMembers.map((m) => ({
              value: m.id,
              label: `${m.name} (${m.status || "DevOps"})`,
            }))}
            onChange={onMemberChange}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Dự án liên quan</label>
          <SelectField
            value={selectedProjectName}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
            onChange={onProjectChange}
          />
        </div>
      </div>

      <DurationPresetPicker effortMinutes={effortMinutes} durationStr={durationStr} onChange={onEffortChange} />

      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Trạng thái công việc</label>
        <SelectField
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => onStatusChange(value as TaskStatus)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Ngày bắt đầu</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm font-mono focus:outline-none focus:border-sky-500/70 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Hạn hoàn thành (Deadline)</label>
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-amber-300 text-sm font-mono focus:outline-none focus:border-sky-500/70 [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Ghi chú thêm (Tùy chọn)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="VD: Cần phối hợp với team Dev trước khi deploy..."
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-300 text-sm focus:outline-none focus:border-sky-500/70"
        />
      </div>
    </div>
  );
}
