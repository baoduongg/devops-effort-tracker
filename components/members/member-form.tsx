"use client";

import { useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { Button } from "@astryxdesign/core/Button";
import type { MemberInput, MemberStatus } from "@/types/member";
import {
  effortUnitToMinutes,
  minutesToEffortUnit,
  pickDisplayEffortUnit,
  EFFORT_UNIT_OPTIONS,
  type EffortUnit,
} from "@/lib/effort";

interface MemberFormProps {
  initialValues?: Partial<MemberInput>;
  onSubmit: (input: MemberInput) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
  isCard?: boolean;
}

const statusOptions = [
  { value: "available", label: "Available (Sẵn sàng)" },
  { value: "busy", label: "Busy (Bận)" },
  { value: "overloaded", label: "Overloaded (Quá tải)" },
];

const roleOptions = [
  { value: "devops", label: "🛠 Kỹ sư DevOps" },
  { value: "leader", label: "👑 Trưởng nhóm (Leader)" },
];

export function MemberForm({
  initialValues,
  onSubmit,
  submitLabel,
  onCancel,
  isCard = true,
}: MemberFormProps): React.JSX.Element {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [skills, setSkills] = useState((initialValues?.skills ?? []).join(", "));
  const [role, setRole] = useState<"leader" | "devops">(initialValues?.role ?? "devops");
  const [status, setStatus] = useState<MemberStatus>(initialValues?.status ?? "available");
  const [effortUnit, setEffortUnit] = useState<EffortUnit>(
    pickDisplayEffortUnit(initialValues?.effortMinutes ?? 0)
  );
  const [effortValue, setEffortValue] = useState<number>(
    minutesToEffortUnit(initialValues?.effortMinutes ?? 0, effortUnit)
  );
  const effortMinutes = effortUnitToMinutes(effortValue, effortUnit);

  function handleEffortUnitChange(unit: EffortUnit): void {
    setEffortValue(1);
    setEffortUnit(unit);
  }
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        photoURL: initialValues?.photoURL ?? null,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        status,
        currentTaskId: initialValues?.currentTaskId ?? null,
        effortMinutes,
        role,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit}>
      <VStack gap={4} maxWidth={480}>
        <TextInput label="Tên DevOps" value={name} onChange={setName} isRequired />
        <TextInput label="Email" type="email" value={email} onChange={setEmail} isRequired />
        <Selector
          label="Vai trò (Role)"
          options={roleOptions}
          value={role}
          onChange={(v) => setRole(v as "leader" | "devops")}
        />
        <TextInput
          label="Kỹ năng"
          value={skills}
          onChange={setSkills}
          placeholder="Kubernetes, Terraform, CI/CD, AWS..."
          description="Phân cách bằng dấu phẩy"
        />
        <Grid columns={3} gap={4}>
          <Selector
            label="Trạng thái"
            options={statusOptions}
            value={status}
            onChange={(v) => setStatus(v as MemberStatus)}
          />
          <NumberInput
            label="Mức tải"
            min={0}
            step={effortUnit === "minutes" ? 5 : 1}
            value={effortValue}
            onChange={(v) => setEffortValue(v ?? 0)}
          />
          <Selector
            label="Đơn vị"
            options={EFFORT_UNIT_OPTIONS}
            value={effortUnit}
            onChange={(v) => handleEffortUnitChange(v as EffortUnit)}
          />
        </Grid>
        <HStack gap={3} justify="end" className="pt-2">
          {onCancel && (
            <Button
              type="button"
              label="Hủy"
              variant="ghost"
              onClick={onCancel}
              isDisabled={submitting}
            />
          )}
          <Button
            type="submit"
            label={submitting ? "Đang lưu…" : submitLabel}
            isLoading={submitting}
            variant="primary"
          />
        </HStack>
      </VStack>
    </form>
  );

  if (!isCard) {
    return formContent;
  }

  return <Card>{formContent}</Card>;
}
