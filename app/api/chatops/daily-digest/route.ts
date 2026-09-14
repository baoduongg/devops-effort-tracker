import { NextResponse } from "next/server";
import { buildGroundingSnapshot } from "@/services/grounding.service";
import { getMembers } from "@/services/members.service";
import { toMention } from "@/services/chatops.service";
import { postToChatOps } from "@/lib/chatops-post";

function formatDigest(
  snapshot: Awaited<ReturnType<typeof buildGroundingSnapshot>>,
  emailByName: Map<string, string>
): string {
  const displayName = (name: string) => toMention(emailByName.get(name)) || name;
  const today = new Date().toLocaleDateString("vi-VN");
  const lines = [`📋 Daily Report — ${today}`, ``];

  lines.push(`⚠️ Quá hạn (${snapshot.overdueTasks.length}):`);
  if (snapshot.overdueTasks.length === 0) {
    lines.push(`Không có task quá hạn 🎉`);
  } else {
    snapshot.overdueTasks.forEach((t) => {
      lines.push(`- ${t.title} (${t.project}) — ${displayName(t.memberName)}, trễ ${t.daysOverdue} ngày`);
    });
  }

  lines.push(``, `🏃 Active task theo member:`);
  const membersWithTasks = snapshot.members.filter((m) => m.activeTasks.length > 0);
  if (membersWithTasks.length === 0) {
    lines.push(`Không có task đang active.`);
  } else {
    membersWithTasks.forEach((m) => {
      lines.push(`- ${displayName(m.name)} (${m.status}): ${m.activeTasks.map((t) => t.title).join(", ")}`);
    });
  }

  return lines.join("\n");
}

async function runDigest(providedSecret: string | null): Promise<NextResponse> {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [snapshot, members] = await Promise.all([buildGroundingSnapshot(), getMembers()]);
  const emailByName = new Map(members.map((m) => [m.name, m.email]));
  const message = formatDigest(snapshot, emailByName);
  const result = await postToChatOps(message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 502 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request): Promise<NextResponse> {
  return runDigest(request.headers.get("x-cron-secret"));
}

export async function GET(request: Request): Promise<NextResponse> {
  const secret = new URL(request.url).searchParams.get("secret");
  return runDigest(secret);
}
