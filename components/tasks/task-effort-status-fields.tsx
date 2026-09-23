import { Clock } from "lucide-react";
import { Grid } from "@astryxdesign/core/Grid";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Selector } from "@astryxdesign/core/Selector";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { formatEffortDuration, EFFORT_UNIT_OPTIONS, type EffortUnit } from "@/lib/effort";
import { TASK_STATUS_OPTIONS, type TaskStatus } from "@/types/task";

interface TaskEffortStatusFieldsProps {
  effortValue: number;
  onEffortValueChange: (v: number) => void;
  effortUnit: EffortUnit;
  onEffortUnitChange: (unit: EffortUnit) => void;
  effortMinutes: number;
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string | null;
  onEndDateChange: (v: string | null) => void;
}

/** Effort input + status + date range fields, shared by task-create-modal and task-edit-modal. */
export function TaskEffortStatusFields({
  effortValue,
  onEffortValueChange,
  effortUnit,
  onEffortUnitChange,
  effortMinutes,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: TaskEffortStatusFieldsProps): React.JSX.Element {
  return (
    <>
      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
            <Clock size={13} className="text-sky-400" />
            Tổng thời lượng thực hiện: <span className="text-sky-300 font-semibold">{formatEffortDuration(effortMinutes)}</span>
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 leading-snug">
          Tổng thời gian devops cần để hoàn thành task này (quy đổi theo 1 ngày làm việc = 8 giờ). Nếu để trống Deadline, hệ thống tự tính dựa trên giá trị này.
        </p>

        <Grid columns={2} gap={2} className="pt-1">
          <NumberInput
            label="Thời gian"
            min={1}
            step={effortUnit === "minutes" ? 5 : 1}
            value={effortValue}
            onChange={(v) => onEffortValueChange(v ?? 1)}
          />
          <Selector
            label="Đơn vị"
            options={EFFORT_UNIT_OPTIONS}
            value={effortUnit}
            onChange={(v) => onEffortUnitChange(v as EffortUnit)}
          />
        </Grid>
      </div>

      <Selector
        label="Trạng thái"
        options={TASK_STATUS_OPTIONS}
        value={status}
        onChange={(v) => onStatusChange(v as TaskStatus)}
      />

      <Grid columns={2} gap={3}>
        <DateInput
          label="Ngày bắt đầu"
          format="date"
          width="100%"
          isRequired
          value={startDate as ISODateString}
          onChange={(v) => onStartDateChange(v ?? startDate)}
        />

        <DateInput
          label="Hạn hoàn thành (Deadline)"
          format="date"
          width="100%"
          hasClear
          placeholder="Tùy chọn"
          value={(endDate || undefined) as ISODateString | undefined}
          onChange={(v) => onEndDateChange(v || null)}
        />
      </Grid>
    </>
  );
}
