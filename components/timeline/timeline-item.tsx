import { ListItem } from "@astryxdesign/core/List";
import { Token } from "@astryxdesign/core/Token";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/Stack";
import { isOverdue, daysOverdue } from "@/lib/overdue";
import { formatTaskEffort } from "@/lib/effort";
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
  const overdue = isOverdue(task);
  const overdueDays = task.endDate ? daysOverdue(task.endDate) : 0;
  return (
    <ListItem
      label={task.title}
      endContent={
        overdue ? (
          <Token label="Overdue" color={overdueDays > 7 ? "red" : "orange"} size="sm" />
        ) : (
          <Token label={statusLabels[task.status]} />
        )
      }
      description={
        <VStack gap={1}>
          <Text type="supporting">{project?.name ?? "Unknown project"}</Text>

          {task.description && <Text type="supporting">{task.description}</Text>}
          <Text type="supporting">
            {new Date(task.startDate).toLocaleDateString()}
            {task.endDate ? ` - ${new Date(task.endDate).toLocaleDateString()}` : ""}
            {" · "}
            {formatTaskEffort(task)}
          </Text>
        </VStack>
      }
    />
  );
}
