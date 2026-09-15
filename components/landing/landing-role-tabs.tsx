"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users } from "lucide-react";

interface RoleCardItem {
  num: string;
  tag: string;
  title: string;
  desc: string;
}

const DEVOPS_ROLE_CARDS: RoleCardItem[] = [
  {
    num: "01",
    tag: "DevOps Workspace Riêng",
    title: "Không Gian Làm Việc Tập Trung",
    desc: "Xem ngay danh sách task Đang làm (In Progress), Kế hoạch (Planned) và Đã xong (Done) mà không bị phân tâm bởi thông tin của toàn công ty.",
  },
  {
    num: "02",
    tag: "1-Click Fast Update",
    title: "Chuyển Trạng Thái Siêu Tốc",
    desc: "Đánh dấu hoàn thành hoặc bắt đầu task chỉ với 1 cú nhấp chuột. Hệ thống tự động tính toán lại tổng thời lượng effort trong ngày.",
  },
  {
    num: "03",
    tag: "Teammate Pairing",
    title: "Chủ Động Bắt Cặp Phối Hợp",
    desc: "Biết được đồng đội nào đang rảnh việc hoặc có kỹ năng phù hợp để chủ động nhờ hỗ trợ giải quyết sự cố hạ tầng.",
  },
];

const LEAD_ROLE_CARDS: RoleCardItem[] = [
  {
    num: "01",
    tag: "Q&A Grounding Engine",
    title: "Hỏi Đáp Điều Hành Thông Minh",
    desc: 'Hỏi AI: "Ai đang rảnh để nhận task?", "Dự án nào đang quá tải ngân sách?" — Trợ lý AI trả lời dựa trên 100% dữ liệu thực từ Firestore.',
  },
  {
    num: "02",
    tag: "Resource Balancing",
    title: "Cân Bằng Tải & Ngân Sách Giờ",
    desc: "Dễ dàng điều phối công việc, giao task mới cho thành viên qua Modal Template hoặc phân công theo từng dự án trọng điểm.",
  },
  {
    num: "03",
    tag: "Proactive Risk Alerts",
    title: "Cảnh Báo Rủi Ro Tức Thì",
    desc: "Hệ thống tự động phát hiện task trễ hạn, tạo notification cảnh báo để bạn xử lý trước khi ảnh hưởng đến tiến độ bàn giao.",
  },
];

export function LandingRoleTabs() {
  const [activeRoleTab, setActiveRoleTab] = useState<"devops" | "lead">("devops");

  const cards = activeRoleTab === "devops" ? DEVOPS_ROLE_CARDS : LEAD_ROLE_CARDS;
  const isDevops = activeRoleTab === "devops";
  const accentColor = isDevops ? "text-sky-400" : "text-emerald-400";
  const accentBg = isDevops ? "bg-sky-500/15" : "bg-emerald-500/15";
  const borderHover = isDevops ? "hover:border-sky-500/30" : "hover:border-emerald-500/30";

  return (
    <motion.section
      id="roles"
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-mono font-medium mb-3.5">
          <Users size={15} />
          <span>ROLE-BASED VALUE PROPOSITION</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Thiết kế riêng cho từng vai trò trong team
        </h2>
        <p className="text-sm sm:text-base text-neutral-300">
          Trải nghiệm được cá nhân hóa hoàn hảo cho Kỹ sư triển khai và Người quản lý điều hành.
        </p>

        <div className="inline-flex p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mt-7">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveRoleTab("devops")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              isDevops
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            👨‍💻 Dành cho DevOps Engineers
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveRoleTab("lead")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              !isDevops
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            👑 Dành cho Tech Leads & PMs
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`role-${activeRoleTab}`}
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map((card) => (
            <motion.div
              key={card.num}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] ${borderHover} transition-colors space-y-3`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${accentBg} ${accentColor} flex items-center justify-center font-mono font-bold text-sm`}
              >
                {card.num}
              </div>
              <div className={`${accentColor} font-bold text-sm`}>{card.tag}</div>
              <div className="text-xl font-bold text-white">{card.title}</div>
              <p className="text-sm text-neutral-300 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
