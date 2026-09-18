import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { buildGroundingSnapshot } from "@/services/grounding.service";
import { getMembers } from "@/services/members.service";
import { toMention } from "@/services/chatops.service";
import { postToChatOps } from "@/lib/chatops-post";
import { generateDailyDigestImageResponse } from "@/lib/daily-digest-image";

function formatDigest(
  snapshot: Awaited<ReturnType<typeof buildGroundingSnapshot>>,
  emailByName: Map<string, string>,
  imageId: string
): string {
  const displayName = (name: string) => toMention(emailByName.get(name)) || `**${name}**`;
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const membersWithTasks = snapshot.members.filter((m) => m.activeTasks.length > 0);
  const overdueCount = snapshot.overdueTasks.length;
  const statusSummary =
    overdueCount === 0
      ? "🟢 Không có task quá hạn"
      : `⚠️ Có **${overdueCount} task** cần xử lý gấp`;

  const lines = [
    `### 📋 Daily Progress Report — ${today}`,
    ``,
    `> **📊 Tình trạng:** ${statusSummary} | **👥 Nhân sự active:** **${membersWithTasks.length}/${snapshot.members.length}** kỹ sư`,
    ``,
    `#### ⚠️ Task Quá Hạn (${overdueCount})`,
  ];

  if (overdueCount === 0) {
    lines.push(`> *Không có task nào bị trễ hạn 🎉*`);
  } else {
    snapshot.overdueTasks.forEach((t) => {
      lines.push(
        `- 🚨 **${t.title}** (*${t.project}*) — ${displayName(t.memberName)}, **trễ ${t.daysOverdue} ngày**`
      );
    });
  }

  lines.push(``, `#### 🏃 Active Task Theo Thành Viên`);
  if (membersWithTasks.length === 0) {
    lines.push(`> *Không có task nào đang active.*`);
  } else {
    membersWithTasks.forEach((m) => {
      const isOverloaded = m.status === "quá tải" || m.status === "overloaded";
      const isFree = m.status === "rảnh" || m.status === "free";
      const icon = isOverloaded ? "🔴" : isFree ? "🟢" : "🔵";
      const taskList = m.activeTasks.map((t) => `\`${t.title}\``).join(", ");
      lines.push(`- ${icon} ${displayName(m.name)} *(${m.status})*: ${taskList}`);
    });
  }

  lines.push(
    ``,
    `---`,
    `*Ảnh đồ họa tổng hợp (PNG Infographic):* \n\n`,
    `![image](${process.env.HOST}/api/chatops/daily-digest?format=image&id=${imageId})`
  );

  return lines.join("\n");
}

async function runDigest(providedSecret: string | null): Promise<NextResponse> {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [snapshot, members] = await Promise.all([buildGroundingSnapshot(), getMembers()]);
  const emailByName = new Map(members.map((m) => [m.name, m.email]));

  const imageId = `${Date.now()}`;
  const message = formatDigest(snapshot, emailByName, imageId);
  const result = await postToChatOps(message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 502 });
  }

  return NextResponse.json({ ok: true });
}

function getProvidedSecret(request: Request, searchSecret?: string | null): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return searchSecret || request.headers.get("x-cron-secret") || null;
}

export async function POST(request: Request): Promise<NextResponse> {
  return runDigest(getProvidedSecret(request));
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const secret = url.searchParams.get("secret");

  // Allow direct visual preview of the digest image via ?format=image
  if (format === "image") {
    const [snapshot, members] = await Promise.all([buildGroundingSnapshot(), getMembers()]);
    const dateStr = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const imageResponse = generateDailyDigestImageResponse({ snapshot, members, dateStr });
    imageResponse.headers.set("Cache-Control", "no-store, must-revalidate");
    return imageResponse;
  }

  return runDigest(getProvidedSecret(request, secret));
}


