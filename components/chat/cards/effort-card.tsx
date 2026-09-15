"use client";

import type { EffortPayload } from "@/types/chat";

interface EffortCardProps {
  effortData: EffortPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

const MEMBER_COLORS = [
  { bg: "bg-sky-500", text: "text-sky-300" },
  { bg: "bg-rose-500", text: "text-rose-400" },
  { bg: "bg-cyan-500", text: "text-cyan-300" },
  { bg: "bg-emerald-500", text: "text-emerald-400" },
  { bg: "bg-amber-500", text: "text-amber-300" },
  { bg: "bg-purple-500", text: "text-purple-300" },
];

export function EffortCard({ effortData, onRunSlashCommand }: EffortCardProps): React.JSX.Element {
  const { totalEffortMinutes, totalCapacityMinutes, overallPercentage, members } = effortData;

  return (
    <div className="space-y-3">
      <p className="text-neutral-200 font-semibold leading-relaxed text-xs sm:text-sm">
        📊 <strong>Tổng hợp phân bổ Effort & thời lượng toàn đội ngũ hôm nay:</strong>
      </p>

      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3">
        <div className="flex justify-between items-center text-xs sm:text-sm flex-wrap gap-2">
          <span className="text-neutral-300">Tổng thời lượng đã phân bổ:</span>
          <span className="font-mono text-violet-300 font-bold text-sm">
            {totalEffortMinutes.toLocaleString()}m / {totalCapacityMinutes.toLocaleString()}m ({overallPercentage}%)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-white/[0.08] overflow-hidden flex">
          {members.map((m, idx) => {
            const widthPercent = totalCapacityMinutes > 0 ? (m.effortMinutes / totalCapacityMinutes) * 100 : 0;
            const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
            if (widthPercent <= 0) return null;
            return (
              <div
                key={m.name}
                className={`h-full ${color.bg}`}
                style={{ width: `${Math.min(100, widthPercent)}%` }}
                title={`${m.name}: ${m.effortMinutes}m (${m.percentage}%)`}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
          {members.map((m, idx) => {
            const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
            return (
              <div key={m.name} className={`${color.text} truncate`}>
                ● {m.name}: {m.effortMinutes}m ({m.percentage}%)
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Lệnh liên quan:</span>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/load")}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
        >
          ⚡ /load xem tải
        </button>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/free")}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
        >
          🔍 /free ai rảnh
        </button>
      </div>
    </div>
  );
}
