# Redesign Phase 0: Theme & Shared Infra — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Astryx theme to the DevOps Effort Hub dark palette/typography, force dark mode app-wide, and add the two shared modules (`lib/project-colors.ts`, `lib/gantt-lanes.ts`) every subsequent per-screen plan depends on.

**Architecture:** `app/theme.ts` is a `defineTheme()` call built by the Astryx CLI into `app/devops-tracker.js` + `app/theme.css` (the build derives output filenames from the theme's `name` field, not the source filename — this is already correct, not a bug). Edit `theme.ts`, run `astryx theme build`, and the generated files update. `app/layout.tsx` wraps everything in `<Theme>`; add `mode="dark"`. `app/globals.css` currently hardcodes body colors that fight the theme — remove them so the theme tokens are the only source of truth.

**Tech Stack:** Next.js 15, `@astryxdesign/core` theme system (`defineTheme`, `astryx theme build` CLI), Google Fonts (Instrument Sans, JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-09-10-devops-effort-hub-redesign-design.md`

## Global Constraints

- Dark-only. No light mode support needed anywhere in this app going forward.
- Accent color: `#3D7BFF`. Body background: `#08090C`. Surface/card background: `#0D1014`.
- Fonts: Instrument Sans (body/heading), JetBrains Mono (numeric/code) — loaded via Google Fonts `<link>` tags, not self-hosted.
- Status colors map onto Astryx's built-in `success`/`warning`/`error` tokens: success `#2FD98A`, warning `#F5B93B`, error/danger `#FF5C6C`.
- Every file touched must pass the AGENTS.md self-check: no `style={{...}}`, no raw `<div>` for layout, no hardcoded hex/px Tailwind values — component props or token-backed utilities only.
- Run `pnpm exec astryx theme build app/theme.ts --out app/theme.css` after every `theme.ts` edit; both `app/theme.css` and `app/devops-tracker.js`/`.d.ts` are generated output, never hand-edited.
- `pnpm lint` and `pnpm build` must pass before any commit in this plan.

---

### Task 1: Rewrite the theme definition

**Files:**
- Modify: `app/theme.ts` (full rewrite, currently 16 lines)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `appTheme` export (unchanged name) with new token values. Later tasks and all screen plans reference these token names: `--color-accent`, `--color-background-body`, `--color-background-surface`, `--color-background-card`, `--color-on-accent`, `--font-family-body`, `--font-family-code`, `--radius-inner` (4px), `--radius-element` (8-9px), `--radius-container` (13-14px), `--radius-page`/`--radius-chat` (16px), `--radius-full` (pills/dots), `--color-success`, `--color-warning`, `--color-error`.

- [ ] **Step 1: Confirm current token baseline**

Run: `pnpm exec astryx docs tokens | grep -E "^--color-(accent|background|text|border|success|warning|error|on-accent)"`
Expected: prints the default light/dark values for these tokens — this is what you're overriding, not inventing from scratch.

- [ ] **Step 2: Write the new theme.ts**

```typescript
"use client";

import { defineTheme } from "@astryxdesign/core/theme";

export const appTheme = defineTheme({
  name: "devops-tracker",
  color: {
    accent: "#3D7BFF",
    neutralStyle: "cool",
  },
  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: {
      family: "Instrument Sans",
      fallbacks: "system-ui, -apple-system, sans-serif",
    },
    code: {
      family: "JetBrains Mono",
      fallbacks: "ui-monospace, 'SF Mono', Menlo, monospace",
    },
  },
  radius: { base: 4, multiplier: 1.0 },
  tokens: {
    "--color-accent": "#3D7BFF",
    "--color-on-accent": "#FFFFFF",
    "--color-background-body": "#08090C",
    "--color-background-surface": "#0D1014",
    "--color-background-card": "#0D1014",
    "--color-background-popover": "#12151C",
    "--color-background-muted": "#14171E",
    "--color-text-primary": "#E9ECF2",
    "--color-text-secondary": "#8B93A6",
    "--color-text-disabled": "#5C6478",
    "--color-border": "rgba(255,255,255,0.07)",
    "--color-border-emphasized": "rgba(255,255,255,0.10)",
    "--color-success": "#2FD98A",
    "--color-success-muted": "rgba(47,217,138,0.12)",
    "--color-warning": "#F5B93B",
    "--color-warning-muted": "rgba(245,185,59,0.12)",
    "--color-error": "#FF5C6C",
    "--color-error-muted": "rgba(255,92,108,0.12)",
    "--radius-page": "16px",
    "--radius-chat": "16px",
    "--radius-container": "13px",
    "--radius-element": "9px",
    "--radius-inner": "4px",
  },
});
```

- [ ] **Step 3: Build the theme**

Run: `pnpm exec astryx theme build app/theme.ts --out app/theme.css`
Expected: `✓ app/theme.css`, `✓ app/devops-tracker.js`, `✓ app/devops-tracker.d.ts` — no errors. Note the token-override count printed (should be non-zero, roughly matching the `tokens` block size).

- [ ] **Step 4: Commit**

```bash
git add app/theme.ts app/theme.css app/devops-tracker.js app/devops-tracker.d.ts
git commit -m "feat: rewrite theme for dark palette, Instrument Sans + JetBrains Mono

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Force dark mode and load fonts in the root layout

**Files:**
- Modify: `app/layout.tsx:20-30`

**Interfaces:**
- Consumes: `appTheme`/`devopsTrackerTheme` build output from Task 1 (import path unchanged: `./devops-tracker`, `./theme.css`).
- Produces: every page renders with `data-astryx-theme="devops-tracker"` and dark mode forced — later screen-level plans assume dark tokens resolve without needing to pass `mode` anywhere themselves.

- [ ] **Step 1: Add Google Fonts links and force dark mode**

Replace the `<html>`/`<body>` block in `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import "./globals.css";
import "./theme.css";
import { devopsTrackerTheme } from "./devops-tracker";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "DevOps Effort Tracker",
  description: "Track DevOps team effort, tasks, and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Theme theme={devopsTrackerTheme} mode="dark">
          <LinkProvider component={Link}>
            <AppShell>{children}</AppShell>
          </LinkProvider>
        </Theme>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify it renders**

Run: `pnpm dev` (in background or a separate terminal), then open `http://localhost:3000` in a browser.
Expected: page background is near-black, no console errors about missing theme/fonts. Check the `<html>` or root element carries `data-astryx-theme="devops-tracker"` and `color-scheme: dark` (DevTools → Elements).

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: force dark mode, load Instrument Sans + JetBrains Mono

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Clean up globals.css

**Files:**
- Modify: `app/globals.css:5-17` (remove hardcoded body colors), keep scrollbar rules and Tailwind/reset imports.
- The `.premium-card`, `.premium-card-hover`, `.glow-pill-*` utility classes (lines 36-76) are dead the moment their consuming components are rewritten in later screen plans — **do not delete them in this task**. They're still referenced by not-yet-rewritten components; deleting now would break the build. Each screen plan removes the specific `.premium-card`/`.glow-pill-*` usages it touches; a final cleanup task (end of the last screen plan) deletes any leftover unused classes.

**Interfaces:**
- Consumes: theme tokens from Task 1 (`--color-background-body`, `--color-text-primary`) now resolve to the dark palette.
- Produces: `body` has no hardcoded color — later screens don't need to override it.

- [ ] **Step 1: Remove the hardcoded body colors**

In `app/globals.css`, change:

```css
  body {
    background-color: #090d14;
    color: #e2e8f0;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
```

to:

```css
  body {
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
```

(Astryx's `astryx.css` base layer already applies `--color-background-body`/`--color-text-primary` to `body` — confirm this by checking rendered `background-color` in DevTools after this change, not by re-adding it here.)

- [ ] **Step 2: Verify the page still renders dark**

Run: `pnpm dev`, reload `http://localhost:3000`.
Expected: background is still `#08090C` (now from the theme, not the hardcoded rule). If the page goes white/unstyled, `astryx.css`'s base body styling isn't applying — check that `@import "@astryxdesign/core/astryx.css";` precedes this rule in the cascade (it already does, line 3 vs line 11) and that `<Theme>` wraps the tree (Task 2). Do not re-add the hardcoded hex as a workaround; fix the root cause.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix: remove hardcoded body colors, defer to theme tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Shared project-color constant

**Files:**
- Create: `lib/project-colors.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PROJECT_COLOR_SWATCHES: readonly string[]` (8 hex values, for color-picker UIs) and `getProjectColor(color: string | undefined | null): string` (returns the given color if it's a non-empty string, else a stable fallback) — every screen plan that currently has its own `COLOR_PRESETS` array or ad-hoc fallback hex (`app/projects/page.tsx:24-33`, `components/dashboard/*.tsx`, `components/members/*.tsx`, `components/tasks/task-create-modal.tsx:158`) imports this instead of redefining it. This task only creates the module; each screen plan does its own swap-in.

- [ ] **Step 1: Create the module**

```typescript
// lib/project-colors.ts

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
```

- [ ] **Step 2: Write the self-check**

Add a `demo()` function to the bottom of the same file (this repo has no test runner configured, per AGENTS.md — this is the "one runnable check" a non-trivial branch needs):

```typescript
function demo() {
  console.assert(getProjectColor("#ABCDEF") === "#ABCDEF", "keeps a real color");
  console.assert(getProjectColor(undefined) === FALLBACK_PROJECT_COLOR, "falls back on undefined");
  console.assert(getProjectColor("") === FALLBACK_PROJECT_COLOR, "falls back on empty string");
  console.assert(PROJECT_COLOR_SWATCHES.length === 8, "palette has 8 swatches");
}

if (process.env.NODE_ENV === "test") demo();
```

- [ ] **Step 3: Run it manually**

Run: `npx tsx -e 'process.env.NODE_ENV="test"; require("./lib/project-colors.ts")'`
Expected: no assertion output (silent = all passed). If any `console.assert` fires, its message prints to stderr — fix the implementation, not the assertion.

- [ ] **Step 4: Commit**

```bash
git add lib/project-colors.ts
git commit -m "feat: add shared project-color palette constant

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Gantt lane-packing helper

**Files:**
- Create: `lib/gantt-lanes.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `assignLanes<T extends { start: number; end: number }>(items: T[]): (T & { lane: number })[]` — given tasks with inclusive day-index ranges (`start`/`end`, matching the existing `Task.s`/`Task.e` day-index fields already used by `components/members/member-timeline-gantt.tsx` and `components/dashboard/team-timeline-chart.tsx`), returns the same items each tagged with a `lane` index (0-based) via first-fit packing, so overlapping tasks land in different lanes and non-overlapping tasks reuse lane 0. The dashboard and member-detail screen plans (not this plan) wire this into their Gantt components and compute row height as `(maxLane + 1) * 26`.

- [ ] **Step 1: Write the failing self-check**

```typescript
// lib/gantt-lanes.ts

interface Ranged {
  start: number;
  end: number;
}

/**
 * First-fit lane packing: each item joins the lowest-numbered lane whose
 * last-placed item doesn't overlap it. Items are packed in start-order so
 * packing is deterministic regardless of input order.
 */
export function assignLanes<T extends Ranged>(items: T[]): (T & { lane: number })[] {
  const sorted = [...items].sort((a, b) => a.start - b.start);
  const laneEnds: number[] = []; // laneEnds[i] = end day of the last item placed in lane i
  const result: (T & { lane: number })[] = [];

  for (const item of sorted) {
    let lane = laneEnds.findIndex((end) => end < item.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.end);
    } else {
      laneEnds[lane] = item.end;
    }
    result.push({ ...item, lane });
  }

  return result;
}

function demo() {
  // Two non-overlapping items share lane 0.
  const seq = assignLanes([{ start: 0, end: 2 }, { start: 3, end: 5 }]);
  console.assert(seq[0].lane === 0 && seq[1].lane === 0, "sequential items share lane 0");

  // Two overlapping items split into lane 0 and lane 1.
  const overlap = assignLanes([{ start: 0, end: 4 }, { start: 2, end: 6 }]);
  console.assert(overlap[0].lane === 0 && overlap[1].lane === 1, "overlapping items get different lanes");

  // Three-way overlap needs 3 lanes.
  const triple = assignLanes([
    { start: 0, end: 5 },
    { start: 1, end: 5 },
    { start: 2, end: 5 },
  ]);
  const lanes = new Set(triple.map((t) => t.lane));
  console.assert(lanes.size === 3, "three mutually-overlapping items get 3 distinct lanes");

  // A later item that only overlaps the first can reuse the second lane once it's free.
  const reuse = assignLanes([
    { start: 0, end: 2 },
    { start: 1, end: 3 },
    { start: 3, end: 5 },
  ]);
  console.assert(reuse[2].lane === 0, "a lane frees up once its occupant ends");
}

if (process.env.NODE_ENV === "test") demo();
```

- [ ] **Step 2: Run it**

Run: `npx tsx -e 'process.env.NODE_ENV="test"; require("./lib/gantt-lanes.ts")'`
Expected: no assertion output. If `"three mutually-overlapping items get 3 distinct lanes"` fires, check the `findIndex` comparison uses `< item.start` (strictly less, so touching-but-not-overlapping ranges like `end:2`/`start:2` still share a lane per the "inclusive day-index" semantics used elsewhere in this codebase) — adjust to `<= item.start` only if the screen plans that consume this later find adjacent-day tasks should NOT share a lane (verify against the design's Gantt bar spacing, `margin: 2px 1px` between bars, before changing).

- [ ] **Step 3: Commit**

```bash
git add lib/gantt-lanes.ts
git commit -m "feat: add Gantt first-fit lane-packing helper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Full-app smoke check

**Files:** none (verification only).

**Interfaces:**
- Consumes: all of Tasks 1-5.
- Produces: confidence that Phase 0 is safe to build screen plans on top of.

- [ ] **Step 1: Lint and build**

Run: `pnpm lint`
Expected: no new errors introduced by this plan's changes (pre-existing unrelated errors, if any, are out of scope).

Run: `pnpm build`
Expected: production build succeeds. This exercises the SSR path (`Theme` + built `theme.css`), which is stricter than `pnpm dev`.

- [ ] **Step 2: Manual click-through**

Run: `pnpm dev`, open the app, log in, and visit every route: `/`, `/dashboard`, `/projects`, `/members`, `/tasks`, `/notifications`, `/chat`.
Expected: every screen renders dark (`#08090C` background, `#E9ECF2`-ish text), no layout is broken or unreadable (white-on-white, etc.), no console errors. Screens will NOT yet match the design pixel-for-pixel — that's later plans' job. This check only confirms the theme swap didn't break rendering anywhere.

- [ ] **Step 3: Record any screens that broke**

If any screen is broken (not just "old-looking" but actually unreadable/erroring), note which screen and the console error in a comment on this task before moving to screen-level plans — that screen's plan needs to account for it.
