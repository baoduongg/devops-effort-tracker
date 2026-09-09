import { callAiText, type AiProvider } from "@/services/ai-provider.service";
import { taskChangeProposalSchema } from "@/lib/schemas";
import { extractJsonFromAiText } from "@/services/task-extractor.service";
import { getMembers, findMemberByName, findBestSuitableMember } from "@/services/members.service";
import { getAllTasks } from "@/services/tasks.service";
import { getProjects } from "@/services/projects.service";
import { formatDateLocal } from "@/lib/date";
import type { ClarificationRequest, TaskChangeProposal } from "@/types/chat";
import type { Task } from "@/types/task";

export interface MutationExtractionResult {
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

/** Extracts a candidate member name mentioned in the command (assignee/owner of the target task). */
function extractMentionedMemberName(text: string): string | null {
  const patterns = [
    /(?:của|cho)\s+([a-zA-ZÀ-ỹ]+)(?:\s|$|[.,!?])/i,
    /task\s+.+?\s+của\s+([a-zA-ZÀ-ỹ]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

/** Extracts keywords from the task title mentioned in the command (best-effort, strips known verbs/names). */
function extractTaskKeyword(text: string, memberName: string | null): string {
  let cleaned = text
    .replace(/^(sửa|đổi|cập nhật|chuyển|xóa|hủy|bỏ|xoá|update|edit|change|delete|remove|cancel)\s+/i, "")
    .replace(/^(trạng thái|ngày|người phụ trách|assignee)\s+(?:của\s+)?/i, "")
    .replace(/^(task|việc|công việc|nhiệm vụ)\s+/i, "");
  if (memberName) {
    cleaned = cleaned.replace(new RegExp(`(?:của|cho)\\s+${memberName}.*$`, "i"), "");
  }
  cleaned = cleaned.replace(/\s+(sang|thành)\s+.+$/i, "");
  return cleaned.trim();
}

function matchTasks(tasks: Task[], memberIds: string[] | null, keyword: string): Task[] {
  const kw = normalizeVi(keyword);
  const pool = memberIds ? tasks.filter((t) => memberIds.includes(t.memberId)) : tasks;
  if (!kw) return pool;
  const kwWords = kw.split(/\s+/).filter(Boolean);
  return pool.filter((t) => {
    const title = normalizeVi(t.title);
    return kwWords.every((w) => title.includes(w)) || title.includes(kw);
  });
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

  const mentionedName = extractMentionedMemberName(inputText);
  let candidateMemberIds: string[] | null = null;

  if (mentionedName) {
    const matchedMember = findMemberByName(allMembers, mentionedName);
    if (!matchedMember) {
      return {
        clarification: {
          reason: "no_match",
          candidates: allMembers.map((m) => ({ id: m.id, label: m.name })),
        },
      };
    }
    if (matchedMember.role === "leader") {
      const suggestion = findBestSuitableMember(allMembers, inputText, "");
      return {
        clarification: {
          reason: "target_is_leader",
          candidates: suggestion ? [{ id: suggestion.id, label: suggestion.name }] : [],
        },
      };
    }
    candidateMemberIds = [matchedMember.id];
  }

  const keyword = extractTaskKeyword(inputText, mentionedName);
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

  // ISSUE-12 (reopened at rev 9): comparing against the task's current value only catches no-op
  // hallucinations (AI echoes back the same value). It never catches the actually-reported bug —
  // AI inventing a DIFFERENT value for a field the command never mentioned at all (e.g. setting
  // projectName to the task's own title when the user only named the task, never said "dự án").
  // Fix: cross-validate each field against the original input text, same heuristic already used
  // for the create branch (answer-query/route.ts mentionsProject/mentionsEffort) — only keep a
  // field if a keyword for that field actually appears in what the leader typed.
  const inputNorm = normalizeVi(inputText);
  const FIELD_KEYWORDS: Record<string, RegExp> = {
    title: /\b(ten|tieu de|title|doi ten)\b/,
    projectName: /\b(du an|project)\b/,
    assigneeName: /\b(giao|cho|gan|phu trach|assignee|nguoi lam|chuyen cho)\b/,
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
    const newAssignee = findMemberByName(allMembers, changes.assigneeName);
    if (newAssignee?.role === "leader") {
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
