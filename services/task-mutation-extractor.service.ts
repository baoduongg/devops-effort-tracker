import { callAiText, type AiProvider } from "@/services/ai-provider.service";
import { taskChangeProposalSchema } from "@/lib/schemas";
import { extractJsonFromAiText } from "@/services/task-extractor.service";
import { getMembers, findMemberByName, findBestSuitableMember } from "@/services/members.service";
import { getAllTasks } from "@/services/tasks.service";
import { getProjects } from "@/services/projects.service";
import { formatDateLocal } from "@/lib/date";
import type { ClarificationRequest, TaskChangeProposal } from "@/types/chat";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";

interface MutationExtractionResult {
  proposal?: TaskChangeProposal;
  clarification?: ClarificationRequest;
}

// ISSUE-21: without "today" injected, the model defaults to its own (stale) training-data notion
// of the current year when the user types a date without a year (e.g. "20/09") — same fix pattern
// as getTaskExtractionSystemPrompt in task-extractor.service.ts (CURRENT CALENDAR REFERENCE block).
function getUpdateSystemPrompt(): string {
  const now = new Date();
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const todayStr = formatDateLocal(now);
  const dayName = dayNames[now.getDay()];

  return `Bạn là AI trích xuất thay đổi (changes) cho một task DevOps đã tồn tại, dựa trên câu lệnh tự nhiên của leader.

CURRENT CALENDAR REFERENCE:
- Today: ${todayStr} (${dayName})
- Nếu leader gõ ngày không kèm năm (vd "20/09", "15/10"), LUÔN dùng năm hiện tại (năm của ngày hôm nay ở trên), không dùng năm nào khác.

Chỉ trả về CÁC FIELD LEADER MUỐN ĐỔI (không suy đoán field không được nhắc tới). TUYỆT ĐỐI KHÔNG được tự bịa giá trị cho field mà câu lệnh không hề nhắc tới — ví dụ nếu câu lệnh chỉ nêu tên task để tìm, không nói gì về đổi tên task hay đổi dự án, thì KHÔNG được trả về "title" hay "projectName" trong "changes" dù có nghĩ ra giá trị gì. Nếu không chắc chắn 1 field có thực sự được yêu cầu đổi hay không, hãy bỏ field đó ra khỏi "changes" thay vì đoán. Field hợp lệ:
- title (string)
- projectName (string)
- assigneeName (string | null)
- status ("planned" | "in_progress" | "done") — vd "Done"/"hoàn thành" -> "done", "In Progress"/"đang làm" -> "in_progress", "Planned"/"kế hoạch" -> "planned"
- startDate (YYYY-MM-DD)
- endDate (YYYY-MM-DD | null)
- effortMinutes (integer phút)

Trả JSON: {"changes": { ...chỉ field được đổi... }}
Nếu câu lệnh không nói rõ đổi field nào (chỉ nhắc tên task, không có nội dung thay đổi cụ thể), trả {"changes": {}}.
Không thêm field nào ngoài danh sách trên. Không markdown, không giải thích, chỉ JSON thuần.`;
}

function normalizeVi(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

/** Extracts current owner and new assignee mentioned in mutation command. */
function extractMutationMembers(text: string, allMembers: Member[]): {
  currentOwner: Member | null;
  newAssignee: Member | null;
} {
  let currentOwner: Member | null = null;
  let newAssignee: Member | null = null;

  // 1. Check "từ [Name] sang/cho [Name2]" or "từ [Name]"
  const tuMatch = text.match(/\b(?:từ|tu)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\s+(?:sang\s+cho|sang|cho|thanh|thành)|\s*$|[.,!?])/i);
  if (tuMatch?.[1]) {
    currentOwner = findMemberByName(allMembers, tuMatch[1].trim());
  }

  // 2. Check "của [Name] sang/cho [Name2]" or "của [Name]"
  if (!currentOwner) {
    const cuaMatch = text.match(/\b(?:của|cua)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\s+(?:sang\s+cho|sang|cho|thanh|thành)|\s*$|[.,!?])/i);
    if (cuaMatch?.[1]) {
      currentOwner = findMemberByName(allMembers, cuaMatch[1].trim());
    }
  }

  // 3. Check "sang cho [Name]" or "sang [Name]" or "chuyển cho [Name]"
  const sangMatch = text.match(/\b(?:sang\s+cho|chuyen\s+cho|chuyển\s+cho|sang)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:$|[.,!?])/i);
  if (sangMatch?.[1]) {
    newAssignee = findMemberByName(allMembers, sangMatch[1].trim());
  } else {
    // If only "cho [Name]" at the end and not matched as currentOwner
    const choMatch = text.match(/\bcho\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:$|[.,!?])/i);
    if (choMatch?.[1]) {
      const candidate = findMemberByName(allMembers, choMatch[1].trim());
      if (candidate && candidate.id !== currentOwner?.id) {
        newAssignee = candidate;
      }
    }
  }

  return { currentOwner, newAssignee };
}

/** Extracts keywords from the task title mentioned in the command (best-effort, strips known verbs/names). */
function extractTaskKeyword(text: string, currentOwner: Member | null, newAssignee: Member | null): string {
  let cleaned = text
    .replace(/^(sửa|đổi|cập nhật|chuyển|xóa|hủy|bỏ|xoá|update|edit|change|delete|remove|cancel)\s+/i, "")
    .replace(/^(trạng thái|ngày|người phụ trách|assignee)\s+(?:của\s+)?/i, "")
    .replace(/^(task|việc|công việc|nhiệm vụ)\s+/i, "");

  // Remove trailing member transitions: "từ ... sang ...", "của ... sang ...", "sang ...", "từ ...", "của ..."
  cleaned = cleaned
    .replace(/\s+\b(?:từ|tu)\s+.*$/i, "")
    .replace(/\s+\b(?:của|cua)\s+.*$/i, "")
    .replace(/\s+\b(?:sang\s+cho|chuyen\s+cho|chuyển\s+cho|sang|thành|thanh)\s+.*$/i, "");

  if (currentOwner) {
    cleaned = cleaned.replace(new RegExp(`\\b${currentOwner.name}\\b`, "gi"), "");
  }
  if (newAssignee) {
    cleaned = cleaned.replace(new RegExp(`\\b${newAssignee.name}\\b`, "gi"), "");
  }

  return cleaned.trim();
}

function matchTasks(tasks: Task[], memberIds: string[] | null, keyword: string): Task[] {
  const kw = normalizeVi(keyword);
  const pool = memberIds && memberIds.length > 0 ? tasks.filter((t) => memberIds.includes(t.memberId)) : tasks;
  if (!kw) return pool;

  const kwWords = kw.split(/\s+/).filter(Boolean);

  // 1. Exact title match
  const exact = pool.filter((t) => normalizeVi(t.title) === kw);
  if (exact.length > 0) return exact;

  // 2. Substring match
  const sub = pool.filter((t) => {
    const tNorm = normalizeVi(t.title);
    return tNorm.includes(kw) || kw.includes(tNorm);
  });
  if (sub.length > 0) return sub;

  // 3. All words match
  const allWords = pool.filter((t) => {
    const tNorm = normalizeVi(t.title);
    return kwWords.every((w) => tNorm.includes(w));
  });
  if (allWords.length > 0) return allWords;

  // 4. Overlap score match
  const scored = pool
    .map((t) => {
      const tWords = normalizeVi(t.title).split(/\s+/).filter((w) => w.length > 1);
      const matchCount = kwWords.filter((w) => tWords.some((tw) => tw.includes(w) || w.includes(tw))).length;
      return { task: t, matchCount };
    })
    .filter((item) => item.matchCount > 0);

  scored.sort((a, b) => b.matchCount - a.matchCount);
  if (scored.length > 0) {
    const maxScore = scored[0].matchCount;
    const topMatches = scored.filter((s) => s.matchCount === maxScore).map((s) => s.task);
    if (topMatches.length > 0) return topMatches;
  }

  // 5. Fallback: If filtered by memberIds but found nothing, search pool of all tasks
  if (memberIds && memberIds.length > 0) {
    return matchTasks(tasks, null, keyword);
  }

  return [];
}

/**
 * Resolves the natural-language update/delete command to exactly one existing task via hard
 * matching on real data (member name + title keyword) — never lets the AI guess a taskId.
 */
export async function extractTaskMutationFromInput(
  inputText: string,
  action: "update" | "delete",
  provider?: AiProvider | null
): Promise<MutationExtractionResult> {
  const [allMembers, allTasks, allProjects] = await Promise.all([getMembers(), getAllTasks(), getProjects()]);
  const projectById = new Map(allProjects.map((p) => [p.id, p]));
  const memberById = new Map(allMembers.map((m) => [m.id, m]));

  const { currentOwner, newAssignee } = extractMutationMembers(inputText, allMembers);
  let candidateMemberIds: string[] | null = null;

  if (currentOwner) {
    if (currentOwner.role === "leader" && action === "delete") {
      const suggestion = findBestSuitableMember(allMembers, inputText, "");
      return {
        clarification: {
          reason: "target_is_leader",
          candidates: suggestion ? [{ id: suggestion.id, label: suggestion.name }] : [],
        },
      };
    }
    candidateMemberIds = [currentOwner.id];
  }

  const keyword = extractTaskKeyword(inputText, currentOwner, newAssignee);
  const matchedTasks = matchTasks(allTasks, candidateMemberIds, keyword);

  if (matchedTasks.length === 0) {
    return { clarification: { reason: "no_match" } };
  }

  if (matchedTasks.length > 1) {
    return {
      clarification: {
        reason: "ambiguous_match",
        candidates: matchedTasks.map((t) => ({
          id: t.id,
          label: `${t.title} (${projectById.get(t.projectId)?.name ?? "?"}, ${t.endDate ?? t.startDate})`,
        })),
      },
    };
  }

  const task = matchedTasks[0];
  const project = projectById.get(task.projectId);
  const assignee = memberById.get(task.memberId);

  const taskSnapshot: TaskChangeProposal["taskSnapshot"] = {
    title: task.title,
    projectName: project?.name ?? "",
    assigneeName: assignee?.name ?? null,
    status: task.status,
    startDate: task.startDate,
    endDate: task.endDate,
    effortMinutes: task.effortMinutes,
  };

  if (action === "delete") {
    return {
      proposal: {
        action: "delete",
        taskId: task.id,
        taskSnapshot,
        changes: {},
      },
    };
  }

  // action === "update": ask AI to extract which fields to change, retry once on invalid JSON.
  const updateSystemPrompt = getUpdateSystemPrompt();
  const raw = await callAiText(updateSystemPrompt, inputText, provider);
  let candidate = extractJsonFromAiText(raw);
  let parsed = taskChangeProposalSchema.safeParse({ action: "update", taskId: task.id, ...(candidate as object) });

  if (!parsed.success) {
    const retryRaw = await callAiText(
      updateSystemPrompt,
      `Phản hồi trước không hợp lệ.\nRaw: "${raw}"\nCâu lệnh gốc: "${inputText}"\nTrả về đúng JSON {"changes": {...}}.`,
      provider
    );
    candidate = extractJsonFromAiText(retryRaw);
    parsed = taskChangeProposalSchema.safeParse({ action: "update", taskId: task.id, ...(candidate as object) });
  }

  let changes = parsed.success ? parsed.data.changes : {};

  // If a new assignee was explicitly found via regex (e.g. "sang cho Dương Bảo"), ensure it's in changes
  if (newAssignee && (!changes || !changes.assigneeName)) {
    changes = { ...changes, assigneeName: newAssignee.name };
  }

  // Cross-validate each field against the original input text
  const inputNorm = normalizeVi(inputText);
  const FIELD_KEYWORDS: Record<string, RegExp> = {
    title: /\b(ten|tieu de|title|doi ten)\b/,
    projectName: /\b(du an|project)\b/,
    assigneeName: /\b(giao|cho|gan|phu trach|assignee|nguoi lam|chuyen cho|chuyen|sang|tu)\b/,
    status: /\b(trang thai|status|done|hoan thanh|dang lam|in progress|planned|ke hoach|xong)\b/,
    startDate: /\b(ngay bat dau|bat dau|start)\b/,
    endDate: /\b(han|deadline|ngay ket thuc|ket thuc|end date)\b/,
    effortMinutes: /(\d+(?:[.,]\d+)?\s*(phut|p\b|tieng|gio|h\b|ngay|%))|effort/,
  };

  if (changes) {
    const filtered = { ...changes };
    if (filtered.title !== undefined && filtered.title === taskSnapshot.title) delete filtered.title;
    if (filtered.projectName !== undefined && filtered.projectName === taskSnapshot.projectName) delete filtered.projectName;
    if (filtered.assigneeName !== undefined && filtered.assigneeName === taskSnapshot.assigneeName) delete filtered.assigneeName;
    if (filtered.status !== undefined && filtered.status === taskSnapshot.status) delete filtered.status;
    if (filtered.startDate !== undefined && filtered.startDate === taskSnapshot.startDate) delete filtered.startDate;
    if (filtered.endDate !== undefined && filtered.endDate === taskSnapshot.endDate) delete filtered.endDate;
    if (filtered.effortMinutes !== undefined && filtered.effortMinutes === taskSnapshot.effortMinutes) delete filtered.effortMinutes;

    for (const field of Object.keys(FIELD_KEYWORDS) as Array<keyof typeof FIELD_KEYWORDS>) {
      if (filtered[field as keyof typeof filtered] !== undefined && !FIELD_KEYWORDS[field].test(inputNorm)) {
        delete filtered[field as keyof typeof filtered];
      }
    }
    changes = filtered;
  }

  if (!changes || Object.keys(changes).length === 0) {
    return {
      clarification: {
        reason: "missing_field",
        missingFields: ["status|startDate|endDate|assigneeName|title|projectName"],
      },
    };
  }

  // If leader tries to reassign to someone who turns out to be a leader, block it too (F-07/AC-07-2).
  if (changes.assigneeName) {
    const targetAssignee = findMemberByName(allMembers, changes.assigneeName);
    if (targetAssignee?.role === "leader") {
      const suggestion = findBestSuitableMember(allMembers, task.title, project?.name ?? "");
      return {
        clarification: {
          reason: "target_is_leader",
          candidates: suggestion ? [{ id: suggestion.id, label: suggestion.name }] : [],
        },
      };
    }
  }

  return {
    proposal: {
      action: "update",
      taskId: task.id,
      taskSnapshot,
      changes,
    },
  };
}
