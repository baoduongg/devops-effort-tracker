"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Member } from "@/types/member";

interface MemberListProps {
  members: Member[];
  onDelete: (id: string) => void;
}

export function MemberList({ members, onDelete }: MemberListProps): React.JSX.Element {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Link href={`/members/${member.id}`} className="font-medium hover:underline">
              {member.name}
            </Link>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={member.status} />
            <Button variant="destructive" size="sm" onClick={() => onDelete(member.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
