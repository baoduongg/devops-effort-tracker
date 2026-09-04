"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MemberInput, MemberStatus } from "@/types/member";

interface MemberFormProps {
  initialValues?: Partial<MemberInput>;
  onSubmit: (input: MemberInput) => Promise<void>;
  submitLabel: string;
}

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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="overloaded">Overloaded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="effort">Effort %</Label>
        <Input
          id="effort"
          type="number"
          min={0}
          max={200}
          value={effortPercent}
          onChange={(e) => setEffortPercent(Number(e.target.value))}
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
