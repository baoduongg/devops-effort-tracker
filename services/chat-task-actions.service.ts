import { createTask, updateTask, deleteTask } from "@/services/tasks.service";
import { getProjectByName, createProject } from "@/services/projects.service";
import { findBestSuitableMember, findMemberByName, syncMemberEffortStatus } from "@/services/members.service";
import { confirmChatLog } from "@/services/chatLogs.service";
import { createTaskChangeLog } from "@/services/taskChangeLogs.service";
import { notifyTaskCreated, notifyTaskStatusChanged, notifyTaskReassigned, notifyTaskDeleted } from "@/services/chatops.service";
import { PROJECT_COLOR_SWATCHES } from "@/lib/project-colors";
import type { FormattedEntry, TaskChangeProposal, ChatMode } from "@/types/chat";
import type { Member } from "@/types/member";

interface ActingUser {
  memberId?: string | null;
  uid?: string | null;
  displayName?: string | null;
}

export type ConfirmEntryResult =
  | { ok: true; taskId: string }
  | { ok: false; error: string };

/**
 * Resolves the assignee/project, creates the task, resyncs the assignee's effort/status,
 * sends the creation notification, and (for leader-issued creates) writes the audit log.
 * Extracted from chat-box.tsx's handleConfirmEntry — same behavior, no component state coupling.
 */
export async function confirmTaskEntry(
  entry: FormattedEntry,
  chatLogId: string,
  mode: ChatMode,
  user: ActingUser | null,
  allMembers: Member[]
): Promise<ConfirmEntryResult> {
  let targetMemberId = user?.memberId || "";

  if (entry.assigneeName) {
    const matched = findMemberByName(allMembers, entry.assigneeName);
    if (matched) {
      targetMemberId = matched.id;
    }
  }

  if (!targetMemberId) {
    const fallbackMember = findBestSuitableMember(allMembers, entry.title, entry.projectName);
    if (fallbackMember) {
      targetMemberId = fallbackMember.id;
    }
  }

  if (!targetMemberId) {
    return {
      ok: false,
      error: entry.assigneeName
        ? `Không tìm thấy nhân sự "${entry.assigneeName}" trong danh sách thành viên. Vui lòng kiểm tra lại tên.`
        : "Không có nhân sự nào khả dụng trong hệ thống để gán task.",
    };
  }

  let project = await getProjectByName(entry.projectName);
  if (!project) {
    const projectId = await createProject({
      name: entry.projectName,
      description: `Dự án ${entry.projectName}`,
      color: PROJECT_COLOR_SWATCHES[0],
    });
    project = {
      id: projectId,
      name: entry.projectName,
      description: `Dự án ${entry.projectName}`,
      color: PROJECT_COLOR_SWATCHES[0],
      createdAt: new Date().toISOString(),
    };
  }

  const effortMinutes = entry.effortMinutes || 60;

  const taskId = await createTask({
    memberId: targetMemberId,
    projectId: project.id,
    title: entry.title,
    description: entry.title,
    effortMinutes,
    startDate: entry.startDate || new Date().toISOString().split("T")[0],
    endDate: entry.endDate,
    status: entry.status || "in_progress",
    source: "ai_chat",
  });

  try {
    await syncMemberEffortStatus(targetMemberId);
  } catch (e) {
    console.warn("Could not sync member status immediately:", e);
  }

  const targetMember = allMembers.find((m) => m.id === targetMemberId);
  const memberName = targetMember?.name ?? targetMemberId;
  notifyTaskCreated({
    title: entry.title,
    memberName,
    memberEmail: targetMember?.email,
    projectName: project.name,
    link: `${window.location.origin}/dashboard`,
    creatorName: user?.displayName ?? "Admin",
    endDate: entry.endDate,
  });

  if (chatLogId) {
    try {
      await confirmChatLog(chatLogId);
    } catch (logErr) {
      console.warn("Could not update chat log confirmation:", logErr);
    }

    // F-09/AC-03-2: audit trail is only for leader-issued create commands via chat (answer-query),
    // not devops's own work-log entries via format-entry — those aren't a "leader ra lệnh" action.
    if (mode === "leader") {
      try {
        await createTaskChangeLog({
          // ISSUE-10: actorUid must match the identifier the audit query (answer-query route)
          // looks up by — that route receives `memberId: user?.memberId || user?.uid || ...`
          // (see chatAi.service.ts submitAnswerQuery), so writes here use the same precedence
          // instead of always `user.uid`, otherwise a real leader's memberId never matches.
          actorUid: user?.memberId || user?.uid || "",
          actorName: user?.displayName ?? "Leader",
          action: "create",
          taskId,
          taskTitle: entry.title,
          proposedChanges: { ...entry },
          appliedChanges: { ...entry, assigneeName: memberName },
          status: "confirmed",
          chatLogId,
        });
      } catch (auditErr) {
        console.warn("Could not write taskChangeLogs for create confirm:", auditErr);
      }
    }
  }

  return { ok: true, taskId };
}

export type ConfirmProposalResult = { ok: true } | { ok: false; error: string };

/**
 * Applies a task-change proposal (update or delete), resyncs affected members' effort/status,
 * sends the relevant notification, and writes the audit log.
 * Extracted from chat-box.tsx's handleConfirmProposal — same behavior, no component state coupling.
 */
export async function confirmTaskProposal(
  proposal: TaskChangeProposal,
  appliedChanges: TaskChangeProposal["changes"],
  chatLogId: string,
  user: ActingUser | null,
  allMembers: Member[]
): Promise<ConfirmProposalResult> {
  if (proposal.action === "delete") {
    await deleteTask(proposal.taskId);
    const currentMember = allMembers.find((m) => m.name === proposal.taskSnapshot.assigneeName);
    if (currentMember) {
      await syncMemberEffortStatus(currentMember.id);
    }
    notifyTaskDeleted({
      title: proposal.taskSnapshot.title,
      memberName: proposal.taskSnapshot.assigneeName ?? "Chưa gán",
      memberEmail: currentMember?.email,
      projectName: proposal.taskSnapshot.projectName,
      deletedByName: user?.displayName ?? "Leader",
    });
  } else {
    // ISSUE-07: dùng appliedChanges (bản leader đã sửa) để apply thật, proposal.changes (bản AI
    // đề xuất ban đầu, không đổi) chỉ dùng để ghi taskChangeLogs.proposedChanges bên dưới.
    const changes = appliedChanges;
    const taskPatch: Record<string, unknown> = {};
    if (changes.title !== undefined) taskPatch.title = changes.title;
    if (changes.status !== undefined) taskPatch.status = changes.status;
    if (changes.startDate !== undefined) taskPatch.startDate = changes.startDate;
    if (changes.endDate !== undefined) taskPatch.endDate = changes.endDate;
    if (changes.effortMinutes !== undefined) taskPatch.effortMinutes = changes.effortMinutes;

    if (changes.projectName !== undefined) {
      let project = await getProjectByName(changes.projectName);
      if (!project) {
        const projectId = await createProject({
          name: changes.projectName,
          description: `Dự án ${changes.projectName}`,
          color: PROJECT_COLOR_SWATCHES[0],
        });
        project = { id: projectId, name: changes.projectName, description: "", color: PROJECT_COLOR_SWATCHES[0], createdAt: new Date().toISOString() };
      }
      taskPatch.projectId = project.id;
    }

    let newMemberId: string | null | undefined;
    if (changes.assigneeName === null) {
      // Chủ ý bỏ người phụ trách (unassign) — không tìm kiếm theo tên, không phải lỗi.
      newMemberId = null;
      taskPatch.memberId = null;
    } else if (changes.assigneeName !== undefined) {
      const matched = findMemberByName(allMembers, changes.assigneeName);
      if (!matched) {
        return {
          ok: false,
          error: `Không tìm thấy nhân sự "${changes.assigneeName}" trong danh sách thành viên. Vui lòng kiểm tra lại tên trước khi xác nhận.`,
        };
      }
      newMemberId = matched.id;
      taskPatch.memberId = matched.id;
    }

    await updateTask(proposal.taskId, taskPatch);

    // F-04/PM decision: resync Member.effortMinutes/status for every member touched, using the
    // same formula as task creation (confirmTaskEntry) — old assignee (if reassigned) too.
    // newMemberId is a real member id only on reassignment; null (unassign) or undefined (no
    // assignee change) both fall through to resyncing the previous/current assignee below.
    let currentMemberForNotify = allMembers.find((m) => m.name === proposal.taskSnapshot.assigneeName);
    if (newMemberId) {
      const previousMemberId = currentMemberForNotify?.id;
      if (previousMemberId && previousMemberId !== newMemberId) {
        await syncMemberEffortStatus(previousMemberId);
      }
      await syncMemberEffortStatus(newMemberId);
      currentMemberForNotify = allMembers.find((m) => m.id === newMemberId);
    } else if (currentMemberForNotify) {
      await syncMemberEffortStatus(currentMemberForNotify.id);
    }

    const finalTitle = changes.title ?? proposal.taskSnapshot.title;
    const finalProjectName = changes.projectName ?? proposal.taskSnapshot.projectName;
    const link = `${window.location.origin}/tasks`;

    // Mirror task-edit-modal: reassignment takes priority over a plain status-change notice.
    if (changes.assigneeName !== undefined && changes.assigneeName !== proposal.taskSnapshot.assigneeName) {
      const oldMember = allMembers.find((m) => m.name === proposal.taskSnapshot.assigneeName);
      notifyTaskReassigned({
        title: finalTitle,
        projectName: finalProjectName,
        oldMemberName: oldMember?.name ?? proposal.taskSnapshot.assigneeName ?? "Chưa gán",
        newMemberName: currentMemberForNotify?.name ?? "Chưa gán",
        newMemberEmail: currentMemberForNotify?.email,
        link,
      });
    } else if (changes.status !== undefined && changes.status !== proposal.taskSnapshot.status) {
      notifyTaskStatusChanged({
        title: finalTitle,
        memberName: currentMemberForNotify?.name ?? proposal.taskSnapshot.assigneeName ?? "Chưa gán",
        memberEmail: currentMemberForNotify?.email,
        projectName: finalProjectName,
        oldStatus: proposal.taskSnapshot.status,
        newStatus: changes.status,
        link,
      });
    }
  }

  try {
    await confirmChatLog(chatLogId);
  } catch (logErr) {
    console.warn("Could not update chat log confirmation:", logErr);
  }

  await createTaskChangeLog({
    // ISSUE-10: see comment on confirmTaskEntry — must match the identifier answer-query's
    // audit query looks up by (user.memberId when present, not user.uid).
    actorUid: user?.memberId || user?.uid || "",
    actorName: user?.displayName ?? "Leader",
    action: proposal.action,
    taskId: proposal.taskId,
    taskTitle: proposal.taskSnapshot.title,
    proposedChanges: proposal.changes,
    appliedChanges: proposal.action === "delete" ? {} : appliedChanges,
    status: "confirmed",
    chatLogId,
  });

  return { ok: true };
}
