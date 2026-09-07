"use client";

import { useEffect, useState, useMemo } from "react";
import { FolderGit2, Plus, Users, Layers, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Avatar } from "@astryxdesign/core/Avatar";
import { getProjects, createProject } from "@/services/projects.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { subscribeMembers } from "@/services/members.service";
import { useAuthStore } from "@/store/auth.store";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { Member } from "@/types/member";


const COLOR_PRESETS = [
  "#38bdf8", // Sky
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#a855f7", // Purple
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

export default function ProjectsPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const isLeader = user?.role === "leader";

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project Modal Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#38bdf8");
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

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  // Summary Metrics
  const totalEffortAcrossProjects = useMemo(() => {
    return tasks
      .filter((t) => t.status === "in_progress")
      .reduce((sum, t) => sum + t.effortPercent, 0);
  }, [tasks]);

  const activeTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === "in_progress").length;
  }, [tasks]);

  return (
    <VStack gap={5}>
      {/* Header & New Project CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FolderGit2 size={16} />
            </span>
            <Heading level={1}>
              {isLeader ? "Projects & Effort Distribution" : "Dự án & Nhiệm vụ"}
            </Heading>
          </div>
          <Text type="supporting">
            {isLeader
              ? "Quản lý các dự án, theo dõi nhân sự DevOps được phân bổ và tổng tỉ trọng Effort trên toàn hệ thống."
              : "Theo dõi các dự án toàn team và các dự án mà bạn đang tham gia đóng góp."}
          </Text>
        </div>

        {isLeader && (
          <Button
            label={isCreating ? "Hủy tạo" : "Tạo Dự án Mới"}
            icon={isCreating ? undefined : <Plus size={16} strokeWidth={2} />}
            variant={isCreating ? "secondary" : "primary"}
            onClick={() => setIsCreating(!isCreating)}
          />
        )}
      </div>


      {/* Summary KPI Bar */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FolderGit2 size={16} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 font-medium">Tổng số Dự án</span>
                <span className="text-lg font-bold text-neutral-100">{projects.length} dự án</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Layers size={16} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 font-medium">Tổng tải phân bổ</span>
                <span className="text-lg font-bold text-emerald-300">{totalEffortAcrossProjects}% Effort</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Clock size={16} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 font-medium">Task đang thực hiện</span>
                <span className="text-lg font-bold text-purple-300">{activeTasksCount} tasks</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Project Form Drawer */}
      {isCreating && (
        <Card elevation="low">
          <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Sparkles size={16} className="text-sky-400" />
              <Text weight="semibold" size="base">
                Tạo Dự án Mới
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Tên Dự án *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cloud Migration, K8s Upgrade..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Mô tả dự án</label>
                <input
                  type="text"
                  placeholder="Mô tả ngắn về mục tiêu hoặc phạm vi..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Màu đại diện</label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProjectColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newProjectColor === color ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900" : "opacity-75 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <Button label="Hủy" variant="ghost" onClick={() => setIsCreating(false)} />
              <Button label={saving ? "Đang lưu..." : "Lưu Dự án"} variant="primary" type="submit" isDisabled={saving} />
            </div>
          </form>
        </Card>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={220} index={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Icon icon={FolderGit2} size="lg" />}
          title="Chưa có dự án nào"
          description="Tạo dự án đầu tiên để bắt đầu phân bổ công việc cho DevOps team."
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

            const isUserAssigned = Boolean(user?.memberId && memberEffortMap.has(user.memberId));
            const userEffortInProject = user?.memberId ? memberEffortMap.get(user.memberId) : undefined;
            const projColor = project.color || "#38bdf8";

            return (
              <Card key={project.id} elevation="low">
                <VStack gap={4}>
                  {/* Project Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <HStack gap={3} vAlign="center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${projColor}20`, border: `1px solid ${projColor}40` }}
                      >
                        <FolderGit2 size={18} style={{ color: projColor }} />
                      </div>
                      <div className="min-w-0">
                        <HStack gap={2} vAlign="center">
                          <Text weight="bold" size="base">
                            {project.name}
                          </Text>
                          {isUserAssigned && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Của bạn ({userEffortInProject}%)
                            </span>
                          )}
                        </HStack>
                        <Text type="supporting" maxLines={1}>
                          {project.description || "Chưa có mô tả dự án"}
                        </Text>
                      </div>
                    </HStack>

                    <div
                      className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0"
                      style={{
                        backgroundColor: `${projColor}15`,
                        color: projColor,
                        border: `1px solid ${projColor}35`,
                      }}
                    >
                      <Layers size={12} />
                      <span>{totalEffort}% Effort</span>
                    </div>
                  </div>


                  {/* Assigned DevOps Engineers */}
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] flex flex-col gap-2">
                    <HStack gap={1} vAlign="center">
                      <Users size={13} className="text-neutral-400" />
                      <span className="text-xs font-semibold text-neutral-300">
                        Nhân sự phân bổ ({assignedMembers.length})
                      </span>
                    </HStack>

                    {assignedMembers.length === 0 ? (
                      <span className="text-xs text-neutral-500 italic">
                        Chưa có DevOps nào được phân bổ.
                      </span>
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
                      <span className="font-medium">Tiến độ công việc:</span>
                      <HStack gap={1}>
                        <span className="text-sky-400 font-semibold">{inProgressTasks.length} đang làm</span>
                        <span>•</span>
                        <span className="text-purple-400 font-semibold">{plannedTasks.length} kế hoạch</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{doneTasks.length} xong</span>
                      </HStack>
                    </div>


                    <div className="flex flex-col gap-1.5 pt-1 border-t border-white/[0.05]">
                      {projectTasks.slice(0, 3).map((task) => {
                        const assignee = memberMap.get(task.memberId);
                        const isDone = task.status === "done";
                        const isPlanned = task.status === "planned";

                        return (
                          <div
                            key={task.id}
                            className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate min-w-0">
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
                      {projectTasks.length > 3 && (
                        <span className="text-center text-[11px] text-neutral-400 pt-1">
                          +{projectTasks.length - 3} task khác
                        </span>
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
