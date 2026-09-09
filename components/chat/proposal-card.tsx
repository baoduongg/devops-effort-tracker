"use client";

import { useState } from "react";
import { ArrowRight, Check, Edit3, TriangleAlert, Trash2, User, CalendarDays, FolderKanban, Clock } from "lucide-react";
import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
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
import type { TaskChangeProposal } from "@/types/chat";
import { formatEffortDuration } from "@/lib/effort";
import { formatDateLocal, parseDateLocal } from "@/lib/date";

// ISSUE-09: DateInput needs plain YYYY-MM-DD, but taskSnapshot/changes store full ISO datetime
// strings (e.g. "2026-09-08T17:00:00.000Z"). Convert at the DateInput boundary only — updateTask
// already accepts YYYY-MM-DD via `new Date(...)`, so no back-conversion is needed on submit.
function toDateInputValue(iso: string): ISODateString {
  return formatDateLocal(parseDateLocal(iso)) as ISODateString;
}

interface ProposalCardProps {
  proposal: TaskChangeProposal;
  confirmed: boolean;
  // ISSUE-07: appliedChanges (bản leader đã chỉnh sửa) truyền tách biệt với proposal.changes
  // (bản AI đề xuất ban đầu, không đổi) để chat-box ghi đúng proposedChanges vs appliedChanges.
  onConfirm: (proposal: TaskChangeProposal, appliedChanges: TaskChangeProposal["changes"]) => Promise<void>;
  onCancel: (proposal: TaskChangeProposal) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Đang thực hiện (In Progress)" },
  { value: "planned", label: "Kế hoạch (Planned)" },
  { value: "done", label: "Hoàn thành (Done)" },
];

const STATUS_LABEL_MAP: Record<string, string> = {
  in_progress: "In Progress",
  planned: "Planned",
  done: "Done",
};

function FieldDiff({ label, before, after }: { label: string; before: string; after: string }): React.JSX.Element {
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Text type="supporting" color="secondary">
        {label}:
      </Text>
      <Text type="supporting">{before}</Text>
      <Icon icon={ArrowRight} size="xsm" color="secondary" />
      <Text weight="semibold">{after}</Text>
    </HStack>
  );
}

export function ProposalCard({ proposal, confirmed, onConfirm, onCancel }: ProposalCardProps): React.JSX.Element {
  const [changes, setChanges] = useState(proposal.changes);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const { taskSnapshot } = proposal;
  const isDelete = proposal.action === "delete";

  async function handleConfirm(): Promise<void> {
    setSubmitting(true);
    try {
      // ISSUE-07: giữ nguyên proposal gốc (changes = bản AI đề xuất), truyền `changes` (bản leader
      // đã chỉnh sửa, có thể khác) riêng làm appliedChanges.
      await onConfirm(proposal, changes);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(): Promise<void> {
    setSubmitting(true);
    try {
      await onCancel(proposal);
      setCancelled(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (cancelled) {
    return (
      <Card width="100%" variant="gray">
        <HStack gap={2} vAlign="center">
          <Icon icon={TriangleAlert} color="secondary" size="sm" />
          <Text weight="semibold" color="secondary">
            Đã hủy — không có thay đổi nào được lưu.
          </Text>
        </HStack>
      </Card>
    );
  }

  if (confirmed) {
    return (
      <Card width="100%" variant={isDelete ? "red" : "green"}>
        <HStack gap={2} vAlign="center">
          <Icon icon={isDelete ? Trash2 : Check} color={isDelete ? "error" : "success"} size="sm" />
          <Text weight="semibold">
            {isDelete ? `Đã xóa task "${taskSnapshot.title}"` : `Đã cập nhật task "${taskSnapshot.title}"`}
          </Text>
        </HStack>
      </Card>
    );
  }

  // Field-by-field before -> after diffs for update proposals only.
  const diffRows: Array<{ key: string; label: string; before: string; after: string }> = [];
  if (!isDelete) {
    if (changes.title !== undefined) diffRows.push({ key: "title", label: "Tiêu đề", before: taskSnapshot.title, after: changes.title });
    if (changes.projectName !== undefined)
      diffRows.push({ key: "projectName", label: "Dự án", before: taskSnapshot.projectName, after: changes.projectName });
    if (changes.assigneeName !== undefined)
      diffRows.push({
        key: "assigneeName",
        label: "Người phụ trách",
        before: taskSnapshot.assigneeName ?? "—",
        after: changes.assigneeName ?? "—",
      });
    if (changes.status !== undefined)
      diffRows.push({
        key: "status",
        label: "Trạng thái",
        before: STATUS_LABEL_MAP[taskSnapshot.status] ?? taskSnapshot.status,
        after: STATUS_LABEL_MAP[changes.status] ?? changes.status,
      });
    if (changes.startDate !== undefined)
      diffRows.push({ key: "startDate", label: "Ngày bắt đầu", before: taskSnapshot.startDate, after: changes.startDate });
    if (changes.endDate !== undefined)
      diffRows.push({ key: "endDate", label: "Ngày kết thúc", before: taskSnapshot.endDate ?? "—", after: changes.endDate ?? "—" });
    if (changes.effortMinutes !== undefined)
      diffRows.push({
        key: "effortMinutes",
        label: "Effort",
        before: formatEffortDuration(taskSnapshot.effortMinutes),
        after: formatEffortDuration(changes.effortMinutes),
      });
  }

  return (
    <Card width="100%" variant={isDelete ? "red" : "default"}>
      <VStack gap={3}>
        <HStack vAlign="center" gap={2}>
          <Icon icon={isDelete ? Trash2 : Edit3} size="sm" color={isDelete ? "error" : "accent"} />
          <Text weight="semibold" size="sm">
            Đề xuất: {isDelete ? "XÓA" : "SỬA"} task
          </Text>
          <StackItem size="fill" />
          <Token
            label={STATUS_LABEL_MAP[taskSnapshot.status] ?? taskSnapshot.status}
            size="sm"
            color={taskSnapshot.status === "done" ? "green" : taskSnapshot.status === "planned" ? "purple" : "blue"}
          />
        </HStack>

        <VStack gap={1}>
          <Text weight="medium">{taskSnapshot.title}</Text>
          <HStack gap={2} wrap="wrap" vAlign="center">
            <HStack gap={1} vAlign="center">
              <Icon icon={FolderKanban} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {taskSnapshot.projectName}
              </Text>
            </HStack>
            {taskSnapshot.assigneeName && (
              <HStack gap={1} vAlign="center">
                <Icon icon={User} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  {taskSnapshot.assigneeName}
                </Text>
              </HStack>
            )}
            <HStack gap={1} vAlign="center">
              <Icon icon={Clock} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {formatEffortDuration(taskSnapshot.effortMinutes)}
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Icon icon={CalendarDays} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {taskSnapshot.startDate}
                {taskSnapshot.endDate ? ` → ${taskSnapshot.endDate}` : ""}
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {isDelete ? (
          <Banner status="warning" title="Hành động này sẽ xóa vĩnh viễn task khỏi hệ thống, không thể hoàn tác." />
        ) : editing ? (
          <VStack gap={3}>
            <TextInput
              label="Tiêu đề task"
              size="sm"
              width="100%"
              value={changes.title ?? taskSnapshot.title}
              onChange={(v) => setChanges({ ...changes, title: v })}
            />
            <TextInput
              label="Dự án"
              size="sm"
              width="100%"
              value={changes.projectName ?? taskSnapshot.projectName}
              onChange={(v) => setChanges({ ...changes, projectName: v })}
            />
            <VStack gap={1}>
              <HStack gap={2} vAlign="end">
                <StackItem size="fill">
                  <TextInput
                    label="Người phụ trách"
                    size="sm"
                    width="100%"
                    value={changes.assigneeName === null ? "" : (changes.assigneeName ?? taskSnapshot.assigneeName ?? "")}
                    // ISSUE-08: để trống ô này = giữ nguyên (không đổi field assigneeName), KHÔNG
                    // phải unassign — unassign thật cần bấm nút riêng bên cạnh để tránh nhầm lẫn.
                    onChange={(v) => {
                      const trimmed = v.trim();
                      setChanges((prev) => {
                        const next = { ...prev };
                        if (trimmed) {
                          next.assigneeName = trimmed;
                        } else {
                          delete next.assigneeName;
                        }
                        return next;
                      });
                    }}
                    placeholder="Tên nhân sự (bỏ trống để giữ nguyên)"
                  />
                </StackItem>
                <Button
                  label="Bỏ người phụ trách"
                  variant="secondary"
                  size="sm"
                  onClick={() => setChanges({ ...changes, assigneeName: null })}
                />
              </HStack>
              {changes.assigneeName === null && (
                <Text type="supporting" color="secondary">
                  Sẽ bỏ người phụ trách hiện tại (Unassigned) khi xác nhận.
                </Text>
              )}
            </VStack>
            <Selector
              label="Trạng thái"
              size="sm"
              width="100%"
              options={STATUS_OPTIONS}
              value={changes.status ?? taskSnapshot.status}
              onChange={(v) => setChanges({ ...changes, status: (v as TaskChangeProposal["taskSnapshot"]["status"]) || taskSnapshot.status })}
            />
            <NumberInput
              label="Effort (phút)"
              size="sm"
              width="100%"
              min={1}
              max={4800}
              step={15}
              units="phút"
              value={changes.effortMinutes ?? taskSnapshot.effortMinutes}
              onChange={(v) => setChanges({ ...changes, effortMinutes: v ?? taskSnapshot.effortMinutes })}
            />
            <DateInput
              label="Ngày bắt đầu"
              size="sm"
              format="date"
              width="100%"
              value={toDateInputValue(changes.startDate ?? taskSnapshot.startDate)}
              onChange={(v) => setChanges({ ...changes, startDate: v ?? taskSnapshot.startDate })}
            />
            <DateInput
              label="Ngày kết thúc"
              size="sm"
              format="date"
              width="100%"
              hasClear
              value={changes.endDate ?? taskSnapshot.endDate ? toDateInputValue((changes.endDate ?? taskSnapshot.endDate) as string) : undefined}
              onChange={(v) => setChanges({ ...changes, endDate: v || null })}
            />
          </VStack>
        ) : (
          <VStack gap={1.5}>
            {diffRows.length > 0 ? (
              diffRows.map((row) => <FieldDiff key={row.key} label={row.label} before={row.before} after={row.after} />)
            ) : (
              <Text type="supporting" color="secondary">
                Không có thay đổi cụ thể nào được đề xuất.
              </Text>
            )}
          </VStack>
        )}

        <Divider />

        <HStack gap={2} vAlign="center">
          {!isDelete && (
            <Button
              label={editing ? "Xem trước thẻ" : "Chỉnh sửa"}
              variant="secondary"
              size="sm"
              onClick={() => setEditing((v) => !v)}
              isDisabled={submitting}
            />
          )}
          <StackItem size="fill" />
          <Button label="Hủy" variant="secondary" size="sm" onClick={handleCancel} isDisabled={submitting} />
          <Button
            label={submitting ? "Đang xử lý…" : "Xác nhận"}
            size="sm"
            variant={isDelete ? "destructive" : "primary"}
            onClick={handleConfirm}
            isDisabled={submitting}
          />
        </HStack>
      </VStack>
    </Card>
  );
}
