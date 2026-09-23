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
