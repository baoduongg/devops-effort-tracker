"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal,
  ChevronRight,
  Send,
  Sparkles,
  PenLine,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Calendar,
  X,
} from "lucide-react";
import { SLASH_CATEGORIES, SLASH_COMMANDS_LIST } from "./landing-data";

export function LandingSlashCommands() {
  const [activeSlashCategory, setActiveSlashCategory] = useState<string>("all");
  const [activeSlashCommand, setActiveSlashCommand] = useState<string>("/assign");

  // Interactive Form State in the Preview
  const [selectedPresetEffort, setSelectedPresetEffort] = useState<number>(240);
  const [customEffortLabel, setCustomEffortLabel] = useState<string>("4 giờ 00 phút");

  const DURATION_PRESETS = [
    { label: "30p", minutes: 30, text: "30 phút" },
    { label: "1h", minutes: 60, text: "1 giờ 00 phút" },
    { label: "1.5h", minutes: 90, text: "1 giờ 30 phút" },
    { label: "2h", minutes: 120, text: "2 giờ 00 phút" },
    { label: "3h", minutes: 180, text: "3 giờ 00 phút" },
    { label: "4h", minutes: 240, text: "4 giờ 00 phút" },
    { label: "6h", minutes: 360, text: "6 giờ 00 phút" },
    { label: "8h", minutes: 480, text: "8 giờ 00 phút" },
  ];

  const getModalTitle = (cmd: string) => {
    switch (cmd) {
      case "/assign":
        return "Giao việc cho thành viên";
      case "/reassign":
        return "Chuyển task cho người khác";
      case "/add":
        return "Lập kế hoạch công việc mới";
      case "/log":
        return "Ghi nhận công việc hoàn thành";
      case "/remove":
        return "Xóa task khỏi hệ thống";
      case "/info":
        return "Tra cứu thông tin thành viên";
      case "/task":
        return "Tra cứu thông tin task";
      case "/project":
        return "Tra cứu thông tin dự án";
      default:
        return "Thực thi câu lệnh AI Coordination";
    }
  };

  const getGeneratedPrompt = (cmd: string) => {
    switch (cmd) {
      case "/assign":
        return `Giao task Cấu hình Prometheus & Grafana cho Minh Tran thuộc dự án Fintech Core Platform thời gian ${customEffortLabel}, trạng thái đang thực hiện, bắt đầu 2026-09-15, hạn hoàn thành 2026-09-19. Ghi chú: Cần phối hợp với team Dev trước khi deploy`;
      case "/reassign":
        return "Chuyển task Audit IAM Roles AWS từ Duc Le sang cho Minh Tran";
      case "/add":
        return `Lập kế hoạch task Triển khai HashiCorp Vault cho Alex Nguyen dự án Security & Compliance thời gian ${customEffortLabel}, dự kiến thứ 2 tuần tới`;
      case "/log":
        return `Log công việc: Triển khai Helm Chart Redis Sentinel cho dự án Fintech Core Platform, thời gian ${customEffortLabel}, hoàn thành hôm nay`;
      case "/remove":
        return "Xóa task Test Cấu hình Deprecated OpenSSL v1 của Duc Le";
      case "/info":
        return "Tình hình công việc, task đang làm và kế hoạch của Minh Tran ra sao?";
      case "/task":
        return "Hiển thị thông tin chi tiết, người phụ trách và tiến độ của task Setup CI/CD GitLab & Docker Runners";
      case "/project":
        return "Hiển thị thông tin chi tiết về dự án Fintech Core Platform, các task và thành viên tham gia";
      case "/free":
        return "Ai đang rảnh việc hoặc có thể nhận thêm task hôm nay?";
      case "/overload":
        return "Ai đang bị quá tải hoặc vượt định mức 8h trong sprint?";
      case "/effort":
        return "Tổng hợp phân bổ effort và tổng số giờ làm của cả team hôm nay";
      case "/load":
        return "Tình trạng tải công việc và băng thông (Bandwidth) của từng kỹ sư";
      case "/report":
        return "Báo cáo phân bổ effort theo từng dự án trong Sprint 14";
      case "/overdue":
        return "Danh sách các task đang bị trễ hạn hoặc cận kề deadline";
      default:
        return `Thực thi lệnh ${cmd} với dữ liệu snapshot realtime`;
    }
  };

  const isInteractiveForm = [
    "/assign",
    "/reassign",
    "/add",
    "/log",
    "/remove",
    "/info",
    "/task",
    "/project",
  ].includes(activeSlashCommand);

  return (
    <motion.section
      id="slash-commands"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.8 }}
      className="py-20 px-4 max-w-6xl mx-auto border-t border-white/[0.06]"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs sm:text-sm font-mono font-medium mb-3.5"
        >
          <Terminal size={15} />
          <span>DEV-FIRST COMMAND WORKFLOW · DỒNG BỘ 100% VỚI COMMAND-TEMPLATE-MODAL.TSX</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Hệ sinh thái Slash Commands (/) & Dynamic Modals trong AI Ask
        </h2>
        <p className="text-sm sm:text-base text-neutral-300">
          Điều phối task và tra cứu thông tin chuẩn xác bằng cách gõ ký tự &quot;/&quot; trong khung chat ở mọi màn hình.
        </p>

        {/* Category Filter Chips with spring physics */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
          {SLASH_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSlashCategory(cat.id)}
              className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full border transition-all ${
                activeSlashCategory === cat.id
                  ? "bg-purple-500/20 border-purple-400/50 text-purple-200 font-semibold shadow-sm"
                  : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06]"
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Authentic Command List Selector */}
        <motion.div
          initial={{ opacity: 0, x: -40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1"
        >
          {SLASH_COMMANDS_LIST.filter(
            (item) => activeSlashCategory === "all" || item.category === activeSlashCategory
          ).map((item) => (
            <motion.button
              key={item.cmd}
              whileHover={{ x: 6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setActiveSlashCommand(item.cmd)}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3.5 ${
                activeSlashCommand === item.cmd
                  ? "bg-white/[0.08] border-purple-400/50 shadow-md shadow-purple-500/10"
                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`font-mono font-bold text-sm ${item.color}`}>{item.cmd}</span>
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                  <span className="text-[11px] px-2 py-0.2 rounded-full bg-white/[0.04] text-neutral-300 border border-white/[0.08]">
                    {item.badge}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-neutral-400 leading-snug">{item.desc}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
                  <span>Aliases:</span>
                  {item.aliases.map((a) => (
                    <span key={a} className="px-1.5 py-0.2 rounded bg-white/[0.03] text-neutral-400">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight
                size={16}
                className={`mt-1 shrink-0 ${activeSlashCommand === item.cmd ? "text-purple-400" : "text-neutral-600"}`}
              />
            </motion.button>
          ))}
        </motion.div>

        {/* Right: Authentic Astryx CommandTemplateModal Frame (100% Đồng bộ) */}
        <motion.div
          initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 rounded-3xl bg-[#0b0f19] border border-white/[0.1] shadow-2xl overflow-hidden sticky top-24"
        >
          {/* Authentic Modal Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 bg-white/[0.02] border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                <PenLine size={18} />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{getModalTitle(activeSlashCommand)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-semibold">
                    {activeSlashCommand}
                  </span>
                </div>
                <div className="text-xs text-neutral-400">
                  Điền form mẫu hoặc chọn tham số để AI tự sinh prompt chuẩn
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/[0.04] text-neutral-400 flex items-center justify-center text-xs">
              <X size={15} />
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlashCommand}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 text-sm"
              >
                {/* 1. Modal Form for /assign */}
                {activeSlashCommand === "/assign" && (
                  <div className="space-y-4">
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
                          <span className="text-xs text-emerald-400 font-mono font-bold">🟢 Rảnh 0%</span>
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

                    {/* Effort Duration Presets */}
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
                            onClick={() => {
                              setSelectedPresetEffort(p.minutes);
                              setCustomEffortLabel(p.text);
                            }}
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

                    {/* Status & Dates */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                        Trạng thái công việc
                      </label>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm flex items-center justify-between">
                        <span>Đang thực hiện (In Progress)</span>
                        <span className="text-xs text-sky-400 font-mono">Status: In Progress</span>
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

                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                        Ghi chú thêm (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="Cần phối hợp với team Dev trước khi deploy"
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-300 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Modal Form for /reassign */}
                {activeSlashCommand === "/reassign" && (
                  <div className="space-y-4">
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
                        Chọn task cần chuyển giao (Tìm thấy 3 task)
                      </label>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white text-sm font-medium">
                        Audit IAM Roles AWS Production (Security & Compliance • 4h)
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">3</span>
                        Chuyển sang cho nhân sự mới tiếp nhận
                      </label>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-emerald-300 flex items-center justify-between text-sm font-medium">
                        <span>Minh Tran (Cloud Eng)</span>
                        <span className="text-xs font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">0m / 480m Rảnh 100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Modal Form for /add */}
                {activeSlashCommand === "/add" && (
                  <div className="space-y-4">
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
                        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                          Giao cho nhân sự (Assignee)
                        </label>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">
                          Alex Nguyen (DevOps)
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Dự án liên quan</label>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">
                          Security & Compliance
                        </div>
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
                )}

                {/* 4. Modal Form for /log */}
                {activeSlashCommand === "/log" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                        Tiêu đề công việc (Task) <span className="text-rose-400">*</span>
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
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">
                          Fintech Core Platform
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Thời điểm hoàn thành</label>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-sky-300 text-sm font-mono">
                          hôm nay (15/09/2026)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Modal Form for /remove */}
                {activeSlashCommand === "/remove" && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle size={16} />
                      <span>Xóa task khỏi hệ thống nếu yêu cầu bị hủy hoặc trùng lặp.</span>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center justify-center font-bold">1</span>
                        Thành viên đang phụ trách task
                      </label>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-200 text-sm">
                        Duc Le (SecOps)
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center justify-center font-bold">2</span>
                        Chọn task cần xóa / hủy
                      </label>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-rose-300 text-sm font-medium">
                        Test Cấu hình Deprecated OpenSSL v1 (60p)
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Modal Form for /info, /task, /project */}
                {activeSlashCommand === "/info" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-neutral-300 block">Chọn thành viên cần tra cứu</label>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white flex items-center justify-between">
                      <span className="font-semibold">Minh Tran (Cloud Eng)</span>
                      <span className="text-xs text-emerald-400 font-mono">🟢 Rảnh việc</span>
                    </div>
                  </div>
                )}

                {activeSlashCommand === "/task" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-neutral-300 block">Tên hoặc từ khóa của task cần tra cứu</label>
                    <input
                      type="text"
                      readOnly
                      value="Setup CI/CD Pipeline GitLab with Docker Runners"
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white text-sm"
                    />
                  </div>
                )}

                {activeSlashCommand === "/project" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-neutral-300 block">Chọn dự án cần tra cứu</label>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.1] text-white flex items-center justify-between">
                      <span className="font-semibold">Fintech Core Platform</span>
                      <span className="text-xs text-sky-400 font-mono">142h / 200h (71%)</span>
                    </div>
                  </div>
                )}

                {/* 7. Instant Query Previews for /free, /overload, /effort, /load, /report, /overdue */}
                {activeSlashCommand === "/free" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 text-xs">
                      <CheckCircle2 size={16} />
                      <span>Kết quả phân giải lệnh /free từ Grounding Firestore:</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-white">Minh Tran (Cloud Eng)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">0m/480m (0% Rảnh)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-white">Alex Nguyen (DevOps)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">180m/480m (Rảnh chiều)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSlashCommand === "/overload" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2 text-xs">
                      <AlertTriangle size={16} />
                      <span>Cảnh báo kỹ sư vượt hạn mức 8h/ngày:</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-white">Duc Le (SecOps)</span>
                        <span className="font-mono text-rose-400 font-bold">540m / 480m (112.5%)</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        Đang gánh 3 task. Khuyến nghị dùng lệnh <code>/reassign</code> để san bớt 1 task sang Minh Tran.
                      </p>
                    </div>
                  </div>
                )}

                {activeSlashCommand === "/effort" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center gap-2 text-xs">
                      <Zap size={16} />
                      <span>Tổng hợp phân bổ effort toàn đội ngũ hôm nay:</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5">
                      <div className="flex justify-between text-xs text-neutral-300">
                        <span>Đã log: 1,040m / 1,920m</span>
                        <span className="font-mono text-violet-300 font-bold">54.2%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full w-[54%]" />
                      </div>
                    </div>
                  </div>
                )}

                {activeSlashCommand === "/load" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2 text-xs">
                      <Activity size={16} />
                      <span>Tình trạng tải công việc và băng thông (Bandwidth):</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-white">An Nguyen</span><span className="text-sky-300 font-mono">320m/480m (66.7%)</span></div>
                      <div className="flex justify-between"><span className="text-white">Duc Le</span><span className="text-rose-400 font-mono font-bold">540m/480m (112.5% 🔴)</span></div>
                      <div className="flex justify-between"><span className="text-white">Minh Tran</span><span className="text-emerald-400 font-mono">0m/480m (0% 🟢)</span></div>
                    </div>
                  </div>
                )}

                {activeSlashCommand === "/report" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center gap-2 text-xs">
                      <Calendar size={16} />
                      <span>Báo cáo tiến độ phân bổ dự án Sprint 14:</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-neutral-300"><span>1. Fintech Core Platform</span><span className="text-sky-300">142h / 200h (71%)</span></div>
                      <div className="flex justify-between text-neutral-300"><span>2. Cloud Migration 2026</span><span className="text-purple-300">96h / 160h (60%)</span></div>
                      <div className="flex justify-between text-neutral-300"><span>3. Security & Compliance</span><span className="text-rose-300">118h / 120h (98% ⚠️)</span></div>
                    </div>
                  </div>
                )}

                {activeSlashCommand === "/overdue" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2 text-xs">
                      <Clock size={16} />
                      <span>Task đang bị trễ hạn hoặc cận kề deadline:</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">Audit IAM Roles AWS Production</div>
                        <div className="text-neutral-400">Phụ trách: Duc Le · Hạn: 13/09/2026</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 font-mono font-bold">Trễ 2 ngày</span>
                    </div>
                  </div>
                )}

                {/* Fallback general commands */}
                {activeSlashCommand !== "/assign" &&
                  activeSlashCommand !== "/reassign" &&
                  activeSlashCommand !== "/add" &&
                  activeSlashCommand !== "/log" &&
                  activeSlashCommand !== "/remove" &&
                  activeSlashCommand !== "/info" &&
                  activeSlashCommand !== "/task" &&
                  activeSlashCommand !== "/project" &&
                  activeSlashCommand !== "/free" &&
                  activeSlashCommand !== "/overload" &&
                  activeSlashCommand !== "/effort" &&
                  activeSlashCommand !== "/load" &&
                  activeSlashCommand !== "/report" &&
                  activeSlashCommand !== "/overdue" && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2 text-xs text-neutral-300 font-mono">
                      <div>✓ Đồng bộ với Grounding Snapshot Firestore</div>
                      <div>✓ Tự động phân giải tham số và truy vấn tức thì</div>
                    </div>
                  )}

                {/* Authentic Live Prompt Preview Box (Signature of CommandTemplateModal) */}
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      Xem trước nội dung câu lệnh gửi AI:
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">Auto-generated</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.1] text-sky-200 font-mono text-xs leading-relaxed">
                    {getGeneratedPrompt(activeSlashCommand)}
                  </div>
                </div>

                {/* Authentic Action Buttons Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-medium text-xs sm:text-sm transition-all"
                  >
                    Đóng
                  </button>

                  <div className="flex items-center gap-2.5">
                    {isInteractiveForm && (
                      <button
                        type="button"
                        className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <PenLine size={14} />
                        Chèn vào chat
                      </button>
                    )}

                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-sky-500/25"
                    >
                      <Send size={14} />
                      Gửi cho AI ngay
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
