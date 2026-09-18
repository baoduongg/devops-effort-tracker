function maskSecret(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function postToChatOps(
  message: string
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const url = process.env.CHAT_OPS_URL_FOR_POSTS;
  const authToken = process.env.MM_AUTHTOKEN;
  const channelId = process.env.CHANNEL_ID;

  if (!url || !authToken || !channelId) {
    console.warn("[ChatOps] Missing ChatOps env vars, skipping notification");
    return { ok: false, error: "ChatOps not configured", status: 502 };
  }

  try {
    const payload = {
      message,
      channel_id: channelId,
    };

    console.log(
      `[ChatOps][curl] curl -X POST '${url}' -H 'cookie: MMAUTHTOKEN=${maskSecret(authToken)}' -H 'Content-Type: application/json' -d '${JSON.stringify(payload)}'`
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        cookie: `MMAUTHTOKEN=${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn(`[ChatOps] Post failed: ${response.status} ${text}`);
      return { ok: false, error: "ChatOps post failed", status: 502 };
    }

    return { ok: true };
  } catch (err) {
    console.warn("[ChatOps] Post failed", (err as { message?: string })?.message);
    return { ok: false, error: "ChatOps post failed", status: 502 };
  }
}

