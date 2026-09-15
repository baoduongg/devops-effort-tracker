"use client";

import type { MembersListPayload } from "@/types/chat";

interface MembersListCardProps {
  membersListData: MembersListPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function MembersListCard({ membersListData, onRunSlashCommand }: MembersListCardProps): React.JSX.Element {
  const { members } = membersListData;

  return (
    <div className="space-y-3">
      <p className="text-neutral-200 font-semibold leading-relaxed text-xs sm:text-sm">
        👥 <strong>Danh sách {members.length} thành viên đội ngũ DevOps & SRE:</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {members.map((m) => {
          const isOverloaded = m.statusVariant === "overload" || m.effortMinutes > 480;
          const isFree = m.statusVariant === "free" || m.effortMinutes === 0;

          return (
            <div
              key={m.id || m.name}
              className={`p-3.5 rounded-xl bg-black/40 border transition-all ${
                isOverloaded
                  ? "border-rose-500/30 hover:border-rose-500/50"
                  : isFree
                    ? "border-emerald-500/25 hover:border-emerald-500/40"
                    : "border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{m.name}</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    isOverloaded ? "text-rose-400" : isFree ? "text-emerald-400" : "text-sky-300"
                  }`}
                >
                  {m.statusLabel}
                </span>
              </div>
              <div className="text-neutral-400 mt-1">
                {m.role} &bull; <span className="font-mono text-neutral-300">{m.effortMinutes}m/{m.capacityMinutes}m</span>
              </div>
              {m.skills && m.skills.length > 0 && (
                <div className="text-neutral-400 text-[11px] mt-1.5 truncate">
                  Kỹ năng: <span className="text-neutral-300">{m.skills.join(", ")}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Lệnh nhanh:</span>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/assign")}
          className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all cursor-pointer"
        >
          👉 /assign giao task
        </button>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/load")}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
        >
          ⚡ /load xem tải
        </button>
      </div>
    </div>
  );
}
