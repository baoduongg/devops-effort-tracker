import { callClaudeTool, type ClaudeTool } from "@/services/claude.service";
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
  // list_free_members restores old pre-rewrite behavior: leader-only, since a devops asker's
  // grounding snapshot is already scoped to just themself, making the "who's free" card meaningless.
  return CARD_TOOLS.filter((t) => t.name !== "list_free_members").concat(GENERAL_TOOL);
}

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
