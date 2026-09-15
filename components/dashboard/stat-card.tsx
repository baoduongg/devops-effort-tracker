import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive";
  isSelected?: boolean;
}

const toneConfig = {
  primary: {
    iconColor: "text-sky-400",
    iconBgSelected: "bg-sky-500/20 border-sky-400/40 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.35)]",
    iconBgDefault: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    selectedContainer:
      "bg-gradient-to-br from-sky-500/25 via-blue-950/40 to-[#0F172A]/90 border-sky-400/90 shadow-[0_12px_35px_rgba(56,189,248,0.28)] ring-2 ring-sky-400/60",
    badge: "bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.6)] border-sky-300/40",
    glowOrb: "bg-sky-400/30",
    sheen: "via-sky-400/80",
    numberColorSelected: "text-sky-100",
  },
  success: {
    iconColor: "text-emerald-400",
    iconBgSelected: "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]",
    iconBgDefault: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    selectedContainer:
      "bg-gradient-to-br from-emerald-500/25 via-teal-950/40 to-[#0F172A]/90 border-emerald-400/90 shadow-[0_12px_35px_rgba(16,185,129,0.28)] ring-2 ring-emerald-400/60",
    badge: "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)] border-emerald-300/40",
    glowOrb: "bg-emerald-400/30",
    sheen: "via-emerald-400/80",
    numberColorSelected: "text-emerald-100",
  },
  warning: {
    iconColor: "text-amber-400",
    iconBgSelected: "bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]",
    iconBgDefault: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    selectedContainer:
      "bg-gradient-to-br from-amber-500/25 via-orange-950/40 to-[#0F172A]/90 border-amber-400/90 shadow-[0_12px_35px_rgba(245,158,11,0.28)] ring-2 ring-amber-400/60",
    badge: "bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.6)] border-amber-300/40",
    glowOrb: "bg-amber-400/30",
    sheen: "via-amber-400/80",
    numberColorSelected: "text-amber-100",
  },
  destructive: {
    iconColor: "text-rose-400",
    iconBgSelected: "bg-rose-500/20 border-rose-400/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)]",
    iconBgDefault: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    selectedContainer:
      "bg-gradient-to-br from-rose-500/25 via-red-950/40 to-[#0F172A]/90 border-rose-400/90 shadow-[0_12px_35px_rgba(244,63,94,0.28)] ring-2 ring-rose-400/60",
    badge: "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] border-rose-300/40",
    glowOrb: "bg-rose-400/30",
    sheen: "via-rose-400/80",
    numberColorSelected: "text-rose-100",
  },
};

export function StatCard({
  label,
  value,
  icon: IconComponent,
  tone = "primary",
  isSelected = false,
}: StatCardProps): React.JSX.Element {
  const cfg = toneConfig[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] h-full flex flex-col justify-between select-none ${
        isSelected
          ? `${cfg.selectedContainer} translate-y-[-2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`
          : "bg-[#0F172A]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#1E293B]/70 hover:shadow-lg hover:translate-y-[-1px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]"
      }`}
    >
      {/* Ambient Top-Right Glow when Selected */}
      {isSelected && (
        <>
          <div
            className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-70 ${cfg.glowOrb}`}
          />
          <div
            className={`absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent ${cfg.sheen} to-transparent`}
          />
        </>
      )}

      {/* Top Header: Icon & Active Badge */}
      <div className="flex items-center justify-between w-full relative z-10 mb-3">
        <div
          className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center ${
            isSelected ? cfg.iconBgSelected : cfg.iconBgDefault
          }`}
        >
          <IconComponent size={20} className={isSelected ? "scale-105 transition-transform duration-300" : ""} />
        </div>

        {isSelected && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border animate-in fade-in zoom-in-95 duration-200 ${cfg.badge}`}
          >
            <Check size={11} strokeWidth={3.5} />
            Đang lọc
          </span>
        )}
      </div>

      {/* Body: Big Value & Label */}
      <div className="flex flex-col gap-0.5 relative z-10">
        <span
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono tabular-nums transition-colors duration-200 ${
            isSelected ? cfg.numberColorSelected : "text-slate-100"
          }`}
        >
          {value}
        </span>
        <span
          className={`text-xs font-medium transition-colors duration-200 ${
            isSelected ? "text-slate-200 font-semibold" : "text-slate-400"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}


