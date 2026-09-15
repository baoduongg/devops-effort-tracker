import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Avatar } from "@astryxdesign/core/Avatar";
import { formatEffortDuration } from "@/lib/effort";
import type { Member } from "@/types/member";

interface TeamAvailabilityTabProps {
  availableTeammates: Member[];
}

export function TeamAvailabilityTab({ availableTeammates }: TeamAvailabilityTabProps): React.JSX.Element {
  return (
    <VStack gap={4}>
      <Card elevation="low">
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <Users size={16} className="text-sky-400" />
            <Text weight="semibold" size="base">
              Đồng đội đang rảnh việc ({availableTeammates.length})
            </Text>
          </HStack>
          <Text type="supporting" size="sm">
            Danh sách các kỹ sư DevOps trong team đang có dung lượng trống (&lt;60% tải) sẵn sàng hỗ trợ hoặc nhận phối hợp.
          </Text>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {availableTeammates.map((mate) => (
              <div
                key={mate.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
              >
                <HStack gap={2} vAlign="center">
                  <Avatar name={mate.name} src={mate.photoURL ?? undefined} size="sm" tooltip={false} />

                  <div className="min-w-0">
                    <Link href={`/members/${mate.id}`} className="hover:underline font-semibold text-sm text-neutral-200">
                      {mate.name}
                    </Link>
                    <div className="text-xs text-neutral-500 truncate">
                      {mate.skills.slice(0, 2).join(", ") || "DevOps"}
                    </div>
                  </div>
                </HStack>

                <span className="px-2 py-0.5 rounded-md text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {formatEffortDuration(mate.effortMinutes)} tải
                </span>
              </div>
            ))}
          </div>
        </VStack>
      </Card>
    </VStack>
  );
}
