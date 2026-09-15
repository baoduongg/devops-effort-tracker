export interface SlashCommandItem {
  cmd: string;
  name: string;
  desc: string;
  category: string;
  aliases: string[];
  color: string;
  badge: string;
  isInstantPrompt: boolean;
}

export const SLASH_CATEGORIES = [
  { id: "all", label: "Tất cả lệnh (17)" },
  { id: "coordination", label: "⚡ Giao việc & Điều phối (Form Modal)" },
  { id: "resource", label: "📊 Nguồn lực & Tải (Hỏi ngay)" },
  { id: "detail", label: "🔍 Chi tiết & Tra cứu (Hỏi ngay)" },
  { id: "report", label: "🚨 Báo cáo & Cảnh báo (Hỏi ngay)" },
  { id: "basic", label: "⚙️ Lệnh cơ bản (Hỏi ngay)" },
];

export const SLASH_COMMANDS_LIST: SlashCommandItem[] = [
  {
    cmd: "/assign",
    name: "Gán task cho thành viên",
    desc: "Mở Form Modal điền mẫu: Tên task, nhân sự, dự án, thời lượng & hạn chót.",
    category: "coordination",
    aliases: ["/giaoviet", "/add-task"],
    color: "text-sky-400",
    badge: "Điền mẫu",
    isInstantPrompt: false,
  },
  {
    cmd: "/reassign",
    name: "Chuyển task nhân sự",
    desc: "Chuyển giao task từ thành viên này sang thành viên khác kèm cập nhật effort.",
    category: "coordination",
    aliases: ["/chuyentask", "/doinguoi", "/transfer"],
    color: "text-indigo-400",
    badge: "Điền mẫu",
    isInstantPrompt: false,
  },
  {
    cmd: "/add",
    name: "Thêm task / Lập kế hoạch",
    desc: "Lập kế hoạch task mới và dự kiến thời lượng triển khai trong tương lai.",
    category: "coordination",
    aliases: ["/plan", "/taotask", "/kehoach"],
    color: "text-blue-400",
    badge: "Điền mẫu",
    isInstantPrompt: false,
  },
  {
    cmd: "/log",
    name: "Ghi nhận công việc (Log)",
    desc: "Ghi nhận task đang làm hoặc vừa hoàn thành kèm số giờ thực tế.",
    category: "coordination",
    aliases: ["/work", "/done", "/ghilog"],
    color: "text-cyan-400",
    badge: "Điền mẫu",
    isInstantPrompt: false,
  },
  {
    cmd: "/remove",
    name: "Xóa task khỏi danh sách",
    desc: "Xóa hoặc hủy bỏ một task đã hủy/không cần triển khai khỏi hệ thống.",
    category: "coordination",
    aliases: ["/xoatask", "/delete-task", "/huytask"],
    color: "text-rose-400",
    badge: "Điền mẫu",
    isInstantPrompt: false,
  },
  {
    cmd: "/free",
    name: "Thành viên đang rảnh",
    desc: "Hỏi ngay qua Chat: Truy vấn tức thì danh sách kỹ sư đang trống việc (< 288m).",
    category: "resource",
    aliases: ["/available", "/ranh", "/nhansuranh"],
    color: "text-emerald-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/overload",
    name: "Thành viên quá tải",
    desc: "Hỏi ngay qua Chat: Cảnh báo kỹ sư có tải công việc vượt mức (> 480m/ngày).",
    category: "resource",
    aliases: ["/overloaded", "/quatai", "/busy"],
    color: "text-rose-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/effort",
    name: "Tổng % Effort đội ngũ",
    desc: "Hỏi ngay qua Chat: Tổng hợp phân bổ effort và thời lượng của toàn bộ kỹ sư.",
    category: "resource",
    aliases: ["/my-effort", "/taicongviec", "/totaleffort"],
    color: "text-violet-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/load",
    name: "Tình trạng tải công việc",
    desc: "Hỏi ngay qua Chat: Hiển thị mức độ bận rộn và bandwidth chi tiết của các thành viên.",
    category: "resource",
    aliases: ["/workload", "/bandwidth", "/tinhtrangtai"],
    color: "text-amber-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/info",
    name: "Thông tin thành viên",
    desc: "Hỏi ngay qua Chat: Tra cứu task đang làm, effort và kế hoạch của kỹ sư.",
    category: "detail",
    aliases: ["/status", "/thanhvien", "/member-info"],
    color: "text-sky-300",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/task",
    name: "Thông tin chi tiết task",
    desc: "Hỏi ngay qua Chat: Hiển thị chi tiết tiến độ, deadline, người phụ trách task.",
    category: "detail",
    aliases: ["/task-info", "/chitiettask"],
    color: "text-cyan-300",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/project",
    name: "Thông tin chi tiết dự án",
    desc: "Hỏi ngay qua Chat: Tra cứu tiến độ, danh sách task và tổng effort dự án.",
    category: "detail",
    aliases: ["/project-info", "/chitietduan"],
    color: "text-purple-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/report",
    name: "Báo cáo phân bổ Effort",
    desc: "Hỏi ngay qua Chat: Báo cáo phân bổ effort theo từng dự án trong sprint hiện tại.",
    category: "report",
    aliases: ["/baocao", "/summary", "/phanbo"],
    color: "text-teal-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/overdue",
    name: "Task trễ hạn / Gấp",
    desc: "Hỏi ngay qua Chat: Quét và tổng hợp các task bị quá hạn hoặc cận kề deadline.",
    category: "report",
    aliases: ["/trehan", "/deadline", "/gap"],
    color: "text-amber-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/tasks",
    name: "Danh sách công việc",
    desc: "Hỏi ngay qua Chat: Hiển thị danh sách task đang thực hiện và kế hoạch sắp tới.",
    category: "basic",
    aliases: ["/all-tasks", "/danhsachtask", "/viec"],
    color: "text-sky-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/members",
    name: "Danh sách thành viên",
    desc: "Hỏi ngay qua Chat: Hiển thị toàn bộ thành viên trong đội ngũ, chuyên môn & trạng thái.",
    category: "basic",
    aliases: ["/member", "/nhansu", "/team"],
    color: "text-emerald-400",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
  {
    cmd: "/help",
    name: "Hướng dẫn & Trợ giúp",
    desc: "Hỏi ngay qua Chat: Hiển thị hướng dẫn chi tiết các lệnh slash (/) và cách dùng AI.",
    category: "basic",
    aliases: ["/huongdan", "/?"],
    color: "text-neutral-300",
    badge: "Hỏi ngay",
    isInstantPrompt: true,
  },
];

export const SLASH_MODAL_TITLES: Record<string, string> = {
  "/assign": "Giao việc cho thành viên",
  "/reassign": "Chuyển task cho người khác",
  "/add": "Lập kế hoạch công việc mới",
  "/log": "Ghi nhận công việc hoàn thành",
  "/remove": "Xóa task khỏi hệ thống",
};

export const DEFAULT_SLASH_MODAL_TITLE = "Biểu mẫu điều phối công việc";

export const SLASH_USER_QUERIES: Record<string, string> = {
  "/free": "Ai trong team đang rảnh việc hoặc có thể nhận thêm task hôm nay?",
  "/overload": "Những ai trong team đang bị quá tải hoặc có tải công việc vượt mức 8h?",
  "/effort": "Xem tổng hợp phân bổ effort và thời lượng công việc của toàn đội bộ thành viên",
  "/load": "Hiển thị tình trạng tải công việc tổng thể và băng thông (Bandwidth) của các thành viên",
  "/report": "Báo cáo tổng hợp phân bổ Effort của toàn bộ team theo từng dự án trong Sprint 14",
  "/overdue": "Tổng hợp các task đang bị trễ hạn hoặc gần đến deadline cần xử lý gấp?",
  "/info": "Tình hình công việc, task đang làm và kế hoạch của Minh Tran ra sao?",
  "/task": "Hiển thị thông tin chi tiết, người phụ trách và tiến độ của task Setup CI/CD GitLab & Docker Runners",
  "/project": "Hiển thị thông tin chi tiết về dự án Fintech Core Platform, các task và thành viên tham gia",
  "/tasks": "Hiển thị danh sách các task đang thực hiện và kế hoạch sắp tới của đội ngũ",
  "/members": "Hiển thị danh sách toàn bộ thành viên trong đội ngũ, chuyên môn và trạng thái hiện tại",
  "/help": "Hiển thị hướng dẫn chi tiết các lệnh slash (/) và cách sử dụng AI Assistant hiệu quả",
};

export const getSlashUserQuery = (cmd: string): string =>
  SLASH_USER_QUERIES[cmd] ?? `Thực thi lệnh ${cmd} với dữ liệu snapshot realtime`;

export const TECH_STACK_ITEMS = [
  {
    idx: "01",
    title: "Next.js 15 App Router",
    desc: "React 19, Server Components & Streaming SSR giúp tải trang tức thì và tối ưu SEO vượt trội.",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "hover:border-sky-500/30",
  },
  {
    idx: "02",
    title: "Firebase Firestore Realtime",
    desc: "Lắng nghe và cập nhật dữ liệu 2 chiều không cần reload trang qua Firestore snapshot listeners.",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "hover:border-amber-500/30",
  },
  {
    idx: "03",
    title: "RunAgents AI (Claude Sonnet CC)",
    desc: "Tích hợp RunAgents model claude-sonnet-cc với khả năng hiểu ngữ cảnh sâu và trích xuất dữ liệu zero-hallucination.",
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    border: "hover:border-purple-500/30",
  },
  {
    idx: "04",
    title: "ChatOps & Webhook Engine",
    desc: "Tự động phát thông báo real-time tới Slack, Mattermost, Discord, Telegram và xuất Daily Digest PNG.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "hover:border-cyan-500/30",
  },
];
