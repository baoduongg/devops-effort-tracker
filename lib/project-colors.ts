/** The 8-swatch project color picker palette from the design spec. */
export const PROJECT_COLOR_SWATCHES = [
  "#5B8CFF",
  "#2FD98A",
  "#F5B93B",
  "#C084FC",
  "#F471B5",
  "#38BDF8",
  "#FB7185",
  "#A3E635",
] as const;

const FALLBACK_PROJECT_COLOR = PROJECT_COLOR_SWATCHES[0];

/** Returns a project's color, or the palette's first swatch if unset. */
export function getProjectColor(color: string | undefined | null): string {
  return color && color.trim().length > 0 ? color : FALLBACK_PROJECT_COLOR;
}

function demo() {
  console.assert(getProjectColor("#ABCDEF") === "#ABCDEF", "keeps a real color");
  console.assert(getProjectColor(undefined) === FALLBACK_PROJECT_COLOR, "falls back on undefined");
  console.assert(getProjectColor("") === FALLBACK_PROJECT_COLOR, "falls back on empty string");
  console.assert(PROJECT_COLOR_SWATCHES.length === 8, "palette has 8 swatches");
}

if (process.env.NODE_ENV === "test") demo();
