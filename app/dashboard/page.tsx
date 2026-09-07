"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  ListChecks,
  Gauge,
  TriangleAlert,
  Search,
  Calendar,
  LayoutGrid,
  Layers,
  FolderGit2,
  RotateCcw,
} from "lucide-react";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Grid } from "@astryxdesign/core/Grid";
import { Card } from "@astryxdesign/core/Card";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { subscribeMembers } from "@/services/members.service";
import { getProjects } from "@/services/projects.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { subscribeNotifications, createNotification } from "@/services/notifications.service";
import { useMembersStore } from "@/store/members.store";
import { StatCard } from "@/components/dashboard/stat-card";
import { MemberCard } from "@/components/dashboard/member-card";
import { OverdueTasksList } from "@/components/dashboard/overdue-tasks-list";
import { WorkloadMatrix } from "@/components/dashboard/workload-matrix";
import { TeamTimelineChart } from "@/components/dashboard/team-timeline-chart";
import { ProjectAllocationGrid } from "@/components/dashboard/project-allocation-grid";
import { FloatingChat } from "@/components/dashboard/floating-chat";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { Notification } from "@/types/notification";

type DashboardTab = "matrix" | "timeline" | "projects" | "cards";

export default function DashboardPage(): React.JSX.Element {
  const members = useMembersStore((state) => state.members);
  const setMembers = useMembersStore((state) => state.setMembers);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<DashboardTab>("matrix");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedCapacity, setSelectedCapacity] = useState<string>("all");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

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
  const plannedTasks = useMemo(() => tasks.filter((t) => t.status === "planned"), [tasks]);

  const memberEffortMap = useMemo(() => {
    const map = new Map<string, number>();
    inProgressTasks.forEach((t) => {
      map.set(t.memberId, (map.get(t.memberId) ?? 0) + t.effortPercent);
    });
    return map;
  }, [inProgressTasks]);

  const avgEffort = members.length
    ? Math.round(
        members.reduce((sum, m) => sum + (memberEffortMap.get(m.id) ?? m.effortPercent), 0) / members.length
      )
    : 0;

  const overloadedCount = members.filter(
    (m) => (memberEffortMap.get(m.id) ?? m.effortPercent) > 100
  ).length;

  const alertCount = notifications.filter((n) => !n.read && n.severity !== "info").length;

  // F-01: derived overdue tasks
  const overdueTasks = useMemo(() => tasks.filter(isOverdue), [tasks]);
  const overdueMemberIds = useMemo(() => new Set(overdueTasks.map((t) => t.memberId)), [overdueTasks]);

  // F-02: notify once per task the first time it's detected overdue
  useEffect(() => {
    // rev 2 / FB-01: don't write notifications until projects has loaded at least once,
    // otherwise project lookup below falls back to "No project" and gets frozen forever (dedup by fixed doc id).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overdueTasks, projectsLoaded]);

  // Filter options for Astryx Selector
  const projectOptions = useMemo(() => {
    return [
      { value: "all", label: `All Projects (${projects.length})` },
      ...projects.map((p) => ({ value: p.id, label: p.name })),
    ];
  }, [projects]);

  const capacityOptions = [
    { value: "all", label: "All Bandwidths" },
    { value: "overloaded", label: "Overloaded (>100%)" },
    { value: "busy", label: "Busy (80-100%)" },
    { value: "balanced", label: "Balanced (50-79%)" },
    { value: "available", label: "Available (<50%)" },
  ];

  // Filter members based on Search, Project, and Capacity status
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const totalEffort = memberEffortMap.get(member.id) ?? member.effortPercent;
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
      if (selectedCapacity === "overloaded" && totalEffort <= 100) return false;
      if (selectedCapacity === "busy" && (totalEffort < 80 || totalEffort > 100)) return false;
      if (selectedCapacity === "balanced" && (totalEffort < 50 || totalEffort >= 80)) return false;
      if (selectedCapacity === "available" && totalEffort >= 50) return false;

      // F-03: "Xem team đang trễ" filter
      if (showOverdueOnly && !overdueMemberIds.has(member.id)) return false;

      return true;
    });
  }, [
    members,
    memberEffortMap,
    tasks,
    searchQuery,
    selectedProjectId,
    selectedCapacity,
    showOverdueOnly,
    overdueMemberIds,
  ]);

  return (
    <VStack gap={6}>
      {/* Header with Segmented Tabs */}
      <HStack gap={4} vAlign="center">
        <StackItem size="fill">
          <VStack gap={1}>
            <Heading level={1}>DevOps Effort & Plan Hub</Heading>
            <Text type="supporting">
              Live workload visibility, project distribution, and upcoming sprint plans.
            </Text>
          </VStack>
        </StackItem>

        <SegmentedControl
          label="View mode"
          value={activeTab}
          onChange={(v) => setActiveTab(v as DashboardTab)}
        >
          <SegmentedControlItem value="matrix" label="Workload Matrix" icon={<Layers size={14} strokeWidth={2} />} />
          <SegmentedControlItem value="timeline" label="Team Timeline" icon={<Calendar size={14} strokeWidth={2} />} />
          <SegmentedControlItem value="projects" label="By Project" icon={<FolderGit2 size={14} strokeWidth={2} />} />
          <SegmentedControlItem value="cards" label="Cards" icon={<LayoutGrid size={14} strokeWidth={2} />} />
        </SegmentedControl>
      </HStack>

      {/* KPI Stats Cards */}
      {!loading && members.length > 0 && (
        <Grid columns={{ minWidth: 220, max: 4 }} gap={4}>
          <StatCard label="DevOps Engineers" value={String(members.length)} icon={Users} tone="primary" />
          <StatCard
            label="In-Progress Tasks"
            value={`${inProgressTasks.length} active (${plannedTasks.length} queued)`}
            icon={ListChecks}
            tone="success"
          />
          <StatCard label="Avg. Team Effort" value={`${avgEffort}%`} icon={Gauge} tone="warning" />
          <StatCard
            label="Overloaded (>100%)"
            value={`${overloadedCount} members`}
            icon={TriangleAlert}
            tone={overloadedCount > 0 ? "destructive" : "primary"}
          />
          <StatCard
            label="Overdue Tasks"
            value={`${overdueTasks.length} tasks`}
            icon={TriangleAlert}
            tone={overdueTasks.length > 0 ? "destructive" : "primary"}
          />
        </Grid>
      )}

      {/* Search & Filter Toolbar Card */}
      <Card elevation="low">
        <HStack gap={4} vAlign="center">
          <StackItem size="fill">
            <TextInput
              label="Search"
              placeholder="Search member name, skill, or task title..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </StackItem>
          <Selector
            label="Project"
            options={projectOptions}
            value={selectedProjectId}
            onChange={(v) => setSelectedProjectId(String(v))}
          />
          <Selector
            label="Bandwidth"
            options={capacityOptions}
            value={selectedCapacity}
            onChange={(v) => setSelectedCapacity(String(v))}
          />
          <div className="self-end pb-1">
            <Button
              label="Xem team đang trễ"
              icon={<TriangleAlert size={14} />}
              variant={showOverdueOnly ? "primary" : "ghost"}
              onClick={() => setShowOverdueOnly((prev) => !prev)}
            />
          </div>
          {(searchQuery || selectedProjectId !== "all" || selectedCapacity !== "all" || showOverdueOnly) && (
            <div className="self-end pb-1">
              <Button
                label="Reset"
                icon={<RotateCcw size={14} />}
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProjectId("all");
                  setSelectedCapacity("all");
                  setShowOverdueOnly(false);
                }}
              />
            </div>
          )}
        </HStack>
      </Card>

      {/* Overdue Tasks (F-01): hidden entirely when empty */}
      {!loading && (
        <OverdueTasksList tasks={overdueTasks} members={members} projects={projects} />
      )}

      {/* Main View Area */}
      {loading ? (
        <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={180} index={i} />
          ))}
        </Grid>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Icon icon={Users} size="lg" />}
          title="No matching team members"
          description="Try adjusting your search query or filters."
        />
      ) : activeTab === "matrix" ? (
        <WorkloadMatrix members={filteredMembers} tasks={tasks} projects={projects} />
      ) : activeTab === "timeline" ? (
        <TeamTimelineChart members={filteredMembers} tasks={tasks} projects={projects} />
      ) : activeTab === "projects" ? (
        <ProjectAllocationGrid projects={projects} tasks={tasks} members={filteredMembers} />
      ) : (
        <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              tasks={tasks}
              projects={projects}
            />
          ))}
        </Grid>
      )}

      {/* Quick AI Chat Floating Widget */}
      <FloatingChat />
    </VStack>
  );
}
