"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, RefreshCw, X, ExternalLink, ArrowLeft, Send } from "lucide-react";

export default function DailyDigestChatOpsPage(): React.JSX.Element {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [fileAttached, setFileAttached] = useState<boolean>(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    async function triggerDigest(): Promise<void> {
      try {
        const res = await fetch("/api/chatops/daily-digest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        setFileAttached(Boolean(data.fileAttached));
        setStatus("success");
      } catch (err) {
        console.warn("[DailyDigestPage] Trigger error:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Không thể kết nối đến máy chủ"
        );
        // Even on partial error/502, we allow user to see the ChatOps warning state
        setStatus("error");
      }
    }

    triggerDigest();
  }, []);

  // Countdown timer for automatic close
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          try {
            window.close();
          } catch {
            // ignore if window.close is restricted
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  function handleClose(): void {
    try {
      window.close();
    } catch {
      // ignore
    }
  }

  return (
    <main className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0F172A]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10 flex flex-col items-center text-center">
        {/* Status Animation / Icon */}
        {status === "loading" && (
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 animate-pulse">
              <RefreshCw size={36} className="animate-spin" />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <CheckCircle2 size={42} className="animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1 rounded-full border-2 border-[#0F172A]">
              <Send size={12} />
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <AlertCircle size={42} />
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          {status === "loading" && "Đang gửi báo cáo đến ChatOps..."}
          {status === "success" && "Đã gửi thông báo đến ChatOps"}
          {status === "error" && "Thông báo gửi ChatOps"}
        </h1>

        {/* Main Content Message */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 my-4 w-full text-slate-300 text-sm leading-relaxed">
          <p className="font-semibold text-slate-100 mb-1">
            {status === "success"
              ? fileAttached
                ? "Báo cáo Daily Digest (đã đính kèm ảnh tổng hợp) đã được gửi thành công!"
                : "Báo cáo Daily Digest đã được gửi thành công!"
              : status === "error"
              ? `Lưu ý khi gửi: ${errorMessage || "Đã kích hoạt gửi tin"}`
              : "Hệ thống đang trích xuất dữ liệu, vẽ ảnh báo cáo và đăng tải..."}
          </p>
          <p className="text-amber-300/90 text-xs sm:text-sm mt-2 flex items-center justify-center gap-1.5 font-medium bg-amber-500/10 py-2 px-3 rounded-lg border border-amber-500/20">
            <span>⚠️</span>
            <span>Nếu chưa thấy thì là do ChatOps bị lỗi. Hãy reload lại ChatOps.</span>
          </p>
        </div>

        {/* Countdown Timer */}
        {status === "success" && (
          <div className="w-full my-3 flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full text-xs text-slate-400">
              <span>Tự động đóng trang</span>
              <span className="font-mono font-bold text-sky-400">{countdown}s</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 italic">
              Page sẽ tự động đóng sau {countdown} giây...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700"
          >
            <X size={16} />
            Đóng trang ({countdown}s)
          </button>

          <Link
            href="/api/chatops/daily-digest?format=image"
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 hover:text-sky-200 font-medium text-sm transition-all border border-sky-500/30"
          >
            <ExternalLink size={15} />
            Xem ảnh báo cáo
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-sm transition-all border border-slate-800"
          >
            <ArrowLeft size={15} />
            Về Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
