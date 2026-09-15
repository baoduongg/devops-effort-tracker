"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowUpRight } from "lucide-react";

export function LandingNavbar(): React.JSX.Element {
  return (
    <header className="fixed top-5 inset-x-0 z-50 px-4 pointer-events-none">
      <nav className="max-w-6xl mx-auto pointer-events-auto h-16 px-4 sm:px-7 rounded-full bg-[#0d131f]/90 backdrop-blur-2xl border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-between transition-all duration-300">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 p-[1px] flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#090d14] rounded-[11px] flex items-center justify-center text-sky-400">
              <Zap size={18} className="fill-sky-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              DevOps Effort Hub
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-mono font-medium">
                v2.5 AI
              </span>
            </span>
          </div>
        </Link>

        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <a href="#screens" className="hover:text-white transition-colors">
            Giao diện thực tế
          </a>
          <a href="#ai-sandbox" className="hover:text-white transition-colors">
            Trợ lý AI
          </a>
          <a href="#slash-commands" className="hover:text-white transition-colors">
            Slash Commands
          </a>
          <a href="#chatops" className="hover:text-cyan-300 text-cyan-400/90 transition-colors flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            ChatOps
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            So sánh
          </a>
          <a href="#roles" className="hover:text-white transition-colors">
            Vai trò
          </a>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
          >
            Đăng nhập
          </Link>

          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
          >
            <span>Vào App</span>
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
              <ArrowUpRight size={12} strokeWidth={2.5} />
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
