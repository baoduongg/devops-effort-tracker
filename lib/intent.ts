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

  return false;
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
