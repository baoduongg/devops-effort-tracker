"use client";

import type { LoadPayload } from "@/types/chat";

interface LoadCardProps {
  loadData: LoadPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function LoadCard({ loadData, onRunSlashCommand }: LoadCardProps): React.JSX.Element {
  const { members } = loadData;

  return (
    <div className="space-y-3">
      <p className="text-neutral-200 font-semibold leading-relaxed text-xs sm:text-sm">
        ⚡ <strong>Tình trạng tải công việc và băng thông (Bandwidth) từng kỹ sư:</strong>
      </p>

      <div className="space-y-2">
        {members.map((m) => {
          const isOverload = m.statusVariant === "overload" || m.effortMinutes > 480;
          const isFree = m.statusVariant === "free" || m.effortMinutes === 0;
          const isBusy = m.statusVariant === "busy" || (m.effortMinutes >= 288 && m.effortMinutes <= 480);

          let borderClass = "border-white/[0.08] hover:border-white/[0.15]";
          let badgeColor = "text-sky-300";
          let badgeIcon = "🔵";

          if (isOverload) {
            borderClass = "border-rose-500/25 hover:border-rose-500/40";
            badgeColor = "text-rose-400";
            badgeIcon = "🔴";
          } else if (isFree) {
            borderClass = "border-emerald-500/25 hover:border-emerald-500/40";
            badgeColor = "text-emerald-400";
            badgeIcon = "🟢";
          } else if (isBusy) {
            borderClass = "border-amber-500/20 hover:border-amber-500/35";
            badgeColor = "text-amber-300";
            badgeIcon = "🟡";
          }

          return (
            <div
              key={m.name}
              className={`p-3 sm:p-3.5 rounded-xl bg-black/40 border transition-all flex items-center justify-between text-xs sm:text-sm gap-2 ${borderClass}`}
            >
              <div>
                <span className="font-bold text-white">{m.name}</span>
                <span className="text-neutral-400 ml-1.5 text-xs">({m.role})</span>
              </div>
              <span className={`font-mono font-bold text-xs sm:text-sm ${badgeColor} shrink-0`}>
                {m.effortMinutes}m / {m.capacityMinutes}m ({m.percentage}% {badgeIcon})
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Gợi ý hành động:</span>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/free")}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition-all cursor-pointer"
        >
          🟢 /free kỹ sư rảnh
        </button>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/overload")}
          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
        >
          🔴 /overload kỹ sư quá tải
        </button>
      </div>
    </div>
  );
}
