"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Zap, ArrowUpRight } from "lucide-react";

export function LandingCta() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.92, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 px-4 max-w-5xl mx-auto"
    >
      <div className="relative p-9 sm:p-14 rounded-[2.5rem] bg-gradient-to-b from-sky-500/15 via-[#0d1525] to-[#090d14] border border-sky-500/30 text-center overflow-hidden shadow-[0_20px_60px_-15px_rgba(56,189,248,0.25)]">
        {/* Ambient light ring with breathing animation */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[260px] bg-sky-400/25 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-sky-300 text-xs sm:text-sm font-medium mb-6"
          >
            <Zap size={15} />
            <span>SẴN SÀNG TỐI ƯU HÓA ĐỘI NGŨ DEVOPS?</span>
          </motion.div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
            Bắt đầu kiểm soát nỗ lực & sprint ngay hôm nay
          </h2>

          <p className="text-sm sm:text-lg text-neutral-200 leading-relaxed mb-9">
            Trải nghiệm bảng điều khiển trực quan, trợ lý AI thông minh và ma trận tải thời gian thực hoàn toàn miễn phí.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold text-base shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:brightness-110 transition-all duration-300"
              >
                <span>Truy cập DevOps Effort Hub</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-neutral-200 font-semibold text-base transition-all"
              >
                <span>Đăng nhập tài khoản</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
