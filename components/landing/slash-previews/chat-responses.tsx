import {
  AlertTriangle,
  Clock,
  FolderGit2,
  HelpCircle,
  ListTodo,
  ShieldAlert,
  ArrowRightLeft,
  User,
} from "lucide-react";

export interface ChatResponseProps {
  onNavigate: (cmd: string) => void;
}

export function FreeResponse({ onNavigate }: ChatResponseProps) {
  return (
    <div className="space-y-3">
      <p className="text-neutral-300 leading-relaxed">
        Dựa trên dữ liệu snapshot Firestore hôm nay (15/09/2026), hiện có{" "}
        <strong className="text-emerald-300 font-bold">2 kỹ sư</strong> đang có thời gian trống hoặc sẵn sàng nhận thêm task:
      </p>

      <div className="space-y-2.5">
        <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/25 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Minh Tran</span>
              <span className="text-xs text-neutral-400">(Cloud Eng)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                🟢 Rảnh 100%
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Đã log: 0m / 480m &bull; Kỹ năng: AWS, EKS, Terraform, Helm
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/20 shrink-0 self-start sm:self-auto">
            0m / 480m
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Alex Nguyen</span>
              <span className="text-xs text-neutral-400">(DevOps Eng)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                🟡 Rảnh chiều (&gt;14:00)
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Đang làm: Setup CI/CD GitLab &bull; Còn trống 300 phút
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-neutral-300 font-mono text-xs font-bold border border-white/[0.08] shrink-0 self-start sm:self-auto">
            180m / 480m
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-400 font-medium">Gợi ý hành động:</span>
        <button
          type="button"
          onClick={() => onNavigate("/assign")}
          className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all cursor-pointer"
        >
          👉 /assign cho Minh Tran
        </button>
        <button
          type="button"
          onClick={() => onNavigate("/load")}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
        >
          ⚡ /load xem toàn team
        </button>
      </div>
    </div>
  );
}

export function OverloadResponse({ onNavigate }: ChatResponseProps) {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2 text-xs font-semibold">
        <AlertTriangle size={16} className="text-rose-400 shrink-0" />
        <span>Cảnh báo quá tải: Phát hiện 1 thành viên vượt ngưỡng an toàn (&gt;480m/ngày):</span>
      </div>

      <div className="p-4 rounded-xl bg-black/40 border border-rose-500/30 space-y-2.5">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-bold text-white text-base">Duc Le</span>
            <span className="text-xs text-neutral-400 ml-1.5">(SecOps Lead)</span>
          </div>
          <span className="font-mono text-rose-400 font-bold bg-rose-500/20 px-2.5 py-0.5 rounded-lg border border-rose-500/30">
            540m / 480m (112.5% 🔴)
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Đang gánh đồng thời 3 task: <em>Audit IAM Roles AWS</em> (240m), <em>Config WAF Rules</em> (180m), <em>SSL Renewal</em> (120m).
        </p>
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-400 flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-amber-400 shrink-0" />
          <span>Khuyến nghị: Dùng lệnh <code>/reassign</code> để chuyển task IAM sang <strong>Minh Tran</strong> (đang rảnh 100%).</span>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onNavigate("/reassign")}
          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowRightLeft size={13} />
          /reassign sang Minh Tran
        </button>
      </div>
    </div>
  );
}

export function EffortResponse() {
  return (
    <div className="space-y-3">
      <p className="text-neutral-300 leading-relaxed">
        📊 <strong>Tổng hợp phân bổ Effort & thời lượng toàn đội ngũ hôm nay:</strong>
      </p>
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3">
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-neutral-300">Tổng thời lượng đã phân bổ:</span>
          <span className="font-mono text-violet-300 font-bold text-sm">
            1,040m / 1,920m (54.2%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/[0.08] overflow-hidden flex">
          <div className="h-full bg-sky-500" style={{ width: "28%" }} title="An Nguyen: 320m" />
          <div className="h-full bg-rose-500" style={{ width: "47%" }} title="Duc Le: 540m" />
          <div className="h-full bg-cyan-500" style={{ width: "16%" }} title="Alex Nguyen: 180m" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
          <div className="text-sky-300">● An: 320m (67%)</div>
          <div className="text-rose-400">● Duc: 540m (113%)</div>
          <div className="text-cyan-300">● Alex: 180m (38%)</div>
          <div className="text-emerald-400">● Minh: 0m (0%)</div>
        </div>
      </div>
    </div>
  );
}

export function LoadResponse() {
  return (
    <div className="space-y-3">
      <p className="text-neutral-300 leading-relaxed">
        ⚡ <strong>Tình trạng tải công việc và băng thông (Bandwidth) từng kỹ sư:</strong>
      </p>
      <div className="space-y-2">
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between text-xs">
          <div><span className="font-bold text-white">An Nguyen</span> <span className="text-neutral-400">(DevOps Lead)</span></div>
          <span className="text-sky-300 font-mono font-bold">320m / 480m (66.7% 🔵)</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 flex items-center justify-between text-xs">
          <div><span className="font-bold text-white">Duc Le</span> <span className="text-neutral-400">(SecOps)</span></div>
          <span className="text-rose-400 font-mono font-bold">540m / 480m (112.5% 🔴)</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between text-xs">
          <div><span className="font-bold text-white">Alex Nguyen</span> <span className="text-neutral-400">(DevOps)</span></div>
          <span className="text-cyan-300 font-mono font-bold">180m / 480m (37.5% 🟢)</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between text-xs">
          <div><span className="font-bold text-white">Minh Tran</span> <span className="text-neutral-400">(Cloud Eng)</span></div>
          <span className="text-emerald-400 font-mono font-bold">0m / 480m (0.0% 🟢)</span>
        </div>
      </div>
    </div>
  );
}

export function ReportResponse() {
  return (
    <div className="space-y-3">
      <p className="text-neutral-300 leading-relaxed">
        📑 <strong>Báo cáo phân bổ Effort theo từng dự án (Sprint 14):</strong>
      </p>
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5 text-xs font-mono">
        <div className="flex justify-between items-center text-neutral-300 pb-1.5 border-b border-white/[0.06]">
          <span>1. Fintech Core Platform</span>
          <span className="text-sky-300 font-bold">142h / 200h (71%)</span>
        </div>
        <div className="flex justify-between items-center text-neutral-300 pb-1.5 border-b border-white/[0.06]">
          <span>2. Cloud Migration 2026</span>
          <span className="text-purple-300 font-bold">96h / 160h (60%)</span>
        </div>
        <div className="flex justify-between items-center text-neutral-300">
          <span>3. Security & Compliance</span>
          <span className="text-rose-300 font-bold">118h / 120h (98% ⚠️ Cận trần)</span>
        </div>
      </div>
    </div>
  );
}

export function OverdueResponse() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2 text-xs font-semibold">
        <Clock size={16} className="text-amber-400 shrink-0" />
        <span>Phát hiện 2 task đang bị trễ hạn hoặc cận kề deadline:</span>
      </div>
      <div className="space-y-2">
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex justify-between items-center text-xs">
          <div>
            <div className="font-bold text-white">Audit IAM Roles AWS Production</div>
            <div className="text-neutral-400 mt-0.5">Phụ trách: Duc Le &bull; Hạn: 13/09/2026</div>
          </div>
          <span className="px-2 py-1 rounded bg-rose-900/60 text-rose-300 font-mono font-bold">
            Trễ 2 ngày 🔴
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex justify-between items-center text-xs">
          <div>
            <div className="font-bold text-white">Setup Prometheus & Grafana</div>
            <div className="text-neutral-400 mt-0.5">Phụ trách: Minh Tran &bull; Hạn: Hôm nay 17:00</div>
          </div>
          <span className="px-2 py-1 rounded bg-amber-900/60 text-amber-300 font-mono font-bold">
            Hạn hôm nay 🟡
          </span>
        </div>
      </div>
    </div>
  );
}

export function InfoResponse() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-bold text-white text-base">
        <User size={16} className="text-sky-400" />
        <span>Hồ sơ năng lực & Task của Minh Tran:</span>
      </div>
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5 text-xs">
        <div className="flex justify-between"><span className="text-neutral-400">Vị trí:</span><span className="text-white font-medium">Cloud Platform Engineer</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Trạng thái hôm nay:</span><span className="text-emerald-400 font-mono font-bold">🟢 Rảnh việc (0m/480m)</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Chuyên môn chính:</span><span className="text-neutral-200">Kubernetes, Terraform, AWS, Prometheus</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Dự án tham gia:</span><span className="text-sky-300">Fintech Core Platform</span></div>
      </div>
    </div>
  );
}

export function TaskResponse() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-bold text-white text-base">
        <ListTodo size={16} className="text-cyan-400" />
        <span>Setup CI/CD GitLab & Docker Runners</span>
      </div>
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5 text-xs">
        <div className="flex justify-between"><span className="text-neutral-400">Người phụ trách:</span><span className="text-white font-medium">Alex Nguyen (DevOps)</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Dự án:</span><span className="text-sky-300">Fintech Core Platform</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Thời lượng (Effort):</span><span className="text-amber-300 font-mono font-bold">180 phút (3 giờ)</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Trạng thái:</span><span className="text-emerald-400 font-mono font-bold">Đang thực hiện (In Progress)</span></div>
      </div>
    </div>
  );
}

export function ProjectResponse() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-bold text-white text-base">
        <FolderGit2 size={16} className="text-purple-400" />
        <span>Dự án: Fintech Core Platform</span>
      </div>
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5 text-xs">
        <div className="flex justify-between"><span className="text-neutral-400">Tiến độ Sprint:</span><span className="text-sky-300 font-mono font-bold">142h / 200h (71%)</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Thành viên tham gia:</span><span className="text-white font-medium">4 kỹ sư (An, Alex, Minh, Duc)</span></div>
        <div className="flex justify-between"><span className="text-neutral-400">Số task active:</span><span className="text-neutral-200">5 task đang làm &bull; 12 task đã hoàn thành</span></div>
      </div>
    </div>
  );
}

export function TasksResponse() {
  return (
    <div className="space-y-3">
      <p className="text-neutral-300 leading-relaxed">
        📋 <strong>Danh sách các task đang thực hiện và kế hoạch:</strong>
      </p>
      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex justify-between items-center">
          <div><span className="font-bold text-white">Setup CI/CD GitLab & Docker Runners</span><div className="text-neutral-400">Alex Nguyen &bull; 180m</div></div>
          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[11px]">Đang làm</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex justify-between items-center">
          <div><span className="font-bold text-white">Audit IAM Roles AWS Production</span><div className="text-neutral-400">Duc Le &bull; 240m</div></div>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px]">Trễ hạn</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex justify-between items-center">
          <div><span className="font-bold text-white">Triển khai Vault Secrets Engine</span><div className="text-neutral-400">Alex Nguyen &bull; 120m</div></div>
          <span className="px-2 py-0.5 rounded bg-neutral-500/20 text-neutral-300 font-mono text-[11px]">Kế hoạch</span>
        </div>
      </div>
    </div>
  );
}

export function MembersResponse() {
  return (
    <div className="space-y-3">
      <p className="text-neutral-300 leading-relaxed">
        👥 <strong>Danh sách 4 thành viên đội ngũ DevOps & SRE:</strong>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
          <div className="font-bold text-white">An Nguyen</div>
          <div className="text-neutral-400">DevOps Lead &bull; 320m/480m</div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20">
          <div className="font-bold text-white">Duc Le</div>
          <div className="text-rose-300">SecOps &bull; 540m/480m 🔴</div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20">
          <div className="font-bold text-white">Minh Tran</div>
          <div className="text-emerald-300">Cloud Eng &bull; 0m/480m 🟢</div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
          <div className="font-bold text-white">Alex Nguyen</div>
          <div className="text-neutral-400">DevOps Eng &bull; 180m/480m</div>
        </div>
      </div>
    </div>
  );
}

export function HelpResponse() {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center gap-2 font-bold text-white text-base">
        <HelpCircle size={16} className="text-purple-400" />
        <span>Hướng dẫn sử dụng DevOps AI Assistant</span>
      </div>
      <p className="text-neutral-300 leading-relaxed">
        Gõ ký tự <code>/</code> ở bất kỳ màn hình nào để mở danh sách 17 lệnh slash thông minh.
      </p>
      <div className="space-y-1.5 font-mono text-neutral-300">
        <div>&bull; <code>/free</code>: Xem kỹ sư đang rảnh để giao việc gấp</div>
        <div>&bull; <code>/overload</code>: Kiểm tra ai đang bị quá tải &gt;8h</div>
        <div>&bull; <code>/assign</code>: Mở form giao việc nhanh kèm tính thời lượng</div>
        <div>&bull; <code>/report</code>: Báo cáo phân bổ effort theo từng dự án</div>
      </div>
    </div>
  );
}
