"use client";

import { useState } from "react";
import { CalendarDays, FolderKanban, Check } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { Button } from "@astryxdesign/core/Button";
import { Token } from "@astryxdesign/core/Token";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import type { FormattedEntry } from "@/types/chat";

interface EntryCardProps {
  entry: FormattedEntry;
  confirmed: boolean;
  onConfirm: (entry: FormattedEntry) => Promise<void>;
}

export function EntryCard({ entry, confirmed, onConfirm }: EntryCardProps): React.JSX.Element {
  const [edited, setEdited] = useState(entry);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm(): Promise<void> {
    setSubmitting(true);
    try {
      await onConfirm(edited);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <Card maxWidth={360} variant="green">
        <HStack gap={3} vAlign="center">
          <Icon icon={Check} color="success" />
          <VStack gap={0}>
            <Text weight="medium">{edited.title}</Text>
            <Text type="supporting">Logged to {edited.projectName}</Text>
          </VStack>
        </HStack>
      </Card>
    );
  }

  return (
    <Card maxWidth={360}>
      <VStack gap={3}>
        {editing ? (
          <VStack gap={3}>
            <TextInput label="Title" value={edited.title} onChange={(v) => setEdited({ ...edited, title: v })} />
            <TextInput
              label="Project"
              value={edited.projectName}
              onChange={(v) => setEdited({ ...edited, projectName: v })}
            />
            <HStack gap={3}>
              <NumberInput
                label="Effort %"
                value={edited.effortPercent}
                onChange={(v) => setEdited({ ...edited, effortPercent: v })}
              />
              <DateInput
                label="Start date"
                value={edited.startDate as ISODateString}
                onChange={(v) => setEdited({ ...edited, startDate: v ?? edited.startDate })}
              />
            </HStack>
          </VStack>
        ) : (
          <VStack gap={2}>
            <Text weight="medium">{edited.title}</Text>
            <HStack gap={3} wrap="wrap">
              <HStack gap={1} vAlign="center">
                <Icon icon={FolderKanban} size="xsm" color="secondary" />
                <Text type="supporting">{edited.projectName}</Text>
              </HStack>
              <HStack gap={1} vAlign="center">
                <Icon icon={CalendarDays} size="xsm" color="secondary" />
                <Text type="supporting">{edited.startDate}</Text>
              </HStack>
              <Token label={`${edited.effortPercent}% effort`} size="sm" />
            </HStack>
          </VStack>
        )}

        <HStack gap={2}>
          <Button
            label={editing ? "Done editing" : "Edit"}
            variant="secondary"
            size="sm"
            onClick={() => setEditing((v) => !v)}
            isDisabled={submitting}
          />
          <StackItem size="fill" />
          <Button
            label={submitting ? "Saving…" : "Confirm"}
            size="sm"
            variant="primary"
            onClick={handleConfirm}
            isDisabled={submitting}
          />
        </HStack>
      </VStack>
    </Card>
  );
}
