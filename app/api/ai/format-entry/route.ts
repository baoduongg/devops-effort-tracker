import { NextRequest, NextResponse } from "next/server";
import { callNvidiaText, callNvidiaVision } from "@/services/nvidia.service";
import { formattedEntrySchema } from "@/lib/schemas";
import { createChatLog } from "@/services/chatLogs.service";

const SYSTEM_PROMPT = `You extract DevOps work log entries from free text or screenshots of task boards.
Return ONLY a JSON object with this exact shape, no markdown, no explanation:
{"title": string, "projectName": string, "effortPercent": number (0-200), "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" | null, "status": "planned" | "in_progress" | "done"}`;

function extractJson(raw: string): unknown {
  const match = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : raw);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { text, imageUrl, memberId } = body as { text?: string; imageUrl?: string; memberId: string };

  if (!text && !imageUrl) {
    return NextResponse.json({ error: "text or imageUrl is required" }, { status: 400 });
  }

  try {
    const raw = imageUrl
      ? await callNvidiaVision(`${SYSTEM_PROMPT}\n\nUser note: ${text ?? ""}`, imageUrl)
      : await callNvidiaText(SYSTEM_PROMPT, text ?? "");

    let parsed = formattedEntrySchema.safeParse(extractJson(raw));

    if (!parsed.success) {
      const retryRaw = await callNvidiaText(
        SYSTEM_PROMPT,
        `Your previous response was invalid JSON or missing fields. Original input: ${text ?? "(image)"}. Return ONLY the JSON object.`
      );
      parsed = formattedEntrySchema.safeParse(extractJson(retryRaw));
    }

    if (!parsed.success) {
      return NextResponse.json({ error: "AI could not produce a valid structured entry" }, { status: 502 });
    }

    const chatLogId = await createChatLog({
      memberId,
      mode: "devops",
      rawInput: text ?? null,
      imageUrl: imageUrl ?? null,
      aiResponse: parsed.data,
      confirmed: false,
    });

    return NextResponse.json({ chatLogId, entry: parsed.data });
  } catch (error) {
    console.error("format-entry error:", error);
    return NextResponse.json({ error: "Failed to reach NVIDIA AI service" }, { status: 502 });
  }
}
