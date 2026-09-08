"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Users,
  Check,
  RotateCcw,
  Zap,
  Plus,
} from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import { Avatar } from "@astryxdesign/core/Avatar";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { MemberTimelineGantt } from "@/components/members/member-timeline-gantt";
import { TaskCreateModal } from "@/components/tasks/task-create-modal";
import { updateTask } from "@/services/tasks.service";
import { updateMember } from "@/services/members.service";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatEffortDuration, formatTaskEffort } from "@/lib/effort";
import type { Task, TaskStatus } from "@/types/task";
import type { Member, MemberStatus } from "@/types/member";
import type { Project } from "@/types/project";
import type { AppUser } from "@/types/user";

interface DevOpsWorkspaceProps {
  user: AppUser;
  member: Member | null;
  tasks: Task[];
  projects: Project[];
  members: Member[];
}

type WorkspaceTab = "active" | "planned" | "done" | "gantt" | "team";

export function DevOpsWorkspace({
  user,
  member,
  tasks,
  projects,
  members,
}: DevOpsWorkspaceProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("active");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const memberId = user.memberId;
  const myTasks = useMemo(() => {
    if (!memberId) return [];
    return tasks.filter((t) => t.memberId === memberId);
  }, [tasks, memberId]);

  const inProgressTasks = useMemo(() => myTasks.filter((t) => t.status === "in_progress"), [myTasks]);
  const plannedTasks = useMemo(() => myTasks.filter((t) => t.status === "planned"), [myTasks]);
  const doneTasks = useMemo(() => myTasks.filter((t) => t.status === "done"), [myTasks]);
  const overdueTasks = useMemo(() => myTasks.filter(isOverdue), [myTasks]);

  const totalEffortMinutes = useMemo(() => {
    return inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
  }, [inProgressTasks]);

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Teammates available for pairing / collaboration
  const availableTeammates = useMemo(() => {
    return members.filter((m) => m.id !== memberId && (m.effortMinutes || 0) < 288);
  }, [members, memberId]);

  async function handleToggleStatus(task: Task, nextStatus: TaskStatus): Promise<void> {
    setUpdatingTaskId(task.id);
    try {
      await updateTask(task.id, { status: nextStatus });
      if (memberId) {
        const updatedTasks = myTasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t));
        const activeTasks = updatedTasks.filter((t) => t.status === "in_progress");
        const newTotalEffortMinutes = activeTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
        const newStatus: MemberStatus =
          activeTasks.length === 0 || newTotalEffortMinutes === 0
            ? "available"
            : newTotalEffortMinutes > 480
              ? "overloaded"
              : "busy";
        await updateMember(memberId, {
          effortMinutes: newTotalEffortMinutes,
          status: newStatus,
          currentTaskId: activeTasks[0]?.id || null,
        });
      }
    } catch (err) {
      console.error("Failed to update task status", err);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  return (
    <VStack gap={5}>
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Zap size={16} />
            </span>
            <Heading level={1}>Dashboard: {member?.name || user.displayName}</Heading>
          </div>

          <Text type="supporting">
            Theo dõi phân bổ công việc cá nhân, tiến độ sprint và quản lý danh sách nhiệm vụ.
          </Text>
        </div>

        <HStack gap={2} vAlign="center">
          <Button
            label="Tạo Task mới"
            icon={<Plus size={15} />}
            variant="primary"
            onClick={() => setIsCreateTaskModalOpen(true)}
          />
        </HStack>
      </div>

      {/* Personal KPI & Capacity Hero Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Workload Progress Card */}
        <Card elevation="low">
          <div className="flex flex-col justify-between h-full gap-3 p-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                <Layers size={14} className="text-sky-400" />
                Mức tải hiện tại
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${totalEffortMinutes > 480
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                  : totalEffortMinutes >= 288
                    ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  }`}
              >
                {totalEffortMinutes > 480 ? "Quá tải" : totalEffortMinutes >= 288 ? "Vừa tải" : "Rảnh việc"}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${totalEffortMinutes > 480 ? "text-rose-400" : totalEffortMinutes >= 288 ? "text-sky-300" : "text-emerald-400"
                  }`}
              >
                {formatEffortDuration(totalEffortMinutes)}
              </span>
              <span className="text-xs text-neutral-500 font-medium">/ 8h dung lượng</span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${totalEffortMinutes > 480 ? "bg-rose-500" : totalEffortMinutes >= 288 ? "bg-sky-500" : "bg-emerald-500"
                  }`}
                style={{ width: `${Math.min((totalEffortMinutes / 480) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* In Progress Tasks */}
        <Card elevation="low">
          <div className="flex flex-col justify-between h-full gap-2 p-1">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <Clock size={14} className="text-sky-400" />
              Đang thực hiện
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-neutral-100">{inProgressTasks.length}</span>
              <span className="text-xs text-neutral-500">nhiệm vụ active</span>
            </div>
            <span className="text-[11px] text-neutral-400">
              {inProgressTasks.length === 0 ? "Chưa có task nào đang chạy" : `Tổng cộng ${formatEffortDuration(totalEffortMinutes)} effort`}
            </span>
          </div>
        </Card>

        {/* Planned Tasks */}
        <Card elevation="low">
          <div className="flex flex-col justify-between h-full gap-2 p-1">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-400" />
              Kế hoạch tiếp theo
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-300">{plannedTasks.length}</span>
              <span className="text-xs text-neutral-500">nhiệm vụ chờ sprint</span>
            </div>
            <span className="text-[11px] text-neutral-400">
              {plannedTasks.length} task đã lên lịch thực hiện
            </span>
          </div>
        </Card>

        {/* Overdue / Completed */}
        <Card elevation="low">
          <div className="flex flex-col justify-between h-full gap-2 p-1">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              {overdueTasks.length > 0 ? (
                <AlertTriangle size={14} className="text-rose-400" />
              ) : (
                <CheckCircle2 size={14} className="text-emerald-400" />
              )}
              {overdueTasks.length > 0 ? "Cảnh báo trễ hạn" : "Đã hoàn thành"}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${overdueTasks.length > 0 ? "text-rose-400" : "text-emerald-300"
                  }`}
              >
                {overdueTasks.length > 0 ? overdueTasks.length : doneTasks.length}
              </span>
              <span className="text-xs text-neutral-500">
                {overdueTasks.length > 0 ? "cần xử lý gấp" : "nhiệm vụ đã xong"}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">
              {overdueTasks.length > 0
                ? "Có task quá hạn dự kiến!"
                : `${doneTasks.length} task đã bàn giao`}
            </span>
          </div>
        </Card>
      </div>

      {/* Tabs Switcher for DevOps Workspace */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <SegmentedControl
          label="Nội dung hiển thị"
          value={activeTab}
          onChange={(v) => setActiveTab(v as WorkspaceTab)}
        >
          <SegmentedControlItem
            value="active"
            label={`Đang làm (${inProgressTasks.length})`}
            icon={<Clock size={14} />}
          />
          <SegmentedControlItem
            value="planned"
            label={`Kế hoạch (${plannedTasks.length})`}
            icon={<Calendar size={14} />}
          />
          <SegmentedControlItem
            value="done"
            label={`Hoàn thành (${doneTasks.length})`}
            icon={<CheckCircle2 size={14} />}
          />
          <SegmentedControlItem
            value="gantt"
            label="Lịch trình Gantt"
            icon={<Calendar size={14} />}
          />
          <SegmentedControlItem
            value="team"
            label="Đồng đội sẵn sàng"
            icon={<Users size={14} />}
          />
        </SegmentedControl>
      </div>

      {/* Tab 1: In-Progress Active Tasks */}
      {activeTab === "active" && (
        <VStack gap={3}>
          {inProgressTasks.length === 0 ? (
            <Card elevation="low">
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <CheckCircle2 size={36} className="text-emerald-400 opacity-80" />
                <div className="flex flex-col gap-1">
                  <Text weight="bold" size="base">
                    Bạn hiện không có task nào đang chạy (100% rảnh)
                  </Text>
                  <Text type="supporting">
                    Dùng tính năng AI Chat để ghi nhận công việc mới hoặc nhận task từ kế hoạch.
                  </Text>
                </div>
                <Button
                  label="Ghi nhận công việc với AI"
                  icon={<Sparkles size={15} />}
                  variant="primary"
                  href="/chat"
                />
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {inProgressTasks.map((task) => {
                const project = projectMap.get(task.projectId);
                const projColor = project?.color || "#38bdf8";
                const overdue = isOverdue(task);
                const isUpdating = updatingTaskId === task.id;

                return (
                  <Card key={task.id} elevation="low">
                    <div className="flex flex-col justify-between h-full gap-3 p-1">
                      {/* Top bar: Project tag + Effort badge */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg truncate"
                          style={{
                            backgroundColor: `${projColor}20`,
                            color: projColor,
                            border: `1px solid ${projColor}35`,
                          }}
                        >
                          {project?.name || "General Project"}
                        </span>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/25 flex items-center gap-1">
                          <Layers size={12} />
                          {formatTaskEffort(task)}
                        </span>
                      </div>

                      {/* Task info */}
                      <div className="flex flex-col gap-1">
                        <Text weight="bold" size="base" className="text-neutral-100">
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text type="supporting" size="sm" maxLines={2}>
                            {task.description}
                          </Text>
                        )}
                      </div>

                      {/* Date & Overdue Info */}
                      <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.04]">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-neutral-500" />
                          Hạn chót: {task.endDate || "Chưa đặt"}
                        </span>
                        {overdue && (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <AlertTriangle size={13} />
                            Trễ {task.endDate ? daysOverdue(task.endDate) : 0} ngày
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                        <span className="text-[11px] text-neutral-500">
                          {task.source === "ai_chat" ? "Tạo qua AI Chat" : "Nhập thủ công"}
                        </span>

                        <Button
                          label={isUpdating ? "Đang lưu..." : "Đánh dấu Hoàn thành"}
                          icon={<Check size={14} />}
                          variant="secondary"
                          size="sm"
                          isDisabled={isUpdating}
                          onClick={() => handleToggleStatus(task, "done")}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </VStack>
      )}

      {/* Tab 2: Planned Tasks */}
      {activeTab === "planned" && (
        <VStack gap={3}>
          {plannedTasks.length === 0 ? (
            <Card elevation="low">
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <Calendar size={32} className="text-neutral-500 opacity-60" />
                <Text weight="semibold">Chưa có task nào trong kế hoạch tiếp theo</Text>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {plannedTasks.map((task) => {
                const project = projectMap.get(task.projectId);
                const projColor = project?.color || "#a855f7";
                const isUpdating = updatingTaskId === task.id;

                return (
                  <Card key={task.id} elevation="low">
                    <div className="flex flex-col justify-between h-full gap-3 p-1">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg truncate"
                          style={{
                            backgroundColor: `${projColor}20`,
                            color: projColor,
                            border: `1px solid ${projColor}35`,
                          }}
                        >
                          {project?.name || "General"}
                        </span>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25">
                          {formatTaskEffort(task)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Text weight="bold" size="base" className="text-neutral-100">
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text type="supporting" size="sm" maxLines={2}>
                            {task.description}
                          </Text>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                        <span className="text-xs text-neutral-400">
                          Bắt đầu: {task.startDate || "Sắp tới"}
                        </span>

                        <Button
                          label={isUpdating ? "Đang lưu..." : "Bắt đầu làm (In Progress)"}
                          icon={<Clock size={14} />}
                          variant="primary"
                          size="sm"
                          isDisabled={isUpdating}
                          onClick={() => handleToggleStatus(task, "in_progress")}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </VStack>
      )}

      {/* Tab 3: Completed Tasks */}
      {activeTab === "done" && (
        <VStack gap={3}>
          {doneTasks.length === 0 ? (
            <Card elevation="low">
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <CheckCircle2 size={32} className="text-neutral-500 opacity-60" />
                <Text weight="semibold">Chưa có task nào đã hoàn thành trong sprint</Text>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {doneTasks.map((task) => {
                const project = projectMap.get(task.projectId);
                const isUpdating = updatingTaskId === task.id;

                return (
                  <Card key={task.id} elevation="low">
                    <div className="flex flex-col justify-between h-full gap-3 p-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          {project?.name || "General"}
                        </span>

                        <span className="text-xs font-semibold text-neutral-400">
                          {formatTaskEffort(task)}
                        </span>
                      </div>

                      <Text weight="semibold" size="base" className="text-neutral-200 line-through opacity-80">
                        {task.title}
                      </Text>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                        <span className="text-xs text-neutral-500">Hoàn thành</span>

                        <Button
                          label={isUpdating ? "Đang lưu..." : "Mở lại task"}
                          icon={<RotateCcw size={13} />}
                          variant="ghost"
                          size="sm"
                          isDisabled={isUpdating}
                          onClick={() => handleToggleStatus(task, "in_progress")}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </VStack>
      )}

      {/* Tab 4: Gantt Timeline */}
      {activeTab === "gantt" && (
        <MemberTimelineGantt tasks={myTasks} projects={projects} />
      )}

      {/* Tab 5: Team Collaboration / Availability */}
      {activeTab === "team" && (
        <VStack gap={4}>
          <Card elevation="low">
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Users size={16} className="text-sky-400" />
                <Text weight="semibold" size="base">
                  Đồng đội đang rảnh việc ({availableTeammates.length})
                </Text>
              </HStack>
              <Text type="supporting" size="sm">
                Danh sách các kỹ sư DevOps trong team đang có dung lượng trống (&lt;60% tải) sẵn sàng hỗ trợ hoặc nhận phối hợp.
              </Text>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {availableTeammates.map((mate) => (
                  <div
                    key={mate.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                  >
                    <HStack gap={2} vAlign="center">
                      <Avatar name={mate.name} src={mate.photoURL ?? undefined} size="sm" tooltip={false} />

                      <div className="min-w-0">
                        <Link href={`/members/${mate.id}`} className="hover:underline font-semibold text-xs text-neutral-200">
                          {mate.name}
                        </Link>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {mate.skills.slice(0, 2).join(", ") || "DevOps"}
                        </div>
                      </div>
                    </HStack>

                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {formatEffortDuration(mate.effortMinutes)} tải
                    </span>
                  </div>
                ))}
              </div>
            </VStack>
          </Card>
        </VStack>
      )}

      {/* Create Task Modal Dialog */}
      <TaskCreateModal
        isOpen={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        projects={projects}
        members={members}
        defaultMemberId={memberId}
      />
    </VStack>
  );
}
