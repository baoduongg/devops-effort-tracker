import { History } from "lucide-react";
import { List } from "@astryxdesign/core/List";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { TimelineItem } from "@/components/timeline/timeline-item";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface TimelineViewProps {
  tasks: Task[];
  projects: Project[];
}

export function TimelineView({ tasks, projects }: TimelineViewProps): React.JSX.Element {
  if (tasks.length === 0) {
    return <EmptyState icon={<Icon icon={History} size="lg" />} title="No tasks yet" isCompact />;
  }

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <List hasDividers>
      {sorted.map((task) => (
        <TimelineItem key={task.id} task={task} project={projects.find((p) => p.id === task.projectId) ?? null} />
      ))}
    </List>
  );
}
