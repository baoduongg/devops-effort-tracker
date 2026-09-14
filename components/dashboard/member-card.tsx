import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Token } from "@astryxdesign/core/Token";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Crown, Cpu, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatTaskEffort, formatEffortDuration, minutesToWorkdayPercent, getEffortStatus } from "@/lib/effort";
import { getProjectColor } from "@/lib/project-colors";
import { sortByDateDesc } from "@/lib/date";
import type { Member } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { UserRole } from "@/types/user";

interface MemberCardProps {
  member: Member;
  currentTaskTitle?: string | null;
  projectName?: string | null;
  tasks?: Task[];
  projects?: Project[];
  /** When provided, renders a Leader/DevOps role token under the name (member-list use case). */
  role?: UserRole;
  /** When provided, renders skill tokens below the header (member-list use case). */
  skills?: string[];
  /** When provided, renders a delete IconButton in the card footer (member-list use case). */
  onDelete?: () => void;
}

export function MemberCard({
  member,
  currentTaskTitle,
  projectName,
  tasks = [],
  projects = [],
  role,
  skills,
  onDelete,
}: MemberCardProps): React.JSX.Element {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const inProgressTasks = tasks.filter((t) => t.memberId === member.id && t.status === "in_progress");
  const plannedTasks = tasks.filter((t) => t.memberId === member.id && t.status === "planned");
  const doneTasks = tasks
    .filter((t) => t.memberId === member.id && t.status === "done")
    .sort(sortByDateDesc("updatedAt"));

  const computedEffort =
    inProgressTasks.length > 0
      ? inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0)
      : member.effortMinutes;

  const effortStatus = getEffortStatus(computedEffort, inProgressTasks.length);

  return (
    <ClickableCard href={`/members/${member.id}`} label={member.name} elevation="low">
      <VStack gap={4}>
        <HStack gap={3} vAlign="center">
          <Avatar name={member.name} src={member.photoURL ?? undefined} size="md" tooltip={false} />
          <StackItem size="fill">
            <VStack gap={1}>
              <Text weight="semibold" maxLines={1}>

                {member.name}
              </Text>
              <Text type="supporting" maxLines={1}>
                {member.email}
              </Text>
            </VStack>
          </StackItem>
          <StatusBadge status={effortStatus.status} />
        </HStack>

        {role && (
          <HStack gap={2} vAlign="center">
            {role === "leader" ? (
              <Token label="Trưởng nhóm (Leader)" color="orange" icon={<Crown size={12} />} />
            ) : (
              <Token label="Kỹ sư DevOps" color="blue" icon={<Cpu size={12} />} />
            )}
          </HStack>
        )}

        {skills && (
          <div className="flex flex-wrap gap-1">
            {skills.length > 0 ? (
              skills.map((skill) => <Token key={skill} label={skill} size="sm" />)
            ) : (
              <Text type="supporting">Chưa cấu hình kỹ năng</Text>
            )}
          </div>
        )}

        {/* Active Tasks list */}
        {inProgressTasks.length > 0 ? (
          <div className="flex flex-col gap-1.5 min-h-[56px]">
            {inProgressTasks.slice(0, 2).map((t) => {
              const proj = projectMap.get(t.projectId);
              return (
                <div key={t.id} className="flex items-center justify-between text-sm gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getProjectColor(proj?.color) }}
                    />
                    <span className="font-semibold text-neutral-300 flex-shrink-0">
                      [{proj?.name ?? "General"}]
                    </span>
                    <span className="truncate text-neutral-200">{t.title}</span>
                  </div>
                  <span className="text-sky-400 font-bold flex-shrink-0">{formatTaskEffort(t)}</span>
                </div>
              );
            })}
            {inProgressTasks.length > 2 && (
              <span className="text-sm text-neutral-400">+{inProgressTasks.length - 2} more active tasks</span>
            )}
          </div>
        ) : doneTasks.length > 0 ? (
          <div className="flex flex-col gap-1.5 min-h-[56px]">
            {doneTasks.slice(0, 2).map((t) => {
              const proj = projectMap.get(t.projectId);
              return (
                <div key={t.id} className="flex items-center justify-between text-sm gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-emerald-400 flex-shrink-0">✓</span>
                    <span className="font-semibold text-neutral-400 flex-shrink-0">
                      [{proj?.name ?? "General"}]
                    </span>
                    <span className="truncate text-neutral-400">{t.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <VStack gap={1} className="min-h-[56px]">
            <Text weight="medium" maxLines={1}>

              {currentTaskTitle ?? "No active task"}
            </Text>
            <Text type="supporting" maxLines={1}>
              {projectName ?? "Available for assignments"}
            </Text>
          </VStack>
        )}

        <ProgressBar
          label="Total Effort"
          value={Math.min(minutesToWorkdayPercent(computedEffort), 100)}
          hasValueLabel
          formatValueLabel={() => formatEffortDuration(computedEffort)}
          variant={effortStatus.variant}
        />

        <div className="flex items-center justify-between text-sm text-neutral-400 pt-1 border-t border-white/5">
          <span>{plannedTasks.length} upcoming queued</span>
          <HStack gap={2} vAlign="center">
            <span>Updated {new Date(member.updatedAt).toLocaleDateString()}</span>
            {onDelete && (
              <IconButton
                label="Xóa thành viên"
                icon={<Trash2 size={15} strokeWidth={2} />}
                variant="ghost"
                size="sm"
                tooltip="Xóa thành viên"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
              />
            )}
          </HStack>
        </div>
      </VStack>
    </ClickableCard>
  );
}

