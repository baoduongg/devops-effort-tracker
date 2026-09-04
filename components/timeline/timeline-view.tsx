import { TimelineItem } from "@/components/timeline/timeline-item";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface TimelineViewProps {
  tasks: Task[];
  projects: Project[];
}

export function TimelineView({ tasks, projects }: TimelineViewProps): React.JSX.Element {
  if (tasks.length === 0) {
    return <p className="text-muted-foreground">No tasks yet.</p>;
  }

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div>
      {sorted.map((task) => (
        <TimelineItem key={task.id} task={task} project={projects.find((p) => p.id === task.projectId) ?? null} />
      ))}
    </div>
  );
}
