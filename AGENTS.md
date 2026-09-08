# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, etc.) working in this repository.

## Project Purpose

DevOps Effort Tracker — a Next.js 15 app for tracking effort allocation across projects, team capacity, and AI-assisted work logging via a chat interface backed by Firebase and the NVIDIA build.nvidia.com API.

## Commands

```bash
pnpm install       # install deps
pnpm dev           # dev server (localhost:3000)
pnpm build         # production build
pnpm start         # run production build
pnpm lint          # eslint (next/core-web-vitals + next/typescript)
pnpm run seed      # seed Firestore with sample data (scripts/seed.ts)
```

No test suite exists in this repo — do not assume a `test` script.

There is a `scripts/link-member.ts` (run via `tsx scripts/link-member.ts`) for linking an `AppUser` to a `Member` record; check its source before use, it's a one-off maintenance script, not part of the app.

### Environment

Copy `.env.local.example` to `.env.local`. Firebase vars are `NEXT_PUBLIC_*` (safe to expose, gated by Firestore/Storage security rules); `NVIDIA_API_KEY` authenticates against `https://integrate.api.nvidia.com/v1` (get a key at https://build.nvidia.com). No separate service or process is needed beyond `pnpm dev`.

## Architecture

**Data flow**: Firestore is the only datastore. Every collection has a `services/*.service.ts` module that is the sole owner of Firestore access for that collection (queries, `Timestamp` <-> ISO string conversion via a local `toX()` mapper, CRUD). Components and pages never import `firebase/firestore` directly — they call service functions. Follow this pattern for any new collection: define the type in `types/`, then a matching service module.

**State**: Zustand stores in `store/` hold client-side state populated from services/listeners (e.g. `store/auth.store.ts` is populated by the `useAuthListener` hook in `lib/auth.ts`, which bridges Firebase `onAuthStateChanged` to the store and calls `linkOrCreateUser` from `services/auth.service.ts` on sign-in). Not every service has a store — some pages call services directly.

**Types vs. runtime validation**: `types/*.ts` are hand-written interfaces used everywhere in the app. `lib/schemas.ts` holds zod schemas used only for validating untrusted AI output — each has a compile-time check tying it back to the corresponding hand-written type. Don't add zod schemas for internal data that's already typed; they exist specifically at the AI-response trust boundary.

**AI request path** (chat-based work logging and leader Q&A):
1. UI (`components/chat/*`) → Next.js route handler in `app/api/ai/{format-entry,answer-query}/route.ts`
2. Route handler calls `services/nvidia.service.ts`, a thin axios client that POSTs to NVIDIA's OpenAI-compatible `/chat/completions` endpoint (`https://integrate.api.nvidia.com/v1`) — `callNvidiaText` uses `meta/llama-3.3-70b-instruct`, `callNvidiaVision` uses `meta/llama-3.2-90b-vision-instruct` and passes the Firebase Storage image URL directly as an `image_url` content part (no server-side image fetch needed).
3. `format-entry`: extracts JSON from the raw model response, validates against `formattedEntrySchema`, retries once with a corrective prompt on validation failure, then persists via `services/chatLogs.service.ts`.
4. `answer-query`: builds a `GroundingSnapshot` (`services/grounding.service.ts` — joins members/tasks/projects into a plain summary) and injects it into the prompt so the leader Q&A model answers only from real data, never invents figures.
5. Both paths log every AI interaction (input, raw response, confirmed flag) via `createChatLog`, independent of whether the user later confirms/discards the suggested entry.

When touching AI features, know the failure boundary: NVIDIA API calls can fail on auth (bad/missing `NVIDIA_API_KEY`), rate limits, or upstream outages; route handlers already treat these failures as 502 and surface them — don't swallow those errors further up.

**Path alias**: `@/*` maps to repo root (see `tsconfig.json`).

**Firestore rules are dev-only permissive** (`firestore.rules` allows read/write to everyone) — do not treat this as a security model when reasoning about access control; it is explicitly marked to be tightened before any real deployment.

## UI

Astryx design system components (`@astryxdesign/core`). Domain components are grouped by feature (`chat/`, `dashboard/`, `members/`, `notifications/`, `timeline/`, `layout/`).

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
