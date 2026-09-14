/**
 * Utility functions and presets for Task Effort & Duration management.
 */

interface EffortPreset {
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
 * Formats task effort duration in minutes.
 */
export function formatTaskEffort(task: { effortMinutes?: number | null }): string {
  return formatEffortDuration(task.effortMinutes);
}

/**
 * Convert minutes to percentage of an 8-hour workday (for progress-bar widths only).
 * E.g., 60m = ~13%, 120m = 25%, 240m = 50%, 480m = 100%.
 */
export function minutesToWorkdayPercent(minutes: number): number {
  if (!minutes || minutes <= 0) return 0;
  return Math.round((minutes / 480) * 100);
}

/** Legacy migration: converts a stored effortPercent field (0-100) back to minutes of an 8h workday. */
export function effortPercentToMinutes(percent: number): number {
  return Math.round((percent / 100) * 480);
}

export type EffortStatus = "available" | "busy" | "overloaded";

/**
 * Classifies workload minutes into a status + label + progress-bar variant.
 * Thresholds scaled from an 8h/480m workday.
 */
export function getEffortStatus(
  minutes: number,
  activeCount: number
): { status: EffortStatus; label: string; variant: "success" | "warning" | "error" } {
  const durationStr = formatEffortDuration(minutes);
  if (activeCount === 0 || minutes <= 0) {
    return { status: "available", label: "Trống việc (rảnh)", variant: "success" };
  }
  if (minutes > 480) {
    return { status: "overloaded", label: `Quá tải ${durationStr}`, variant: "error" };
  }
  if (minutes >= 384) {
    return { status: "busy", label: `Bận ${durationStr}`, variant: "warning" };
  }
  if (minutes >= 240) {
    return { status: "busy", label: `Vừa tải ${durationStr}`, variant: "warning" };
  }
  return { status: "busy", label: `Đang làm ${durationStr}`, variant: "warning" };
}
