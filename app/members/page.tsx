"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { VStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { subscribeMembers, deleteMember } from "@/services/members.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { useMembersStore } from "@/store/members.store";
import { useAuthStore } from "@/store/auth.store";
import { MemberList } from "@/components/members/member-list";
import type { Task } from "@/types/task";

export default function MembersPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const members = useMembersStore((state) => state.members);
  const setMembers = useMembersStore((state) => state.setMembers);
  const removeMember = useMembersStore((state) => state.removeMember);
  const [tasks, setTasks] = useState<Task[]>([]);

  const isLeader = user?.role === "leader";

  useEffect(() => {
    const unsubscribeMembers = subscribeMembers(setMembers);
    const unsubscribeTasks = subscribeAllTasks(setTasks);
    return () => {
      unsubscribeMembers();
      unsubscribeTasks();
    };
  }, [setMembers]);

  async function handleDelete(id: string): Promise<void> {
    if (!isLeader) return;
    await deleteMember(id);
    removeMember(id);
  }

  return (
    <VStack gap={5}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users size={16} />
            </span>
            <Heading level={1}>
              {isLeader ? "Quản lý Đội ngũ DevOps" : "Đội ngũ DevOps"}
            </Heading>
          </div>
          <Text type="supporting">
            {isLeader
              ? "Quản lý hồ sơ kỹ sư DevOps, phân bổ năng lực chuyên môn, thêm/xóa thành viên và theo dõi lịch trình."
              : "Danh sách các kỹ sư DevOps trong team, kỹ năng chuyên môn, tải công việc và lịch trình phối hợp."}
          </Text>
        </div>

        {isLeader && (
          <Button
            label="Thêm Thành viên"
            icon={<Plus size={16} strokeWidth={2} />}
            href="/members/new"
            variant="primary"
          />
        )}
      </div>

      <MemberList members={members} tasks={tasks} onDelete={handleDelete} canDelete={isLeader} />
    </VStack>
  );
}

