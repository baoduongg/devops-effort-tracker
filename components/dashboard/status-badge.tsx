import { Token } from "@astryxdesign/core/Token";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import type { MemberStatus } from "@/types/member";

const statusSemanticVariant: Record<MemberStatus, "success" | "warning" | "error"> = {
  available: "success",
  busy: "warning",
  overloaded: "error",
};

const statusTokenColor: Record<MemberStatus, "green" | "yellow" | "red"> = {
  available: "green",
  busy: "yellow",
  overloaded: "red",
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
      color={statusTokenColor[status]}
      icon={<StatusDot variant={statusSemanticVariant[status]} label={statusLabels[status]} />}
    />
  );
}
