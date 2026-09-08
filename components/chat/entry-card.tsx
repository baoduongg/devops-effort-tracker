"use client";

import { useState } from "react";
import { CalendarDays, FolderKanban, Check, Edit3, User, AlertCircle, Clock } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Selector } from "@astryxdesign/core/Selector";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { Button } from "@astryxdesign/core/Button";
import { Token } from "@astryxdesign/core/Token";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import type { FormattedEntry } from "@/types/chat";
import { formatEffortDuration, EFFORT_DURATION_PRESETS } from "@/lib/effort";

interface EntryCardProps {
  entry: FormattedEntry;
  confirmed: boolean;
  onConfirm: (entry: FormattedEntry) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Đang thực hiện (In Progress)" },
  { value: "planned", label: "Kế hoạch (Planned)" },
  { value: "done", label: "Hoàn thành (Done)" },
];

const STATUS_COLOR_MAP: Record<string, "blue" | "purple" | "green" | "gray"> = {
  in_progress: "blue",
  planned: "purple",
  done: "green",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  in_progress: "In Progress",
  planned: "Planned",
  done: "Done",
};

export function EntryCard({ entry, confirmed, onConfirm }: EntryCardProps): React.JSX.Element {
  const [edited, setEdited] = useState<FormattedEntry>({
    ...entry,
    effortMinutes: entry.effortMinutes || (entry.effortPercent ? Math.round((entry.effortPercent / 100) * 480) : 60),
    status: entry.status || "in_progress",
    assigneeName: entry.assigneeName || null,
  });
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const durationStr = formatEffortDuration(edited.effortMinutes);

  async function handleConfirm(): Promise<void> {
    setSubmitting(true);
    try {
      await onConfirm({
        ...edited,
        effortMinutes: edited.effortMinutes || 60,
        effortPercent: Math.round(((edited.effortMinutes || 60) / 480) * 100),
      });
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
            <Text weight="semibold">
              Đã ghi nhận task thành công
            </Text>
          </HStack>
          <VStack gap={1}>
            <Text weight="medium">{edited.title}</Text>
            <HStack gap={2} wrap="wrap" vAlign="center">
              <Text type="supporting">
                Dự án: <span className="text-neutral-200 font-medium">{edited.projectName}</span>
              </Text>
              {edited.assigneeName && (
                <>
                  <Text type="supporting" color="secondary">•</Text>
                  <Text type="supporting">
                    Giao cho: <span className="text-sky-300 font-medium">{edited.assigneeName}</span>
                  </Text>
                </>
              )}
              <Text type="supporting" color="secondary">•</Text>
              <Text type="supporting" color="secondary">
                Thời lượng: <span className="text-sky-300 font-medium">{durationStr}</span>
              </Text>
              {edited.startDate && (
                <>
                  <Text type="supporting" color="secondary">•</Text>
                  <Text type="supporting" color="secondary">
                    {edited.startDate}
                    {edited.endDate && edited.endDate !== edited.startDate ? ` → ${edited.endDate}` : ""}
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
                Chỉnh sửa thông tin Task
              </Text>
            </HStack>

            <TextInput
              label="Tiêu đề task"
              size="sm"
              width="100%"
              value={edited.title}
              onChange={(v) => setEdited({ ...edited, title: v })}
              placeholder="Nhập tiêu đề công việc..."
              isRequired
            />

            <TextInput
              label="Dự án"
              size="sm"
              width="100%"
              value={edited.projectName}
              onChange={(v) => setEdited({ ...edited, projectName: v })}
              placeholder="Tên dự án..."
              isRequired
            />

            <TextInput
              label="Người thực hiện (Assignee)"
              size="sm"
              width="100%"
              value={edited.assigneeName || ""}
              onChange={(v) => setEdited({ ...edited, assigneeName: v.trim() || null })}
              placeholder="Tên nhân sự được giao (VD: Sang, Tuấn...)"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <HStack justify="between" vAlign="center">
                <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                  <Clock size={13} className="text-sky-400" />
                  Thời lượng thực hiện: <span className="text-sky-300 font-semibold">{durationStr}</span>
                </span>
              </HStack>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {EFFORT_DURATION_PRESETS.map((p) => (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() =>
                      setEdited({
                        ...edited,
                        effortMinutes: p.minutes,
                        effortPercent: Math.round((p.minutes / 480) * 100),
                      })
                    }
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      edited.effortMinutes === p.minutes
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        : "bg-white/[0.03] text-neutral-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <NumberInput
                label="Số phút tùy chỉnh (phút)"
                size="sm"
                width="100%"
                min={1}
                max={4800}
                step={15}
                units="phút"
                value={edited.effortMinutes}
                onChange={(v) => {
                  const mins = v ?? 60;
                  setEdited({
                    ...edited,
                    effortMinutes: mins,
                    effortPercent: Math.round((mins / 480) * 100),
                  });
                }}
              />
            </div>

            <Selector
              label="Trạng thái"
              size="sm"
              width="100%"
              options={STATUS_OPTIONS}
              value={edited.status}
              onChange={(v) =>
                setEdited({ ...edited, status: (v as FormattedEntry["status"]) || "in_progress" })
              }
            />

            <DateInput
              label="Ngày bắt đầu"
              size="sm"
              format="date"
              width="100%"
              isRequired
              value={edited.startDate as ISODateString}
              onChange={(v) => setEdited({ ...edited, startDate: v ?? edited.startDate })}
            />

            <DateInput
              label="Ngày kết thúc"
              size="sm"
              format="date"
              width="100%"
              hasClear
              placeholder="Chọn ngày kết thúc (tùy chọn)"
              value={(edited.endDate || undefined) as ISODateString | undefined}
              onChange={(v) => setEdited({ ...edited, endDate: v || null })}
            />
          </VStack>
        ) : (
          <VStack gap={3}>
            <HStack vAlign="start" justify="between" gap={2}>
              <VStack gap={1} style={{ flex: 1, minWidth: 0 }}>
                <Text weight="medium">{edited.title}</Text>
                <HStack gap={1} vAlign="center" wrap="wrap">
                  <Icon icon={FolderKanban} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    {edited.projectName}
                  </Text>
                </HStack>
              </VStack>
              <Token
                label={STATUS_LABEL_MAP[edited.status] || edited.status}
                size="sm"
                color={STATUS_COLOR_MAP[edited.status] || "blue"}
              />
            </HStack>

            <HStack gap={2} wrap="wrap" vAlign="center">
              {edited.assigneeName && (
                <Token
                  label={`Assignee: ${edited.assigneeName}`}
                  size="sm"
                  color="purple"
                  icon={<User size={12} />}
                />
              )}
              <Token
                label={durationStr}
                size="sm"
                color={edited.effortMinutes > 480 ? "red" : edited.effortMinutes >= 240 ? "yellow" : "teal"}
                icon={<Clock size={12} />}
              />
              <HStack gap={1} vAlign="center">
                <Icon icon={CalendarDays} size="xsm" color="secondary" />
                <Text type="supporting">
                  {edited.startDate}
                  {edited.endDate && edited.endDate !== edited.startDate ? ` → ${edited.endDate}` : ""}
                </Text>
              </HStack>
            </HStack>

            {edited.suggestionNote && (
              <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <Icon icon={AlertCircle} size="sm" color="warning" />
                <Text size="sm" type="supporting" className="text-amber-200 leading-snug">
                  {edited.suggestionNote}
                </Text>
              </div>
            )}
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
            isDisabled={submitting || !edited.title || !edited.projectName}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

