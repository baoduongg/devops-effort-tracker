"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Skeleton } from "@astryxdesign/core/Skeleton";
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

  if (loading) {
    return (
      <Grid columns={2} gap={8}>
        <VStack gap={5}>
          <Skeleton height={36} width="50%" />
          <Skeleton height={36} />
          <Skeleton height={36} />
        </VStack>
        <VStack gap={3}>
          <Skeleton height={24} width="33%" />
          <Skeleton height={64} />
          <Skeleton height={64} />
        </VStack>
      </Grid>
    );
  }
  if (loadError) return <Text color="accent">Failed to load: {loadError}</Text>;
  if (!member) return <Text type="supporting">Member not found.</Text>;

  return (
    <VStack gap={6}>
      <HStack>
        <Button label="Back to members" icon={<ArrowLeft size={16} strokeWidth={2} />} variant="ghost" href="/members" />
      </HStack>
      <Grid columns={{ minWidth: 360, max: 2 }} gap={8}>
        <VStack gap={6}>
          <Heading level={1}>Edit {member.name}</Heading>
          <MemberForm initialValues={member} onSubmit={handleSubmit} submitLabel="Save Changes" />
        </VStack>
        <VStack gap={6}>
          <Heading level={2}>Timeline</Heading>
          <TimelineView tasks={tasks} projects={projects} />
        </VStack>
      </Grid>
    </VStack>
  );
}
