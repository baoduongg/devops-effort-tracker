"use client";

import { HelpCircle, Zap } from "lucide-react";
import type { HelpPayload } from "@/types/chat";

interface HelpCardProps {
  helpData?: HelpPayload;
  onRunSlashCommand?: (slashCommand: string) => void;
}

const DEFAULT_COMMANDS = [
  { cmd: "/free", desc: "Xem kỹ sư đang rảnh để giao việc gấp" },
  { cmd: "/overload", desc: "Kiểm tra ai đang bị quá tải (>480m)" },
  { cmd: "/effort", desc: "Tổng hợp phân bổ effort toàn team" },
  { cmd: "/load", desc: "Xem tải & băng thông từng người" },
  { cmd: "/report", desc: "Báo cáo phân bổ effort theo từng dự án" },
  { cmd: "/overdue", desc: "Quét các task trễ hạn cần xử lý gấp" },
  { cmd: "/tasks", desc: "Xem danh sách task đang làm & kế hoạch" },
  { cmd: "/members", desc: "Xem danh sách thành viên & chuyên môn" },
  { cmd: "/projects", desc: "Danh sách các dự án hiện có" },
  { cmd: "/assign", desc: "Mở form giao việc nhanh kèm tính thời lượng" },
  { cmd: "/reassign", desc: "Chuyển task giữa các kỹ sư" },
  { cmd: "/add", desc: "Lập kế hoạch task mới cho thành viên" },
  { cmd: "/log", desc: "Ghi nhận công việc đã hoàn thành" },
];

export function HelpCard({ onRunSlashCommand }: HelpCardProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-bold text-white text-sm sm:text-base">
        <HelpCircle size={16} className="text-purple-400 shrink-0" />
        <span>Hướng dẫn sử dụng DevOps AI Assistant & Lệnh Slash</span>
      </div>

      <p className="text-neutral-300 leading-relaxed text-xs">
        Gõ ký tự <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-sky-300">/</code> trong khung chat hoặc nhấp vào các lệnh bên dưới để điều phối công việc tức thì:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {DEFAULT_COMMANDS.map((item) => (
          <button
            key={item.cmd}
            type="button"
            onClick={() => onRunSlashCommand?.(item.cmd)}
            className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all text-left flex items-start gap-2 cursor-pointer group"
          >
            <div className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-mono text-[11px] font-bold shrink-0 border border-sky-500/25 group-hover:bg-sky-500/25">
              {item.cmd}
            </div>
            <span className="text-neutral-300 text-[11px] leading-tight mt-0.5">
              {item.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center gap-2">
        <Zap size={14} className="shrink-0" />
        <span>Mẹo: Bạn có thể gõ câu hỏi tự nhiên bằng Tiếng Việt hoặc dán ảnh chụp màn hình bất kỳ lúc nào!</span>
      </div>
    </div>
  );
}
