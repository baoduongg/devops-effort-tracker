"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="py-12 px-4 border-t border-white/[0.06] text-sm text-neutral-400 bg-[#06080c]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Zap size={15} />
          </div>
          <span className="text-white font-bold tracking-tight text-base">DevOps Effort Hub</span>
          <span className="text-neutral-500">· Powered by RunAgents (claude-sonnet-cc) & Firebase</span>
        </div>

        <div className="flex items-center gap-7 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/login" className="hover:text-white transition-colors">
            Đăng nhập
          </Link>
          <a href="#screens" className="hover:text-white transition-colors">
            Giao diện thực tế
          </a>
          <a href="#ai-sandbox" className="hover:text-white transition-colors">
            Trợ lý AI
          </a>
          <a href="#slash-commands" className="hover:text-white transition-colors">
            Slash Commands
          </a>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </footer>
  );
}
