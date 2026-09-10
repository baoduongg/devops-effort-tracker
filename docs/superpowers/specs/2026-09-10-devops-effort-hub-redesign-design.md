# DevOps Effort Hub — Visual Redesign

Status: draft
Date: 2026-09-10
Source design: `design/DevOps Effort Hub.dc.html` + `design/README.md` (Claude Design export, high-fidelity spec)

## Overview

The app (`devops-effort-tracker`, Next.js 15 + Astryx + Firebase) already implements every screen the design covers, with real data and working logic — this is a **visual and structural restyle**, not a new feature build. All existing routing, Firestore services, Zustand stores, and AI chat behavior stay as-is. Two exceptions add real logic (see "New logic" below): timeline lane-packing, and the assistant provider toggle.

The design is dark-only (`#08090C` canvas), uses Instrument Sans + JetBrains Mono, and a `#3D7BFF` electric-blue accent. The current theme (`app/theme.ts`) is light/dark-aware with a `#0061B1`/`#97CBFF` accent and system fonts — it needs to become a dark-only theme matching the new palette.

Astryx compliance is currently uneven: `app/tasks/page.tsx` is close to spec (List/ListItem/Badge/StatusDot), while `app/projects/page.tsx`, `components/dashboard/*`, `components/members/member-timeline-gantt.tsx`, and `components/chat/chat-box.tsx` lean on raw `<div>`s, inline `style={{}}`, and hardcoded hex. AGENTS.md already mandates a no-div, token-only self-check — this redesign is the vehicle to bring those files into compliance, since the same lines are being rewritten for the new visuals anyway. This is targeted cleanup of files already in scope, not an unrelated refactor pass.

## Goals

- Every screen matches the design doc's colors, typography, spacing, radii, shadows, and copy.
- Every touched file passes the AGENTS.md self-check (no raw div for layout, no inline hex, component/token-backed).
- No behavior regression: existing Firestore reads/writes, AI chat flows, role gating (leader/devops), and filters keep working exactly as before.
- Icons move to `lucide-react` (already a dependency, used elsewhere) at the sizes the design specifies, replacing the design doc's inline SVG placeholders — the README explicitly calls icons/avatars lofi and says to swap them for the real library.

## Non-goals

- No new features, no new AI behavior, no new Firestore fields beyond what lane-packing needs to *compute* (it's derived, not stored).
- No login/auth logic changes — only `app/login/page.tsx` visuals.
- No changes to `services/*`, `store/*`, or the AI route handlers (`app/api/ai/*`).
- No light mode. The design has none; the app becomes dark-only.
- Not reproducing the design's own prototype JS (`support.js`) — it's reference-only per the README.

## New logic (the two real additions)

1. **Gantt lane-packing.** Design spec requires: for one member's row, overlapping tasks pack into the fewest lanes via first-fit (a task joins the first lane it doesn't collide with), row height becomes `laneCount × 26px`. Today `member-timeline-gantt.tsx` and `team-timeline-chart.tsx` just stack tasks one-per-row with no collision handling. Add one pure function (e.g. `lib/gantt-lanes.ts`): input a list of `{start, end}` day-index ranges, output lane index per task. Shared by both Gantt call sites. This is the only new algorithmic code in the whole spec.
2. **Everything else** (persona switch, filters, status cycling, overdue rules, chat card states, proposal/entry/clarify flows) already exists and is reused unchanged.

## Theme

Rewrite `app/theme.ts`:

- `color.accent`: `'#3D7BFF'` (single value — dark-only, no light/dark pair needed since `mode` will be forced to `"dark"`).
- `typography`: body family `Instrument Sans`, fallback `system-ui, sans-serif`; code family `JetBrains Mono`, fallback `ui-monospace, monospace`.
- `radius`: base 4, multiplier tuned so the generated scale lands close to the design's 7–9 / 10–12 / 13–14 / 16 / 18 / 20px steps — verify against `astryx docs shape` output and hand-correct via `tokens` if the generator doesn't land close enough (e.g. explicit `--radius-element`, `--radius-container`, `--radius-page`).
- `tokens`: explicit overrides for `--color-background-body` (`#08090C`), `--color-background-surface`/`-card` (`#0D1014`/gradient handled at component level), `--shadow-low/med/high` tuned to the design's elevation table (card, popup, modal, button shadows), `--color-on-accent` (`#FFFFFF`).
- Category/status colors (success `#2FD98A`, warning `#F5B93B`, danger `#FF5C6C`) mapped onto Astryx's `success`/`warning`/`error` tokens rather than ad-hoc hex in components.
- Project swatch palette (8 colors from the design) becomes a shared constant (`lib/project-colors.ts`) replacing the scattered `COLOR_PRESETS` in `app/projects/page.tsx` and the per-component fallback hex found in dashboard/members files.

`app/layout.tsx`: change `<Theme theme={devopsTrackerTheme}>` to force `mode="dark"`; add the Google Fonts `<link>` tags for Instrument Sans + JetBrains Mono (already the pattern the design doc uses; self-hosting is a stated future step in the design README, not required now).

`app/globals.css`: remove the hardcoded `background-color:#090d14; color:#e2e8f0` on `body` — the theme's `--color-background-body`/`--color-text-primary` tokens own this once `<Theme>` is dark-forced. Keep the scrollbar and Tailwind import rules.

Run `pnpm exec astryx theme build app/theme.ts` after edits (this repo's existing convention — `devops-tracker.js`/`.css` are checked-in build output, not hand-edited).

## Screen-by-screen changes

Each item: what changes visually, which existing files, what's reused untouched.

**1. Login (`app/login/page.tsx`)** — Replace the 16 raw glow/card divs with `Card` + token-backed background; drop `bg-[#090d14]` hex for the theme token. Keep the two blurred ambient shapes (`dhFloat`-equivalent) — implement as a small CSS module or Tailwind arbitrary properties backed by tokens, since Astryx has no "blob" primitive; this is the one place raw absolutely-positioned decorative divs are acceptable (matches AGENTS.md's spirit — they're decoration, not layout). Match copy, spacing, Google button per spec. Auth logic untouched.

**2. App shell / sidebar (`components/layout/sidebar.tsx`)** — Restyle nav item active/inactive states, persona segmented control, assistant-mode card, footer avatar row to spec colors/radii. Delete the dead commented-out role-switcher block (103–127) while touching this file. Reuses `AppShell`, `SideNav*` Astryx components as today — this file was already clean of raw divs.

**3. Dashboard — Leader & DevOps (`components/dashboard/*`, `app/dashboard/page.tsx`)** — Largest surface. Rebuild `devops-workspace.tsx`, `stat-card.tsx`, `pm-team-roster.tsx`, `project-allocation-grid.tsx`, `overdue-tasks-list.tsx`, `workload-matrix.tsx`, `status-badge.tsx`, `member-card.tsx`, `team-timeline-chart.tsx` to spec layout (KPI strip, overdue banner, roster/gantt/by-project tabs; stat row + active/planned/done/gantt/team tabs for DevOps persona). Replace inline hex fallbacks with the shared project-color constant. `team-timeline-chart.tsx` adopts the new `lib/gantt-lanes.ts` helper. All Firestore subscriptions, filter state, KPI click-through, overdue toggle logic reused as-is.

**4. Projects (`app/projects/page.tsx`)** — Heaviest cleanup (34 raw divs, raw `<input>`s, inline `style={{}}` color chips). Convert to `Card`-based KPI tiles, `List`/`Selector` where dense, real `TextInput` for the new-project form, `Token`/`Badge` for status. Swap `COLOR_PRESETS` for the shared constant. Same create/edit data flow.

**5. Members list + detail (`app/members/page.tsx`, `app/members/[memberId]/page.tsx`, `components/members/*`)** — List page is close already (minor spacing/token pass). Detail page: replace hand-built badge `<span>`s with `Badge`/`Token`/`StatusDot`, quick-stats grid to spec's 4-card row. `member-timeline-gantt.tsx` gets the new lane-packing helper and spec's bar/lane visuals (open/done/overdue bar states, today marker, weekend shading).

**6. Tasks (`app/tasks/page.tsx`)** — Smallest gap: spacing/token/color pass onto the existing `List`/`ListItem`/`Badge`/`StatusDot` structure to match the spec's table-like row layout (project dot, title, assignee, dates, status, effort, hover-reveal actions gated to leader).

**7. Notifications (`app/notifications/page.tsx`, `NotificationList`)** — Tab counts pill styling, severity-strip row treatment, unread-dot glow, per spec. Existing read/unread toggle and tab-filter logic reused.

**8. AI Chat (`app/chat/page.tsx`, `components/chat/*`)** — Bubble/card restyle to spec (asymmetric radii, left-border accent on AI bubbles, entry/proposal/clarify card treatments already close in structure — `entry-card.tsx`/`proposal-card.tsx`/`clarification-card.tsx` already use `Card`/`Banner`/`Token`). Fix `message-bubble.tsx`'s raw `<div>` for the `ai-answer` role → wrap in `Card`/`Markdown` consistent with the others. Replace `PILL_STYLES` hardcoded hex map in `chat-box.tsx` with token-backed classes. Slash-command popup, quick-prompt pills, composer toolbar restyled per spec's exact spacing/colors. All AI request/response handling, intent routing, confirm/cancel flows untouched.

## Icons & avatars

Replace every inline SVG glyph named in the design (shield-check, layout-dashboard, folder, users, list, bell, message-circle, sparkles, plus, search, chevron-down/left, alert-triangle/circle, clock, check, check-circle, crown, pencil, trash, mail, log-out, image, paperclip, arrow-right, help-circle, file-check, trending-up, x) with the matching `lucide-react` icon at the specified pixel size — `lucide-react` is already a dependency and already used in `app/dashboard/page.tsx`. Avatars keep the existing initials-on-gradient pattern (already implemented) — just match the design's hue-hash formula and size list (22–88px) if the current implementation differs.

## Testing

No test suite exists in this repo (per AGENTS.md). Verification is manual:
- `pnpm dev`, click through every screen as both Leader and DevOps persona.
- Compare against the design doc's `DevOps Effort Hub.dc.html` (open directly in a browser) side-by-side for each of the 9 screens.
- Confirm no regressions: KPI click-through filters, overdue banner, search/filter clearing, status cycling, task CRUD modals, chat confirm/cancel flows, notification read-toggle.
- `pnpm lint` and `pnpm build` must pass (no test script to run).
- Spot-check the AGENTS.md self-check on every file touched: no `style={{...}}`, no raw layout `<div>`, no arbitrary hex/px Tailwind values.

## Risks / open questions

- Astryx's radius/shadow scale generator may not land exactly on the design's specific px values — may need explicit `tokens` overrides rather than relying purely on `radius.base`/`multiplier`. Resolve during implementation by comparing rendered output, not guessing upfront.
- The decorative login-page blobs are the one deliberate exception to "no raw div" — flagged here so it isn't flagged again as a violation during review.
- Gantt lane-packing is genuinely new logic (not a port) — needs the one-line runnable self-check per Ponytail convention (a small `lib/gantt-lanes.test.ts`-equivalent isn't part of this repo's test setup, so a `demo()`/assert block or a one-off manual check is enough, consistent with "no test suite exists" in AGENTS.md).
