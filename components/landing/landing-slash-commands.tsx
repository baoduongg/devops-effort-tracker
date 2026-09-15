"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal,
  ChevronRight,
  Send,
  Sparkles,
  PenLine,
  X,
  Bot,
  User,
  Zap,
  Paperclip,
} from "lucide-react";
import {
  SLASH_CATEGORIES,
  SLASH_COMMANDS_LIST,
  SLASH_MODAL_TITLES,
  DEFAULT_SLASH_MODAL_TITLE,
  getSlashUserQuery,
  type SlashCommandItem,
} from "./landing-data";
import {
  CHAT_RESPONSE_REGISTRY,
  AssignFormBody,
  ReassignFormBody,
  AddFormBody,
  LogFormBody,
  RemoveFormBody,
} from "./slash-previews";

export function LandingSlashCommands() {
  const [activeSlashCategory, setActiveSlashCategory] = useState<string>("all");
  const [activeSlashCommand, setActiveSlashCommand] = useState<string>("/free");

  // Interactive Form State in the Preview for modal-based commands
  const [selectedPresetEffort, setSelectedPresetEffort] = useState<number>(240);
  const [customEffortLabel, setCustomEffortLabel] = useState<string>("4 giờ 00 phút");

  const currentCmdItem: SlashCommandItem =
    SLASH_COMMANDS_LIST.find((c) => c.cmd === activeSlashCommand) || SLASH_COMMANDS_LIST[0];

  const isInstantPrompt = currentCmdItem.isInstantPrompt;

  const getModalTitle = (cmd: string) => SLASH_MODAL_TITLES[cmd] ?? DEFAULT_SLASH_MODAL_TITLE;

  const ChatResponse = CHAT_RESPONSE_REGISTRY[activeSlashCommand];

  const getFormGeneratedPrompt = (cmd: string) => {
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
      default:
        return `Thực thi lệnh ${cmd}`;
    }
  };

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
          <span>DEV-FIRST COMMAND WORKFLOW · ĐỒNG BỘ 100% VỚI HỆ THỐNG SLASH COMMANDS & AI CHAT</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Hệ sinh thái Slash Commands (/) & AI Chat Assistant
        </h2>
        <p className="text-sm sm:text-base text-neutral-300">
          Gõ ký tự &quot;/&quot; trong khung chat để kích hoạt lệnh: Hỏi đáp AI tức thì hoặc mở Form điều phối chuẩn xác.
        </p>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
          {SLASH_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveSlashCategory(cat.id)}
              className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
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
        {/* Left: Command List Selector */}
        <motion.div
          initial={{ opacity: 0, x: -40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 space-y-2.5 max-h-[780px] overflow-y-auto pr-1"
        >
          {SLASH_COMMANDS_LIST.filter(
            (item) => activeSlashCategory === "all" || item.category === activeSlashCategory
          ).map((item) => {
            const isSelected = activeSlashCommand === item.cmd;
            return (
              <motion.button
                key={item.cmd}
                whileHover={{ x: 5, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => setActiveSlashCommand(item.cmd)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3.5 cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.08] border-purple-400/50 shadow-md shadow-purple-500/10"
                    : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`font-mono font-bold text-sm ${item.color}`}>{item.cmd}</span>
                    <span className="text-sm font-semibold text-white">{item.name}</span>
                    <span
                      className={`text-[11px] px-2 py-0.2 rounded-full font-medium border ${
                        item.isInstantPrompt
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : "bg-sky-500/15 border-sky-500/30 text-sky-300"
                      }`}
                    >
                      {item.isInstantPrompt ? "⚡ Hỏi ngay" : "📝 Điền mẫu"}
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
                  className={`mt-1 shrink-0 transition-colors ${isSelected ? "text-purple-400" : "text-neutral-600"}`}
                />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Right: Dynamic Interactive Preview (AI Chat or Form Template Modal) */}
        <motion.div
          initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 rounded-3xl bg-[#0b0f19] border border-white/[0.1] shadow-2xl overflow-hidden sticky top-24"
        >
          <AnimatePresence mode="wait">
            {isInstantPrompt ? (
              /* ========================================================= */
              /* 1. AUTHENTIC AI CHAT INTERFACE FOR 'HỎI NGAY' COMMANDS     */
              /* ========================================================= */
              <motion.div
                key={`chat-${activeSlashCommand}`}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col h-full min-h-[620px]"
              >
                {/* Chat Top Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-sky-500/20 via-blue-500/20 to-purple-500/20 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/10">
                      <Sparkles size={18} />
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b0f19] animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>DevOps AI Assistant</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Grounded Realtime
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>RunAgents (Claude 3.5 Sonnet)</span>
                        <span>&bull;</span>
                        <span className="font-mono text-sky-300">{activeSlashCommand}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-neutral-300 border border-white/[0.08] font-mono">
                      ⚡ Hỏi ngay
                    </span>
                  </div>
                </div>

                {/* Chat Message Stream */}
                <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
                  {/* User Query Message */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[85%] space-y-1.5 text-right">
                      <div className="text-xs text-neutral-400 flex items-center justify-end gap-1.5 font-medium">
                        <span className="text-neutral-300 font-semibold">Tech Lead</span>
                        <span>&bull;</span>
                        <span className="font-mono text-[11px]">11:06 AM</span>
                      </div>
                      <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-sm bg-gradient-to-r from-sky-600/90 to-blue-600/90 text-white text-xs sm:text-sm leading-relaxed shadow-lg shadow-sky-600/15 text-left inline-block">
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono text-sky-200 bg-black/20 px-2 py-0.5 rounded w-fit">
                          <Zap size={11} />
                          <span>Lệnh: {activeSlashCommand}</span>
                        </div>
                        {getSlashUserQuery(activeSlashCommand)}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md">
                      <User size={14} />
                    </div>
                  </div>

                  {/* AI Response Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md shadow-purple-500/20">
                      <Bot size={15} />
                    </div>

                    <div className="max-w-[90%] space-y-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">DevOps Effort Hub AI</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-semibold">
                          PRO
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">&bull; 320ms</span>
                      </div>

                      {/* AI Response Card Content based on active command */}
                      <div className="p-4 sm:p-5 rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-neutral-200 space-y-3.5 shadow-xl">
                        {ChatResponse && <ChatResponse onNavigate={setActiveSlashCommand} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authentic Chat Composer Footer */}
                <div className="p-4 sm:p-5 bg-black/50 border-t border-white/[0.08] space-y-2.5">
                  <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/[0.04] border border-white/[0.1] focus-within:border-sky-500/50 transition-all">
                    <span className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-500/30 flex items-center gap-1 shrink-0">
                      <Zap size={12} />
                      {activeSlashCommand}
                    </span>
                    <input
                      type="text"
                      readOnly
                      value="Hỏi thêm chi tiết hoặc gõ '/' để chọn lệnh khác..."
                      className="bg-transparent border-none text-neutral-400 text-xs sm:text-sm focus:outline-none flex-1 font-normal"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        aria-label="Đính kèm tệp"
                        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                      >
                        <Paperclip size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label="Gửi tin nhắn"
                        className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all cursor-pointer"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Sparkles size={11} className="text-amber-400" />
                      RunAgents (Claude 3.5 Sonnet) &bull; Zero-hallucination
                    </span>
                    <span className="text-neutral-400">Nhấn Enter để gửi</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ========================================================= */
              /* 2. AUTHENTIC FORM TEMPLATE MODAL FOR EDIT/ASSIGN COMMANDS */
              /* ========================================================= */
              <motion.div
                key={`modal-${activeSlashCommand}`}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col h-full"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 bg-white/[0.02] border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                      <PenLine size={18} />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>{getModalTitle(activeSlashCommand)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-semibold">
                          {activeSlashCommand}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono">
                          📝 Form Template
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Điền form mẫu hoặc chọn tham số để AI tự sinh prompt chuẩn
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/[0.04] text-neutral-400 flex items-center justify-center text-xs">
                    <X size={15} />
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-5 sm:p-6 space-y-5 flex-1">
                  {activeSlashCommand === "/assign" && (
                    <AssignFormBody
                      selectedPresetEffort={selectedPresetEffort}
                      customEffortLabel={customEffortLabel}
                      onSelectPreset={(minutes, text) => {
                        setSelectedPresetEffort(minutes);
                        setCustomEffortLabel(text);
                      }}
                    />
                  )}
                  {activeSlashCommand === "/reassign" && <ReassignFormBody />}
                  {activeSlashCommand === "/add" && <AddFormBody />}
                  {activeSlashCommand === "/log" && <LogFormBody />}
                  {activeSlashCommand === "/remove" && <RemoveFormBody />}

                  {/* Live Prompt Preview Box */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-400" />
                        Xem trước nội dung câu lệnh gửi AI:
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">Auto-generated</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.1] text-sky-200 font-mono text-xs leading-relaxed">
                      {getFormGeneratedPrompt(activeSlashCommand)}
                    </div>
                  </div>
                </div>

                {/* Modal Action Buttons Footer */}
                <div className="flex items-center justify-between p-5 border-t border-white/[0.08] gap-3 bg-black/30">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-medium text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Đóng
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <PenLine size={14} />
                      Chèn vào chat
                    </button>

                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-sky-500/25 cursor-pointer"
                    >
                      <Send size={14} />
                      Gửi cho AI ngay
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}
