"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Calendar,
  FolderGit2,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";

type SimulatorTabId = "roster" | "gantt" | "projects" | "copilot" | "workspace";

interface SimulatorTabItem {
  id: SimulatorTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SIMULATOR_TABS: SimulatorTabItem[] = [
  { id: "roster", label: "1. Nhân sự & Ma trận tải (Roster)", icon: Users },
  { id: "gantt", label: "2. Lịch trình Gantt (Timeline)", icon: Calendar },
  { id: "projects", label: "3. Phân bổ dự án (Projects)", icon: FolderGit2 },
  { id: "copilot", label: "4. AI Copilot (RunAgents)", icon: Bot },
  { id: "workspace", label: "5. DevOps Workspace Cá Nhân", icon: Zap },
];

/* ----------------- TAB 1 DATA: PM ROSTER MEMBERS ----------------- */
interface RosterMemberItem {
  name: string;
  role: string;
  email: string;
  initials: string;
  avatarGradient: string;
  cardBorder: string;
  cardBg: string;
  statusBadge: {
    label: string;
    className: string;
    icon?: "alert" | "check";
  };
  taskUsage: {
    label: string;
    stat: string;
    statClass: string;
    title: string;
    titleClass?: string;
    progress: number;
    progressGradient: string;
  };
  skills: string[];
}

const ROSTER_MEMBERS: RosterMemberItem[] = [
  {
    name: "An Nguyen",
    role: "Senior DevOps",
    email: "an.nguyen@company.io",
    initials: "AN",
    avatarGradient: "from-sky-500 to-indigo-600",
    cardBorder: "border-sky-500/30",
    cardBg: "bg-white/[0.02]",
    statusBadge: {
      label: "Vừa tải 67%",
      className: "bg-sky-500/15 border border-sky-500/30 text-sky-300",
    },
    taskUsage: {
      label: "Task đang thực hiện:",
      stat: "320m / 480m (67%)",
      statClass: "text-sky-400 font-semibold",
      title: "⚡ Setup CI/CD Pipeline GitLab with Docker Runners",
      progress: 67,
      progressGradient: "from-sky-400 to-blue-500",
    },
    skills: ["Kubernetes", "Terraform", "GitLab CI", "AWS"],
  },
  {
    name: "Duc Le",
    role: "SecOps",
    email: "duc.le@company.io",
    initials: "DL",
    avatarGradient: "from-rose-500 to-amber-600",
    cardBorder: "border-rose-500/25",
    cardBg: "bg-rose-500/[0.03]",
    statusBadge: {
      label: "Quá tải 112%",
      className: "bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold",
      icon: "alert",
    },
    taskUsage: {
      label: "Cảnh báo vượt mức 8h:",
      stat: "540m / 480m (112%)",
      statClass: "text-rose-400 font-bold",
      title: "🔒 Hardening Vault Cluster TLS & Audit IAM Policies",
      progress: 100,
      progressGradient: "from-amber-400 to-rose-500",
    },
    skills: ["Vault", "Ansible", "Linux Security", "Compliance"],
  },
  {
    name: "Minh Tran",
    role: "Cloud Eng",
    email: "minh.tran@company.io",
    initials: "MT",
    avatarGradient: "from-emerald-500 to-teal-600",
    cardBorder: "border-emerald-500/20",
    cardBg: "bg-emerald-500/[0.03]",
    statusBadge: {
      label: "Đang rảnh 🟢",
      className: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold",
      icon: "check",
    },
    taskUsage: {
      label: "Mức sử dụng hôm nay:",
      stat: "0m / 480m (0%)",
      statClass: "text-emerald-400 font-bold",
      title: "🟢 Sẵn sàng nhận task khẩn cấp hoặc pair hỗ trợ đồng đội",
      titleClass: "text-emerald-300",
      progress: 0,
      progressGradient: "bg-emerald-500",
    },
    skills: ["Docker", "GCP", "Kubernetes", "Prometheus"],
  },
  {
    name: "Bao Duong",
    role: "DevOps Lead",
    email: "bao.duong@company.io",
    initials: "BD",
    avatarGradient: "from-purple-500 to-indigo-600",
    cardBorder: "border-sky-500/30",
    cardBg: "bg-white/[0.02]",
    statusBadge: {
      label: "Vừa tải 75%",
      className: "bg-sky-500/15 border border-sky-500/30 text-sky-300",
    },
    taskUsage: {
      label: "Task đang thực hiện:",
      stat: "360m / 480m (75%)",
      statClass: "text-sky-400 font-bold",
      title: "☸️ Kiến trúc Multi-region Kubernetes EKS & ArgoCD GitOps",
      progress: 75,
      progressGradient: "from-sky-400 to-blue-500",
    },
    skills: ["Architecture", "EKS", "ArgoCD", "Helm", "Istio"],
  },
];

/* ----------------- TAB 2 DATA: GANTT TIMELINE ROWS ----------------- */
interface GanttTaskItem {
  title: string;
  duration: string;
  left: string;
  width: string;
  gradient: string;
  border: string;
  isOverdue?: boolean;
  badge?: string;
}

interface GanttRowItem {
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  tasks?: GanttTaskItem[];
  emptyText?: string;
}

const GANTT_ROWS: GanttRowItem[] = [
  {
    name: "An Nguyen",
    initials: "AN",
    avatarBg: "bg-sky-500/20",
    avatarColor: "text-sky-400",
    tasks: [
      {
        title: "GitLab CI/CD Runners",
        duration: "3.5h",
        left: "left-[11%]",
        width: "w-[44%]",
        gradient: "from-sky-500/85 to-blue-600/85",
        border: "border-sky-400/50",
      },
    ],
  },
  {
    name: "Duc Le",
    initials: "DL",
    avatarBg: "bg-rose-500/20",
    avatarColor: "text-rose-400",
    tasks: [
      {
        title: "Vault TLS",
        duration: "Trễ 2d",
        left: "left-[0%]",
        width: "w-[33%]",
        gradient: "from-rose-500/85 to-amber-600/85",
        border: "border-rose-400/50",
        isOverdue: true,
      },
      {
        title: "Audit IAM Roles",
        duration: "4h",
        left: "left-[35%]",
        width: "w-[40%]",
        gradient: "from-indigo-500/80 to-purple-600/80",
        border: "border-indigo-400/40",
      },
    ],
  },
  {
    name: "Minh Tran",
    initials: "MT",
    avatarBg: "bg-emerald-500/20",
    avatarColor: "text-emerald-400",
    emptyText: "Trống lịch trình — Có thể gán task mới",
  },
  {
    name: "Bao Duong",
    initials: "BD",
    avatarBg: "bg-purple-500/20",
    avatarColor: "text-purple-400",
    tasks: [
      {
        title: "☸️ EKS Multi-region & ArgoCD GitOps",
        duration: "6h",
        left: "left-[22%]",
        width: "w-[66%]",
        gradient: "from-purple-500/85 to-sky-600/85",
        border: "border-purple-400/50",
      },
    ],
  },
];

/* ----------------- TAB 3 DATA: PROJECT ALLOCATIONS ----------------- */
interface ProjectAllocationItem {
  tag: string;
  tagClass: string;
  status: string;
  statusColor: string;
  title: string;
  desc: string;
  consumed: string;
  consumedColor: string;
  progress: number;
  barColor: string;
}

const PROJECT_ALLOCATIONS: ProjectAllocationItem[] = [
  {
    tag: "PRJ-FINTECH",
    tagClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    status: "Đang hoạt động",
    statusColor: "text-emerald-400",
    title: "Fintech Core Platform",
    desc: "Nâng cấp hạ tầng giao dịch vi mô, tích hợp Kafka và triển khai K8s Autoscaling.",
    consumed: "142h / 200h (71%)",
    consumedColor: "text-sky-300",
    progress: 71,
    barColor: "bg-sky-500",
  },
  {
    tag: "PRJ-CLOUD-MIG",
    tagClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    status: "Đang hoạt động",
    statusColor: "text-emerald-400",
    title: "Cloud Migration 2026",
    desc: "Chuyển dịch dịch vụ On-premise lên AWS EKS & tối ưu hóa chi phí điện toán đám mây.",
    consumed: "96h / 160h (60%)",
    consumedColor: "text-purple-300",
    progress: 60,
    barColor: "bg-purple-500",
  },
  {
    tag: "PRJ-SECOPS",
    tagClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    status: "Cần chú ý",
    statusColor: "text-amber-400",
    title: "Security & Compliance",
    desc: "Chứng chỉ ISO 27001, HashiCorp Vault Secrets Engine và quét lỗ hổng Trivy CI.",
    consumed: "118h / 120h (98%)",
    consumedColor: "text-rose-300",
    progress: 98,
    barColor: "bg-rose-500",
  },
];

export function LandingScreenSimulator(): React.JSX.Element {
  const [activeScreenTab, setActiveScreenTab] = useState<SimulatorTabId>("roster");

  return (
    <motion.section
      id="screens"
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="py-14 px-4 max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs sm:text-sm font-mono font-medium mb-3.5">
          <span>LIVE INTERFACE SIMULATOR</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Khám phá trực tiếp 5 màn hình trung tâm của hệ thống
        </h2>
        <p className="text-sm sm:text-base text-neutral-300">
          Chuyển tab để trải nghiệm các phân hệ điều phối nhân sự, tiến độ Gantt, dự án và không gian làm việc cá nhân.
        </p>
      </motion.div>

      {/* Screen Selector Tabs with zero edge-clipping & responsive wrap */}
      <div className="w-full flex items-center justify-center mb-8 px-2">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md max-w-full shadow-lg">
          {SIMULATOR_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreenTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveScreenTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${isActive
                  ? "bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-md shadow-sky-500/15"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
                  }`}
              >
                <Icon size={16} className={isActive ? "text-sky-400" : ""} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* DOUBLE-BEZEL HARDWARE FRAME CONTAINER WITH 3D SPATIAL ENTRANCE */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-6xl mx-auto"
      >
        <div className="p-2 sm:p-3.5 rounded-[2rem] bg-gradient-to-b from-white/[0.09] to-white/[0.02] border border-white/[0.1] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          <div className="rounded-[calc(2rem-0.625rem)] bg-[#090e18] border border-white/[0.06] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
            {/* macOS Styled Control Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-black/60 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/60" />
              </div>

              {/* URL Pill */}
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-400">
                <span className="text-sky-400 font-semibold">devops-hub.io/</span>
                <span className="text-neutral-200">
                  {activeScreenTab === "roster"
                    ? "dashboard?tab=roster"
                    : activeScreenTab === "gantt"
                      ? "dashboard?tab=timeline"
                      : activeScreenTab === "projects"
                        ? "dashboard?tab=projects"
                        : activeScreenTab === "copilot"
                          ? "chat"
                          : "dashboard/devops-workspace"}
                </span>
              </div>

              {/* Realtime Live Indicator */}
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FIRESTORE REALTIME</span>
              </div>
            </div>

            {/* SCREEN CONTENT AREA WITH ANIMATE PRESENCE */}
            <div className="p-5 sm:p-7 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScreenTab}
                  initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, scale: 0.985, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* 1. PM ROSTER & CAPACITY SCREEN */}
                  {activeScreenTab === "roster" && (
                    <div className="space-y-6">
                      {/* Header Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                            <Users size={18} className="text-sky-400" />
                            <span>Bảng Điều Phối Nhân Sự & Năng Lực Đội Ngũ (PM Roster)</span>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">
                            Theo dõi trạng thái tải realtime của từng kỹ sư: Rảnh việc (🟢), Vừa tải (🔵), Quá tải (🔴).
                          </p>
                        </div>

                        {/* KPI Stat Pills */}
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-mono font-semibold">
                            1 Rảnh (0%)
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-mono font-semibold">
                            2 Vừa tải (67%)
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-mono font-semibold">
                            1 Quá tải (112%)
                          </span>
                        </div>
                      </div>

                      {/* Member Cards Grid (Mapped over ROSTER_MEMBERS) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ROSTER_MEMBERS.map((m) => (
                          <div
                            key={m.name}
                            className={`p-5 rounded-2xl ${m.cardBg} border ${m.cardBorder}  transition-all`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-11 h-11 rounded-full bg-gradient-to-tr ${m.avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow-md`}
                                >
                                  {m.initials}
                                </div>
                                <div>
                                  <div className="text-base font-bold text-white flex items-center gap-2">
                                    <span>{m.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-neutral-200 border border-white/[0.1]">
                                      {m.role}
                                    </span>
                                  </div>
                                  <div className="text-xs sm:text-sm text-neutral-400 font-mono">{m.email}</div>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 ${m.statusBadge.className}`}
                              >
                                {m.statusBadge.icon === "alert" && <AlertTriangle size={13} />}
                                {m.statusBadge.icon === "check" && <CheckCircle2 size={13} />}
                                {m.statusBadge.label}
                              </span>
                            </div>

                            {/* Current Task Box */}
                            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] mb-3.5">
                              <div className="text-xs sm:text-sm text-neutral-400 flex items-center justify-between mb-1.5">
                                <span>{m.taskUsage.label}</span>
                                <span className={`font-mono ${m.taskUsage.statClass}`}>{m.taskUsage.stat}</span>
                              </div>
                              <div className={`text-sm font-semibold truncate ${m.taskUsage.titleClass || "text-neutral-200"}`}>
                                {m.taskUsage.title}
                              </div>
                              <div className="w-full h-2 rounded-full bg-white/[0.06] mt-2.5 overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${m.taskUsage.progressGradient} rounded-full`}
                                  style={{ width: `${m.taskUsage.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Skill Tags */}
                            <div className="flex flex-wrap gap-2">
                              {m.skills.map((s) => (
                                <span
                                  key={s}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] text-neutral-300 border border-white/[0.06]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. TEAM TIMELINE GANTT SCREEN */}
                  {activeScreenTab === "gantt" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                            <Calendar size={18} className="text-sky-400" />
                            <span>Lịch Trình Gantt Sprint Đa Chiều (Team Timeline Chart)</span>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">
                            Trực quan hóa tiến độ công việc theo ngày/tuần, phát hiện chồng chéo và điểm nghẽn sprint.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-200">
                          <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                            Sprint 14 (15/09 - 28/09)
                          </span>
                        </div>
                      </div>

                      {/* Gantt Timeline Grid */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] overflow-x-auto">
                        <div className="grid grid-cols-12 gap-1 pb-3 border-b border-white/[0.06] text-xs sm:text-sm font-mono text-neutral-400 min-w-[650px]">
                          <div className="col-span-3 font-semibold text-neutral-200">Kỹ sư / Thành viên</div>
                          <div className="col-span-1 text-center">T2 (15)</div>
                          <div className="col-span-1 text-center">T3 (16)</div>
                          <div className="col-span-1 text-center bg-sky-500/10 text-sky-300 rounded font-bold">T4 (17)</div>
                          <div className="col-span-1 text-center">T5 (18)</div>
                          <div className="col-span-1 text-center">T6 (19)</div>
                          <div className="col-span-1 text-center text-neutral-600">T7 (20)</div>
                          <div className="col-span-1 text-center text-neutral-600">CN (21)</div>
                          <div className="col-span-1 text-center">T2 (22)</div>
                          <div className="col-span-1 text-center">T3 (23)</div>
                        </div>

                        {GANTT_ROWS.map((row, idx) => (
                          <div
                            key={row.name}
                            className={`grid grid-cols-12 gap-1 py-3.5 ${idx < GANTT_ROWS.length - 1 ? "border-b border-white/[0.04]" : ""
                              } items-center min-w-[650px]`}
                          >
                            <div className="col-span-3 flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-full ${row.avatarBg} ${row.avatarColor} flex items-center justify-center text-xs font-bold`}
                              >
                                {row.initials}
                              </div>
                              <span className="font-bold text-white text-sm truncate">{row.name}</span>
                            </div>

                            <div className="col-span-9 relative h-8 flex items-center">
                              {row.emptyText ? (
                                <span className="text-sm text-emerald-400/90 italic font-mono flex items-center gap-1.5">
                                  <CheckCircle2 size={14} /> {row.emptyText}
                                </span>
                              ) : (
                                row.tasks?.map((t, tIdx) => (
                                  <div
                                    key={tIdx}
                                    className={`absolute ${t.left} ${t.width} h-full rounded-lg bg-gradient-to-r ${t.gradient} border ${t.border} p-1.5 px-2.5 flex items-center justify-between text-xs sm:text-sm text-white shadow-sm`}
                                  >
                                    <span className="truncate font-semibold flex items-center gap-1.5">
                                      {t.isOverdue && <AlertTriangle size={12} className="text-amber-300" />}
                                      {t.title}
                                    </span>
                                    <span
                                      className={`text-xs font-mono opacity-90 shrink-0 ${t.isOverdue ? "bg-rose-900/70 px-1.5 py-0.2 rounded font-bold" : ""
                                        }`}
                                    >
                                      {t.duration}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. PROJECT ALLOCATION SCREEN */}
                  {activeScreenTab === "projects" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                            <FolderGit2 size={18} className="text-sky-400" />
                            <span>Phân Bổ Nỗ Lực Theo Dự Án (Project Allocation Grid)</span>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">
                            Kiểm soát tổng số giờ đã log so với hạn mức ngân sách theo từng dự án trọng điểm.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PROJECT_ALLOCATIONS.map((prj) => (
                          <div key={prj.tag} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <span
                                className={`text-xs sm:text-sm font-mono px-2.5 py-0.5 rounded-lg border font-semibold ${prj.tagClass}`}
                              >
                                {prj.tag}
                              </span>
                              <span className={`text-xs sm:text-sm font-mono ${prj.statusColor}`}>{prj.status}</span>
                            </div>
                            <div className="text-base font-bold text-white mb-1.5">{prj.title}</div>
                            <div className="text-sm text-neutral-300 mb-4 leading-relaxed">{prj.desc}</div>

                            <div className="space-y-2 pt-3 border-t border-white/[0.04]">
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Đã tiêu thụ:</span>
                                <span className={`font-mono font-bold ${prj.consumedColor}`}>{prj.consumed}</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <div className={`h-full ${prj.barColor} rounded-full`} style={{ width: `${prj.progress}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. AI COPILOT & SLASH COMMANDS SCREEN */}
                  {activeScreenTab === "copilot" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                            <Bot size={18} className="text-sky-400" />
                            <span>AI Copilot & Trợ Lý Điều Hành Q&A (RunAgents Engine)</span>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">
                            Hỗ trợ 2 chế độ: DevOps Mode (Ghi log nhanh + Vision) và Leader Mode (Grounding Firestore).
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono">
                            claude-sonnet-cc
                          </span>
                        </div>
                      </div>

                      {/* Chat Simulation View */}
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
                        <div className="flex items-start gap-3 justify-end">
                          <div className="p-3.5 rounded-2xl rounded-tr-sm bg-sky-600/35 border border-sky-500/40 text-sm text-white max-w-lg leading-relaxed">
                            Setup CI/CD pipeline GitLab with Docker runners cho dự án Fintech mất 3.5 giờ, xong vào thứ 6
                          </div>
                          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            AN
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-xs text-white shrink-0">
                            <Bot size={16} />
                          </div>
                          <div className="p-5 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] text-sm max-w-xl space-y-3.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white flex items-center gap-2 text-sm">
                                <Sparkles size={15} className="text-sky-400" />
                                Đề xuất ghi nhận Effort từ AI
                              </span>
                              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                                Đã trích xuất JSON
                              </span>
                            </div>

                            <div className="space-y-2 p-4 rounded-xl bg-black/50 border border-white/[0.06]">
                              <div className="text-base font-bold text-white">Setup CI/CD GitLab & Docker Runners</div>
                              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-300 pt-1">
                                <span className="text-sky-300 font-mono">📁 Fintech Core Platform</span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-sky-300 font-mono font-bold">⏱️ 3h 30m (210p)</span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-amber-300 font-medium">🔥 High</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <button className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-sky-500/20">
                                <Check size={14} />
                                Xác nhận & Lưu Firestore
                              </button>
                              <button className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white text-sm transition-all">
                                Bỏ qua
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. DEVOPS PERSONAL WORKSPACE SCREEN */}
                  {activeScreenTab === "workspace" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                            <Zap size={18} className="text-sky-400" />
                            <span>DevOps Workspace: Không Gian Làm Việc Cá Nhân</span>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">
                            Tập trung vào task của riêng bạn với 1-Click Status Toggle và tìm đồng đội rảnh (Pairing).
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono font-medium">
                            Hôm nay: 320m / 480m (67%)
                          </span>
                        </div>
                      </div>

                      {/* 3 Columns Kanban Mini */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Column 1: In Progress */}
                        <div className="p-4 rounded-2xl bg-sky-500/[0.03] border border-sky-500/20">
                          <div className="flex items-center justify-between text-sm font-bold text-sky-300 mb-3.5">
                            <span className="flex items-center gap-2">
                              <Play size={14} className="fill-sky-400" /> Đang thực hiện (1)
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
                            <div className="text-sm font-bold text-white">Setup CI/CD GitLab Runners</div>
                            <div className="text-xs sm:text-sm text-neutral-400 font-mono">3h 30m · Fintech Core</div>
                            <button className="w-full py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all">
                              <Check size={14} /> Đánh dấu Hoàn thành (Done)
                            </button>
                          </div>
                        </div>

                        {/* Column 2: Planned */}
                        <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20">
                          <div className="flex items-center justify-between text-sm font-bold text-amber-300 mb-3.5">
                            <span className="flex items-center gap-2">
                              <Clock size={14} /> Kế hoạch sắp tới (1)
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
                            <div className="text-sm font-bold text-white">Refactor Terraform AWS VPC</div>
                            <div className="text-xs sm:text-sm text-neutral-400 font-mono">2h 15m · Cloud Migration</div>
                            <button className="w-full py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all">
                              <Play size={12} className="fill-sky-400" /> Bắt đầu làm (Start)
                            </button>
                          </div>
                        </div>

                        {/* Column 3: Teammate Pairing */}
                        <div className="p-4 rounded-2xl bg-purple-500/[0.03] border border-purple-500/20">
                          <div className="flex items-center justify-between text-sm font-bold text-purple-300 mb-3.5">
                            <span className="flex items-center gap-2">
                              <Users size={14} /> Đồng đội đang rảnh (Pairing)
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
                                MT
                              </div>
                              <div className="text-sm font-bold text-white">Minh Tran (Cloud Eng)</div>
                            </div>
                            <div className="text-xs sm:text-sm text-emerald-400 font-mono font-medium">
                              🟢 0m/480m · K8s, Docker
                            </div>
                            <div className="text-xs sm:text-sm text-neutral-400">
                              Sẵn sàng pair hỗ trợ giải quyết blocker
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
