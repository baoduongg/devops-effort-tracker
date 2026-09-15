"use client";

import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { TECH_STACK_ITEMS } from "./landing-data";

export function LandingTechStack() {
  return (
    <motion.section
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-mono font-medium mb-3.5">
          <ShieldCheck size={15} />
          <span>ENTERPRISE ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Xây dựng trên nền tảng công nghệ dẫn đầu
        </h2>
        <p className="text-sm sm:text-base text-neutral-300">
          Tối ưu cho tốc độ phản hồi dưới 100ms, độ tin cậy thời gian thực và bảo mật cấp doanh nghiệp.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TECH_STACK_ITEMS.map((card, i) => (
          <motion.div
            key={card.idx}
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${card.border} space-y-2.5 transition-colors`}
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.15 }}
              className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center font-bold text-sm font-mono`}
            >
              {card.idx}
            </motion.div>
            <div className="text-base sm:text-lg font-bold text-white">{card.title}</div>
            <p className="text-sm text-neutral-300 leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
