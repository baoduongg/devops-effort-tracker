import type { ChatMode } from "@/types/chat";

export type SlashCategory = "basic" | "resource" | "coordination" | "detail" | "report" | "system";

export interface SlashCommand {
  id: string;
  command: string; // e.g. "/free"
  aliases?: string[];
  label: string;
  description: string;
  category: SlashCategory;
  mode: "leader" | "devops" | "all";
  badgeText?: string;
  template?: string; // Pre-filled template for parameterized commands
  prompt?: string; // Instant natural language prompt for zero-param queries
  isInstantPrompt?: boolean; // If true, can be sent right away or with single click
}

export const SLASH_COMMANDS: SlashCommand[] = [
  // ==========================================
  // 1. LỆNH SLASH (/) CƠ BẢN
  // ==========================================
  {
    id: "basic-help",
    command: "/help",
    aliases: ["/huongdan", "/?"],
    label: "Hướng dẫn & Trợ giúp",
    description: "Hiển thị hướng dẫn sử dụng AI Assistant & cách dùng lệnh slash",
    category: "basic",
    mode: "all",
    badgeText: "Trợ giúp",
    prompt: "Hiển thị hướng dẫn chi tiết các lệnh slash (/) và cách sử dụng AI Assistant hiệu quả",
    isInstantPrompt: true,
  },
  {
    id: "basic-members",
    command: "/members",
    aliases: ["/member", "/nhansu", "/team", "/danhsach"],
    label: "Danh sách thành viên",
    description: "Hiển thị danh sách thành viên trong đội ngũ và trạng thái",
    category: "basic",
    mode: "all",
    badgeText: "Cơ bản",
    prompt: "Hiển thị danh sách toàn bộ thành viên trong đội ngũ, chuyên môn và trạng thái hiện tại",
    isInstantPrompt: true,
  },
  {
    id: "basic-projects",
    command: "/projects",
    aliases: ["/duan", "/project-list", "/danhsachduan"],
    label: "Danh sách dự án",
    description: "Hiển thị danh sách dự án và tình hình triển khai",
    category: "basic",
    mode: "all",
    badgeText: "Cơ bản",
    prompt: "Hiển thị danh sách các dự án hiện có, nhân sự phụ trách và tổng effort",
    isInstantPrompt: true,
  },
  {
    id: "basic-tasks",
    command: "/tasks",
    aliases: ["/all-tasks", "/danhsachtask", "/viec", "/my-tasks", "/vieccuatoi"],
    label: "Danh sách công việc",
    description: "Hiển thị danh sách task đang thực hiện và kế hoạch",
    category: "basic",
    mode: "all",
    badgeText: "Cơ bản",
    prompt: "Hiển thị danh sách các task đang thực hiện và kế hoạch sắp tới",
    isInstantPrompt: true,
  },

  // ==========================================
  // 2. LỆNH SLASH (/) QUẢN LÝ NGUỒN LỰC
  // ==========================================
  {
    id: "resource-free",
    command: "/free",
    aliases: ["/available", "/ranh", "/nhansuranh"],
    label: "Thành viên đang rảnh",
    description: "Hiển thị danh sách thành viên đang rảnh hoặc có thể nhận thêm task",
    category: "resource",
    mode: "all",
    badgeText: "Nguồn lực",
    prompt: "Ai trong team đang rảnh việc hoặc có thể nhận thêm task?",
    isInstantPrompt: true,
  },
  {
    id: "resource-overload",
    command: "/overload",
    aliases: ["/overloaded", "/quatai", "/busy"],
    label: "Thành viên quá tải",
    description: "Hiển thị danh sách thành viên quá tải hoặc nhiều task",
    category: "resource",
    mode: "all",
    badgeText: "Nguồn lực",
    prompt: "Những ai trong team đang bị quá tải hoặc có tải công việc vượt mức?",
    isInstantPrompt: true,
  },
  {
    id: "resource-effort",
    command: "/effort",
    aliases: ["/my-effort", "/taicongviec", "/totaleffort"],
    label: "Tổng % Effort đội ngũ",
    description: "Hiển thị tổng effort và phân bổ thời lượng của đội ngũ",
    category: "resource",
    mode: "all",
    badgeText: "Nguồn lực",
    prompt: "Xem tổng hợp phân bổ effort và thời lượng công việc của đội ngũ",
    isInstantPrompt: true,
  },
  {
    id: "resource-load",
    command: "/load",
    aliases: ["/workload", "/bandwidth", "/tinhtrangtai"],
    label: "Tình trạng tải công việc",
    description: "Hiển thị tình trạng tải công việc của đội ngũ",
    category: "resource",
    mode: "all",
    badgeText: "Nguồn lực",
    prompt: "Hiển thị tình trạng tải công việc tổng thể và mức độ bận rộn của các thành viên",
    isInstantPrompt: true,
  },

  // ==========================================
  // 3. LỆNH SLASH (/) ĐIỀU PHỐI NHÂN SỰ & TASK
  // ==========================================
  {
    id: "coord-assign",
    command: "/assign",
    aliases: ["/giaoviet", "/add-task"],
    label: "Gán task cho thành viên",
    description: "Gán task mới cho thành viên (Mở form điền mẫu)",
    category: "coordination",
    mode: "all",
    badgeText: "Giao việc",
    template: "Giao task [Tên công việc] cho [Tên nhân sự] thuộc dự án [Tên dự án] thời gian [1 tiếng]",
    isInstantPrompt: false,
  },
  {
    id: "coord-reassign",
    command: "/reassign",
    aliases: ["/chuyentask", "/doinguoi", "/transfer"],
    label: "Chuyển task nhân sự",
    description: "Chuyển task từ thành viên này sang thành viên khác",
    category: "coordination",
    mode: "all",
    badgeText: "Điều phối",
    template: "Chuyển task [Tên task] từ [Người cũ] sang cho [Người mới]",
    isInstantPrompt: false,
  },
  {
    id: "coord-remove",
    command: "/remove",
    aliases: ["/xoatask", "/delete-task", "/huytask"],
    label: "Xóa task khỏi danh sách",
    description: "Xóa task khỏi danh sách công việc",
    category: "coordination",
    mode: "all",
    badgeText: "Xóa task",
    template: "Xóa task [Tên task] của [Tên thành viên]",
    isInstantPrompt: false,
  },
  {
    id: "coord-add",
    command: "/add",
    aliases: ["/plan", "/taotask", "/kehoach"],
    label: "Thêm task / Lập kế hoạch",
    description: "Thêm task mới vào danh sách task hoặc lên kế hoạch",
    category: "coordination",
    mode: "all",
    badgeText: "Kế hoạch",
    template: "Lập kế hoạch task [Tên công việc] cho [Tên nhân sự] dự án [Tên dự án] thời gian [2 tiếng]",
    isInstantPrompt: false,
  },
  {
    id: "coord-log",
    command: "/log",
    aliases: ["/work", "/done", "/ghilog"],
    label: "Ghi nhận công việc (Log)",
    description: "Ghi nhận task đang làm hoặc vừa hoàn thành vào hệ thống",
    category: "coordination",
    mode: "all",
    badgeText: "Ghi log",
    template: "Log công việc: [Tên công việc] cho dự án [Tên dự án], thời gian [1 tiếng], hoàn thành [hôm nay]",
    isInstantPrompt: false,
  },

  // ==========================================
  // 4. LỆNH SLASH (/) THÔNG TIN CHI TIẾT
  // ==========================================
  {
    id: "detail-info",
    command: "/info",
    aliases: ["/status", "/thanhvien", "/member-info"],
    label: "Thông tin thành viên",
    description: "Hiển thị thông tin chi tiết về thành viên (task, effort & kế hoạch)",
    category: "detail",
    mode: "all",
    badgeText: "Chi tiết",
    template: "/info [Tên thành viên]",
    prompt: "Tình hình công việc, task đang làm và kế hoạch của [Tên thành viên] ra sao?",
    isInstantPrompt: false,
  },
  {
    id: "detail-task",
    command: "/task",
    aliases: ["/task-info", "/chitiettask"],
    label: "Thông tin chi tiết task",
    description: "Hiển thị thông tin chi tiết về 1 task cụ thể",
    category: "detail",
    mode: "all",
    badgeText: "Chi tiết",
    template: "/task [Tên task]",
    prompt: "Hiển thị thông tin chi tiết, người phụ trách và tiến độ của task [Tên task]",
    isInstantPrompt: false,
  },
  {
    id: "detail-project",
    command: "/project",
    aliases: ["/project-info", "/chitietduan"],
    label: "Thông tin chi tiết dự án",
    description: "Hiển thị thông tin chi tiết về dự án, tiến độ & nhân sự",
    category: "detail",
    mode: "all",
    badgeText: "Chi tiết",
    template: "/project [Tên dự án]",
    prompt: "Hiển thị thông tin chi tiết về dự án [Tên dự án], các task và thành viên tham gia",
    isInstantPrompt: false,
  },

  // ==========================================
  // 5. BÁO CÁO & TIỆN ÍCH HỆ THỐNG
  // ==========================================
  {
    id: "report-allocation",
    command: "/report",
    aliases: ["/baocao", "/summary", "/phanbo"],
    label: "Báo cáo phân bổ Effort",
    description: "Tổng hợp phân bổ Effort theo từng dự án và tiến độ hiện tại",
    category: "report",
    mode: "all",
    badgeText: "Báo cáo",
    prompt: "Báo cáo tổng hợp phân bổ Effort của toàn bộ team theo từng dự án và tiến độ hiện tại.",
    isInstantPrompt: true,
  },
  {
    id: "report-overdue",
    command: "/overdue",
    aliases: ["/trehan", "/deadline", "/gap"],
    label: "Task trễ hạn / Gấp",
    description: "Tổng hợp các task đang bị trễ hạn hoặc cận kề deadline cần xử lý",
    category: "report",
    mode: "all",
    badgeText: "Cảnh báo",
    prompt: "Tổng hợp các task đang bị trễ hạn hoặc gần đến hạn cần xử lý gấp?",
    isInstantPrompt: true,
  },
  {
    id: "general-clear",
    command: "/clear",
    aliases: ["/xoa", "/reset"],
    label: "Xóa nội dung nhập",
    description: "Làm trống ô nhập văn bản hiện tại",
    category: "system",
    mode: "all",
    badgeText: "Tiện ích",
    template: "",
    isInstantPrompt: false,
  },
];

/**
 * Filter slash commands matching the current mode and typed search query.
 */
export function getAvailableSlashCommands(currentMode: ChatMode, queryText = ""): SlashCommand[] {
  const cleanQuery = queryText.toLowerCase().trim();
  const searchKeyword = cleanQuery.startsWith("/") ? cleanQuery.slice(1) : cleanQuery;

  return SLASH_COMMANDS.filter((cmd) => {
    // Mode match
    if (cmd.mode !== "all" && cmd.mode !== currentMode) {
      return false;
    }

    if (!searchKeyword) return true;

    // Match command, aliases, label, description
    const cmdMatch = cmd.command.toLowerCase().includes(searchKeyword);
    const aliasMatch = cmd.aliases?.some((a) => a.toLowerCase().includes(searchKeyword));
    const labelMatch = cmd.label.toLowerCase().includes(searchKeyword);
    const descMatch = cmd.description.toLowerCase().includes(searchKeyword);

    return cmdMatch || aliasMatch || labelMatch || descMatch;
  });
}

/**
 * Resolves a typed command into a normalized prompt if applicable.
 * E.g., "/free" -> "Ai trong team đang rảnh việc hoặc có thể nhận thêm task?"
 * E.g., "/info Bảo" -> "Tình hình công việc, task đang làm và kế hoạch của Bảo ra sao?"
 */
export function resolveSlashCommand(text: string, currentMode: ChatMode): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) {
    return trimmed;
  }

  const parts = trimmed.split(/\s+/);
  const commandPart = parts[0].toLowerCase();
  const argsPart = parts.slice(1).join(" ").trim();

  // Find matching command
  const matched = SLASH_COMMANDS.find(
    (c) =>
      (c.mode === "all" || c.mode === currentMode) &&
      (c.command.toLowerCase() === commandPart || c.aliases?.includes(commandPart))
  );

  if (!matched) {
    return trimmed;
  }

  // Handle special parameterized commands
  if (matched.id === "detail-info") {
    if (argsPart) {
      return `Tình hình công việc, task đang làm và kế hoạch của ${argsPart} ra sao?`;
    }
    return "Tình hình công việc và phân bổ task của các thành viên trong team hiện tại ra sao?";
  }

  if (matched.id === "detail-task") {
    if (argsPart) {
      return `Hiển thị thông tin chi tiết, người phụ trách và tiến độ của task ${argsPart}`;
    }
    return "Hiển thị danh sách các task đang thực hiện và kế hoạch sắp tới";
  }

  if (matched.id === "detail-project") {
    if (argsPart) {
      return `Hiển thị thông tin chi tiết về dự án ${argsPart}, các task và thành viên tham gia`;
    }
    return "Hiển thị danh sách các dự án hiện có, nhân sự phụ trách và tổng effort";
  }

  if (matched.id === "coord-assign" && argsPart) {
    if (/giao\s+task/i.test(argsPart)) return argsPart;
    return `Giao task ${argsPart}`;
  }

  if (matched.id === "coord-reassign" && argsPart) {
    if (/chuyển\s+task/i.test(argsPart)) return argsPart;
    return `Chuyển task ${argsPart}`;
  }

  if (matched.id === "coord-remove" && argsPart) {
    if (/xóa\s+task/i.test(argsPart)) return argsPart;
    return `Xóa task ${argsPart}`;
  }

  if (matched.id === "coord-add" && argsPart) {
    if (/lập\s+kế\s+hoạch/i.test(argsPart) || /thêm\s+task/i.test(argsPart)) return argsPart;
    return `Lập kế hoạch task ${argsPart}`;
  }

  if (matched.id === "coord-log" && argsPart) {
    if (/log\s+công\s+việc/i.test(argsPart)) return argsPart;
    return `Log công việc: ${argsPart}`;
  }

  // If matched has an instant prompt and no args were given
  if (matched.prompt) {
    return matched.prompt;
  }

  return trimmed;
}
