"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, Search, Pencil, Trash2, XCircle, Plus, Clock } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { List, ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { IconButton } from "@astryxdesign/core/IconButton";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Button } from "@astryxdesign/core/Button";
import { AlarmFormModal } from "@/components/alarms/alarm-form-modal";
import { subscribeAllAlarms, cancelAlarm, deleteAlarm } from "@/services/alarms.service";
import { subscribeMembers } from "@/services/members.service";
import { sortByDateDesc } from "@/lib/date";
import type { Alarm, AlarmStatus } from "@/types/alarm";
import type { Member } from "@/types/member";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang chờ" },
  { value: "done", label: "Đã báo" },
  { value: "cancelled", label: "Đã hủy" },
];

function statusBadge(status: AlarmStatus): { variant: "info" | "success" | "neutral"; label: string } {
  if (status === "done") return { variant: "success", label: "Đã báo" };
  if (status === "cancelled") return { variant: "neutral", label: "Đã hủy" };
  return { variant: "info", label: "Đang chờ" };
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function AlarmsPage(): React.JSX.Element {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlarmStatus | "all">("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [cancellingAlarm, setCancellingAlarm] = useState<Alarm | null>(null);
  const [deletingAlarm, setDeletingAlarm] = useState<Alarm | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const unsubAlarms = subscribeAllAlarms((a) => {
      setAlarms(a);
      setLoading(false);
    });
    const unsubMembers = subscribeMembers(setMembers);
    return () => {
      unsubAlarms();
      unsubMembers();
    };
  }, []);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const filteredAlarms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alarms
      .filter((a) => {
        const matchesQuery = !q || a.content.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort(sortByDateDesc("time"));
  }, [alarms, query, statusFilter]);

  async function handleConfirmCancel(): Promise<void> {
    if (!cancellingAlarm) return;
    setIsBusy(true);
    try {
      await cancelAlarm(cancellingAlarm.id);
      setCancellingAlarm(null);
    } catch (error) {
      console.error("Failed to cancel alarm:", error);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deletingAlarm) return;
    setIsBusy(true);
    try {
      await deleteAlarm(deletingAlarm.id);
      setDeletingAlarm(null);
    } catch (error) {
      console.error("Failed to delete alarm:", error);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <VStack gap={5}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BellRing size={16} />
            </span>
            <Heading level={1}>Quản lý Alarm</Heading>
          </HStack>
          <Text type="supporting">Nhắc việc độc lập, không gắn với task nào.</Text>
        </VStack>

        <Button label="Tạo Alarm" icon={<Plus size={15} />} variant="primary" onClick={() => setIsCreateOpen(true)} />
      </div>

      <Card elevation="low">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <TextInput
              label="Tìm alarm"
              isLabelHidden
              value={query}
              onChange={setQuery}
              placeholder="Tìm theo nội dung..."
              startIcon={Search}
              hasClear
            />
          </div>
          <div className="w-full sm:w-44">
            <Selector
              label="Trạng thái"
              isLabelHidden
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as AlarmStatus | "all")}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <VStack gap={2}>
          <Skeleton height={64} />
          <Skeleton height={64} />
        </VStack>
      ) : filteredAlarms.length === 0 ? (
        <EmptyState
          icon={<Icon icon={BellRing} size="lg" />}
          title="Không có alarm nào"
          description="Bấm 'Tạo Alarm' để đặt nhắc việc mới."
        />
      ) : (
        <Card elevation="low">
          <List hasDividers density="balanced">
            {filteredAlarms.map((alarm) => {
              const member = memberMap.get(alarm.memberId);
              const supervisor = alarm.supervisorId ? memberMap.get(alarm.supervisorId) : undefined;
              const badge = statusBadge(alarm.status);

              return (
                <ListItem
                  key={alarm.id}
                  label={alarm.content}
                  startContent={
                    member ? (
                      <Avatar name={member.name} src={member.photoURL ?? undefined} size="sm" tooltip={false} />
                    ) : (
                      <Avatar name="?" size="sm" tooltip={false} />
                    )
                  }
                  description={
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <span className="text-xs text-neutral-400">{member?.name ?? "Chưa gán"}</span>
                      {alarm.projectName && (
                        <>
                          <span className="text-xs text-neutral-600">•</span>
                          <span className="text-xs text-neutral-500">{alarm.projectName}</span>
                        </>
                      )}
                      {supervisor && (
                        <>
                          <span className="text-xs text-neutral-600">•</span>
                          <span className="text-xs text-neutral-500">Giám sát: {supervisor.name}</span>
                        </>
                      )}
                      <span className="text-xs text-neutral-600">•</span>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock size={11} />
                        {formatDateTime(alarm.time)}
                      </span>
                    </HStack>
                  }
                  endContent={
                    <HStack gap={2} vAlign="center">
                      <Badge variant={badge.variant} label={badge.label} />
                      <HStack gap={0.5}>
                        <IconButton
                          label="Sửa alarm"
                          icon={<Pencil size={13} />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAlarm(alarm)}
                          tooltip="Sửa alarm"
                          isDisabled={alarm.status !== "active"}
                        />
                        <IconButton
                          label="Hủy báo"
                          icon={<XCircle size={13} />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingAlarm(alarm)}
                          tooltip="Hủy báo"
                          isDisabled={alarm.status !== "active"}
                        />
                        <IconButton
                          label="Xóa alarm"
                          icon={<Trash2 size={13} />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingAlarm(alarm)}
                          tooltip="Xóa alarm"
                        />
                      </HStack>
                    </HStack>
                  }
                />
              );
            })}
          </List>
        </Card>
      )}

      <AlarmFormModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} alarm={null} members={members} />

      <AlarmFormModal
        isOpen={Boolean(editingAlarm)}
        onOpenChange={(open) => !open && setEditingAlarm(null)}
        alarm={editingAlarm}
        members={members}
      />

      <AlertDialog
        isOpen={Boolean(cancellingAlarm)}
        onOpenChange={(open) => !open && setCancellingAlarm(null)}
        title="Hủy alarm này?"
        description={`Alarm "${cancellingAlarm?.content ?? ""}" sẽ không còn báo nữa, nhưng vẫn giữ trong lịch sử.`}
        actionLabel="Hủy báo"
        onAction={handleConfirmCancel}
        isActionLoading={isBusy}
      />

      <AlertDialog
        isOpen={Boolean(deletingAlarm)}
        onOpenChange={(open) => !open && setDeletingAlarm(null)}
        title="Xóa alarm này?"
        description={`Alarm "${deletingAlarm?.content ?? ""}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        actionLabel="Xóa alarm"
        onAction={handleConfirmDelete}
        isActionLoading={isBusy}
      />
    </VStack>
  );
}
