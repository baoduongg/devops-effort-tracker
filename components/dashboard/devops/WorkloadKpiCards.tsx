import React from "react";
import { AlertTriangle, Calendar, CheckCircle2, Clock, Layers } from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { formatEffortDuration, minutesToWorkdayPercent } from "@/lib/effort";
import type { Task } from "@/types/task";

interface WorkloadKpiCardsProps {
  totalEffortMinutes: number;
  workloadStatus: { label: string; variant: "success" | "warning" | "error" };
  inProgressTasks: Task[];
  plannedTasks: Task[];
  doneTasks: Task[];
  overdueTasks: Task[];
}

export function WorkloadKpiCards({
  totalEffortMinutes,
  workloadStatus,
  inProgressTasks,
  plannedTasks,
  doneTasks,
  overdueTasks,
}: WorkloadKpiCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card elevation="low">
        <VStack gap={3} className="h-full justify-between p-1">
          <HStack gap={2} vAlign="center" className="justify-between">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <Layers size={14} className="text-sky-400" />
              Mức tải hiện tại
            </span>
            <span className="text-xs text-neutral-500 font-medium">/ 8h dung lượng</span>
          </HStack>

          <ProgressBar
            label={workloadStatus.label}
            value={Math.min(minutesToWorkdayPercent(totalEffortMinutes), 100)}
            hasValueLabel
            formatValueLabel={() => formatEffortDuration(totalEffortMinutes)}
            variant={workloadStatus.variant}
          />
        </VStack>
      </Card>

      <Card elevation="low">
        <div className="flex flex-col justify-between h-full gap-2 p-1">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            <Clock size={14} className="text-sky-400" />
            Đang thực hiện
          </span>
          <div className="flex items-baseline gap-2">
            <Text type="display-3" weight="semibold" hasTabularNumbers className="text-neutral-100">
              {inProgressTasks.length}
            </Text>
            <span className="text-xs text-neutral-500">nhiệm vụ active</span>
          </div>
          <span className="text-sm text-neutral-400">
            {inProgressTasks.length === 0 ? "Chưa có task nào đang chạy" : `Tổng cộng ${formatEffortDuration(totalEffortMinutes)} effort`}
          </span>
        </div>
      </Card>

      <Card elevation="low">
        <div className="flex flex-col justify-between h-full gap-2 p-1">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            <Calendar size={14} className="text-purple-400" />
            Kế hoạch tiếp theo
          </span>
          <div className="flex items-baseline gap-2">
            <Text type="display-3" weight="semibold" hasTabularNumbers className="text-purple-300">
              {plannedTasks.length}
            </Text>
            <span className="text-xs text-neutral-500">nhiệm vụ chờ sprint</span>
          </div>
          <span className="text-sm text-neutral-400">{plannedTasks.length} task đã lên lịch thực hiện</span>
        </div>
      </Card>

      <Card elevation="low">
        <div className="flex flex-col justify-between h-full gap-2 p-1">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            {overdueTasks.length > 0 ? (
              <AlertTriangle size={14} className="text-rose-400" />
            ) : (
              <CheckCircle2 size={14} className="text-emerald-400" />
            )}
            {overdueTasks.length > 0 ? "Cảnh báo trễ hạn" : "Đã hoàn thành"}
          </span>
          <div className="flex items-baseline gap-2">
            <Text
              type="display-3"
              weight="semibold"
              hasTabularNumbers
              className={overdueTasks.length > 0 ? "text-rose-400" : "text-emerald-300"}
            >
              {overdueTasks.length > 0 ? overdueTasks.length : doneTasks.length}
            </Text>
            <span className="text-xs text-neutral-500">
              {overdueTasks.length > 0 ? "cần xử lý gấp" : "nhiệm vụ đã xong"}
            </span>
          </div>
          <span className="text-sm text-neutral-400">
            {overdueTasks.length > 0 ? "Có task quá hạn dự kiến!" : `${doneTasks.length} task đã bàn giao`}
          </span>
        </div>
      </Card>
    </div>
  );
}
