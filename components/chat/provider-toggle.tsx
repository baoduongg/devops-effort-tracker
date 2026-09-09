"use client";

import { Cpu, Sparkles } from "lucide-react";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { useChatStore, type AiProvider } from "@/store/chat.store";

export function ProviderToggle(): React.JSX.Element {
  const aiProvider = useChatStore((state) => state.aiProvider);
  const setAiProvider = useChatStore((state) => state.setAiProvider);

  return (
    <SegmentedControl label="AI provider" value={aiProvider} onChange={(v) => setAiProvider(v as AiProvider)} size="sm">
      <SegmentedControlItem value="nvidia" label="NVIDIA" icon={<Cpu size={13} strokeWidth={2} />} />
      <SegmentedControlItem value="claude" label="Claude" icon={<Sparkles size={13} strokeWidth={2} />} />
    </SegmentedControl>
  );
}
