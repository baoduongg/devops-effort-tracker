import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Member } from "@/types/member";

interface MemberCardProps {
  member: Member;
  currentTaskTitle: string | null;
  projectName: string | null;
}

export function MemberCard({ member, currentTaskTitle, projectName }: MemberCardProps): React.JSX.Element {
  return (
    <Link href={`/members/${member.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Avatar>
            <AvatarImage src={member.photoURL ?? undefined} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{member.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
          <StatusBadge status={member.status} />
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Task: </span>
            {currentTaskTitle ?? "None"}
          </p>
          <p>
            <span className="text-muted-foreground">Project: </span>
            {projectName ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Effort: </span>
            {member.effortPercent}%
          </p>
          <p className="text-xs text-muted-foreground">
            Updated {new Date(member.updatedAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
