"use client";

import { Clock, ShieldAlert } from "lucide-react";
import type { OverduePayload } from "@/types/chat";

interface OverdueCardProps {
  overdueData: OverduePayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function OverdueCard({ overdueData, onRunSlashCommand }: OverdueCardProps): React.JSX.Element {
  const { tasks } = overdueData;

  if (tasks.length === 0) {
    return (
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <span>🟢 Không có task nào bị trễ hạn. Toàn bộ các task đều đang đúng tiến độ!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2 text-xs font-semibold">
        <Clock size={16} className="text-amber-400 shrink-0" />
        <span>Phát hiện {tasks.length} task đang bị trễ hạn hoặc cận kề deadline:</span>
      </div>

      <div className="space-y-2">
        {tasks.map((t, idx) => {
          const isSeverelyOverdue = t.daysOverdue > 1;
          const isDueToday = t.daysOverdue === 0;

          return (
            <div
              key={`${t.title}-${idx}`}
              className={`p-3.5 rounded-xl border flex justify-between items-center text-xs gap-3 transition-all ${
                isSeverelyOverdue
                  ? "bg-rose-500/10 border-rose-500/25 hover:border-rose-500/40"
                  : "bg-amber-500/10 border-amber-500/25 hover:border-amber-500/40"
              }`}
            >
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">{t.title}</div>
                <div className="text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Phụ trách: <strong className="text-neutral-200">{t.memberName}</strong></span>
                  <span>&bull;</span>
                  <span>Dự án: {t.projectName}</span>
                  <span>&bull;</span>
                  <span>Hạn: {t.endDate}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded font-mono font-bold shrink-0 text-xs ${
                  isSeverelyOverdue
                    ? "bg-rose-900/60 text-rose-300 border border-rose-700/50"
                    : isDueToday
                      ? "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                      : "bg-rose-900/60 text-rose-300 border border-rose-700/50"
                }`}
              >
                {t.daysOverdue > 0 ? `Trễ ${t.daysOverdue} ngày 🔴` : "Hạn hôm nay 🟡"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Khuyến nghị xử lý:</span>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/reassign")}
          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1"
        >
          <ShieldAlert size={13} />
          /reassign chuyển bớt task
        </button>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/free")}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
        >
          🔍 /free tìm người hỗ trợ
        </button>
      </div>
    </div>
  );
}
