"use client";

import { useEffect, useState } from "react";
import { FolderGit2, Plus, Users, Layers, ListChecks, CheckCircle2, Clock, Calendar } from "lucide-react";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Grid } from "@astryxdesign/core/Grid";
import { Card } from "@astryxdesign/core/Card";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Avatar } from "@astryxdesign/core/Avatar";
import { getProjects, createProject } from "@/services/projects.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { subscribeMembers } from "@/services/members.service";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";

export default function ProjectsPage(): React.JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project Modal Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const p = await getProjects();
        setProjects(p);
      } finally {
        setLoading(false);
      }
    }
    load();

    const unsubTasks = subscribeAllTasks(setTasks);
    const unsubMembers = subscribeMembers(setMembers);

    return () => {
      unsubTasks();
      unsubMembers();
    };
  }, []);

  async function handleCreateProject(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setSaving(true);
    try {
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        color: newProjectColor,
      });
      const updated = await getProjects();
      setProjects(updated);
      setNewProjectName("");
      setNewProjectDesc("");
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setSaving(false);
    }
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));

  return (
    <VStack gap={6}>
      {/* Header */}
      <HStack gap={4} vAlign="center">
        <StackItem size="fill">
          <VStack gap={1}>
            <Heading level={1}>Projects & Effort Allocation</Heading>
            <Text type="supporting">
              Track project scopes, assigned DevOps personnel, and total effort distribution across ongoing initiatives.
            </Text>
          </VStack>
        </StackItem>
        <Button
          label={isCreating ? "Cancel" : "New Project"}
          icon={isCreating ? undefined : <Plus size={16} strokeWidth={2} />}
          variant={isCreating ? "secondary" : "primary"}
          onClick={() => setIsCreating(!isCreating)}
        />
      </HStack>

      {/* New Project Form Drawer */}
      {isCreating && (
        <Card elevation="low">
          <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
            <Text weight="semibold" size="base">
              Create New Project
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atlas Migration"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief project goal or scope"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newProjectColor}
                    onChange={(e) => setNewProjectColor(e.target.value)}
                    className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-300 uppercase">{newProjectColor}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button label="Cancel" variant="ghost" onClick={() => setIsCreating(false)} />
              <Button label={saving ? "Creating..." : "Save Project"} variant="primary" type="submit" isDisabled={saving} />
            </div>
          </form>
        </Card>
      )}

      {/* Projects Grid */}
      {loading ? (
        <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={200} index={i} />
          ))}
        </Grid>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Icon icon={FolderGit2} size="lg" />}
          title="No projects yet"
          description="Create your first project to start organizing DevOps effort."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const inProgressTasks = projectTasks.filter((t) => t.status === "in_progress");
            const plannedTasks = projectTasks.filter((t) => t.status === "planned");
            const doneTasks = projectTasks.filter((t) => t.status === "done");

            const totalEffort = inProgressTasks.reduce((sum, t) => sum + t.effortPercent, 0);

            // Group effort by member
            const memberEffortMap = new Map<string, number>();
            inProgressTasks.forEach((t) => {
              memberEffortMap.set(t.memberId, (memberEffortMap.get(t.memberId) ?? 0) + t.effortPercent);
            });

            const assignedMembers = Array.from(memberEffortMap.entries()).map(([memberId, effort]) => ({
              member: memberMap.get(memberId),
              effort,
            }));

            return (
              <Card key={project.id} elevation="low">
                <VStack gap={4}>
                  {/* Project Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <HStack gap={3} vAlign="center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${project.color}25`, border: `1px solid ${project.color}50` }}
                      >
                        <FolderGit2 size={20} style={{ color: project.color }} />
                      </div>
                      <div>
                        <Text weight="bold" size="base">
                          {project.name}
                        </Text>
                        <Text type="supporting" maxLines={1}>
                          {project.description || "No description provided"}
                        </Text>
                      </div>
                    </HStack>

                    <div
                      className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                      style={{
                        backgroundColor: `${project.color}20`,
                        color: project.color,
                        border: `1px solid ${project.color}40`,
                      }}
                    >
                      <Layers size={13} />
                      <span>{totalEffort}% Effort</span>
                    </div>
                  </div>

                  {/* Assigned DevOps Engineers */}
                  <div className="bg-neutral-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                    <HStack gap={1.5} vAlign="center">
                      <Users size={14} className="text-neutral-400" />
                      <Text weight="medium">
                        Assigned DevOps ({assignedMembers.length})
                      </Text>
                    </HStack>

                    {assignedMembers.length === 0 ? (
                      <Text type="supporting">
                        No DevOps engineers assigned yet.
                      </Text>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {assignedMembers.map(({ member, effort }) => {
                          if (!member) return null;
                          return (
                            <div key={member.id} className="flex items-center justify-between text-xs py-0.5">
                              <HStack gap={2} vAlign="center">
                                <Avatar name={member.name} src={member.photoURL ?? undefined} size="xsm" tooltip={false} />
                                <span className="text-neutral-200">{member.name}</span>
                              </HStack>
                              <span className="font-semibold text-sky-400">{effort}% effort</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tasks Summary */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>Tasks:</span>
                      <HStack gap={2}>
                        <span className="text-sky-400 font-semibold">{inProgressTasks.length} active</span>
                        <span>•</span>
                        <span className="text-purple-400 font-semibold">{plannedTasks.length} queued</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{doneTasks.length} done</span>
                      </HStack>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
                      {projectTasks.slice(0, 4).map((task) => {
                        const assignee = memberMap.get(task.memberId);
                        const isDone = task.status === "done";
                        const isPlanned = task.status === "planned";

                        return (
                          <div
                            key={task.id}
                            className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isDone ? (
                                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                              ) : isPlanned ? (
                                <Clock size={13} className="text-purple-400 flex-shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                              )}
                              <span className="truncate text-neutral-200">{task.title}</span>
                            </div>
                            <span className="text-neutral-400 text-[11px] ml-2 flex-shrink-0">
                              {assignee?.name.split(" ")[0] ?? "Unassigned"} ({task.effortPercent}%)
                            </span>
                          </div>
                        );
                      })}
                      {projectTasks.length > 4 && (
                        <Text type="supporting" className="text-center pt-1">
                          +{projectTasks.length - 4} more tasks
                        </Text>
                      )}
                    </div>
                  </div>
                </VStack>
              </Card>
            );
          })}
        </div>
      )}
    </VStack>
  );
}
