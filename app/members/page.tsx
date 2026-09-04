"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Members</h1>
        <Link href="/members/new">
          <Button>New Member</Button>
        </Link>
      </div>
      <MemberList members={members} onDelete={handleDelete} />
    </div>
  );
}
