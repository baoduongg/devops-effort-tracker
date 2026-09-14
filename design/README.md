# Handoff: DevOps Effort Hub

## Overview

DevOps Effort Hub is a team workload and task-tracking web app for DevOps engineering teams, with a natural-language AI assistant embedded as a first-class surface. Two personas share the same application shell with different views and permissions:

- **Leader** (manager) — sees the whole roster, capacity KPIs, cross-team Gantt, per-project allocation, and can create/edit/delete tasks, projects and members.
- **DevOps** (engineer) — sees a personal workspace (own tasks, own timeline, teammate availability) and uses the assistant primarily to log completed work.

The product answers three questions: *who is overloaded*, *what is late*, and *what changed* — and lets a leader act on all three either through the UI or by talking to the assistant.

## About the Design Files

The files in this bundle are **design references created in HTML**. They are prototypes that show intended look, layout, copy and behavior. They are **not production code to copy directly**.

`DevOps Effort Hub.dc.html` is a single-file streaming component format: a template of markup with `{{ }}` value holes plus a logic class that supplies those values. It runs in a browser via `support.js`, which is a prototyping runtime, not a shippable dependency.

The task is to **recreate these designs in the target codebase's existing environment** — React, Vue, SwiftUI, native, whatever the team already uses — following its established component library, routing, state and styling patterns. If no environment exists yet, choose the framework that best fits the project and implement the designs there. Treat the HTML as the spec for pixels and behavior, not as source to port line by line.

Everything in the prototype uses inline styles because the prototyping runtime requires it. **Do not reproduce that.** Move the values into the codebase's tokens, utility classes or styled components.

## Fidelity

**High fidelity.** Colors, typography, spacing, radii, shadows, copy and interaction states are final and should be matched closely. Exact hex values and pixel sizes are listed under **Design Tokens** and per-component below.

Two exceptions to treat as lofi:
- Icons are hand-written inline SVG paths approximating a Lucide/Feather-style 24×24 stroke set. Replace them with the codebase's real icon library at the same sizes.
- Avatars are initials on a generated gradient (hue derived from the name). Replace with real profile images where available, keeping the initials treatment as the fallback.

---

## Design Tokens

### Color

| Token | Hex | Use |
|---|---|---|
| Page background | `#08090C` | App canvas |
| Sidebar background | `#0A0C11` | Left nav, chat sidebar, chat composer bar, table header row |
| Surface | `#0D1014` | Panels, tables, gantt container, notification rows (read) |
| Surface raised | `#0F1218` → `#12151C` | Chat bubbles, popups, inputs |
| Card gradient | `linear-gradient(180deg,#11141A,#0D1014)` | KPI cards, member cards, project cards, task cards |
| Modal gradient | `linear-gradient(180deg,#12151C,#0C0F14)` | Modals, AI cards |
| Input background | `#0A0C11` | Text inputs, selects |
| Control background | `#14171E` | Secondary buttons |
| Control active | `#1E2431` | Selected segment in a segmented control |
| Hover fill | `#1A1E27` / `#1B2130` | Icon-button and list hover |
| Border | `rgba(255,255,255,0.07)` | Default hairline |
| Border strong | `rgba(255,255,255,0.10)` | Inputs, modals, composer |
| Divider | `rgba(255,255,255,0.05)` | Table/list row separators |
| Text primary | `#E9ECF2` | Body and headings |
| Text bright | `#EAF0FF` | Active nav label, unread notification title |
| Text secondary | `#8B93A6` | Sub-labels, descriptions |
| Text tertiary | `#6B7488` / `#7A8298` | Metadata, mono counts |
| Text dim | `#5C6478` | Timestamps, placeholders-adjacent labels |
| Text faint | `#4E566B` | Column heads, disabled glyphs |
| Placeholder | `#4E566B` | `::placeholder` |
| **Accent (electric blue)** | `#3D7BFF` | Primary buttons, active nav, In Progress status, unread dot, focus ring |
| Accent light | `#6E9BFF` | Links, inline text buttons, slash-command names |
| Accent pale | `#B9CCFF` | Effort badge text, accent-on-dark labels |
| Accent violet | `#7C5CFF` | Second stop in the logo/AI gradient only |
| Success / Available | `#2FD98A` | Available badge, Done status, entry card, "after" diff value |
| Warning / Busy | `#F5B93B` | Busy badge, warning notifications, clarification card, leader crown |
| Danger / Overloaded | `#FF5C6C` | Overloaded badge, Overdue flag, delete, critical notifications |
| Danger text | `#FF7B87` / `#FF9AA3` | Danger copy on dark |
| Track | `#1A1E27` | Empty portion of an effort bar |
| Track muted | `#333A48` | "Planned" segment of the project progress bar |

Alpha conventions used throughout, where `X` is a status color: fill `X1A` (10%), stronger fill `X1F` (12%), border `X40`–`X4D` (25–30%), glow `X66`/`X99`.

**Project colors** (8-swatch picker, first six are seeded projects):
`#5B8CFF` `#2FD98A` `#F5B93B` `#C084FC` `#F471B5` `#38BDF8` `#FB7185` `#A3E635`

**Accent gradient** (logo mark, AI avatar, floating chat button):
`linear-gradient(140deg,#3D7BFF,#7C5CFF)`

### Typography

| Role | Family | Size / weight |
|---|---|---|
| UI sans | **Instrument Sans** (400–700, Google Fonts) | see below |
| Numeric / temporal / code | **JetBrains Mono** (400/500/600) | see below |

- Page title (h1): 26px / 600 / letter-spacing −0.6px
- Login heading: 23px / 600 / −0.5px
- Member detail name: 19px / 600 / −0.3px
- Section & card titles: 14–15px / 600
- Body: 13.5–14px / 400–500, line-height 1.5–1.6
- Secondary body: 12.5–13px / 400
- Metadata: 11–12px / 400
- Overline (uppercase column heads, "LEADER VIEW", field labels): 10–11.5px / 600 / letter-spacing 0.06–0.12em / uppercase
- KPI number: JetBrains Mono 27px / 600 / −1px
- Secondary stat number: JetBrains Mono 21–24px / 600 / −0.8px
- Mono metadata (dates, effort, load %, email, `/commands`): JetBrains Mono 11–13px

Every number that represents effort, load percentage, a date range, a count in a pill, or a command is set in JetBrains Mono. Names, titles and prose are Instrument Sans.

### Spacing, radius, elevation

- Spacing scale in use: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 30px. Screen padding is `26px 30px 90px` (the 90px bottom clears the floating chat button). Card padding 14–22px. Grid/flex `gap` is used everywhere — no margin-based spacing between siblings.
- Radius: 5–6px (micro chips, tags), 7–9px (buttons, inputs, icon tiles, small avatars), 10–12px (list rows, small cards), 13–14px (cards, panels, chat bubbles, popups), 16px (modals, member profile card), 18px (large avatar), 20px (pills), 50% (dots, floating button, crown).
- Chat bubbles use an asymmetric radius: user `14px 14px 4px 14px`, AI `4px 14px 14px 14px`.
- Elevation (glow over borders):
  - Card: `0 10px 26px rgba(0,0,0,0.35)`
  - Card hover: `0 14px 34px rgba(0,0,0,0.5), 0 0 0 1px rgba(61,123,255,0.15)`
  - Popup: `0 20px 50px rgba(0,0,0,0.7)`
  - Modal: `0 34px 80px rgba(0,0,0,0.7)`
  - Primary button: `0 8px 22px rgba(61,123,255,0.35)`
  - Floating chat button: `0 14px 34px rgba(61,123,255,0.45), 0 0 0 1px rgba(255,255,255,0.08)`
  - Login card: `0 30px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)`
  - Focus ring on inputs: `border-color:#3D7BFF; box-shadow:0 0 0 3px rgba(61,123,255,0.18)`

### Motion

| Name | Definition | Applied to |
|---|---|---|
| `dhFloat` | 14s / 19s ease-in-out infinite, translate ≤6% + scale 1→1.12 | Two blurred radial blobs behind the login card |
| `dhRise` | 0.3s ease (0.18–0.2s for modals/toasts), `opacity 0→1, translateY(8px)→0` | Screen enter, modal enter, toast enter |
| `dhSpin` | 1.4s linear infinite | Spinner glyph on the AI thinking row |
| `dhBlink` | 1.1s infinite, opacity 0.25↔1, staggered 0 / 0.2s / 0.4s | Three-dot typing indicator |
| Chevron | `transform .18s` | Overdue banner collapse arrow |

---

## Screens / Views

There are nine screens plus overlays. Routing is a single `screen` value; `memberDetail` also carries a `detailId`.

---

### 1. Login

**Purpose:** authenticate; establishes the product's visual tone.

**Layout:** full-viewport grid, content centered, `overflow:hidden`, page background `#08090C`. Two absolutely positioned blurred radial gradients sit behind the card and animate with `dhFloat`: an 820px blue blob (`rgba(61,123,255,0.30)` → transparent at 62%) centered, and a 620px violet blob (`rgba(124,92,255,0.22)`) offset `translate(-260px,220px)`, running in reverse. Both `filter:blur(30px)`, `pointer-events:none`.

**Card:** `max-width:404px`, padding `36px 34px 30px`, radius 20px, `linear-gradient(180deg,#12151C,#0D1015)`, border `rgba(255,255,255,0.08)`, login shadow above.

**Contents, top to bottom:**
1. Logo row — 30px rounded-9px square with the accent gradient and a shield-check glyph, then "DevOps Effort Hub" at 15.5px/600. 26px below.
2. "Sign in" 23px/600, then "Track team bandwidth, effort and delivery." 13.5px `#8B93A6`.
3. `EMAIL` overline label, then input (full width, `#0A0C11`, 1px `rgba(255,255,255,0.09)`, radius 10px, padding `11px 13px`, 14px text, placeholder `you@company.io`).
4. `PASSWORD` label + password input, placeholder `••••••••`.
5. **Error state** (conditional): 12.5px `#FF7B87` row with a 14px alert-circle icon, 7px gap, text "Invalid email or password", 11px below the password field.
6. "Forgot password?" right-aligned link, 12.5px `#8B93A6`.
7. Primary button "Sign in" — full width, `#3D7BFF`, radius 10px, padding 12px, 14.5px/600 white, accent shadow. Hover `#5A8FFF`.
8. Divider row: two 1px rules with "OR" (11px `#5C6478`, letter-spacing 0.08em) between, 12px gaps.
9. "Sign in with Google" — full width, `#14171E`, 1px `rgba(255,255,255,0.09)`, radius 10px, 14px/500, with the four-color Google mark at 16px. Hover: background `#1A1E27`, border `rgba(255,255,255,0.16)`.
10. Footer hint, 12px `#5C6478`, centered.

**Behavior:** empty email or password on submit sets the error string; otherwise authenticate. Google button authenticates immediately (prototype shortcut — wire to real OAuth).

---

### 2. App shell

Present on every screen after login. `display:flex`, `min-height:100vh`.

**Sidebar** — 236px fixed, `#0B0D12`, right border `rgba(255,255,255,0.06)`, `position:sticky; top:0; height:100vh`, column flex.

- **Header block** (padding `18px 16px 14px`, bottom border):
  - 26px logo mark + "Effort Hub" 14px/600.
  - **Persona switch**: a two-up segmented control, `#0A0C11` container, 1px border, radius 9px, 3px padding, 3px gap. Segments "Leader" / "DevOps", each `flex:1`, 12px text, padding `5px 0`. Selected: `#1E2431`, 1px `rgba(255,255,255,0.10)`, radius 8px, `#E9ECF2`, 600. Unselected: transparent, `#7A8298`, 500.
  - **Role label**: "LEADER VIEW" / "DEVOPS VIEW", overline style, `#5C6478`, 9px below.
- **Nav** (`flex:1`, padding `12px 10px`, 2px gap, scrollable). Six items: Dashboard, Projects, Members, Tasks, Notifications, and a sixth whose label is persona-dependent — **"AI Ask"** for Leader, **"AI Log Work"** for DevOps.
  - Item: full-width button, `display:flex`, 10px gap, padding `9px 11px`, radius 9px, 16px stroke icon + 13.5px label.
  - Inactive: transparent background and border, `#8B93A6`, weight 500.
  - **Active**: `linear-gradient(90deg,rgba(61,123,255,0.18),rgba(61,123,255,0.05))`, 1px `rgba(61,123,255,0.30)`, `#EAF0FF`, weight 600. Members stays active while on the member detail screen.
  - Notifications carries an unread count pill: JetBrains Mono 10.5px/700, white on `#3D7BFF`, radius 20px, padding `1px 6px`.
- **Assistant-mode card** below the nav: overline "ASSISTANT MODE", then a card with `linear-gradient(140deg,rgba(61,123,255,0.14),rgba(124,92,255,0.07))`, 1px `rgba(61,123,255,0.24)`, radius 11px. Title (13px/600 `#B9CCFF`) is "Ask / Command" or "Log Work"; sub-line 11.5px `#7E8AA6` reads "Query the roster or propose task changes." or "Describe what you finished; I file it."
- **Footer** (top border, padding 12px): 30px avatar, name 13px/600, title 11.5px `#5C6478`, and a sign-out icon button (`#5C6478` → `#E9ECF2` on hover).

**Main** — `flex:1; min-width:0`, column flex. Each screen mounts inside with `animation: dhRise .3s ease`.

**Floating chat button** — visible on every screen except AI Chat. `position:fixed; right:26px; bottom:26px`, 54px circle, accent gradient, 23px message glyph, `z-index:40`. Hover `translateY(-2px)`. Navigates to AI Chat.

---

### 3. Dashboard — Leader

**Header row:** h1 "DevOps Effort Hub"; sub-line "Team bandwidth for the two weeks of Sep 1 – Sep 14" (13.5px `#8B93A6`). Right: primary "New Task" button with a 15px plus glyph.

**KPI strip:** `grid-template-columns: repeat(auto-fit, minmax(168px,1fr))`, 12px gap. Five clickable cards, each: card gradient, 1px border, radius 13px, padding `14px 16px`, shadow `0 8px 22px rgba(0,0,0,0.3)`.
- Top row of the card: a 28px rounded-8px icon tile tinted with the metric color (`color+1A` background, color foreground), and — when this KPI is the one currently filtering — the word `FILTERED` at 10.5px/600 `#3D7BFF`.
- Then the number (JetBrains Mono 27px/600/−1px) and the label (12px `#8B93A6`).

| KPI | Metric | Number color | Click |
|---|---|---|---|
| Total DevOps | count of role=devops | `#E9ECF2` | → Members |
| Available | load < 50% | `#2FD98A` | → Members |
| Moderate load | 50–100% | `#F5B93B` | → Members |
| Overloaded | > 100% | `#FF5C6C` | → Members |
| Overdue | overdue tasks | `#FF5C6C` | → Tasks, status filter = Overdue |

**Overdue alert banner** (only when overdue > 0): 1px `rgba(255,92,108,0.30)`, `linear-gradient(180deg,rgba(255,92,108,0.11),rgba(255,92,108,0.04))`, radius 13px. Header button row: 17px warning triangle in `#FF5C6C`, "N overdue tasks need attention" 13.5px/600, then "Hide"/"Show" 12px `#8B93A6` and a chevron that rotates 180° when open. Body (collapsible): rows of `#101218`, 1px border, radius 10px, padding `9px 12px` — project dot, task title (13px/500, ellipsis), assignee name (12px `#8B93A6`), and "Nd late" in JetBrains Mono 11.5px `#FF7B87`.

**Filter bar:** segmented control with **Roster / Gantt Timeline / By Project** on the left; on the right a search input (min 220px, `#0E1015`, radius 10px, 14px magnifier glyph, placeholder "Search people or tasks"), a project `<select>`, and a "Clear filters" ghost button (1px `rgba(255,255,255,0.09)`, `#8B93A6`, hover → `#E9ECF2` and brighter border).

**Tab — Roster:** `repeat(auto-fill, minmax(268px,1fr))` grid, 14px gap. Member card (clickable → member detail):
- Row: 38px avatar (with a 17px `#F5B93B` crown badge, 2px `#0F1217` ring, offset −5px top/right, if the member is a leader), name 14px/600, title 11.5px `#5C6478`, and the status badge pinned right.
- "Load" label + percentage in JetBrains Mono 13px/600 colored by state, then a 6px effort bar.
- Skill chips: 11px `#9AA3B8` on `#171A22`, 1px border, radius 6px, padding `3px 7px`, 5px gap.
- Footer counts in JetBrains Mono 11.5px `#6B7488`: "N active", "N planned", and "N overdue" in `#FF7B87` when nonzero.
- Hover: border `rgba(61,123,255,0.4)` + card hover shadow.
- Empty state when filters match nobody: centered, 70px padding, "No members match those filters" 15px/600 `#8B93A6` over "Try clearing the search or project filter." 13px `#5C6478`.

**Tab — Gantt Timeline:** see **Gantt component** below. Above the grid, a legend row of project dot + name pairs (11.5px `#8B93A6`, 16px gaps, wrapping). One row per visible member; the row's left rail is a clickable button with a 26px avatar, name 12.5px/500, and load % in JetBrains Mono 10.5px colored by state.

**Tab — By Project:** a `#0D1014` panel, radius 14px. One row per project: `grid-template-columns: 220px 1fr`, 16px gap, padding `15px 18px`, bottom divider.
- Left: project dot, name 13.5px/600, and "Xh · N tasks" in JetBrains Mono 11px `#6B7488`.
- Right: wrapping chips of assigned people — `#12151C`, 1px border, radius 9px, padding `6px 10px 6px 6px` — each with a 22px avatar, name 12.5px, and that person's summed effort on the project in JetBrains Mono 11.5px `#8B93A6`. Hover border `rgba(61,123,255,0.4)`. Chips navigate to the member detail. If nobody is allocated: "No one allocated" 12.5px `#4E566B`.

---

### 4. Dashboard — DevOps (member)

**Header:** h1 "Dashboard: {name}". Sub-line: "Your workload for Sep 1 – Sep 14 · **switch to full team dashboard →**" where the second half is an inline text button in `#6E9BFF` that flips the persona to Leader. Right: a **secondary** "New Task" button (`#14171E`, 1px border, radius 9px, 13px/600; hover border `#3D7BFF`) — smaller than the leader's primary button by design.

**Stat row:** four cards, `minmax(160px,1fr)`, card gradient, radius 13px, padding `14px 16px`. Label 12px `#8B93A6`, value JetBrains Mono 24px/600/−0.8px. Current load (colored by state), Active, Planned, Overdue (`#FF5C6C`).

**Tabs:** segmented control, five segments — Active / Planned / Done / Gantt / Team.

**Active / Planned / Done:** a `max-width:900px` column of task cards, 10px gap. Card: card gradient, 1px border, radius 12px, padding `14px 16px`, flex row with 14px gap.
- Status dot (colored by status), then title 14px/600, then a meta row with the project chip, the date range in JetBrains Mono 11.5px `#6B7488`, and an `OVERDUE` tag when late (10.5px/600 `#FF7B87`, 1px `rgba(255,92,108,0.45)`, radius 5px, padding `1px 6px`).
- Right: effort badge — JetBrains Mono 12px `#B9CCFF` on `rgba(61,123,255,0.12)`, 1px `rgba(61,123,255,0.24)`, radius 7px, padding `4px 9px`.
- Far right: **status toggle** — the status badge rendered as a button. Clicking cycles Planned → In Progress → Done → Planned, clears the overdue flag on Done, and fires a toast "{title} → {new status}".
- Empty bucket: "Nothing here 🎉" 15px/600 `#8B93A6` + "No tasks in this bucket right now." 13px `#5C6478`.

**Gantt tab:** the same Gantt component with a single row — the current user.

**Team tab:** `max-width:820px` column, 9px gap. Row: `#0D1014`, 1px border, radius 11px, padding `11px 14px` — 32px avatar; name 13.5px/600 with "{title} · {skills}" 11.5px `#5C6478` beneath; a **"free to pair"** pill when load < 60% (11px/600 `#2FD98A` on `rgba(47,217,138,0.11)`, 1px `rgba(47,217,138,0.3)`, radius 6px); a 110px effort bar; and the load % in JetBrains Mono 12px, right-aligned in a 48px column.

---

### 5. Projects

**Header:** h1 "Projects", sub-line "Every active workstream and who is on it." Primary "New Project" button — **leader only**.

**KPI strip:** three cards (`minmax(190px,1fr)`), same construction as the member stat row: Projects (count), Allocated effort (sum of all task effort, formatted as hours), Active tasks.

**Inline new-project form** (toggled by the header button, not a modal): `#0D1014`, 1px `rgba(61,123,255,0.28)`, radius 14px, padding 18px, shadow `0 0 0 1px rgba(61,123,255,0.08), 0 18px 40px rgba(0,0,0,0.5)`.
- Title "New project" 14px/600.
- Two-column grid: Name (placeholder "e.g. Service Mesh Rollout") and Description (placeholder "One line summary").
- "Colour" label then the **8-swatch picker**: 28px squares, radius 8px, 8px gap. Selected swatch gets `2px solid #fff` plus `0 0 0 2px {color}80`; unselected `2px solid transparent`.
- Actions: primary "Create project", ghost "Cancel". Creating appends the project, closes the form, clears the fields, and fires a toast `Project "{name}" created`.

**Project grid:** `repeat(auto-fill, minmax(300px,1fr))`, 14px gap. Card (card gradient, radius 14px, padding 17px, card shadow):
1. 30px rounded-9px icon tile tinted with the project color (`color+1F` fill, `color+40` border, folder glyph) + name 14.5px/600.
2. Description 12.5px `#8B93A6`, line-height 1.5, `min-height:38px` so cards align.
3. Overline "ASSIGNED DEVOPS", then an **avatar stack with effort**: up to 4 pills, each `#161A22`, 1px border, radius 20px, padding `3px 9px 3px 3px` — 22px avatar + that person's effort in JetBrains Mono 11px `#9AA3B8`.
4. **Progress mini-bar**: a 7px `#1A1E27` track split into three flex segments sized by task count — done `#2FD98A`, in-progress the project color, planned `#333A48`. Below it, JetBrains Mono 11px `#6B7488`: "N in progress", "N planned", "N done".
5. **Preview of the first three tasks**: status dot + title, 12.5px `#9AA3B8`, ellipsized; then "+N more" in 12px `#5C6478` when there are more.

---

### 6. Members — list

**Header:** h1 "Members", sub-line "N people · N over capacity". Primary "Add Member" button — **leader only** — opens a modal.

**Search:** single input, `max-width:320px`, placeholder "Search name or skill". Matches name or any skill.

**Grid:** `repeat(auto-fill, minmax(258px,1fr))`, 14px gap. Card (clickable → member detail), padding 17px:
- 46px avatar with the crown badge (19px) for leaders.
- Name 14.5px/600; below it a **role badge** and a **status badge** side by side (6px gap).
  - Role badge — Leader: 11px/600 `#F5B93B` on `rgba(245,185,59,0.12)`, 1px `rgba(245,185,59,0.35)`. DevOps: `#9AA3B8` on `#171A22`, 1px `rgba(255,255,255,0.07)`. Radius 6px, padding `3px 8px`.
  - Status badge — see **Status badges** below.
- Skill chips.
- "Current effort" label + percentage (JetBrains Mono 12.5px/600, state color) and a 6px effort bar.

---

### 7. Member detail

**Back link:** "‹ All members", 13px `#8B93A6`, hover `#E9ECF2`, 18px below.

**Layout:** `grid-template-columns: 296px 1fr`, 20px gap, `align-items:start`.

**Left — profile card** (`position:sticky; top:22px`, card gradient, radius 16px, padding 22px, shadow `0 12px 30px rgba(0,0,0,0.4)`), centered column:
- 88px avatar, radius 18px, with a 26px crown badge (3px `#0F1217` ring) for leaders.
- Name 19px/600/−0.3px; title 12.5px `#8B93A6`.
- Role badge + status badge row.
- Divider, then **Bandwidth**: label left, "{load}% · {minutes} min booked" right in JetBrains Mono 12.5px (state color), over a 7px effort bar. Minutes = sum of effort on non-done tasks.
- Skill chips, centered, wrapping.
- Divider, then email with a 14px envelope glyph, JetBrains Mono 11.5px `#8B93A6`.
- "Edit profile" secondary button — shown to a leader, or to the member viewing themselves.

**Right — main column:**
1. **Quick stats:** four small cards (`minmax(130px,1fr)`, `#0D1014`, radius 12px, padding `13px 15px`): Total load (state color), Active, Planned, Overdue (`#FF5C6C`). Values JetBrains Mono 21px/600.
2. **Gantt** — the focal element. `#0D1014` panel, radius 14px, padding `16px 18px 18px`, titled "Timeline · Sep 1 – Sep 14" (13px/600). Day header then this member's lanes. `min-width:640px` with horizontal scroll.
3. **Grouped task list** — three groups in order: **Active**, **Upcoming** (planned), **Done**. Each group: title 13px/600 + count in JetBrains Mono 11.5px `#5C6478` ("N tasks"), then rows (`#0D1014`, 1px border, radius 11px, padding `11px 14px`, 8px gap): status dot, title 13.5px/500, meta row (project chip, date range, `OVERDUE` tag), effort in JetBrains Mono 11.5px `#8B93A6`, and two icon buttons — pencil (hover `#E9ECF2` on `#1A1E27`) and trash (hover `#FF7B87` on `rgba(255,92,108,0.1)`). Delete removes the task and fires "Task deleted".

---

### 8. Tasks (global list)

**Header:** h1 "Tasks", sub-line "N of M tasks · N overdue". Primary "New Task" button.

**Filter bar:** search (min 260px, "Search tasks or people" — matches title or assignee name), status `<select>` (All statuses / In Progress / Planned / Done / **Overdue only**), project `<select>`, "Clear filters".

**Table:** `#0D1014` panel, radius 14px, `overflow:hidden`.
- Header row: `#0A0C11`, bottom border, padding `11px 16px`, overline column labels — Task, Assignee, Project, Dates, Status, Effort, and an empty actions column.
- Column template, shared by header and rows: `2.2fr 1.1fr 1.1fr 1.3fr 0.9fr 0.7fr 84px`, 12px gap, padding `11px 16px`, bottom divider `rgba(255,255,255,0.05)`, `align-items:center`.
- Cells: project dot + title (13.5px/500, ellipsis) with an `OVERDUE` chip inline when late; 22px avatar + assignee name (12.5px `#9AA3B8`); project chip; date range (JetBrains Mono 11.5px `#7A8298`); status badge; effort (JetBrains Mono 12px `#B9CCFF`); actions.
- **Row hover reveals edit/delete icon buttons — leader only.** In the prototype they are always rendered for the leader at `#4E566B`; implement as hidden until row hover (`opacity 0 → 1`), leader-gated.
- Empty state: "No tasks match" 14.5px/600 `#8B93A6` + "Adjust the filters above." 13px `#5C6478`, 60px padding.

---

### 9. Notifications

`max-width:880px`.

**Header:** h1 "Notifications", sub-line "N unread · M total" (or "No unread notifications"). Right: "Mark all as read" secondary button → marks all read + toast "All notifications marked read".

**Tabs:** segmented control with four segments, each label followed by a count pill: **All / Mine / Unread / Overdue**. Count pill: JetBrains Mono 10.5px, radius 20px, padding `1px 6px`; active `#B9CCFF` on `rgba(61,123,255,0.18)`, inactive `#5C6478` on `#171A22`.

**List:** 9px gap. Row is a button, `position:relative`, radius 12px, 1px border, padding `13px 16px 13px 18px`, `overflow:hidden`.
- **Severity strip**: absolutely positioned, 3px wide, full height, left edge. Info `#3D7BFF`, warning `#F5B93B`, critical `#FF5C6C`.
- **Type icon tile**: 30px, radius 9px, severity-tinted (`sev+1A` fill, `sev+33` border). Glyphs: overdue → clock-with-alert, budget → trending line in a chart frame, other → bell.
- Title 13.5px/600 — `#EAF0FF` unread, `#9AA3B8` read. Body 12.5px `#8B93A6`, line-height 1.45.
- Right: relative timestamp in JetBrains Mono 11px `#5C6478`, and an unread dot (7px, `#3D7BFF`, glow `0 0 8px rgba(61,123,255,0.8)`).
- Row background: `#101319` unread, `#0B0E13` read. Clicking a row toggles read/unread.
- Empty state: "No notifications 🎉" + "You are all caught up in this tab."

---

### 10. AI Chat — centerpiece

Full-height three-part layout: history sidebar, message column, composer.

**Chat sidebar** — 242px, `#0A0C11`, right border, padding `16px 12px`.
- "New conversation" secondary button with a plus glyph. Resets the thread.
- Overline "HISTORY", then a list of past threads: title 12.5px, relative time 10.5px `#4E566B`, radius 9px, padding `8px 10px`. The current thread is `#151922` with a 1px border and `#E9ECF2` text; the rest are transparent with `#8B93A6`.

**Chat header** — padding `14px 24px`, bottom border. 28px accent-gradient tile with a sparkle glyph; "AI Assistant" 14px/600 over the mode hint 11.5px `#5C6478`; on the right, the **AI provider toggle**: a two-up segmented control, **Sonnet / Haiku**.

**Message list** — `flex:1; overflow-y:auto`, padding `24px 24px 8px`, inner column `max-width:760px; margin:0 auto`, 16px gap. Auto-scrolls to the bottom when a message is added or the thinking state changes.

#### Message states

**a. User bubble** — right-aligned, `max-width:76%`. `#1B2130`, 1px `rgba(255,255,255,0.08)`, radius `14px 14px 4px 14px`, padding `11px 15px`, 14px/1.55, `white-space:pre-wrap`. If the message carried an attachment, a thumbnail chip sits above it: `#12151C`, 1px border, radius 10px, a 34px rounded-7px image tile with an image glyph, and the filename in JetBrains Mono 12px `#9AA3B8`.

**b. AI text bubble** — left-aligned, `max-width:80%`, a 27px accent-gradient avatar tile then the bubble: `#0F1218`, 1px `rgba(61,123,255,0.22)`, **left border 2px `#3D7BFF`**, radius `4px 14px 14px 14px`, padding `12px 16px`, 14px/1.6 `#D8DEEA`.

**c. Entry Card** (DevOps work-log parse) — `max-width:560px`, modal gradient, 1px `rgba(47,217,138,0.26)`, radius 14px, card shadow.
- Header: `rgba(47,217,138,0.07)` bar, bottom border, a document-check glyph and "Work log parsed" 12.5px/600 in `#2FD98A`; right side shows "awaiting confirm" in JetBrains Mono 11px `#5C6478`.
- Body: a `96px 1fr` grid, gaps `9px 14px`. Left cells are uppercase field labels 11.5px/600 `#6B7488`; right cells are values in JetBrains Mono 13.5px `#E9ECF2`. Fields: Title, Project, Effort, Dates, Status.
- Actions (top border, padding `12px 16px`): **"Confirm & save"** — `#2FD98A` fill, `#04170D` text, 700, check glyph — and a ghost **"Edit"**.
- Once confirmed the action row is replaced by a resolution strip: padding `10px 16px`, top border, 12.5px, "✓ Saved to your work log" in `#2FD98A` on `rgba(47,217,138,0.06)`, or "Dismissed" in `#7A8298`. Confirming also fires the toast "Work log entry saved".

**d. Proposal Card** (leader command result) — `max-width:600px`, modal gradient, radius 14px, card shadow. Two variants:
- **Update**: border `rgba(61,123,255,0.28)`, header tinted `#3D7BFF12` with `#3D7BFF` text, pencil glyph, title "Proposed change", meta "awaiting confirm".
- **Delete**: border `rgba(255,92,108,0.32)`, header tinted `#FF5C6C12` with `#FF5C6C` text, trash glyph, title "Delete task", meta "destructive", **plus a red warning strip** directly under the header: `rgba(255,92,108,0.13)` fill, bottom border `rgba(255,92,108,0.25)`, padding `10px 16px`, 12.5px/500 `#FF9AA3`, warning-triangle glyph, text "This will permanently delete this task and its logged effort."
- Body: target task name 13.5px/600, then a **before → after diff grid**, `88px 1fr 18px 1fr`, gaps `8px 10px`. Column heads Field / Before / After in 10px uppercase `#4E566B`. Per row: field name 12px `#8B93A6`; the before value; a `→` in `#4E566B`, centered; the after value.
  - **Changed** field — before: JetBrains Mono 12px `#FF9AA3` on `rgba(255,92,108,0.09)`, radius 6px, padding `3px 8px`, `line-through`. After: `#7FE3AE` on `rgba(47,217,138,0.1)`, weight 600.
  - **Unchanged** field — both sides `#6B7488`, transparent, no strike.
- Actions: **Confirm change** (accent) or **Delete permanently** (`#FF5C6C`), then ghost **Cancel** and ghost **Edit**. Resolution strip reads "✓ Change applied" / "✓ Task deleted" / "Cancelled"; toasts "Task updated" / "Task deleted" / "Proposal cancelled".

**e. Clarification Card** — `max-width:540px`, border `rgba(245,185,59,0.28)`. Header `rgba(245,185,59,0.07)` with a help-circle glyph and "Needs clarification" in `#F5B93B`. Body: the question at 13.5px/1.55 `#D8DEEA`, then **selectable chips** — `#161A22`, 1px `rgba(255,255,255,0.1)`, radius 20px, padding `7px 14px`, 13px; hover border `#3D7BFF`, background `#1B2130`. Picking a chip sends its label as the next user message.

**f. Thinking state** — the 27px AI avatar with a spinning glyph, next to a bubble containing three 6px `#6E9BFF` dots animating `dhBlink` at 0 / 0.2s / 0.4s.

**Composer** — top border, `#0A0C11`, padding `12px 24px 18px`, inner column `max-width:760px`, `position:relative`.

- **Slash-command popup** — appears when the input starts with `/`. Absolutely positioned `bottom: calc(100% + 10px)`, left 0, 340px wide, `#12151C`, 1px `rgba(255,255,255,0.1)`, radius 12px, padding 6px, popup shadow, `z-index:5`. Rows: command in JetBrains Mono 12.5px/600 `#6E9BFF` in a fixed 66px column, description 12.5px `#8B93A6`; hover `#1B2130`, radius 8px. Commands: `/help` What the assistant can do · `/free` Who has spare bandwidth this week · `/overload` List everyone above 100% load · `/assign` Assign a task to someone · `/report` Weekly effort summary by project · `/log` Log work you finished today. The list filters as you type. Picking one inserts `"{cmd} "`.
- **Quick-prompt pills** — a wrapping row above the input, `#0F1218`, 1px `rgba(255,255,255,0.08)`, radius 18px, padding `6px 12px`, 12.5px `#9AA3B8`; hover border `rgba(61,123,255,0.5)`, text `#E9ECF2`. Role-specific:
  - Log Work: "Finished the WAF rule tuning today, ~3h" · "Spent 90 minutes debugging the Argo sync" · "Starting the Loki retention work tomorrow"
  - Ask/Command: "Who is free to take on a 2-day task?" · "Show me everyone above 100% load" · "Move the Vault namespace task to Sam"
  Clicking a pill sends it immediately.
- **Attachment preview** — when a file is staged, an inline chip above the input: 32px image tile, filename in JetBrains Mono 11.5px, and an × button (hover `#FF7B87`).
- **Input box** — `#0F1218`, 1px `rgba(255,255,255,0.1)`, radius 14px, padding `10px 10px 10px 14px`, shadow `0 0 0 1px rgba(61,123,255,0.05), 0 10px 30px rgba(0,0,0,0.5)`. A 2-row auto-height textarea (14px/1.5, no resize) with a mode-dependent placeholder: "Describe the work you finished…" or "Ask about capacity, or command a change…".
- **Toolbar** under the textarea: the **mode toggle** — a two-up segmented control, **"DevOps: Log Work"** / **"Leader: Ask/Command"** — then a spacer, a **paperclip** icon button (hover `#E9ECF2` on `#1A1E27`) that stages a screenshot, and the **send button**: 34px square, radius 9px, arrow glyph. Enabled (input non-empty): `#3D7BFF`, white glyph, `0 6px 18px rgba(61,123,255,0.4)`. Disabled: `#1A1E27`, `#5C6478`, no shadow.
- **Hint line**, centered, 11px `#4E566B`: "Type / for commands · Enter to send · Shift+Enter for a new line".

---

## Shared components

### Status badges
Pill: 11px/600, radius 6px, padding `3px 8px`, `white-space:nowrap`. Color `X`, background `X1F` (12%), border `1px solid X4D` (30%).

| Badge | Color | Rule |
|---|---|---|
| Available | `#2FD98A` | load < 50% |
| Busy | `#F5B93B` | 50 ≤ load ≤ 100% |
| Overloaded | `#FF5C6C` | load > 100% |

**Task status badge** — same construction with `X1A` fill and `X3D` border: In Progress `#3D7BFF`, Planned `#8B93A6`, Done `#2FD98A`.

**Overdue flag** — outline only, no fill: 10–10.5px/600 `#FF7B87`, 1px `rgba(255,92,108,0.45)`, radius 5px, padding `1px 5–6px`, label `OVERDUE`.

### Effort / workload bar
Track: height 6px (7px on the detail page), radius 4px, `#1A1E27`, `overflow:hidden`. Fill: width `min(load,100)%`, radius 4px, `linear-gradient(90deg, {stateColor}99, {stateColor})`, `box-shadow: 0 0 12px {stateColor}66`. Loads above 100% clamp the bar at full width and are communicated by the red color and the numeric label.

### Avatar
Square with rounded corners — radius 9px at ≤40px, 18px above. Background `linear-gradient(140deg, hsl(H 55% 34%), hsl(H+40 55% 22%))` where `H` is a hash of the name (`h = (h*31 + charCode) % 360`). Initials: first letters of the first two words, uppercase, `fontSize = size * 0.38`, weight 700, `#EAF0FF`, 1px `rgba(255,255,255,0.09)` border. Sizes in use: 22, 26, 30, 32, 38, 46, 88px.

**Role indicator** — leaders get a circular `#F5B93B` crown badge on the top-right corner with a 2–3px ring in the surrounding surface color (`#0F1217`). Badge sizes track the avatar: 17px on 38px, 19px on 46px, 26px on 88px.

### Project chip
11.5px, color = project color, background `color+1A`, border `1px solid color+40`, radius 6px, padding `2px 8px`, ellipsized.

### Project dot
8px circle, project or status color, `box-shadow: 0 0 8px {color}99`.

### Segmented control
Container `#0E1015` (or `#0A0C11` inside the composer/sidebar), 1px `rgba(255,255,255,0.07)`, radius 9–11px, padding 3px, gap 3px. Segment: radius 8px, padding `6px 13px` (compact variants `5px 11px`), 12.5px. Selected `#1E2431` + 1px `rgba(255,255,255,0.10)` + `#E9ECF2` + 600; unselected transparent + `#7A8298` + 500.

### Gantt component
Used on the leader dashboard, the DevOps dashboard, and the member detail page.

- Container `#0D1014`, 1px border, radius 14px, padding `16px 18px 18px`, `overflow-x:auto` with an inner `min-width` (820px team view, 760px personal, 640px detail).
- Structure: `grid-template-columns: 176px 1fr` — a left rail (empty in the header row, member identity in body rows) and a 14-column day grid (`repeat(14,1fr)`).
- **Day header cell:** two-digit day in JetBrains Mono 12px over a 2-letter weekday in 10px `#5C6478`, centered, padding `2px 0 7px`. Weekend columns get `rgba(255,255,255,0.02)` and a dimmer number (`#4E566B`); weekdays `#8B93A6`. **Today** gets `#3D7BFF` at weight 700 and a `1px solid rgba(61,123,255,0.45)` left edge.
- **Lane area:** a 14-column grid whose rows are 26px each. Overlapping tasks for one person are packed into lanes by a first-fit algorithm (a task joins the first lane where it collides with nothing), so a row's height is `laneCount × 26px`. The background carries the column rules: `repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px calc(100%/14))`.
- **Bar:** `grid-column: {startDay+1} / span {days}`, height 22px, radius 6px, margin `2px 1px`, padding `0 7px`, 11px/600, single-line ellipsis, `title` tooltip of "{task} · {project} · {range} · {effort}".
  - Open task: `linear-gradient(90deg, {projectColor}CC, {projectColor}99)`, 1px `{projectColor}66`, `box-shadow: 0 2px 10px {projectColor}40`, text `#08090C` (dark text on the saturated bar).
  - Done task: `rgba(255,255,255,0.06)`, no shadow, text `#6B7488`.
  - Overdue task: the border becomes `#FF5C6C`.
- Body rows are separated by `1px solid rgba(255,255,255,0.05)`.

### Empty states
Centered block, 60–70px vertical padding. Title 14.5–15px/600 `#8B93A6`, sub-line 13px `#5C6478` 4–5px below. Copy in use: "No overdue tasks" (banner simply hides at zero), "Nothing here 🎉 / No tasks in this bucket right now.", "No members match those filters / Try clearing the search or project filter.", "No tasks match / Adjust the filters above.", "No notifications 🎉 / You are all caught up in this tab."

### Toast
`position:fixed; bottom:26px; left:50%; transform:translateX(-50%)`, `z-index:70`, `animation: dhRise .2s ease`. `#151922`, 1px `rgba(255,255,255,0.12)`, radius 12px, padding `11px 18px 11px 12px`, popup shadow. A 22px `#3D7BFF` circle with a white check glyph, then the message at 13.5px/500. **Auto-dismisses after 2600ms**; a new toast resets the timer.

Toast copy: `Project "{name}" created`, `Task "{name}" created`, `Task deleted`, `Task updated`, `{name} added to the team`, `{task} → {status}`, `Work log entry saved`, `Proposal cancelled`, `All notifications marked read`.

### Modals
Backdrop `rgba(4,5,8,0.72)` with `backdrop-filter: blur(4px)`, `z-index:60`, content centered, 24px padding. Panel: modal gradient, 1px `rgba(255,255,255,0.1)`, radius 16px, modal shadow, `animation: dhRise .18s ease`.
- Header: padding `16px 20px`, bottom border, title 15px/600, close × icon button.
- Body: padding 20px, 14px gap. Field label 11.5px `#8B93A6` 6px above its control; controls are `#0A0C11`, 1px `rgba(255,255,255,0.09)`, radius 9px, padding `10px 12px`, 13.5px, focus border `#3D7BFF`.
- Footer: padding `14px 20px`, top border, right-aligned — ghost Cancel then primary action.

**New Task modal** (`max-width:520px`): Title; Project + Assignee selects side by side; Effort (minutes, mono), Start, End as a three-up row of date inputs. Creates a Planned task and toasts.
**Add Member modal** (`max-width:440px`, leader only): Full name, Skills (comma separated). Creates a DevOps member at 0% load with a derived `first.last@company.io` email.

### Buttons

| Variant | Style |
|---|---|
| Primary | `#3D7BFF`, no border, radius 9–10px, padding `9–12px 15–18px`, 13–14.5px/600, white, `0 8px 22px rgba(61,123,255,0.35)`. Hover `#5A8FFF`. |
| Secondary | `#14171E`, 1px `rgba(255,255,255,0.1)`, radius 9px, padding `9px 13–14px`, 13px/500–600, `#E9ECF2`. Hover border `#3D7BFF`. |
| Ghost | transparent, 1px `rgba(255,255,255,0.09–0.12)`, `#8B93A6`. Hover `#E9ECF2` + brighter border. |
| Destructive | `#FF5C6C`, white text, `0 6px 18px rgba(255,92,108,0.35)`. |
| Icon | 14–17px glyph, no chrome, `#4E566B`–`#5C6478`, padding 5–7px, radius 6–8px. Hover `#E9ECF2` on `#1A1E27`; destructive hover `#FF7B87` on `rgba(255,92,108,0.1)`. |
| Inline text | no chrome, `#6E9BFF`, inherits size. |

---

## Interactions & Behavior

**Navigation.** Sidebar items switch `screen` and clear `detailId`. Member cards, Gantt row rails and allocation chips all open the member detail. "All members" returns to the Members list. The floating chat button opens AI Chat and is hidden while there.

**Persona switch.** Flipping Leader ↔ DevOps resets to the Dashboard, clears `detailId`, changes the sixth nav label (AI Ask ↔ AI Log Work), swaps the assistant-mode card copy, sets the chat mode (`ask` ↔ `log`), and gates the leader-only affordances: New Project, Add Member, and the task row edit/delete buttons.

**Filters.** `search`, `projFilter` and `statusFilter` are shared state, so a KPI click that sets "Overdue" on the Tasks screen persists until cleared. Search matches member name or skills on people screens, and task title or assignee name on task screens. The project filter on the leader dashboard narrows both the roster (to members with a task on that project) and the Gantt bars. "Clear filters" resets all three.

**Overdue rule.** A task is overdue when its status is not Done and (it is explicitly flagged, or its end date is before today). Marking a task Done clears the flag.

**Status cycling.** The status badge on a DevOps task card is a button: Planned → In Progress → Done → Planned, with a toast each time.

**AI chat.** On send, the user message is appended immediately (with any staged attachment), the input and attachment clear, and a thinking indicator appears. The request goes to a model with a system prompt carrying: today's date, the current mode, the full roster with loads and skills, the project list, and up to 14 open tasks with assignee, range, status, effort and overdue flag. The model is instructed to reply with **exactly one JSON object** in one of four shapes:

```
{"kind":"text","text":"..."}
{"kind":"entry","fields":{"Title":"...","Project":"...","Effort":"...","Dates":"...","Status":"..."}}
{"kind":"proposal","action":"update"|"delete","target":"task · project",
 "changes":[{"field":"Assignee","before":"X","after":"Y"},{"field":"Effort","before":"720m","after":"720m","same":true}]}
{"kind":"clarify","question":"...","options":["...","..."]}
```

The client extracts the first `{...}` block, parses it, and falls back to rendering the raw text as a plain AI bubble if parsing fails or `kind` is missing. A request error appends a plain bubble explaining the failure. Cards start `pending`; Confirm/Cancel moves them to a terminal status that swaps the action row for a resolution strip and fires a toast. **In the prototype, confirming a proposal does not yet mutate the underlying task — wire that to the real API.** Clarification chips send their own label as the next user message. The message list scrolls to the bottom whenever a message is appended or the thinking state toggles.

**Slash commands.** Typing `/` as the first character opens the popup; the list filters on the first token. Selecting inserts the command with a trailing space. There is no execution path for the commands themselves in the prototype — implement each against the real data layer.

**Keyboard.** Enter sends; Shift+Enter inserts a newline.

**Notifications.** Clicking a row toggles read/unread. "Mark all as read" clears every unread flag. Tab counts recompute from the live list.

**Responsive.** Desktop-first, usable on tablet. Every grid uses `auto-fit`/`auto-fill` with `minmax` so cards reflow: KPIs 168px, project KPIs 190px, roster 268px, members 258px, projects 300px. Filter bars wrap. Gantt panels scroll horizontally below their `min-width` rather than compressing. Not yet designed: a phone layout, and a collapsed/drawer state for the 236px sidebar — both are open questions for implementation.

---

## State Management

| State | Type | Notes |
|---|---|---|
| `authed`, `email`, `password`, `loginError` | auth | replace with the real session |
| `screen` | `'dashboard' \| 'projects' \| 'members' \| 'memberDetail' \| 'tasks' \| 'notifications' \| 'chat'` | map to routes |
| `persona` | `'leader' \| 'devops'` | should derive from the signed-in user's role in production; the switch is a prototype affordance |
| `detailId` | member id | route param |
| `leaderTab` | `'roster' \| 'gantt' \| 'project'` | |
| `memberTab` | `'active' \| 'planned' \| 'done' \| 'gantt' \| 'team'` | |
| `notifTab` | `'all' \| 'mine' \| 'unread' \| 'overdue'` | |
| `search`, `projFilter`, `statusFilter` | filters | shared across screens |
| `overdueOpen` | boolean | banner collapse |
| `modal` | `'task' \| 'member' \| null` | |
| `projectFormOpen`, `swatch` | inline project form | |
| `form` | draft fields for all three forms | |
| `toast` | string \| null | 2600ms timer |
| `tasks`, `projects`, `members`, `notifications` | collections | seeded locally; replace with server data |
| `chat` | message array | each item `{id, kind, …}` |
| `chatInput`, `chatMode`, `model`, `busy`, `attach` | composer | |

**Data model**

```
Member { id, name, role: 'leader'|'devops', title, load: number /* percent, may exceed 100 */,
         skills: string[], email }
Project { id, name, color: hex, desc }
Task    { id, title, project: ProjectId, member: MemberId,
          s: number, e: number,          // inclusive day indices into the 14-day window
          status: 'active'|'planned'|'done',
          effort: number,                // minutes
          overdue: boolean }             // explicit flag; also derived from e < today
Notification { id, type: 'overdue'|'budget'|'other', sev: 'info'|'warning'|'critical',
               title, body, time, unread, mine }
ChatMessage = { id, kind:'user', text, attach? }
            | { id, kind:'text', text }
            | { id, kind:'entry', status:'pending'|'saved'|'dismissed', data: Record<string,string> }
            | { id, kind:'proposal', status:'pending'|'applied'|'cancelled',
                action:'update'|'delete', target, changes: {field,before,after,same?}[] }
            | { id, kind:'clarify', question, options: string[] }
```

> **Dates are a prototype simplification.** The Gantt window is a fixed 14 days (Sep 1–14, 2026) and tasks store integer day indices with today hard-coded at index 9. Replace with real ISO dates plus a derived window; the Gantt lane packing and bar placement then work off day offsets computed from those dates.

**Data fetching required:** members with computed load, projects, tasks (filterable by project/status/assignee/date window), notifications, chat threads and messages, and the assistant endpoint. Load percentage is presented as server-computed, not derived client-side.

---

## Assets

- **Fonts:** Instrument Sans and JetBrains Mono, loaded from Google Fonts. Self-host in production.
- **Icons:** inline SVG, 24×24 viewBox, `fill:none`, `stroke:currentColor`, `stroke-width` 1.9–2.4, round caps and joins, rendered at 9–23px. They approximate Lucide — swap for the real library. Glyphs used: shield-check (logo), layout-dashboard, folder, users, list, bell, message-circle, sparkles, plus, search, chevron-down, chevron-left, alert-triangle, alert-circle, clock, check, check-circle, crown, pencil, trash, mail, log-out, image, paperclip, arrow-right, help-circle, file-check, trending-up, x.
- **Google mark:** the standard four-color "G" as inline SVG on the login screen. Use Google's official asset and follow their branding rules in production.
- **Avatars:** generated initials + hue-hashed gradient. No image assets ship with this design.
- **Emoji:** a single 🎉 appears in two empty states. Drop it if the product's tone forbids emoji.
- No raster images, illustrations or third-party media are used anywhere.

---

## Files

| File | What it is |
|---|---|
| `DevOps Effort Hub.dc.html` | The complete design — all nine screens, the shared components, and the working prototype logic. Open it directly in a browser. |
| `support.js` | The prototyping runtime that renders the file. Reference only; do not ship. |

Open the HTML file and click through it while reading this document — the login accepts any non-empty credentials, and the persona switch at the top of the sidebar is the fastest way to see both roles. The AI chat calls a live model, so the card states are reachable by typing real requests; the thread also opens pre-seeded with one example of each card state.
