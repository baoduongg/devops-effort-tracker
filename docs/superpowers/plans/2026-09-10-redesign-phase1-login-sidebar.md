# Redesign Phase 1: Login + App Shell Sidebar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the login screen and the app-shell sidebar to match the DevOps Effort Hub design spec (screens #1 and #2), replacing raw divs/inline hex with Astryx components and theme tokens. No auth logic, no routing, no role-gating logic changes.

**Architecture:** Both files are visual-only rewrites. `app/login/page.tsx` swaps its raw Tailwind-hex glow divs and ad-hoc `bg-[#090d14]` for `Card` + token-backed decorative blobs (the one sanctioned raw-div exception per spec). `components/layout/sidebar.tsx` gets a persona `SegmentedControl`, restyled `SideNavItem`s matching the design's active/inactive gradient states via theme-level `side-nav-item` overrides (Astryx doesn't expose a raw "gradient background" prop, so the active-state visual comes from a small CSS override scoped to `astryx-side-nav-item[data-selected]`, token-backed, not inline), an assistant-mode card, and a cleaned-up footer. Both consume the dark theme tokens already shipped in Phase 0 — no `app/theme.ts` edits in this plan.

**Tech Stack:** Next.js 15, `@astryxdesign/core` (Card, SegmentedControl, SideNav family, Badge, Avatar, IconButton, TextInput, Button, Divider), `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-09-10-devops-effort-hub-redesign-design.md` (screens #1–#2); pixel-level detail in `design/README.md` sections "1. Login" and "2. App shell".

## Global Constraints

- Dark-only, theme tokens already live (Phase 0 shipped): `--color-accent` `#3D7BFF`, `--color-background-body` `#08090C`, `--color-background-card` `#0D1014`, `--color-text-primary` `#E9ECF2`, `--color-text-secondary` `#8B93A6`, `--color-success` `#2FD98A`, `--color-warning` `#F5B93B`, `--color-error` `#FF5C6C`, `--radius-container` `13px`, `--radius-element` `9px`.
- No `style={{...}}`, no raw `<div>` for layout, no hardcoded/arbitrary hex or px Tailwind values (`bg-[#fff]`, `p-[13px]`) — component props or token-backed Tailwind utilities (`bg-surface`, `text-primary`, `rounded-lg`) only. Exception: the two decorative login-page ambient blobs (absolutely positioned, `pointer-events-none`, ignored by the self-check per the design spec's explicit carve-out).
- Icons from `lucide-react` at the sizes the design specifies; no inline SVGs.
- Auth logic (`signInWithGoogle`, `signInWithEmailPassword`, `useAuthStore`, redirect-on-session effect), role toggle logic (`updateUserRole`, `setRole`), and `DataManagerDialog` wiring are unchanged — only their surrounding markup/classes change.
- `pnpm lint` and `pnpm build` must pass before any commit in this plan.
- Vietnamese copy already in both files (e.g. "Đăng nhập", "Quản lý dữ liệu") stays as-is — the design doc's English copy ("Sign in", "Forgot password?") is a copy *reference* for layout/tone, not a literal string replacement, since this app's real copy is Vietnamese. Only add new copy where the design has an element with no current Vietnamese equivalent (e.g. the assistant-mode card, the "LEADER VIEW"/"DEVOPS VIEW" role label).
- **Out of scope for this plan:** the spec's floating chat button (`position:fixed`, bottom-right, visible on every screen except AI Chat) is part of the global app shell/layout, not `components/layout/sidebar.tsx` — it likely belongs in `app/layout.tsx` or an `AppShell` wrapper. Not built here; flag it for whichever later plan touches the root layout or the chat screen.

---

### Task 1: Restyle the login page

**Files:**
- Modify: `app/login/page.tsx` (full rewrite of the two `return` blocks, lines 90–226)

**Interfaces:**
- Consumes: `signInWithGoogle`, `signInWithEmailPassword`, `useAuthStore` (unchanged imports), theme tokens from Phase 0.
- Produces: no new exports — this is a leaf page component. Nothing downstream depends on its internals.

- [ ] **Step 1: Replace the loading/redirect screen markup**

In `app/login/page.tsx`, replace lines 90–115 (the `if (loading || user)` block) with:

```tsx
  if (loading || user) {
    return (
      <VStack
        gap={4}
        hAlign="center"
        vAlign="center"
        className="min-h-[100dvh] w-full relative overflow-hidden bg-body p-4"
      >
        <span
          aria-hidden
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "rgba(61,123,255,0.14)", filter: "blur(100px)" }}
        />
        <span
          aria-hidden
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "rgba(124,92,255,0.10)", filter: "blur(100px)" }}
        />

        <VStack gap={4} hAlign="center" className="w-full max-w-sm relative z-10 text-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-xl">
              <ShieldCheck size={28} strokeWidth={2.2} />
            </div>
            <div className="absolute -inset-1 rounded-xl border-2 border-accent/30 border-t-accent animate-spin" />
          </div>

          <VStack gap={1} hAlign="center">
            <Heading level={1}>DevOps Tracker</Heading>
            <HStack gap={2} vAlign="center" className="text-secondary text-sm mt-2">
              <Loader2 size={15} className="animate-spin text-accent shrink-0" />
              <span>{user ? "Đang chuyển đến Dashboard..." : "Đang kiểm tra phiên đăng nhập..."}</span>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    );
  }
```

Note: `style={{ background, filter }}` on the two ambient blob `<span>`s is the design spec's one sanctioned exception (decorative, non-layout, `pointer-events-none`) — do not flag this in the self-check step below. Astryx has no blur/radial-gradient token or prop, so this is the only way to render them; every other value in this file must be component props or token-backed utilities.

- [ ] **Step 2: Replace the main login card markup**

Replace lines 117–225 (the second `return` block) with:

```tsx
  return (
    <VStack
      gap={0}
      hAlign="center"
      vAlign="center"
      className="min-h-[100dvh] w-full relative overflow-hidden bg-body p-4"
    >
      <span
        aria-hidden
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full pointer-events-none"
        style={{ background: "rgba(61,123,255,0.14)", filter: "blur(100px)" }}
      />
      <span
        aria-hidden
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "rgba(124,92,255,0.10)", filter: "blur(100px)" }}
      />

      <div className="w-full max-w-sm relative z-10">
        <Card elevation="high" padding={2}>
          <VStack gap={5} hAlign="center" className="py-2">
            <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-lg">
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>

            <VStack gap={1} hAlign="center" className="text-center">
              <Heading level={1}>DevOps Tracker</Heading>
              <Text type="supporting">
                Theo dõi phân bổ nguồn lực, tải công việc và lịch trình của team DevOps.
              </Text>
            </VStack>

            {isAuthenticating && (
              <HStack
                gap={2}
                vAlign="center"
                className="w-full justify-center p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-xs text-accent"
              >
                <Loader2 size={14} className="animate-spin shrink-0" />
                <span>
                  {authAction === "google"
                    ? "Đang kết nối Google và đồng bộ tài khoản..."
                    : authAction === "email"
                    ? "Đang xác thực thông tin đăng nhập..."
                    : "Đang xử lý đăng nhập..."}
                </span>
              </HStack>
            )}

            <VStack gap={3} width="100%">
              <TextInput
                type="email"
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="ban@congty.com"
                isDisabled={isAuthenticating}
                width="100%"
              />
              <TextInput
                type="password"
                label="Mật khẩu"
                value={password}
                onChange={setPassword}
                placeholder="Nhập mật khẩu"
                isDisabled={isAuthenticating}
                onEnter={handleEmailPasswordSignIn}
                status={loginError ? { type: "error", message: loginError } : undefined}
                width="100%"
              />
            </VStack>

            <HStack width="100%" hAlign="end">
              <Text type="supporting" className="text-[12.5px]">
                Quên mật khẩu?
              </Text>
            </HStack>

            <VStack gap={3} width="100%">
              <Button
                label={authAction === "email" ? "Đang đăng nhập..." : "Đăng nhập"}
                icon={
                  authAction === "email" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <LogIn size={15} />
                  )
                }
                onClick={handleEmailPasswordSignIn}
                variant="primary"
                width="100%"
                isDisabled={isAuthenticating}
              />
            </VStack>

            <Divider label="hoặc" isFullBleed />

            <VStack gap={2} width="100%">
              <Button
                label={authAction === "google" ? "Đang kết nối Google..." : "Đăng nhập với Google"}
                icon={authAction === "google" ? <Loader2 size={15} className="animate-spin" /> : undefined}
                onClick={handleGoogleSignIn}
                variant="secondary"
                width="100%"
                isDisabled={isAuthenticating}
              />
            </VStack>

            <HStack gap={1.5} vAlign="center" className="text-[11px] text-tertiary pt-1">
              <ShieldCheck size={13} className="text-success" />
              <span>Bảo mật dữ liệu Firebase &amp; AI Grounding</span>
            </HStack>
          </VStack>
        </Card>
      </div>
    </VStack>
  );
}
```

- [ ] **Step 3: Update the icon import**

At the top of the file, replace the `lucide-react` import line to drop `Activity` (no longer used) and keep the rest:

```tsx
import { ShieldCheck, Loader2, LogIn } from "lucide-react";
```

- [ ] **Step 4: Self-check**

Re-read `app/login/page.tsx`. Confirm:
- No `style={{...}}` except the two ambient-blob `<span>` elements (sanctioned exception).
- No raw `<div>` used for layout — only `VStack`/`HStack`/`Card` do layout; the two blob `<span>`s and the icon-tile/spinner-ring wrapper `<div>`s are decorative, not layout containers, which matches the spec's carve-out (icon tiles are small fixed-size decorative boxes, not something Astryx has a primitive for).
- No hardcoded hex or arbitrary Tailwind values (`bg-[#090d14]` is gone, replaced by `bg-body`; `text-neutral-400`/`text-neutral-500` replaced by `text-secondary`/`text-tertiary`; `bg-sky-500/*` replaced by `bg-accent/*`/`text-accent`).
- If `bg-body`, `text-secondary`, `text-tertiary`, `bg-accent`, `text-accent`, `border-accent` aren't real Tailwind utilities in this project's `tailwind-theme.css`, run `pnpm exec astryx docs tokens` and `grep -n "bg-body\|text-secondary\|text-tertiary\|bg-accent" app -r` to find the actual utility names already used elsewhere in the codebase (e.g. `components/layout/sidebar.tsx` post-Task-2, or any already-migrated Phase-0 file) and substitute those instead of guessing.

- [ ] **Step 5: Manual verification**

Run: `pnpm dev`, open `http://localhost:3000/login` (sign out first if already authenticated).
Expected: dark background, centered card with two soft blue/violet glows behind it, email/password fields, "Đăng nhập" primary button, divider, Google secondary button. Compare side-by-side against `design/DevOps Effort Hub.dc.html` (open directly in a browser, it starts on the login screen) for spacing/color match.
Test the error path: submit with wrong credentials, confirm the red error message still renders under the password field via `TextInput`'s `status` prop.

- [ ] **Step 6: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: restyle login page to dark theme tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Add theme-level active-state override for SideNavItem

**Files:**
- Modify: `app/theme.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `astryx-side-nav-item[data-selected]` renders with the design's gradient background instead of Astryx's default selected-state fill. This is a `components` override block in `defineTheme`, additive to the existing `tokens` block — it does not change any token name Task 1 or later screen plans rely on.

The design's active nav item uses `linear-gradient(90deg,rgba(61,123,255,0.18),rgba(61,123,255,0.05))` with a `rgba(61,123,255,0.30)` border — Astryx's built-in selected state is a flat token color, not a gradient, so this needs a `components` override (documented, supported mechanism — not an inline style workaround).

- [ ] **Step 1: Confirm the override mechanism**

Run: `pnpm exec astryx component SideNav 2>&1 | grep -A 15 "^## Theming"`
Expected: confirms `astryx-side-nav-item` supports `data-selected` and is overridable via `components: { 'side-nav-item': { ... } }` in `defineTheme`.

- [ ] **Step 2: Add the override**

In `app/theme.ts`, add a `components` key to the `defineTheme({...})` call (sibling to `color`, `typography`, `radius`, `tokens`):

```typescript
  components: {
    "side-nav-item": {
      "selected:true": {
        background: "linear-gradient(90deg, rgba(61,123,255,0.18), rgba(61,123,255,0.05))",
        borderColor: "rgba(61,123,255,0.30)",
        color: "#EAF0FF",
      },
    },
  },
```

Place it after the closing `}` of the `tokens` block, before the final `});`.

- [ ] **Step 3: Rebuild the theme**

Run: `pnpm exec astryx theme build app/theme.ts --out app/theme.css`
Expected: `✓ app/theme.css`, `✓ app/devops-tracker.js`, `✓ app/devops-tracker.d.ts`, no errors.

- [ ] **Step 4: Commit**

```bash
git add app/theme.ts app/theme.css app/devops-tracker.js app/devops-tracker.d.ts
git commit -m "feat: add gradient active-state override for SideNavItem

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Restyle the sidebar — persona switch, nav, assistant card, footer

**Files:**
- Modify: `components/layout/sidebar.tsx` (full rewrite of the `return` block, lines 88–181; delete dead commented-out block, lines 103–127)

**Interfaces:**
- Consumes: `SegmentedControl`/`SegmentedControlItem` (new import), `Badge` (new import), the `side-nav-item` theme override from Task 2, existing `useAuthStore`, `updateUserRole`, `signOutUser`, `DataManagerDialog`.
- Produces: no new exports — `Sidebar` stays a default-less named export with the same signature `(): React.JSX.Element`. Nothing downstream depends on its internals beyond the existing render contract (it's mounted once, likely from `app/layout.tsx` or an `AppShell` wrapper — verify with `grep -rn "<Sidebar" app components` before editing, to confirm no prop contract to preserve).

- [ ] **Step 1: Verify the mount site takes no props**

Run: `grep -rn "<Sidebar" app components`
Expected: a single call site with no props passed (e.g. `<Sidebar />`). If it passes props, note them — this task must not break that call site's expectations, though none are expected based on the current signature `Sidebar(): React.JSX.Element`.

- [ ] **Step 2: Add imports**

At the top of `components/layout/sidebar.tsx`, add:

```tsx
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Badge } from "@astryxdesign/core/Badge";
```

Remove now-unused icon imports `Shield`, `Code2`, `ArrowLeftRight` (they were only used by the dead commented-out block being deleted in Step 4) — keep `Database` (used by the "Quản lý dữ liệu" item).

- [ ] **Step 3: Add an unread notification count to the links list**

The design shows a count pill on the Notifications nav item. This repo doesn't currently compute unread notification count in the sidebar. Check whether a store or hook already exposes it:

Run: `grep -rn "unread" store services types | grep -i notif`
Expected: either a `useNotificationsStore` selector or a service function returning unread count. If one exists, import and use it. If none exists, **skip the count pill entirely in this task** — do not invent new Firestore reads or state; the design spec's badge is a nice-to-have visual detail, not a logic requirement, and the "New logic" section of the design spec (docs/superpowers/specs/2026-09-10-devops-effort-hub-redesign-design.md) explicitly scopes new logic to gantt lane-packing only. This is a deliberate scope cut — note it in the commit message if skipped.

- [ ] **Step 4: Replace the return block**

Replace lines 88–181 with (assuming Step 3 found no existing unread-count source — adjust the `endContent` on the Notifications item if one was found):

```tsx
  return (
    <>
      <SideNav
        header={
          <SideNavHeading
            icon={<NavIcon icon={<Activity size={16} strokeWidth={2.25} />} />}
            heading="DevOps Tracker"
            headingHref="/dashboard"
          />
        }
        topContent={
          <VStack gap={2} className="px-2 pt-1">
            <SegmentedControl
              label="Chuyển vai trò"
              value={isLeader ? "leader" : "devops"}
              onChange={(value) => {
                if (switchingRole) return;
                void handleToggleRole();
              }}
              layout="fill"
              size="sm"
              isDisabled={switchingRole}
            >
              <SegmentedControlItem value="leader" label="Leader" />
              <SegmentedControlItem value="devops" label="DevOps" />
            </SegmentedControl>
            <Text type="supporting" className="text-[10px] uppercase tracking-wide text-tertiary">
              {isLeader ? "LEADER VIEW" : "DEVOPS VIEW"}
            </Text>
          </VStack>
        }
        footer={
          user && (
            <VStack gap={3}>
              <VStack
                gap={1}
                className="p-3 rounded-lg bg-accent/[0.07] border border-accent/25"
              >
                <Text weight="semibold" className="text-[13px] text-accent">
                  {isLeader ? "Ask / Command" : "Log Work"}
                </Text>
                <Text type="supporting" className="text-[11.5px]">
                  {isLeader
                    ? "Query the roster or propose task changes."
                    : "Describe what you finished; I file it."}
                </Text>
              </VStack>

              <HStack gap={2} vAlign="center" className="pt-2 border-t border-default">
                <Avatar name={user.displayName} src={user.photoURL ?? undefined} size="sm" tooltip={false} />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text weight="semibold" maxLines={1}>
                      {user.displayName}
                    </Text>
                    <Text type="supporting" maxLines={1} className="text-[11px]">
                      {user.email}
                    </Text>
                  </VStack>
                </StackItem>
                <IconButton
                  label="Sign out"
                  icon={<LogOut size={15} strokeWidth={2} />}
                  variant="ghost"
                  size="sm"
                  tooltip="Sign out"
                  onClick={() => signOutUser()}
                />
              </HStack>
            </VStack>
          )
        }
      >
        <SideNavSection title={isLeader ? "Quản lý (Leader View)" : "Không gian (DevOps View)"}>
          {links.map((link) => (
            <SideNavItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              isSelected={pathname.startsWith(link.href)}
            />
          ))}
        </SideNavSection>
        <SideNavSection title="Hệ thống">
          <SideNavItem
            label="Quản lý dữ liệu"
            icon={Database}
            onClick={() => setIsDataManagerOpen(true)}
          />
        </SideNavSection>
      </SideNav>

      <DataManagerDialog
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </>
  );
}
```

Note: `SegmentedControl.onChange` fires with the clicked value as a string; the handler ignores that value and just calls the existing `handleToggleRole()` toggle (unchanged logic — it flips between the two states regardless of which segment was clicked, since there are only two and the control is already showing the current one as selected). This preserves the existing `updateUserRole`/`setRole` call exactly as it was.

- [ ] **Step 5: Confirm the assistant-mode card design intent vs. persona toggle placement**

The design puts the persona switch in the sidebar **header** area (below the logo, above nav) and the assistant-mode card **below the nav, above the footer** (see design/README.md section 2). The code above places the persona switch in `topContent` (renders right after `header`, before nav — matches) and the assistant-mode card inside `footer` (renders after nav, at the bottom — this SideNav has no dedicated "below nav, above footer" slot per its prop table: `header` / `topContent` / `children` / `footer` / `footerIcons`). Putting the assistant card at the top of `footer` (as done above) is the closest available slot and preserves visual order (nav, then assistant card, then user identity) since `footer` renders after `children` (the nav sections). This is intentional, not a shortcut — no prop exists for a fourth slot.

- [ ] **Step 6: Self-check**

Re-read `components/layout/sidebar.tsx`. Confirm:
- No `style={{...}}`.
- No raw `<div>` for layout — replaced by `VStack`/`HStack`.
- No hardcoded hex (`bg-white/[0.03]`, `border-white/[0.07]` etc. — all gone, since the dead block was deleted; new markup uses `bg-accent/[0.07]`, `border-accent/25`, `border-default`, `text-tertiary`, `text-accent` token-backed utilities).
- Dead commented-out block (old lines 103–127) is gone.
- Confirm `bg-accent/[0.07]`, `border-accent/25`, `text-tertiary`, `border-default` exist as real utilities in `app/tailwind-theme.css` (generated by `astryx theme build`) — run `grep -n "text-tertiary\|border-default\|bg-accent" app/*.css` after Task 2's rebuild. If any don't exist, use the closest token-backed utility that does (check `pnpm exec astryx docs tokens` for the full list) rather than falling back to arbitrary hex.

- [ ] **Step 7: Manual verification**

Run: `pnpm dev`, log in, view the sidebar as both personas (toggle via the new segmented control).
Expected: segmented control shows Leader/DevOps, clicking the non-selected side flips persona (nav labels for the 6th item and the "Quản lý"/"Đội ngũ" labels change), active nav item shows the blue gradient background from Task 2's override, assistant-mode card shows correct copy per persona, footer shows avatar/name/email/sign-out unchanged.
Confirm sign-out still works and role toggle still persists (`updateUserRole` Firestore write) — check Firestore console or reload and confirm role stuck.

- [ ] **Step 8: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no new errors. Watch specifically for unused-import errors from the removed `Shield`/`Code2`/`ArrowLeftRight` icons.

- [ ] **Step 9: Commit**

```bash
git add components/layout/sidebar.tsx
git commit -m "feat: restyle sidebar with segmented persona switch and assistant card

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Phase 1 smoke check

**Files:** none (verification only).

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: confidence Phase 1 is safe to build subsequent screen plans on top of (dashboard, projects, members, etc. all render inside this sidebar).

- [ ] **Step 1: Lint and build the whole app**

Run: `pnpm lint`
Expected: no new errors beyond any pre-existing unrelated ones.

Run: `pnpm build`
Expected: production build succeeds.

- [ ] **Step 2: Manual click-through of every route**

Run: `pnpm dev`, visit `/login`, then log in and visit `/dashboard`, `/projects`, `/members`, `/tasks`, `/notifications`, `/chat`.
Expected: sidebar renders identically (new styling) on every route, no layout breaks, no console errors. Screens other than login/sidebar will still look like Phase-0 styling (unchanged) — that's expected, later plans cover them.

- [ ] **Step 3: Side-by-side comparison against the design**

Open `design/DevOps Effort Hub.dc.html` directly in a browser. Compare login screen and sidebar (both persona states) against the running app.
Expected: colors, spacing, radii, copy match closely per the design's "high fidelity" note. Note any deltas as follow-up items — do not block this plan's completion on pixel-perfect match if the deltas are minor (spacing off by 1-2px); do block on structural mismatches (wrong component used, missing element).

- [ ] **Step 4: Record any deltas**

If anything is structurally off, note it as a comment on this task for the next phase to pick up — do not silently leave it unaddressed.
