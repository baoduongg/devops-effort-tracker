"use client";

import { useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Stack";
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
}

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "overloaded", label: "Overloaded" },
];

export function MemberForm({ initialValues, onSubmit, submitLabel }: MemberFormProps): React.JSX.Element {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [skills, setSkills] = useState((initialValues?.skills ?? []).join(", "));
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
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <VStack gap={5} maxWidth={480}>
          <TextInput label="Name" value={name} onChange={setName} isRequired />
          <TextInput label="Email" type="email" value={email} onChange={setEmail} isRequired />
          <TextInput
            label="Skills"
            value={skills}
            onChange={setSkills}
            placeholder="Kubernetes, Terraform, CI/CD"
            description="Comma-separated"
          />
          <Grid columns={2} gap={4}>
            <Selector
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(v) => setStatus(v as MemberStatus)}
            />
            <NumberInput label="Effort %" min={0} max={200} value={effortPercent} onChange={setEffortPercent} />
          </Grid>
          <Button type="submit" label={submitting ? "Saving…" : submitLabel} isLoading={submitting} variant="primary" width="100%" />
        </VStack>
      </form>
    </Card>
  );
}
