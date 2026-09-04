import { getMembers } from "@/services/members.service";
import { getAllActiveTasks } from "@/services/tasks.service";
import { getProjects } from "@/services/projects.service";

export interface GroundingSnapshot {
  members: Array<{ name: string; status: string; effortPercent: number; skills: string[] }>;
  activeTasks: Array<{ memberName: string; projectName: string; title: string; status: string; effortPercent: number }>;
}

export async function buildGroundingSnapshot(): Promise<GroundingSnapshot> {
  const [members, tasks, projects] = await Promise.all([getMembers(), getAllActiveTasks(), getProjects()]);

  const memberById = new Map(members.map((m) => [m.id, m]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  return {
    members: members.map((m) => ({ name: m.name, status: m.status, effortPercent: m.effortPercent, skills: m.skills })),
    activeTasks: tasks.map((t) => ({
      memberName: memberById.get(t.memberId)?.name ?? "Unknown",
      projectName: projectById.get(t.projectId)?.name ?? "Unknown",
      title: t.title,
      status: t.status,
      effortPercent: t.effortPercent,
    })),
  };
}
