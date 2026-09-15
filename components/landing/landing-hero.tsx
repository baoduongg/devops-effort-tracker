"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowUpRight, Activity, Cpu, Terminal, BellRing } from "lucide-react";

export function LandingHero(): React.JSX.Element {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="pt-36 pb-16 md:pt-44 md:pb-24 px-4 max-w-7xl mx-auto"
    >
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-sky-400 mb-7 shadow-sm backdrop-blur-md"
        >
          <Sparkles size={13} className="text-sky-300 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] font-medium text-sky-300">
            REAL-TIME DEVOPS TELEMETRY &amp; COPILOT
          </span>
        </motion.div>

        {/* Main Headline with blur-to-focus reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white leading-[1.08] mb-7 max-w-4xl"
        >
          Kiểm soát Effort &amp; Năng lực Đội ngũ DevOps{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-400">
            theo Thời Gian Thực
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-neutral-300/90 max-w-2xl font-normal leading-relaxed mb-10"
        >
          Trực quan hóa ma trận tải kỹ sư, lịch trình Gantt sprint, cảnh báo quá tải tức thì và tự động hóa ghi nhận task bằng AI Copilot.
        </motion.p>

        {/* CTA Buttons - Island Button Architecture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto group inline-flex items-center justify-between gap-4 pl-7 pr-2.5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white font-semibold text-sm sm:text-base shadow-[0_0_35px_rgba(56,189,248,0.45)] hover:shadow-[0_0_45px_rgba(56,189,248,0.7)] hover:brightness-105 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <span>Mở Dashboard Trực Tiếp</span>
            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/30 transition-all duration-300">
              <ArrowUpRight size={15} strokeWidth={2.5} className="text-white" />
            </span>
          </Link>

          <a
            href="#screens"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-neutral-200 font-medium text-sm backdrop-blur-md active:scale-[0.98] transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            <Activity size={16} className="text-sky-400" />
            <span>Khám Phá 5 Giao Diện</span>
          </a>
        </motion.div>

        {/* Live System Metric Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.44 }}
          className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-neutral-300 mb-2"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Firestore Realtime Sync</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-medium cursor-default"
          >
            <Cpu size={14} />
            <span>RunAgents AI · claude-sonnet-cc</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-medium cursor-default"
          >
            <BellRing size={14} className="text-cyan-400" />
            <span>ChatOps Webhook Alerts</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-medium cursor-default"
          >
            <Terminal size={14} />
            <span>15+ Slash Commands</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
