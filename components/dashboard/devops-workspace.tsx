"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Clock, Calendar, CheckCircle2, Users, Zap, Plus, Send } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { MemberTimelineGantt } from "@/components/members/member-timeline-gantt";
import { TaskCreateModal } from "@/components/tasks/task-create-modal";
import { isOverdue } from "@/lib/overdue";
import { getEffortStatus } from "@/lib/effort";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { AppUser } from "@/types/user";
import { TaskCard } from "./devops/TaskCard";
import { WorkloadKpiCards } from "./devops/WorkloadKpiCards";
import { TeamAvailabilityTab } from "./devops/TeamAvailabilityTab";
import { useTaskStatusUpdate } from "./devops/useTaskStatusUpdate";
import { NEXT_STATUS_BY_TAB, TASK_CARD_CONFIG, type TaskCardTab } from "./devops/task-card-config";
import { useDailyDigestTrigger } from "./hooks/useDailyDigestTrigger";

interface DevOpsWorkspaceProps {
  user: AppUser;
  member: Member | null;
  tasks: Task[];
  projects: Project[];
  members: Member[];
}

type WorkspaceTab = TaskCardTab | "gantt" | "team";

export function DevOpsWorkspace({
  user,
  member,
  tasks,
  projects,
  members,
}: DevOpsWorkspaceProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("active");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const { trigger: triggerDailyDigest, isSending: isSendingDigest } = useDailyDigestTrigger();

  const memberId = user.memberId;
  const myTasks = useMemo(() => {
    if (!memberId) return [];
    return tasks.filter((t) => t.memberId === memberId);
  }, [tasks, memberId]);

  const { updatingTaskId, handleToggleStatus } = useTaskStatusUpdate(memberId, myTasks);

  const inProgressTasks = useMemo(() => myTasks.filter((t) => t.status === "in_progress"), [myTasks]);
  const plannedTasks = useMemo(() => myTasks.filter((t) => t.status === "planned"), [myTasks]);
  const doneTasks = useMemo(() => myTasks.filter((t) => t.status === "done"), [myTasks]);
  const overdueTasks = useMemo(() => myTasks.filter(isOverdue), [myTasks]);

  const totalEffortMinutes = useMemo(() => {
    return inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
  }, [inProgressTasks]);

  const workloadStatus = useMemo(
    () => getEffortStatus(totalEffortMinutes, inProgressTasks.length),
    [totalEffortMinutes, inProgressTasks.length]
  );

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const availableTeammates = useMemo(() => {
    return members.filter((m) => m.id !== memberId && (m.effortMinutes || 0) < 288);
  }, [members, memberId]);

  function renderTaskGrid(tab: TaskCardTab, tasksForTab: Task[]): React.ReactNode {
    const config = TASK_CARD_CONFIG[tab];
    if (tasksForTab.length === 0) {
      return (
        <Card elevation="low">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            {config.emptyIcon}
            <div className="flex flex-col gap-1">
              <Text weight="bold" size="base">
                {config.emptyMessage}
              </Text>
              {tab === "active" && (
                <Text type="supporting">
                  Dùng tính năng AI Chat để ghi nhận công việc mới hoặc nhận task từ kế hoạch.
                </Text>
              )}
            </div>
            {tab === "active" && (
              <Button label="Ghi nhận công việc với AI" icon={<Sparkles size={15} />} variant="primary" href="/chat" />
            )}
          </div>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {tasksForTab.map((task) => (
          <TaskCard
            key={task.id}
            tab={tab}
            task={task}
            project={projectMap.get(task.projectId)}
            isUpdating={updatingTaskId === task.id}
            onToggleStatus={() => handleToggleStatus(task, NEXT_STATUS_BY_TAB[tab])}
          />
        ))}
      </div>
    );
  }

  return (
    <VStack gap={5}>
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
          <button
            type="button"
            onClick={triggerDailyDigest}
            disabled={isSendingDigest}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/15 hover:from-emerald-500/25 hover:via-teal-500/20 hover:to-sky-500/25 text-emerald-300 hover:text-emerald-100 border border-emerald-500/30 hover:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.12)] hover:shadow-[0_0_20px_rgba(16,185,129,0.22)] transition-all font-medium text-sm group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform flex items-center justify-center">
              <Send size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
            <span>Daily Digest</span>
          </button>
          <Button
            label="Tạo Task mới"
            icon={<Plus size={15} />}
            variant="primary"
            onClick={() => setIsCreateTaskModalOpen(true)}
          />
        </HStack>
      </div>

      <WorkloadKpiCards
        totalEffortMinutes={totalEffortMinutes}
        workloadStatus={workloadStatus}
        inProgressTasks={inProgressTasks}
        plannedTasks={plannedTasks}
        doneTasks={doneTasks}
        overdueTasks={overdueTasks}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <SegmentedControl
          label="Nội dung hiển thị"
          value={activeTab}
          onChange={(v) => setActiveTab(v as WorkspaceTab)}
        >
          <SegmentedControlItem value="active" label={`Đang làm (${inProgressTasks.length})`} icon={<Clock size={14} />} />
          <SegmentedControlItem value="planned" label={`Kế hoạch (${plannedTasks.length})`} icon={<Calendar size={14} />} />
          <SegmentedControlItem value="done" label={`Hoàn thành (${doneTasks.length})`} icon={<CheckCircle2 size={14} />} />
          <SegmentedControlItem value="gantt" label="Lịch trình Gantt" icon={<Calendar size={14} />} />
          <SegmentedControlItem value="team" label="Đồng đội sẵn sàng" icon={<Users size={14} />} />
        </SegmentedControl>
      </div>

      {activeTab === "active" && <VStack gap={3}>{renderTaskGrid("active", inProgressTasks)}</VStack>}
      {activeTab === "planned" && <VStack gap={3}>{renderTaskGrid("planned", plannedTasks)}</VStack>}
      {activeTab === "done" && <VStack gap={3}>{renderTaskGrid("done", doneTasks)}</VStack>}
      {activeTab === "gantt" && <MemberTimelineGantt tasks={myTasks} projects={projects} />}
      {activeTab === "team" && <TeamAvailabilityTab availableTeammates={availableTeammates} />}

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
