# AI Chat Tool-Calling Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 15-regex card router + 4-regex intent classifier in `app/api/ai/answer-query/route.ts` with Claude tool-calling, so routing is model reasoning instead of hand-tuned patterns, while keeping every existing UI card and mutation-confirm flow byte-identical.

**Architecture:** One Claude Messages API call per chat query, with a `tools` array scoped to the asker's role. Claude picks exactly one tool; the server dispatches to the existing pure card-builder functions (unchanged) or the existing task extractor/mutation-extractor pipelines (unchanged, called with `provider: "claude"`), or answers free text directly via a catch-all `answer_general_question` tool. The audit-trail branch stays regex-deterministic (no AI needed, no ambiguity to resolve).

**Tech Stack:** Next.js API route (TypeScript), Anthropic Messages API (`tools` param) via existing `claude.service.ts` proxy client, Firestore-backed services (unchanged), Vitest/Jest for tests (confirm actual runner in Task 1).

**Spec:** `docs/superpowers/specs/2026-09-23-ai-chat-tool-calling-design.md`

## Global Constraints

- Route `answer-query` always uses Claude for the tool-calling call — never NVIDIA — regardless of client `provider` override or `AI_PROVIDER` env (spec: "Model bắt buộc: Claude").
- `AiResponsePayload` shape in `types/chat.ts` must not change — frontend (`chat-box.tsx`, `chat-thread.tsx`) consumes it as-is.
- All 11 card-builder functions in `chat-card-builders.service.ts` are pure `(snapshot) => payload` and must not be modified.
- `extractTaskEntryFromInput` and `extractTaskMutationFromInput` must not be modified — mutation tools call them unchanged with `provider: "claude"`.
- `lib/intent.ts` must not be deleted or have exports removed — `chat-box.tsx` still imports `isTaskCreationIntent`, `isTaskUpdateIntent`, `isTaskDeleteIntent`, `looksLikeSelfLogEntry` for its own unrelated client-side routing decision.
- Devops askers must never receive `create_task`/`update_task`/`delete_task` in the `tools` array sent to Claude — permission enforced by tool *visibility*, not a post-hoc text check.
- Audit-trail query (`AUDIT_QUERY_PATTERN`) stays a regex check before the tool loop — not converted to a tool.
- System prompt must explicitly state the system has no recurring/fixed/template-task feature and instruct the model to say so plainly rather than guess, for any capability question outside the tool list.

## Review Focus

- A query naming a real member alongside a typo'd/nonexistent one (e.g. "task của Bảo và Xyz thế nào") — expect the real member's card plus a clear "not found" note for the fake one, not a silent drop or a fabricated card for the fake name.
- A devops asker phrasing a create/update/delete request in a way that doesn't match any visible tool (since those tools are hidden from them) — expect a clear "not authorized, ask a leader" message, not a generic non-answer or a leaked task-creation card.
- A capability question about a feature the system genuinely lacks (recurring tasks, notifications, bulk-assign, etc.) — expect an explicit "not supported" answer, never an invented "yes, here's how."
- Two-part questions in one message (e.g. "ai đang rảnh và có task nào trễ hạn không") — expect Claude to either pick the higher-priority tool and still address both in its `answer_general_question` fallback, or the plan must define which single tool wins; this is a real behavior change from the old code's explicit "answer all parts" system-prompt rule (mục 5, route.ts:74).
- The Claude proxy (`code.runagent.click`) silently stripping or mishandling the `tools` param (non-standard endpoint, unconfirmed to support tool-calling) — expect a hard, visible error in testing, not a silent fallback to plain text that masks a broken deployment.

---

## File Structure

- **Modify** `services/claude.service.ts` — add `callClaudeTool()` alongside existing `callClaudeText`/`callClaudeVision` (unchanged).
- **Create** `services/chat-tools.service.ts` — tool schema definitions (`CHAT_TOOLS` array), `buildToolsForRole(isLeader)`, and `runChatToolLoop()` orchestrator that dispatches a resolved tool call to the right existing service function and returns an `AiResponsePayload`.
- **Modify** `app/api/ai/answer-query/route.ts` — remove the 15 card regexes and the 3 intent-classifier calls; keep audit-trail regex branch, grounding snapshot build, `resolveIsLeader`, permission gate structure; replace the removed logic with one call to `runChatToolLoop()`.
- **Modify** `components/chat/chat-box.tsx:815` — fix the footer text that falsely claims "Claude 3.5 Sonnet" when NVIDIA could be serving the request elsewhere in the app (only this route is being forced to Claude; other AI paths still respect the provider toggle).
- **Test**: `services/chat-tools.service.test.ts` (new) — unit tests for `buildToolsForRole` and the dispatch logic with a mocked Claude client.

---

## Task 1: Verify the Claude proxy supports `tools`

**Files:**
- Test: none (manual verification script, not committed)

**Interfaces:**
- Consumes: `services/claude.service.ts` existing `claudeClient` (axios instance, baseURL `https://code.runagent.click/v1`), env vars `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`.
- Produces: a go/no-go decision recorded in this task's commit message before Task 2 proceeds. If the proxy does NOT support `tools`, STOP and escalate to the user before continuing any further task — the rest of this plan depends on it.

This is a spike, not a normal TDD task — there's no failing test to write, only a live call to make and read.

- [ ] **Step 1: Write and run a throwaway probe script**

Create a temporary file at `/tmp/probe-claude-tools.mjs` (not committed) with:

```js
import axios from "axios";

const client = axios.create({
  baseURL: "https://code.runagent.click/v1",
  headers: {
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

const res = await client.post("/messages", {
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-cc",
  system: "You are a test assistant.",
  messages: [{ role: "user", content: "What's the weather in Hanoi?" }],
  max_tokens: 256,
  temperature: 0.1,
  tools: [
    {
      name: "get_weather",
      description: "Get the current weather for a city",
      input_schema: {
        type: "object",
        properties: { city: { type: "string" } },
        required: ["city"],
      },
    },
  ],
});

console.log(JSON.stringify(res.data, null, 2));
```

Run it with the real env vars loaded from `.env.local`:

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
node --env-file=.env.local /tmp/probe-claude-tools.mjs
```

- [ ] **Step 2: Read the response and confirm tool-calling works**

Expected (go): `res.data.content` contains a block with `"type": "tool_use"`, `"name": "get_weather"`, and `"input": {"city": "Hanoi"}` (or similar) — `res.data.stop_reason` is `"tool_use"`.

No-go signs to check for: HTTP error, `content` containing only `"type": "text"` (proxy ignored the `tools` field and answered normally), or a 4xx complaining about an unrecognized `tools` field. If any no-go sign appears, STOP — report to the user that the proxy needs verification/fixing before this plan can continue, do not proceed to Task 2.

- [ ] **Step 3: Delete the probe script**

```bash
rm /tmp/probe-claude-tools.mjs
```

- [ ] **Step 4: Commit a note recording the result**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
git commit --allow-empty -m "$(cat <<'EOF'
chore: confirm Claude proxy supports tool-calling (spike, no code change)

Verified https://code.runagent.click/v1/messages accepts a `tools` param
and returns a tool_use content block per the standard Anthropic Messages
API shape. Clears the way for services/chat-tools.service.ts.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add `callClaudeTool` to claude.service.ts

**Files:**
- Modify: `services/claude.service.ts`
- Test: `services/claude.service.test.ts` (new — check if a test file/runner convention already exists first; if the repo has no test setup at all, see Task 1 for how tests are run here before writing this)

**Interfaces:**
- Consumes: existing `claudeClient` axios instance (`services/claude.service.ts:3-11`), existing `MODEL` const (`services/claude.service.ts:13`).
- Produces: `callClaudeTool(systemPrompt: string, userText: string, tools: ClaudeTool[]): Promise<ClaudeToolResult>` — used by Task 3's `chat-tools.service.ts`.

```ts
export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ClaudeToolResult {
  toolUse: { name: string; input: Record<string, unknown> } | null;
  text: string | null;
}
```

- [ ] **Step 1: Check for an existing test runner**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
cat package.json | grep -A2 '"scripts"' 
find . -maxdepth 2 -iname "vitest.config*" -o -iname "jest.config*" | grep -v node_modules
```

Use whatever runner this returns for all `Test:` steps in this plan (substitute the actual command for `<TEST_CMD>` below). If none exists, stop and ask the user how they want to run tests for this plan before continuing — do not silently add a new test framework.

- [ ] **Step 2: Write the failing test**

```ts
// services/claude.service.test.ts
import { describe, it, expect, vi } from "vitest"; // adjust import to the confirmed runner

vi.mock("axios", () => {
  const post = vi.fn();
  return {
    default: { create: () => ({ post }) },
    __mockPost: post,
  };
});

import { callClaudeTool } from "@/services/claude.service";

describe("callClaudeTool", () => {
  it("returns toolUse when Claude responds with a tool_use block", async () => {
    const axiosMod = await import("axios") as unknown as { __mockPost: ReturnType<typeof vi.fn> };
    axiosMod.__mockPost.mockResolvedValueOnce({
      data: {
        stop_reason: "tool_use",
        content: [
          { type: "tool_use", name: "list_free_members", input: {} },
        ],
      },
    });

    const result = await callClaudeTool("system prompt", "ai rảnh?", [
      {
        name: "list_free_members",
        description: "List members with no active tasks",
        input_schema: { type: "object", properties: {} },
      },
    ]);

    expect(result.toolUse).toEqual({ name: "list_free_members", input: {} });
    expect(result.text).toBeNull();
  });

  it("returns text when Claude responds without calling a tool", async () => {
    const axiosMod = await import("axios") as unknown as { __mockPost: ReturnType<typeof vi.fn> };
    axiosMod.__mockPost.mockResolvedValueOnce({
      data: {
        stop_reason: "end_turn",
        content: [{ type: "text", text: "Xin chào!" }],
      },
    });

    const result = await callClaudeTool("system prompt", "hi", []);

    expect(result.toolUse).toBeNull();
    expect(result.text).toBe("Xin chào!");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `<TEST_CMD> services/claude.service.test.ts`
Expected: FAIL with "callClaudeTool is not a function" or import error.

- [ ] **Step 4: Implement `callClaudeTool`**

Add to `services/claude.service.ts`, after the existing `callClaudeText` function (after line 31):

```ts
export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ClaudeToolResult {
  toolUse: { name: string; input: Record<string, unknown> } | null;
  text: string | null;
}

interface ClaudeToolMessageResponse {
  content: Array<
    | { type: "text"; text: string }
    | { type: "tool_use"; name: string; input: Record<string, unknown> }
  >;
  stop_reason: string;
}

export async function callClaudeTool(
  systemPrompt: string,
  userText: string,
  tools: ClaudeTool[]
): Promise<ClaudeToolResult> {
  const response = await claudeClient.post<ClaudeToolMessageResponse>("/messages", {
    model: MODEL,
    system: systemPrompt,
    messages: [{ role: "user", content: userText }],
    max_tokens: 1024,
    temperature: 0.1,
    tools,
  });

  const content = response.data?.content ?? [];
  const toolUseBlock = content.find((b): b is { type: "tool_use"; name: string; input: Record<string, unknown> } => b.type === "tool_use");
  const textBlock = content.find((b): b is { type: "text"; text: string } => b.type === "text");

  return {
    toolUse: toolUseBlock ? { name: toolUseBlock.name, input: toolUseBlock.input } : null,
    text: textBlock ? textBlock.text : null,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `<TEST_CMD> services/claude.service.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
git add services/claude.service.ts services/claude.service.test.ts
git commit -m "$(cat <<'EOF'
feat: add callClaudeTool for Anthropic tool-calling support

Extends claude.service.ts with a tool-calling variant alongside the
existing plain-text call, reusing the same client/model/proxy. Returns
either a resolved tool_use block or a plain text answer.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Define tool schemas and `buildToolsForRole`

**Files:**
- Create: `services/chat-tools.service.ts`
- Test: `services/chat-tools.service.test.ts`

**Interfaces:**
- Consumes: `ClaudeTool` type from `services/claude.service.ts` (Task 2).
- Produces: `CHAT_TOOLS: ClaudeTool[]` (all 14 tools — 10 card tools + `get_member_info` + 3 mutation tools), `buildToolsForRole(isLeader: boolean): ClaudeTool[]`. Both consumed by Task 4's `runChatToolLoop`.

Tool names (fixed, used verbatim by Task 4's dispatch switch):
`list_free_members`, `list_all_tasks`, `list_overloaded_members`, `get_effort_summary`, `get_workload_by_member`, `get_project_report`, `list_overdue_tasks`, `list_members`, `list_projects`, `get_help`, `get_member_info`, `create_task`, `update_task`, `delete_task`, `answer_general_question`.

- [ ] **Step 1: Write the failing test**

```ts
// services/chat-tools.service.test.ts
import { describe, it, expect } from "vitest"; // adjust to confirmed runner
import { CHAT_TOOLS, buildToolsForRole } from "@/services/chat-tools.service";

describe("buildToolsForRole", () => {
  it("includes all 15 tools for a leader", () => {
    const tools = buildToolsForRole(true);
    expect(tools.map((t) => t.name)).toEqual(expect.arrayContaining([
      "create_task", "update_task", "delete_task", "answer_general_question",
    ]));
    expect(tools.length).toBe(CHAT_TOOLS.length);
  });

  it("excludes create_task/update_task/delete_task for a devops asker", () => {
    const tools = buildToolsForRole(false);
    const names = tools.map((t) => t.name);
    expect(names).not.toContain("create_task");
    expect(names).not.toContain("update_task");
    expect(names).not.toContain("delete_task");
    expect(names).toContain("list_free_members");
    expect(names).toContain("answer_general_question");
  });

  it("every tool has a non-empty description and valid input_schema", () => {
    for (const tool of CHAT_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.input_schema.type).toBe("object");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `<TEST_CMD> services/chat-tools.service.test.ts`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `CHAT_TOOLS` and `buildToolsForRole`**

```ts
// services/chat-tools.service.ts
import type { ClaudeTool } from "@/services/claude.service";

const NO_ARGS_SCHEMA = { type: "object" as const, properties: {} };

const CARD_TOOLS: ClaudeTool[] = [
  {
    name: "list_free_members",
    description:
      "List DevOps engineers who currently have no active task and can take on new work. Use for questions like 'ai đang rảnh', 'ai có thể nhận thêm task', 'who's free'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "list_all_tasks",
    description:
      "List every in-progress and planned task across the whole team. Use for 'danh sách task', 'các task đang thực hiện', 'liệt kê công việc'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "list_overloaded_members",
    description:
      "List members whose effort exceeds the 480-minute daily capacity, with reassignment suggestions. Use for 'ai quá tải', 'ai vượt mức'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "get_effort_summary",
    description:
      "Team-wide effort/capacity totals and per-member percentage breakdown. Use for 'tổng effort', 'phân bổ effort toàn team'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "get_workload_by_member",
    description:
      "Per-engineer workload/bandwidth status (free/busy/overload) for every member. Use for 'tình trạng tải', 'băng thông', 'mức độ bận rộn'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "get_project_report",
    description:
      "Effort allocation report broken down by project. Use for 'báo cáo dự án', 'phân bổ effort theo dự án'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "list_overdue_tasks",
    description:
      "List tasks that are overdue or nearing their deadline. Use for 'task trễ hạn', 'deadline gần đến', 'task quá hạn'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "list_members",
    description:
      "Full team roster with role, effort, and skills for every member. Use for 'danh sách thành viên', 'toàn bộ nhân sự'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "list_projects",
    description:
      "List every project with its effort totals and task counts. Use for 'danh sách dự án', 'các dự án hiện có'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "get_help",
    description:
      "Show the slash-command usage guide. Use for 'hướng dẫn', 'help', 'cách dùng'.",
    input_schema: NO_ARGS_SCHEMA,
  },
  {
    name: "get_member_info",
    description:
      "Detailed profile and task breakdown for ONE specific named member — their workload status, active tasks, planned tasks, and projects. Use whenever the question names or refers to a specific person (e.g. 'Bảo đang làm gì?', 'tình hình của Nam', '/status Linh'). If the name doesn't match anyone on the team, say so and list the real team members instead of guessing.",
    input_schema: {
      type: "object",
      properties: {
        memberName: {
          type: "string",
          description: "The member's name as mentioned in the question, honorifics stripped (e.g. 'Bảo' not 'anh Bảo').",
        },
      },
      required: ["memberName"],
    },
  },
];

const MUTATION_TOOLS: ClaudeTool[] = [
  {
    name: "create_task",
    description:
      "Create and propose a new task assignment for review (not saved until the user confirms the card). Use ONLY when the leader gives an imperative instruction to assign/create/log NEW work for someone (e.g. 'giao task X cho Nam', 'tạo task Y'). Do NOT use this for questions about whether a capability exists — e.g. asking whether recurring/fixed tasks can be assigned is a capability question, not a creation command; use answer_general_question for that instead.",
    input_schema: {
      type: "object",
      properties: {
        rawText: {
          type: "string",
          description: "The user's original request text, verbatim, describing the task to create.",
        },
      },
      required: ["rawText"],
    },
  },
  {
    name: "update_task",
    description:
      "Propose a change to an existing task (status, dates, assignee, effort, etc.) for review. Use for explicit edit instructions like 'sửa task X sang trạng thái done', 'đổi người phụ trách task Y sang Nam'.",
    input_schema: {
      type: "object",
      properties: {
        rawText: {
          type: "string",
          description: "The user's original request text, verbatim, describing which task and what to change.",
        },
      },
      required: ["rawText"],
    },
  },
  {
    name: "delete_task",
    description:
      "Propose deleting an existing task for review. Use for explicit delete instructions like 'xóa task X của Nam'.",
    input_schema: {
      type: "object",
      properties: {
        rawText: {
          type: "string",
          description: "The user's original request text, verbatim, describing which task to delete.",
        },
      },
      required: ["rawText"],
    },
  },
];

const GENERAL_TOOL: ClaudeTool = {
  name: "answer_general_question",
  description:
    "Answer directly in natural language using the attached real-time team data. Use this whenever the question doesn't match any of the other tools — including questions about whether the system supports a capability it doesn't have (e.g. recurring/fixed/scheduled tasks are NOT supported — say so plainly, don't guess), general questions combining multiple data points, or anything conversational.",
  input_schema: {
    type: "object",
    properties: {
      answer: {
        type: "string",
        description: "The complete natural-language answer in Vietnamese, following the system prompt's formatting rules.",
      },
    },
    required: ["answer"],
  },
};

export const CHAT_TOOLS: ClaudeTool[] = [...CARD_TOOLS, ...MUTATION_TOOLS, GENERAL_TOOL];

export function buildToolsForRole(isLeader: boolean): ClaudeTool[] {
  if (isLeader) return CHAT_TOOLS;
  return [...CARD_TOOLS, GENERAL_TOOL];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `<TEST_CMD> services/chat-tools.service.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
git add services/chat-tools.service.ts services/chat-tools.service.test.ts
git commit -m "$(cat <<'EOF'
feat: define chat tool schemas and role-scoped tool visibility

14 tools replace the 15 regex card patterns and 4 regex intent
classifiers from answer-query/route.ts. Devops askers never see the
create/update/delete tools in their tools array, so the model can't
call them — permission enforced by visibility, not a post-hoc check.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Implement `runChatToolLoop` dispatcher

**Files:**
- Modify: `services/chat-tools.service.ts`
- Test: `services/chat-tools.service.test.ts`

**Interfaces:**
- Consumes:
  - `callClaudeTool` from `services/claude.service.ts` (Task 2)
  - `buildToolsForRole`, `CHAT_TOOLS` from this file (Task 3)
  - `buildFreeCardAvailability`, `buildTaskListPayload`, `buildOverloadPayload`, `buildEffortPayload`, `buildLoadPayload`, `buildReportPayload`, `buildOverduePayload`, `buildMembersListPayload`, `buildProjectsListPayload`, `buildHelpPayload`, `buildMemberInfoPayload`, `renderMemberList` from `services/chat-card-builders.service.ts` (all existing, unchanged signatures — see file read at plan-writing time)
  - `findMemberByName` from `services/members.service.ts`
  - `extractTaskEntryFromInput` from `services/task-extractor.service.ts`
  - `extractTaskMutationFromInput` from `services/task-mutation-extractor.service.ts`
  - `findBestSuitableMember` from `services/members.service.ts`
  - `GroundingSnapshot` type from `services/grounding.service.ts`
  - `Member` type from `types/member.ts`
  - `AiResponsePayload`, `ClarificationRequest` types from `types/chat.ts`
- Produces: `runChatToolLoop(params): Promise<AiResponsePayload>` — the single function Task 5's route.ts calls.

```ts
interface RunChatToolLoopParams {
  systemPrompt: string;
  userQuery: string;
  effectiveQuery: string;
  snapshot: GroundingSnapshot;
  allMembers: Member[];
  isLeader: boolean;
  currentAskerRole: "leader" | "devops";
  currentMemberId: string;
}
```

- [ ] **Step 1: Write the failing tests**

```ts
// append to services/chat-tools.service.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest"; // adjust to confirmed runner

vi.mock("@/services/claude.service", async () => {
  const actual = await vi.importActual("@/services/claude.service");
  return { ...actual, callClaudeTool: vi.fn() };
});

import { callClaudeTool } from "@/services/claude.service";
import { runChatToolLoop } from "@/services/chat-tools.service";
import type { GroundingSnapshot } from "@/services/grounding.service";

const emptySnapshot: GroundingSnapshot = {
  members: [],
  projects: [],
  overdueTasks: [],
  freeMembers: [],
  busyMembers: [],
  overloadedMembers: [],
  projectProgress: [],
};

describe("runChatToolLoop", () => {
  beforeEach(() => {
    vi.mocked(callClaudeTool).mockReset();
  });

  it("dispatches list_free_members to buildFreeCardAvailability and returns memberAvailability payload", async () => {
    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: { name: "list_free_members", input: {} },
      text: null,
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "ai đang rảnh?",
      effectiveQuery: "ai đang rảnh?",
      snapshot: emptySnapshot,
      allMembers: [],
      isLeader: true,
      currentAskerRole: "leader",
      currentMemberId: "leader",
    });

    expect(result).toHaveProperty("memberAvailability");
  });

  it("dispatches answer_general_question to a plain answer payload", async () => {
    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: { name: "answer_general_question", input: { answer: "Xin chào!" } },
      text: null,
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "hi",
      effectiveQuery: "hi",
      snapshot: emptySnapshot,
      allMembers: [],
      isLeader: true,
      currentAskerRole: "leader",
      currentMemberId: "leader",
    });

    expect(result).toEqual({ answer: "Xin chào!" });
  });

  it("falls back to raw text when Claude answers without calling any tool", async () => {
    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: null,
      text: "Câu trả lời trực tiếp không qua tool.",
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "hi",
      effectiveQuery: "hi",
      snapshot: emptySnapshot,
      allMembers: [],
      isLeader: true,
      currentAskerRole: "leader",
      currentMemberId: "leader",
    });

    expect(result).toEqual({ answer: "Câu trả lời trực tiếp không qua tool." });
  });

  it("routes a multi-part question through answer_general_question, not a single card tool", async () => {
    // The system prompt (route.ts item 8) instructs Claude to prefer answer_general_question
    // over picking one card tool and silently dropping the rest of a multi-part question — this
    // test only pins the dispatcher's handling of that tool choice once Claude makes it; it
    // cannot verify Claude's own tool-selection judgment (that needs the live proxy, see Task 1).
    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: {
        name: "answer_general_question",
        input: { answer: "🟢 Đang rảnh: Nam, Linh.\n\n🚨 Task trễ hạn: Không có task nào trễ hạn." },
      },
      text: null,
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "ai đang rảnh và có task nào trễ hạn không",
      effectiveQuery: "ai đang rảnh và có task nào trễ hạn không",
      snapshot: emptySnapshot,
      allMembers: [],
      isLeader: true,
      currentAskerRole: "leader",
      currentMemberId: "leader",
    });

    expect(result).toEqual({
      answer: "🟢 Đang rảnh: Nam, Linh.\n\n🚨 Task trễ hạn: Không có task nào trễ hạn.",
    });
  });

  it("returns a not-found message with member list when get_member_info names an unknown person", async () => {
    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: { name: "get_member_info", input: { memberName: "Xyz Không Tồn Tại" } },
      text: null,
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "Xyz Không Tồn Tại đang làm gì?",
      effectiveQuery: "Xyz Không Tồn Tại đang làm gì?",
      snapshot: emptySnapshot,
      allMembers: [],
      isLeader: true,
      currentAskerRole: "leader",
      currentMemberId: "leader",
    });

    expect(result).toHaveProperty("answer");
    expect((result as { answer: string }).answer).toContain("Không tìm thấy");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `<TEST_CMD> services/chat-tools.service.test.ts`
Expected: FAIL with "runChatToolLoop is not a function"

- [ ] **Step 3: Implement `runChatToolLoop`**

Append to `services/chat-tools.service.ts`:

```ts
import { callClaudeTool } from "@/services/claude.service";
import type { GroundingSnapshot } from "@/services/grounding.service";
import { findMemberByName, findBestSuitableMember } from "@/services/members.service";
import { extractTaskEntryFromInput } from "@/services/task-extractor.service";
import { extractTaskMutationFromInput } from "@/services/task-mutation-extractor.service";
import { formatEffortDuration } from "@/lib/effort";
import type { Member } from "@/types/member";
import type { AiResponsePayload, ClarificationRequest } from "@/types/chat";
import {
  renderMemberList,
  renderClarificationAnswer,
  buildTaskListPayload,
  buildFreeCardAvailability,
  buildOverloadPayload,
  buildEffortPayload,
  buildLoadPayload,
  buildReportPayload,
  buildOverduePayload,
  buildMembersListPayload,
  buildProjectsListPayload,
  buildHelpPayload,
  buildMemberInfoPayload,
} from "@/services/chat-card-builders.service";

interface RunChatToolLoopParams {
  systemPrompt: string;
  userQuery: string;
  effectiveQuery: string;
  snapshot: GroundingSnapshot;
  allMembers: Member[];
  isLeader: boolean;
  currentAskerRole: "leader" | "devops";
  currentMemberId: string;
}

export async function runChatToolLoop(params: RunChatToolLoopParams): Promise<AiResponsePayload> {
  const { systemPrompt, effectiveQuery, snapshot, allMembers, isLeader, currentAskerRole, currentMemberId } = params;
  const tools = buildToolsForRole(isLeader);

  const { toolUse, text } = await callClaudeTool(systemPrompt, effectiveQuery, tools);

  if (!toolUse) {
    return { answer: text ?? "Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể diễn đạt lại không?" };
  }

  switch (toolUse.name) {
    case "list_free_members": {
      const memberAvailability = buildFreeCardAvailability(snapshot);
      const freeCount = snapshot.freeMembers.length;
      const answer =
        freeCount > 0
          ? `🟢 Hiện có **${freeCount} thành viên** đang rảnh và có thể nhận thêm task: ${snapshot.freeMembers.join(", ")}.`
          : "⚠️ Hiện không có thành viên nào đang rảnh — toàn bộ đội ngũ đang bận hoặc quá tải.";
      return { answer, memberAvailability };
    }

    case "list_all_tasks": {
      const taskList = buildTaskListPayload(snapshot);
      return { answer: `📋 Danh sách ${taskList.tasks.length} task đang thực hiện và kế hoạch.`, taskList };
    }

    case "list_overloaded_members": {
      const overloadData = buildOverloadPayload(snapshot);
      return {
        answer: `⚠️ Cảnh báo quá tải: Phát hiện ${overloadData.overloadedMembers.length} thành viên vượt ngưỡng an toàn.`,
        overloadData,
      };
    }

    case "get_effort_summary": {
      const effortData = buildEffortPayload(snapshot);
      return {
        answer: `📊 Tổng hợp phân bổ Effort & thời lượng toàn đội ngũ hôm nay: ${effortData.totalEffortMinutes}m / ${effortData.totalCapacityMinutes}m (${effortData.overallPercentage}%).`,
        effortData,
      };
    }

    case "get_workload_by_member": {
      const loadData = buildLoadPayload(snapshot);
      return { answer: `⚡ Tình trạng tải công việc và băng thông (Bandwidth) từng kỹ sư.`, loadData };
    }

    case "get_project_report": {
      const reportData = buildReportPayload(snapshot);
      return { answer: `📑 Báo cáo phân bổ Effort theo từng dự án (${reportData.projects.length} dự án).`, reportData };
    }

    case "list_overdue_tasks": {
      const overdueData = buildOverduePayload(snapshot);
      return {
        answer: `🚨 Phát hiện ${overdueData.tasks.length} task đang bị trễ hạn hoặc cận kề deadline.`,
        overdueData,
      };
    }

    case "list_members": {
      const membersListData = buildMembersListPayload(snapshot);
      return {
        answer: `👥 Danh sách ${membersListData.members.length} thành viên đội ngũ DevOps & SRE.`,
        membersListData,
      };
    }

    case "list_projects": {
      const projectsListData = buildProjectsListPayload(snapshot);
      return { answer: `Danh sách các dự án hiện có (${projectsListData.projects.length} dự án).`, projectsListData };
    }

    case "get_help": {
      const helpData = buildHelpPayload();
      return { answer: `💡 Hướng dẫn sử dụng DevOps AI Assistant & Hệ thống Slash Commands.`, helpData };
    }

    case "get_member_info": {
      const rawTarget = (toolUse.input.memberName as string) || "";
      const matchedMember = findMemberByName(allMembers, rawTarget);
      if (!matchedMember) {
        const answer = `⚠️ **Không tìm thấy thành viên: "${rawTarget}"**\n\nNhân sự **"${rawTarget}"** không tồn tại trong danh sách đội ngũ của hệ thống.\n\n📋 **Danh sách thành viên hiện có trong team:**\n${renderMemberList(allMembers, snapshot.members, currentAskerRole)}\n\n💡 *Vui lòng kiểm tra lại chính tả hoặc chọn một thành viên trong danh sách trên để tra cứu.*`;
        return { answer };
      }

      if (currentAskerRole === "devops" && matchedMember.id !== currentMemberId) {
        return {
          answer:
            "🔒 Bạn chỉ có thể tra cứu thông tin của chính mình qua Chat AI. Vui lòng liên hệ Leader nếu cần xem thông tin của thành viên khác.",
        };
      }

      const memberInfoData = buildMemberInfoPayload(matchedMember, snapshot);
      return { answer: `Hồ sơ năng lực & Task của ${matchedMember.name}`, memberInfoData };
    }

    case "create_task": {
      const rawText = (toolUse.input.rawText as string) || effectiveQuery;
      const mentionsProject = /(?:dự án|du an|project)\s+\S/i.test(rawText);
      const mentionsEffort = /(\d+(?:[.,]\d+)?\s*(?:phút|p\b|tiếng|giờ|h\b|ngày|%))/i.test(rawText);

      if (!mentionsProject) {
        const clarification: ClarificationRequest = { reason: "missing_field", missingFields: ["projectName"] };
        return { answer: "Task này thuộc **dự án nào**? Vui lòng cho biết tên dự án trước khi tôi soạn đề xuất.", clarification };
      }
      if (!mentionsEffort) {
        const clarification: ClarificationRequest = { reason: "missing_field", missingFields: ["effortMinutes"] };
        return {
          answer: "Bạn dự kiến **effort** (thời lượng) cho task này là bao nhiêu? Vui lòng cho biết cụ thể (vd: 2 tiếng, 4 tiếng, 1 ngày).",
          clarification,
        };
      }

      const result = await extractTaskEntryFromInput(rawText, null, "claude");
      if (!result?.entry) {
        return { answer: "Xin lỗi, tôi không trích xuất được thông tin task từ yêu cầu này. Vui lòng thử diễn đạt lại rõ hơn." };
      }

      const { entry, notificationMessage } = result;
      if (entry.assigneeName) {
        const matchedAssignee = findMemberByName(allMembers, entry.assigneeName);
        if (matchedAssignee?.role === "leader") {
          const suggestion = findBestSuitableMember(allMembers, entry.title, entry.projectName);
          const clarification: ClarificationRequest = {
            reason: "target_is_leader",
            candidates: suggestion ? [{ id: suggestion.id, label: suggestion.name }] : [],
          };
          return { answer: renderClarificationAnswer(clarification), clarification };
        }
      }

      const assigneeText = entry.assigneeName ? `cho **${entry.assigneeName}**` : "";
      const projectText = entry.projectName ? `thuộc dự án **${entry.projectName}**` : "";
      const effortText = entry.effortMinutes ? ` (${formatEffortDuration(entry.effortMinutes)} Effort)` : "";
      let answer = `Tôi đã soạn thảo thông tin giao task ${assigneeText} ${projectText}${effortText}.\n\nVui lòng kiểm tra thẻ công việc bên dưới và bấm **Xác nhận** để chính thức lưu task vào hệ thống.`;
      if (notificationMessage) {
        answer = `${notificationMessage}\n\n---\n${answer}`;
      }
      return { answer, entry };
    }

    case "update_task":
    case "delete_task": {
      const action = toolUse.name === "update_task" ? "update" : "delete";
      const rawText = (toolUse.input.rawText as string) || effectiveQuery;
      const result = await extractTaskMutationFromInput(rawText, action, "claude");

      if (result.clarification) {
        return { answer: renderClarificationAnswer(result.clarification), clarification: result.clarification };
      }
      if (result.proposal) {
        const answer =
          action === "delete"
            ? `Đang định **xóa vĩnh viễn** task **${result.proposal.taskSnapshot.title}**. Vui lòng kiểm tra kỹ thông tin bên dưới và bấm **Xác nhận** nếu chắc chắn.`
            : `Đang định **sửa** task **${result.proposal.taskSnapshot.title}**. Vui lòng kiểm tra thay đổi bên dưới và bấm **Xác nhận** để lưu.`;
        return { answer, proposal: result.proposal };
      }
      return { answer: "Xin lỗi, tôi không xác định được task nào để xử lý. Vui lòng nêu rõ hơn tên task hoặc người phụ trách." };
    }

    case "answer_general_question":
    default: {
      const answer = (toolUse.input.answer as string) || text || "Xin lỗi, tôi chưa hiểu rõ câu hỏi.";
      return { answer };
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `<TEST_CMD> services/chat-tools.service.test.ts`
Expected: PASS (8 tests total)

- [ ] **Step 5: Commit**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
git add services/chat-tools.service.ts services/chat-tools.service.test.ts
git commit -m "$(cat <<'EOF'
feat: implement runChatToolLoop dispatcher

Dispatches a resolved Claude tool_use to the existing card-builder
functions or task extractor/mutation-extractor pipelines, unchanged.
Mutation tools pass rawText straight through to
extractTaskEntryFromInput/extractTaskMutationFromInput so the
Firestore-backed task-identity resolution and hallucination
cross-validation in those functions keep working exactly as before —
only the routing decision (which tool fires) moved to Claude.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Wire `runChatToolLoop` into route.ts, remove regex routing

**Files:**
- Modify: `app/api/ai/answer-query/route.ts`
- Test: manual verification (this route has no existing unit test harness — confirm in Task 1's runner check; if integration tests exist for API routes, add one here following that convention instead of skipping)

**Interfaces:**
- Consumes: `runChatToolLoop` from `services/chat-tools.service.ts` (Task 4).
- Produces: the route's HTTP contract is unchanged — same request/response shape as before.

- [ ] **Step 1: Update the system prompt with the capability-limits rule**

In `app/api/ai/answer-query/route.ts`, find the `SYSTEM_PROMPT` template literal (lines 32-75) and add a new numbered section after item 5 (before the closing backtick on line 75):

```ts
// Insert right before the closing backtick of SYSTEM_PROMPT, after item 5's last line:
6. GIỚI HẠN TÍNH NĂNG HỆ THỐNG: Hệ thống này CHỈ hỗ trợ giao task một lần (one-off) với startDate/endDate cụ thể. KHÔNG có tính năng task lặp lại/định kỳ/cố định theo lịch (recurring/template task). Nếu người dùng hỏi về khả năng này hoặc bất kỳ tính năng nào không nằm trong danh sách tool được cấp, trả lời rõ ràng là tính năng chưa được hỗ trợ, KHÔNG suy đoán hoặc trả lời như thể tính năng đó tồn tại.
7. QUYỀN HẠN: Nếu người dùng không có quyền tạo/sửa/xóa task (không thấy các tool create_task/update_task/delete_task trong danh sách) nhưng câu hỏi rõ ràng là muốn tạo/sửa/xóa task, trả lời rõ: hành động này chỉ dành cho Leader, dùng tool answer_general_question để trả lời.
8. CÂU HỎI NHIỀU Ý: Bạn chỉ được gọi ĐÚNG MỘT tool cho mỗi câu hỏi. Nếu câu hỏi có nhiều ý thuộc nhiều tool khác nhau (vd "ai đang rảnh và có task nào trễ hạn không" — vừa khớp list_free_members vừa khớp list_overdue_tasks), KHÔNG chọn đại 1 tool rồi bỏ qua ý còn lại — thay vào đó dùng tool answer_general_question và trả lời ĐẦY ĐỦ tất cả các ý trong cùng một câu trả lời bằng văn bản, dựa trên dữ liệu thời gian thực đính kèm.`;
```

(Note: item 7 replaces the removed `route.ts:287-291` hard-coded permission-denial branch — see Step 3.)

- [ ] **Step 2: Add the import for `runChatToolLoop`**

Replace the import block at the top of `route.ts` (lines 1-30). Remove these now-unused imports:
- `extractTaskEntryFromInput` (line 5)
- `extractTaskMutationFromInput` (line 6)
- `findMemberByName, findBestSuitableMember` (line 7) — still need `getMembers` from that line
- `isTaskCreationIntent, isTaskUpdateIntent, isTaskDeleteIntent` (line 9)
- `formatEffortDuration` (line 10)
- `deriveSlashCommandFromText` (line 11)
- the whole `chat-card-builders.service` named-import block (lines 13-28) EXCEPT `renderTaskChangeAudit` (still used by the audit branch) and `renderMemberList` (still used by the member-not-found path, though that path now lives inside `chat-tools.service.ts` — check if `route.ts` still calls `renderMemberList` directly anywhere else after Step 3; if not, drop it too)

Resulting import block:

```ts
import { NextRequest, NextResponse } from "next/server";
import { buildGroundingSnapshot } from "@/services/grounding.service";
import { createChatLog } from "@/services/chatLogs.service";
import { getMembers } from "@/services/members.service";
import { getAllTaskChangeLogs, getTaskChangeLogsByActor } from "@/services/taskChangeLogs.service";
import { runChatToolLoop } from "@/services/chat-tools.service";
import { renderTaskChangeAudit } from "@/services/chat-card-builders.service";
import type { AiResponsePayload } from "@/types/chat";
import type { Member } from "@/types/member";
```

- [ ] **Step 3: Remove the regex constants and helper functions no longer used**

Delete from `route.ts`:
- `MEMBER_QUERY_PATTERN` (line 78)
- `GENERAL_TEAM_KEYWORDS`, `isGeneralTeamKeyword` (lines 80-94)
- `cleanMemberNameTarget` (lines 96-102)
- `FIRST_PERSON_PATTERN`, `detectSelfQueryTarget` (lines 104-117) — **CAUTION**: before deleting, grep for other callers; per Global Constraints this was route.ts-local, confirmed by earlier grep in the design phase, but re-verify with `grep -rn "detectSelfQueryTarget" --include="*.ts" --include="*.tsx" .` before deleting, since Claude now sees the raw query without pronoun substitution — the new `get_member_info` tool relies on Claude itself resolving "tôi/mình" contextually via the system prompt (see Step 4 addition below) instead of a regex preprocessing step.
- `normalizeForNameMatch` (lines 123-132)
- `detectMemberQueryTarget` (lines 143-187)
- `FREE_QUERY_PATTERN` through `HELP_QUERY_PATTERN` (lines 212-231)

Keep: `resolveIsLeader` (lines 194-203), `AUDIT_QUERY_PATTERN` (lines 205-206).

- [ ] **Step 4: Add a first-person context line to the system prompt call site**

Since `detectSelfQueryTarget`'s pronoun-to-name substitution is removed, add asker identity directly to the prompt so Claude can resolve "tôi/mình" itself. Find where `SYSTEM_PROMPT` is currently concatenated with the snapshot (old line 504) and change the concatenation to include the asker's name:

```ts
const askerMember = currentAskerRole === "devops" ? allMembers.find((m) => m.id === currentMemberId) : null;
const askerContextLine = askerMember
  ? `\n\nNGƯỜI ĐANG HỎI: ${askerMember.name} (khi câu hỏi dùng "tôi"/"mình"/"của tôi", đó là chỉ chính người này).`
  : "";
const fullSystemPrompt = `${SYSTEM_PROMPT}${askerContextLine}\n\nDỮ LIỆU THỜI GIAN THỰC (REALTIME DATABASE):\n${JSON.stringify(snapshot, null, 2)}`;
```

- [ ] **Step 5: Rewrite the POST handler body**

Replace everything from the old `const isDeleteIntent = ...` (line 281) through the end of the `try` block (line 509) with:

```ts
  try {
    const allMembersForRoleCheck = await getMembers();
    const isLeader = await resolveIsLeader(currentMode, currentMemberId, allMembersForRoleCheck);

    const [snapshot, allMembers] = [
      await buildGroundingSnapshot(currentAskerRole === "devops" ? currentMemberId : undefined),
      allMembersForRoleCheck,
    ];

    // Audit trail stays regex-deterministic: it's an exact 1:1 lookup into taskChangeLogs, no
    // natural-language ambiguity to resolve, so routing it through the AI would cost a call for
    // something already 100% certain.
    if (AUDIT_QUERY_PATTERN.test(userQuery)) {
      const logs =
        currentMode === "leader" && currentMemberId === "leader"
          ? await getAllTaskChangeLogs()
          : await getTaskChangeLogsByActor(currentMemberId || "leader");
      const answer = renderTaskChangeAudit(logs);
      return logAndRespond({ answer }, true);
    }

    const askerMember: Member | undefined =
      currentAskerRole === "devops" ? allMembers.find((m) => m.id === currentMemberId) : undefined;
    const askerContextLine = askerMember
      ? `\n\nNGƯỜI ĐANG HỎI: ${askerMember.name} (khi câu hỏi dùng "tôi"/"mình"/"của tôi", đó là chỉ chính người này).`
      : "";
    const fullSystemPrompt = `${SYSTEM_PROMPT}${askerContextLine}\n\nDỮ LIỆU THỜI GIAN THỰC (REALTIME DATABASE):\n${JSON.stringify(snapshot, null, 2)}`;

    const responsePayload = await runChatToolLoop({
      systemPrompt: fullSystemPrompt,
      userQuery,
      effectiveQuery: userQuery,
      snapshot,
      allMembers,
      isLeader,
      currentAskerRole,
      currentMemberId,
    });

    const confirmed = !("clarification" in responsePayload) && !("entry" in responsePayload) && !("proposal" in responsePayload);
    return logAndRespond(responsePayload, confirmed);
  } catch (error) {
    console.error("answer-query error:", error);
    return NextResponse.json({ error: "Failed to reach AI service" }, { status: 502 });
  }
}
```

Note: the `confirmed` flag logic mirrors the old code's per-branch `true`/`false` values — card/answer responses were always `logAndRespond(x, true)`, clarification/entry/proposal responses were always `logAndRespond(x, false)`. The derived boolean above reproduces that.

Also delete the now-unused `provider` extraction from the request body destructuring if nothing else in the file reads it — check first with `grep -n "provider" app/api/ai/answer-query/route.ts` since `logAndRespond`/request parsing may still reference it; if the client still sends `provider` for a future use, keep the destructuring but note it's unused by this route now (mutation tools force `"claude"` internally per Task 4).

- [ ] **Step 6: Type-check the file**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
npx tsc --noEmit
```

Expected: no errors in `app/api/ai/answer-query/route.ts` or `services/chat-tools.service.ts`. Fix any unused-import or type-mismatch errors surfaced here before proceeding.

- [ ] **Step 7: Manual smoke test against a local dev server**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
npm run dev &
sleep 5
curl -s -X POST http://localhost:3000/api/ai/answer-query \
  -H "Content-Type: application/json" \
  -d '{"question":"bạn có thể phân bổ task cố định cho member theo dự án được không","mode":"leader","askerRole":"leader","memberId":"leader","threadId":"smoke-test-1"}' | head -c 2000
kill %1
```

Expected: JSON response with an `answer` field that explicitly says this capability isn't supported (not a fabricated "yes"). If the dev server needs Firestore credentials not available in this environment, note that in the commit and defer full verification to the user — but the type-check in Step 6 and the unit tests in Tasks 2-4 must still pass.

- [ ] **Step 8: Commit**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
git add app/api/ai/answer-query/route.ts
git commit -m "$(cat <<'EOF'
refactor: route answer-query through Claude tool-calling

Removes the 15 card-trigger regexes and 3 intent-classifier calls from
the POST handler, replacing them with a single runChatToolLoop call.
Audit-trail lookup stays regex-deterministic (no ambiguity to resolve).
Pronoun resolution ("tôi"/"mình") moves from a regex preprocessing step
to a system-prompt context line, since Claude now sees the raw query.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Fix the misleading model-name footer

**Files:**
- Modify: `components/chat/chat-box.tsx:815`
- Test: none (static text change, visually verified)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Read the current footer line**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
grep -n "Zero-hallucination\|RunAgents" components/chat/chat-box.tsx
```

- [ ] **Step 2: Update the text**

Change the footer string from claiming a specific model name that may not match what's actually running (NVIDIA is still the default for other AI paths in this app; only `answer-query` is now forced to Claude) to something accurate. Edit the line found in Step 1 to read:

```tsx
"RunAgents AI • Powered by Claude"
```

(Exact JSX structure depends on what Step 1's grep shows — preserve any surrounding icon/styling elements, only change the text content.)

- [ ] **Step 3: Visual check**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
npm run dev &
sleep 5
```

Open the app in a browser, navigate to the chat box, confirm the footer now reads correctly. Kill the dev server after checking (`kill %1`).

- [ ] **Step 4: Commit**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
git add components/chat/chat-box.tsx
git commit -m "$(cat <<'EOF'
fix: correct chat footer's misleading model claim

The footer claimed "Claude 3.5 Sonnet" regardless of which provider
actually served the request. answer-query is now always Claude (this
plan's Task 5), so the footer is simplified to avoid naming a specific
version that can drift from the real ANTHROPIC_MODEL env value.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Full branch review

**Files:** none (review only)

- [ ] **Step 1: Run the full test suite**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
<TEST_CMD>
```

Expected: all tests pass, including the new ones from Tasks 2-4.

- [ ] **Step 2: Run the type checker on the whole project**

```bash
cd /Users/dungnb/Downloads/devops-effort-tracker
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Invoke code review**

Use the `superpowers:requesting-code-review` skill (or the harness's `/code-review` command) against the diff from Task 1 through Task 6, checking specifically against this plan's Review Focus section (typo'd member names, devops permission denial wording, capability-question honesty, multi-part questions, proxy tool-calling reliability).

- [ ] **Step 4: Address any findings, then stop**

Fix anything the review surfaces inline, re-run Steps 1-2, and commit the fixes. Do not merge/deploy — that's the user's call per this session's operating rules.
