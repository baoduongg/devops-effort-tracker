"use client";

import { motion } from "motion/react";
import { Activity } from "lucide-react";

export function LandingComparison() {
  return (
    <motion.section
      id="features"
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
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs sm:text-sm font-mono font-medium mb-3.5">
          <Activity size={15} />
          <span>EFFICIENCY & VISIBILITY COMPARISON</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Tối ưu hóa quản lý nỗ lực DevOps
        </h2>
        <p className="text-sm sm:text-base text-neutral-300">
          Sự khác biệt rõ rệt giữa điều phối thủ công phân mảnh và hệ thống tập trung thời gian thực.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {/* Legacy way - Slides from left with negative tilt */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -1.5, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4, borderColor: "rgba(244,63,94,0.35)" }}
          className="p-7 sm:p-9 rounded-3xl bg-rose-500/[0.02] border border-rose-500/15 transition-all duration-300 shadow-lg shadow-rose-950/20"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-widest">
              Cách Quản Lý Truyền Thống
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-mono">
              Manual / Fragmented
            </span>
          </div>
          <ul className="space-y-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
            <motion.li
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-start gap-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                ✕
              </span>
              <span>
                <strong>Mất 20 phút mỗi ngày:</strong> Kỹ sư phải mở nhiều bảng tính hoặc biểu mẫu Jira phức tạp chỉ để
                log lại số giờ làm việc.
              </span>
            </motion.li>
            <motion.li
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-start gap-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                ✕
              </span>
              <span>
                <strong>Tech Lead mù mờ về tải công việc:</strong> Không rõ ai đang làm việc kiệt sức (&gt;10h/ngày), ai
                đang trống việc để giao task khẩn.
              </span>
            </motion.li>
            <motion.li
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-start gap-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                ✕
              </span>
              <span>
                <strong>Phát hiện trễ hạn muộn màng:</strong> Chỉ nhận ra task bị chậm khi sprint đã kết thúc hoặc đối tác
                khách hàng phản ánh.
              </span>
            </motion.li>
          </ul>
        </motion.div>

        {/* With DevOps Effort Hub - Slides from right with positive tilt & neon aura */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 1.5, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="p-7 sm:p-9 rounded-3xl bg-sky-500/[0.04] border border-sky-500/30 shadow-[0_15px_40px_-10px_rgba(56,189,248,0.15)] relative overflow-hidden transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="text-xs sm:text-sm font-bold text-sky-400 uppercase tracking-widest">
              Với DevOps Effort Hub & AI
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-medium border border-sky-400/30">
              AI Automated & Realtime
            </span>
          </div>
          <ul className="space-y-4 text-sm sm:text-base text-neutral-200 leading-relaxed">
            <motion.li
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-start gap-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm shadow-sm shadow-emerald-500/20">
                ✓
              </span>
              <span>
                <strong>Log task trong 3 giây:</strong> Gõ chat tự nhiên hoặc dán ảnh chụp màn hình, AI tự trích xuất dự
                án, nhiệm vụ, thời lượng và deadline.
              </span>
            </motion.li>
            <motion.li
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-start gap-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm shadow-sm shadow-emerald-500/20">
                ✓
              </span>
              <span>
                <strong>Ma trận tải thời gian thực:</strong> Trực quan hóa 3 mức độ (🟢 Rảnh, 🔵 Vừa tải, 🔴 Quá tải) giúp
                cân bằng nguồn lực tức thì.
              </span>
            </motion.li>
            <motion.li
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-start gap-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm shadow-sm shadow-emerald-500/20">
                ✓
              </span>
              <span>
                <strong>Cảnh báo thông minh tự động:</strong> Tự động quét deadline, gửi thông báo đa kênh trước khi phát
                sinh trễ hạn dự án.
              </span>
            </motion.li>
          </ul>
        </motion.div>
      </div>
    </motion.section>
  );
}
