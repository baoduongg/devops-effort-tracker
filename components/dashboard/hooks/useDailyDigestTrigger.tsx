import { useState } from "react";
import { useToast } from "@astryxdesign/core/Toast";
import { Link } from "@astryxdesign/core/Link";

export function useDailyDigestTrigger(): { trigger: () => void; isSending: boolean } {
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);

  async function trigger(): Promise<void> {
    if (isSending) return;
    setIsSending(true);
    toast({
      body: "Đang gửi báo cáo Daily Digest đến ChatOps...",
      type: "info",
      uniqueID: "daily-digest",
      collisionBehavior: "overwrite",
      isAutoHide: false,
    });

    try {
      const res = await fetch("/api/chatops/daily-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      toast({
        body: data.fileAttached
          ? "Đã gửi báo cáo Daily Digest (kèm ảnh tổng hợp) đến ChatOps."
          : "Đã gửi báo cáo Daily Digest đến ChatOps.",
        type: "info",
        uniqueID: "daily-digest",
        collisionBehavior: "overwrite",
        endContent: (
          <Link href="/api/chatops/daily-digest?format=image" target="_blank" hasUnderline>
            Xem ảnh báo cáo
          </Link>
        ),
      });
    } catch (err) {
      toast({
        body: `Gửi Daily Digest thất bại: ${err instanceof Error ? err.message : "Lỗi không xác định"}`,
        type: "error",
        uniqueID: "daily-digest",
        collisionBehavior: "overwrite",
        isAutoHide: false,
      });
    } finally {
      setIsSending(false);
    }
  }

  return { trigger, isSending };
}
