"use client";

import { AlertTriangle, ShieldAlert, ArrowRightLeft } from "lucide-react";
import type { OverloadPayload } from "@/types/chat";

interface OverloadCardProps {
  overloadData: OverloadPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function OverloadCard({ overloadData, onRunSlashCommand }: OverloadCardProps): React.JSX.Element {
  const { overloadedMembers, suggestedActions = [] } = overloadData;

  if (overloadedMembers.length === 0) {
    return (
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <span>🟢 Tất cả thành viên đều trong ngưỡng an toàn (&le;480m/ngày). Không có ai bị quá tải!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2 text-xs font-semibold">
        <AlertTriangle size={16} className="text-rose-400 shrink-0" />
        <span>
          Cảnh báo quá tải: Phát hiện {overloadedMembers.length} thành viên vượt ngưỡng an toàn (&gt;480m/ngày):
        </span>
      </div>

      <div className="space-y-2.5">
        {overloadedMembers.map((member) => (
          <div
            key={member.name}
            className="p-4 rounded-xl bg-black/40 border border-rose-500/30 space-y-2.5 transition-all hover:border-rose-500/50"
          >
            <div className="flex justify-between items-center text-sm flex-wrap gap-2">
              <div>
                <span className="font-bold text-white text-base">{member.name}</span>
                <span className="text-xs text-neutral-400 ml-1.5">({member.role})</span>
              </div>
              <span className="font-mono text-rose-400 font-bold bg-rose-500/20 px-2.5 py-0.5 rounded-lg border border-rose-500/30 text-xs">
                {member.effortMinutes}m / {member.capacityMinutes}m ({member.percentage}% 🔴)
              </span>
            </div>

            {member.taskTitles.length > 0 && (
              <p className="text-xs text-neutral-300 leading-relaxed">
                Đang gánh đồng thời {member.taskTitles.length} task:{" "}
                <em>{member.taskTitles.join(", ")}</em>.
              </p>
            )}

            {member.suggestedReassignTarget && (
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-400 flex items-center gap-1.5 flex-wrap">
                <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                <span>
                  Khuyến nghị: Dùng lệnh <code>/reassign</code> để chuyển bớt task sang{" "}
                  <strong className="text-neutral-200">{member.suggestedReassignTarget}</strong> (đang rảnh).
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {suggestedActions.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
          {suggestedActions.map((action) => (
            <button
              key={action.slashCommand}
              type="button"
              onClick={() => onRunSlashCommand?.(action.slashCommand)}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft size={13} />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
