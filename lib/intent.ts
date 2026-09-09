/**
 * Intent classification helpers for AI assistant interactions.
 */

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

  // F-12/ISSUE-16: "task/việc/công việc của tôi/của [tên] ... là gì/có gì/gồm gì" — a question
  // with no "?" and no keyword above (e.g. "task của tôi hôm nay là gì"), previously fell through
  // to the default mutation-intent branch in chat-box.tsx and got mistaken for a log-entry command.
  if (/\b(task|việc|công việc)\b.*\b(là gì|có gì|gồm gì)\s*$/i.test(q)) {
    return true;
  }

  return false;
}

/**
 * F-12/ISSUE-16: positive signal that a devops sentence is logging work already done/in progress
 * (has an action verb describing work, not a question) — e.g. "Fix lỗi connect AWS bên service
 * Hook, 30 phút". Used by chat-box.tsx as the ONLY thing that defaults devops input to
 * format-entry (create task); anything that doesn't match this defaults to Q&A instead, per spec
 * rev 2 rule "mistaking a question for a create command is worse than the reverse".
 */
export function looksLikeSelfLogEntry(text: string): boolean {
  const q = text.trim().toLowerCase();
  if (!q) return false;
  if (isInformationalQuery(q)) return false;

  const logActionVerbs =
    /\b(fix|sửa lỗi|xử lý|deploy|triển khai|cài đặt|setup|config|cấu hình|build|release|update|nâng cấp|khắc phục|hoàn thành|đã làm|đang làm|làm xong|troubleshoot|debug|viết|refactor|test|kiểm thử|migrate|monitor|giám sát|log)\b/i;

  return logActionVerbs.test(q);
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

/**
 * Checks if a user prompt is an imperative directive to update/change an existing task
 * (e.g. status, dates, assignee, description).
 */
export function isTaskUpdateIntent(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const updatePrefixes = [
    /^(sửa|đổi|cập nhật|chuyển|update|edit|change)\s+(task|việc|công việc|nhiệm vụ|trạng thái|ngày|người phụ trách|assignee)/i,
    /^(hãy|vui lòng|nhờ|phiền)\s+(sửa|đổi|cập nhật|chuyển)\s+(task|việc|công việc|nhiệm vụ)/i,
  ];

  if (updatePrefixes.some((p) => p.test(q))) {
    return true;
  }

  // If it is an informational query (e.g. "Nếu tôi đổi trạng thái task này thì effort có
  // tính lại không?"), it is NOT an update command.
  if (isInformationalQuery(q)) {
    return false;
  }

  const updateMiddlePatterns = [
    /(?:sửa|đổi|cập nhật|chuyển)\s+(?:task|việc|công việc|nhiệm vụ)\s+.+?\s+(?:sang|thành|của|cho)\s+/i,
    /(?:đổi|chuyển)\s+(?:trạng thái|ngày|người phụ trách|assignee)\s+(?:task|của|cho)?/i,
  ];

  return updateMiddlePatterns.some((p) => p.test(q));
}

/**
 * Checks if a user prompt is an imperative directive to delete/remove an existing task.
 */
export function isTaskDeleteIntent(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const deletePrefixes = [
    /^(xóa|hủy|bỏ|xoá)\s+(task|việc|công việc|nhiệm vụ)/i,
    /^(hãy|vui lòng|nhờ|phiền)\s+(xóa|hủy|bỏ|xoá)\s+(task|việc|công việc|nhiệm vụ)/i,
    /^(delete|remove|cancel)\s+(task|work)/i,
  ];

  if (deletePrefixes.some((p) => p.test(q))) {
    return true;
  }

  // If it is an informational query (e.g. "Task nào của Huy đã bị xóa tuần trước?"), it is NOT
  // a delete command.
  if (isInformationalQuery(q)) {
    return false;
  }

  const deleteMiddlePatterns = [/(?:xóa|hủy|bỏ|xoá)\s+(?:task|việc|công việc|nhiệm vụ)\s+.+?\s+(?:của|cho)\s+/i];

  return deleteMiddlePatterns.some((p) => p.test(q));
}
