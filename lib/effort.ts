/**
 * Utility functions and presets for Task Effort & Duration management.
 */

export interface EffortPreset {
  label: string;
  minutes: number;
  description?: string;
}

export const EFFORT_DURATION_PRESETS: EffortPreset[] = [
  { label: "15 phút", minutes: 15, description: "Task nhanh / fix nhỏ" },
  { label: "30 phút", minutes: 30, description: "Xử lý ngắn hạn" },
  { label: "1 tiếng", minutes: 60, description: "Task tiêu chuẩn (~1h)" },
  { label: "2 tiếng", minutes: 120, description: "Nửa buổi sáng/chiều" },
  { label: "4 tiếng", minutes: 240, description: "Nửa ngày làm việc" },
  { label: "1 ngày", minutes: 480, description: "Cả ngày (8 tiếng)" },
];

/**
 * Formats a duration in minutes to a human-friendly Vietnamese string.
 * Examples:
 * - 15 -> "15 phút"
 * - 30 -> "30 phút"
 * - 60 -> "1 tiếng"
 * - 90 -> "1h 30m"
 * - 120 -> "2 tiếng"
 * - 240 -> "4 tiếng"
 * - 480 -> "1 ngày (8h)"
 * - 960 -> "2 ngày (16h)"
 */
export function formatEffortDuration(minutes?: number | null): string {
  if (minutes === undefined || minutes === null || isNaN(minutes) || minutes <= 0) {
    return "0 phút";
  }

  const rounded = Math.round(minutes);

  // Exact days (8h working day = 480m)
  if (rounded >= 480 && rounded % 480 === 0) {
    const days = rounded / 480;
    return `${days} ngày (${days * 8}h)`;
  }

  // Under 1 hour
  if (rounded < 60) {
    return `${rounded} phút`;
  }

  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  if (remainingMinutes === 0) {
    return `${hours} tiếng`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats task effort whether stored as `effortMinutes` or legacy `effortPercent`.
 */
export function formatTaskEffort(task: { effortMinutes?: number | null; effortPercent?: number | null }): string {
  if (typeof task.effortMinutes === "number" && task.effortMinutes > 0) {
    return formatEffortDuration(task.effortMinutes);
  }

  if (typeof task.effortPercent === "number" && task.effortPercent > 0) {
    // Convert legacy 8h day percentage: 100% = 480m (8h), 50% = 240m (4h), 15% ≈ 60m (1h)
    const convertedMinutes = Math.round((task.effortPercent / 100) * 480);
    return formatEffortDuration(convertedMinutes);
  }

  return "0 phút";
}

/**
 * Convert minutes to percentage of an 8-hour workday (for backward-compatible capacity calculations).
 * E.g., 60m = ~13%, 120m = 25%, 240m = 50%, 480m = 100%.
 */
export function minutesToWorkdayPercent(minutes: number): number {
  if (!minutes || minutes <= 0) return 0;
  return Math.round((minutes / 480) * 100);
}

/**
 * Convert percentage to minutes based on an 8-hour workday.
 */
export function workdayPercentToMinutes(percent: number): number {
  if (!percent || percent <= 0) return 0;
  return Math.round((percent / 100) * 480);
}

/**
 * Parses free text duration into minutes.
 * Examples: "15p", "15 phút", "30m", "1 tiếng", "1h", "1.5h", "2 giờ", "1 ngày", "nửa ngày"
 */
export function parseEffortDuration(input: string | number): number {
  if (typeof input === "number") {
    return Math.max(0, Math.round(input));
  }

  if (!input || typeof input !== "string") {
    return 60; // Default 1 hour
  }

  const str = input.toLowerCase().trim();

  // Keyword checks
  if (str.includes("nửa ngày") || str.includes("0.5 ngày")) return 240;
  if (str.includes("1 ngày") || str.includes("cả ngày")) return 480;
  if (str.includes("2 ngày")) return 960;
  if (str.includes("nửa tiếng") || str.includes("nửa giờ") || str.includes("30p") || str.includes("30 phút") || str.includes("30m")) return 30;

  // Pattern: X ngày
  const dayMatch = str.match(/([\d.]+)\s*(ngày|day|days)/i);
  if (dayMatch) {
    const d = parseFloat(dayMatch[1]);
    if (!isNaN(d)) return Math.round(d * 480);
  }

  // Pattern: X tiếng Y phút / Xh Ym
  const hourMinMatch = str.match(/(\d+)\s*(?:tiếng|giờ|h)\s*(\d+)\s*(?:phút|p|m)?/i);
  if (hourMinMatch) {
    const h = parseInt(hourMinMatch[1], 10);
    const m = parseInt(hourMinMatch[2], 10);
    return h * 60 + m;
  }

  // Pattern: X tiếng / X giờ / Xh
  const hourMatch = str.match(/([\d.]+)\s*(?:tiếng|giờ|h|hours?|hrs?)/i);
  if (hourMatch) {
    const h = parseFloat(hourMatch[1]);
    if (!isNaN(h)) return Math.round(h * 60);
  }

  // Pattern: X phút / Xp / Xm
  const minMatch = str.match(/([\d.]+)\s*(?:phút|p|m|mins?|minutes?)/i);
  if (minMatch) {
    const m = parseFloat(minMatch[1]);
    if (!isNaN(m)) return Math.round(m);
  }

  // Number only fallback
  const num = parseFloat(str);
  if (!isNaN(num)) {
    // If <= 12, assume hours; otherwise assume minutes
    return num <= 12 ? Math.round(num * 60) : Math.round(num);
  }

  return 60;
}
