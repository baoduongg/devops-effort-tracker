import { getMembers } from "@/services/members.service";
import { getAllTasks } from "@/services/tasks.service";
import { getProjects } from "@/services/projects.service";
import { formatTaskEffort } from "@/lib/effort";
import { isOverdue, daysOverdue } from "@/lib/overdue";

export interface GroundingSnapshot {
  members: Array<{
    id: string;
    name: string;
    role: "leader" | "devops";
    status: string;
    totalEffortMinutes: number;
    skills: string[];
    activeTasks: Array<{ title: string; project: string; duration: string; effort: number; endDate: string | null }>;
    plannedTasks: Array<{ title: string; project: string; duration: string; effort: number; startDate: string }>;
  }>;
  projects: Array<{
    name: string;
    totalEffortMinutes: number;
    assignedMembers: string[];
    activeTaskCount: number;
  }>;
  /** F-08: pre-computed fields so the model never has to re-derive these from raw lists. */
  overdueTasks: Array<{ title: string; project: string; memberName: string; endDate: string; daysOverdue: number }>;
  freeMembers: string[];
  busyMembers: string[];
  overloadedMembers: string[];
  projectProgress: Array<{ name: string; planned: number; inProgress: number; done: number }>;
}

/**
 * ISSUE-17/FB-CHAT-04: `restrictToMemberId` scopes the snapshot BEFORE any derived field
 * (memberData, freeMembers/busyMembers/overloadedMembers, project assignedMembers, overdueTasks)
 * is computed, so a devops asker's free-text Q&A prompt (which serializes the whole snapshot
 * verbatim) never sees any other member's data — not just leaders (rev 11/17), but peer devops
 * too (requirements.md: "devops hỏi về bản thân là chính... không mở rộng quyền tra cứu sang
 * dữ liệu người khác"). Pass the asker's own memberId when `askerRole` is "devops"; leaders keep
 * seeing the full team (pass undefined/omit).
 */
export async function buildGroundingSnapshot(restrictToMemberId?: string): Promise<GroundingSnapshot> {
  const [allMembers, tasks, projects] = await Promise.all([getMembers(), getAllTasks(), getProjects()]);
  const members = restrictToMemberId ? allMembers.filter((m) => m.id === restrictToMemberId) : allMembers;

  const memberById = new Map(members.map((m) => [m.id, m]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  const memberData = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.memberId === m.id);
    const inProgress = memberTasks.filter((t) => t.status === "in_progress");
    const planned = memberTasks.filter((t) => t.status === "planned");
    const computedEffortMinutes = inProgress.reduce((sum, t) => sum + (t.effortMinutes || 0), 0);

    return {
      id: m.id,
      name: m.name,
      role: m.role ?? "devops",
      status: computedEffortMinutes > 480 ? "overloaded" : computedEffortMinutes > 288 ? "busy" : "available",
      totalEffortMinutes: computedEffortMinutes,
      skills: m.skills,
      activeTasks: inProgress.map((t) => ({
        title: t.title,
        project: projectById.get(t.projectId)?.name ?? "Unknown",
        duration: formatTaskEffort(t),
        effort: t.effortMinutes || 0,
        endDate: t.endDate,
      })),
      plannedTasks: planned.map((t) => ({
        title: t.title,
        project: projectById.get(t.projectId)?.name ?? "Unknown",
        duration: formatTaskEffort(t),
        effort: t.effortMinutes || 0,
        startDate: t.startDate,
      })),
    };
  });

  const projectData = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id && t.status === "in_progress");
    const totalEffortMinutes = pTasks.reduce((sum, t) => sum + (t.effortMinutes || 0), 0);
    const assignedMemberNames = Array.from(
      new Set(pTasks.map((t) => memberById.get(t.memberId)?.name).filter(Boolean))
    ) as string[];

    return {
      name: p.name,
      totalEffortMinutes,
      assignedMembers: assignedMemberNames,
      activeTaskCount: pTasks.length,
    };
  });

  const overdueTasks = tasks
    .filter(isOverdue)
    .map((t) => ({
      title: t.title,
      project: projectById.get(t.projectId)?.name ?? "Unknown",
      memberName: memberById.get(t.memberId)?.name ?? "Unknown",
      endDate: t.endDate as string,
      daysOverdue: daysOverdue(t.endDate as string),
    }));

  const freeMembers = memberData.filter((m) => m.status === "available").map((m) => m.name);
  const busyMembers = memberData.filter((m) => m.status === "busy").map((m) => m.name);
  const overloadedMembers = memberData.filter((m) => m.status === "overloaded").map((m) => m.name);

  const projectProgress = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id);
    return {
      name: p.name,
      planned: pTasks.filter((t) => t.status === "planned").length,
      inProgress: pTasks.filter((t) => t.status === "in_progress").length,
      done: pTasks.filter((t) => t.status === "done").length,
    };
  });

  return {
    members: memberData,
    projects: projectData,
    overdueTasks,
    freeMembers,
    busyMembers,
    overloadedMembers,
    projectProgress,
  };
}

