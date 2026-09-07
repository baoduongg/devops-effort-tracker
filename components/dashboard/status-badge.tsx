import { Token } from "@astryxdesign/core/Token";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import type { MemberStatus } from "@/types/member";

const statusVariant: Record<MemberStatus, "success" | "warning" | "error"> = {
  available: "success",
  busy: "warning",
  overloaded: "error",
};

const statusLabels: Record<MemberStatus, string> = {
  available: "Available",
  busy: "Busy",
  overloaded: "Overloaded",
};

export function StatusBadge({ status }: { status: MemberStatus }): React.JSX.Element {
  return (
    <Token
      label={statusLabels[status]}
      icon={<StatusDot variant={statusVariant[status]} label={statusLabels[status]} />}
    />
  );
}
