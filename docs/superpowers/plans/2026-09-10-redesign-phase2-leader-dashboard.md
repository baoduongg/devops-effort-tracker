# Redesign Phase 2: Leader Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Leader-persona dashboard (KPI strip, overdue banner, roster/gantt/by-project tabs) to match the design spec's dark theme and component conventions, replacing raw `<div>`/inline-hex markup with Astryx components and token-backed utilities, and adding real lane-packing to the team Gantt chart.

**Architecture:** Six files get a visual/structural rewrite: `app/dashboard/page.tsx` (Leader-branch JSX only — the DevOps branch at lines 244-267 is untouched, deferred to Phase 3), `components/dashboard/stat-card.tsx`, `status-badge.tsx`, `pm-team-roster.tsx`, `overdue-tasks-list.tsx` (already close to spec, minor pass only), `team-timeline-chart.tsx` (also gets `lib/gantt-lanes.ts` wired in for real lane packing), `project-allocation-grid.tsx`, and `floating-chat.tsx`. Every Firestore subscription, computed stat (`memberEffortMap`, `overdueTasks`, etc.), filter state, and the overdue-notification-creation effect in `app/dashboard/page.tsx` stay byte-identical — only the returned JSX changes. `lib/project-colors.ts` (from Phase 0) replaces every hardcoded project-color fallback hex.

**Tech Stack:** Next.js 15, `@astryxdesign/core` (Card, List/ListItem, Token, StatusDot, Avatar, ProgressBar, SegmentedControl, TextInput, Selector, Button, Dialog), `lucide-react`, `lib/gantt-lanes.ts`, `lib/project-colors.ts`.

**Spec:** `docs/superpowers/specs/2026-09-10-devops-effort-hub-redesign-design.md` (screen #3 "Dashboard — Leader"); pixel-level detail in `design/README.md` sections "3. Dashboard — Leader", "Gantt component", and the App shell's "Floating chat button" bullet.

## Global Constraints

- Dark-only theme tokens already live (Phase 0/1 shipped, `app/globals.css` correctly imports the Astryx Tailwind bridge as of Phase 1): `--color-accent` `#3D7BFF`, `--color-background-body` `#08090C`, `--color-background-card` `#0D1014`, `--color-text-primary` `#E9ECF2`, `--color-text-secondary` `#8B93A6`, `--color-success` `#2FD98A`, `--color-warning` `#F5B93B`, `--color-error` `#FF5C6C`. Token-backed Tailwind utilities (`bg-accent`, `text-secondary`, `bg-surface`, etc.) resolve to real CSS — verified working in Phase 1.
- No `style={{...}}`, no raw `<div>` for layout, no hardcoded/arbitrary hex or px Tailwind values (`bg-[#fff]`, `p-[13px]`, `text-[11px]`). The one exception carried forward from Phase 1's precedent: absolutely-positioned/fixed decorative or layout-primitive-less elements (Gantt bars positioned by percentage, `floating-chat.tsx`'s `position: fixed`) may use `style={{...}}` for the specific positioning/sizing values Astryx has no component for — colors and spacing inside those elements still must be token-backed, only the position/size math is exempt.
- Project color: use `getProjectColor(project?.color)` from `lib/project-colors.ts` everywhere a project color is read, instead of inline fallback hex (`"#38bdf8"`, `"#c084fc"`, etc.).
- Icons from `lucide-react` at the sizes the design specifies.
- Every Firestore subscription (`subscribeMembers`, `subscribeAllTasks`, `subscribeNotifications`, `getProjects`), every computed `useMemo` (filters, stat counts, `overdueTasks`), the overdue-notification-creation `useEffect`, and all KPI click-to-filter `onClick` handlers in `app/dashboard/page.tsx` must be preserved with identical logic — only their JSX/markup wrapper changes. Do not alter the DevOps-persona branch (`app/dashboard/page.tsx` lines 244-267, the `if (user?.role === "devops" && devopsViewMode === "personal")` block) in this plan — Phase 3 owns it.
- `floating-chat.tsx`'s click behavior (opens an inline popup chat panel) stays exactly as-is — do NOT change it to navigate to `/chat`, even though the design spec describes navigation. This is a deliberate, documented deviation: behavior changes are out of scope for this redesign (visual/structural restyle only, per the parent spec's non-goals). Restyle its visuals only.
- `pnpm lint` and `pnpm build` must pass before any commit in this plan.
- Vietnamese copy already in these files stays as-is — the design doc's English copy is a layout/tone reference, not a literal string replacement.

---

### Task 1: Restyle `stat-card.tsx` and `status-badge.tsx`

**Files:**
- Modify: `components/dashboard/stat-card.tsx` (36 lines, already close to spec)
- Modify: `components/dashboard/status-badge.tsx` (24 lines, already close to spec)

**Interfaces:**
- Consumes: nothing new.
- Produces: `StatCard` and `StatusBadge` keep their exact current prop signatures (`StatCardProps { label, value, icon, tone? }`, `StatusBadge({ status }: { status: MemberStatus })`) — later tasks in this plan import and use both unchanged. No breaking changes to either component's public interface.

Both files are already Astryx-component-based (`Card`, `Icon`, `Text`, `Token`, `StatusDot`) with no raw divs or hex — this task is a spacing/token pass to match spec exactly, not a rewrite.

- [ ] **Step 1: Check current rendering against spec**

The design spec (README.md "Shared components" → "Status badges") requires: pill 11px/600, radius 6px, padding `3px 8px`, background `X1F` (12% alpha), border `1px solid X4D` (30% alpha) — colors: Available `#2FD98A`, Busy `#F5B93B`, Overloaded `#FF5C6C`. Run:

```bash
pnpm exec astryx component Token 2>&1 | grep -A 20 "^## Props"
```

Confirm `Token`'s `color` prop (or whichever prop sets the tint) can express these exact opacity/border values via a built-in variant, or whether `StatusBadge` needs a `variant` that maps `MemberStatus` to Token's semantic color variants (`success`/`warning`/`error` — these already exist in the theme per Phase 0's `--color-success`/`--color-warning`/`--color-error` tokens).

- [ ] **Step 2: Update `status-badge.tsx` to use semantic Token variants**

Replace the full file:

```typescript
import { Token } from "@astryxdesign/core/Token";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import type { MemberStatus } from "@/types/member";

const statusVariant: Record<MemberStatus, "success" | "warning" | "error"> = {
  available: "success",
  busy: "warning",
  overloaded: "error",
};

const statusLabels: Record<MemberStatus, string> = {
  available: "Available",
  busy: "Busy",
  overloaded: "Overloaded",
};

export function StatusBadge({ status }: { status: MemberStatus }): React.JSX.Element {
  return (
    <Token
      label={statusLabels[status]}
      color={statusVariant[status]}
      icon={<StatusDot variant={statusVariant[status]} label={statusLabels[status]} />}
    />
  );
}
```

(This is nearly identical to the current file — the only change is adding `color={statusVariant[status]}` to `Token` so it renders with the semantic tint instead of Token's default neutral styling. If `Token`'s `color` prop doesn't accept `"success"|"warning"|"error"` per Step 1's check, use whatever prop name that check revealed instead — e.g. it might be `variant` on `Token` rather than `color`; verify against the real prop table before writing this, don't guess blindly.)

- [ ] **Step 3: Leave `stat-card.tsx` as-is unless Step 1 found a mismatch**

`stat-card.tsx` already uses `Card`, `Icon` with `color={toneColor[tone]}` mapping to `accent|success|warning|error`, and `Text type="display-3"` for the number — this already matches the spec's "KPI number: JetBrains Mono 27px/600" requirement (the theme's `code` typeface from Phase 0 is JetBrains Mono, and Astryx's numeric `Text` types should already route through it — verify by checking rendered output uses the mono font, not editing blindly). No changes needed unless Step 1's comparison surfaces a real gap — if none, state "no changes" in your task report rather than making cosmetic edits for their own sake.

- [ ] **Step 4: Self-check**

Re-read both files. Confirm no `style={{...}}`, no raw `<div>`, no hardcoded hex. Both already pass this per the file contents shown above — just confirm your edit didn't introduce a regression.

- [ ] **Step 5: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/stat-card.tsx components/dashboard/status-badge.tsx
git commit -m "feat: apply semantic status-color tint to dashboard status badge

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Rebuild `pm-team-roster.tsx`

**Files:**
- Modify: `components/dashboard/pm-team-roster.tsx` (full rewrite of the returned JSX, lines 88-302; the `getMemberBandwidthInfo`/`formatTaskDate` helper functions and `PMTeamRosterProps` interface stay, but `getMemberBandwidthInfo`'s return type loses its ad-hoc `dotColor`/`colorClass` string fields since those are being replaced by token-backed components)

**Interfaces:**
- Consumes: `getProjectColor` from `lib/project-colors.ts` (new import), `StatusBadge` from `./status-badge` (optional — see Step 2), unchanged `PMTeamRosterProps { members: Member[]; tasks: Task[]; projects: Project[] }`.
- Produces: `PMTeamRoster` component keeps its exact current export signature — `app/dashboard/page.tsx` imports and renders it unchanged (`<PMTeamRoster members={filteredMembers} tasks={tasks} projects={projects} />`).

This file has the most raw-div/hex debt in this phase (hand-rolled `className` color chips with `bg-emerald-500/10`, `border-rose-500/30`, inline `style={{backgroundColor: ...}}` for project badges). The design spec's roster card (README.md "3. Dashboard — Leader" → "Tab — Roster") specifies: 38px avatar (46px in the crown-badge case — but crown badges are Members-screen scope, not this task), name, status badge pinned right, "Load" label + percentage colored by state, 6px effort bar, skill chips, footer counts.

- [ ] **Step 1: Simplify `getMemberBandwidthInfo` to return only status + label**

Replace lines 28-80 (the `getMemberBandwidthInfo` function) with:

```typescript
import type { MemberStatus } from "@/types/member";

// Thresholds scaled from an 8h/480m workday
function getMemberBandwidthInfo(effortMinutes: number, activeTasksCount: number): {
  status: MemberStatus;
  label: string;
} {
  const durationStr = formatEffortDuration(effortMinutes);
  if (activeTasksCount === 0 || effortMinutes === 0) {
    return { status: "available", label: "Trống việc (rảnh)" };
  }
  if (effortMinutes > 480) {
    return { status: "overloaded", label: `Quá tải ${durationStr}` };
  }
  if (effortMinutes >= 384) {
    return { status: "busy", label: `Bận ${durationStr}` };
  }
  if (effortMinutes >= 240) {
    return { status: "busy", label: `Vừa tải ${durationStr}` };
  }
  return { status: "busy", label: `Đang làm ${durationStr}` };
}
```

(`MemberStatus` is `"available" | "busy" | "overloaded"` from `types/member.ts` — already imported by `status-badge.tsx`, add the same import here.)

- [ ] **Step 2: Add imports**

At the top of the file, add:

```typescript
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Badge } from "@astryxdesign/core/Badge";
import { minutesToWorkdayPercent } from "@/lib/effort";
import { getProjectColor } from "@/lib/project-colors";
import type { MemberStatus } from "@/types/member";
```

Keep the existing `formatTaskEffort, formatEffortDuration` import from `@/lib/effort` (both still used).

- [ ] **Step 3: Rewrite the component body**

Replace the full `export function PMTeamRoster` block (lines 88-302) with:

```typescript
const effortVariant: Record<MemberStatus, "success" | "warning" | "error"> = {
  available: "success",
  busy: "warning",
  overloaded: "error",
};

export function PMTeamRoster({ members, tasks, projects }: PMTeamRosterProps): React.JSX.Element {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <VStack gap={3}>
      {members.map((member) => {
        const memberTasks = tasks.filter((t) => t.memberId === member.id);
        const inProgressTasks = memberTasks.filter((t) => t.status === "in_progress");
        const plannedTasks = memberTasks.filter((t) => t.status === "planned");
        const computedEffortMinutes = inProgressTasks.reduce((sum, t) => sum + t.effortMinutes, 0);
        const bandwidth = getMemberBandwidthInfo(computedEffortMinutes, inProgressTasks.length);
        const isLeader = member.role === "leader";

        return (
          <Card key={member.id} elevation="low">
            <VStack gap={3}>
              <HStack gap={3} vAlign="center" wrap="wrap">
                <Avatar name={member.name} src={member.photoURL ?? undefined} size="md" tooltip={false} />
                <StackItem size="fill">
                  <VStack gap={1}>
                    <Link href={`/members/${member.id}`}>
                      <Text weight="semibold" size="base">
                        {member.name}
                      </Text>
                    </Link>
                    <HStack gap={1.5} vAlign="center" wrap="wrap">
                      <Badge label={isLeader ? "Leader" : "DevOps"} icon={isLeader ? <Crown size={11} /> : <Cpu size={11} />} variant={isLeader ? "yellow" : "neutral"} />
                      <StatusBadge status={bandwidth.status} />
                      {member.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} label={skill} variant="neutral" />
                      ))}
                      {member.skills.length > 3 && (
                        <Text type="supporting" size="xsm">
                          +{member.skills.length - 3}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </StackItem>
                <Button label="Chi tiết" icon={<ArrowUpRight size={14} />} variant="ghost" href={`/members/${member.id}`} />
              </HStack>

              <ProgressBar
                label={bandwidth.label}
                value={Math.min(minutesToWorkdayPercent(computedEffortMinutes), 100)}
                variant={effortVariant[bandwidth.status]}
              />

              <HStack gap={4} wrap="wrap">
                <StackItem size="fill">
                  <VStack gap={1.5}>
                    <HStack gap={1.5} vAlign="center">
                      <Clock size={13} className="text-accent" />
                      <Text type="supporting" size="xsm" className="uppercase tracking-wide">
                        Đang làm ({inProgressTasks.length})
                      </Text>
                    </HStack>
                    {inProgressTasks.length === 0 ? (
                      <HStack gap={2} vAlign="center" className="py-2 px-3 rounded-lg bg-success/10 border border-success/25">
                        <UserCheck size={14} className="text-success" />
                        <Text size="xsm" color="success">Đang trống task — Sẵn sàng nhận việc</Text>
                      </HStack>
                    ) : (
                      <VStack gap={1.5}>
                        {inProgressTasks.map((task) => {
                          const project = projectMap.get(task.projectId);
                          const overdue = isOverdue(task);
                          const overdueDaysCount = overdue ? daysOverdue(task.endDate as string) : 0;
                          return (
                            <HStack key={task.id} gap={2} vAlign="center" className={`p-2 rounded-lg border text-xs ${overdue ? "bg-error/10 border-error/30" : "bg-surface border-default"}`}>
                              <Badge label={project?.name ?? "General"} variant="neutral" />
                              <StackItem size="fill">
                                <Text size="xsm" maxLines={1}>{task.title}</Text>
                              </StackItem>
                              {overdue ? (
                                <Badge label={`Trễ ${overdueDaysCount}d`} icon={<AlertCircle size={11} />} variant="error" />
                              ) : task.endDate ? (
                                <Text type="supporting" size="xsm">Hạn {formatTaskDate(task.endDate)}</Text>
                              ) : null}
                              <Badge label={formatTaskEffort(task)} variant="blue" />
                            </HStack>
                          );
                        })}
                      </VStack>
                    )}
                  </VStack>
                </StackItem>

                <StackItem size="fill">
                  <VStack gap={1.5}>
                    <HStack gap={1.5} vAlign="center">
                      <Calendar size={13} className="text-purple-400" />
                      <Text type="supporting" size="xsm" className="uppercase tracking-wide">
                        Kế hoạch ({plannedTasks.length})
                      </Text>
                    </HStack>
                    {plannedTasks.length === 0 ? (
                      <Text type="supporting" size="xsm">Chưa có plan tiếp theo</Text>
                    ) : (
                      <VStack gap={1.5}>
                        {plannedTasks.slice(0, 2).map((task) => {
                          const project = projectMap.get(task.projectId);
                          const projColor = getProjectColor(project?.color);
                          return (
                            <HStack key={task.id} gap={1.5} vAlign="center" className="p-1.5 px-2 rounded-lg bg-surface border border-default text-xs">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: projColor }} />
                              <StackItem size="fill">
                                <Text size="xsm" maxLines={1}>{task.title}</Text>
                              </StackItem>
                              <Text type="supporting" size="xsm">Từ {formatTaskDate(task.startDate)}</Text>
                              <Badge label={formatTaskEffort(task)} variant="purple" />
                            </HStack>
                          );
                        })}
                        {plannedTasks.length > 2 && (
                          <Text type="supporting" size="xsm">+{plannedTasks.length - 2} task khác</Text>
                        )}
                      </VStack>
                    )}
                  </VStack>
                </StackItem>
              </HStack>
            </VStack>
          </Card>
        );
      })}
    </VStack>
  );
}
```

Note: the `w-2 h-2 rounded-full` project-color dot with `style={{ backgroundColor: projColor }}` is a sanctioned exception per this plan's Global Constraints — Astryx has no "colored dot with arbitrary color" primitive; only the color VALUE is dynamic/inline, everything else (size, shape) is a token-backed utility class.

- [ ] **Step 4: Verify `Badge` variant names match what's available**

Run: `pnpm exec astryx component Badge 2>&1 | grep -A 5 "\`variant\`"`
Confirm `"yellow"`, `"neutral"`, `"error"`, `"blue"`, `"purple"` are all valid `Badge` variant values (per the Badge docs already read earlier in this plan's research: `'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'` — this should match, but confirm against your installed version before running).

- [ ] **Step 5: Self-check**

Re-read the file. Confirm: no `style={{...}}` except the one sanctioned project-color dot; no raw `<div>` for layout (only `VStack`/`HStack`); no hardcoded hex (`getProjectColor` replaces the old `?? "#38bdf8"` fallback); `text-accent`, `bg-success/10`, `border-success/25`, `bg-error/10`, `border-error/30`, `bg-surface`, `border-default` all resolve as real utilities (spot-check via `grep` on `app/theme.css` if unsure, same as Phase 1's pattern).

- [ ] **Step 6: Manual verification**

Run: `pnpm dev`, log in as Leader, view Dashboard → Roster tab.
Expected: member cards show avatar, name, role badge, status badge, skill chips, effort progress bar, active/planned task lists with project badges and overdue tags. Compare against `design/DevOps Effort Hub.dc.html`'s Roster tab.

- [ ] **Step 7: Lint and build**

Run: `pnpm lint && pnpm build`

- [ ] **Step 8: Commit**

```bash
git add components/dashboard/pm-team-roster.tsx
git commit -m "feat: rebuild PM team roster cards with Astryx components and tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Minor pass on `overdue-tasks-list.tsx`

**Files:**
- Modify: `components/dashboard/overdue-tasks-list.tsx` (52 lines, already spec-close)

**Interfaces:**
- Consumes: nothing new.
- Produces: `OverdueTasksList` keeps its exact signature `{ tasks: Task[]; members: Member[]; projects: Project[] }` — `app/dashboard/page.tsx` renders it unchanged.

This file already uses `Card`, `List`/`ListItem`, `Token` — no raw divs, no inline hex. The design spec's overdue banner (README.md "3. Dashboard — Leader" → "Overdue alert banner") describes a collapsible banner with a warning-triangle header, "N overdue tasks need attention" title, Hide/Show toggle with rotating chevron, and rows showing project dot + task title + assignee + "Nd late". The current implementation is a static (always-expanded) `List` inside a `Card` — no collapse behavior.

- [ ] **Step 1: Decide on collapse behavior**

The spec requires collapse/expand (`overdueOpen` state, chevron rotation). This is a real behavior gap, not just visual — but it's small and self-contained. Add it:

```typescript
"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { List, ListItem } from "@astryxdesign/core/List";
import { Token } from "@astryxdesign/core/Token";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { HStack, StackItem } from "@astryxdesign/core/Stack";
import { daysOverdue } from "@/lib/overdue";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";

interface OverdueTasksListProps {
  tasks: Task[];
  members: Member[];
  projects: Project[];
}

export function OverdueTasksList({ tasks, members, projects }: OverdueTasksListProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(true);

  if (tasks.length === 0) return null;

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const sorted = [...tasks].sort(
    (a, b) => daysOverdue(b.endDate as string) - daysOverdue(a.endDate as string)
  );

  return (
    <Card elevation="low">
      <HStack gap={2} vAlign="center" className="pb-2">
        <AlertTriangle size={17} className="text-error" />
        <StackItem size="fill">
          <Text weight="semibold">{tasks.length} overdue tasks need attention</Text>
        </StackItem>
        <Button
          label={isOpen ? "Hide" : "Show"}
          icon={<ChevronDown size={14} className={isOpen ? "rotate-180" : ""} style={{ transition: "transform 180ms" }} />}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen((prev) => !prev)}
        />
      </HStack>

      {isOpen && (
        <List hasDividers>
          {sorted.map((task) => {
            const overdueDays = daysOverdue(task.endDate as string);
            const member = memberMap.get(task.memberId);
            const project = projectMap.get(task.projectId);
            return (
              <ListItem
                key={task.id}
                label={task.title}
                href={member ? `/members/${member.id}` : undefined}
                description={`${member?.name ?? "Unassigned"} — ${project?.name ?? "No project"}`}
                endContent={
                  <Token
                    label={`Trễ ${overdueDays} ngày`}
                    color={overdueDays > 7 ? "red" : "orange"}
                    size="sm"
                  />
                }
              />
            );
          })}
        </List>
      )}
    </Card>
  );
}
```

Note: `style={{ transition: "transform 180ms" }}` on the chevron icon is a sanctioned exception — Astryx components don't expose a transition-duration prop for arbitrary child icons, and this is a micro-interaction detail, not a layout/color value. If a token-backed Tailwind transition utility exists (e.g. `transition-transform duration-200`), prefer that instead — check `grep -n "duration-\|transition-transform" app/theme.css` before falling back to inline style.

- [ ] **Step 2: Self-check**

Re-read the file. Confirm `text-error` resolves as a real utility (same verification pattern as prior tasks).

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`, view Dashboard with overdue tasks present. Click Hide/Show, confirm the list collapses/expands and the chevron rotates.

- [ ] **Step 4: Lint and build**

Run: `pnpm lint && pnpm build`

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/overdue-tasks-list.tsx
git commit -m "feat: add collapse/expand to overdue tasks banner per spec

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Wire `lib/gantt-lanes.ts` into `team-timeline-chart.tsx` and restyle

**Files:**
- Modify: `components/dashboard/team-timeline-chart.tsx` (full rewrite of the returned JSX and the per-member task-rendering logic, lines 97-417; header/nav/day-window computation logic at lines 66-96 stays)

**Interfaces:**
- Consumes: `assignLanes<T extends { start: number; end: number }>(items: T[]): (T & { lane: number })[]` from `@/lib/gantt-lanes` (built and tested in Phase 0 — takes day-index ranges, returns each item tagged with a 0-based `lane` index via first-fit packing). `getProjectColor` from `@/lib/project-colors`.
- Produces: `TeamTimelineChart` keeps its exact current signature `{ members: Member[]; tasks: Task[]; projects: Project[] }` — `app/dashboard/page.tsx` renders it unchanged.

**The core change:** today this file renders one row per member with tasks absolutely-positioned by `leftPct`/`widthPct` computed from real dates, with NO overlap/lane handling — overlapping tasks visually stack on top of each other. The design spec requires: "Overlapping tasks for one person are packed into lanes by a first-fit algorithm... so a row's height is `laneCount × 26px`." `lib/gantt-lanes.ts`'s `assignLanes` does exactly this packing, but it takes integer day-index ranges (`{start, end}`), not real dates — this task converts each member's tasks' real date ranges into day-index offsets relative to the visible 14-day window, runs them through `assignLanes`, then renders one absolutely-positioned bar per lane row instead of one row per member.

- [ ] **Step 1: Add the day-index conversion helper**

At the top of the file (after existing imports), add:

```typescript
import { assignLanes } from "@/lib/gantt-lanes";
import { getProjectColor } from "@/lib/project-colors";

/** Converts a task's real date range into inclusive day-index offsets within the visible window (0 = first visible day). Clamps to the window bounds. */
function toDayIndexRange(
  task: Task,
  windowStart: Date,
  dayCount: number
): { start: number; end: number } {
  const taskStart = parseDateLocal(task.startDate);
  const resolvedEndStr = task.endDate || calculateDefaultEndDate(task.startDate, task.effortMinutes);
  const taskEnd = parseDateLocal(resolvedEndStr);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const rawStart = Math.round((taskStart.getTime() - windowStart.getTime()) / MS_PER_DAY);
  const rawEnd = Math.round((taskEnd.getTime() - windowStart.getTime()) / MS_PER_DAY);

  return {
    start: Math.max(0, rawStart),
    end: Math.min(dayCount - 1, rawEnd),
  };
}
```

**Interfaces produced by this step:** `toDayIndexRange(task, windowStart, dayCount): { start: number; end: number }` — used by Step 2, not exported (module-private, only this file needs it).

- [ ] **Step 2: Replace the member-row rendering to use lane packing**

Replace the "Member Timeline Rows" block (currently lines 172-283, the `<div className="divide-y ...">{members.map(...)}</div>` block) with:

```tsx
<VStack gap={0} className="divide-y divide-default">
  {members.map((member) => {
    const memberTasks = tasks.filter((t) => {
      if (t.memberId !== member.id) return false;
      if (t.status !== "in_progress" && t.status !== "planned" && t.status !== "done") return false;
      const taskStart = parseDateLocal(t.startDate).getTime();
      const resolvedEndStr = t.endDate || calculateDefaultEndDate(t.startDate, t.effortMinutes);
      const taskEnd = parseDateLocal(resolvedEndStr).getTime() + 24 * 60 * 60 * 1000;
      return taskEnd >= windowStartMs && taskStart <= windowEndMs;
    });

    const dayRanges = memberTasks.map((t) => ({
      task: t,
      ...toDayIndexRange(t, days[0], days.length),
    }));
    const lanes = assignLanes(dayRanges);
    const laneCount = Math.max(1, ...lanes.map((l) => l.lane + 1));
    const rowHeight = laneCount * 26;

    return (
      <HStack key={member.id} gap={0} vAlign="center" className="py-3" style={{ minHeight: rowHeight + 12 }}>
        <div className="w-[220px] flex-shrink-0 px-3 flex items-center gap-2.5">
          <Avatar name={member.name} src={member.photoURL ?? undefined} size="sm" tooltip={false} />
          <div className="truncate">
            <Link href={`/members/${member.id}`}>
              <Text weight="medium" size="sm" maxLines={1}>
                {member.name}
              </Text>
            </Link>
            <Text type="supporting" size="xsm">
              {memberTasks.length} task{memberTasks.length === 1 ? "" : "s"} trong kỳ
            </Text>
          </div>
        </div>

        <div className="relative flex-1 rounded-xl bg-surface border border-default overflow-hidden" style={{ minHeight: rowHeight }}>
          <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
            {days.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return <div key={i} className={`border-r border-default h-full ${isToday ? "bg-accent/[0.08]" : ""}`} />;
            })}
          </div>

          {lanes.length === 0 ? (
            <Text type="supporting" size="xsm" className="relative z-10 text-center py-1 block">
              Chưa có task trong khoảng này
            </Text>
          ) : (
            lanes.map(({ task, start, end, lane }) => {
              const project = projectMap.get(task.projectId);
              const isDone = task.status === "done";
              const isPlanned = task.status === "planned";
              const color = getProjectColor(project?.color);
              const leftPct = (start / days.length) * 100;
              const widthPct = ((end - start + 1) / days.length) * 100;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask({ task, memberName: member.name })}
                  className={`absolute h-[22px] rounded-md px-2 text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-[1.01] z-10 ${
                    isPlanned ? "border border-dashed border-white/50 opacity-85" : "border border-white/10"
                  } ${isDone ? "opacity-50 grayscale" : ""}`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    top: lane * 26 + 2,
                    backgroundColor: color,
                    color: isDone ? undefined : "#08090C",
                  }}
                  title={`${task.title} · ${project?.name ?? "Project"} · ${formatTaskEffort(task)}`}
                >
                  {isDone && <CheckCircle2 size={11} className="flex-shrink-0" />}
                  {isPlanned && <Clock size={11} className="flex-shrink-0 opacity-80" />}
                  <span className="truncate font-medium text-[11px]">{task.title}</span>
                </div>
              );
            })
          )}
        </div>
      </HStack>
    );
  })}
</VStack>
```

**Interfaces consumed here:** `assignLanes` from Step 1's import returns items in the shape `(T & { lane: number })[]` where `T = { task: Task; start: number; end: number }` — so each element is `{ task, start, end, lane }`, destructured directly in the `.map()` above.

Note on sanctioned `style={{...}}` usage: `left`/`width`/`top`/`backgroundColor` on the Gantt bar are positioning/sizing math with a dynamic per-task color value — this is the Global Constraints' documented exception (Gantt bars positioned by percentage; Astryx has no primitive for this). The row's `minHeight` is also positioning math (derived from lane count), same exception. `border-dashed border-white/50` and `border-white/10` for planned/done states are pre-existing raw-white-alpha values in the ORIGINAL file too — replace these with token-backed equivalents if a `border-default`/`border-emphasized`-style token at that alpha exists (check `app/theme.css`); if no exact match exists, keep `border-white/10`-style Tailwind opacity utilities (not arbitrary bracket values — `/10` is a standard Tailwind opacity step, not `[10px]` or `[#hex]`) since these are structural border states, not brand colors.

- [ ] **Step 3: Update the day-header row and outer container to token-backed classes**

Replace the day-header block (lines 144-170) and outer wrapper divs (lines 141-143, 185 originally) to remove raw hex/neutral-scale Tailwind (`text-neutral-400`, `bg-white/[0.01]`, `border-white/[0.08]`) in favor of token-backed equivalents (`text-secondary`, `bg-surface`, `border-default`) — follow the same substitution pattern used in Task 2. Keep the `grid-cols-14`/`min-w-[820px]` layout structure exactly as-is (these are structural grid values, not colors).

- [ ] **Step 4: Update the legend and modal dialog sections similarly**

Lines 287-309 (legend) and 328-411 (task detail modal body) use the same raw-hex/neutral-scale pattern (`text-neutral-400`, `bg-white/[0.02]`, inline `style={{backgroundColor: ...}}` for status/project badges). Apply the same token substitution: `text-secondary` for `text-neutral-400`, `bg-surface`/`border-default` for the `white/[...]` patterns, and `getProjectColor()` + `Badge`/`Token` components (per Task 2's established pattern) for the inline-style badges currently at lines 330-360. Keep the modal's structural logic (`STATUS_LABELS`, `calculateDays`, `formatDateVN`) unchanged.

- [ ] **Step 5: Self-check**

Re-read the file. Confirm:
- `assignLanes` is actually called and its `lane` output drives bar vertical position (`top: lane * 26 + 2`) — this is the task's core deliverable, don't skip it.
- Row height (`minHeight`) scales with `laneCount`, not fixed.
- `getProjectColor` replaces every `?? "#38bdf8"`/`?? "#c084fc"` fallback.
- No `style={{...}}` outside the documented Gantt-bar-positioning and chevron-transition exceptions.
- No raw hex remains in badge/text colors (only the Gantt bar's dynamic project-color background, which is exempted).

- [ ] **Step 6: Manual verification — the lane-packing behavior specifically**

Run: `pnpm dev`, view Dashboard → Gantt Timeline tab. Find or create (via the seed script or manually) two overlapping tasks for the same member — confirm they render in separate horizontal lanes (stacked bars) rather than overlapping each other. Confirm a member with no overlapping tasks still renders at single-row height (26px lane).

- [ ] **Step 7: Lint and build**

Run: `pnpm lint && pnpm build`

- [ ] **Step 8: Commit**

```bash
git add components/dashboard/team-timeline-chart.tsx
git commit -m "feat: wire first-fit lane packing into team Gantt chart, restyle to tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Restyle `project-allocation-grid.tsx`

**Files:**
- Modify: `components/dashboard/project-allocation-grid.tsx` (full rewrite of the returned JSX, lines 22-166)

**Interfaces:**
- Consumes: `getProjectColor` from `@/lib/project-colors` (new import).
- Produces: `ProjectAllocationGrid` keeps its exact signature `{ projects: Project[]; tasks: Task[]; members: Member[] }` — `app/dashboard/page.tsx` renders it unchanged.

Design spec (README.md "3. Dashboard — Leader" → "Tab — By Project") actually describes a different layout than this file's current card-grid: a single `#0D1014` panel with one ROW per project (`grid-template-columns: 220px 1fr`), not a multi-column card grid. But the current file's card-grid layout is a reasonable existing pattern already using `Card`/`Avatar`/`HStack`/`VStack` — this task is a token/hex cleanup pass on the EXISTING card-grid structure, not a layout rewrite to match the spec's row-based variant, since changing the fundamental layout shape is a bigger structural decision than this phase's "visual restyle" scope. Flag the layout-shape delta in your task report; do not silently decide to rebuild it as rows.

- [ ] **Step 1: Add imports**

```typescript
import { getProjectColor } from "@/lib/project-colors";
import { Badge } from "@astryxdesign/core/Badge";
```

- [ ] **Step 2: Replace hardcoded project-color fallback**

Line 41 currently: `const projColor = project.color || "#38bdf8";` — replace with:

```typescript
const projColor = getProjectColor(project.color);
```

- [ ] **Step 3: Replace raw-div sections with token-backed equivalents**

Apply the same substitution pattern as Tasks 2 and 4:
- Lines 47-76 (project header, icon tile, effort badge): keep the icon tile's `style={{backgroundColor: \`${projColor}20\`, border: ...}}` (sanctioned — dynamic per-project color, no Astryx primitive for a color-tinted icon tile) but replace `text-neutral-*`/raw hex elsewhere with token utilities.
- Lines 79-112 (assigned engineers list): replace `bg-white/[0.02]`, `border-white/[0.05]`, `text-neutral-400`, `text-neutral-300`, `text-neutral-500`, `text-sky-400` with `bg-surface`, `border-default`, `text-secondary`, `text-tertiary`(or closest real token per Phase 1's established fallback pattern), `text-accent`.
- Lines 115-159 (tasks list): replace the per-task raw-div rows with `Badge`/status-dot patterns matching Task 2's approach — use `getProjectColor` for any remaining color reads, replace `text-neutral-*` with token equivalents.

Do not restructure the grid layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) or the overall card-per-project shape — only replace colors/raw-divs with token-backed equivalents and Astryx components where a direct swap applies (e.g. status dots → could use `StatusDot` component instead of hand-rolled `<span className="w-2 h-2 rounded-full">`, check `pnpm exec astrx component StatusDot` for whether it accepts a custom hex color prop, since these are PROJECT colors not status colors — if `StatusDot` only accepts semantic status variants, keep the hand-rolled dot as a sanctioned exception, same as Task 2's plannedTasks dot).

- [ ] **Step 4: Self-check**

Re-read the file. Confirm token substitutions are consistent with Tasks 2 and 4's established mappings (same token names for the same semantic meaning, e.g. always `text-secondary` for what was `text-neutral-400`, never a mix of `text-secondary` in one file and `text-[#8B93A6]` in another).

- [ ] **Step 5: Manual verification**

Run: `pnpm dev`, view Dashboard → By Project tab. Confirm project cards render with correct colors, assigned-member chips, and task previews.

- [ ] **Step 6: Lint and build**

Run: `pnpm lint && pnpm build`

- [ ] **Step 7: Commit**

```bash
git add components/dashboard/project-allocation-grid.tsx
git commit -m "feat: restyle project allocation grid to tokens, use shared project-color helper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Restyle `floating-chat.tsx`

**Files:**
- Modify: `components/dashboard/floating-chat.tsx` (54 lines of styling to convert, lines 27-104)

**Interfaces:**
- Consumes: nothing new.
- Produces: `FloatingChat` keeps its exact current signature (no props) — `app/dashboard/page.tsx` renders `<FloatingChat />` unchanged. Click behavior (toggles `isOpen` to show/hide the inline `ChatBox` panel) stays byte-identical — this task changes visuals only.

Per this plan's Global Constraints: do NOT change the click-to-open-popup behavior to a navigation-to-`/chat` behavior, even though the design spec describes navigation. Document this as a deliberate deviation in your task report.

- [ ] **Step 1: Replace the closed-state button's inline style**

Lines 27-46 currently wrap the `Button` in a `<div style={{position: "fixed", bottom: 24, right: 24, zIndex: 100}}>`. Replace with a token-backed-where-possible approach — position/z-index have no Astryx utility equivalent (this is exactly the sanctioned fixed-positioning exception), but check if Tailwind's own `fixed bottom-6 right-6 z-50`-style utility classes (standard Tailwind, not arbitrary values) can replace the inline style:

```tsx
if (!isOpen) {
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Button
        variant="primary"
        size="lg"
        elevation="high"
        onClick={() => setIsOpen(true)}
        icon={<Icon icon={Sparkles} size="sm" />}
        label="AI Chat"
      />
    </div>
  );
}
```

(`bottom-6`/`right-6` are standard Tailwind spacing-scale utilities — not arbitrary values — that approximate the original `24px`; `z-[100]` is technically an arbitrary bracket value but for a z-index stacking context, which has no token equivalent in this design system and is a pure layering primitive, not a color/spacing/typography value the AGENTS.md self-check is targeting. If this project has an established z-index scale utility elsewhere, use that instead — check `grep -rn "z-\[" app components` for precedent before deciding.)

- [ ] **Step 2: Replace the open-state panel's inline style**

Lines 50-104 currently wrap everything in a `<div style={{position: "fixed", ..., width: 420, height: 620, ...}}>` plus two more `style={{...}}` uses for a divider and a flex-grow wrapper. Replace with:

```tsx
return (
  <div className="fixed bottom-6 right-6 z-[100] w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-48px)] flex flex-col">
    <Card elevation="high" width="100%" height="100%">
      <VStack gap={3} height="100%">
        <HStack vAlign="center" gap={2} wrap="nowrap">
          <Icon icon={Sparkles} color="accent" size="sm" />
          <VStack gap={0}>
            <Text weight="semibold">AI Assistant</Text>
            <Text type="supporting" color="secondary">
              Quick Task &amp; Capacity Logging
            </Text>
          </VStack>
          <StackItem size="fill" />
          <Link href="/chat" title="Open Full Chat View">
            <IconButton label="Open full chat" variant="ghost" size="sm" icon={<Icon icon={ExternalLink} size="sm" />} />
          </Link>
          <IconButton label="Close chat" variant="ghost" size="sm" icon={<Icon icon={X} size="sm" />} onClick={() => setIsOpen(false)} />
        </HStack>

        <Divider isFullBleed />

        <StackItem size="fill" className="min-h-0 flex flex-col">
          <ChatBox />
        </StackItem>
      </VStack>
    </Card>
  </div>
);
```

Add `import { Divider } from "@astryxdesign/core/Divider";` to the imports. `w-[420px]`/`h-[620px]`/`max-w-[calc(...)]`/`max-h-[calc(...)]` are arbitrary values but describe a fixed popup-panel SIZE with no design-token equivalent (not a color, not a spacing-between-elements value) — same class of exception as the Gantt bar positioning. If `StackItem`'s `size="fill"` doesn't support a `className` prop for the `min-h-0 flex flex-col` override needed to make the chat box scroll correctly inside a fixed-height flex column, check `pnpm exec astryx component Stack 2>&1 | grep -A 10 "StackItem"` for the right prop — this is exactly the kind of flex-overflow edge case that needs verifying against the real component, not assuming `className` passthrough works.

- [ ] **Step 3: Self-check**

Re-read the file. Confirm the only `style={{...}}`-equivalent values left are inside `className` as arbitrary-bracket Tailwind (position/size/z-index — sanctioned), not literal `style={{}}` props, and that `isOpen`/`setIsOpen`/the `ChatBox` render are unchanged.

- [ ] **Step 4: Manual verification**

Run: `pnpm dev`, click the floating chat button. Confirm it still opens the inline popup panel (not a navigation), the panel renders at the right size/position, close button and "open full chat" link both still work.

- [ ] **Step 5: Lint and build**

Run: `pnpm lint && pnpm build`

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/floating-chat.tsx
git commit -m "feat: restyle floating chat button/panel to token-backed utilities

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Rebuild the Leader-branch JSX in `app/dashboard/page.tsx`

**Files:**
- Modify: `app/dashboard/page.tsx` (rewrite the Leader-branch return block, lines 269-526; the DevOps-branch return block at lines 244-267 and ALL logic above line 244 — state, effects, `useMemo`s — stay completely unchanged)

**Interfaces:**
- Consumes: `StatCard` (Task 1), `StatusBadge` (Task 1, used indirectly via `PMTeamRoster`), `PMTeamRoster` (Task 2), `OverdueTasksList` (Task 3), `TeamTimelineChart` (Task 4), `ProjectAllocationGrid` (Task 5), `FloatingChat` (Task 6) — all already imported in the current file, imports stay the same. `getProjectColor` not needed directly in this file (delegated to child components).
- Produces: `DashboardPage` default export keeps its exact signature — this is the route's page component, nothing else imports it directly.

This is the heaviest cleanup in the phase: the KPI strip (lines 318-486) is five hand-rolled `<button className="...">` elements with conditional Tailwind strings mixing `bg-sky-500/15`, `bg-emerald-500/15`, `bg-rose-500/15`, `bg-amber-500/20`, `ring-1 ring-*-500/30`, `text-neutral-300` — none of it token-backed. The design spec (README.md "3. Dashboard — Leader" → "KPI strip") specifies exactly 5 KPI cards: Total DevOps, Available, Moderate load, Overloaded, Overdue — matching this file's existing 5 buttons semantically, just needing the `StatCard`-style treatment (built in Task 1) with click-to-filter behavior layered on top (which `StatCard` doesn't have built in — this task adds click handling around it).

- [ ] **Step 1: Confirm `StatCard` needs an `onClick`/`isSelected` extension, or wrap it**

`StatCard` (Task 1) currently has no `onClick` or selected-state prop. The KPI strip needs both (click-to-filter, "FILTERED" indicator per spec when a KPI's filter is active). Two options: (a) add `onClick`/`isSelected` props to `StatCard` itself, or (b) wrap `StatCard` in a `ClickableCard`-style pattern here in `page.tsx` without modifying `StatCard`'s interface. Since `StatCard` is scoped to Task 1 (already completed by the time this task runs) and changing its interface would be a cross-task interface change, prefer option (b): wrap the click/selected behavior in `page.tsx` directly using a local unstyled wrapper, OR check if Astryx's `ClickableCard` (already used in `member-card.tsx` per earlier research in this plan) can wrap the same content `StatCard` renders. Decide based on what's simplest — if wrapping `StatCard` in a `<button>` with `onClick` works cleanly (React allows wrapping any component in a native interactive element), use that; don't over-engineer a new shared component for this one screen.

Recommended concrete approach — wrap in a plain semantic `<button>` (not a raw layout `<div>`, so this doesn't violate the no-raw-div rule; a `<button>` is an interactive primitive, not a layout container). This minimal version drops the spec's selected-state ring/"FILTERED" label (see the note after the code block) — the button only carries the click handler, no conditional selected-state styling:

```tsx
{/* KPI Metric Chips */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
  <button type="button" onClick={() => { setSelectedCapacity("all"); setShowOverdueOnly(false); }} className="text-left">
    <StatCard label="Tổng DevOps" value={String(displayMembers.length)} icon={Users} tone="primary" />
  </button>
  <button type="button" onClick={() => { setSelectedCapacity(selectedCapacity === "available" && !showOverdueOnly ? "all" : "available"); setShowOverdueOnly(false); }} className="text-left">
    <StatCard label="Trống việc / Rảnh" value={String(availableMembersCount)} icon={CheckCircle2} tone="success" />
  </button>
  <button type="button" onClick={() => { setSelectedCapacity(selectedCapacity === "working" && !showOverdueOnly ? "all" : "working"); setShowOverdueOnly(false); }} className="text-left">
    <StatCard label="Vừa tải (50-100%)" value={String(activeWorkingCount)} icon={Clock} tone="primary" />
  </button>
  <button type="button" onClick={() => { setSelectedCapacity(selectedCapacity === "overloaded" && !showOverdueOnly ? "all" : "overloaded"); setShowOverdueOnly(false); }} className="text-left">
    <StatCard label="Quá tải (>100%)" value={String(overloadedCount)} icon={AlertTriangle} tone="destructive" />
  </button>
  <button type="button" onClick={() => { setShowOverdueOnly((prev) => !prev); setSelectedCapacity("all"); }} className="text-left">
    <StatCard label="Trễ hạn" value={String(overdueTasks.length)} icon={AlertTriangle} tone="warning" />
  </button>
</div>
```

This preserves every click handler's exact logic (copy-pasted verbatim from the current `onClick`s at lines 328-331, 352-355, 376-379, 400-403, 424-427) — only the visual wrapper changes from hand-rolled conditional-className buttons to `StatCard`-wrapped buttons. The "selected" ring-highlight visual (spec: `FILTERED` label + accent ring on the active KPI) is DROPPED in this minimal version — flag this as a follow-up gap in your task report rather than inventing a new `StatCard` prop mid-task; Task 1 already shipped and its interface is fixed for this phase.

- [ ] **Step 2: Replace the header block**

Replace lines 285-297 (title/description block, currently raw `<div className="flex flex-col md:flex-row ...">`) with token-backed equivalents:

```tsx
<VStack gap={1} className="pb-1 border-b border-default">
  <HStack gap={2} vAlign="center">
    <span className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
      <Sparkles size={16} />
    </span>
    <Heading level={1}>DevOps Effort Hub</Heading>
  </HStack>
  <Text type="supporting">
    Bảng điều khiển phân bổ nguồn lực, theo dõi tải công việc và kế hoạch sprint của team DevOps.
  </Text>
</VStack>
```

(Note: this drops the `md:flex-row justify-between` side-by-side layout with the button/segmented-control group on the right — recombine per Step 3's `HStack` wrapper around both blocks, matching the ORIGINAL file's overall header structure, just with token-backed classes. Use `HStack` with `wrap="wrap"` and appropriate `gap` to replicate the `flex-col md:flex-row md:items-center justify-between gap-4` responsive behavior — check `pnpm exec astryx component Stack 2>&1` for whether `HStack` supports responsive wrap/direction props, or whether a plain Tailwind `flex flex-col md:flex-row` wrapper `className` on the outer `VStack`/`HStack` is the right approach here, same as it was in the original.)

- [ ] **Step 3: Replace the filter-bar section**

Lines 446-483 (search input + project selector + clear-filters button inside the KPI Card) already use `TextInput`/`Selector`/`Button` — these are already Astryx components, just wrapped in a raw `<div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-white/[0.06]">`. Replace the wrapping `<div>` with `HStack`/`VStack` and `border-white/[0.06]` with `border-default`:

```tsx
<HStack gap={3} vAlign="center" wrap="wrap" className="pt-1 border-t border-default">
  <StackItem size="fill">
    <TextInput
      label="Tìm kiếm DevOps"
      isLabelHidden
      placeholder="Tìm theo tên DevOps, kỹ năng hoặc task đang làm..."
      value={searchQuery}
      onChange={setSearchQuery}
      startIcon={Search}
      hasClear
    />
  </StackItem>
  <div className="w-full sm:w-64">
    <Selector label="Dự án" isLabelHidden options={projectOptions} value={selectedProjectId} onChange={(v) => setSelectedProjectId(String(v))} />
  </div>
  {hasActiveFilters && (
    <Button label="Bỏ lọc" icon={<RotateCcw size={13} />} variant="ghost" onClick={() => { setSearchQuery(""); setSelectedProjectId("all"); setSelectedCapacity("all"); setShowOverdueOnly(false); }} />
  )}
</HStack>
```

(The `w-full sm:w-64` div wrapping `Selector` stays as a raw div since it's purely a width-constraint wrapper with no other role — if `Selector` accepts a `width` prop directly, prefer that instead: check `pnpm exec astryx component Selector 2>&1 | grep -A 3 "\`width\`"`.)

- [ ] **Step 4: Replace the DevOps-team-view banner (still applies when a devops user views team mode)**

Lines 272-283 (`bg-sky-500/10 border-sky-500/25 text-sky-200` raw div) — replace with token-backed equivalent. This banner is shown to DevOps-role users, but it's rendered from the SAME return block as the rest of the Leader-branch JSX (the file's structure has the DevOps-team-view banner inside the shared bottom return, not the early-return DevOps-personal branch), so it's in this task's scope even though it's DevOps-persona-triggered content:

```tsx
{user?.role === "devops" && devopsViewMode === "team" && (
  <HStack gap={3} vAlign="center" className="p-2.5 px-3.5 rounded-xl bg-accent/10 border border-accent/25 justify-between text-xs">
    <Text size="xsm" color="accent">Bạn đang xem góc nhìn điều hành toàn đội DevOps.</Text>
    <Button label="Quay lại Dashboard" variant="secondary" size="sm" onClick={() => setDevopsViewMode("personal")} />
  </HStack>
)}
```

- [ ] **Step 5: Verify the rest of the return block needs no changes**

Lines 488-524 (overdue banner render, main content area with loading/empty/tab-switch logic, `FloatingChat`, `TaskCreateModal`) already delegate to `OverdueTasksList`/`PMTeamRoster`/`TeamTimelineChart`/`ProjectAllocationGrid`/`FloatingChat`/`TaskCreateModal` — all restyled by Tasks 3-6 (or untouched, for `TaskCreateModal` which is out of this plan's file list). No changes needed here beyond what Steps 1-4 already covered, EXCEPT: the `Skeleton`/`EmptyState` loading/empty states (lines 494-505) — check these already use Astryx components (`Skeleton`, `EmptyState`, `Icon` — they do, per the current imports) and need no changes.

- [ ] **Step 6: Self-check**

Re-read the full file. Confirm:
- Every `useState`, `useEffect`, `useMemo` above line 244 is byte-identical to the original (diff against git blame if unsure).
- The DevOps-personal early-return branch (lines 244-267 originally) is untouched.
- No `style={{...}}` anywhere in this file (unlike child components, `page.tsx` itself has no positioning-exception content).
- No raw `<div>` for layout except the documented `Selector`-width-wrapper (Step 3) if no `width` prop exists.
- No hardcoded hex/arbitrary Tailwind (`bg-sky-500/15`, `text-neutral-300`, `ring-emerald-500/30` etc. all replaced with token-backed equivalents: `bg-accent/10`, `text-secondary`, `border-default`, etc.).

- [ ] **Step 7: Manual verification — full Leader dashboard flow**

Run: `pnpm dev`, log in as Leader (or switch persona via the sidebar's segmented control from Phase 1). Verify:
- KPI strip renders 5 cards, each clickable, each correctly filtering the roster below (click "Overloaded", confirm only overloaded members show; click again, confirm filter clears).
- Overdue banner appears when overdue tasks exist, collapses/expands (Task 3).
- Search input filters by name/skill/task title.
- Project selector filters by project.
- "Bỏ lọc" (Clear filters) button appears only when filters are active, clears all of them.
- Roster/Gantt/By Project tab switch works, each tab renders its respective restyled component.
- "Tạo Task mới" button opens the existing `TaskCreateModal` (untouched).
- Floating chat button (Task 6) still works.

- [ ] **Step 8: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no new errors.

- [ ] **Step 9: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: restyle Leader dashboard KPI strip, header, and filter bar to tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Phase 2 smoke check

**Files:** none (verification only).

**Interfaces:**
- Consumes: Tasks 1-7.
- Produces: confidence Phase 2 is complete and safe for Phase 3 (DevOps dashboard) to build alongside.

- [ ] **Step 1: Lint and build the whole app**

Run: `pnpm lint`
Expected: no new errors beyond the pre-existing `design/` folder issue already documented in Phase 1's ledger (untracked reference folder, unrelated to app code — if `design/` still isn't excluded from ESLint by this point, that's an existing, separately-tracked gap, not this phase's problem).

Run: `pnpm build`
Expected: production build succeeds.

- [ ] **Step 2: Manual click-through as Leader**

Run: `pnpm dev`, log in as Leader, visit `/dashboard`. Click through all three tabs (Roster, Gantt Timeline, By Project), test every KPI click-filter, test search/project-filter/clear-filters, test the overdue banner collapse, click into a member from the roster (should navigate to `/members/[id]`, unaffected by this phase but worth confirming the link still works), open and close the floating chat.

- [ ] **Step 3: Confirm DevOps-persona dashboard still renders (unchanged, but verify no collateral breakage)**

Switch persona to DevOps via the sidebar (Phase 1). Confirm `/dashboard` still renders the `DevOpsWorkspace` component without errors — this phase didn't touch that code path, but a shared import or file this phase touched (e.g. `StatCard`, `getProjectColor`) could theoretically be reused there too; confirm no regression.

- [ ] **Step 4: Side-by-side comparison against the design**

Open `design/DevOps Effort Hub.dc.html`, navigate to the Leader dashboard view. Compare KPI strip, overdue banner, roster cards, Gantt chart (especially lane-packing behavior with overlapping tasks), and project allocation cards against the running app.

- [ ] **Step 5: Record any deltas**

Note any structural (not pixel-level) deltas as follow-up items — particularly the two deliberate scope-cuts flagged in Tasks 5 and 7 (project-allocation-grid's card-layout vs. spec's row-layout; KPI cards' dropped "FILTERED" active-state indicator).
