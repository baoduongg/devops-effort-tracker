"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Search, Pencil, Trash2, Calendar, AlertTriangle } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { List, ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { IconButton } from "@astryxdesign/core/IconButton";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { TaskEditModal } from "@/components/tasks/task-edit-modal";
import { subscribeAllTasks, deleteTask } from "@/services/tasks.service";
import { subscribeMembers, syncMemberEffortStatus } from "@/services/members.service";
import { getProjects } from "@/services/projects.service";
import { useAuthStore } from "@/store/auth.store";
import { isOverdue } from "@/lib/overdue";
import { formatTaskEffort } from "@/lib/effort";
import type { Task, TaskStatus } from "@/types/task";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "planned", label: "Kế hoạch" },
  { value: "done", label: "Hoàn thành" },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function statusBadge(status: TaskStatus): { variant: "info" | "warning" | "success"; label: string } {
  if (status === "done") return { variant: "success", label: "Hoàn thành" };
  if (status === "planned") return { variant: "warning", label: "Kế hoạch" };
  return { variant: "info", label: "Đang thực hiện" };
}

export default function TasksPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const isLeader = user?.role === "leader";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getProjects().then(setProjects).finally(() => setLoading(false));
    const unsubTasks = subscribeAllTasks(setTasks);
    const unsubMembers = subscribeMembers(setMembers);
    return () => {
      unsubTasks();
      unsubMembers();
    };
  }, []);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const projectOptions = useMemo(
    () => [{ value: "all", label: "Tất cả dự án" }, ...projects.map((p) => ({ value: p.id, label: p.name }))],
    [projects]
  );
  const memberOptions = useMemo(
    () => [{ value: "all", label: "Tất cả nhân sự" }, ...members.map((m) => ({ value: m.id, label: m.name }))],
    [members]
  );

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => {
        const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        const matchesProject = projectFilter === "all" || t.projectId === projectFilter;
        const matchesMember = memberFilter === "all" || t.memberId === memberFilter;
        return matchesQuery && matchesStatus && matchesProject && matchesMember;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tasks, query, statusFilter, projectFilter, memberFilter]);

  async function handleTaskUpdated(): Promise<void> {
    setEditingTask(null);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      await syncMemberEffortStatus(deletingTask.memberId);
      setDeletingTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <VStack gap={5}>
      <div className="flex flex-col gap-1 pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ListChecks size={16} />
          </span>
          <Heading level={1}>Danh sách Task</Heading>
        </div>
        <Text type="supporting">
          {isLeader
            ? "Toàn bộ task trong hệ thống. Bạn có thể sửa hoặc xóa trực tiếp tại đây."
            : "Toàn bộ task trong hệ thống."}
        </Text>
      </div>

      <Card elevation="low">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <TextInput
              label="Tìm task"
              isLabelHidden
              value={query}
              onChange={setQuery}
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              startIcon={Search}
              hasClear
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="w-full sm:w-44">
              <Selector
                label="Trạng thái"
                isLabelHidden
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as TaskStatus | "all")}
              />
            </div>
            <div className="w-full sm:w-44">
              <Selector
                label="Dự án"
                isLabelHidden
                options={projectOptions}
                value={projectFilter}
                onChange={setProjectFilter}
              />
            </div>
            <div className="w-full sm:w-44">
              <Selector
                label="Nhân sự"
                isLabelHidden
                options={memberOptions}
                value={memberFilter}
                onChange={setMemberFilter}
              />
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <VStack gap={2}>
          <Skeleton height={64} />
          <Skeleton height={64} />
          <Skeleton height={64} />
        </VStack>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<Icon icon={ListChecks} size="lg" />}
          title="Không tìm thấy task nào"
          description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
        />
      ) : (
        <Card elevation="low">
          <List hasDividers density="balanced">
            {filteredTasks.map((task) => {
              const member = memberMap.get(task.memberId);
              const project = projectMap.get(task.projectId);
              const badge = statusBadge(task.status);
              const overdue = isOverdue(task);

              return (
                <ListItem
                  key={task.id}
                  label={task.title}
                  startContent={
                    member ? (
                      <Avatar name={member.name} src={member.photoURL ?? undefined} size="sm" tooltip={false} />
                    ) : (
                      <Avatar name="?" size="sm" tooltip={false} />
                    )
                  }
                  description={
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <span className="text-xs text-neutral-400">{member?.name ?? "Chưa gán"}</span>
                      <span className="text-xs text-neutral-600">•</span>
                      <span className="text-xs text-neutral-400">{project?.name ?? "General"}</span>
                      <span className="text-xs text-neutral-600">•</span>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(task.startDate)}
                        {task.endDate && ` → ${formatDate(task.endDate)}`}
                      </span>
                      {overdue && (
                        <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                          <AlertTriangle size={11} />
                          Trễ hạn
                        </span>
                      )}
                    </HStack>
                  }
                  endContent={
                    <HStack gap={2} vAlign="center">
                      <StatusDot
                        variant={badge.variant === "success" ? "success" : badge.variant === "warning" ? "accent" : "neutral"}
                        label={badge.label}
                      />
                      <Badge variant={badge.variant} label={badge.label} />
                      <Badge variant="neutral" label={formatTaskEffort(task)} />
                      {isLeader && (
                        <HStack gap={0.5}>
                          <IconButton
                            label="Sửa task"
                            icon={<Pencil size={13} />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                            tooltip="Sửa task"
                          />
                          <IconButton
                            label="Xóa task"
                            icon={<Trash2 size={13} />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingTask(task)}
                            tooltip="Xóa task"
                          />
                        </HStack>
                      )}
                    </HStack>
                  }
                />
              );
            })}
          </List>
        </Card>
      )}

      <TaskEditModal
        isOpen={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        projects={projects}
        members={members}
        onTaskUpdated={handleTaskUpdated}
      />

      <AlertDialog
        isOpen={Boolean(deletingTask)}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Xóa task này?"
        description={`Task "${deletingTask?.title ?? ""}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        actionLabel="Xóa task"
        onAction={handleConfirmDelete}
        isActionLoading={isDeleting}
      />
    </VStack>
  );
}
