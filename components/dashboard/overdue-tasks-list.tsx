import { Card } from "@astryxdesign/core/Card";
import { List, ListItem } from "@astryxdesign/core/List";
import { Token } from "@astryxdesign/core/Token";
import { Text } from "@astryxdesign/core/Text";
import { daysOverdue } from "@/lib/overdue";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";

interface OverdueTasksListProps {
  tasks: Task[];
  members: Member[];
  projects: Project[];
}

export function OverdueTasksList({ tasks, members, projects }: OverdueTasksListProps): React.JSX.Element | null {
  if (tasks.length === 0) return null;

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const sorted = [...tasks].sort(
    (a, b) => daysOverdue(b.endDate as string) - daysOverdue(a.endDate as string)
  );

  return (
    <Card elevation="low">
      <List header={<Text weight="semibold">Overdue Tasks</Text>} hasDividers>
        {sorted.map((task) => {
          const overdueDays = daysOverdue(task.endDate as string);
          const member = memberMap.get(task.memberId);
          const project = projectMap.get(task.projectId);
          return (
            <ListItem
              key={task.id}
              label={task.title}
              href={member ? `/members/${member.id}` : undefined}
              description={`${member?.name ?? "Unassigned"} — ${project?.name ?? "No project"}`}
              endContent={
                <Token
                  label={`Trễ ${overdueDays} ngày`}
                  color={overdueDays > 7 ? "red" : "orange"}
                  size="sm"
                />
              }
            />
          );
        })}
      </List>
    </Card>
  );
}
