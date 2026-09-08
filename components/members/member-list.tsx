"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Trash2,
  UserPlus,
  ArrowUpRight,
  Crown,
  Cpu,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Info,
} from "lucide-react";
import { VStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { useAuthStore } from "@/store/auth.store";
import { subscribeUsers } from "@/services/auth.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { formatEffortDuration, minutesToWorkdayPercent } from "@/lib/effort";
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

// Thresholds scaled from an 8h/480m workday
function getStatusBadge(status: MemberStatus, effortMinutes: number, activeCount: number, plannedCount: number) {
  if (activeCount === 0 || effortMinutes === 0) {
    return {
      label: plannedCount > 0 ? `Trống việc (${plannedCount} task KH)` : "Trống việc",
      colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      dot: "bg-emerald-400",
    };
  }
  if (effortMinutes > 480 || status === "overloaded") {
    return {
      label: `Quá tải (${formatEffortDuration(effortMinutes)})`,
      colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/25",
      dot: "bg-rose-400 animate-pulse",
    };
  }
  if (effortMinutes >= 384) {
    return {
      label: `Bận tải cao (${formatEffortDuration(effortMinutes)})`,
      colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/25",
      dot: "bg-amber-400",
    };
  }
  return {
    label: `Đang làm việc (${formatEffortDuration(effortMinutes)})`,
    colorClass: "bg-sky-500/10 text-sky-400 border-sky-500/25",
    dot: "bg-sky-400",
  };
}

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
              <span className="text-2xl font-bold text-neutral-100">{kpis.total}</span>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Trống việc / Rảnh</span>
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-400">{kpis.available}</span>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Đang làm việc</span>
              <Clock size={15} className="text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-sky-400">{kpis.busy}</span>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Quá tải (&gt;100%)</span>
              <AlertTriangle size={15} className="text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-rose-400">{kpis.overloaded}</span>
              <span className="text-xs text-neutral-500">thành viên</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/20 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Mức tải TB</span>
              <Layers size={15} className="text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold ${
                  kpis.avgEffortMinutes > 480
                    ? "text-rose-400"
                    : kpis.avgEffortMinutes > 288
                    ? "text-sky-400"
                    : "text-emerald-400"
                }`}
              >
                {formatEffortDuration(kpis.avgEffortMinutes)}
              </span>
              <span className="text-xs text-neutral-500">toàn đội</span>
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner: Reminding that current user is filtered out */}
      {currentUser && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-500/[0.05] border border-sky-500/15 text-xs text-sky-300">
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
            const { effort, activeCount, plannedCount, status } = getMemberWorkload(member);
            const statusInfo = getStatusBadge(status, effort, activeCount, plannedCount);
            const role = getMemberRole(member);
            const isLeaderRole = role === "leader";

            return (
              <div
                key={member.id}
                className="group relative rounded-2xl bg-neutral-900/60 border border-white/[0.08] hover:border-sky-500/30 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between p-4 gap-4 backdrop-blur-md"
              >
                {/* Header: Avatar, Name, Email, Badges */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar
                          name={member.name}
                          src={member.photoURL ?? undefined}
                          size="md"
                          tooltip={false}
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-900 ${statusInfo.dot}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/members/${member.id}`}
                          className="hover:text-sky-400 font-semibold text-neutral-100 text-base line-clamp-1 transition-colors"
                        >
                          {member.name}
                        </Link>
                        <Text type="supporting" maxLines={1}>
                          {member.email}
                        </Text>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${statusInfo.colorClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2">
                    {isLeaderRole ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm">
                        <Crown size={12} className="text-amber-400" />
                        Trưởng nhóm (Leader)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        <Cpu size={12} className="text-sky-400" />
                        Kỹ sư DevOps
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {member.skills.length > 0 ? (
                    member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-[11px] rounded-md bg-white/[0.03] border border-white/[0.07] text-neutral-300 group-hover:border-white/[0.12] transition-colors"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-neutral-500 italic">Chưa cấu hình kỹ năng</span>
                  )}
                </div>

                {/* Workload Progress Bar */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">Tải công việc:</span>
                    <span
                      className={`font-bold ${
                        effort > 480
                          ? "text-rose-400"
                          : effort > 288
                          ? "text-sky-300"
                          : effort > 0
                          ? "text-sky-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {formatEffortDuration(effort)} {activeCount > 0 ? `(${activeCount} task đang làm)` : "(Rảnh)"}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        effort > 480
                          ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                          : effort > 288
                          ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                          : effort > 0
                          ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                          : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      }`}
                      style={{ width: `${Math.min(minutesToWorkdayPercent(effort), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-1 mt-auto">
                  <Button
                    label="Xem hồ sơ & Lịch trình"
                    icon={<ArrowUpRight size={14} />}
                    variant="ghost"
                    href={`/members/${member.id}`}
                  />

                  {canDelete && (
                    <IconButton
                      label="Xóa thành viên"
                      icon={<Trash2 size={15} strokeWidth={2} />}
                      variant="ghost"
                      onClick={() => onDelete(member.id)}
                      tooltip="Xóa thành viên"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </VStack>
  );
}
