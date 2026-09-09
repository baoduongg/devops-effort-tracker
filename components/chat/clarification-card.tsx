"use client";

import { HelpCircle } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { Markdown } from "@astryxdesign/core/Markdown";
import type { ClarificationRequest } from "@/types/chat";

interface ClarificationCardProps {
  text: string;
  clarification: ClarificationRequest;
  onSelectCandidate: (label: string) => void;
}

export function ClarificationCard({ text, clarification, onSelectCandidate }: ClarificationCardProps): React.JSX.Element {
  return (
    <Card width="100%" variant="yellow">
      <VStack gap={3}>
        <HStack vAlign="center" gap={2}>
          <Icon icon={HelpCircle} size="sm" color="warning" />
          <Text weight="semibold" size="sm">
            Cần bạn xác nhận rõ hơn
          </Text>
        </HStack>

        {text && (
          <Markdown density="compact" autolink="gfm">
            {text}
          </Markdown>
        )}

        {clarification.candidates && clarification.candidates.length > 0 && (
          <VStack gap={1.5}>
            {clarification.candidates.map((c) => (
              <Button
                key={c.id}
                label={c.label}
                variant="secondary"
                size="sm"
                onClick={() => onSelectCandidate(c.label)}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Card>
  );
}
