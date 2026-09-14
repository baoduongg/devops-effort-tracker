/** Formats an ISO date string as a short relative label: "Today", "Yesterday", "3d ago", or a date. */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / dayMs);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

/** Sort comparator: newest first, by an ISO-string date field. */
export function sortByDateDesc<T>(field: keyof T): (a: T, b: T) => number {
  return (a, b) => new Date(b[field] as string).getTime() - new Date(a[field] as string).getTime();
}

/** Formats a date object to YYYY-MM-DD in local time */
export function formatDateLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses a date string or object to local midnight Date */
export function parseDateLocal(dateVal: string | Date | null | undefined): Date {
  if (!dateVal) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (dateVal instanceof Date) {
    return new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
  }
  if (typeof dateVal === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      const [y, m, d] = dateVal.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Calculates the default deadline (endDate) if none was explicitly given.
 * Deadline = startDate + effort duration.
 * - For effort <= 480 mins (<= 1 working day, e.g. 15m, 1h, 2h, 4h, 1 day): deadline is the same as startDate.
 * - For effort > 480 mins (multi-day): deadline is startDate + (ceil(effort / 480) - 1) days.
 */
export function calculateDefaultEndDate(
  startDateStr: string | Date | null | undefined,
  effortMinutes: number = 60
): string {
  const start = parseDateLocal(startDateStr);
  const minutes = Math.max(1, effortMinutes || 60);
  const workDaysNeeded = Math.ceil(minutes / 480);
  const daysToAdd = Math.max(0, workDaysNeeded - 1);

  const end = new Date(start);
  end.setDate(start.getDate() + daysToAdd);
  return formatDateLocal(end);
}

