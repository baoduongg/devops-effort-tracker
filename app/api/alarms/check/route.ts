import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getTasksWithPendingAlarm } from "@/services/tasks.service";
import { getPendingAlarms } from "@/services/alarms.service";
import { getMembers } from "@/services/members.service";
import { getProjects } from "@/services/projects.service";
import { buildDeployAlarmMessage, buildStandaloneAlarmMessage } from "@/services/chatops.service";
import { postToChatOps } from "@/lib/chatops-post";
import { getAdminDb } from "@/lib/firebase-admin";
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

// These two writes run with no signed-in Firebase Auth session (this is a server cron, not a
// browser request), so they go through the Admin SDK — the only way to satisfy firestore.rules'
// `allow write: if isSignedIn()` on tasks/alarms from here. Everything else in this route only
// reads, which firestore.rules already allows unauthenticated.
async function markTaskAlarmFired(id: string): Promise<void> {
  await getAdminDb().collection("tasks").doc(id).update({ alarmFiredAt: AdminTimestamp.now() });
}

async function markStandaloneAlarmFired(id: string): Promise<void> {
  await getAdminDb().collection("alarms").doc(id).update({ status: "done", firedAt: AdminTimestamp.now() });
}

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

// If the cron was down/misconfigured for a while, don't let it fire a flood of long-overdue
// standalone alarms the moment it resumes — anything staler than this is skipped (left active,
// visible in the alarms list) instead of fired.
const MAX_ALARM_STALENESS_MS = 24 * 60 * 60_000;

async function runAlarmCheck(): Promise<NextResponse> {
  const [tasks, alarms, members, projects] = await Promise.all([
    getTasksWithPendingAlarm(),
    getPendingAlarms(),
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
      try {
        await markTaskAlarmFired(task.id);
        fired += 1;
      } catch (err) {
        // ChatOps message already sent — don't let a mark-fired failure abort the whole
        // tick and block every other pending alarm behind it.
        console.error(`Failed to mark task alarm fired (${task.id}):`, err);
      }
    }
  }

  for (const alarm of alarms) {
    const fireAtMs = new Date(alarm.time).getTime();
    if (now < fireAtMs || now - fireAtMs > MAX_ALARM_STALENESS_MS) continue;

    const member = members.find((m) => m.id === alarm.memberId);
    const supervisor = alarm.supervisorId ? members.find((m) => m.id === alarm.supervisorId) : undefined;

    const message = buildStandaloneAlarmMessage({
      content: alarm.content,
      projectName: alarm.projectName,
      memberName: member?.name ?? "Unassigned",
      memberEmail: member?.email,
      supervisorName: supervisor?.name,
      supervisorEmail: supervisor?.email,
      timeLabel: formatDeployAt(alarm.time),
      link: `${process.env.HOST}/alarms`,
    });

    const result = await postToChatOps(message);
    if (result.ok) {
      try {
        await markStandaloneAlarmFired(alarm.id);
        fired += 1;
      } catch (err) {
        console.error(`Failed to mark alarm fired (${alarm.id}):`, err);
      }
    }
  }

  return NextResponse.json({ ok: true, checked: tasks.length + alarms.length, fired });
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
