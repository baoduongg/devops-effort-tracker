import type { GroundingSnapshot } from "@/services/grounding.service";
import { getAllTaskChangeLogs } from "@/services/taskChangeLogs.service";
import { formatEffortDuration, getEffortStatus } from "@/lib/effort";
import { daysOverdue } from "@/lib/overdue";
import type { Member } from "@/types/member";
import type {
  ClarificationRequest,
  MemberAvailability,
  TaskListPayload,
  TaskSummaryItem,
  OverloadPayload,
  EffortPayload,
  LoadPayload,
  ReportPayload,
  OverduePayload,
  MembersListPayload,
  ProjectsListPayload,
  HelpPayload,
  MemberInfoPayload,
  LoadMemberItem,
  EffortMemberItem,
  ReportProjectItem,
  OverdueTaskItem,
  MembersListItem,
  ProjectsListItem,
} from "@/types/chat";

/**
 * F-12/ISSUE-16(c): when rendering the "here are the members you can pick from" list for a devops
 * asker, leader accounts must be filtered out — devops should only see themselves/peers, never a
 * leader offered as a valid lookup/assignment target. `forMode` is the identity of the person the
 * list is being shown to, not the member being described.
 */
export function renderMemberList(members: Member[], snapshotMembers?: GroundingSnapshot["members"], forMode: "leader" | "devops" = "leader"): string {
  const visibleMembers = forMode === "devops" ? members.filter((m) => m.role !== "leader") : members;
  if (!visibleMembers || visibleMembers.length === 0) {
    return "- *(Chưa có thành viên nào được đăng ký trong hệ thống)*";
  }

  const snapshotMap = new Map((snapshotMembers || []).map((m) => [m.name.toLowerCase(), m]));

  return visibleMembers
    .map((m) => {
      const snap = snapshotMap.get(m.name.toLowerCase());
      const effortMinutes = snap ? snap.totalEffortMinutes : (m.effortMinutes ?? 0);
      const statusIcon = effortMinutes > 480 ? "🔴 Quá tải" : effortMinutes > 288 ? "🟡 Vừa tải" : "🟢 Sẵn sàng";
      const roleText = m.role === "leader" ? "Leader" : "DevOps Engineer";
      const skillsText = m.skills && m.skills.length > 0 ? ` [${m.skills.slice(0, 3).join(", ")}]` : "";
      return `- **${m.name}** (${roleText}${skillsText}) — ${statusIcon} (${formatEffortDuration(effortMinutes)} Effort)`;
    })
    .join("\n");
}

/**
 * TASK-CARD: builds the structured task list payload mirroring landing page /task response UI.
 */
export function buildTaskListPayload(snapshot: GroundingSnapshot): TaskListPayload {
  const tasks: TaskSummaryItem[] = [];
  const overdueTitles = new Set(
    snapshot.overdueTasks.map((ot) => `${ot.memberName}:::${ot.title}`)
  );

  snapshot.members.forEach((m) => {
    m.activeTasks.forEach((t) => {
      const isTaskOverdue =
        overdueTitles.has(`${m.name}:::${t.title}`) ||
        (t.endDate ? daysOverdue(t.endDate) > 0 : false);
      tasks.push({
        title: t.title,
        memberName: m.name,
        projectName: t.project,
        duration: t.duration,
        statusLabel: isTaskOverdue ? "Trễ hạn" : "Đang làm",
        statusVariant: isTaskOverdue ? "overdue" : "in_progress",
      });
    });
    m.plannedTasks.forEach((t) => {
      tasks.push({
        title: t.title,
        memberName: m.name,
        projectName: t.project,
        duration: t.duration,
        statusLabel: "Kế hoạch",
        statusVariant: "planned",
      });
    });
  });

  const suggestedActions: TaskListPayload["suggestedActions"] = [
    { label: "👉 /assign giao task mới", slashCommand: "/assign" },
    { label: "⚡ /load xem tải team", slashCommand: "/load" },
    { label: "🔍 /free ai đang rảnh", slashCommand: "/free" },
  ];

  return {
    title: "📋 Danh sách các task đang thực hiện và kế hoạch:",
    tasks,
    suggestedActions,
  };
}

/**
 * FREE-CARD: builds the deterministic member-availability payload for the "who's free" card.
 */
export function buildFreeCardAvailability(snapshot: GroundingSnapshot): MemberAvailability {
  const members = snapshot.members.filter((m) => m.role !== "leader").map((m) => {
    const { label, variant } = getEffortStatus(m.totalEffortMinutes, m.activeTasks.length);
    return {
      id: m.id,
      name: m.name,
      role: m.role,
      statusLabel: label,
      statusVariant: variant,
      effortMinutes: m.totalEffortMinutes,
      capacityMinutes: 480,
      skills: m.skills ?? [],
      activeTaskTitle: m.activeTasks[0]?.title ?? null,
    };
  });

  const suggestedActions: MemberAvailability["suggestedActions"] = [];
  const firstFree = snapshot.freeMembers[0];
  if (firstFree) {
    suggestedActions.push({ label: `👉 /assign cho ${firstFree}`, slashCommand: `/assign ${firstFree}` });
  }
  suggestedActions.push({ label: "⚡ /load xem toàn team", slashCommand: "/load" });

  return { members, suggestedActions };
}

export function buildOverloadPayload(snapshot: GroundingSnapshot): OverloadPayload {
  const overloadedMembers = snapshot.members
    .filter((m) => m.role !== "leader" && (m.status === "overloaded" || m.totalEffortMinutes > 480))
    .map((m) => {
      const percent = Number(((m.totalEffortMinutes / 480) * 100).toFixed(1));
      const firstFree = snapshot.freeMembers[0];
      return {
        name: m.name,
        role: m.role === "devops" ? "Cloud / DevOps Eng" : m.role,
        effortMinutes: m.totalEffortMinutes,
        capacityMinutes: 480,
        percentage: percent,
        taskCount: m.activeTasks.length,
        taskTitles: m.activeTasks.map((t) => `${t.title} (${t.effort}m)`),
        suggestedReassignTarget: firstFree || null,
      };
    });

  const firstFree = snapshot.freeMembers[0];
  const suggestedActions: OverloadPayload["suggestedActions"] = [];
  if (firstFree && overloadedMembers.length > 0) {
    suggestedActions.push({
      label: `/reassign sang ${firstFree}`,
      slashCommand: `/reassign`,
    });
  }
  suggestedActions.push({ label: "⚡ /load xem toàn team", slashCommand: "/load" });

  return { overloadedMembers, suggestedActions };
}

export function buildEffortPayload(snapshot: GroundingSnapshot): EffortPayload {
  const assignable = snapshot.members.filter((m) => m.role !== "leader");
  const totalEffortMinutes = assignable.reduce((sum, m) => sum + m.totalEffortMinutes, 0);
  const totalCapacityMinutes = assignable.length * 480;
  const overallPercentage =
    totalCapacityMinutes > 0 ? Number(((totalEffortMinutes / totalCapacityMinutes) * 100).toFixed(1)) : 0;

  const members: EffortMemberItem[] = assignable.map((m) => ({
    name: m.name,
    effortMinutes: m.totalEffortMinutes,
    capacityMinutes: 480,
    percentage: Number(((m.totalEffortMinutes / 480) * 100).toFixed(0)),
  }));

  return {
    totalEffortMinutes,
    totalCapacityMinutes,
    overallPercentage,
    members,
  };
}

export function buildLoadPayload(snapshot: GroundingSnapshot): LoadPayload {
  const assignable = snapshot.members.filter((m) => m.role !== "leader");
  const members: LoadMemberItem[] = assignable.map((m) => {
    const percent = Number(((m.totalEffortMinutes / 480) * 100).toFixed(1));
    const isOverload = m.totalEffortMinutes > 480;
    const isFree = m.totalEffortMinutes === 0;
    const isBusy = m.totalEffortMinutes >= 288 && m.totalEffortMinutes <= 480;

    let statusVariant: LoadMemberItem["statusVariant"] = "normal";
    let statusLabel = "Sẵn sàng";
    if (isOverload) {
      statusVariant = "overload";
      statusLabel = "Quá tải";
    } else if (isFree) {
      statusVariant = "free";
      statusLabel = "Rảnh 100%";
    } else if (isBusy) {
      statusVariant = "busy";
      statusLabel = "Vừa tải";
    }

    return {
      name: m.name,
      role: m.role === "devops" ? "DevOps Eng" : m.role === "leader" ? "DevOps Lead" : m.role,
      effortMinutes: m.totalEffortMinutes,
      capacityMinutes: 480,
      percentage: percent,
      statusLabel,
      statusVariant,
    };
  });

  return { members };
}

export function buildReportPayload(snapshot: GroundingSnapshot): ReportPayload {
  const projects: ReportProjectItem[] = snapshot.projects.map((p) => {
    const hours = (p.totalEffortMinutes / 60).toFixed(1);
    const prog = snapshot.projectProgress.find((pp) => pp.name === p.name);
    return {
      name: p.name,
      totalEffortMinutes: p.totalEffortMinutes,
      totalHours: hours,
      activeTaskCount: p.activeTaskCount,
      doneTaskCount: prog?.done ?? 0,
      assignedMembers: p.assignedMembers,
      warning: p.totalEffortMinutes > 1800 ? "Cận trần" : null,
    };
  });

  return { projects };
}

export function buildOverduePayload(snapshot: GroundingSnapshot): OverduePayload {
  const tasks: OverdueTaskItem[] = snapshot.overdueTasks.map((t) => ({
    title: t.title,
    projectName: t.project,
    memberName: t.memberName,
    endDate: t.endDate,
    daysOverdue: t.daysOverdue,
  }));

  return { tasks };
}

export function buildMembersListPayload(snapshot: GroundingSnapshot): MembersListPayload {
  const members: MembersListItem[] = snapshot.members.map((m) => {
    const isOverload = m.totalEffortMinutes > 480;
    const isFree = m.totalEffortMinutes === 0;
    const statusLabel = isOverload ? "🔴 Quá tải" : isFree ? "🟢 Rảnh 100%" : "🔵 Đang làm việc";

    return {
      id: m.id,
      name: m.name,
      role: m.role === "leader" ? "DevOps Lead" : "DevOps Eng",
      effortMinutes: m.totalEffortMinutes,
      capacityMinutes: 480,
      statusLabel,
      statusVariant: isOverload ? "overload" : isFree ? "free" : "normal",
      skills: m.skills ?? [],
    };
  });

  return { members };
}

export function buildProjectsListPayload(snapshot: GroundingSnapshot): ProjectsListPayload {
  const projects: ProjectsListItem[] = snapshot.projects.map((p) => {
    const hours = (p.totalEffortMinutes / 60).toFixed(1);
    const prog = snapshot.projectProgress.find((pp) => pp.name === p.name);
    return {
      name: p.name,
      totalEffortMinutes: p.totalEffortMinutes,
      totalHours: hours,
      activeTaskCount: p.activeTaskCount,
      doneTaskCount: prog?.done ?? 0,
      assignedMembers: p.assignedMembers,
    };
  });

  return { projects };
}

export function buildHelpPayload(): HelpPayload {
  return {};
}

export function buildMemberInfoPayload(member: Member, snapshot: GroundingSnapshot): MemberInfoPayload {
  const snapshotMember = snapshot.members.find((m) => m.id === member.id || m.name.toLowerCase() === member.name.toLowerCase());
  const effortMinutes = snapshotMember?.totalEffortMinutes ?? 0;
  const capacityMinutes = 480;
  const percentage = Number(((effortMinutes / capacityMinutes) * 100).toFixed(1));
  const isOverloaded = effortMinutes > 480;
  const isFree = effortMinutes === 0;
  const statusLabel = isOverloaded ? "🔴 Quá tải" : isFree ? "🟢 Rảnh việc" : "🔵 Vừa tải";

  const activeTasks = (snapshotMember?.activeTasks ?? []).map((t) => ({
    title: t.title,
    project: t.project,
    duration: t.duration,
  }));
  const plannedTasks = (snapshotMember?.plannedTasks ?? []).map((t) => ({
    title: t.title,
    project: t.project,
    duration: t.duration,
  }));

  const projects = Array.from(
    new Set([
      ...activeTasks.map((t) => t.project),
      ...plannedTasks.map((t) => t.project),
    ])
  ).filter((p) => p && p !== "Unknown");

  return {
    name: member.name,
    role: member.role === "leader" ? "DevOps Lead" : "DevOps Eng",
    position: member.role === "leader" ? "DevOps / SRE Lead" : "Cloud Platform Engineer",
    effortMinutes,
    capacityMinutes,
    percentage,
    statusLabel,
    statusVariant: isOverloaded ? "overload" : isFree ? "free" : "normal",
    skills: member.skills ?? [],
    activeTasks,
    plannedTasks,
    projects,
  };
}

export function renderTaskChangeAudit(logs: Awaited<ReturnType<typeof getAllTaskChangeLogs>>): string {
  if (logs.length === 0) {
    return "Bạn chưa thực hiện thay đổi (sửa/xóa) task nào qua chat trong hệ thống.";
  }
  const actionLabel: Record<string, string> = { create: "Tạo", update: "Sửa", delete: "Xóa" };
  const statusLabel: Record<string, string> = { confirmed: "đã xác nhận", cancelled: "đã hủy" };
  const lines = logs
    .slice(0, 20)
    .map(
      (l) =>
        `- **${actionLabel[l.action] ?? l.action}** task **${l.taskTitle}** — ${statusLabel[l.status] ?? l.status} lúc ${new Date(l.createdAt).toLocaleString("vi-VN")}`
    );
  return `📋 **Lịch sử thay đổi task qua chat:**\n${lines.join("\n")}`;
}

export function renderClarificationAnswer(clarification: ClarificationRequest): string {
  switch (clarification.reason) {
    case "missing_field":
      return "Bạn chưa nói rõ muốn đổi thông tin gì (trạng thái/ngày/người phụ trách/mô tả/effort). Vui lòng bổ sung rõ trước khi tôi soạn đề xuất.";
    case "no_match":
      return clarification.candidates && clarification.candidates.length > 0
        ? `Không tìm thấy task/nhân sự khớp với yêu cầu. Danh sách hiện có:\n${clarification.candidates.map((c) => `- ${c.label}`).join("\n")}`
        : "Không tìm thấy task/nhân sự nào khớp với yêu cầu của bạn. Vui lòng kiểm tra lại tên.";
    case "ambiguous_match":
      return `Có nhiều task khớp với yêu cầu, vui lòng chọn rõ:\n${(clarification.candidates ?? []).map((c) => `- ${c.label}`).join("\n")}`;
    case "target_is_leader":
      return `Không thể giao/sửa task cho tài khoản có vai trò Leader — task chỉ dành cho kỹ sư DevOps.${
        clarification.candidates && clarification.candidates.length > 0
          ? ` Gợi ý: ${clarification.candidates.map((c) => c.label).join(", ")}.`
          : ""
      }`;
    default:
      return "Cần bạn xác nhận rõ hơn trước khi tiếp tục.";
  }
}
