"use client";

import { useState, useMemo } from "react";
import { Save } from "lucide-react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { updateTask } from "@/services/tasks.service";
import { syncMemberEffortStatus } from "@/services/members.service";
import { notifyTaskStatusChanged, notifyTaskReassigned } from "@/services/chatops.service";
import { useEffortInput } from "@/hooks/use-effort-input";
import { formatEffortDuration, minutesToEffortUnit, pickDisplayEffortUnit } from "@/lib/effort";
import { formatDateLocal, parseDateLocal } from "@/lib/date";
import type { Project } from "@/types/project";
import type { Member } from "@/types/member";
import type { Task, TaskStatus } from "@/types/task";
import { TaskEffortStatusFields } from "@/components/tasks/task-effort-status-fields";
import { TaskAlarmFields } from "@/components/tasks/task-alarm-fields";

interface TaskEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  projects: Project[];
  members: Member[];
  onTaskUpdated?: (taskId: string) => void;
}

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
  const initialEffortUnit = pickDisplayEffortUnit(task?.effortMinutes ?? 60);
  const { effortValue, setEffortValue, effortUnit, handleEffortUnitChange, effortMinutes } = useEffortInput(
    minutesToEffortUnit(task?.effortMinutes ?? 60, initialEffortUnit),
    initialEffortUnit
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "in_progress");
  const [startDate, setStartDate] = useState<string>(toDateInputValue(task?.startDate ?? null));
  const [endDate, setEndDate] = useState<string | null>(task?.endDate ? toDateInputValue(task.endDate) : null);
  const [deployAt, setDeployAt] = useState<string | null>(task?.deployAt ?? null);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(
    task?.reminderMinutesBefore ?? 30
  );

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
        deployAt: deployAt || null,
        reminderMinutesBefore: deployAt ? reminderMinutesBefore : null,
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

          <TaskEffortStatusFields
            effortValue={effortValue}
            onEffortValueChange={setEffortValue}
            effortUnit={effortUnit}
            onEffortUnitChange={handleEffortUnitChange}
            effortMinutes={effortMinutes}
            status={status}
            onStatusChange={setStatus}
            startDate={startDate}
            onStartDateChange={(v) => setStartDate(v ?? startDate)}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />

          <TaskAlarmFields
            deployAt={deployAt}
            onDeployAtChange={setDeployAt}
            reminderMinutesBefore={reminderMinutesBefore}
            onReminderMinutesBeforeChange={setReminderMinutesBefore}
          />

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
