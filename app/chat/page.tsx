import { ChatBox } from "@/components/chat/chat-box";

export default function ChatPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">AI Chat</h1>
      <ChatBox />
    </div>
  );
}
