"use client";

import { NotebookPen, Search } from "lucide-react";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { useChatStore } from "@/store/chat.store";
import type { ChatMode } from "@/types/chat";

export function ModeToggle(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
  const setMode = useChatStore((state) => state.setMode);

  return (
    <SegmentedControl label="Chat mode" value={mode} onChange={(v) => setMode(v as ChatMode)} layout="fill">
      <SegmentedControlItem value="devops" label="Log / Plan" icon={<NotebookPen size={14} strokeWidth={2} />} />
      <SegmentedControlItem value="leader" label="Ask" icon={<Search size={14} strokeWidth={2} />} />
    </SegmentedControl>
  );
}
