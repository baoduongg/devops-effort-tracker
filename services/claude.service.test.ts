import { describe, it, expect, vi } from "vitest";

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
