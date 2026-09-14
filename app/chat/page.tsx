"use client";

import { Layout, LayoutHeader, LayoutContent } from "@astryxdesign/core/Layout";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Sparkles, Bot, ShieldCheck } from "lucide-react";
import { ChatBox } from "@/components/chat/chat-box";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";
import { ProviderToggle } from "@/components/chat/provider-toggle";
import { useChatStore } from "@/store/chat.store";

const MODE_CONFIG: Record<
  "devops" | "leader",
  { title: string; hint: string; badge: string; badgeColor: "blue" | "purple" }
> = {
  devops: {
    title: "AI Work Logger",
    hint: "Mô tả công việc hoàn thành hoặc dán ảnh chụp màn hình để ghi nhận effort tự động.",
    badge: "DevOps Mode",
    badgeColor: "blue",
  },
  leader: {
    title: "AI Team Intelligence & Ask",
    hint: "Tra cứu phân bổ nguồn lực, rà soát tiến độ và điều phối công việc thông minh.",
    badge: "Leader Mode",
    badgeColor: "purple",
  },
};

export default function ChatPage(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
  const currentConfig = MODE_CONFIG[mode];

  return (
    <Layout
      height="fill"
      start={<ChatHistorySidebar />}
      header={
        <LayoutHeader hasDivider>
          <div className="w-full px-4 py-2.5 flex items-center justify-between gap-4">
            <HStack gap={3} vAlign="center">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 via-cyan-500/10 to-indigo-500/20 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10">
                <Sparkles size={18} className="animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <VStack gap={0.5}>
                <HStack gap={2} vAlign="center">
                  <Text weight="semibold" size="sm">
                    {currentConfig.title}
                  </Text>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
                      mode === "leader"
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                    }`}
                  >
                    {mode === "leader" ? <ShieldCheck size={11} /> : <Bot size={11} />}
                    {currentConfig.badge}
                  </span>
                </HStack>
                <Text type="supporting" size="xsm" className="text-neutral-400 hidden sm:block">
                  {currentConfig.hint}
                </Text>
              </VStack>
            </HStack>

            <HStack gap={3} vAlign="center">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-neutral-400">
                <StatusDot variant="success" label="Sẵn sàng" />
                <span className="font-medium text-neutral-300">Hệ thống AI sẵn sàng</span>
              </div>
              <ProviderToggle />
            </HStack>
          </div>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} isScrollable={false}>
          <ChatBox />
        </LayoutContent>
      }
    />
  );
}
