"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowUpRight, Activity, Cpu, Terminal } from "lucide-react";

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
          initial={{ opacity: 0, scale: 0.88, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.12] text-sky-400 text-xs sm:text-sm font-medium tracking-wide mb-7 shadow-sm backdrop-blur-md"
        >
          <Sparkles size={15} className="animate-pulse text-sky-300" />
          <span>ĐIỀU PHỐI EFFORT & NĂNG LỰC DEVOPS THỜI GIAN THỰC · RUNAGENTS (CLAUDE-SONNET-CC)</span>
        </motion.div>

        {/* Main Headline with blur-to-focus reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-7"
        >
          Kiểm soát Effort & Năng lực Đội ngũ DevOps{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">
            theo Thời Gian Thực
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-xl text-neutral-300/90 max-w-3xl font-normal leading-relaxed mb-10"
        >
          Xóa bỏ bảng tính rời rạc và việc log giờ thủ công. Trực quan hóa ma trận tải kỹ sư, lịch trình Gantt sprint,
          cảnh báo quá tải / trễ hạn tức thì và ghi nhận task bằng AI Copilot qua một câu chat.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white font-semibold text-base shadow-[0_0_30px_-5px_rgba(56,189,248,0.4)] hover:shadow-[0_0_40px_-3px_rgba(56,189,248,0.6)] hover:brightness-105 active:scale-[0.98] transition-all duration-300"
          >
            <span>Mở Dashboard Trực Tiếp</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </div>
          </Link>

          <a
            href="#screens"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-neutral-200 font-semibold text-base backdrop-blur-sm active:scale-[0.98] transition-all duration-200"
          >
            <Activity size={18} className="text-sky-400" />
            <span>Xem 5 Giao Diện Cốt Lõi</span>
          </a>
        </motion.div>

        {/* Live System Metric Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.44 }}
          className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-neutral-300 mb-2"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Firestore 2-Way Sync Active</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-medium cursor-default"
          >
            <Cpu size={14} />
            <span>RunAgents AI · claude-sonnet-cc</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-medium cursor-default"
          >
            <Terminal size={14} />
            <span>15+ Slash Commands Ready</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
