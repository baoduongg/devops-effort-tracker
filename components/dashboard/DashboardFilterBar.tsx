import React from "react";
import { Layers, Calendar, FolderGit2, Search, RotateCcw } from "lucide-react";
import { HStack, StackItem } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Button } from "@astryxdesign/core/Button";

export type DashboardTab = "roster" | "timeline" | "projects";

interface DashboardFilterBarProps {
  activeTab: DashboardTab;
  onActiveTabChange: (tab: DashboardTab) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  projectOptions: { value: string; label: string }[];
  selectedProjectId: string;
  onSelectedProjectIdChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function DashboardFilterBar({
  activeTab,
  onActiveTabChange,
  searchQuery,
  onSearchQueryChange,
  projectOptions,
  selectedProjectId,
  onSelectedProjectIdChange,
  hasActiveFilters,
  onClearFilters,
}: DashboardFilterBarProps): React.JSX.Element {
  return (
    <HStack gap={3} vAlign="center" wrap="wrap" className="pt-2 border-t border-border">
      <SegmentedControl label="Chế độ xem" value={activeTab} onChange={(v) => onActiveTabChange(v as DashboardTab)}>
        <SegmentedControlItem value="roster" label="Bảng nhân sự" icon={<Layers size={14} strokeWidth={2} />} />
        <SegmentedControlItem value="timeline" label="Lịch trình Gantt" icon={<Calendar size={14} strokeWidth={2} />} />
        <SegmentedControlItem value="projects" label="Theo Dự án" icon={<FolderGit2 size={14} strokeWidth={2} />} />
      </SegmentedControl>

      <StackItem size="fill">
        <TextInput
          label="Tìm kiếm DevOps"
          isLabelHidden
          placeholder="Tìm theo tên DevOps, kỹ năng hoặc task đang làm..."
          value={searchQuery}
          onChange={onSearchQueryChange}
          startIcon={Search}
          hasClear
        />
      </StackItem>

      <div className="w-full sm:w-64">
        <Selector
          label="Dự án"
          isLabelHidden
          options={projectOptions}
          value={selectedProjectId}
          onChange={(v) => onSelectedProjectIdChange(String(v))}
        />
      </div>

      {hasActiveFilters && (
        <Button label="Bỏ lọc" icon={<RotateCcw size={13} />} variant="ghost" onClick={onClearFilters} />
      )}
    </HStack>
  );
}
