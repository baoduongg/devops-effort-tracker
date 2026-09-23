import React, { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import type { SlashCommand } from "@/lib/slash-commands";
import { TASK_STATUS_OPTIONS as STATUS_OPTIONS } from "@/types/task";
import {
  effortUnitToMinutes,
  minutesToEffortUnit,
  pickDisplayEffortUnit,
  EFFORT_UNIT_OPTIONS,
  type EffortUnit,
} from "@/lib/effort";

export { STATUS_OPTIONS };

export const DURATION_PRESETS = [
  { label: "30p", minutes: 30, text: "30 phút" },
  { label: "1h", minutes: 60, text: "1 giờ 00 phút" },
  { label: "1.5h", minutes: 90, text: "1 giờ 30 phút" },
  { label: "2h", minutes: 120, text: "2 giờ 00 phút" },
  { label: "3h", minutes: 180, text: "3 giờ 00 phút" },
  { label: "4h", minutes: 240, text: "4 giờ 00 phút" },
  { label: "6h", minutes: 360, text: "6 giờ 00 phút" },
  { label: "8h", minutes: 480, text: "8 giờ 00 phút" },
];

export function formatEffortDurationLabel(minutes: number): string {
  const match = DURATION_PRESETS.find((p) => p.minutes === minutes);
  if (match) return match.text;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours > 0 && remainingMins > 0) {
    return `${hours} giờ ${String(remainingMins).padStart(2, "0")} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ 00 phút`;
  }
  return `${remainingMins} phút`;
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getModalTitle(command: SlashCommand): string {
  switch (command.id) {
    case "coord-assign":
      return "Giao việc cho thành viên";
    case "coord-reassign":
      return "Chuyển task cho người khác";
    case "coord-add":
      return "Lập kế hoạch công việc mới";
    case "coord-log":
      return "Ghi nhận công việc hoàn thành";
    case "coord-remove":
      return "Xóa task khỏi hệ thống";
    case "detail-info":
      return "Tra cứu thông tin thành viên";
    case "detail-task":
      return "Tra cứu thông tin task";
    case "detail-project":
      return "Tra cứu thông tin dự án";
    default:
      return command.label || "Điền mẫu lệnh";
  }
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function SelectField({ value, onChange, options, className }: SelectFieldProps): React.JSX.Element {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          className ||
          "w-full p-3 pr-9 rounded-xl bg-[#0d1322] border border-white/[0.1] text-neutral-200 text-sm focus:outline-none focus:border-sky-500/70 transition-colors appearance-none cursor-pointer"
        }
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
      />
    </div>
  );
}

interface DurationPresetPickerProps {
  effortMinutes: number;
  onChange: (minutes: number) => void;
  durationStr: string;
}

export function DurationPresetPicker({
  effortMinutes,
  onChange,
  durationStr,
}: DurationPresetPickerProps): React.JSX.Element {
  const [effortUnit, setEffortUnit] = useState<EffortUnit>(() => pickDisplayEffortUnit(effortMinutes));
  const effortValue = minutesToEffortUnit(effortMinutes, effortUnit);

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-neutral-200 font-medium flex items-center gap-1.5">
          <Clock size={15} className="text-sky-400" />
          Tổng thời lượng thực hiện: <span className="text-sky-300 font-bold font-mono">{durationStr}</span>
        </span>
      </div>
      <p className="text-[11px] text-neutral-500 leading-snug">
        Tổng thời gian devops cần để hoàn thành task này (quy đổi theo 1 ngày làm việc = 8 giờ).
      </p>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <input
          type="number"
          min={1}
          step={effortUnit === "minutes" ? 5 : 1}
          value={effortValue}
          onChange={(e) => {
            const raw = e.target.valueAsNumber;
            onChange(effortUnitToMinutes(Number.isNaN(raw) ? 1 : raw, effortUnit));
          }}
          className="w-full p-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-neutral-200 text-sm font-mono focus:outline-none focus:border-sky-500/70"
        />
        <SelectField
          value={effortUnit}
          options={EFFORT_UNIT_OPTIONS}
          onChange={(v) => {
            const unit = v as EffortUnit;
            setEffortUnit(unit);
            onChange(effortUnitToMinutes(1, unit));
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {DURATION_PRESETS.map((p) => (
          <button
            key={p.minutes}
            type="button"
            onClick={() => {
              onChange(p.minutes);
              setEffortUnit(pickDisplayEffortUnit(p.minutes));
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              effortMinutes === p.minutes
                ? "bg-sky-500/25 text-sky-200 border-sky-400/50 shadow-sm shadow-sky-500/20"
                : "bg-white/[0.03] text-neutral-300 border-white/[0.08] hover:bg-white/[0.08]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
