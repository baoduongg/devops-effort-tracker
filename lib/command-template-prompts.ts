import type { SlashCommand } from "@/lib/slash-commands";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { TaskStatus } from "@/types/task";

export interface PromptFormState {
  taskTitle: string;
  selectedMemberName: string;
  newAssigneeName: string;
  selectedProjectName: string;
  durationStr: string;
  timeframe: string;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  notes: string;
}

export function buildCommandPrompt(
  command: SlashCommand,
  state: PromptFormState,
  members: Member[],
  projects: Project[]
): string {
  const title = state.taskTitle.trim() || "[Tên công việc]";
  const member = members.find((m) => m.id === state.selectedMemberName)?.name || "[Tên nhân sự]";
  const newMember = members.find((m) => m.id === state.newAssigneeName)?.name || "[Người mới]";
  const proj = projects.find((p) => p.id === state.selectedProjectName)?.name || "[Tên dự án]";
  const duration = state.durationStr;

  switch (command.id) {
    case "coord-assign": {
      const statusLabel =
        state.status === "done" ? "hoàn thành" : state.status === "planned" ? "kế hoạch" : "đang thực hiện";
      const datePart = state.startDate ? `, bắt đầu ${state.startDate}` : "";
      const deadlinePart = state.endDate ? `, hạn hoàn thành ${state.endDate}` : "";
      const notesPart = state.notes.trim() ? `. Ghi chú: ${state.notes.trim()}` : "";
      return `Giao task ${title} cho ${member} thuộc dự án ${proj} thời gian ${duration}, trạng thái ${statusLabel}${datePart}${deadlinePart}${notesPart}`;
    }

    case "coord-reassign":
      return `Chuyển task ${title} từ ${member} sang cho ${newMember}`;

    case "coord-remove":
      return `Xóa task ${title} của ${member}`;

    case "coord-add":
      return `Lập kế hoạch task ${title} cho ${member} dự án ${proj} thời gian ${duration}${
        state.timeframe.trim() ? `, dự kiến ${state.timeframe.trim()}` : ""
      }`;

    case "coord-log":
      return `Log công việc: ${title} cho dự án ${proj}, thời gian ${duration}${
        state.timeframe.trim() ? `, hoàn thành ${state.timeframe.trim()}` : ""
      }`;

    case "coord-alarm": {
      const content = state.taskTitle.trim() || "[Nội dung nhắc]";
      const time = state.timeframe.trim() || "[Thời gian]";
      const assignee = members.find((m) => m.id === state.selectedMemberName)?.name || "[Người thực hiện]";
      const supervisorMember = members.find((m) => m.id === state.newAssigneeName)?.name;
      const selectedProject = projects.find((p) => p.id === state.selectedProjectName)?.name;
      const projectPart = selectedProject ? ` thuộc dự án ${selectedProject}` : "";
      const supervisorPart = supervisorMember ? `, người giám sát ${supervisorMember}` : "";
      return `Đặt alarm nhắc ${assignee} ${content} vào ${time}${projectPart}${supervisorPart}`;
    }

    case "detail-info":
      return `Tình hình công việc, task đang làm và kế hoạch của ${member} ra sao?`;

    case "detail-task":
      return `Hiển thị thông tin chi tiết, người phụ trách và tiến độ của task ${title}`;

    case "detail-project":
      return `Hiển thị thông tin chi tiết về dự án ${proj}, các task và thành viên tham gia`;

    default:
      if (command.template) {
        return command.template
          .replace("[Tên công việc]", title)
          .replace("[Tên task]", title)
          .replace("[Tên nhân sự]", member)
          .replace("[Người cũ]", member)
          .replace("[Tên thành viên]", member)
          .replace("[Người mới]", newMember)
          .replace("[Tên dự án]", proj)
          .replace("[1 tiếng]", duration)
          .replace("[2 tiếng]", duration)
          .replace("[30%]", duration)
          .replace("[40%]", duration);
      }
      return command.prompt || "";
  }
}
