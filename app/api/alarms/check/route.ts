import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getTasksWithPendingAlarm, markAlarmFired } from "@/services/tasks.service";
import { getMembers } from "@/services/members.service";
import { getProjects } from "@/services/projects.service";
import { buildDeployAlarmMessage } from "@/services/chatops.service";
import { postToChatOps } from "@/lib/chatops-post";

function getProvidedSecret(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const url = new URL(request.url);
  return url.searchParams.get("secret") || request.headers.get("x-cron-secret") || null;
}

function formatDeployAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function runAlarmCheck(): Promise<NextResponse> {
  const [tasks, members, projects] = await Promise.all([
    getTasksWithPendingAlarm(),
    getMembers(),
    getProjects(),
  ]);

  const now = Date.now();
  let fired = 0;

  for (const task of tasks) {
    if (!task.deployAt) continue;
    const deployAtMs = new Date(task.deployAt).getTime();
    const minutesBefore = task.reminderMinutesBefore ?? 30;
    const fireAtMs = deployAtMs - minutesBefore * 60_000;

    // Fire once now has crossed the lead-time threshold but before the deploy time itself,
    // so a cold/late cron tick never spams an alarm for a slot that has already passed.
    if (now < fireAtMs || now >= deployAtMs) continue;

    const member = members.find((m) => m.id === task.memberId);
    const project = projects.find((p) => p.id === task.projectId);
    const minutesRemaining = Math.round((deployAtMs - now) / 60_000);

    const message = buildDeployAlarmMessage({
      title: task.title,
      memberName: member?.name ?? "Unassigned",
      memberEmail: member?.email,
      projectName: project?.name ?? "No project",
      deployAtLabel: formatDeployAt(task.deployAt),
      minutesBefore: minutesRemaining,
      link: `${process.env.HOST}/tasks`,
    });

    const result = await postToChatOps(message);
    if (result.ok) {
      await markAlarmFired(task.id);
      fired += 1;
    }
  }

  return NextResponse.json({ ok: true, checked: tasks.length, fired });
}

export async function GET(request: Request): Promise<NextResponse> {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && getProvidedSecret(request) !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runAlarmCheck();
}

export async function POST(request: Request): Promise<NextResponse> {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && getProvidedSecret(request) !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runAlarmCheck();
}
