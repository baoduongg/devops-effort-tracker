"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MemberForm } from "@/components/members/member-form";
import { TimelineView } from "@/components/timeline/timeline-view";
import { getMember, updateMember } from "@/services/members.service";
import { getTasksByMember } from "@/services/tasks.service";
import { getProjects } from "@/services/projects.service";
import type { Member, MemberInput } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

export default function MemberDetailPage(): React.JSX.Element {
  const params = useParams<{ memberId: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [m, t, p] = await Promise.all([
          getMember(params.memberId),
          getTasksByMember(params.memberId),
          getProjects(),
        ]);
        setMember(m);
        setTasks(t);
        setProjects(p);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Failed to load member data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.memberId]);

  async function handleSubmit(input: MemberInput): Promise<void> {
    await updateMember(params.memberId, input);
    router.push("/members");
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (loadError) return <p className="text-destructive">Failed to load: {loadError}</p>;
  if (!member) return <p className="text-muted-foreground">Member not found.</p>;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit {member.name}</h1>
        <MemberForm initialValues={member} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Timeline</h2>
        <TimelineView tasks={tasks} projects={projects} />
      </div>
    </div>
  );
}
