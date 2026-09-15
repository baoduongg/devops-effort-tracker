"use client";

import type { ReportPayload } from "@/types/chat";

interface ReportCardProps {
  reportData: ReportPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function ReportCard({ reportData, onRunSlashCommand }: ReportCardProps): React.JSX.Element {
  const { projects } = reportData;

  if (projects.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 text-xs">
        📑 Hiện chưa có dự án nào trong hệ thống.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-neutral-200 font-semibold leading-relaxed text-xs sm:text-sm">
        📑 <strong>Báo cáo phân bổ Effort theo từng dự án:</strong>
      </p>

      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5 text-xs font-mono">
        {projects.map((p, idx) => (
          <div
            key={p.name}
            className="flex justify-between items-center text-neutral-300 pb-2 border-b border-white/[0.06] last:border-0 last:pb-0 flex-wrap gap-2"
          >
            <div>
              <span className="text-white font-bold font-sans text-xs sm:text-sm">
                {idx + 1}. {p.name}
              </span>
              {p.assignedMembers.length > 0 && (
                <span className="text-neutral-400 font-sans ml-1 text-[11px]">
                  ({p.assignedMembers.join(", ")})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sky-300 font-bold">
                {p.totalHours}h ({p.totalEffortMinutes}m)
              </span>
              <span className="text-neutral-400 font-sans text-xs">
                &bull; <strong className="text-neutral-200">{p.activeTaskCount}</strong> task đang làm
              </span>
              {p.warning && (
                <span className="text-amber-400 font-sans text-[11px] font-semibold">
                  ⚠️ {p.warning}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Lệnh nhanh:</span>
        <button
          type="button"
          onClick={() => onRunSlashCommand?.("/projects")}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
        >
          📂 /projects xem chi tiết
        </button>
      </div>
    </div>
  );
}
