"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStore } from "@/store/chat.store";
import type { ChatMode } from "@/types/chat";

export function ModeToggle(): React.JSX.Element {
  const mode = useChatStore((state) => state.mode);
  const setMode = useChatStore((state) => state.setMode);

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as ChatMode)}>
      <TabsList>
        <TabsTrigger value="devops">DevOps: Log/Plan</TabsTrigger>
        <TabsTrigger value="leader">Leader: Ask</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
