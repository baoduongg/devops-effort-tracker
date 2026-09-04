"use client";

import { useRouter } from "next/navigation";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Member</h1>
      <MemberForm onSubmit={handleSubmit} submitLabel="Create Member" />
    </div>
  );
}
