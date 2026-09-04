"use client";

import { useEffect, useState } from "react";
import { subscribeMembers } from "@/services/members.service";
import { getProjects } from "@/services/projects.service";
import { getTasksByMember } from "@/services/tasks.service";
import { useMembersStore } from "@/store/members.store";
import { MemberCard } from "@/components/dashboard/member-card";
import type { Project } from "@/types/project";

export default function DashboardPage(): React.JSX.Element {
  const members = useMembersStore((state) => state.members);
  const setMembers = useMembersStore((state) => state.setMembers);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskTitles, setTaskTitles] = useState<Record<string, { title: string; projectId: string }>>({});

  useEffect(() => {
    const unsubscribe = subscribeMembers(setMembers);
    getProjects().then(setProjects);
    return () => unsubscribe();
  }, [setMembers]);

  useEffect(() => {
    async function loadCurrentTasks(): Promise<void> {
      const entries = await Promise.all(
        members
          .filter((m) => m.currentTaskId)
          .map(async (m) => {
            const tasks = await getTasksByMember(m.id);
            const current = tasks.find((t) => t.id === m.currentTaskId);
            return current ? ([m.id, { title: current.title, projectId: current.projectId }] as const) : null;
          })
      );
      setTaskTitles(Object.fromEntries(entries.filter((e): e is [string, { title: string; projectId: string }] => e !== null)));
    }
    if (members.length > 0) loadCurrentTasks();
  }, [members]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Team Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const task = taskTitles[member.id];
          const project = task ? projects.find((p) => p.id === task.projectId) : null;
          return (
            <MemberCard
              key={member.id}
              member={member}
              currentTaskTitle={task?.title ?? null}
              projectName={project?.name ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
