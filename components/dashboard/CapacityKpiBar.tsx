import React from "react";
import { Users, CheckCircle2, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Button } from "@astryxdesign/core/Button";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Card } from "@astryxdesign/core/Card";
import { StatCard } from "@/components/dashboard/stat-card";
import type { CapacityFilter } from "./hooks/useTeamCapacityStats";

interface CapacityKpiBarProps {
  capacityFilter: CapacityFilter;
  onCapacityFilterChange: (filter: CapacityFilter) => void;
  displayMembersCount: number;
  availableMembersCount: number;
  activeWorkingCount: number;
  overloadedCount: number;
  overdueCount: number;
}

const FILTER_LABELS: Record<Exclude<CapacityFilter, "all">, string> = {
  available: "Trống việc / Rảnh",
  working: "Vừa tải (50-100%)",
  overloaded: "Quá tải (>100%)",
  overdue: "Trễ hạn",
};

export function CapacityKpiBar({
  capacityFilter,
  onCapacityFilterChange,
  displayMembersCount,
  availableMembersCount,
  activeWorkingCount,
  overloadedCount,
  overdueCount,
}: CapacityKpiBarProps): React.JSX.Element {
  return (
    <Card elevation="low">
      <VStack gap={3}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => onCapacityFilterChange("all")}
            className="text-left w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
          >
            <StatCard
              label="Tổng DevOps"
              value={String(displayMembersCount)}
              icon={Users}
              tone="primary"
              isSelected={capacityFilter === "all"}
            />
          </button>

          <button
            type="button"
            onClick={() => onCapacityFilterChange(capacityFilter === "available" ? "all" : "available")}
            className="text-left w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
          >
            <StatCard
              label="Trống việc / Rảnh"
              value={String(availableMembersCount)}
              icon={CheckCircle2}
              tone="success"
              isSelected={capacityFilter === "available"}
            />
          </button>

          <button
            type="button"
            onClick={() => onCapacityFilterChange(capacityFilter === "working" ? "all" : "working")}
            className="text-left w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
          >
            <StatCard
              label="Vừa tải (50-100%)"
              value={String(activeWorkingCount)}
              icon={Clock}
              tone="primary"
              isSelected={capacityFilter === "working"}
            />
          </button>

          <button
            type="button"
            onClick={() => onCapacityFilterChange(capacityFilter === "overloaded" ? "all" : "overloaded")}
            className="text-left w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
          >
            <StatCard
              label="Quá tải (>100%)"
              value={String(overloadedCount)}
              icon={AlertTriangle}
              tone="destructive"
              isSelected={capacityFilter === "overloaded"}
            />
          </button>

          <button
            type="button"
            onClick={() => onCapacityFilterChange(capacityFilter === "overdue" ? "all" : "overdue")}
            className="text-left w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
          >
            <StatCard
              label="Trễ hạn"
              value={String(overdueCount)}
              icon={AlertTriangle}
              tone="warning"
              isSelected={capacityFilter === "overdue"}
            />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
          <SegmentedControl
            label="Lọc theo tình trạng"
            value={capacityFilter}
            onChange={(v) => onCapacityFilterChange(v as CapacityFilter)}
          >
            <SegmentedControlItem value="all" label={`Tất cả (${displayMembersCount})`} />
            <SegmentedControlItem value="available" label={`Trống việc (${availableMembersCount})`} />
            <SegmentedControlItem value="working" label={`Vừa tải (${activeWorkingCount})`} />
            <SegmentedControlItem value="overloaded" label={`Quá tải (${overloadedCount})`} />
            <SegmentedControlItem value="overdue" label={`Trễ hạn (${overdueCount})`} />
          </SegmentedControl>

          {capacityFilter !== "all" && (
            <HStack gap={2} vAlign="center">
              <span className="text-xs text-secondary">
                Đang lọc: <span className="font-semibold text-primary">{FILTER_LABELS[capacityFilter]}</span>
              </span>
              <Button
                label="Bỏ chọn"
                icon={<RotateCcw size={12} />}
                variant="ghost"
                size="sm"
                onClick={() => onCapacityFilterChange("all")}
              />
            </HStack>
          )}
        </div>
      </VStack>
    </Card>
  );
}
