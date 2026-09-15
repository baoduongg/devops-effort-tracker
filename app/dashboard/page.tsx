"use client";

import { useState } from "react";
import { Users, Layers, Sparkles, Plus } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Button } from "@astryxdesign/core/Button";
import { useMembersStore } from "@/store/members.store";
import { useAuthStore } from "@/store/auth.store";
import { DevOpsWorkspace } from "@/components/dashboard/devops-workspace";
import { TaskCreateModal } from "@/components/tasks/task-create-modal";
import { OverdueTasksList } from "@/components/dashboard/overdue-tasks-list";
import { PMTeamRoster } from "@/components/dashboard/pm-team-roster";
import { TeamTimelineChart } from "@/components/dashboard/team-timeline-chart";
import { ProjectAllocationGrid } from "@/components/dashboard/project-allocation-grid";
import { FloatingChat } from "@/components/dashboard/floating-chat";
import { CapacityKpiBar } from "@/components/dashboard/CapacityKpiBar";
import { DashboardFilterBar, type DashboardTab } from "@/components/dashboard/DashboardFilterBar";
import { useDashboardData } from "@/components/dashboard/hooks/useDashboardData";
import { useOverdueNotifications } from "@/components/dashboard/hooks/useOverdueNotifications";
import { useTeamCapacityStats, type CapacityFilter } from "@/components/dashboard/hooks/useTeamCapacityStats";

export default function DashboardPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const members = useMembersStore((state) => state.members);

  const { tasks, projects, projectsLoaded, notifications, loading } = useDashboardData();

  const [devopsViewMode, setDevopsViewMode] = useState<"personal" | "team">("personal");
  const [activeTab, setActiveTab] = useState<DashboardTab>("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("all");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const {
    displayMembers,
    availableMembersCount,
    overloadedCount,
    activeWorkingCount,
    overdueTasks,
    projectOptions,
    filteredMembers,
    hasActiveFilters,
    currentMember,
  } = useTeamCapacityStats(members, tasks, user, searchQuery, selectedProjectId, capacityFilter, projects);

  useOverdueNotifications(overdueTasks, projectsLoaded, members, projects, notifications);

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

        <DevOpsWorkspace user={user} member={currentMember} tasks={tasks} projects={projects} members={members} />
        <FloatingChat />
      </VStack>
    );
  }

  return (
    <VStack gap={5}>
      {user?.role === "devops" && devopsViewMode === "team" && (
        <HStack gap={3} vAlign="center" className="p-2.5 px-3.5 rounded-xl bg-accent/10 border border-accent/25 justify-between text-xs">
          <Text size="xsm" color="accent">Bạn đang xem góc nhìn điều hành toàn đội DevOps.</Text>
          <Button label="Quay lại Dashboard" variant="secondary" size="sm" onClick={() => setDevopsViewMode("personal")} />
        </HStack>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-border">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
              <Sparkles size={16} />
            </span>
            <Heading level={1}>DevOps Effort Hub</Heading>
          </HStack>
          <Text type="supporting">
            Bảng điều khiển phân bổ nguồn lực, theo dõi tải công việc và kế hoạch sprint của team DevOps.
          </Text>
        </VStack>

        <Button label="Tạo Task mới" icon={<Plus size={15} />} variant="primary" onClick={() => setIsCreateTaskModalOpen(true)} />
      </div>

      {!loading && members.length > 0 && (
        <CapacityKpiBar
          capacityFilter={capacityFilter}
          onCapacityFilterChange={setCapacityFilter}
          displayMembersCount={displayMembers.length}
          availableMembersCount={availableMembersCount}
          activeWorkingCount={activeWorkingCount}
          overloadedCount={overloadedCount}
          overdueCount={overdueTasks.length}
        />
      )}

      {!loading && overdueTasks.length > 0 && capacityFilter !== "overdue" && (
        <OverdueTasksList tasks={overdueTasks} members={members} projects={projects} />
      )}

      <DashboardFilterBar
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        projectOptions={projectOptions}
        selectedProjectId={selectedProjectId}
        onSelectedProjectIdChange={setSelectedProjectId}
        hasActiveFilters={Boolean(hasActiveFilters)}
        onClearFilters={() => {
          setSearchQuery("");
          setSelectedProjectId("all");
          setCapacityFilter("all");
        }}
      />

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
        <PMTeamRoster members={filteredMembers} tasks={tasks} />
      ) : activeTab === "timeline" ? (
        <TeamTimelineChart members={filteredMembers} tasks={tasks} projects={projects} />
      ) : (
        <ProjectAllocationGrid projects={projects} tasks={tasks} members={filteredMembers} />
      )}

      <FloatingChat />

      <TaskCreateModal
        isOpen={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        projects={projects}
        members={members}
      />
    </VStack>
  );
}
