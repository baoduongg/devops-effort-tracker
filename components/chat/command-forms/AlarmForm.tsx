import React from "react";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import { SelectField } from "./shared";

interface AlarmFormProps {
  content: string;
  onContentChange: (value: string) => void;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  members: Member[];
  selectedMemberName: string;
  onMemberChange: (value: string) => void;
  supervisorName: string;
  onSupervisorChange: (value: string) => void;
  projects: Project[];
  selectedProjectName: string;
  onProjectChange: (value: string) => void;
}

export function AlarmForm({
  content,
  onContentChange,
  timeframe,
  onTimeframeChange,
  members,
  selectedMemberName,
  onMemberChange,
  supervisorName,
  onSupervisorChange,
  projects,
  selectedProjectName,
  onProjectChange,
}: AlarmFormProps): React.JSX.Element {
  const memberOptions = members.map((m) => ({ value: m.id, label: m.name }));
  const supervisorOptions = [{ value: "", label: "Không có" }, ...memberOptions];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
          Nội dung nhắc <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="VD: Review PR hạ tầng, gọi báo cáo tuần..."
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm focus:outline-none focus:border-sky-500/70"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Người thực hiện <span className="text-rose-400">*</span>
          </label>
          <SelectField value={selectedMemberName} options={memberOptions} onChange={onMemberChange} />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Người giám sát (Tùy chọn)</label>
          <SelectField value={supervisorName} options={supervisorOptions} onChange={onSupervisorChange} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Thời gian nhắc <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            placeholder="VD: 30 phút nữa, 9h sáng mai..."
            className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-sky-300 text-sm font-mono focus:outline-none focus:border-sky-500/70"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Dự án liên quan (Tùy chọn)</label>
          <SelectField
            value={selectedProjectName}
            options={[{ value: "", label: "Không có" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
            onChange={onProjectChange}
          />
        </div>
      </div>
    </div>
  );
}
