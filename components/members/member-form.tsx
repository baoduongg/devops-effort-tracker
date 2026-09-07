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
  const [effortPercent, setEffortPercent] = useState(initialValues?.effortPercent ?? 0);
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
        effortPercent,
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
        <Grid columns={2} gap={4}>
          <Selector
            label="Trạng thái"
            options={statusOptions}
            value={status}
            onChange={(v) => setStatus(v as MemberStatus)}
          />
          <NumberInput label="Mức tải %" min={0} max={200} value={effortPercent} onChange={setEffortPercent} />
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
