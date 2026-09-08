/**
 * Intent classification helpers for AI assistant interactions.
 */

import { SLASH_COMMANDS } from "@/lib/slash-commands";

// FB-CHAT-02: values the model (or a user typing by hand) tends to fabricate/fill in
// when there is no real project name. Shared between server (answer-query route) and
// client (EntryCard Confirm gate) so both enforce the same rule.
const UNKNOWN_PROJECT_VALUES = ["unknown", "không rõ", "khong ro", "chưa rõ", "chua ro", "n/a"];

export function isUnknownProjectName(projectName: string | null | undefined): boolean {
  const v = (projectName ?? "").trim().toLowerCase();
  return !v || UNKNOWN_PROJECT_VALUES.includes(v);
}

function normalizeProjectName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ISSUE-06 (F-07, round 2): the model sometimes fabricates a plausible-sounding project name
 * (e.g. "Core Platform") instead of returning an empty/"unknown" value when the input doesn't
 * name a real project. `isUnknownProjectName` alone can't catch that — it only recognizes literal
 * sentinel strings. This checks `projectName` against the actual projects that exist in the
 * system (case-insensitive, diacritics-insensitive substring match — same normalize pattern as
 * `findMemberByName` in `services/members.service.ts`). A project name is only "real" if it
 * matches one of `realProjectNames`; callers should fetch that list via
 * `services/projects.service.ts#getProjects()` before calling this.
 */
export function isRealProjectName(projectName: string | null | undefined, realProjectNames: string[]): boolean {
  if (isUnknownProjectName(projectName)) return false;
  const q = normalizeProjectName(projectName ?? "");
  if (!q) return false;
  return realProjectNames.some((name) => {
    const n = normalizeProjectName(name);
    return !!n && (n === q || n.includes(q) || q.includes(n));
  });
}

/**
 * Checks if a user prompt is asking a question or querying information
 * (e.g. asking who is free, checking workload, viewing reports, asking for help).
 */
export function isInformationalQuery(text: string): boolean {
  const q = text.trim().toLowerCase();
  if (!q) return false;

  // Question beginnings & interrogative subjects
  if (
    /^(ai|những ai|có ai|thành viên nào|ai đang|ai trong team|ai có thể|ai rảnh|ai bận|ai quá tải)\b/i.test(q) ||
    /\b(ai|những ai|có ai|thành viên nào)\b.*\b(rảnh|nhận thêm|quá tải|làm được|phụ trách|bận|trống việc|làm task)\b/i.test(q)
  ) {
    return true;
  }

  // Question indicators / asking about state
  if (
    /\b(ra sao|thế nào|như thế nào|bao nhiêu|ở đâu|khi nào|tại sao|sao lại)\b/i.test(q) ||
    /\b(báo cáo|tổng hợp|thống kê|danh sách|tra cứu|xem|kiểm tra|tình hình|tiến độ|hướng dẫn|trợ giúp)\b/i.test(q)
  ) {
    return true;
  }

  // Question particles at end or question marks
  if (/[?]$/.test(q) || /\b(không|chưa|nhỉ|hả|chăng)\s*\??$/i.test(q)) {
    return true;
  }

  return false;
}

// Labels used as `[Placeholder]` inside SLASH_COMMANDS templates, e.g. "Tên công việc",
// "Tên nhân sự", "1 tiếng". Derived from the templates themselves so this list can never
// drift out of sync with lib/slash-commands.ts.
const TEMPLATE_PLACEHOLDER_LABELS = Array.from(
  new Set(
    SLASH_COMMANDS.flatMap((cmd) => [...(cmd.template ?? "").matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]))
  )
);

const UNFILLED_PLACEHOLDER_PATTERN = new RegExp(
  `\\[\\s*(?:${TEMPLATE_PLACEHOLDER_LABELS.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*\\]`,
  "i"
);

/**
 * Checks if text still contains an unfilled template placeholder like "[Tên công việc]".
 * Used to block task creation/entry-card flows when a slash-command template was sent
 * without being filled in. Only matches the actual placeholder labels declared in
 * SLASH_COMMANDS templates — NOT arbitrary bracketed text (e.g. "server[prod-01]" or a
 * markdown link "[chi tiết](url)" must not be flagged).
 */
export function hasUnfilledPlaceholder(text: string): boolean {
  if (!text) return false;
  return UNFILLED_PLACEHOLDER_PATTERN.test(text);
}

/** Minimal shape both `format-entry` and `answer-query` extraction results share. */
interface ExtractedEntryLike {
  title: string;
  projectName: string;
  assigneeName?: string | null;
}

/**
 * F-06 checkpoint 2: returns the list of fields (human-readable, Vietnamese) that still contain
 * an unfilled placeholder in an AI-extracted entry, e.g. ["tên công việc", "tên dự án"]. Empty
 * array means the entry is clean. Shared by every route that produces a `FormattedEntry`
 * (`answer-query`, `format-entry`) so the two can never drift out of sync again (ISSUE-06).
 */
export function findUnfilledPlaceholderFields(entry: ExtractedEntryLike): string[] {
  const placeholderFields: string[] = [];
  if (hasUnfilledPlaceholder(entry.title)) placeholderFields.push("tên công việc");
  if (hasUnfilledPlaceholder(entry.projectName)) placeholderFields.push("tên dự án");
  if (hasUnfilledPlaceholder(entry.assigneeName ?? "")) placeholderFields.push("tên người phụ trách");
  return placeholderFields;
}

/**
 * Checks if a user prompt is an imperative directive to create, assign, log, or plan a task.
 */
export function isTaskCreationIntent(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  // 1. Explicit imperative creation prefixes
  const explicitActionPrefixes = [
    /^(giao|tạo|phân công|gán|lập|lên)\s+(task|việc|công việc|nhiệm vụ|kế hoạch)/i,
    /^(hãy|vui lòng|nhờ|phiền)\s+(giao|tạo|phân công|gán|lập|lên|log|schedule|assign|create)\s+(task|việc|công việc|nhiệm vụ|kế hoạch)/i,
    /^(create|assign|add|schedule|log)\s+(task|work)/i,
    /^(giao cho|assign cho|gán cho)\s+/i,
    /^log\s+(công việc|task|work)/i,
    /^(lập|lên)\s+kế hoạch\s+(tuần|task|cho)/i,
  ];

  if (explicitActionPrefixes.some((p) => p.test(q))) {
    return true;
  }

  // 2. If it is an informational query (e.g. "Ai trong team đang rảnh việc hoặc có thể nhận thêm task?"), it is NOT task creation
  if (isInformationalQuery(q)) {
    return false;
  }

  // 3. Middle action patterns (e.g. "Giao task X cho Nam 30%", "Tạo task Y cho Linh")
  const actionPatterns = [
    /(?:giao|phân công|gán)\s+(?:task|việc|công việc)\s+.+?\s+cho\s+/i,
    /(?:tạo|lập)\s+(?:task|kế hoạch)\s+.+?\s+cho\s+/i,
    /(?:cần|muốn)\s+(?:tạo|giao|phân công)\s+(?:task|công việc)/i,
  ];

  return actionPatterns.some((p) => p.test(q));
}
