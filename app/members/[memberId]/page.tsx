"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Crown,
  Cpu,
} from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Token } from "@astryxdesign/core/Token";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { MemberForm } from "@/components/members/member-form";
import { MemberTimelineGantt } from "@/components/members/member-timeline-gantt";
import { MemberTaskBreakdown } from "@/components/members/member-task-breakdown";
import { TaskEditModal } from "@/components/tasks/task-edit-modal";
import { getMember, updateMember, syncMemberEffortStatus } from "@/services/members.service";
import { getTasksByMember, deleteTask } from "@/services/tasks.service";
import { getProjects } from "@/services/projects.service";
import { useAuthStore } from "@/store/auth.store";
import { isOverdue } from "@/lib/overdue";
import { formatEffortDuration, getEffortStatus } from "@/lib/effort";
import type { Member, MemberInput } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

export default function MemberDetailPage(): React.JSX.Element {
  const params = useParams<{ memberId: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function reloadTasks(): Promise<void> {
    const t = await getTasksByMember(params.memberId);
    setTasks(t);
  }

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [m, t, p] = await Promise.all([
          getMember(params.memberId),
          getTasksByMember(params.memberId),
          getProjects(),
        ]);
        setMember(m);
        setTasks(t);
        setProjects(p);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Failed to load member data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.memberId]);

  async function handleSubmit(input: MemberInput): Promise<void> {
    await updateMember(params.memberId, input);
    // Refresh local member data
    const updated = await getMember(params.memberId);
    setMember(updated);
    setIsEditOpen(false);
  }

  async function handleTaskUpdated(): Promise<void> {
    await reloadTasks();
    const updated = await getMember(params.memberId);
    setMember(updated);
  }

  async function handleConfirmDeleteTask(): Promise<void> {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      await syncMemberEffortStatus(deletingTask.memberId);
      await reloadTasks();
      const updated = await getMember(params.memberId);
      setMember(updated);
      setDeletingTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === "in_progress"), [tasks]);
  const plannedTasks = useMemo(() => tasks.filter((t) => t.status === "planned"), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.status === "done"), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter(isOverdue), [tasks]);

  const computedEffort = useMemo(() => {
    return inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
  }, [inProgressTasks]);

  const bandwidth = useMemo(() => {
    return getEffortStatus(computedEffort, inProgressTasks.length);
  }, [computedEffort, inProgressTasks.length]);

  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === "leader" || (Boolean(user?.memberId) && user?.memberId === params.memberId);

  if (loading) {
    return (
      <VStack gap={6}>
        <Skeleton height={40} width={200} />
        <Skeleton height={140} />
        <Skeleton height={260} />
        <Grid columns={{ minWidth: 300, max: 3 }} gap={4}>
          <Skeleton height={200} />
          <Skeleton height={200} />
          <Skeleton height={200} />
        </Grid>
      </VStack>
    );
  }

  if (loadError) return <Text color="accent">Lỗi tải dữ liệu: {loadError}</Text>;
  if (!member) return <Text type="supporting">Không tìm thấy thành viên.</Text>;

  const isLeaderRole = member.role === "leader";

  return (
    <VStack gap={6}>
      {/* Top Navigation Row */}
      <HStack justify="between" vAlign="center">
        <Button
          label="Quay lại danh sách"
          icon={<ArrowLeft size={16} strokeWidth={2} />}
          variant="ghost"
          href="/members"
        />

        {canEdit && (
          <Button
            label="Chỉnh sửa thông tin"
            icon={<Pencil size={15} />}
            variant="secondary"
            onClick={() => setIsEditOpen(true)}
          />
        )}
      </HStack>


      {/* Member Executive Profile Card (Compact & High Impact) */}
      <Card elevation="low">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2">
          {/* Member Identity */}
          <div className="flex items-center gap-4">
            <Avatar name={member.name} src={member.photoURL ?? undefined} size="lg" tooltip={false} />
            <VStack gap={1.5}>
              <div className="flex flex-wrap items-center gap-2">
                <Heading level={2}>{member.name}</Heading>

                {/* Role Badge */}
                {isLeaderRole ? (
                  <Token label="Trưởng nhóm (Leader)" color="orange" icon={<Crown size={12} />} />
                ) : (
                  <Token label="Kỹ sư DevOps" color="blue" icon={<Cpu size={12} />} />
                )}

                {/* Bandwidth Status Badge */}
                <StatusBadge status={bandwidth.status} />
              </div>
              <Text type="supporting">{member.email}</Text>
              {member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {member.skills.map((skill) => (
                    <Token key={skill} label={skill} size="sm" />
                  ))}
                </div>
              )}
            </VStack>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 lg:min-w-[420px]">
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400 flex items-center gap-1">
                <Layers size={13} className="text-sky-400" />
                Tổng tải
              </span>
              <Text type="large" weight="semibold" hasTabularNumbers className="text-sky-300">
                {formatEffortDuration(computedEffort)}
              </Text>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-neutral-400 flex items-center gap-1">
                <Clock size={13} className="text-sky-400" />
                Đang làm
              </span>
              <Text type="large" weight="semibold" hasTabularNumbers className="text-neutral-100">
                {inProgressTasks.length} task
              </Text>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-neutral-400 flex items-center gap-1">
                <Calendar size={13} className="text-purple-400" />
                Kế hoạch
              </span>
              <Text type="large" weight="semibold" hasTabularNumbers className="text-purple-300">
                {plannedTasks.length} task
              </Text>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-neutral-400 flex items-center gap-1">
                {overdueTasks.length > 0 ? (
                  <AlertTriangle size={13} className="text-rose-400" />
                ) : (
                  <CheckCircle2 size={13} className="text-emerald-400" />
                )}
                {overdueTasks.length > 0 ? "Trễ hạn" : "Đã xong"}
              </span>
              <Text
                type="large"
                weight="semibold"
                hasTabularNumbers
                className={overdueTasks.length > 0 ? "text-rose-400" : "text-emerald-300"}
              >
                {overdueTasks.length > 0 ? `${overdueTasks.length} task` : `${doneTasks.length} task`}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 1: Visual Interactive Timeline Gantt (Main Focal Point) */}
      <VStack gap={3}>
        <MemberTimelineGantt tasks={tasks} projects={projects} />
      </VStack>

      {/* Section 2: Detailed Task Breakdown (Active / Upcoming / Done) */}
      <VStack gap={3}>
        <Heading level={3}>Tình hình phân bổ nhiệm vụ</Heading>
        <MemberTaskBreakdown
          tasks={tasks}
          projects={projects}
          canManage={user?.role === "leader"}
          onEditTask={setEditingTask}
          onDeleteTask={setDeletingTask}
        />
      </VStack>

      {/* Edit Task Modal */}
      <TaskEditModal
        isOpen={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        projects={projects}
        members={member ? [member] : []}
        onTaskUpdated={handleTaskUpdated}
      />

      {/* Delete Task Confirmation */}
      <AlertDialog
        isOpen={Boolean(deletingTask)}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Xóa task này?"
        description={`Task "${deletingTask?.title ?? ""}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        actionLabel="Xóa task"
        onAction={handleConfirmDeleteTask}
        isActionLoading={isDeleting}
      />

      {/* Edit Member Info Modal Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        purpose="form"
        width={500}
      >
        <DialogHeader
          title={`Cập nhật thông tin: ${member.name}`}
          subtitle="Chỉnh sửa kỹ năng, email và trạng thái mặc định"
          onOpenChange={setIsEditOpen}
        />
        <div className="p-5">
          <MemberForm
            initialValues={member}
            onSubmit={handleSubmit}
            submitLabel="Lưu thay đổi"
            onCancel={() => setIsEditOpen(false)}
            isCard={false}
          />
        </div>
      </Dialog>
    </VStack>
  );
}
