"use client";

import { useState, useMemo } from "react";
import { Save, Clock } from "lucide-react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { TextInput } from "@astryxdesign/core/TextInput";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { updateTask } from "@/services/tasks.service";
import { syncMemberEffortStatus } from "@/services/members.service";
import { notifyTaskStatusChanged, notifyTaskReassigned } from "@/services/chatops.service";
import {
  formatEffortDuration,
  effortUnitToMinutes,
  minutesToEffortUnit,
  pickDisplayEffortUnit,
  EFFORT_UNIT_OPTIONS,
  type EffortUnit,
} from "@/lib/effort";
import { formatDateLocal, parseDateLocal } from "@/lib/date";
import type { Project } from "@/types/project";
import type { Member } from "@/types/member";
import type { Task, TaskStatus } from "@/types/task";

interface TaskEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  projects: Project[];
  members: Member[];
  onTaskUpdated?: (taskId: string) => void;
}

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Đang thực hiện (In Progress)" },
  { value: "planned", label: "Kế hoạch (Planned)" },
  { value: "done", label: "Hoàn thành (Done)" },
];

// Task dates come back as full ISO datetime strings; DateInput needs YYYY-MM-DD
function toDateInputValue(iso: string | null): string {
  if (!iso) return formatDateLocal(new Date());
  return formatDateLocal(parseDateLocal(iso));
}

export function TaskEditModal(props: TaskEditModalProps): React.JSX.Element {
  // Remount the form whenever a different task is opened, so its state resets without an effect
  return <TaskEditForm key={props.task?.id ?? "none"} {...props} />;
}

function TaskEditForm({
  isOpen,
  onOpenChange,
  task,
  projects,
  members,
  onTaskUpdated,
}: TaskEditModalProps): React.JSX.Element {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState<string>(task?.projectId ?? "");
  const [memberId, setMemberId] = useState<string>(task?.memberId ?? "");
  const [effortUnit, setEffortUnit] = useState<EffortUnit>(
    pickDisplayEffortUnit(task?.effortMinutes ?? 60)
  );
  const [effortValue, setEffortValue] = useState<number>(
    minutesToEffortUnit(task?.effortMinutes ?? 60, effortUnit)
  );
  const effortMinutes = useMemo(
    () => effortUnitToMinutes(effortValue, effortUnit),
    [effortValue, effortUnit]
  );

  function handleEffortUnitChange(unit: EffortUnit): void {
    setEffortValue(1);
    setEffortUnit(unit);
  }
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "in_progress");
  const [startDate, setStartDate] = useState<string>(toDateInputValue(task?.startDate ?? null));
  const [endDate, setEndDate] = useState<string | null>(task?.endDate ? toDateInputValue(task.endDate) : null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectOptions = useMemo(() => {
    return projects.map((p) => ({ value: p.id, label: p.name }));
  }, [projects]);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      value: m.id,
      label: `${m.name} (${formatEffortDuration(m.effortMinutes)} tải - ${m.status})`,
    }));
  }, [members]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!task) return;
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề task.");
      return;
    }
    if (!projectId) {
      setError("Vui lòng chọn dự án.");
      return;
    }
    if (!memberId) {
      setError("Vui lòng chọn nhân sự thực hiện task.");
      return;
    }

    const resolvedMinutes = Math.round(effortMinutes);
    if (resolvedMinutes < 1) {
      setError("Thời lượng thực hiện phải lớn hơn hoặc bằng 1 phút.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const previousMemberId = task.memberId;
    const previousStatus = task.status;

    try {
      await updateTask(task.id, {
        memberId,
        projectId,
        title: title.trim(),
        description: description.trim() || title.trim(),
        effortMinutes: resolvedMinutes,
        startDate,
        endDate,
        status,
      });

      // Resync both the old and new assignee's aggregate effort/status
      await syncMemberEffortStatus(memberId);
      if (previousMemberId !== memberId) {
        await syncMemberEffortStatus(previousMemberId);
      }

      const newMember = members.find((m) => m.id === memberId);
      const projectName = projects.find((p) => p.id === projectId)?.name ?? projectId;
      const link = `${window.location.origin}/tasks`;

      if (previousMemberId !== memberId) {
        const oldMember = members.find((m) => m.id === previousMemberId);
        notifyTaskReassigned({
          title: title.trim(),
          projectName,
          oldMemberName: oldMember?.name ?? previousMemberId,
          newMemberName: newMember?.name ?? memberId,
          newMemberEmail: newMember?.email,
          link,
        });
      } else if (previousStatus !== status) {
        notifyTaskStatusChanged({
          title: title.trim(),
          memberName: newMember?.name ?? memberId,
          memberEmail: newMember?.email,
          projectName,
          oldStatus: previousStatus,
          newStatus: status,
          link,
        });
      }

      onTaskUpdated?.(task.id);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Không thể cập nhật task. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={560}>
      <DialogHeader
        title="Chỉnh sửa Task"
        subtitle="Cập nhật thông tin, người thực hiện hoặc trạng thái công việc"
        onOpenChange={onOpenChange}
      />

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="p-5 flex flex-col gap-4 overflow-y-auto min-h-0">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-sm text-rose-400">
              {error}
            </div>
          )}

          <TextInput
            label="Tiêu đề công việc"
            value={title}
            onChange={setTitle}
            placeholder="VD: Nâng cấp cụm EKS lên v1.30, Cấu hình CI/CD GitLab..."
            isRequired
            hasAutoFocus
          />

          <Selector label="Dự án" options={projectOptions} value={projectId} onChange={setProjectId} />

          <Selector
            label="Người thực hiện (Assignee)"
            options={memberOptions}
            value={memberId}
            onChange={setMemberId}
          />

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
                onChange={(v) => setEffortValue(v ?? 1)}
              />
              <Selector
                label="Đơn vị"
                options={EFFORT_UNIT_OPTIONS}
                value={effortUnit}
                onChange={(v) => handleEffortUnitChange(v as EffortUnit)}
              />
            </Grid>
          </div>

          <Selector
            label="Trạng thái"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v as TaskStatus)}
          />

          <Grid columns={2} gap={3}>
            <DateInput
              label="Ngày bắt đầu"
              format="date"
              width="100%"
              isRequired
              value={startDate as ISODateString}
              onChange={(v) => setStartDate(v ?? startDate)}
            />

            <DateInput
              label="Hạn hoàn thành (Deadline)"
              format="date"
              width="100%"
              hasClear
              placeholder="Tùy chọn"
              value={(endDate || undefined) as ISODateString | undefined}
              onChange={(v) => setEndDate(v || null)}
            />
          </Grid>

          <TextInput
            label="Ghi chú chi tiết (Tùy chọn)"
            value={description}
            onChange={setDescription}
            placeholder="Mô tả tóm tắt bối cảnh hoặc yêu cầu kỹ thuật..."
          />
        </div>

        <HStack gap={3} justify="end" className="p-5 pt-3 border-t border-white/[0.06]">
          <Button
            type="button"
            label="Hủy"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            isDisabled={submitting}
          />
          <Button
            type="submit"
            label={submitting ? "Đang lưu…" : "Lưu thay đổi"}
            variant="primary"
            icon={<Save size={15} />}
            isDisabled={submitting || !title.trim()}
          />
        </HStack>
      </form>
    </Dialog>
  );
}
