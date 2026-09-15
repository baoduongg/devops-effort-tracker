"use client";

import type { MemberAvailability } from "@/types/chat";

interface MemberAvailabilityCardProps {
  availability: MemberAvailability;
  onRunSlashCommand?: (slashCommand: string) => void;
}

export function MemberAvailabilityCard({ availability, onRunSlashCommand }: MemberAvailabilityCardProps): React.JSX.Element {
  const { members, suggestedActions } = availability;

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const todayFormatted = `${day}/${month}/${year}`;

  const freeMembers = members.filter(
    (m) => m.statusVariant === "success" || m.effortMinutes === 0 || m.effortMinutes < 288
  );
  const freeCount = freeMembers.length;

  return (
    <div className="space-y-3">
      <p className="text-neutral-300 leading-relaxed text-xs sm:text-sm">
        Dựa trên dữ liệu snapshot Firestore hôm nay ({todayFormatted}), hiện có{" "}
        {freeCount > 0 ? (
          <strong className="text-emerald-300 font-bold">{freeCount} kỹ sư</strong>
        ) : (
          <strong className="text-amber-300 font-bold">0 kỹ sư</strong>
        )}{" "}
        {freeCount > 0
          ? "đang có thời gian trống hoặc sẵn sàng nhận thêm task:"
          : "đang rảnh — toàn bộ đội ngũ hiện đang bận hoặc quá tải:"}
      </p>

      {members.length === 0 ? (
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 text-xs">
          Không tìm thấy thành viên nào trong danh sách.
        </div>
      ) : (
        <div className="space-y-2.5">
          {members.map((member) => {
            const isFree = member.statusVariant === "success" || member.effortMinutes === 0 || member.effortMinutes < 288;
            const isOverloaded = member.statusVariant === "error" || member.effortMinutes > 480;
            const isWarning = member.statusVariant === "warning" || (member.effortMinutes >= 288 && member.effortMinutes <= 480);
            const remainingMinutes = Math.max(0, member.capacityMinutes - member.effortMinutes);

            let statusBadgeText = member.statusLabel;
            if (isFree) {
              statusBadgeText = member.effortMinutes === 0 ? "🟢 Rảnh 100%" : `🟢 ${member.statusLabel || "Trống việc (rảnh)"}`;
            } else if (isOverloaded) {
              statusBadgeText = `🔴 ${member.statusLabel || "Quá tải"}`;
            } else if (isWarning) {
              statusBadgeText = `🟡 ${member.statusLabel || "Rảnh chiều (>14:00)"}`;
            } else {
              statusBadgeText = `🔵 ${member.statusLabel}`;
            }

            const roleDisplay =
              member.role === "devops"
                ? "Cloud / DevOps Eng"
                : member.role === "leader"
                  ? "DevOps Lead"
                  : member.role;

            return (
              <div
                key={member.id}
                className={`p-3.5 sm:p-4 rounded-xl bg-black/40 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isFree
                    ? "border-emerald-500/25 hover:border-emerald-500/40"
                    : isOverloaded
                      ? "border-rose-500/30 hover:border-rose-500/50"
                      : isWarning
                        ? "border-white/[0.08] hover:border-white/[0.15]"
                        : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base">{member.name}</span>
                    <span className="text-xs text-neutral-400">({roleDisplay})</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isFree
                          ? "bg-emerald-500/20 text-emerald-300"
                          : isOverloaded
                            ? "bg-rose-500/20 text-rose-300"
                            : isWarning
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-sky-500/20 text-sky-300"
                      }`}
                    >
                      {statusBadgeText}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>
                      Đã log: {member.effortMinutes}m / {member.capacityMinutes}m
                    </span>
                    {member.skills && member.skills.length > 0 && (
                      <>
                        <span>&bull;</span>
                        <span>Kỹ năng: {member.skills.join(", ")}</span>
                      </>
                    )}
                    {member.activeTaskTitle && (
                      <>
                        <span>&bull;</span>
                        <span className="text-neutral-300">Đang làm: {member.activeTaskTitle}</span>
                      </>
                    )}
                    {remainingMinutes > 0 && member.effortMinutes > 0 && (
                      <>
                        <span>&bull;</span>
                        <span className="text-emerald-400/90">Còn trống {remainingMinutes} phút</span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold shrink-0 self-start sm:self-auto border ${
                    isFree
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : isOverloaded
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : isWarning
                          ? "bg-white/[0.05] text-neutral-300 border-white/[0.08]"
                          : "bg-white/[0.05] text-neutral-300 border-white/[0.08]"
                  }`}
                >
                  {member.effortMinutes}m / {member.capacityMinutes}m
                </span>
              </div>
            );
          })}
        </div>
      )}

      {suggestedActions.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-400 font-medium">Gợi ý hành động:</span>
          {suggestedActions.map((action) => {
            const isAssign = action.slashCommand.startsWith("/assign");
            return (
              <button
                key={action.slashCommand}
                type="button"
                onClick={() => onRunSlashCommand?.(action.slashCommand)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  isAssign
                    ? "bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-semibold border border-sky-500/30"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-medium border border-white/[0.08]"
                }`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
