"use client";

import { useState, useMemo } from "react";
import { Plus, FolderPlus } from "lucide-react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { TextInput } from "@astryxdesign/core/TextInput";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { createTask, getTasksByMember } from "@/services/tasks.service";
import { createProject } from "@/services/projects.service";
import { updateMember } from "@/services/members.service";
import type { Project } from "@/types/project";
import type { Member, MemberStatus } from "@/types/member";
import type { TaskStatus } from "@/types/task";

interface TaskCreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  members: Member[];
  defaultMemberId?: string | null;
  defaultProjectId?: string | null;
  onTaskCreated?: (taskId: string) => void;
}

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Đang thực hiện (In Progress)" },
  { value: "planned", label: "Kế hoạch (Planned)" },
  { value: "done", label: "Hoàn thành (Done)" },
];

const EFFORT_PRESETS = [
  { label: "15% (~1h)", value: 15 },
  { label: "25% (~2h)", value: 25 },
  { label: "50% (~4h)", value: 50 },
  { label: "100% (1 ngày)", value: 100 },
];

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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>(
    defaultProjectId || (projects[0]?.id ?? "")
  );
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [memberId, setMemberId] = useState<string>(
    defaultMemberId || (members[0]?.id ?? "")
  );
  const [effortPercent, setEffortPercent] = useState<number>(25);
  const [status, setStatus] = useState<TaskStatus>("in_progress");
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync defaults when modal opens
  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.effortPercent || 0}% tải - ${m.status})`,
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
    setProjectId(defaultProjectId || (projects[0]?.id ?? ""));
    setMemberId(defaultMemberId || (members[0]?.id ?? ""));
    setEffortPercent(25);
    setStatus("in_progress");
    setStartDate(getTodayString());
    setEndDate(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề task.");
      return;
    }

    let finalProjectId = projectId;
    if (isCreatingNewProject) {
      if (!newProjectName.trim()) {
        setError("Vui lòng nhập tên dự án mới.");
        return;
      }
    } else if (!finalProjectId) {
      setError("Vui lòng chọn hoặc tạo dự án.");
      return;
    }

    if (!memberId) {
      setError("Vui lòng chọn nhân sự thực hiện task.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isCreatingNewProject) {
        finalProjectId = await createProject({
          name: newProjectName.trim(),
          description: `Dự án ${newProjectName.trim()}`,
          color: "#38bdf8",
        });
      }

      const taskId = await createTask({
        memberId,
        projectId: finalProjectId,
        title: title.trim(),
        description: description.trim() || title.trim(),
        effortPercent: Math.round(effortPercent),
        startDate: startDate || getTodayString(),
        endDate: endDate || null,
        status,
        source: "manual",
      });

      // Update assigned member status & effort in Firestore
      const isTaskActive = status === "in_progress";
      try {
        const existingTasks = await getTasksByMember(memberId);
        const otherActiveTasks = existingTasks.filter(
          (t) => t.id !== taskId && t.status === "in_progress"
        );
        const totalEffort =
          otherActiveTasks.reduce((sum, t) => sum + t.effortPercent, 0) +
          (isTaskActive ? Math.round(effortPercent) : 0);
        const activeCount = otherActiveTasks.length + (isTaskActive ? 1 : 0);
        const newStatus: MemberStatus =
          activeCount === 0 || totalEffort === 0
            ? "available"
            : totalEffort > 100
            ? "overloaded"
            : "busy";

        await updateMember(memberId, {
          currentTaskId: isTaskActive ? taskId : (otherActiveTasks[0]?.id || null),
          effortPercent: totalEffort,
          status: newStatus,
        });
      } catch (err) {
        console.warn("Could not update member effort status:", err);
      }

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

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
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
          autoFocus
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
            value={projectId || (projects[0]?.id ?? "")}
            onChange={handleProjectChange}
          />
        )}

        {/* Assignee Selection */}
        <Selector
          label="Người thực hiện (Assignee)"
          options={memberOptions}
          value={memberId || (members[0]?.id ?? "")}
          onChange={setMemberId}
        />

        {/* Effort & Presets */}
        <div className="flex flex-col gap-1.5">
          <NumberInput
            label="Mức tải công việc (%)"
            min={0}
            max={200}
            step={5}
            units="%"
            value={effortPercent}
            onChange={(v) => setEffortPercent(v ?? 0)}
          />
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-neutral-400">Chọn nhanh:</span>
            {EFFORT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setEffortPercent(p.value)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  effortPercent === p.value
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-white/[0.02] text-neutral-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-neutral-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <Selector
          label="Trạng thái"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v as TaskStatus)}
        />

        {/* Dates */}
        <Grid columns={2} gap={3}>
          <DateInput
            label="Ngày bắt đầu"
            format="date"
            width="100%"
            isRequired
            value={startDate as ISODateString}
            onChange={(v) => setStartDate(v ?? getTodayString())}
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

        {/* Description / Notes */}
        <TextInput
          label="Ghi chú chi tiết (Tùy chọn)"
          value={description}
          onChange={setDescription}
          placeholder="Mô tả tóm tắt bối cảnh hoặc yêu cầu kỹ thuật..."
        />

        {/* Form Actions */}
        <HStack gap={3} justify="end" className="pt-3 border-t border-white/[0.06]">
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
