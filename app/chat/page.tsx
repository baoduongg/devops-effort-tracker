import { VStack, StackItem } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Sparkles } from "lucide-react";
import { ChatBox } from "@/components/chat/chat-box";

export default function ChatPage(): React.JSX.Element {
  return (
    <VStack gap={3} height="100%" className="h-full max-h-full min-h-0 overflow-hidden">
      <StackItem size="static">
        <div className="flex flex-col gap-1 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles size={16} />
            </span>
            <Heading level={1}>DevOps AI Assistant</Heading>
          </div>
          <Text type="supporting">
            Ghi nhận công việc tự động qua hội thoại / ảnh chụp màn hình hoặc hỏi đáp nhanh về tình hình tải của cả team.
          </Text>
        </div>
      </StackItem>
      <StackItem size="fill" className="min-h-0 flex flex-col overflow-hidden">
        <ChatBox />
      </StackItem>
    </VStack>
  );
}

