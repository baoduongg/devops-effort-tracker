"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Calendar,
  Layers,
  FolderGit2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Sparkles,
  Plus,
} from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Card } from "@astryxdesign/core/Card";
import { subscribeMembers } from "@/services/members.service";
import { getProjects } from "@/services/projects.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { subscribeNotifications, createNotification } from "@/services/notifications.service";
import { useMembersStore } from "@/store/members.store";
import { useAuthStore } from "@/store/auth.store";
import { DevOpsWorkspace } from "@/components/dashboard/devops-workspace";
import { TaskCreateModal } from "@/components/tasks/task-create-modal";
import { OverdueTasksList } from "@/components/dashboard/overdue-tasks-list";
import { PMTeamRoster } from "@/components/dashboard/pm-team-roster";
import { TeamTimelineChart } from "@/components/dashboard/team-timeline-chart";
import { ProjectAllocationGrid } from "@/components/dashboard/project-allocation-grid";
import { FloatingChat } from "@/components/dashboard/floating-chat";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { Notification } from "@/types/notification";

type DashboardTab = "roster" | "timeline" | "projects";

export default function DashboardPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const members = useMembersStore((state) => state.members);
  const setMembers = useMembersStore((state) => state.setMembers);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // View switch for devops user
  const [devopsViewMode, setDevopsViewMode] = useState<"personal" | "team">("personal");

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<DashboardTab>("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedCapacity, setSelectedCapacity] = useState<string>("all");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);



  useEffect(() => {
    const unsubscribeMembers = subscribeMembers((next) => {
      setMembers(next);
      setLoading(false);
    });
    const unsubscribeTasks = subscribeAllTasks((nextTasks) => {
      setTasks(nextTasks);
    });
    const unsubscribeNotifications = subscribeNotifications(setNotifications);
    getProjects().then((next) => {
      setProjects(next);
      setProjectsLoaded(true);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeTasks();
      unsubscribeNotifications();
    };
  }, [setMembers]);

  // Aggregate stats dynamically from real tasks
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === "in_progress"), [tasks]);

  const memberEffortMap = useMemo(() => {
    const map = new Map<string, number>();
    inProgressTasks.forEach((t) => {
      map.set(t.memberId, (map.get(t.memberId) ?? 0) + t.effortPercent);
    });
    return map;
  }, [inProgressTasks]);

  const memberActiveTasksCountMap = useMemo(() => {
    const map = new Map<string, number>();
    inProgressTasks.forEach((t) => {
      map.set(t.memberId, (map.get(t.memberId) ?? 0) + 1);
    });
    return map;
  }, [inProgressTasks]);

  // Filter out the currently logged-in user from the team dashboard view
  const displayMembers = useMemo(() => {
    if (!user) return members;
    return members.filter((m) => {
      const isSameMemberId = Boolean(user.memberId && m.id === user.memberId);
      const isSameEmail = Boolean(
        user.email && m.email && m.email.toLowerCase() === user.email.toLowerCase()
      );
      return !isSameMemberId && !isSameEmail;
    });
  }, [members, user]);

  // Status counts for PM quick glance (across other team members)
  const availableMembersCount = useMemo(() => {
    return displayMembers.filter((m) => {
      const effort = memberEffortMap.get(m.id) ?? 0;
      const count = memberActiveTasksCountMap.get(m.id) ?? 0;
      return count === 0 || effort === 0;
    }).length;
  }, [displayMembers, memberEffortMap, memberActiveTasksCountMap]);

  const overloadedCount = useMemo(() => {
    return displayMembers.filter((m) => (memberEffortMap.get(m.id) ?? 0) > 100).length;
  }, [displayMembers, memberEffortMap]);

  const activeWorkingCount = useMemo(() => {
    return displayMembers.filter((m) => {
      const effort = memberEffortMap.get(m.id) ?? 0;
      const count = memberActiveTasksCountMap.get(m.id) ?? 0;
      return count > 0 && effort > 0 && effort <= 100;
    }).length;
  }, [displayMembers, memberEffortMap, memberActiveTasksCountMap]);

  // Derived overdue tasks
  const overdueTasks = useMemo(() => tasks.filter(isOverdue), [tasks]);
  const overdueMemberIds = useMemo(() => new Set(overdueTasks.map((t) => t.memberId)), [overdueTasks]);

  // Notify once per task the first time it's detected overdue
  useEffect(() => {
    if (!projectsLoaded) return;
    if (overdueTasks.length === 0) return;
    const alreadyNotified = new Set(
      notifications.filter((n) => n.type === "overdue_task").map((n) => n.relatedTaskId)
    );
    overdueTasks.forEach((task) => {
      if (alreadyNotified.has(task.id)) return;
      const member = members.find((m) => m.id === task.memberId);
      const project = projects.find((p) => p.id === task.projectId);
      const overdueDays = daysOverdue(task.endDate as string);
      const dueDate = new Date(task.endDate as string);
      const formattedDate = `${String(dueDate.getDate()).padStart(2, "0")}/${String(
        dueDate.getMonth() + 1
      ).padStart(2, "0")}/${dueDate.getFullYear()}`;
      createNotification(
        {
          type: "overdue_task",
          title: `${task.title} đã quá hạn`,
          message: `${member?.name ?? "Unassigned"} — ${project?.name ?? "No project"} — trễ ${overdueDays} ngày (hạn ${formattedDate})`,
          severity: "warning",
          relatedProjectId: task.projectId,
          relatedTaskId: task.id,
          relatedMemberId: task.memberId,
          read: false,
        },
        `overdue_task_${task.id}`
      );
    });
  }, [overdueTasks, projectsLoaded, members, projects, notifications]);

  // Filter options for Astryx Selector
  const projectOptions = useMemo(() => {
    return [
      { value: "all", label: `Tất cả dự án (${projects.length})` },
      ...projects.map((p) => ({ value: p.id, label: p.name })),
    ];
  }, [projects]);

  // Filter members based on Search, Project, Capacity, and Overdue
  const filteredMembers = useMemo(() => {
    return displayMembers.filter((member) => {
      const totalEffort = memberEffortMap.get(member.id) ?? 0;
      const activeCount = memberActiveTasksCountMap.get(member.id) ?? 0;
      const memberTasks = tasks.filter((t) => t.memberId === member.id);

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesSkill = member.skills.some((s) => s.toLowerCase().includes(q));
        const matchesTask = memberTasks.some((t) => t.title.toLowerCase().includes(q));
        if (!matchesName && !matchesSkill && !matchesTask) return false;
      }

      // Project Filter
      if (selectedProjectId !== "all") {
        const hasProject = memberTasks.some((t) => t.projectId === selectedProjectId);
        if (!hasProject) return false;
      }

      // Capacity Filter
      if (selectedCapacity === "available") {
        if (activeCount > 0 && totalEffort > 0) return false;
      } else if (selectedCapacity === "working") {
        if (activeCount === 0 || totalEffort === 0 || totalEffort > 100) return false;
      } else if (selectedCapacity === "overloaded") {
        if (totalEffort <= 100) return false;
      }

      // Overdue Filter
      if (showOverdueOnly && !overdueMemberIds.has(member.id)) return false;

      return true;
    });
  }, [
    displayMembers,
    memberEffortMap,
    memberActiveTasksCountMap,
    tasks,
    searchQuery,
    selectedProjectId,
    selectedCapacity,
    showOverdueOnly,
    overdueMemberIds,
  ]);

  const hasActiveFilters = searchQuery || selectedProjectId !== "all" || selectedCapacity !== "all" || showOverdueOnly;

  const currentMember = useMemo(
    () => members.find((m) => m.id === user?.memberId) ?? null,
    [members, user?.memberId]
  );

  // If role is DevOps and viewing personal mode, render DevOpsWorkspace
  if (user?.role === "devops" && devopsViewMode === "personal") {
    return (
      <VStack gap={4}>
        <div className="flex items-center justify-end">
          <Button
            label="Xem Dashboard toàn đội"
            icon={<Layers size={14} />}
            variant="ghost"
            size="sm"
            onClick={() => setDevopsViewMode("team")}
          />
        </div>

        <DevOpsWorkspace
          user={user}
          member={currentMember}
          tasks={tasks}
          projects={projects}
          members={members}
        />
        <FloatingChat />
      </VStack>
    );
  }

  return (
    <VStack gap={5}>
      {/* If DevOps is viewing team mode, show a return button banner */}
      {user?.role === "devops" && devopsViewMode === "team" && (
        <div className="p-2.5 px-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between text-xs text-sky-200">
          <span>Bạn đang xem góc nhìn điều hành toàn đội DevOps.</span>
          <Button
            label="Quay lại Dashboard"
            variant="secondary"
            size="sm"
            onClick={() => setDevopsViewMode("personal")}
          />

        </div>
      )}

      {/* Header: Title, Description & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles size={16} />
            </span>
            <Heading level={1}>DevOps Effort Hub</Heading>
          </div>
          <Text type="supporting">
            Bảng điều khiển phân bổ nguồn lực, theo dõi tải công việc và kế hoạch sprint của team DevOps.
          </Text>
        </div>

        <HStack gap={2} vAlign="center">
          <Button
            label="Tạo Task mới"
            icon={<Plus size={15} />}
            variant="primary"
            onClick={() => setIsCreateTaskModalOpen(true)}
          />
          <SegmentedControl
            label="Chế độ xem"
            value={activeTab}
            onChange={(v) => setActiveTab(v as DashboardTab)}
          >
            <SegmentedControlItem value="roster" label="Bảng nhân sự" icon={<Layers size={14} strokeWidth={2} />} />
            <SegmentedControlItem value="timeline" label="Lịch trình Gantt" icon={<Calendar size={14} strokeWidth={2} />} />
            <SegmentedControlItem value="projects" label="Theo Dự án" icon={<FolderGit2 size={14} strokeWidth={2} />} />
          </SegmentedControl>
        </HStack>
      </div>

      {/* Unified Executive KPI & Quick Filter Bar */}
      {!loading && members.length > 0 && (
        <Card elevation="low">

          <VStack gap={3}>
            {/* KPI Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {/* All Members */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCapacity("all");
                  setShowOverdueOnly(false);
                }}
                className={`p-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedCapacity === "all" && !showOverdueOnly
                    ? "bg-sky-500/15 border-sky-500/40 ring-1 ring-sky-500/30 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-neutral-300 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-white/[0.05] text-neutral-400">
                    <Users size={14} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-neutral-400 font-medium">Tổng DevOps</span>
                    <span className="text-base font-bold text-neutral-100">{displayMembers.length}</span>
                  </div>
                </div>
              </button>

              {/* Ready / Available */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCapacity(selectedCapacity === "available" && !showOverdueOnly ? "all" : "available");
                  setShowOverdueOnly(false);
                }}
                className={`p-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedCapacity === "available" && !showOverdueOnly
                    ? "bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-neutral-300 hover:bg-emerald-500/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={14} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-emerald-400/90 font-medium">Trống việc / Rảnh</span>
                    <span className="text-base font-bold text-emerald-300">{availableMembersCount}</span>
                  </div>
                </div>
              </button>

              {/* Balanced / Working */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCapacity(selectedCapacity === "working" && !showOverdueOnly ? "all" : "working");
                  setShowOverdueOnly(false);
                }}
                className={`p-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedCapacity === "working" && !showOverdueOnly
                    ? "bg-sky-500/15 border-sky-500/40 ring-1 ring-sky-500/30 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-neutral-300 hover:bg-sky-500/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Clock size={14} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-sky-400 font-medium">Vừa tải (50-100%)</span>
                    <span className="text-base font-bold text-sky-200">{activeWorkingCount}</span>
                  </div>
                </div>
              </button>

              {/* Overloaded */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCapacity(selectedCapacity === "overloaded" && !showOverdueOnly ? "all" : "overloaded");
                  setShowOverdueOnly(false);
                }}
                className={`p-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedCapacity === "overloaded" && !showOverdueOnly
                    ? "bg-rose-500/15 border-rose-500/40 ring-1 ring-rose-500/30 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-neutral-300 hover:bg-rose-500/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <AlertTriangle size={14} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-rose-400 font-medium">Quá tải (&gt;100%)</span>
                    <span className="text-base font-bold text-rose-300">{overloadedCount}</span>
                  </div>
                </div>
              </button>

              {/* Overdue */}
              <button
                type="button"
                onClick={() => {
                  setShowOverdueOnly((prev) => !prev);
                  setSelectedCapacity("all");
                }}
                className={`p-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  showOverdueOnly
                    ? "bg-amber-500/20 border-amber-500/50 ring-1 ring-amber-500/40 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-neutral-300 hover:bg-amber-500/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <AlertTriangle size={14} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-amber-400 font-medium">Trễ hạn</span>
                    <span className="text-base font-bold text-amber-300">{overdueTasks.length}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Filter Search & Project Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-white/[0.06]">
              <div className="flex-1 w-full">
                <TextInput
                  label="Tìm kiếm DevOps"
                  isLabelHidden
                  placeholder="Tìm theo tên DevOps, kỹ năng hoặc task đang làm..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  startIcon={Search}
                  hasClear
                />
              </div>

              <div className="w-full sm:w-64">
                <Selector
                  label="Dự án"
                  isLabelHidden
                  options={projectOptions}
                  value={selectedProjectId}
                  onChange={(v) => setSelectedProjectId(String(v))}
                />
              </div>

              {hasActiveFilters && (
                <Button
                  label="Bỏ lọc"
                  icon={<RotateCcw size={13} />}
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedProjectId("all");
                    setSelectedCapacity("all");
                    setShowOverdueOnly(false);
                  }}
                />
              )}
            </div>
          </VStack>
        </Card>
      )}

      {/* Overdue Tasks Alert Banner (if any exist) */}
      {!loading && overdueTasks.length > 0 && !showOverdueOnly && (
        <OverdueTasksList tasks={overdueTasks} members={members} projects={projects} />
      )}

      {/* Main Content Area */}
      {loading ? (
        <VStack gap={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={90} index={i} />
          ))}
        </VStack>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Icon icon={Users} size="lg" />}
          title="Không tìm thấy thành viên phù hợp"
          description="Thử điều chỉnh từ khóa tìm kiếm hoặc bấm 'Bỏ lọc' để xem toàn bộ danh sách."
        />
      ) : activeTab === "roster" ? (
        <PMTeamRoster members={filteredMembers} tasks={tasks} projects={projects} />
      ) : activeTab === "timeline" ? (
        <TeamTimelineChart members={filteredMembers} tasks={tasks} projects={projects} />
      ) : (
        <ProjectAllocationGrid projects={projects} tasks={tasks} members={filteredMembers} />
      )}

      {/* Floating AI Chat Assistant */}
      <FloatingChat />

      {/* Create Task Modal Dialog */}
      <TaskCreateModal
        isOpen={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        projects={projects}
        members={members}
      />
    </VStack>
  );
}
