import { NextRequest, NextResponse } from "next/server";
import { postMessage } from "@/services/chatops.service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { message, threadId, pendingPostId } = body as {
    message?: string;
    threadId?: string;
    pendingPostId?: string;
  };

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  await postMessage(message, { threadId, pendingPostId });

  return NextResponse.json({ ok: true });
}
