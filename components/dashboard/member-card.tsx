import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatTaskEffort } from "@/lib/effort";
import type { Member, MemberStatus } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface MemberCardProps {
  member: Member;
  currentTaskTitle?: string | null;
  projectName?: string | null;
  tasks?: Task[];
  projects?: Project[];
}

const effortVariant = (percent: number): "error" | "warning" | "success" => {
  if (percent > 100) return "error";
  if (percent > 60) return "warning";
  return "success";
};

export function MemberCard({
  member,
  currentTaskTitle,
  projectName,
  tasks = [],
  projects = [],
}: MemberCardProps): React.JSX.Element {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const inProgressTasks = tasks.filter((t) => t.memberId === member.id && t.status === "in_progress");
  const plannedTasks = tasks.filter((t) => t.memberId === member.id && t.status === "planned");
  const doneTasks = tasks
    .filter((t) => t.memberId === member.id && t.status === "done")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const computedEffort =
    inProgressTasks.length > 0
      ? inProgressTasks.reduce((sum, t) => sum + (t.effortPercent ?? 0), 0)
      : member.effortPercent;

  const derivedStatus: MemberStatus =
    computedEffort > 100 ? "overloaded" : computedEffort > 60 ? "busy" : "available";

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
          <StatusBadge status={derivedStatus} />
        </HStack>

        {/* Active Tasks list */}
        {inProgressTasks.length > 0 ? (
          <div className="flex flex-col gap-1.5 min-h-[56px]">
            {inProgressTasks.slice(0, 2).map((t) => {
              const proj = projectMap.get(t.projectId);
              return (
                <div key={t.id} className="flex items-center justify-between text-xs gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: proj?.color ?? "#3b82f6" }}
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
              <span className="text-[11px] text-neutral-400">+{inProgressTasks.length - 2} more active tasks</span>
            )}
          </div>
        ) : doneTasks.length > 0 ? (
          <div className="flex flex-col gap-1.5 min-h-[56px]">
            {doneTasks.slice(0, 2).map((t) => {
              const proj = projectMap.get(t.projectId);
              return (
                <div key={t.id} className="flex items-center justify-between text-xs gap-1.5">
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
          value={Math.min(computedEffort, 100)}
          hasValueLabel
          formatValueLabel={() => `${computedEffort}%`}
          variant={effortVariant(computedEffort)}
        />

        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-white/5">
          <span>{plannedTasks.length} upcoming queued</span>
          <span>Updated {new Date(member.updatedAt).toLocaleDateString()}</span>
        </div>
      </VStack>
    </ClickableCard>
  );
}

