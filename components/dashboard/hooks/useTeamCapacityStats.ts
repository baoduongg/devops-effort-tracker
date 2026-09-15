import { useMemo } from "react";
import { isOverdue } from "@/lib/overdue";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { AppUser } from "@/types/user";

export type CapacityFilter = "all" | "available" | "working" | "overloaded" | "overdue";

export function useTeamCapacityStats(
  members: Member[],
  tasks: Task[],
  user: AppUser | null,
  searchQuery: string,
  selectedProjectId: string,
  capacityFilter: CapacityFilter,
  projects: Project[]
) {
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === "in_progress"), [tasks]);

  const memberEffortMap = useMemo(() => {
    const map = new Map<string, number>();
    inProgressTasks.forEach((t) => {
      map.set(t.memberId, (map.get(t.memberId) ?? 0) + t.effortMinutes);
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

  const availableMembersCount = useMemo(() => {
    return displayMembers.filter((m) => {
      const effort = memberEffortMap.get(m.id) ?? 0;
      const count = memberActiveTasksCountMap.get(m.id) ?? 0;
      return count === 0 || effort === 0;
    }).length;
  }, [displayMembers, memberEffortMap, memberActiveTasksCountMap]);

  const overloadedCount = useMemo(() => {
    return displayMembers.filter((m) => (memberEffortMap.get(m.id) ?? 0) > 480).length;
  }, [displayMembers, memberEffortMap]);

  const activeWorkingCount = useMemo(() => {
    return displayMembers.filter((m) => {
      const effort = memberEffortMap.get(m.id) ?? 0;
      const count = memberActiveTasksCountMap.get(m.id) ?? 0;
      return count > 0 && effort > 0 && effort <= 480;
    }).length;
  }, [displayMembers, memberEffortMap, memberActiveTasksCountMap]);

  const overdueTasks = useMemo(() => tasks.filter(isOverdue), [tasks]);
  const overdueMemberIds = useMemo(() => new Set(overdueTasks.map((t) => t.memberId)), [overdueTasks]);

  const projectOptions = useMemo(() => {
    return [
      { value: "all", label: `Tất cả dự án (${projects.length})` },
      ...projects.map((p) => ({ value: p.id, label: p.name })),
    ];
  }, [projects]);

  const filteredMembers = useMemo(() => {
    return displayMembers.filter((member) => {
      const totalEffort = memberEffortMap.get(member.id) ?? 0;
      const activeCount = memberActiveTasksCountMap.get(member.id) ?? 0;
      const memberTasks = tasks.filter((t) => t.memberId === member.id);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesSkill = member.skills.some((s) => s.toLowerCase().includes(q));
        const matchesTask = memberTasks.some((t) => t.title.toLowerCase().includes(q));
        if (!matchesName && !matchesSkill && !matchesTask) return false;
      }

      if (selectedProjectId !== "all") {
        const hasProject = memberTasks.some((t) => t.projectId === selectedProjectId);
        if (!hasProject) return false;
      }

      if (capacityFilter === "available") {
        if (activeCount > 0 && totalEffort > 0) return false;
      } else if (capacityFilter === "working") {
        if (activeCount === 0 || totalEffort === 0 || totalEffort > 480) return false;
      } else if (capacityFilter === "overloaded") {
        if (totalEffort <= 480) return false;
      } else if (capacityFilter === "overdue") {
        if (!overdueMemberIds.has(member.id)) return false;
      }

      return true;
    });
  }, [
    displayMembers,
    memberEffortMap,
    memberActiveTasksCountMap,
    tasks,
    searchQuery,
    selectedProjectId,
    capacityFilter,
    overdueMemberIds,
  ]);

  const hasActiveFilters = Boolean(searchQuery) || selectedProjectId !== "all" || capacityFilter !== "all";

  const currentMember = useMemo(
    () => members.find((m) => m.id === user?.memberId) ?? null,
    [members, user?.memberId]
  );

  return {
    displayMembers,
    availableMembersCount,
    overloadedCount,
    activeWorkingCount,
    overdueTasks,
    projectOptions,
    filteredMembers,
    hasActiveFilters,
    currentMember,
  };
}
