"use client";

import { FolderGit2 } from "lucide-react";
import type { ProjectsListPayload } from "@/types/chat";

interface ProjectsListCardProps {
  projectsListData: ProjectsListPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function ProjectsListCard({ projectsListData, onRunSlashCommand }: ProjectsListCardProps): React.JSX.Element {
  const { projects } = projectsListData;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-bold text-white text-sm sm:text-base">
        <FolderGit2 size={16} className="text-purple-400" />
        <span>Danh sách các dự án hiện có ({projects.length} dự án):</span>
      </div>

      <div className="space-y-2.5">
        {projects.map((p) => (
          <div
            key={p.name}
            className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-2 text-xs"
          >
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="font-bold text-white text-sm sm:text-base">{p.name}</span>
              <span className="font-mono text-purple-300 font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-xs">
                {p.totalHours}h ({p.totalEffortMinutes}m)
              </span>
            </div>

            <div className="text-neutral-400 flex items-center gap-2 flex-wrap">
              <span>Thành viên: <strong className="text-neutral-200">{p.assignedMembers.join(", ") || "Chưa gán"}</strong></span>
              <span>&bull;</span>
              <span className="text-neutral-300">
                <span className="text-sky-300 font-semibold">{p.activeTaskCount}</span> task đang làm &bull;{" "}
                <span className="text-emerald-300 font-semibold">{p.doneTaskCount}</span> task hoàn thành
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Lệnh nhanh:</span>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/report")}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
        >
          📑 /report báo cáo chi tiết
        </button>
      </div>
    </div>
  );
}
