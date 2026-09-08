"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Bot,
  Zap,
  ShieldCheck,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  Terminal,
  Cpu,
  Flame,
  AlertTriangle,
  Database,
  ArrowUpRight,
  Compass,
  Check,
  Send,
  Workflow
} from "lucide-react";

export default function LandingPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"ai-chat" | "capacity" | "grounding" | "timeline">("ai-chat");
  const [interactiveChatInput, setInteractiveChatInput] = useState<string>("/plan Task nâng cấp ArgoCD v2.10 cho cluster Production, effort 2md @Sarah");
  const [simulatedLogState, setSimulatedLogState] = useState<boolean>(false);

  return (
    <div className="min-h-[100dvh] bg-[#070a0f] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans relative">
      {/* Background Ambience & Lighting */}
      <div className="fixed inset-0 bg-tech-grid opacity-35 pointer-events-none" />
      <div className="glow-orb-cyan top-[-100px] left-1/2 -translate-x-1/2 opacity-20" />
      <div className="glow-orb-emerald top-[800px] right-[-150px] opacity-15" />
      <div className="glow-orb-cyan top-[2200px] left-[-200px] opacity-10" />

      {/* Floating Island Navigation */}
      <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-2.5 rounded-full bg-[#0d131f]/80 backdrop-blur-2xl border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform duration-300">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                DevOps Tracker
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  AI v2.0
                </span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-cyan-300 transition-colors">
              Tính năng
            </a>
            <a href="#interactive-playground" className="hover:text-cyan-300 transition-colors">
              Trải nghiệm mẫu
            </a>
            <a href="#grounding-ai" className="hover:text-cyan-300 transition-colors">
              Kiến trúc Grounding
            </a>
            <a href="#matrix" className="hover:text-cyan-300 transition-colors">
              Ma trận tải
            </a>
            <a href="#comparison" className="hover:text-cyan-300 transition-colors">
              So sánh giải pháp
            </a>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              NVIDIA Llama 3.3
            </div>

            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold text-xs transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98]"
            >
              <span>Vào Hệ Thống</span>
              <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={13} className="text-slate-950" />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 md:pb-28 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-[0.16em] mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-subtle-float">
          <Sparkles size={13} className="text-cyan-400" />
          DevOps Resource Intelligence Engine
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          Kiểm Soát Effort & Năng Lực Đội Ngũ DevOps{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Theo Thời Gian Thực
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Tự động hóa log công số bằng AI đa phương thức NVIDIA Llama 3.3. Phát hiện quá tải đội ngũ tức thì và trả lời câu hỏi của lãnh đạo với độ chính xác tuyệt đối.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-16">
          <Link
            href="/login"
            className="w-full sm:w-auto group inline-flex items-center justify-between sm:justify-start gap-4 pl-6 pr-2 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-semibold text-sm shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-[0.98]"
          >
            <span>Bắt Đầu Trải Nghiệm Miễn Phí</span>
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-all">
              <ArrowUpRight size={15} className="text-cyan-300" />
            </div>
          </Link>

          <a
            href="#interactive-playground"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition-all duration-200"
          >
            <Compass size={16} />
            <span>Khám Phá Bản Live Demo</span>
          </a>
        </div>

        {/* Hero Visual Showcase (Double-Bezel Machined Frame) */}
        <div className="w-full max-w-6xl doppelrand-shell p-2 sm:p-3 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition duration-1000 -z-10" />

          <div className="doppelrand-core overflow-hidden relative border border-white/10">
            {/* Window header simulation */}
            <div className="px-4 py-3 bg-[#0a0f18] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">devops-effort-tracker // live-telemetry</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE (NVIDIA-API-SYNC)
                </span>
              </div>
            </div>

            {/* Visual Image */}
            <div className="relative aspect-[16/9] w-full bg-[#080d16]">
              <Image
                src="/landing/hero-platform.jpg"
                alt="DevOps Effort Tracker Dashboard Interface"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Technology Powerhouse Strip */}
      <section className="py-12 border-y border-white/[0.06] bg-[#0a0f18]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-mono uppercase tracking-[0.2em] text-slate-400 mb-8">
            Kiến Trúc Kỹ Thuật Đạt Chuẩn Enterprise
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg">
                <Cpu size={20} />
                <span>NVIDIA Build AI</span>
              </div>
              <p className="text-xs text-slate-400">Llama 3.3 70B & Vision 90B</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-lg">
                <Database size={20} />
                <span>Google Firebase</span>
              </div>
              <p className="text-xs text-slate-400">Realtime Firestore & Storage</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-lg">
                <ShieldCheck size={20} />
                <span>Zero-Hallucination</span>
              </div>
              <p className="text-xs text-slate-400">Grounding Engine Factual Q&A</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-lg">
                <Layers size={20} />
                <span>Next.js 15 + Astryx</span>
              </div>
              <p className="text-xs text-slate-400">High-Performance Reactive UI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Playground / Simulation */}
      <section id="interactive-playground" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono uppercase tracking-[0.18em] mb-4">
            Trực Quan Hóa Tác Vụ
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
            Trải Nghiệm Các Tính Năng Cốt Lõi
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Khám phá cách nền tảng biến các dòng chat tự do thành dữ liệu tiến độ và công số chuẩn xác.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-full bg-[#0c1320] border border-white/10 gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ai-chat")}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === "ai-chat"
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot size={15} />
              <span>AI Chat & Slash Command</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("capacity")}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === "capacity"
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 size={15} />
              <span>Ma Trận Năng Lực</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grounding")}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === "grounding"
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={15} />
              <span>Grounding AI (Leader)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === "timeline"
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar size={15} />
              <span>Timeline Tiến Độ</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="doppelrand-shell p-3 sm:p-4">
          <div className="doppelrand-core p-6 sm:p-8 min-h-[440px] flex flex-col justify-center">
            {activeTab === "ai-chat" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                    <Terminal size={12} />
                    <span>Llama 3.3 70B Instruct</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Ghi Nhận Công Số Bằng Ngôn Ngữ Tự Nhiên</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Kỹ sư chỉ cần chat tự do hoặc dùng lệnh nhanh (`/plan`, `/assign`, `/project`). AI tự động trích xuất: tiêu đề task, thành viên, effort quy đổi (man-days), độ ưu tiên và thời hạn mà không cần mở form phức tạp.
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Hỗ trợ đính kèm ảnh chụp lỗi/kiến trúc qua Llama Vision 90B</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Tự động retry và validate bằng Zod Schema trước khi lưu Firestore</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#060a11] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-inner">
                  {/* Chat Mock Stream */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan-500/20 border border-cyan-500/30 p-3 text-xs text-slate-200">
                        <p className="font-mono text-cyan-300 mb-1">$ devops-user:</p>
                        {interactiveChatInput}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <Bot size={15} />
                      </div>
                      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-[#0c121e] border border-emerald-500/30 p-4 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <Sparkles size={12} /> Đã phân tích Task thành công
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Confidence: 98%
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Tiêu đề:</span>
                            <span className="font-medium text-white">Nâng cấp ArgoCD v2.10 cho Production</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Thành viên phụ trách:</span>
                            <span className="text-cyan-300 font-medium">Sarah Chen (DevOps)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Ước tính Effort:</span>
                            <span className="text-amber-400 font-mono font-bold">2.0 Man-days (~16h)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Trạng thái:</span>
                            <span className="text-emerald-400 font-mono">planned // sync-ready</span>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setSimulatedLogState(true)}
                            className="px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Check size={12} />
                            {simulatedLogState ? "Đã xác nhận & Lưu vào Firestore!" : "Xác nhận ghi nhận Task"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive input simulator */}
                  <div className="pt-2 flex items-center gap-2 border-t border-white/5">
                    <input
                      type="text"
                      value={interactiveChatInput}
                      onChange={(e) => setInteractiveChatInput(e.target.value)}
                      placeholder="Thử nhập lệnh hoặc câu log công việc..."
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setSimulatedLogState(false)}
                      className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
                      title="Gửi test"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "capacity" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                    <AlertTriangle size={12} />
                    <span>Overload Anomaly Detector</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Cảnh Báo Quá Tải & Cân Bằng Năng Lực</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Hệ thống tự động tính toán tổng số % effort và man-days từ các task `in_progress` của từng kỹ sư. Cảnh báo đỏ tức thì khi thành viên bị gán quá 100% công suất trong sprint.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#090e17] border border-emerald-500/20">
                      <span className="text-xs text-slate-400 block">Khả dụng (&lt;50%)</span>
                      <span className="text-emerald-400 font-semibold text-base">Available</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#090e17] border border-rose-500/30">
                      <span className="text-xs text-slate-400 block">Quá tải (&gt;100%)</span>
                      <span className="text-rose-400 font-semibold text-base">Overloaded Alert</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#060a11] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
                  {/* Member 1: Overloaded */}
                  <div className="p-3.5 rounded-xl bg-[#0d1422] border border-rose-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-xs text-white">
                          DK
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">David Kim</p>
                          <p className="text-[11px] text-slate-400">Senior SRE // IaC & Kubernetes</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-bold">
                        115% Overloaded
                      </span>
                    </div>
                    <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[100%]" />
                    </div>
                    <p className="text-[10px] text-rose-300 font-mono">
                      ⚠ Cảnh báo: Đang gánh 4 task song song. Cần san tải cho thành viên khác.
                    </p>
                  </div>

                  {/* Member 2: Balanced */}
                  <div className="p-3.5 rounded-xl bg-[#0d1422] border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-xs text-white">
                          SC
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Sarah Chen</p>
                          <p className="text-[11px] text-slate-400">DevOps Engineer // CI/CD & Argo</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                        75% Balanced
                      </span>
                    </div>
                    <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[75%]" />
                    </div>
                  </div>

                  {/* Member 3: Available */}
                  <div className="p-3.5 rounded-xl bg-[#0d1422] border border-cyan-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                          AK
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Aisha Khan</p>
                          <p className="text-[11px] text-slate-400">Cloud Platform // Terraform</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-mono font-bold">
                        40% Available
                      </span>
                    </div>
                    <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "grounding" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    <ShieldCheck size={12} />
                    <span>Factual Grounding Engine</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Q&A Dành Cho Lãnh Đạo: Không Ảo Giác</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Khác với LLM thông thường hay bịa số liệu, Grounding Engine tự động truy vấn dữ liệu thực từ Firestore Snapshot trước khi sinh câu trả lời. Leader có thể hỏi bất kỳ insight nào về ngân sách và nhân sự.
                  </p>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300">
                      <strong>Leader hỏi:</strong> &ldquo;Ai đang có thời gian để nhận task hạ tầng AWS?&rdquo;
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                      <strong>AI đáp:</strong> Dựa trên dữ liệu thực tế, Aisha Khan đang chỉ sử dụng 40% công suất và có kinh nghiệm AWS.
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#060a11]">
                  <Image
                    src="/landing/grounding-ai.jpg"
                    alt="Grounding AI Pipeline Architecture"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
                    <Workflow size={12} />
                    <span>Gantt & Personal Schedule</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Dòng Thời Gian & Điểm Nghẽn Tiến Độ</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Theo dõi trực quan thời hạn hoàn thành các task theo từng ngày và tuần. Nhận diện các task quá hạn (Overdue) và task sắp đến hạn (Due soon) chỉ trong một giao diện hợp nhất.
                  </p>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Task đang triển khai (In Progress)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Task trong kế hoạch (Planned)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Task hoàn thành (Done)</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#060a11] rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5 font-mono">
                    <span>Sprint: Oct 21 - Nov 3</span>
                    <span>3 Dự Án Đang Hoạt Động</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/30 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-white">Thiết lập Prometheus & Grafana Monitoring</p>
                        <p className="text-[11px] text-slate-400">Phụ trách: Sarah Chen • Project: Core Infra</p>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Due in 2d
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/30 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-white">Migration Database sang Cloud SQL</p>
                        <p className="text-[11px] text-slate-400">Phụ trách: David Kim • Project: Fintech App</p>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Due today
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-sky-500/20 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-white">Tối ưu hóa Docker Build Cache CI/CD</p>
                        <p className="text-[11px] text-slate-400">Phụ trách: Aisha Khan • Project: Pipeline Tooling</p>
                      </div>
                      <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        Planned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Bento Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
            Được Thiết Kế Chuyên Biệt Cho DevOps & Quản Lý Kỹ Thuật
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Mọi tính năng được xây dựng nhằm giải quyết triệt để sự lộn xộn trong việc ước tính công số và phân bổ nhân sự.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Multimodal AI */}
          <div className="md:col-span-7 doppelrand-shell p-2">
            <div className="doppelrand-core p-6 sm:p-8 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                  <Bot size={22} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                  Ghi Log Đa Phương Thức (Chat, Lệnh & Ảnh Chụp)
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Không còn cảnh kỹ sư phải mở form Jira 20 trường thông tin. Gửi trực tiếp log terminal, ảnh chụp sơ đồ hạ tầng hoặc chat ngắn, mô hình Llama-3.2-90B Vision sẽ phân giải thành task có man-days chuẩn hóa.
                </p>
              </div>

              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/landing/ai-multimodal.jpg"
                  alt="AI Multimodal Task Logging"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Capacity Matrix */}
          <div className="md:col-span-5 doppelrand-shell p-2">
            <div className="doppelrand-core p-6 sm:p-8 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                  <BarChart3 size={22} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                  Ma Trận Phân Bổ Năng Lực Thời Gian Thực
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Nhìn thấy ngay ai đang gánh 120% tải và ai đang rảnh rỗi. Giúp Leader ra quyết định điều chuyển task chỉ trong 3 giây.
                </p>
              </div>

              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/landing/capacity-matrix.jpg"
                  alt="DevOps Capacity Allocation Matrix"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Dual Role Experience */}
          <div className="md:col-span-6 doppelrand-shell p-2">
            <div className="doppelrand-core p-6 sm:p-8 h-full">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
                <Users size={22} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Trải Nghiệm 2 Vai Trò: Leader & DevOps Engineer
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Chuyển đổi tức thì giữa góc nhìn của Kỹ sư (tập trung log task, quản lý timeline cá nhân) và góc nhìn của Leader (toàn cảnh dự án, ngân sách man-day và đội ngũ).
              </p>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">LEADER</span>
                  <span>Quản trị phân bổ ngân sách, AI Hỏi-Đáp toàn diện</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">DEVOPS</span>
                  <span>Log công việc siêu tốc, cập nhật tiến độ sprint</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Proactive Notifications & Alerts */}
          <div className="md:col-span-6 doppelrand-shell p-2">
            <div className="doppelrand-core p-6 sm:p-8 h-full">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                <Flame size={22} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Cảnh Báo Vượt Budget & Trễ Hạn Tự Động
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Thông báo thông minh khi dự án sắp tiêu hết số man-days dự kiến hoặc khi có task critical bị quá hạn chưa được xử lý.
              </p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-amber-200">Dự án Kubernetes Core: Đã dùng 88% man-days</span>
                  <span className="text-amber-400 font-mono font-bold">88/100 md</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs">
                  <span className="text-rose-200">Task Nâng cấp Database: Quá hạn 2 ngày</span>
                  <span className="text-rose-400 font-mono font-bold">OVERDUE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix Table (Excel/Jira vs DevOps Tracker) */}
      <section id="comparison" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
            Tại Sao DevOps Tracker Vượt Trội Hơn?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            So sánh trực quan giữa phương pháp quản lý truyền thống và sức mạnh của DevOps Effort Tracker với AI Grounding.
          </p>
        </div>

        <div className="doppelrand-shell p-2 sm:p-3 overflow-x-auto">
          <div className="doppelrand-core p-4 sm:p-6 min-w-[650px]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono text-xs">
                  <th className="pb-4 font-medium">Tiêu chí đánh giá</th>
                  <th className="pb-4 font-medium text-slate-400">Excel / Google Sheets</th>
                  <th className="pb-4 font-medium text-slate-400">Jira / Trello Mặc định</th>
                  <th className="pb-4 font-semibold text-cyan-400">DevOps Effort Tracker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-slate-300">
                <tr>
                  <td className="py-4 font-medium text-white">Cách nhập dữ liệu tiến độ</td>
                  <td className="py-4 text-slate-400">Nhập thủ công từng ô</td>
                  <td className="py-4 text-slate-400">Điền form 15-20 trường phức tạp</td>
                  <td className="py-4 text-emerald-400 font-medium">Chat tự nhiên, gửi ảnh, slash command</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Quy đổi Man-days & Giờ</td>
                  <td className="py-4 text-slate-400">Tự viết công thức dễ lỗi</td>
                  <td className="py-4 text-slate-400">Cần plugin đắt tiền của bên thứ 3</td>
                  <td className="py-4 text-emerald-400 font-medium">Tự động chuẩn hóa bằng NVIDIA AI</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Phát hiện quá tải kỹ sư</td>
                  <td className="py-4 text-slate-400">Không có (phải tự soi mắt)</td>
                  <td className="py-4 text-slate-400">Khó nhìn thấy tổng thể theo % tải</td>
                  <td className="py-4 text-emerald-400 font-medium">Ma trận nhiệt & Cảnh báo đỏ tức thì</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Hỏi đáp báo cáo cho Leader</td>
                  <td className="py-4 text-slate-400">Phải họp hỏi từng người</td>
                  <td className="py-4 text-slate-400">Phải viết JQL filter phức tạp</td>
                  <td className="py-4 text-emerald-400 font-medium">Hỏi AI Grounding trả lời thực tế 100%</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Đồng bộ dữ liệu thời gian thực</td>
                  <td className="py-4 text-slate-400">Dễ bị conflict phiên bản</td>
                  <td className="py-4 text-slate-400">Polling chậm</td>
                  <td className="py-4 text-emerald-400 font-medium">Firebase Firestore dưới 0.5s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom High-Impact Call to Action */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="doppelrand-shell p-3 relative overflow-hidden">
          <div className="doppelrand-core p-8 sm:p-14 relative z-10 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <Zap size={24} strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white max-w-2xl mx-auto">
              Sẵn Sàng Tối Ưu Hóa Năng Lực Đội Ngũ DevOps Của Bạn?
            </h2>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Trải nghiệm ngay không gian làm việc thông minh kết hợp giữa quản lý công số và trí tuệ nhân tạo NVIDIA.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 pl-6 pr-2 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-semibold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-[0.98]"
              >
                <span>Đăng Nhập & Bắt Đầu Ngay</span>
                <div className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={14} className="text-cyan-300" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modern High-End Footer */}
      <footer className="py-12 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity size={14} />
          </div>
          <span className="text-slate-400 font-medium">DevOps Effort Tracker</span>
          <span>© 2026. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-slate-300 transition-colors">
            Tính năng
          </a>
          <a href="#interactive-playground" className="hover:text-slate-300 transition-colors">
            Demo
          </a>
          <a href="#comparison" className="hover:text-slate-300 transition-colors">
            So sánh
          </a>
          <Link href="/login" className="text-cyan-400 hover:underline">
            Đăng nhập hệ thống
          </Link>
        </div>
      </footer>
    </div>
  );
}
