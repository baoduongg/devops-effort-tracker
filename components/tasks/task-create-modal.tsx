"use client";

import { useState, useMemo } from "react";
import { Plus, FolderPlus } from "lucide-react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { createTask } from "@/services/tasks.service";
import { createProject } from "@/services/projects.service";
import { syncMemberEffortStatus } from "@/services/members.service";
import { notifyTaskCreated } from "@/services/chatops.service";
import { useAuthStore } from "@/store/auth.store";
import { useEffortInput } from "@/hooks/use-effort-input";
import { formatEffortDuration } from "@/lib/effort";
import { PROJECT_COLOR_SWATCHES } from "@/lib/project-colors";
import type { Project } from "@/types/project";
import type { Member } from "@/types/member";
import type { TaskStatus } from "@/types/task";
import { TaskEffortStatusFields } from "@/components/tasks/task-effort-status-fields";
import { TaskAlarmFields } from "@/components/tasks/task-alarm-fields";

interface TaskCreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  members: Member[];
  defaultMemberId?: string | null;
  defaultProjectId?: string | null;
  onTaskCreated?: (taskId: string) => void;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TaskCreateModal({
  isOpen,
  onOpenChange,
  projects,
  members,
  defaultMemberId,
  defaultProjectId,
  onTaskCreated,
}: TaskCreateModalProps): React.JSX.Element {
  const today = useMemo(() => getTodayString(), []);

  const currentUser = useAuthStore((state) => state.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [memberId, setMemberId] = useState<string>("");
  const { effortValue, setEffortValue, effortUnit, handleEffortUnitChange, effortMinutes, reset: resetEffort } =
    useEffortInput(1, "hours");
  const [status, setStatus] = useState<TaskStatus>("in_progress");
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [deployAt, setDeployAt] = useState<string | null>(null);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(30);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effective projectId & memberId: only what the user explicitly picked (or an explicit default prop), never auto-picked from the list
  const currentProjectId = useMemo(() => {
    if (isCreatingNewProject) return "";
    if (projectId && projects.some((p) => p.id === projectId)) return projectId;
    return defaultProjectId || "";
  }, [isCreatingNewProject, projectId, projects, defaultProjectId]);

  const currentMemberId = useMemo(() => {
    if (memberId && members.some((m) => m.id === memberId)) return memberId;
    return defaultMemberId || "";
  }, [memberId, members, defaultMemberId]);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      value: m.id,
      label: `${m.name} (${formatEffortDuration(m.effortMinutes)} tải - ${m.status})`,
    }));
  }, [members]);

  const projectOptions = useMemo(() => {
    return [
      ...projects.map((p) => ({ value: p.id, label: p.name })),
      { value: "__NEW__", label: "+ Tạo dự án mới..." },
    ];
  }, [projects]);

  function handleProjectChange(val: string): void {
    if (val === "__NEW__") {
      setIsCreatingNewProject(true);
      setProjectId("");
    } else {
      setIsCreatingNewProject(false);
      setProjectId(val);
    }
  }

  function handleResetForm(): void {
    setTitle("");
    setDescription("");
    setIsCreatingNewProject(false);
    setNewProjectName("");
    setProjectId("");
    setMemberId("");
    resetEffort(1, "hours");
    setStatus("in_progress");
    setStartDate(getTodayString());
    setEndDate(null);
    setDeployAt(null);
    setReminderMinutesBefore(30);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề task.");
      return;
    }

    let finalProjectId = isCreatingNewProject ? "" : currentProjectId;
    if (isCreatingNewProject) {
      if (!newProjectName.trim()) {
        setError("Vui lòng nhập tên dự án mới.");
        return;
      }
    } else if (!finalProjectId) {
      setError("Vui lòng chọn hoặc tạo dự án.");
      return;
    }

    if (!currentMemberId) {
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

    try {
      if (isCreatingNewProject) {
        finalProjectId = await createProject({
          name: newProjectName.trim(),
          description: `Dự án ${newProjectName.trim()}`,
          color: PROJECT_COLOR_SWATCHES[0],
        });
      }

      const taskId = await createTask({
        memberId: currentMemberId,
        projectId: finalProjectId,
        title: title.trim(),
        description: description.trim() || title.trim(),
        effortMinutes: resolvedMinutes,
        startDate: startDate || getTodayString(),
        endDate: endDate || null,
        status,
        source: "manual",
        deployAt: deployAt || null,
        reminderMinutesBefore: deployAt ? reminderMinutesBefore : null,
        alarmFiredAt: null,
      });

      // Update assigned member status & effort in Firestore
      try {
        await syncMemberEffortStatus(currentMemberId);
      } catch (err) {
        console.warn("Could not update member effort status:", err);
      }

      const assignedMember = members.find((m) => m.id === currentMemberId);
      const memberName = assignedMember?.name ?? currentMemberId;
      const projectName = isCreatingNewProject
        ? newProjectName.trim()
        : projects.find((p) => p.id === finalProjectId)?.name ?? finalProjectId;
      notifyTaskCreated({
        title: title.trim(),
        memberName,
        memberEmail: assignedMember?.email,
        projectName,
        link: `${window.location.origin}/tasks`,
        creatorName: currentUser?.displayName ?? "Admin",
        endDate: endDate || null,
      });

      onTaskCreated?.(taskId);
      handleResetForm();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Không thể tạo task. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleResetForm();
        onOpenChange(open);
      }}
      purpose="form"
      width={560}
    >
      <DialogHeader
        title="Tạo Task mới"
        subtitle="Điền thông tin chi tiết để giao việc hoặc lên kế hoạch cho thành viên"
        onOpenChange={onOpenChange}
      />

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="p-5 flex flex-col gap-4 overflow-y-auto min-h-0">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-sm text-rose-400">
              {error}
            </div>
          )}

          {/* Task Title */}
          <TextInput
            label="Tiêu đề công việc"
            value={title}
            onChange={setTitle}
            placeholder="VD: Nâng cấp cụm EKS lên v1.30, Cấu hình CI/CD GitLab..."
            isRequired
            hasAutoFocus
          />

          {/* Project Selection */}
          {isCreatingNewProject ? (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <HStack justify="between" vAlign="center">
                <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                  <FolderPlus size={14} />
                  Tạo dự án mới
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewProject(false)}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  Chọn từ dự án có sẵn
                </button>
              </HStack>
              <TextInput
                label="Tên dự án"
                value={newProjectName}
                onChange={setNewProjectName}
                placeholder="VD: Core Platform, EKS Cluster, Mobile App..."
                isRequired
              />
            </div>
          ) : (
            <Selector
              label="Dự án"
              options={projectOptions}
              value={currentProjectId}
              onChange={handleProjectChange}
            />
          )}

          {/* Assignee Selection */}
          <Selector
            label="Người thực hiện (Assignee)"
            options={memberOptions}
            value={currentMemberId}
            onChange={setMemberId}
          />

          {/* Effort, Status & Dates */}
          <TaskEffortStatusFields
            effortValue={effortValue}
            onEffortValueChange={setEffortValue}
            effortUnit={effortUnit}
            onEffortUnitChange={handleEffortUnitChange}
            effortMinutes={effortMinutes}
            status={status}
            onStatusChange={setStatus}
            startDate={startDate}
            onStartDateChange={(v) => setStartDate(v ?? getTodayString())}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />

          {/* Deploy Alarm */}
          <TaskAlarmFields
            deployAt={deployAt}
            onDeployAtChange={setDeployAt}
            reminderMinutesBefore={reminderMinutesBefore}
            onReminderMinutesBeforeChange={setReminderMinutesBefore}
          />

          {/* Description / Notes */}
          <TextInput
            label="Ghi chú chi tiết (Tùy chọn)"
            value={description}
            onChange={setDescription}
            placeholder="Mô tả tóm tắt bối cảnh hoặc yêu cầu kỹ thuật..."
          />

        </div>

        {/* Form Actions */}
        <HStack gap={3} justify="end" className="p-5 pt-3 border-t border-white/[0.06]">
          <Button
            type="button"
            label="Hủy"
            variant="ghost"
            onClick={() => {
              handleResetForm();
              onOpenChange(false);
            }}
            isDisabled={submitting}
          />
          <Button
            type="submit"
            label={submitting ? "Đang tạo…" : "Tạo Task"}
            variant="primary"
            icon={<Plus size={15} />}
            isDisabled={submitting || !title.trim()}
          />
        </HStack>
      </form>
    </Dialog>
  );
}
