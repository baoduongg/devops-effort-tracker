"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, UserPlus, Users, CheckCircle2, Clock, AlertTriangle, Layers, Info } from "lucide-react";
import { VStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { MemberCard } from "@/components/dashboard/member-card";
import { useAuthStore } from "@/store/auth.store";
import { subscribeUsers } from "@/services/auth.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { formatEffortDuration } from "@/lib/effort";
import type { Member, MemberStatus } from "@/types/member";
import type { AppUser, UserRole } from "@/types/user";
import type { Task } from "@/types/task";

interface MemberListProps {
  members: Member[];
  tasks?: Task[];
  onDelete: (id: string) => void;
  canDelete?: boolean;
}

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "available", label: "🟢 Trống việc (Rảnh)" },
  { value: "busy", label: "🔵 Đang làm việc" },
  { value: "overloaded", label: "🔴 Quá tải (>100%)" },
];

const roleFilterOptions = [
  { value: "all", label: "Tất cả vai trò" },
  { value: "leader", label: "👑 Trưởng nhóm (Leader)" },
  { value: "devops", label: "🛠 Kỹ sư DevOps" },
];

const sortOptions = [
  { value: "name_asc", label: "Tên (A → Z)" },
  { value: "effort_desc", label: "Tải việc (Cao → Thấp)" },
  { value: "effort_asc", label: "Tải việc (Thấp → Cao)" },
];

export function MemberList({
  members,
  tasks: initialTasks,
  onDelete,
  canDelete = true,
}: MemberListProps): React.JSX.Element {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [sortBy, setSortBy] = useState("name_asc");

  // Subscribe to real-time users collection to accurately resolve roles
  useEffect(() => {
    const unsubscribe = subscribeUsers(setUsers);
    return () => unsubscribe();
  }, []);

  // Subscribe to live tasks if not passed from parent
  useEffect(() => {
    if (initialTasks) return;
    const unsubscribe = subscribeAllTasks(setLiveTasks);
    return () => unsubscribe();
  }, [initialTasks]);

  const tasks = initialTasks ?? liveTasks;

  // Map user role by memberId or email
  const userRoleMap = useMemo(() => {
    const map = new Map<string, UserRole>();
    for (const u of users) {
      if (u.memberId) map.set(u.memberId, u.role);
      if (u.email) map.set(u.email.toLowerCase(), u.role);
    }
    return map;
  }, [users]);

  const getMemberRole = useCallback(
    (member: Member): UserRole => {
      if (member.role) return member.role;
      const fromEmail = member.email ? userRoleMap.get(member.email.toLowerCase()) : undefined;
      if (fromEmail) return fromEmail;
      const fromId = userRoleMap.get(member.id);
      if (fromId) return fromId;
      return "devops";
    },
    [userRoleMap]
  );

  // Group tasks by memberId
  const memberTasksMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const arr = map.get(t.memberId) || [];
      arr.push(t);
      map.set(t.memberId, arr);
    }
    return map;
  }, [tasks]);

  // Compute live workload details for a member
  const getMemberWorkload = useCallback(
    (member: Member) => {
      const mTasks = memberTasksMap.get(member.id) || [];
      const inProgress = mTasks.filter((t) => t.status === "in_progress");
      const planned = mTasks.filter((t) => t.status === "planned");
      const done = mTasks.filter((t) => t.status === "done");

      const effort =
        mTasks.length > 0
          ? inProgress.reduce((sum, t) => sum + t.effortMinutes, 0)
          : member.effortMinutes || 0;

      const activeCount = inProgress.length;
      const plannedCount = planned.length;

      let status: MemberStatus = "available";
      if (activeCount === 0 || effort === 0) {
        status = "available";
      } else if (effort > 480) {
        status = "overloaded";
      } else {
        status = "busy";
      }

      return { effort, activeCount, plannedCount, status, inProgress, planned, done };
    },
    [memberTasksMap]
  );

  // Filter out the currently logged-in user from the management list
  const otherMembers = useMemo(() => {
    if (!currentUser) return members;
    return members.filter((m) => {
      const isSameMemberId = Boolean(currentUser.memberId && m.id === currentUser.memberId);
      const isSameEmail = Boolean(
        currentUser.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      return !isSameMemberId && !isSameEmail;
    });
  }, [members, currentUser]);

  // Overall KPI metrics calculated across other team members dynamically
  const kpis = useMemo(() => {
    const total = otherMembers.length;
    const available = otherMembers.filter((m) => {
      const { effort, activeCount } = getMemberWorkload(m);
      return activeCount === 0 || effort === 0;
    }).length;
    const busy = otherMembers.filter((m) => {
      const { effort, activeCount } = getMemberWorkload(m);
      return activeCount > 0 && effort > 0 && effort <= 480;
    }).length;
    const overloaded = otherMembers.filter((m) => {
      const { effort } = getMemberWorkload(m);
      return effort > 480;
    }).length;
    const avgEffortMinutes =
      total > 0
        ? Math.round(
          otherMembers.reduce((sum, m) => sum + getMemberWorkload(m).effort, 0) / total
        )
        : 0;

    return { total, available, busy, overloaded, avgEffortMinutes };
  }, [otherMembers, getMemberWorkload]);

  // Filter and sort the remaining members
  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = otherMembers.filter((m) => {
      const memberRole = getMemberRole(m);
      const { effort, activeCount } = getMemberWorkload(m);

      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && (activeCount === 0 || effort === 0)) ||
        (statusFilter === "overloaded" && effort > 480) ||
        (statusFilter === "busy" && activeCount > 0 && effort > 0 && effort <= 480);

      const matchesRole = roleFilter === "all" || memberRole === roleFilter;

      return matchesQuery && matchesStatus && matchesRole;
    });

    return filtered.sort((a, b) => {
      const workloadA = getMemberWorkload(a).effort;
      const workloadB = getMemberWorkload(b).effort;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name, "vi");
      if (sortBy === "effort_desc") return workloadB - workloadA;
      if (sortBy === "effort_asc") return workloadA - workloadB;
      return 0;
    });
  }, [otherMembers, query, statusFilter, roleFilter, sortBy, getMemberRole, getMemberWorkload]);

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Icon icon={UserPlus} size="lg" />}
        title="Chưa có thành viên nào"
        description="Thêm thành viên DevOps đầu tiên để bắt đầu theo dõi Effort."
      />
    );
  }

  return (
    <VStack gap={5}>
      {/* Quick KPI Overview Bar */}
      {otherMembers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Đội ngũ quản lý</span>
              <Users size={15} className="text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <Text type="display-3" weight="semibold" hasTabularNumbers className="text-neutral-100">
                {kpis.total}
              </Text>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Trống việc / Rảnh</span>
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <Text type="display-3" weight="semibold" hasTabularNumbers className="text-emerald-400">
                {kpis.available}
              </Text>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Đang làm việc</span>
              <Clock size={15} className="text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <Text type="display-3" weight="semibold" hasTabularNumbers className="text-sky-400">
                {kpis.busy}
              </Text>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Quá tải (&gt;100%)</span>
              <AlertTriangle size={15} className="text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <Text type="display-3" weight="semibold" hasTabularNumbers className="text-rose-400">
                {kpis.overloaded}
              </Text>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Mức tải TB</span>
              <Layers size={15} className="text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <Text
                type="display-3"
                weight="semibold"
                hasTabularNumbers
                className={kpis.avgEffortMinutes > 480
                  ? "text-rose-400"
                  : kpis.avgEffortMinutes > 288
                    ? "text-sky-400"
                    : "text-emerald-400"
                }
              >
                {formatEffortDuration(kpis.avgEffortMinutes)}
              </Text>
              <span className="text-xs text-neutral-500">toàn đội</span>
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner: Reminding that current user is filtered out */}
      {currentUser && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-500/[0.05] border border-sky-500/15 text-sm text-sky-300">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-sky-400 shrink-0" />
            <span>
              Đang ẩn hồ sơ của bạn (<strong>{currentUser.displayName || currentUser.email}</strong>) khỏi danh sách quản lý để bạn thuận tiện theo dõi các thành viên khác.
            </span>
          </div>
          {currentUser.memberId && (
            <Link
              href={`/members/${currentUser.memberId}`}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2 shrink-0 ml-2"
            >
              Xem hồ sơ của tôi →
            </Link>
          )}
        </div>
      )}

      {/* Search and Filters Bar */}
      <Card elevation="low">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <TextInput
              label="Tìm kiếm nhân sự"
              isLabelHidden
              value={query}
              onChange={setQuery}
              placeholder="Tìm theo tên, email hoặc kỹ năng..."
              startIcon={Search}
              hasClear
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="w-full sm:w-44">
              <Selector
                label="Trạng thái"
                isLabelHidden
                options={statusOptions}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as MemberStatus | "all")}
              />
            </div>

            <div className="w-full sm:w-44">
              <Selector
                label="Vai trò"
                isLabelHidden
                options={roleFilterOptions}
                value={roleFilter}
                onChange={(v) => setRoleFilter(v as UserRole | "all")}
              />
            </div>

            <div className="w-full sm:w-44">
              <Selector
                label="Sắp xếp"
                isLabelHidden
                options={sortOptions}
                value={sortBy}
                onChange={(v) => setSortBy(v as string)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Member Cards Grid */}
      {filteredAndSorted.length === 0 ? (
        <EmptyState
          title={
            otherMembers.length === 0
              ? "Bạn là thành viên duy nhất trong hệ thống"
              : "Không tìm thấy thành viên phù hợp"
          }
          description={
            otherMembers.length === 0
              ? "Hãy thêm các thành viên DevOps khác để bắt đầu quản lý và phân bổ công việc."
              : "Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trạng thái/vai trò."
          }
          isCompact
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((member) => {
            const memberTasks = memberTasksMap.get(member.id) || [];
            const role = getMemberRole(member);

            return (
              <MemberCard
                key={member.id}
                member={member}
                tasks={memberTasks}
                role={role}
                skills={member.skills}
                onDelete={canDelete ? () => onDelete(member.id) : undefined}
              />
            );
          })}
        </div>
      )}
    </VStack>
  );
}
