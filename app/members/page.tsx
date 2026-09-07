"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { subscribeMembers, deleteMember } from "@/services/members.service";
import { useMembersStore } from "@/store/members.store";
import { MemberList } from "@/components/members/member-list";

export default function MembersPage(): React.JSX.Element {
  const members = useMembersStore((state) => state.members);
  const setMembers = useMembersStore((state) => state.setMembers);
  const removeMember = useMembersStore((state) => state.removeMember);

  useEffect(() => {
    const unsubscribe = subscribeMembers(setMembers);
    return () => unsubscribe();
  }, [setMembers]);

  async function handleDelete(id: string): Promise<void> {
    await deleteMember(id);
    removeMember(id);
  }

  return (
    <VStack gap={8}>
      <HStack gap={4} vAlign="center">
        <StackItem size="fill">
          <VStack gap={1}>
            <Heading level={1}>Members</Heading>
            <Text type="supporting">Manage profiles, skills, and status for the team.</Text>
          </VStack>
        </StackItem>
        <Button label="New Member" icon={<Plus size={16} strokeWidth={2} />} href="/members/new" variant="primary" />
      </HStack>
      <MemberList members={members} onDelete={handleDelete} />
    </VStack>
  );
}
