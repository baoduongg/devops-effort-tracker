"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { getMember, updateMember } from "@/services/members.service";
import type { Member, MemberInput } from "@/types/member";

export default function MemberDetailPage(): React.JSX.Element {
  const params = useParams<{ memberId: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMember(params.memberId).then((m) => {
      setMember(m);
      setLoading(false);
    });
  }, [params.memberId]);

  async function handleSubmit(input: MemberInput): Promise<void> {
    await updateMember(params.memberId, input);
    router.push("/members");
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!member) return <p className="text-muted-foreground">Member not found.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit {member.name}</h1>
      <MemberForm initialValues={member} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
