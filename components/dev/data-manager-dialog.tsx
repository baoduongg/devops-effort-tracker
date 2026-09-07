"use client";

import React, { useState } from "react";
import {
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Users,
  CheckSquare,
  MessageSquare,
  Loader2,
} from "lucide-react";

import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";

interface DataManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataManagerDialog({ isOpen, onClose }: DataManagerDialogProps): React.JSX.Element {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleClear = async (collections: string[], label: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dữ liệu của: ${label}? Thao tác này không thể hoàn tác!`)) {
      return;
    }
    setLoadingAction(label);
    setMessage(null);
    try {
      const res = await fetch("/api/dev/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", collections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể xóa dữ liệu");
      setMessage({
        type: "success",
        text: `Đã dọn dẹp thành công [${label}]!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    if (!confirm("Khôi phục dữ liệu mẫu sẽ xóa dữ liệu hiện tại và nạp lại 3 Projects, 3 Members, 5 Tasks, 3 Notifications. Tiếp tục?")) {
      return;
    }
    setLoadingAction("reset");
    setMessage(null);
    try {
      const res = await fetch("/api/dev/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể reset dữ liệu");
      setMessage({
        type: "success",
        text: "Đã reset và nạp dữ liệu mẫu ban đầu thành công!",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} width={520}>
      <DialogHeader
        title="Quản lý Dữ liệu Firestore"
        subtitle="Dọn dẹp nhanh các bảng Firestore mà không cần vào Firebase Console"
        onOpenChange={(open) => !open && onClose()}
      />
      <div className="flex flex-col gap-4 p-5 max-w-lg">

        <Text type="supporting" className="text-xs leading-relaxed text-neutral-400">
          Dọn dẹp nhanh các bảng Firestore mà không cần vào Firebase Console. Thay đổi có hiệu lực ngay lập tức.
        </Text>

        {message && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/30 text-rose-300"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {/* Clear Tasks */}
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => handleClear(["tasks"], "Tasks")}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 text-left transition-all duration-150 disabled:opacity-50 group"
          >
            <div className="p-2 rounded-lg bg-white/[0.05] group-hover:bg-rose-500/20 text-neutral-300 group-hover:text-rose-400 transition-colors">
              <CheckSquare size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200 group-hover:text-rose-300">Xóa Tasks</div>
              <div className="text-[10px] text-neutral-500">Toàn bộ công việc</div>
            </div>
          </button>

          {/* Clear Members */}
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => handleClear(["members"], "Members")}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 text-left transition-all duration-150 disabled:opacity-50 group"
          >
            <div className="p-2 rounded-lg bg-white/[0.05] group-hover:bg-rose-500/20 text-neutral-300 group-hover:text-rose-400 transition-colors">
              <Users size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200 group-hover:text-rose-300">Xóa Members</div>
              <div className="text-[10px] text-neutral-500">Danh sách thành viên</div>
            </div>
          </button>

          {/* Clear Projects */}
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => handleClear(["projects"], "Projects")}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 text-left transition-all duration-150 disabled:opacity-50 group"
          >
            <div className="p-2 rounded-lg bg-white/[0.05] group-hover:bg-rose-500/20 text-neutral-300 group-hover:text-rose-400 transition-colors">
              <Layers size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200 group-hover:text-rose-300">Xóa Projects</div>
              <div className="text-[10px] text-neutral-500">Dự án hệ thống</div>
            </div>
          </button>

          {/* Clear Chat Logs & Notifications */}
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => handleClear(["chatLogs", "notifications"], "Chat & Notifications")}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 text-left transition-all duration-150 disabled:opacity-50 group"
          >
            <div className="p-2 rounded-lg bg-white/[0.05] group-hover:bg-rose-500/20 text-neutral-300 group-hover:text-rose-400 transition-colors">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200 group-hover:text-rose-300">Xóa Chat / Notif</div>
              <div className="text-[10px] text-neutral-500">Lịch sử chat & thông báo</div>
            </div>
          </button>
        </div>

        {/* Global Danger / Reset Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => handleClear(["tasks", "members", "projects", "notifications", "chatLogs"], "Tất cả dữ liệu")}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 transition-colors disabled:opacity-50 text-xs font-medium"
          >
            <span className="flex items-center gap-2">
              <Trash2 size={14} className="text-rose-400" />
              Xóa sạch tất cả dữ liệu (Tasks, Members, Projects...)
            </span>
            {loadingAction === "Tất cả dữ liệu" && <Loader2 size={14} className="animate-spin" />}
          </button>

          <button
            type="button"
            disabled={!!loadingAction}
            onClick={handleReset}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 hover:border-indigo-500/45 text-indigo-300 transition-colors disabled:opacity-50 text-xs font-medium"
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={14} className="text-indigo-400" />
              Khôi phục dữ liệu mẫu mặc định (Seed Data)
            </span>
            {loadingAction === "reset" && <Loader2 size={14} className="animate-spin" />}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <Button label="Đóng" variant="secondary" size="sm" onClick={onClose} />
        </div>
      </div>
    </Dialog>
  );
}
