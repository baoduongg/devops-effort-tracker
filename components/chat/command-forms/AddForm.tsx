import React from "react";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import { DurationPresetPicker, SelectField } from "./shared";

interface AddFormProps {
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
  timeframe: string;
  onTimeframeChange: (value: string) => void;
}

export function AddForm({
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
  timeframe,
  onTimeframeChange,
}: AddFormProps): React.JSX.Element {
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
          placeholder="VD: Triển khai HashiCorp Vault Secrets Engine cho Microservices"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm focus:outline-none focus:border-sky-500/70"
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
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Thời điểm dự kiến</label>
        <input
          type="text"
          value={timeframe}
          onChange={(e) => onTimeframeChange(e.target.value)}
          placeholder="VD: thứ 2 tuần tới (Sprint 15), tuần sau..."
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-amber-300 text-sm font-mono focus:outline-none focus:border-sky-500/70"
        />
      </div>
    </div>
  );
}
