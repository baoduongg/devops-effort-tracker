"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, UserPlus } from "lucide-react";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Table, proportional, pixel } from "@astryxdesign/core/Table";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { IconButton } from "@astryxdesign/core/IconButton";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Member, MemberStatus } from "@/types/member";

interface MemberListProps {
  members: Member[];
  onDelete: (id: string) => void;
}

const effortVariant = (percent: number): "error" | "warning" | "success" => {
  if (percent > 100) return "error";
  if (percent > 60) return "warning";
  return "success";
};

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "overloaded", label: "Overloaded" },
];

interface MemberRow extends Record<string, unknown> {
  member: Member;
}

export function MemberList({ members, onDelete }: MemberListProps): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [members, query, statusFilter]);

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Icon icon={UserPlus} size="lg" />}
        title="No members yet"
        description="Create your first member to get started."
      />
    );
  }

  const rows: MemberRow[] = filtered.map((member) => ({ member }));

  return (
    <VStack gap={4}>
      <HStack gap={3}>
        <StackItem size="fill">
          <TextInput
            label="Search members"
            isLabelHidden
            value={query}
            onChange={setQuery}
            placeholder="Search by name or email"
            startIcon={Search}
            hasClear
          />
        </StackItem>
        <Selector
          label="Filter by status"
          isLabelHidden
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as MemberStatus | "all")}
          width={180}
        />
      </HStack>

      <Table<MemberRow>
        data={rows}
        idKey={(row) => row.member.id}
        columns={[
          {
            key: "member",
            header: "Member",
            width: proportional(2),
            renderCell: (row) => (
              <HStack gap={3} vAlign="center">
                <Avatar name={row.member.name} src={row.member.photoURL ?? undefined} size="sm" tooltip={false} />
                <VStack gap={0}>
                  <Text weight="medium" maxLines={1}>
                    {row.member.name}
                  </Text>
                  <Text type="supporting" maxLines={1}>
                    {row.member.email}
                  </Text>
                </VStack>
              </HStack>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: proportional(1),
            renderCell: (row) => <StatusBadge status={row.member.status} />,
          },
          {
            key: "effort",
            header: "Effort",
            width: proportional(1),
            renderCell: (row) => (
              <ProgressBar
                label="Effort"
                isLabelHidden
                value={Math.min(row.member.effortPercent, 100)}
                hasValueLabel
                formatValueLabel={() => `${row.member.effortPercent}%`}
                variant={effortVariant(row.member.effortPercent)}
              />
            ),
          },
          {
            key: "actions",
            header: "Actions",
            width: pixel(72),
            align: "end",
            renderCell: (row) => (
              <IconButton
                label="Delete member"
                icon={<Trash2 size={16} strokeWidth={2} />}
                variant="ghost"
                onClick={() => onDelete(row.member.id)}
                tooltip="Delete member"
              />
            ),
          },
        ]}
        emptyState={<EmptyState title="No members match your search" isCompact />}
      />
    </VStack>
  );
}
