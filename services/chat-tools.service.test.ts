import { describe, it, expect } from "vitest";
import { CHAT_TOOLS, buildToolsForRole } from "@/services/chat-tools.service";

describe("buildToolsForRole", () => {
  it("includes all 15 tools for a leader", () => {
    const tools = buildToolsForRole(true);
    expect(tools.map((t) => t.name)).toEqual(
      expect.arrayContaining([
        "create_task",
        "update_task",
        "delete_task",
        "answer_general_question",
      ])
    );
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
