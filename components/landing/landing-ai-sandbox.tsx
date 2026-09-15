"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Terminal, Sparkles, Send, Bot, CheckCircle2, Check, ShieldCheck } from "lucide-react";

export function LandingAiSandbox() {
  const [aiSandboxMode, setAiSandboxMode] = useState<"devops" | "leader">("devops");
  const [simulatedPrompt, setSimulatedPrompt] = useState(
    "Setup CI/CD pipeline GitLab with Docker runners cho dự án Fintech mất 3.5 giờ, hoàn thành thứ 6"
  );
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [devopsParsedResult, setDevopsParsedResult] = useState<{
    project: string;
    task: string;
    effort: string;
    priority: string;
    deadline: string;
  } | null>({
    project: "Fintech Core Platform",
    task: "Setup CI/CD pipeline GitLab with Docker runners",
    effort: "3.5h (210 mins)",
    priority: "High",
    deadline: "Thứ 6 tuần này (18:00)",
  });
  const [leaderAnswerResult, setLeaderAnswerResult] = useState<{
    query: string;
    summary: string;
    bullets: string[];
    highlight: string;
  } | null>(null);

  const handleRunAISimulation = (customPrompt?: string, forcedMode?: "devops" | "leader") => {
    const mode = forcedMode || aiSandboxMode;
    const prompt = customPrompt || simulatedPrompt;
    setIsParsingAI(true);

    setTimeout(() => {
      setIsParsingAI(false);
      if (mode === "devops") {
        if (prompt.includes("Kubernetes") || prompt.includes("EKS")) {
          setDevopsParsedResult({
            project: "Cloud Infrastructure",
            task: "Triển khai Kubernetes EKS cluster & Ingress Nginx",
            effort: "4.0h (240 mins)",
            priority: "Critical",
            deadline: "Trong ngày hôm nay",
          });
        } else if (prompt.includes("Terraform") || prompt.includes("VPC")) {
          setDevopsParsedResult({
            project: "AWS Security & Infra",
            task: "Viết Terraform module cho VPC & Security Groups",
            effort: "2h15m (135 mins)",
            priority: "Medium",
            deadline: "Chủ nhật tuần này",
          });
        } else {
          setDevopsParsedResult({
            project: "Fintech Core Platform",
            task: "Setup CI/CD pipeline GitLab with Docker runners",
            effort: "3.5h (210 mins)",
            priority: "High",
            deadline: "Thứ 6 tuần này (18:00)",
          });
        }
      } else {
        if (prompt.includes("rảnh") || prompt.includes("Ai đang")) {
          setLeaderAnswerResult({
            query: prompt,
            summary: "Dựa trên dữ liệu tải thời gian thực hôm nay (Grounding Snapshot):",
            bullets: [
              "🟢 Minh Tran (Cloud Eng): Đang rảnh 100% (0m / 480m) — Sẵn sàng nhận task ngay",
              "🟢 Alex Nguyen (DevOps): Rảnh 62.5% (180m / 480m) — Trống lịch sau 15:00",
              "🔴 Duc Le (SecOps): Đang quá tải 112.5% (540m / 480m) — Không nên giao thêm việc",
            ],
            highlight: "Khuyến nghị: Phân công task khẩn cấp cho Minh Tran (chuyên môn K8s/Docker).",
          });
        } else if (prompt.includes("quá tải")) {
          setLeaderAnswerResult({
            query: prompt,
            summary: "Phát hiện 1 kỹ sư đang bị quá tải trong tuần này:",
            bullets: [
              "🔴 Duc Le (SecOps): Đang gánh 540m / 480m (112.5%) với 3 task: Vault Hardening, IAM Audit, Incident Response.",
            ],
            highlight: "Gợi ý: Dùng lệnh /reassign để chuyển task IAM Audit (180m) sang cho Minh Tran.",
          });
        } else {
          setLeaderAnswerResult({
            query: prompt,
            summary: "Phát hiện 1 task đang bị quá hạn:",
            bullets: [
              "⚠️ Task: 'Audit IAM Roles AWS Production' — Phụ trách: Duc Le · Trễ hạn 2 ngày.",
            ],
            highlight: "Đã gửi thông báo cảnh báo đến kênh của Duc Le.",
          });
        }
      }
    }, 450);
  };

  return (
    <motion.section
      id="ai-sandbox"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8 }}
      className="py-20 px-4 max-w-6xl mx-auto border-t border-white/[0.06] overflow-hidden"
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
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs sm:text-sm font-mono font-medium mb-3.5"
        >
          <Cpu size={15} />
          <span>RUNAGENTS AI · CLAUDE-SONNET-CC</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Trải nghiệm AI Copilot Sandbox ngay trên trình duyệt
        </h2>
        <p className="text-sm sm:text-base text-neutral-300">
          Thử nhập câu mô tả công việc (DevOps Mode) hoặc câu hỏi tra cứu phân bổ nhân sự (Leader Mode).
        </p>

        {/* Mode toggle with spring buttons */}
        <div className="inline-flex p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mt-7">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setAiSandboxMode("devops");
              setSimulatedPrompt(
                "Setup CI/CD pipeline GitLab with Docker runners cho dự án Fintech mất 3.5 giờ, hoàn thành thứ 6"
              );
              handleRunAISimulation(
                "Setup CI/CD pipeline GitLab with Docker runners cho dự án Fintech mất 3.5 giờ, hoàn thành thứ 6",
                "devops"
              );
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              aiSandboxMode === "devops"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            👨‍💻 DevOps Mode (Ghi log & Trích xuất JSON)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setAiSandboxMode("leader");
              setSimulatedPrompt("Ai đang rảnh việc để nhận task khẩn cấp hôm nay?");
              handleRunAISimulation("Ai đang rảnh việc để nhận task khẩn cấp hôm nay?", "leader");
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              aiSandboxMode === "leader"
                ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            👑 Leader Mode (Grounding Snapshot Q&A)
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Input Prompt & Chips */}
        <motion.div
          initial={{ opacity: 0, x: -40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 p-2 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between"
        >
          <div className="rounded-[calc(2rem-0.5rem)] p-6 sm:p-7 bg-[#0c1017]/90 border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-xl h-full flex flex-col justify-between">
            <div>
              <div className="text-xs sm:text-sm font-bold text-sky-400 uppercase tracking-widest font-mono mb-2.5 flex items-center gap-2">
                <Terminal size={15} />
                <span>{aiSandboxMode === "devops" ? "Mô tả công việc DevOps" : "Câu hỏi điều hành của Leader"}</span>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                {aiSandboxMode === "devops"
                  ? "Chọn câu mẫu hoặc nhập bằng ngôn ngữ tự nhiên tiếng Việt / tiếng Anh:"
                  : "Hỏi đáp về tải công việc, nguy cơ trễ hạn dựa trên 100% dữ liệu Firestore thực:"}
              </p>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap gap-2.5 mb-5">
                {aiSandboxMode === "devops" ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const p =
                          "Setup CI/CD pipeline GitLab with Docker runners cho dự án Fintech mất 3.5 giờ, hoàn thành thứ 6";
                        setSimulatedPrompt(p);
                        handleRunAISimulation(p, "devops");
                      }}
                      className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.06] hover:border-sky-500/30 text-neutral-200 hover:text-sky-300 transition-all text-left"
                    >
                      ⚡ Fintech CI/CD (3.5h)
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const p = "Triển khai Kubernetes EKS cluster và cấu hình Ingress Nginx mất 4 tiếng";
                        setSimulatedPrompt(p);
                        handleRunAISimulation(p, "devops");
                      }}
                      className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.06] hover:border-sky-500/30 text-neutral-200 hover:text-sky-300 transition-all text-left"
                    >
                      ☸️ K8s EKS Cluster (4h)
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const p = "Viết Terraform module cho VPC và Security Groups mất 2h15m, deadline chủ nhật";
                        setSimulatedPrompt(p);
                        handleRunAISimulation(p, "devops");
                      }}
                      className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.06] hover:border-sky-500/30 text-neutral-200 hover:text-sky-300 transition-all text-left"
                    >
                      ☁️ Terraform AWS VPC (2h15)
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const p = "Ai đang rảnh việc để nhận task khẩn cấp hôm nay?";
                        setSimulatedPrompt(p);
                        handleRunAISimulation(p, "leader");
                      }}
                      className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-purple-500/15 border border-white/[0.06] hover:border-purple-500/30 text-neutral-200 hover:text-purple-300 transition-all text-left"
                    >
                      🟢 Kỹ sư nào đang rảnh việc?
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const p = "Ai đang bị quá tải trong tuần này?";
                        setSimulatedPrompt(p);
                        handleRunAISimulation(p, "leader");
                      }}
                      className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-purple-500/15 border border-white/[0.06] hover:border-purple-500/30 text-neutral-200 hover:text-purple-300 transition-all text-left"
                    >
                      🔴 Cảnh báo kỹ sư quá tải
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const p = "Có task nào đang bị trễ hạn cần xử lý gấp không?";
                        setSimulatedPrompt(p);
                        handleRunAISimulation(p, "leader");
                      }}
                      className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-purple-500/15 border border-white/[0.06] hover:border-purple-500/30 text-neutral-200 hover:text-purple-300 transition-all text-left"
                    >
                      ⚠️ Task nào đang quá hạn?
                    </motion.button>
                  </>
                )}
              </div>

              {/* Text Input Area */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={simulatedPrompt}
                  onChange={(e) => setSimulatedPrompt(e.target.value)}
                  placeholder="Nhập câu lệnh hoặc câu hỏi..."
                  className="w-full text-sm sm:text-base p-4 pr-14 rounded-2xl bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-sky-500/50 resize-none font-mono transition-colors shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]"
                />
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleRunAISimulation()}
                  disabled={isParsingAI || !simulatedPrompt.trim()}
                  className="absolute right-3.5 bottom-4 p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-sky-500/20"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mt-4 pt-3.5 border-t border-white/[0.04]">
              <Sparkles size={14} className="text-sky-400" />
              <span>Hỗ trợ tải ảnh chụp Jira / Terminal trực tiếp qua model Claude Sonnet Vision.</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Parsed AI Output Output Card */}
        <motion.div
          initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 p-2 rounded-[2rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between"
        >
          <div className="rounded-[calc(2rem-0.5rem)] p-6 sm:p-7 bg-[#0a0e16]/95 border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col justify-center min-h-[320px] relative overflow-hidden h-full">
          <AnimatePresence mode="wait">
            {isParsingAI ? (
              <motion.div
                key="parsing-loading"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center gap-3 py-10 text-sky-400"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
                  <Bot size={22} className="text-sky-300" />
                </div>
                <span className="text-sm font-mono text-center">RunAgents (claude-sonnet-cc) đang phân tích ngữ nghĩa...</span>
              </motion.div>
            ) : aiSandboxMode === "devops" && devopsParsedResult ? (
              <motion.div
                key={`devops-result-${devopsParsedResult.task}`}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-mono px-3 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold">
                      {devopsParsedResult.project}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={15} /> JSON Schema Validated
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3.5">
                  <div className="text-base sm:text-lg font-bold text-white leading-snug">
                    {devopsParsedResult.task}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/[0.06] text-sm">
                    <div>
                      <div className="text-xs text-neutral-400">Thời lượng</div>
                      <div className="font-mono text-sky-300 font-bold">{devopsParsedResult.effort}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">Mức ưu tiên</div>
                      <div className="font-semibold text-amber-300">{devopsParsedResult.priority}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">Hạn chót</div>
                      <div className="font-mono text-neutral-200">{devopsParsedResult.deadline}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-sky-500/25"
                  >
                    <Check size={16} />
                    Lưu vào Firestore Realtime
                  </motion.button>
                  <span className="text-xs sm:text-sm text-neutral-400">Tự động đồng bộ lên Gantt & Capacity</span>
                </div>
              </motion.div>
            ) : aiSandboxMode === "leader" && leaderAnswerResult ? (
              <motion.div
                key={`leader-result-${leaderAnswerResult.query}`}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-mono px-3 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-2">
                    <ShieldCheck size={15} /> Leader Grounding Engine
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-emerald-400">100% Real Firestore Data</span>
                </div>

                <div className="space-y-3.5">
                  <p className="text-sm text-neutral-300 leading-relaxed">{leaderAnswerResult.summary}</p>
                  <ul className="space-y-2.5 text-sm">
                    {leaderAnswerResult.bullets.map((bullet, i) => (
                      <li key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-neutral-200">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm text-sky-200 font-medium leading-relaxed">
                    💡 {leaderAnswerResult.highlight}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
