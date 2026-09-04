import { Badge } from "@/components/ui/badge";
import type { Task, TaskStatus } from "@/types/task";
import type { Project } from "@/types/project";

interface TimelineItemProps {
  task: Task;
  project: Project | null;
}

const statusLabels: Record<TaskStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
};

export function TimelineItem({ task, project }: TimelineItemProps): React.JSX.Element {
  return (
    <div className="relative border-l-2 pl-4 pb-6">
      <div
        className="absolute -left-[5px] top-1 h-2 w-2 rounded-full"
        style={{ backgroundColor: project?.color ?? "#6b7280" }}
      />
      <div className="flex items-center gap-2">
        <p className="font-medium">{task.title}</p>
        <Badge variant="outline">{statusLabels[task.status]}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{project?.name ?? "Unknown project"}</p>
      <p className="text-sm">{task.description}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(task.startDate).toLocaleDateString()}
        {task.endDate ? ` – ${new Date(task.endDate).toLocaleDateString()}` : ""} · {task.effortPercent}% effort
      </p>
    </div>
  );
}
