import { NextResponse } from "next/server";
import { postToChatOps } from "@/lib/chatops-post";

export async function POST(request: Request): Promise<NextResponse> {
  const { message } = (await request.json()) as { message?: string };
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const result = await postToChatOps(message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 502 });
  }

  return NextResponse.json({ ok: true });
}
