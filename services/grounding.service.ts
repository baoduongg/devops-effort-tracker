import { getMembers } from "@/services/members.service";
import { getAllTasks } from "@/services/tasks.service";
import { getProjects } from "@/services/projects.service";
import { formatTaskEffort } from "@/lib/effort";

export interface GroundingSnapshot {
  members: Array<{
    id: string;
    name: string;
    role: "leader" | "devops";
    status: string;
    totalEffortPercent: number;
    skills: string[];
    activeTasks: Array<{ title: string; project: string; duration: string; effort: number; endDate: string | null }>;
    plannedTasks: Array<{ title: string; project: string; duration: string; effort: number; startDate: string }>;
  }>;
  projects: Array<{
    name: string;
    totalEffort: number;
    assignedMembers: string[];
    activeTaskCount: number;
  }>;
}

export async function buildGroundingSnapshot(): Promise<GroundingSnapshot> {
  const [members, tasks, projects] = await Promise.all([getMembers(), getAllTasks(), getProjects()]);

  const memberById = new Map(members.map((m) => [m.id, m]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  const memberData = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.memberId === m.id);
    const inProgress = memberTasks.filter((t) => t.status === "in_progress");
    const planned = memberTasks.filter((t) => t.status === "planned");
    const computedEffort = inProgress.reduce((sum, t) => sum + (t.effortPercent || 0), 0);

    return {
      id: m.id,
      name: m.name,
      role: m.role ?? "devops",
      status: computedEffort > 100 ? "overloaded" : computedEffort > 60 ? "busy" : "available",
      totalEffortPercent: computedEffort,
      skills: m.skills,
      activeTasks: inProgress.map((t) => ({
        title: t.title,
        project: projectById.get(t.projectId)?.name ?? "Unknown",
        duration: formatTaskEffort(t),
        effort: t.effortPercent || 0,
        endDate: t.endDate,
      })),
      plannedTasks: planned.map((t) => ({
        title: t.title,
        project: projectById.get(t.projectId)?.name ?? "Unknown",
        duration: formatTaskEffort(t),
        effort: t.effortPercent || 0,
        startDate: t.startDate,
      })),
    };
  });

  const projectData = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id && t.status === "in_progress");
    const totalEffort = pTasks.reduce((sum, t) => sum + (t.effortPercent || 0), 0);
    const assignedMemberNames = Array.from(
      new Set(pTasks.map((t) => memberById.get(t.memberId)?.name).filter(Boolean))
    ) as string[];

    return {
      name: p.name,
      totalEffort,
      assignedMembers: assignedMemberNames,
      activeTaskCount: pTasks.length,
    };
  });

  return {
    members: memberData,
    projects: projectData,
  };
}

