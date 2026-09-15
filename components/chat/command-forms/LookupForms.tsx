import React from "react";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import { SelectField } from "./shared";

interface InfoLookupFormProps {
  members: Member[];
  selectedMemberName: string;
  onMemberChange: (value: string) => void;
}

export function InfoLookupForm({ members, selectedMemberName, onMemberChange }: InfoLookupFormProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-neutral-300 block">Chọn thành viên cần tra cứu</label>
      <SelectField
        value={selectedMemberName}
        options={members.map((m) => ({
          value: m.id,
          label: `${m.name} (${m.role === "leader" ? "Leader" : m.status || "DevOps"})`,
        }))}
        className="w-full p-3 pr-9 rounded-xl bg-[#0d1322] border border-white/[0.1] text-white text-sm font-semibold focus:outline-none focus:border-sky-500/70 appearance-none cursor-pointer"
        onChange={onMemberChange}
      />
    </div>
  );
}

interface TaskLookupFormProps {
  taskTitle: string;
  onTaskTitleChange: (value: string) => void;
}

export function TaskLookupForm({ taskTitle, onTaskTitleChange }: TaskLookupFormProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-neutral-300 block">
        Tên hoặc từ khóa của task cần tra cứu
      </label>
      <input
        type="text"
        value={taskTitle}
        onChange={(e) => onTaskTitleChange(e.target.value)}
        placeholder="VD: Setup CI/CD Pipeline GitLab with Docker Runners"
        className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white text-sm focus:outline-none focus:border-sky-500/70"
      />
    </div>
  );
}

interface ProjectLookupFormProps {
  projects: Project[];
  selectedProjectName: string;
  onProjectChange: (value: string) => void;
}

export function ProjectLookupForm({
  projects,
  selectedProjectName,
  onProjectChange,
}: ProjectLookupFormProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-neutral-300 block">Chọn dự án cần tra cứu</label>
      <SelectField
        value={selectedProjectName}
        options={projects.map((p) => ({ value: p.id, label: p.name }))}
        className="w-full p-3 pr-9 rounded-xl bg-[#0d1322] border border-white/[0.1] text-white text-sm font-semibold focus:outline-none focus:border-sky-500/70 appearance-none cursor-pointer"
        onChange={onProjectChange}
      />
    </div>
  );
}
