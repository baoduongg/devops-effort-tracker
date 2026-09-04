# Automation Ideas

Concrete extensions to the DevOps Effort Tracker data model — not implemented, proposed for future work.

## 1. Auto-flag overload before it happens
When a new task is confirmed via AI chat, sum the member's active `tasks.effortPercent`. If projected total exceeds 100%, write a `notifications` doc (`type: "other"`, `severity: "warning"`) suggesting reassignment instead of just setting `status: "overloaded"` after the fact.

## 2. Smart assignment suggestions in the chat preview
When the AI chat preview shows a new task with no `memberId` yet (e.g. a leader logging on someone's behalf), query `members` sorted by lowest `effortPercent` and matching `skills` against the task's inferred keywords, and suggest the top 2 candidates directly in the `entry-preview-dialog`.

## 3. Sprint/project budget burn-down notifications
Add a `budgetLimit` field to `projects` and a scheduled Cloud Function that sums `tasks.effortPercent` × a cost-per-effort-unit estimate, writing `notifications` (`type: "budget"`) when a project crosses 80%/100% thresholds — the panel already renders this collection generically.

## 4. Weekly digest via leader-mode AI
A scheduled Cloud Function that runs a fixed set of leader-mode-style grounded prompts ("who is overloaded", "which projects had no progress this week") against the same `grounding.service.ts` snapshot, and posts the AI's grounded summary as a `notifications` doc so leads get a passive weekly rollup instead of asking manually.

## 5. Task-to-calendar sync
When a task is confirmed with a `startDate`/`endDate`, optionally push it to the member's Google Calendar (via Google Calendar API, reusing the same Google OAuth session from sign-in) so personal timelines are visible outside the app too.
