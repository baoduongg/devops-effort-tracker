"use client";

import { User } from "lucide-react";
import type { MemberInfoPayload } from "@/types/chat";

interface MemberInfoCardProps {
  memberInfoData: MemberInfoPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function MemberInfoCard({ memberInfoData, onRunSlashCommand }: MemberInfoCardProps): React.JSX.Element {
  const {
    name,
    position,
    effortMinutes,
    capacityMinutes,
    statusLabel,
    skills,
    activeTasks,
    plannedTasks,
    projects,
  } = memberInfoData;

  const isOverloaded = effortMinutes > 480;
  const isFree = effortMinutes === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-bold text-white text-sm sm:text-base">
        <User size={16} className="text-sky-400 shrink-0" />
        <span>Hồ sơ năng lực & Tình hình của {name}:</span>
      </div>

      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5 text-xs">
        <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.06]">
          <span className="text-neutral-400">Vị trí:</span>
          <span className="text-white font-medium">{position}</span>
        </div>

        <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.06]">
          <span className="text-neutral-400">Trạng thái hôm nay:</span>
          <span
            className={`font-mono font-bold ${
              isOverloaded ? "text-rose-400" : isFree ? "text-emerald-400" : "text-sky-300"
            }`}
          >
            {statusLabel} ({effortMinutes}m/{capacityMinutes}m)
          </span>
        </div>

        {skills.length > 0 && (
          <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.06]">
            <span className="text-neutral-400">Chuyên môn chính:</span>
            <span className="text-neutral-200">{skills.join(", ")}</span>
          </div>
        )}

        {projects.length > 0 && (
          <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.06]">
            <span className="text-neutral-400">Dự án tham gia:</span>
            <span className="text-sky-300">{projects.join(", ")}</span>
          </div>
        )}

        {activeTasks.length > 0 && (
          <div className="pt-1">
            <span className="text-neutral-400 block mb-1">Task đang thực hiện ({activeTasks.length}):</span>
            <div className="space-y-1">
              {activeTasks.map((t, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/[0.03] flex justify-between items-center">
                  <span className="text-white font-medium">{t.title}</span>
                  <span className="text-neutral-400 font-mono text-[11px]">{t.project} &bull; {t.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {plannedTasks.length > 0 && (
          <div className="pt-1">
            <span className="text-neutral-400 block mb-1">Task kế hoạch ({plannedTasks.length}):</span>
            <div className="space-y-1">
              {plannedTasks.map((t, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/[0.02] flex justify-between items-center">
                  <span className="text-neutral-300">{t.title}</span>
                  <span className="text-neutral-400 font-mono text-[11px]">{t.project} &bull; {t.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Lệnh nhanh:</span>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.(`/assign ${name}`)}
          className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all cursor-pointer"
        >
          👉 Giao task cho {name}
        </button>
      </div>
    </div>
  );
}
