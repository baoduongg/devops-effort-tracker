import React from "react";
import type { Project } from "@/types/project";
import { DurationPresetPicker, SelectField } from "./shared";

interface LogFormProps {
  taskTitle: string;
  onTaskTitleChange: (value: string) => void;
  projects: Project[];
  selectedProjectName: string;
  onProjectChange: (value: string) => void;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  effortMinutes: number;
  durationStr: string;
  onEffortChange: (minutes: number) => void;
}

export function LogForm({
  taskTitle,
  onTaskTitleChange,
  projects,
  selectedProjectName,
  onProjectChange,
  timeframe,
  onTimeframeChange,
  effortMinutes,
  durationStr,
  onEffortChange,
}: LogFormProps): React.JSX.Element {
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
          placeholder="VD: Triển khai Helm Chart Redis Sentinel & kiểm thử Failover"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm focus:outline-none focus:border-sky-500/70"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Dự án liên quan</label>
          <SelectField
            value={selectedProjectName}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
            onChange={onProjectChange}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Thời điểm hoàn thành</label>
          <input
            type="text"
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            placeholder="VD: hôm nay (15/09/2026), hôm qua..."
            className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-sky-300 text-sm font-mono focus:outline-none focus:border-sky-500/70"
          />
        </div>
      </div>

      <DurationPresetPicker effortMinutes={effortMinutes} durationStr={durationStr} onChange={onEffortChange} />
    </div>
  );
}
