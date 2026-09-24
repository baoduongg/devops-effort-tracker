"use client";

import { useState } from "react";
import { BellRing, Check, Edit3, FolderKanban, Clock, User, Eye } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { DateTimeInput } from "@astryxdesign/core/DateTimeInput";
import type { ISODateTimeString } from "@astryxdesign/core/DateTimeInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { Token } from "@astryxdesign/core/Token";
import type { AlarmProposal } from "@/types/chat";
import type { Member } from "@/types/member";

interface AlarmEntryCardProps {
  proposal: AlarmProposal;
  confirmed: boolean;
  members: Member[];
  onConfirm: (proposal: AlarmProposal) => Promise<void>;
}

// DateTimeInput's value/onChange use local-time "YYYY-MM-DDTHH:MM" (no timezone suffix),
// while `time` is stored as a UTC ISO string — convert at this component's boundary.
function toLocalDateTimeValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AlarmEntryCard({ proposal, confirmed, members, onConfirm }: AlarmEntryCardProps): React.JSX.Element {
  const [edited, setEdited] = useState<AlarmProposal>(proposal);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timeLabel = new Date(edited.time).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  const memberName = members.find((m) => m.id === edited.memberId)?.name || "Không rõ";
  const supervisorName = edited.supervisorId ? members.find((m) => m.id === edited.supervisorId)?.name : null;

  const memberOptions = members.map((m) => ({ value: m.id, label: m.name }));
  const supervisorOptions = [{ value: "", label: "Không có" }, ...memberOptions];

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
      <Card width="100%" variant="green">
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={Check} color="success" size="sm" />
            <Text weight="semibold">Đã đặt alarm thành công</Text>
          </HStack>
          <VStack gap={1}>
            <Text weight="medium">{edited.content}</Text>
            <HStack gap={2} wrap="wrap" vAlign="center">
              <Text type="supporting" color="secondary">
                Người thực hiện: <span className="text-sky-300 font-medium">{memberName}</span>
              </Text>
              {supervisorName && (
                <>
                  <Text type="supporting" color="secondary">•</Text>
                  <Text type="supporting" color="secondary">
                    Giám sát: <span className="text-neutral-200 font-medium">{supervisorName}</span>
                  </Text>
                </>
              )}
              <Text type="supporting" color="secondary">•</Text>
              <Text type="supporting" color="secondary">
                Thời gian: <span className="text-sky-300 font-medium">{timeLabel}</span>
              </Text>
              {edited.projectName && (
                <>
                  <Text type="supporting" color="secondary">•</Text>
                  <Text type="supporting" color="secondary">
                    Dự án: <span className="text-neutral-200 font-medium">{edited.projectName}</span>
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
        </VStack>
      </Card>
    );
  }

  return (
    <Card width="100%">
      <VStack gap={3}>
        {editing ? (
          <VStack gap={3}>
            <HStack vAlign="center" gap={2}>
              <Icon icon={Edit3} size="sm" color="accent" />
              <Text weight="semibold" size="sm">
                Chỉnh sửa Alarm
              </Text>
            </HStack>

            <TextArea
              label="Nội dung"
              size="sm"
              width="100%"
              value={edited.content}
              onChange={(v) => setEdited({ ...edited, content: v })}
              placeholder="VD: Nhắc review PR hạ tầng..."
              isRequired
            />

            <DateTimeInput
              label="Thời gian alarm"
              size="sm"
              width="100%"
              isRequired
              timeOptionInterval={15}
              value={toLocalDateTimeValue(edited.time) as ISODateTimeString}
              onChange={(v) => setEdited({ ...edited, time: v ? new Date(v).toISOString() : edited.time })}
            />

            <Selector
              label="Người thực hiện"
              size="sm"
              width="100%"
              isRequired
              options={memberOptions}
              value={edited.memberId}
              onChange={(v) => setEdited({ ...edited, memberId: v })}
            />

            <Selector
              label="Người giám sát (Tùy chọn)"
              size="sm"
              width="100%"
              options={supervisorOptions}
              value={edited.supervisorId || ""}
              onChange={(v) => setEdited({ ...edited, supervisorId: v || null })}
            />

            <TextInput
              label="Dự án (Tùy chọn)"
              size="sm"
              width="100%"
              value={edited.projectName || ""}
              onChange={(v) => setEdited({ ...edited, projectName: v.trim() || null })}
              placeholder="VD: Internal Tools"
            />
          </VStack>
        ) : (
          <VStack gap={3}>
            <HStack vAlign="start" justify="between" gap={2}>
              <VStack gap={1} style={{ flex: 1, minWidth: 0 }}>
                <HStack gap={1.5} vAlign="center">
                  <Icon icon={BellRing} size="xsm" color="accent" />
                  <Text weight="medium">{edited.content}</Text>
                </HStack>
                {edited.projectName && (
                  <HStack gap={1} vAlign="center" wrap="wrap">
                    <Icon icon={FolderKanban} size="xsm" color="secondary" />
                    <Text type="supporting" color="secondary">
                      {edited.projectName}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </HStack>

            <HStack gap={2} wrap="wrap" vAlign="center">
              <Token label={`Thực hiện: ${memberName}`} size="sm" color="purple" icon={<User size={12} />} />
              {supervisorName && (
                <Token label={`Giám sát: ${supervisorName}`} size="sm" color="gray" icon={<Eye size={12} />} />
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold tabular-nums bg-sky-500/15 text-sky-300 border border-sky-500/30">
                <Clock size={12} />
                {timeLabel}
              </span>
            </HStack>
          </VStack>
        )}

        <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "2px 0" }} />

        <HStack gap={2} vAlign="center">
          <Button
            label={editing ? "Xem trước thẻ" : "Chỉnh sửa"}
            variant="secondary"
            size="sm"
            onClick={() => setEditing((v) => !v)}
            isDisabled={submitting}
          />
          <StackItem size="fill" />
          <Button
            label={submitting ? "Đang lưu…" : "Xác nhận"}
            size="sm"
            variant="primary"
            onClick={handleConfirm}
            isDisabled={submitting || !edited.content || !edited.time || !edited.memberId}
          />
        </HStack>
      </VStack>
    </Card>
  );
}
