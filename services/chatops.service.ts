function getHeaders(): Record<string, string> {
  return {
    "x-csrf-token": process.env.MM_CSRF || "",
    cookie: `MMAUTHTOKEN=${process.env.MM_AUTHTOKEN || ""}`,
    "Content-Type": "application/json",
  };
}

interface PostMessageOptions {
  threadId?: string;
  pendingPostId?: string;
}

export async function postMessage(message: string, options: PostMessageOptions = {}): Promise<void> {
  const chatOpsUrl = process.env.CHAT_OPS_URL_FOR_POSTS;
  const channelId = process.env.CHANNEL_ID;
  const fromUserId = process.env.FROM_USER_ID;

  if (!chatOpsUrl || !channelId || !fromUserId) {
    console.warn("[chatops] Missing CHAT_OPS_URL_FOR_POSTS/CHANNEL_ID/FROM_USER_ID, skip notify");
    return;
  }

  const data: Record<string, string> = {
    message,
    channel_id: channelId,
    user_id: fromUserId,
  };

  if (options.threadId) {
    data.root_id = options.threadId;
    data.parent_id = options.threadId;
  }
  if (options.pendingPostId) {
    data.pending_post_id = options.pendingPostId;
  }

  try {
    const response = await fetch(chatOpsUrl, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn(`[chatops] postMessage failed: ${response.status} ${await response.text()}`);
    }
  } catch (err) {
    console.warn("[chatops] postMessage error:", (err as { message?: string })?.message);
  }
}
