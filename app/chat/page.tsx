import { VStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { ChatBox } from "@/components/chat/chat-box";

export default function ChatPage(): React.JSX.Element {
  return (
    <VStack gap={4} height="100%">
      <VStack gap={1}>
        <Heading level={1}>AI Chat</Heading>
        <Text type="supporting">Log work or ask about your team, paste text or a screenshot to get started.</Text>
      </VStack>
      <ChatBox />
    </VStack>
  );
}
