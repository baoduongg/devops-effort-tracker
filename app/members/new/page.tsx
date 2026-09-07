"use client";

import { useRouter } from "next/navigation";
import { VStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { MemberForm } from "@/components/members/member-form";
import { createMember } from "@/services/members.service";
import type { MemberInput } from "@/types/member";

export default function NewMemberPage(): React.JSX.Element {
  const router = useRouter();

  async function handleSubmit(input: MemberInput): Promise<void> {
    await createMember(input);
    router.push("/members");
  }

  return (
    <VStack gap={8}>
      <VStack gap={1}>
        <Heading level={1}>New Member</Heading>
        <Text type="supporting">Add a new profile to the team.</Text>
      </VStack>
      <MemberForm onSubmit={handleSubmit} submitLabel="Create Member" />
    </VStack>
  );
}
