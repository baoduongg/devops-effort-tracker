# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See [AGENTS.md](./AGENTS.md) — that file is the source of truth for commands, architecture, and conventions in this repo. Read it before making changes.

<!-- ASTRYX:START -->
Astryx v0.5.3 · 163 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else Tailwind utilities backed by tokens (bg-surface, text-primary, rounded-lg) via tailwind-theme.css. No raw hex/px.
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded/arbitrary value (e.g. bg-[#fff], p-[13px]) with the component or a token-backed utility. If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   163 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->

## Subagent Team

Solo-dev virtual team in `.claude/agents/`, 7 roles:

1. **system-architect** — design/data-flow/module boundaries before code. Read-only.
2. **backend-engineer** — API routes, service layer, types, leader/devops permission logic.
3. **frontend-engineer** — components, pages, Zustand wiring, Astryx UI.
4. **ai-feature-engineer** — AI Ask flow: `services/nvidia.service.ts`, `services/grounding.service.ts`, `app/api/ai/*`, prompt/validation/token limits.
5. **code-reviewer** — reviews diffs for type safety, naming, service-layer separation, no placeholder code. Read-only, no edits.
6. **qa-engineer** — test plans/cases, prioritizing leader/devops permission flows and AI Ask. No automated suite in this repo — manual plans plus `pnpm lint`/`pnpm build` checks.
7. **debugger** — reproduce → isolate → fix. No guessing at fixes without a confirmed root cause.

**Standard workflow for a new feature:**

```
system-architect (design)
        │
        ▼
backend-engineer  +  frontend-engineer   (parallel)
        │
        ▼
code-reviewer (review diff)
        │
        ▼
qa-engineer (test plan/cases)
        │
        ▼
debugger (only if a test fails or a bug is found)
```

For features touching AI Ask specifically, ai-feature-engineer runs alongside backend-engineer/frontend-engineer in the parallel step, owning `app/api/ai/*` prompt/grounding logic while backend-engineer owns any plain CRUD it depends on.
