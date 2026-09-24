import { describe, it, expect, vi, beforeEach } from "vitest";
import { CHAT_TOOLS, buildToolsForRole } from "@/services/chat-tools.service";

vi.mock("@/services/claude.service", async () => {
  const actual = await vi.importActual("@/services/claude.service");
  return { ...actual, callClaudeTool: vi.fn() };
});

import { callClaudeTool } from "@/services/claude.service";
import { runChatToolLoop } from "@/services/chat-tools.service";
import type { GroundingSnapshot } from "@/services/grounding.service";

describe("buildToolsForRole", () => {
  it("includes all 16 tools for a leader", () => {
    const tools = buildToolsForRole(true);
    expect(tools.map((t) => t.name)).toEqual(
      expect.arrayContaining([
        "create_task",
        "update_task",
        "delete_task",
        "list_free_members",
        "answer_general_question",
      ])
    );
    expect(tools.length).toBe(CHAT_TOOLS.length);
  });

  it("excludes create_task/update_task/delete_task/list_free_members for a devops asker", () => {
    const tools = buildToolsForRole(false);
    const names = tools.map((t) => t.name);
    expect(names).not.toContain("create_task");
    expect(names).not.toContain("update_task");
    expect(names).not.toContain("delete_task");
    expect(names).not.toContain("list_free_members");
    expect(names).toContain("answer_general_question");
    expect(tools.length).toBe(CHAT_TOOLS.length - 4);
  });

  it("every tool has a non-empty description and valid input_schema", () => {
    for (const tool of CHAT_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.input_schema.type).toBe("object");
    }
  });
});

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

  it("dispatches create_alarm to an unsaved alarmProposal payload, not a direct write", async () => {
    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: {
        name: "create_alarm",
        input: { content: "Review PR hạ tầng", time: "2026-09-25T09:00" },
      },
      text: null,
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "nhắc tôi 9h mai review PR",
      effectiveQuery: "nhắc tôi 9h mai review PR",
      snapshot: emptySnapshot,
      allMembers: [],
      isLeader: false,
      currentAskerRole: "devops",
      currentMemberId: "member-1",
    });

    expect(result).toHaveProperty("alarmProposal");
    const proposal = (result as { alarmProposal: { memberId: string; supervisorId: string | null; content: string; time: string } }).alarmProposal;
    expect(proposal.memberId).toBe("member-1");
    expect(proposal.supervisorId).toBeNull();
    expect(proposal.content).toBe("Review PR hạ tầng");
    expect(new Date(proposal.time).toISOString()).toBe(proposal.time);
  });

  it("resolves assigneeName/supervisorName to real member ids for create_alarm", async () => {
    const allMembers = [
      { id: "m-nam", name: "Nam", email: "", photoURL: null, skills: [], status: "free", currentTaskId: null, effortMinutes: 0, role: "devops", updatedAt: "" },
      { id: "m-linh", name: "Linh", email: "", photoURL: null, skills: [], status: "free", currentTaskId: null, effortMinutes: 0, role: "leader", updatedAt: "" },
    ] as unknown as Parameters<typeof runChatToolLoop>[0]["allMembers"];

    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: {
        name: "create_alarm",
        input: {
          content: "Deploy hotfix",
          time: "2026-09-25T09:00",
          assigneeName: "Nam",
          supervisorName: "Linh",
        },
      },
      text: null,
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "leader đặt alarm cho Nam",
      effectiveQuery: "leader đặt alarm cho Nam",
      snapshot: emptySnapshot,
      allMembers,
      isLeader: true,
      currentAskerRole: "leader",
      currentMemberId: "leader",
    });

    expect(result).toHaveProperty("alarmProposal");
    const proposal = (result as { alarmProposal: { memberId: string; supervisorId: string | null } }).alarmProposal;
    expect(proposal.memberId).toBe("m-nam");
    expect(proposal.supervisorId).toBe("m-linh");
  });

  it("asks for the missing time instead of guessing when create_alarm input omits it", async () => {
    vi.mocked(callClaudeTool).mockResolvedValueOnce({
      toolUse: { name: "create_alarm", input: { content: "Review PR hạ tầng" } },
      text: null,
    });

    const result = await runChatToolLoop({
      systemPrompt: "system",
      userQuery: "nhắc tôi review PR",
      effectiveQuery: "nhắc tôi review PR",
      snapshot: emptySnapshot,
      allMembers: [],
      isLeader: false,
      currentAskerRole: "devops",
      currentMemberId: "member-1",
    });

    expect(result).toHaveProperty("clarification");
    expect(result).not.toHaveProperty("alarmProposal");
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
