import { BellRing } from "lucide-react";
import { Grid } from "@astryxdesign/core/Grid";
import { DateTimeInput } from "@astryxdesign/core/DateTimeInput";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { Selector } from "@astryxdesign/core/Selector";
import type { ISODateTimeString } from "@astryxdesign/core/DateTimeInput";
import { REMINDER_PRESET_OPTIONS } from "@/types/task";

const PRESET_MINUTES = new Set(["15", "30", "60"]);

// DateTimeInput's value/onChange use local-time "YYYY-MM-DDTHH:MM" (no timezone suffix),
// while deployAt is stored as a UTC ISO string — convert at this component's boundary.
function toLocalDateTimeValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface TaskAlarmFieldsProps {
  deployAt: string | null;
  onDeployAtChange: (v: string | null) => void;
  reminderMinutesBefore: number | null;
  onReminderMinutesBeforeChange: (v: number | null) => void;
}

/** Optional deploy-time alarm fields, shared by task-create-modal and task-edit-modal. */
export function TaskAlarmFields({
  deployAt,
  onDeployAtChange,
  reminderMinutesBefore,
  onReminderMinutesBeforeChange,
}: TaskAlarmFieldsProps): React.JSX.Element {
  const presetValue =
    reminderMinutesBefore !== null && PRESET_MINUTES.has(String(reminderMinutesBefore))
      ? String(reminderMinutesBefore)
      : "custom";

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
      <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
        <BellRing size={13} className="text-amber-400" />
        Nhắc giờ triển khai (Tùy chọn)
      </span>
      <p className="text-[11px] text-neutral-500 leading-snug">
        Đặt đúng khung giờ triển khai hạ tầng đã được approve. Hệ thống sẽ nhắc trước qua ChatOps để
        không trôi lịch.
      </p>

      <DateTimeInput
        label="Giờ triển khai"
        hasClear
        timeOptionInterval={15}
        placeholder="Chưa đặt"
        value={(deployAt ? toLocalDateTimeValue(deployAt) : undefined) as ISODateTimeString | undefined}
        onChange={(v) => onDeployAtChange(v ? new Date(v).toISOString() : null)}
      />

      {deployAt && (
        <Grid columns={presetValue === "custom" ? 2 : 1} gap={2}>
          <Selector
            label="Nhắc trước"
            options={REMINDER_PRESET_OPTIONS}
            value={presetValue}
            onChange={(v) => onReminderMinutesBeforeChange(v === "custom" ? 45 : Number(v))}
          />
          {presetValue === "custom" && (
            <NumberInput
              label="Số phút"
              min={1}
              value={reminderMinutesBefore}
              onChange={onReminderMinutesBeforeChange}
            />
          )}
        </Grid>
      )}
    </div>
  );
}
