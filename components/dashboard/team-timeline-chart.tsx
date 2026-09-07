import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import type { Member } from "@/types/member";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";

interface TeamTimelineChartProps {
  members: Member[];
  tasks: Task[];
  projects: Project[];
}

export function TeamTimelineChart({ members, tasks, projects }: TeamTimelineChartProps): React.JSX.Element {
  const [weekOffset, setWeekOffset] = useState(0);

  // Build a 14-day window starting from today + offset
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() + weekOffset * 7 - 3); // Start 3 days before today

  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const windowStartMs = days[0].getTime();
  const windowEndMs = days[days.length - 1].getTime() + 24 * 60 * 60 * 1000;
  const totalWindowDuration = windowEndMs - windowStartMs;

  return (
    <Card elevation="low">
      <VStack gap={4}>
        {/* Timeline Header & Controls */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <HStack gap={2} vAlign="center">
            <CalendarIcon size={18} className="text-sky-400" />
            <Text weight="semibold" size="base">
              Team Schedule & Plan ({days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} -{" "}
              {days[days.length - 1].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })})
            </Text>
          </HStack>

          <HStack gap={2} vAlign="center">
            <Button
              label="Previous"
              icon={<ChevronLeft size={16} />}
              variant="ghost"
              onClick={() => setWeekOffset((prev) => prev - 1)}
            />
            <Button
              label="Today"
              variant={weekOffset === 0 ? "secondary" : "ghost"}
              onClick={() => setWeekOffset(0)}
            />
            <Button
              label="Next"
              icon={<ChevronRight size={16} />}
              variant="ghost"
              onClick={() => setWeekOffset((prev) => prev + 1)}
            />
          </HStack>
        </div>

        {/* Timeline Grid Container */}
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Days Header */}
            <div className="grid grid-cols-[200px_1fr] border-b border-white/10 pb-2">
              <div className="text-xs font-semibold text-neutral-400 px-3">DevOps Member</div>
              <div className="grid grid-cols-14 gap-1 text-center">
                {days.map((day, idx) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={idx}
                      className={`text-xs py-1 rounded flex flex-col items-center justify-center ${
                        isToday
                          ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                          : isWeekend
                          ? "text-neutral-500 bg-white/[0.01]"
                          : "text-neutral-300"
                      }`}
                    >
                      <span className="text-[10px] uppercase opacity-70">
                        {day.toLocaleDateString(undefined, { weekday: "narrow" })}
                      </span>
                      <span>{day.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Member Timeline Rows */}
            <div className="divide-y divide-white/5">
              {members.map((member) => {
                const memberTasks = tasks.filter(
                  (t) =>
                    t.memberId === member.id &&
                    (t.status === "in_progress" || t.status === "planned" || t.status === "done")
                );

                return (
                  <div key={member.id} className="grid grid-cols-[200px_1fr] py-3.5 items-center">
                    {/* Member Info */}
                    <div className="px-3 flex items-center gap-2.5">
                      <Avatar name={member.name} src={member.photoURL ?? undefined} size="sm" tooltip={false} />
                      <div className="truncate">
                        <Link href={`/members/${member.id}`} className="hover:underline">
                          <Text weight="medium" size="sm" maxLines={1}>
                            {member.name}
                          </Text>
                        </Link>
                        <Text type="supporting">
                          {memberTasks.length} task{memberTasks.length === 1 ? "" : "s"}
                        </Text>
                      </div>
                    </div>

                    {/* Timeline Bar Area */}
                    <div className="relative h-14 bg-white/[0.01] rounded-lg border border-white/[0.03] overflow-hidden flex flex-col justify-center gap-1.5 p-1">
                      {/* Grid background day lines */}
                      <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                        {days.map((d, i) => {
                          const isToday = d.toDateString() === new Date().toDateString();
                          return (
                            <div
                              key={i}
                              className={`border-r border-white/[0.03] h-full ${
                                isToday ? "bg-sky-500/[0.06]" : ""
                              }`}
                            />
                          );
                        })}
                      </div>

                      {memberTasks.length === 0 ? (
                        <div className="text-center relative z-10">
                          <span className="text-xs text-neutral-500 italic">No tasks scheduled in this window</span>
                        </div>
                      ) : (
                        memberTasks.map((task) => {
                          const project = projectMap.get(task.projectId);
                          const isDone = task.status === "done";
                          const taskStart = new Date(task.startDate).getTime();
                          // Done tasks show as a single-day mark on the day the work happened.
                          const taskEnd = isDone
                            ? taskStart + 24 * 60 * 60 * 1000
                            : task.endDate
                            ? new Date(task.endDate).getTime()
                            : taskStart + 7 * 24 * 60 * 60 * 1000;

                          // Calculate positioning percentage in the 14-day window
                          const leftPct = Math.max(
                            0,
                            Math.min(100, ((taskStart - windowStartMs) / totalWindowDuration) * 100)
                          );
                          const rightPct = Math.max(
                            0,
                            Math.min(100, ((taskEnd - windowStartMs) / totalWindowDuration) * 100)
                          );
                          const widthPct = Math.max(4, rightPct - leftPct);

                          // Hide if completely outside current window
                          if (taskEnd < windowStartMs || taskStart > windowEndMs) return null;

                          const color = project?.color ?? "#3b82f6";
                          const isPlanned = task.status === "planned";

                          return (
                            <div
                              key={task.id}
                              className={`absolute h-5.5 rounded-md px-2 text-xs flex items-center justify-between text-white truncate shadow-sm transition-all z-10 cursor-pointer ${
                                isPlanned ? "border border-dashed border-white/40 opacity-80" : ""
                              } ${isDone ? "opacity-50 grayscale" : ""}`}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                backgroundColor: color,
                              }}
                              title={`${isDone ? "✓ Done — " : ""}${task.title} (${project?.name ?? "Project"}) | Effort: ${task.effortPercent}% | ${new Date(
                                task.startDate
                              ).toLocaleDateString()} - ${task.endDate ? new Date(task.endDate).toLocaleDateString() : "Ongoing"}`}
                            >
                              <span className="truncate font-medium text-[11px] drop-shadow-sm">
                                {isDone ? "✓ " : ""}
                                {task.title}
                              </span>
                              <span className="text-[10px] ml-1 px-1 rounded bg-black/30 font-semibold flex-shrink-0">
                                {task.effortPercent}%
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-xs text-neutral-400">
          <span className="font-semibold text-neutral-300">Projects:</span>
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span>{p.name}</span>
            </div>
          ))}
          <span className="text-neutral-500">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2.5 rounded bg-sky-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2.5 rounded bg-purple-500 border border-dashed border-white/60" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2.5 rounded bg-neutral-500 opacity-50" />
            <span>Done</span>
          </div>
        </div>
      </VStack>
    </Card>
  );
}
