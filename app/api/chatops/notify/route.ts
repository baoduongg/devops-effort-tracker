import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { message } = (await request.json()) as { message?: string };
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const url = process.env.CHAT_OPS_URL_FOR_POSTS;
  const authToken = process.env.MM_AUTHTOKEN;
  const csrf = process.env.MM_CSRF;
  const userId = process.env.FROM_USER_ID;
  const channelId = process.env.CHANNEL_ID;

  if (!url || !authToken || !csrf || !userId || !channelId) {
    console.warn("[ChatOps] Missing ChatOps env vars, skipping notification");
    return NextResponse.json({ error: "ChatOps not configured" }, { status: 502 });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-csrf-token": csrf,
        cookie: `MMAUTHTOKEN=${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        channel_id: channelId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn(`[ChatOps] Post failed: ${response.status} ${text}`);
      return NextResponse.json({ error: "ChatOps post failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn("[ChatOps] Post failed", (err as { message?: string })?.message);
    return NextResponse.json({ error: "ChatOps post failed" }, { status: 502 });
  }
}
