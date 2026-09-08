"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Zap,
  Bot,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Users,
  Send,
} from "lucide-react";

export default function LandingPage(): React.JSX.Element {
  const [activeRoleTab, setActiveRoleTab] = useState<"devops" | "lead">("devops");
  
  // Interactive Hero Simulator states
  const [simulatedPrompt, setSimulatedPrompt] = useState(
    "Setup CI/CD pipeline GitLab with Docker runners cho dự án Fintech mất 3.5 giờ"
  );
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [parsedCard, setParsedCard] = useState<{
    project: string;
    task: string;
    effort: string;
    status: string;
    priority: string;
  } | null>({
    project: "Fintech Core Platform",
    task: "Setup CI/CD GitLab & Docker Runners",
    effort: "3h 30m (210 phút)",
    status: "in_progress",
    priority: "High",
  });

  const [activePreviewMode, setActivePreviewMode] = useState<"interactive" | "mockup">("interactive");

  function handleSimulateAILog(promptText?: string) {
    const textToUse = promptText || simulatedPrompt;
    setIsParsingAI(true);
    setParsedCard(null);
    setTimeout(() => {
      if (textToUse.toLowerCase().includes("k8s") || textToUse.toLowerCase().includes("kubernetes")) {
        setParsedCard({
          project: "Cloud Infrastructure",
          task: "Provision Kubernetes EKS Cluster & Ingress",
          effort: "4h 00m (240 phút)",
          status: "in_progress",
          priority: "Critical",
        });
      } else if (textToUse.toLowerCase().includes("terraform")) {
        setParsedCard({
          project: "DevOps Automation",
          task: "Refactor Terraform AWS VPC & Security Groups",
          effort: "2h 15m (135 phút)",
          status: "planned",
          priority: "Medium",
        });
      } else {
        setParsedCard({
          project: "Fintech Core Platform",
          task: "Setup CI/CD GitLab & Docker Runners",
          effort: "3h 30m (210 phút)",
          status: "in_progress",
          priority: "High",
        });
      }
      setIsParsingAI(false);
    }, 600);
  }

  return (
    <div className="min-h-[100dvh] bg-[#07090e] text-[#e2e8f0] selection:bg-sky-500/30 selection:text-sky-200 overflow-x-hidden relative font-sans">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -left-48 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-[500px] h-[500px] bg-sky-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Grid texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] -z-10"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* 1. FLOATING FLUID ISLAND NAVBAR */}
      <header className="fixed top-5 inset-x-0 z-50 px-4 pointer-events-none">
        <nav className="max-w-6xl mx-auto pointer-events-auto h-14 px-4 sm:px-6 rounded-full bg-[#0d131f]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-between transition-all duration-300">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 p-[1px] flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#090d14] rounded-[11px] flex items-center justify-center text-sky-400">
                <Zap size={16} className="fill-sky-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                DevOps Effort Hub
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-medium">
                  AI
                </span>
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-300">
            <a href="#features" className="hover:text-white transition-colors">
              Tính năng cốt lõi
            </a>
            <a href="#matrix" className="hover:text-white transition-colors">
              Ma trận tải
            </a>
            <a href="#timeline" className="hover:text-white transition-colors">
              Gantt Sprint
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Quy trình AI
            </a>
            <a href="#roles" className="hover:text-white transition-colors">
              Góc nhìn vai trò
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-xs font-medium text-neutral-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
            >
              Đăng nhập
            </Link>

            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            >
              <span>Vào App</span>
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight size={11} strokeWidth={2.5} />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-sky-400 text-xs font-medium tracking-wide mb-6 shadow-sm backdrop-blur-md">
            <Sparkles size={13} className="animate-pulse text-sky-300" />
            <span>NỀN TẢNG ĐIỀU PHỐI EFFORT DEVOPS THẾ HỆ MỚI · NVIDIA NIM AI</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Kiểm soát Effort & Năng lực Đội ngũ DevOps{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">
              theo Thời Gian Thực
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-300/90 max-w-2xl font-normal leading-relaxed mb-9">
            Xóa bỏ bảng tính rời rạc và việc log giờ thủ công. Trực quan hóa ma trận tải, tự động cảnh báo quá tải / trễ
            hạn và ghi nhận task bằng AI Copilot qua một câu chat.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-14 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white font-medium text-sm shadow-[0_0_30px_-5px_rgba(56,189,248,0.4)] hover:shadow-[0_0_40px_-3px_rgba(56,189,248,0.6)] hover:brightness-105 active:scale-[0.98] transition-all duration-300"
            >
              <span>Khám phá Dashboard Live</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </div>
            </Link>

            <a
              href="#workflow"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-neutral-200 font-medium text-sm backdrop-blur-sm active:scale-[0.98] transition-all duration-200"
            >
              <Bot size={16} className="text-sky-400" />
              <span>Xem AI Trợ lý hoạt động</span>
            </a>
          </div>

          {/* Mode Switcher for Hero Showcase */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <button
              onClick={() => setActivePreviewMode("interactive")}
              className={`px-3.5 py-1.2 rounded-full text-xs font-medium transition-all ${
                activePreviewMode === "interactive"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              ⚡ Thử Nghiệm AI Tương Tác
            </button>
            <button
              onClick={() => setActivePreviewMode("mockup")}
              className={`px-3.5 py-1.2 rounded-full text-xs font-medium transition-all ${
                activePreviewMode === "mockup"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              🖥️ Giao Diện Toàn Cảnh
            </button>
          </div>
        </div>

        {/* DOUBLE-BEZEL HARDWARE HERO PREVIEW */}
        <div className="relative mt-2 max-w-6xl mx-auto">
          {/* Outer Shell */}
          <div className="p-2 sm:p-3 rounded-[2rem] bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Inner Core */}
            <div className="rounded-[calc(2rem-0.625rem)] bg-[#090e18] border border-white/[0.06] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              {/* Window Titlebar */}
              <div className="h-11 px-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-neutral-500 font-mono ml-2">devops-effort-tracker.internal</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>REALTIME SYNC ACTIVE</span>
                  </div>
                </div>
              </div>

              {activePreviewMode === "interactive" ? (
                /* Interactive Live Simulator */
                <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: AI Prompt Simulator */}
                  <div className="lg:col-span-6 flex flex-col justify-between gap-5 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.06]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/20">
                            <Bot size={16} />
                          </div>
                          <span className="text-sm font-semibold text-white">AI Work Logging Sandbox</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-neutral-400 font-mono">
                          Llama-3.3-70B
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                        Thử nhập một câu mô tả công việc DevOps bằng ngôn ngữ tự nhiên. AI sẽ tự động phân tích và sinh
                        ra phiếu công việc chuẩn hóa:
                      </p>

                      {/* Quick Chips */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={() => {
                            const prompt = "Setup CI/CD pipeline GitLab with Docker runners cho dự án Fintech mất 3.5 giờ";
                            setSimulatedPrompt(prompt);
                            handleSimulateAILog(prompt);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.06] hover:border-sky-500/30 text-neutral-300 hover:text-sky-300 transition-all text-left"
                        >
                          ⚡ Fintech CI/CD (3.5h)
                        </button>
                        <button
                          onClick={() => {
                            const prompt = "Triển khai Kubernetes EKS cluster và cấu hình Ingress 4 tiếng";
                            setSimulatedPrompt(prompt);
                            handleSimulateAILog(prompt);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.06] hover:border-sky-500/30 text-neutral-300 hover:text-sky-300 transition-all text-left"
                        >
                          ☸️ K8s EKS Cluster (4h)
                        </button>
                        <button
                          onClick={() => {
                            const prompt = "Viết Terraform module cho VPC và Security Group mất 2h15m";
                            setSimulatedPrompt(prompt);
                            handleSimulateAILog(prompt);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-sky-500/15 border border-white/[0.06] hover:border-sky-500/30 text-neutral-300 hover:text-sky-300 transition-all text-left"
                        >
                          ☁️ Terraform VPC (2h15)
                        </button>
                      </div>

                      {/* Input Box */}
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={simulatedPrompt}
                          onChange={(e) => setSimulatedPrompt(e.target.value)}
                          placeholder="Nhập task DevOps vừa làm..."
                          className="w-full text-xs p-3 pr-10 rounded-xl bg-black/40 border border-white/[0.1] text-white focus:outline-none focus:border-sky-500/50 resize-none font-mono"
                        />
                        <button
                          onClick={() => handleSimulateAILog()}
                          disabled={isParsingAI || !simulatedPrompt.trim()}
                          className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-400 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Output Parsed Card */}
                    <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] min-h-[140px] flex flex-col justify-center">
                      {isParsingAI ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-4 text-sky-400">
                          <Bot size={22} className="animate-spin" />
                          <span className="text-xs font-mono">NVIDIA NIM đang phân tích ngữ nghĩa...</span>
                        </div>
                      ) : parsedCard ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                              {parsedCard.project}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Đã trích xuất JSON
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-white">{parsedCard.task}</div>
                          <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1 border-t border-white/[0.06]">
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-sky-400" />
                              <span className="text-neutral-200 font-mono font-medium">{parsedCard.effort}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Flame size={12} className="text-amber-400" />
                              <span className="text-neutral-300">Ưu tiên: {parsedCard.priority}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-500 text-center py-4">
                          Bấm nút gửi để xem AI trích xuất task
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Mini Capacity Matrix & Sprint Timeline */}
                  <div className="lg:col-span-6 flex flex-col gap-4">
                    {/* Realtime Capacity Matrix Snippet */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wider">
                          <Users size={14} className="text-sky-400" />
                          <span>Ma trận tải kỹ sư (Real-time Capacity)</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">100% Đồng bộ</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Member 1: Alex */}
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                              AN
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">An Nguyen (Senior DevOps)</div>
                              <div className="text-[10px] text-neutral-400 truncate">K8s · Terraform · AWS</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-sky-300 font-semibold">320m / 480m</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                              Vừa tải 67%
                            </span>
                          </div>
                        </div>

                        {/* Member 2: Minh */}
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">
                              MT
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">Minh Tran (Cloud Eng)</div>
                              <div className="text-[10px] text-neutral-400 truncate">CI/CD · Docker · GCP</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-emerald-300 font-semibold">0m / 480m</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                              Rảnh việc 🟢
                            </span>
                          </div>
                        </div>

                        {/* Member 3: Duc */}
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
                              DL
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">Duc Le (SecOps)</div>
                              <div className="text-[10px] text-neutral-400 truncate">Vault · Ansible · Linux</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-rose-300 font-semibold">540m / 480m</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                              Quá tải 112% ⚠️
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gantt Sprint Preview Strip */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-sky-400" />
                        <span className="text-xs font-medium text-neutral-200">Gantt Sprint 14 · Tuần 38</span>
                      </div>
                      <Link
                        href="/dashboard"
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                      >
                        <span>Mở toàn cảnh Gantt</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* High-Res Visual Render */
                <div className="relative aspect-[16/9] w-full bg-[#090d14]">
                  <Image
                    src="/images/hero.jpg"
                    alt="DevOps Effort Hub Full Interface"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY METRICS STRIP (HIGH-CONTRAST MONO) */}
      <section className="py-12 border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
              -70%
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1.5">Thời gian ghi log công việc</div>
          </div>

          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              100%
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1.5">Minh bạch phân bổ & chống quá tải</div>
          </div>

          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
              0 Task
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1.5">Bị trễ hạn không được cảnh báo</div>
          </div>

          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
              15+
            </div>
            <div className="text-xs text-neutral-400 font-medium mt-1.5">Lệnh Slash Commands thông minh</div>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM VS THE SOLUTION */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Tối ưu hóa quản lý nỗ lực DevOps
          </h2>
          <p className="text-sm text-neutral-400">
            Sự khác biệt giữa cách điều phối thủ công phân mảnh và hệ thống tập trung thời gian thực.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/[0.02] border border-rose-500/15">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">
              Cách Quản Lý Truyền Thống
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-neutral-300">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✕
                </span>
                <span>
                  <strong>Mất 20 phút mỗi ngày</strong> mở bảng tính Excel / Jira chỉ để log lại số giờ làm việc.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✕
                </span>
                <span>
                  <strong>Tech Lead mù mờ về tải công việc:</strong> Không rõ ai đang làm việc kiệt sức (&gt;10h/ngày),
                  ai đang trống việc để giao task khẩn.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✕
                </span>
                <span>
                  <strong>Trễ hạn phát hiện muộn:</strong> Chỉ nhận ra task bị chậm khi sprint đã kết thúc hoặc dự án bị
                  escalate.
                </span>
              </li>
            </ul>
          </div>

          {/* With DevOps Effort Hub */}
          <div className="p-6 sm:p-8 rounded-3xl bg-sky-500/[0.04] border border-sky-500/25 shadow-lg shadow-sky-500/5">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-4">
              Với DevOps Effort Hub & AI
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                <span>
                  <strong>Log task trong 3 giây:</strong> Gõ chat tự nhiên hoặc dán ảnh chụp màn hình, AI tự trích xuất
                  metadata chính xác.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                <span>
                  <strong>Ma trận tải thời gian thực:</strong> Trực quan hóa 3 mức độ (Rảnh 🟢, Vừa tải 🔵, Quá tải 🔴)
                  giúp cân bằng nguồn lực tức thì.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                <span>
                  <strong>Cảnh báo thông minh tự động:</strong> Tự động quét deadline, thông báo đa kênh trước khi phát
                  sinh trễ hạn dự án.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. BENTO GRID FEATURES SHOWCASE */}
      <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Hệ sinh thái tính năng chuyên sâu cho DevOps
          </h2>
          <p className="text-sm text-neutral-400">
            Được thiết kế tỉ mỉ bởi các kỹ sư DevOps dành riêng cho các đội ngũ phát triển và hạ tầng hiện đại.
          </p>
        </div>

        {/* 4-Cell Bento Master Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cell 1: AI Copilot (Col-span 8) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10 max-w-xl mb-6">
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 w-fit mb-4 border border-sky-500/25">
                <Bot size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Trợ Lý AI Ghi Nhận Công Việc & Leader Q&A
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300/80 leading-relaxed">
                Tích hợp mô hình NVIDIA LLaMA 3.3 70B & Vision 90B. Hỗ trợ nhập lệnh chat tự nhiên, bóc tách ảnh chụp
                màn hình, và trả lời câu hỏi điều hành dựa trên 100% dữ liệu thực tế (Grounding Snapshot).
              </p>
            </div>

            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/[0.08]">
              <Image
                src="/images/ai_copilot.jpg"
                alt="AI Work Logging Copilot"
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Cell 2: Capacity Matrix (Col-span 4) */}
          <div
            id="matrix"
            className="lg:col-span-4 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="relative z-10 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 w-fit mb-4 border border-emerald-500/25">
                <Activity size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ma Trận Năng Lực Thời Gian Thực</h3>
              <p className="text-xs sm:text-sm text-neutral-300/80 leading-relaxed">
                Phát hiện quá tải tức thì (&gt;100% / 480m/ngày), tìm kiếm kỹ sư theo kỹ năng (K8s, Docker, AWS) và phân
                bổ ngân sách giờ theo từng dự án.
              </p>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.08]">
              <Image
                src="/images/capacity_matrix.jpg"
                alt="Capacity & Workload Matrix"
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Cell 3: Gantt Sprint Timeline (Col-span 5) */}
          <div
            id="timeline"
            className="lg:col-span-5 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="relative z-10 mb-6">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 w-fit mb-4 border border-amber-500/25">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Biểu Đồ Gantt Sprint Đa Chiều</h3>
              <p className="text-xs sm:text-sm text-neutral-300/80 leading-relaxed">
                Theo dõi tiến độ toàn đội (Team Timeline) và lộ trình cá nhân (Member Gantt) theo tuần/tháng, tự động
                tính toán ngày hoàn thành dựa trên effort.
              </p>
            </div>

            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.08]">
              <Image
                src="/images/gantt_sprint.jpg"
                alt="Gantt Sprint Timeline"
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Cell 4: Slash Commands & Modals (Col-span 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 w-fit mb-4 border border-purple-500/25">
                <Terminal size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Hệ Thống 15+ Slash Commands Tiện Lợi</h3>
              <p className="text-xs sm:text-sm text-neutral-300/80 leading-relaxed mb-4">
                Điều phối công việc nhanh chuẩn phong cách Developer với phím tắt gõ lệnh và Form nhập liệu thông minh:
              </p>

              {/* Slash commands showcase chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 text-xs">
                  <span className="font-mono text-sky-400 font-bold">/coord-assign</span>
                  <span className="text-[11px] text-neutral-400 truncate">Giao task mới</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 text-xs">
                  <span className="font-mono text-rose-400 font-bold">/resource-overload</span>
                  <span className="text-[11px] text-neutral-400 truncate">Kỹ sư quá tải</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 text-xs">
                  <span className="font-mono text-emerald-400 font-bold">/resource-free</span>
                  <span className="text-[11px] text-neutral-400 truncate">Kỹ sư đang rảnh</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 text-xs">
                  <span className="font-mono text-amber-400 font-bold">/report-overdue</span>
                  <span className="text-[11px] text-neutral-400 truncate">Báo cáo trễ hạn</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 text-xs">
                  <span className="font-mono text-purple-400 font-bold">/detail-project</span>
                  <span className="text-[11px] text-neutral-400 truncate">Chi tiết dự án</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 text-xs">
                  <span className="font-mono text-cyan-400 font-bold">/coord-log</span>
                  <span className="text-[11px] text-neutral-400 truncate">Ghi log nhanh</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between text-xs text-sky-200">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-sky-400" />
                <span>Mở nhanh bằng cách gõ ký tự &quot;/&quot; trong khung chat ở bất kỳ trang nào.</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 3-STEP WORKFLOW SIMULATOR */}
      <section id="workflow" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Quy trình vận hành 3 bước liền mạch
          </h2>
          <p className="text-sm text-neutral-400">
            Từ suy nghĩ của kỹ sư đến dữ liệu phân bổ trên dashboard chỉ trong tích tắc.
          </p>
        </div>

        <div className="relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden border border-white/[0.1] shadow-2xl mb-12">
          <Image
            src="/images/workflow_steps.jpg"
            alt="3-Step AI Workflow Architecture"
            fill
            className="object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Gõ Chat Hoặc Dán Ảnh</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Kỹ sư chỉ cần mô tả nhanh công việc hoặc dán ảnh chụp Jira/Terminal vào khung chat nổi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">AI Phân Tích & Chuẩn Hóa</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              LLaMA 3.3 tự động xác định Dự án, Tên nhiệm vụ, Thời lượng (phút/giờ) và Deadline dự kiến.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Đồng Bộ Toàn Hệ Thống</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Task được lưu ngay vào Firestore realtime, cập nhật tức thì vào Gantt Sprint và Ma trận tải.
            </p>
          </div>
        </div>
      </section>

      {/* 7. ROLE-TAILORED VALUE TABS */}
      <section id="roles" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Thiết kế riêng cho từng vai trò trong team
          </h2>
          <p className="text-sm text-neutral-400">
            Trải nghiệm được cá nhân hóa hoàn hảo cho Kỹ sư triển khai và Người quản lý điều hành.
          </p>

          <div className="inline-flex p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mt-6">
            <button
              onClick={() => setActiveRoleTab("devops")}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeRoleTab === "devops"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              👨‍💻 Dành cho DevOps Engineers
            </button>
            <button
              onClick={() => setActiveRoleTab("lead")}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeRoleTab === "lead"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              👑 Dành cho Tech Leads & PMs
            </button>
          </div>
        </div>

        {activeRoleTab === "devops" ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-sky-400 font-bold text-sm">01. DevOps Workspace Riêng</div>
              <div className="text-base font-semibold text-white">Không Gian Làm Việc Tập Trung</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Xem ngay danh sách task Đang làm (In Progress), Kế hoạch (Planned) và Đã xong (Done) mà không bị phân tâm
                bởi thông tin của toàn công ty.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sky-400 font-bold text-sm">02. 1-Click Update</div>
              <div className="text-base font-semibold text-white">Chuyển Trạng Thái Siêu Tốc</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Đánh dấu hoàn thành hoặc bắt đầu task chỉ với 1 cú nhấp chuột. Hệ thống tự động tính toán lại tổng thời
                lượng effort trong ngày.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sky-400 font-bold text-sm">03. Teammate Pairing</div>
              <div className="text-base font-semibold text-white">Chủ Động Bắt Cặp Phối Hợp</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Biết được đồng đội nào đang rảnh việc hoặc có kỹ năng phù hợp để chủ động nhờ hỗ trợ giải quyết sự cố hạ
                tầng.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold text-sm">01. Q&A Grounding</div>
              <div className="text-base font-semibold text-white">Hỏi Đáp Điều Hành Thông Minh</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hỏi AI: &quot;Ai đang rảnh để nhận task?&quot;, &quot;Dự án nào đang quá tải ngân sách?&quot; &mdash; Trợ lý AI trả lời dựa trên
                100% dữ liệu thực từ Firestore.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold text-sm">02. Resource Allocation</div>
              <div className="text-base font-semibold text-white">Cân Bằng Tải & Ngân Sách Giờ</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Dễ dàng điều phối công việc, giao task mới cho thành viên qua Modal Template hoặc phân công theo từng dự
                án trọng điểm.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold text-sm">03. Proactive Alerts</div>
              <div className="text-base font-semibold text-white">Cảnh Báo Rủi Ro Tức Thì</div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hệ thống tự động phát hiện task trễ hạn, tạo notification cảnh báo để bạn xử lý trước khi ảnh hưởng đến
                tiến độ bàn giao.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 8. ENTERPRISE INFRASTRUCTURE & ARCHITECTURE */}
      <section className="py-24 px-4 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <ShieldCheck size={14} />
              <span>KIẾN TRÚC ENTERPRISE CLOUD</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Xây dựng trên nền tảng công nghệ dẫn đầu
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300/80 leading-relaxed">
              Tối ưu cho tốc độ phản hồi cực nhanh, bảo mật dữ liệu cấp doanh nghiệp và khả năng mở rộng không giới hạn:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>
                  <strong>Next.js 15 App Router:</strong> Server Components & Streaming SSR mượt mà.
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>
                  <strong>Firebase Firestore Realtime:</strong> Đồng bộ dữ liệu 2 chiều không độ trễ.
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  <strong>NVIDIA NIM APIs:</strong> LLaMA 3.3 70B & Vision 90B chuyên sâu.
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>
                  <strong>Astryx Design System:</strong> Token-backed UX/UI đạt tiêu chuẩn kỹ thuật cao.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative aspect-[16/9] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
            <Image
              src="/images/enterprise_infra.jpg"
              alt="Enterprise Tech Stack and Architecture"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 9. FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <div className="relative p-8 sm:p-14 rounded-[2.5rem] bg-gradient-to-b from-sky-500/15 via-[#0d1525] to-[#090d14] border border-sky-500/30 text-center overflow-hidden shadow-[0_20px_60px_-15px_rgba(56,189,248,0.25)]">
          {/* Ambient light ring */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[450px] h-[250px] bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-sky-300 text-xs font-medium mb-5">
              <Zap size={13} />
              <span>SẴN SÀNG TỐI ƯU HÓA ĐỘI NGŨ DEVOPS?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Bắt đầu kiểm soát nỗ lực & sprint ngay hôm nay
            </h2>

            <p className="text-xs sm:text-base text-neutral-300/90 leading-relaxed mb-8">
              Trải nghiệm bảng điều khiển trực quan, trợ lý AI thông minh và ma trận tải thời gian thực hoàn toàn miễn phí.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold text-sm shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:brightness-110 active:scale-[0.98] transition-all duration-300"
              >
                <span>Truy cập DevOps Effort Hub</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                </div>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-neutral-200 font-medium text-sm transition-all active:scale-[0.98]"
              >
                <span>Đăng nhập tài khoản</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. MINIMAL AGENCY FOOTER */}
      <footer className="py-12 px-4 border-t border-white/[0.06] text-xs text-neutral-400 bg-[#06080c]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Zap size={13} />
            </div>
            <span className="text-white font-bold tracking-tight">DevOps Effort Hub</span>
            <span className="text-neutral-500">· Powered by NVIDIA NIM & Firebase</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Đăng nhập
            </Link>
            <a href="#features" className="hover:text-white transition-colors">
              Tính năng
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Quy trình AI
            </a>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
