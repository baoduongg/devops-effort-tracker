"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BellRing,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileSpreadsheet,
  ArrowRight,
  Zap,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Clock,
  UserCheck,
} from "lucide-react";

interface ChatOpsScenario {
  id: string;
  tabLabel: string;
  icon: React.ElementType;
  badgeColor: string;
  badgeText: string;
  title: string;
  eventTrigger: string;
  channel: string;
  messageContent: React.ReactNode;
  metadata: {
    latency: string;
    target: string;
    action: string;
  };
}

const CHATOPS_SCENARIOS: ChatOpsScenario[] = [
  {
    id: "task-created",
    tabLabel: "Giao Task Mới",
    icon: Bot,
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/25",
    badgeText: "Task Assignment",
    title: "Tự động gửi thông báo giao việc & nhắc nhở deadline",
    eventTrigger: "Event: task.created | POST /api/chatops/notify",
    channel: "#devops-operations",
    messageContent: (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-neutral-200">
        <p className="text-neutral-300">
          Chào <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-medium">@minh-tran</span>, bạn vừa được giao một task mới:
        </p>
        <div className="p-3.5 rounded-xl bg-sky-500/[0.06] border border-sky-500/20 space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Task:</span>
            <span className="font-semibold text-white">Triển khai Multi-Region Kubernetes &amp; Istio Mesh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Dự án:</span>
            <span className="text-sky-300 font-medium">Fintech Core Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Hạn chót:</span>
            <span className="text-amber-300 font-mono font-medium">2026-09-22</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-sky-500/15">
            <span className="text-neutral-400 font-mono">Chi tiết:</span>
            <span className="text-sky-400 underline underline-offset-2 flex items-center gap-1 cursor-pointer hover:text-sky-300">
              devops-hub.internal/tasks/k8s-multi-region <ExternalLink size={12} />
            </span>
          </div>
        </div>
        <p className="text-xs text-neutral-400 italic">
          Cần thêm thông tin hay hỗ trợ gì cứ hú <span className="text-neutral-300 font-medium">Hoang Nguyen (Tech Lead)</span> liền nha. Chúc bạn một ngày làm việc mượt mà, không bug! 🚀
        </p>
      </div>
    ),
    metadata: {
      latency: "42ms",
      target: "minh.tran@techcorp.io",
      action: "Mentioned & Notification Dispatched",
    },
  },
  {
    id: "status-change",
    tabLabel: "Đổi Trạng Thái",
    icon: CheckCircle2,
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    badgeText: "Status Transition",
    title: "Thông báo chuyển đổi trạng thái task theo thời gian thực",
    eventTrigger: "Event: task.status_changed | POST /api/chatops/notify",
    channel: "#devops-sprint-14",
    messageContent: (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-base">✅</span>
          <span className="font-semibold text-white">Task đổi trạng thái: Cấu hình Prometheus Alertmanager HA</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Dự án:</span>
            <span className="text-neutral-200 font-medium">Cloud Infrastructure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Người thực hiện:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">@an-le</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Trạng thái:</span>
            <span className="text-neutral-400">Đang thực hiện</span>
            <ArrowRight size={13} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/20">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/15">
            <span className="text-neutral-400 font-mono">Chi tiết:</span>
            <span className="text-emerald-400 underline underline-offset-2 flex items-center gap-1 cursor-pointer hover:text-emerald-300">
              devops-hub.internal/tasks/prometheus-ha <ExternalLink size={12} />
            </span>
          </div>
        </div>
        <p className="text-xs text-neutral-400">
          Tiến độ Sprint 14 đã được tự động cập nhật lên Gantt Timeline và Ma Trận Năng Lực.
        </p>
      </div>
    ),
    metadata: {
      latency: "38ms",
      target: "Channel #devops-sprint-14",
      action: "Timeline Synced & Logged",
    },
  },
  {
    id: "overload-alert",
    tabLabel: "Cảnh Báo Quá Tải",
    icon: Flame,
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    badgeText: "High Workload Risk",
    title: "Phát hiện tải công việc vượt ngưỡng (>8h/ngày) & cảnh báo sớm",
    eventTrigger: "Event: member.overloaded | Threshold: effort > 480m",
    channel: "#devops-leads",
    messageContent: (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-neutral-200">
        <div className="flex items-center gap-2 text-rose-400 font-semibold">
          <span>🔥</span>
          <span>Cảnh báo quá tải nhân sự: <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">@duc-vu</span></span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 space-y-2 text-xs sm:text-sm">
          <p className="text-neutral-200">
            Đang có <span className="font-mono font-bold text-rose-300">4 task active</span> cùng lúc, tổng dung lượng nỗ lực đạt{" "}
            <span className="font-mono font-bold text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/20">9.5h effort</span> (&gt; 8h/ngày).
          </p>
          <div className="text-xs text-neutral-400 space-y-1 pt-1 border-t border-rose-500/15">
            <div>• Database Migration PostgreSQL 16 (4.0h)</div>
            <div>• Fix Helm Chart Security Vulnerabilities (2.5h)</div>
            <div>• Triển khai Redis Cluster Caching (3.0h)</div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-rose-500/15">
            <span className="text-neutral-400 font-mono">Chi tiết:</span>
            <span className="text-rose-400 underline underline-offset-2 flex items-center gap-1 cursor-pointer hover:text-rose-300">
              devops-hub.internal/members/duc-vu/workload <ExternalLink size={12} />
            </span>
          </div>
        </div>
        <p className="text-xs text-amber-300/90 flex items-center gap-1.5">
          <AlertTriangle size={13} className="shrink-0 text-amber-400" />
          Khuyến nghị: Dùng lệnh <code className="px-1 py-0.5 bg-black/40 rounded font-mono text-sky-300">/reassign</code> để san sẻ bớt task sang kỹ sư đang rảnh.
        </p>
      </div>
    ),
    metadata: {
      latency: "51ms",
      target: "Tech Lead & PMs",
      action: "Capacity Alert Broadcasted",
    },
  },
  {
    id: "overdue-alert",
    tabLabel: "Cảnh Báo Quá Hạn",
    icon: AlertTriangle,
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    badgeText: "Overdue Warning",
    title: "Tự động quét & nhắc nhở task bị trễ hạn hoặc tới hạn gấp",
    eventTrigger: "Event: cron.task_overdue_scan | Daily 09:00",
    channel: "#devops-operations",
    messageContent: (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-neutral-200">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <span>⚠️</span>
          <span>Task quá hạn cần xử lý gấp: Setup HashiCorp Vault Secrets Engine</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Dự án:</span>
            <span className="text-neutral-200 font-medium">Security &amp; IAM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Người thực hiện:</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium">@linh-pham</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Trạng thái:</span>
            <span className="text-rose-400 font-semibold font-mono">Trễ 2 ngày</span>
            <span className="text-neutral-400 font-mono text-xs">(Hạn chót: 2026-09-13)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-amber-500/15">
            <span className="text-neutral-400 font-mono">Chi tiết:</span>
            <span className="text-amber-400 underline underline-offset-2 flex items-center gap-1 cursor-pointer hover:text-amber-300">
              devops-hub.internal/tasks/vault-setup <ExternalLink size={12} />
            </span>
          </div>
        </div>
        <p className="text-xs text-neutral-400">
          Vui lòng cập nhật lại tiến độ hoặc điều chỉnh ngày bàn giao trên hệ thống.
        </p>
      </div>
    ),
    metadata: {
      latency: "45ms",
      target: "linh.pham@techcorp.io",
      action: "Direct Mention Ping",
    },
  },
  {
    id: "daily-digest",
    tabLabel: "Daily Digest & Infographic",
    icon: FileSpreadsheet,
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    badgeText: "Daily Snapshot & PNG",
    title: "Báo cáo ngày tự động tổng hợp kèm ảnh canvas trực quan",
    eventTrigger: "Endpoint: /api/chatops/daily-digest?format=image",
    channel: "#devops-daily-standup",
    messageContent: (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-neutral-200">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">📋 Daily Report — Thứ Ba, 15/09/2026</span>
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Auto-generated</span>
        </div>
        <div className="p-3.5 rounded-xl bg-purple-500/[0.06] border border-purple-500/20 space-y-2.5 text-xs sm:text-sm">
          <div className="text-amber-300 font-medium">⚠️ Quá hạn (1 task):</div>
          <div className="text-xs text-neutral-300 pl-3 border-l-2 border-amber-500/40">
            • Setup HashiCorp Vault (@linh-pham) — trễ 2 ngày
          </div>
          <div className="text-sky-300 font-medium pt-1">🏃 Active task theo member:</div>
          <div className="text-xs text-neutral-300 pl-3 border-l-2 border-sky-500/40 space-y-1">
            <div>• <span className="text-white font-medium">@minh-tran</span> (Bình thường): Multi-Region K8s, Istio Service Mesh</div>
            <div>• <span className="text-white font-medium">@an-le</span> (Rảnh): Optimize CI/CD GitLab Pipelines</div>
            <div>• <span className="text-white font-medium">@duc-vu</span> (<span className="text-rose-400 font-semibold">Quá tải</span>): DB Migration, Helm Chart Security</div>
          </div>
          {/* Visual canvas preview pill */}
          <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-500/30 to-sky-500/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono text-xs font-bold">
                PNG
              </div>
              <div className="text-xs">
                <div className="font-medium text-white">devops-daily-digest-20260915.png</div>
                <div className="text-neutral-400 font-mono">1200x630 • Canvas Infographic Card</div>
              </div>
            </div>
            <span className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1 font-mono">
              Tải ảnh <ExternalLink size={12} />
            </span>
          </div>
        </div>
      </div>
    ),
    metadata: {
      latency: "89ms",
      target: "#devops-daily-standup",
      action: "Text + PNG Infographic Attached",
    },
  },
];

const CHATOPS_CHANNELS = [
  { name: "Slack", icon: "💬", status: "Connected" },
  { name: "Mattermost", icon: "🌐", status: "Active Webhook" },
  { name: "Discord", icon: "🎮", status: "Supported" },
  { name: "Telegram", icon: "✈️", status: "Supported" },
  { name: "MS Teams", icon: "👥", status: "Webhook Ready" },
];

export function LandingChatops(): React.JSX.Element {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("task-created");
  const currentScenario =
    CHATOPS_SCENARIOS.find((s) => s.id === activeScenarioId) || CHATOPS_SCENARIOS[0];

  return (
    <motion.section
      id="chatops"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8 }}
      className="py-24 px-4 max-w-6xl mx-auto border-t border-white/[0.06] relative overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-purple-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs sm:text-sm font-mono font-medium mb-3.5 shadow-sm shadow-cyan-500/10">
          <BellRing size={15} className="animate-pulse" />
          <span>CHATOPS AUTOMATION &amp; REALTIME ALERTS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Thông Báo Tức Thì Qua Kênh{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400">
            ChatOps Đội Ngũ
          </span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mx-auto">
          Không cần mở app liên tục. Mọi thay đổi về giao việc, chuyển trạng thái, cảnh báo quá tải và báo cáo Daily Digest kèm ảnh đồ họa đều được tự động đẩy tới kênh chat nội bộ của bạn.
        </p>
      </motion.div>

      {/* 4 Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-sky-500/30 transition-all duration-300 shadow-lg shadow-black/20"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
            <UserCheck size={20} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Giao Task &amp; Auto Mention</h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Tag đích danh <code className="text-sky-300 font-mono">@kỹ_sư</code>, gửi kèm deadline, dự án và link truy cập trực tiếp ngay khi vừa tạo task.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.18 }}
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 shadow-lg shadow-black/20"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <Zap size={20} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Real-Time Status Sync</h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Tự động bắn message khi task chuyển trạng thái (<span className="text-emerald-400 font-mono">Done</span>, <span className="text-sky-400 font-mono">In Progress</span>) hoặc đổi assignee.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.26 }}
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-rose-500/30 transition-all duration-300 shadow-lg shadow-black/20"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <Flame size={20} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Cảnh Báo Quá Tải &amp; Trễ</h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Phát hiện kỹ sư vượt ngưỡng 8h/ngày hoặc task bị trễ hạn để Tech Lead kịp thời điều phối lại nhân lực.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.34 }}
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/30 transition-all duration-300 shadow-lg shadow-black/20"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
            <FileSpreadsheet size={20} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Daily Digest &amp; Infographic</h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Tổng hợp báo cáo tiến độ ngày kèm xuất ảnh PNG trực quan (<span className="text-purple-300 font-mono">1200x630</span>) tự động bắn vào channel.
          </p>
        </motion.div>
      </div>

      {/* Interactive ChatOps Simulator - Double-Bezel Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="p-2 sm:p-3 rounded-[2.2rem] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
      >
        <div className="rounded-[calc(2.2rem-0.6rem)] bg-[#0a0d16] border border-white/[0.08] p-4 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {/* Header Bar of Simulator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/40" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/40" />
              </div>
              <span className="text-xs font-mono text-neutral-400 font-medium flex items-center gap-2">
                <MessageSquare size={13} className="text-sky-400" />
                ChatOps Webhook Simulator • Live Channel Preview
              </span>
            </div>

            {/* Platform Integration Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[11px] font-mono text-neutral-400 uppercase mr-1">Tích hợp:</span>
              {CHATOPS_CHANNELS.map((ch) => (
                <span
                  key={ch.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-300 font-mono"
                >
                  <span>{ch.icon}</span>
                  <span>{ch.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
            {CHATOPS_SCENARIOS.map((scenario) => {
              const IconComp = scenario.icon;
              const isActive = scenario.id === activeScenarioId;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenarioId(scenario.id)}
                  className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500/25 via-cyan-500/20 to-blue-500/25 text-white border border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                      : "bg-white/[0.03] text-neutral-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-neutral-200"
                  }`}
                >
                  <IconComp size={15} className={isActive ? "text-sky-400" : "text-neutral-400"} />
                  <span>{scenario.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Message Live Preview Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScenario.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left/Main Column: Simulated ChatOps App Box */}
              <div className="lg:col-span-8 rounded-2xl bg-[#080b12] border border-white/[0.1] p-5 sm:p-6 shadow-2xl relative">
                {/* Channel Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-bold text-neutral-400 font-mono">#</span>
                    <span className="font-semibold text-white text-sm">{currentScenario.channel.replace("#", "")}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-mono ${currentScenario.badgeColor}`}>
                      {currentScenario.badgeText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                    <Clock size={12} />
                    <span>Hôm nay lúc 09:15</span>
                  </div>
                </div>

                {/* Simulated Bot Message Body */}
                <div className="flex items-start gap-3.5">
                  {/* Bot Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 p-[1px] shrink-0 shadow-md shadow-sky-500/20">
                    <div className="w-full h-full bg-[#090e18] rounded-[11px] flex items-center justify-center text-sky-400">
                      <Bot size={20} />
                    </div>
                  </div>

                  {/* Message Bubble Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">DevOps Copilot</span>
                      <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-semibold tracking-wide uppercase border border-sky-400/30">
                        APP / BOT
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>

                    {/* Rich Message Card Content */}
                    <div className="pt-1">
                      {currentScenario.messageContent}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Telemetry & Event Payload Metadata */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider pb-2 border-b border-white/[0.06]">
                    <span>Event Telemetry</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 200 OK
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-neutral-400 block mb-0.5">Trigger Payload:</span>
                      <div className="p-2 rounded bg-black/40 text-neutral-300 border border-white/[0.06] text-[11px] break-all">
                        {currentScenario.eventTrigger}
                      </div>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-neutral-400">Webhook Latency:</span>
                      <span className="text-sky-300 font-bold tabular-nums">{currentScenario.metadata.latency}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-neutral-400">Target Recipient:</span>
                      <span className="text-neutral-200">{currentScenario.metadata.target}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Action Result:</span>
                      <span className="text-emerald-400">{currentScenario.metadata.action}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.04] border border-cyan-500/20 text-xs text-neutral-300 leading-relaxed">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-1.5">
                    <Sparkles size={14} />
                    <span>Zero-Configuration Webhook</span>
                  </div>
                  Chỉ cần cấu hình biến môi trường <code className="text-sky-300 font-mono bg-black/40 px-1 py-0.5 rounded">CHATOPS_WEBHOOK_URL</code> hoặc gọi REST endpoint <code className="text-sky-300 font-mono bg-black/40 px-1 py-0.5 rounded">/api/chatops/notify</code>, toàn bộ thông báo sẽ tự động đồng bộ tức thì.
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.section>
  );
}
