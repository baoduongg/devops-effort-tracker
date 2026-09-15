"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { List, ListItem } from "@astryxdesign/core/List";
import { Badge } from "@astryxdesign/core/Badge";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { HStack, StackItem } from "@astryxdesign/core/Stack";
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
  const [isOpen, setIsOpen] = useState(true);

  if (tasks.length === 0) return null;

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const sorted = [...tasks].sort(
    (a, b) => daysOverdue(b.endDate as string) - daysOverdue(a.endDate as string)
  );

  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-error/[0.11] to-error/[0.04] border border-error/30">
      <HStack gap={2} vAlign="center" className="pb-2">
        <AlertTriangle size={17} className="text-error" />
        <StackItem size="fill">
          <Text weight="semibold">{tasks.length} Task trễ hạn</Text>
        </StackItem>
        <Button
          label={isOpen ? "Ẩn" : "Hiện"}
          icon={<ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen((prev) => !prev)}
        />
      </HStack>

      {isOpen && (
        <List hasDividers>
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
                endContent={<Badge label={`Trễ ${overdueDays} ngày`} variant="error" />}
              />
            );
          })}
        </List>
      )}
    </div>
  );
}
