import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MemberStatus } from "@/types/member";

const statusStyles: Record<MemberStatus, string> = {
  available: "bg-green-100 text-green-800 hover:bg-green-100",
  busy: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  overloaded: "bg-red-100 text-red-800 hover:bg-red-100",
};

const statusLabels: Record<MemberStatus, string> = {
  available: "Available",
  busy: "Busy",
  overloaded: "Overloaded",
};

export function StatusBadge({ status }: { status: MemberStatus }): React.JSX.Element {
  return <Badge className={cn(statusStyles[status])}>{statusLabels[status]}</Badge>;
}
