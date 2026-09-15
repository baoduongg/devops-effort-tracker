import { AlertTriangle, Clock } from "lucide-react";

export const DURATION_PRESETS = [
  { label: "30p", minutes: 30, text: "30 phút" },
  { label: "1h", minutes: 60, text: "1 giờ 00 phút" },
  { label: "1.5h", minutes: 90, text: "1 giờ 30 phút" },
  { label: "2h", minutes: 120, text: "2 giờ 00 phút" },
  { label: "3h", minutes: 180, text: "3 giờ 00 phút" },
  { label: "4h", minutes: 240, text: "4 giờ 00 phút" },
  { label: "6h", minutes: 360, text: "6 giờ 00 phút" },
  { label: "8h", minutes: 480, text: "8 giờ 00 phút" },
];

export interface AssignFormBodyProps {
  selectedPresetEffort: number;
  customEffortLabel: string;
  onSelectPreset: (minutes: number, text: string) => void;
}

export function AssignFormBody({ selectedPresetEffort, customEffortLabel, onSelectPreset }: AssignFormBodyProps) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
          Tiêu đề công việc (Task) <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          readOnly
          value="Cấu hình Prometheus & Grafana Dashboard cho K8s Cluster"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Giao cho nhân sự (Assignee)
          </label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 flex items-center justify-between text-sm">
            <span>Minh Tran (Cloud Eng)</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">🟢 Rảnh 100%</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Dự án liên quan
          </label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">
            Fintech Core Platform
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-neutral-200 font-medium flex items-center gap-1.5">
            <Clock size={15} className="text-sky-400" />
            Thời lượng thực hiện:{" "}
            <span className="text-sky-300 font-bold font-mono">{customEffortLabel}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p.minutes}
              type="button"
              onClick={() => onSelectPreset(p.minutes, p.text)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedPresetEffort === p.minutes
                  ? "bg-sky-500/25 text-sky-200 border-sky-400/50 shadow-sm shadow-sky-500/20"
                  : "bg-white/[0.03] text-neutral-300 border-white/[0.08] hover:bg-white/[0.08]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Ngày bắt đầu
          </label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm font-mono">
            2026-09-15
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Hạn hoàn thành (Deadline)
          </label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-amber-300 text-sm font-mono">
            2026-09-19
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReassignFormBody() {
  return (
    <div className="space-y-4 text-sm">
      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
        🔄 Điều chuyển task sang nhân sự khác để cân bằng tải và giảm nguy cơ quá tải (&gt;8h/ngày).
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">1</span>
          Người đang phụ trách task (Hiện tại)
        </label>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-rose-300 flex items-center justify-between text-sm">
          <span>Duc Le (SecOps)</span>
          <span className="text-xs font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded text-rose-300">540m / 480m Quá tải 112%</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">2</span>
          Chọn task cần chuyển giao
        </label>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white text-sm font-medium">
          Audit IAM Roles AWS Production (Security & Compliance &bull; 4h)
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">3</span>
          Chuyển sang cho nhân sự tiếp nhận
        </label>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-emerald-300 flex items-center justify-between text-sm font-medium">
          <span>Minh Tran (Cloud Eng)</span>
          <span className="text-xs font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">0m / 480m Rảnh 100%</span>
        </div>
      </div>
    </div>
  );
}

export function AddFormBody() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
          Tiêu đề công việc (Task) <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          readOnly
          value="Triển khai HashiCorp Vault Secrets Engine cho Microservices"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Giao cho nhân sự</label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">Alex Nguyen (DevOps)</div>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Dự án liên quan</label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">Security & Compliance</div>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Thời điểm dự kiến</label>
        <input
          type="text"
          readOnly
          value="thứ 2 tuần tới (Sprint 15)"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-amber-300 text-sm font-mono"
        />
      </div>
    </div>
  );
}

export function LogFormBody() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
          Tiêu đề công việc đã làm <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          readOnly
          value="Triển khai Helm Chart Redis Sentinel & kiểm thử Failover"
          className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white font-medium text-sm"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Dự án liên quan</label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">Fintech Core Platform</div>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Thời điểm hoàn thành</label>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-sky-300 text-sm font-mono">hôm nay (15/09/2026)</div>
        </div>
      </div>
    </div>
  );
}

export function RemoveFormBody() {
  return (
    <div className="space-y-4 text-sm">
      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
        <AlertTriangle size={16} />
        <span>Xóa task khỏi hệ thống nếu yêu cầu bị hủy hoặc trùng lặp.</span>
      </div>
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Thành viên phụ trách</label>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">Duc Le (SecOps)</div>
      </div>
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Chọn task cần xóa / hủy</label>
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-rose-300 text-sm font-medium">
          Test Cấu hình Deprecated OpenSSL v1 (60p)
        </div>
      </div>
    </div>
  );
}
