"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/Stack";
import { DateTimeInput } from "@astryxdesign/core/DateTimeInput";
import type { ISODateTimeString } from "@astryxdesign/core/DateTimeInput";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Button } from "@astryxdesign/core/Button";
import { createAlarm, updateAlarm } from "@/services/alarms.service";
import { toLocalDateTimeValue } from "@/lib/date";
import type { Alarm } from "@/types/alarm";
import type { Member } from "@/types/member";

interface AlarmFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alarm: Alarm | null;
  members: Member[];
  onSaved?: () => void;
}

export function AlarmFormModal(props: AlarmFormModalProps): React.JSX.Element {
  // Remount the form whenever a different alarm is opened, so its state resets without an effect
  return <AlarmForm key={props.alarm?.id ?? "new"} {...props} />;
}

function AlarmForm({ isOpen, onOpenChange, alarm, members, onSaved }: AlarmFormModalProps): React.JSX.Element {
  const [memberId, setMemberId] = useState<string>(alarm?.memberId ?? "");
  const [supervisorId, setSupervisorId] = useState<string>(alarm?.supervisorId ?? "");
  const [content, setContent] = useState<string>(alarm?.content ?? "");
  const [projectName, setProjectName] = useState<string>(alarm?.projectName ?? "");
  const [time, setTime] = useState<string | null>(alarm?.time ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberOptions = members.map((m) => ({ value: m.id, label: m.name }));
  const supervisorOptions = [
    { value: "", label: "Không có" },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!memberId) {
      setError("Vui lòng chọn người thực hiện.");
      return;
    }
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung.");
      return;
    }
    if (!time) {
      setError("Vui lòng chọn thời gian alarm.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const resolvedSupervisorId = supervisorId || null;
      const resolvedProjectName = projectName.trim() || null;
      if (alarm) {
        await updateAlarm(alarm.id, {
          memberId,
          supervisorId: resolvedSupervisorId,
          content: content.trim(),
          projectName: resolvedProjectName,
          time,
        });
      } else {
        await createAlarm({
          memberId,
          supervisorId: resolvedSupervisorId,
          content: content.trim(),
          projectName: resolvedProjectName,
          time,
          status: "active",
          firedAt: null,
        });
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save alarm:", err);
      setError("Không thể lưu alarm. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={480}>
      <DialogHeader
        title={alarm ? "Sửa Alarm" : "Tạo Alarm"}
        subtitle="Nhắc việc độc lập, không gắn với task nào"
        onOpenChange={onOpenChange}
      />

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="p-5 flex flex-col gap-4 overflow-y-auto min-h-0">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-sm text-rose-400">
              {error}
            </div>
          )}

          <DateTimeInput
            label="Thời gian alarm"
            isRequired
            timeOptionInterval={15}
            value={(time ? toLocalDateTimeValue(time) : undefined) as ISODateTimeString | undefined}
            onChange={(v) => setTime(v ? new Date(v).toISOString() : null)}
          />

          <Selector
            label="Người thực hiện"
            isRequired
            options={memberOptions}
            value={memberId}
            onChange={setMemberId}
          />

          <Selector
            label="Người giám sát (Tùy chọn)"
            options={supervisorOptions}
            value={supervisorId}
            onChange={setSupervisorId}
          />

          <TextArea
            label="Nội dung"
            value={content}
            onChange={setContent}
            placeholder="VD: Nhắc review PR hạ tầng, gọi báo cáo tuần..."
            isRequired
          />

          <TextInput
            label="Dự án (Tùy chọn)"
            value={projectName}
            onChange={setProjectName}
            placeholder="VD: Internal Tools"
          />
        </div>

        <HStack gap={3} justify="end" className="p-5 pt-3 border-t border-white/[0.06]">
          <Button
            type="button"
            label="Hủy"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            isDisabled={submitting}
          />
          <Button
            type="submit"
            label={submitting ? "Đang lưu…" : alarm ? "Lưu thay đổi" : "Tạo Alarm"}
            variant="primary"
            icon={<BellRing size={15} />}
            isDisabled={submitting}
          />
        </HStack>
      </form>
    </Dialog>
  );
}
