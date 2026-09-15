export async function uploadChatOpsFile(
  fileBuffer: Buffer | Uint8Array,
  filename = "daily-digest.png",
  mimeType = "image/png"
): Promise<string | null> {
  const url = process.env.CHAT_OPS_URL_FOR_POSTS;
  const authToken = process.env.MM_AUTHTOKEN;
  const csrf = process.env.MM_CSRF;
  const channelId = process.env.CHANNEL_ID;

  if (!url || !authToken || !csrf || !channelId) {
    console.warn("[ChatOps] Missing ChatOps env vars for file upload, skipping");
    return null;
  }

  const filesUrl = url.replace(/\/posts\/?$/, "/files");

  try {
    const formData = new FormData();
    formData.append("channel_id", channelId);
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
    formData.append("files", blob, filename);

    const response = await fetch(filesUrl, {
      method: "POST",
      headers: {
        "x-csrf-token": csrf,
        cookie: `MMAUTHTOKEN=${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn(`[ChatOps] File upload failed: ${response.status} ${text}`);
      return null;
    }

    const data = await response.json();
    const fileId = data?.file_infos?.[0]?.id;
    return typeof fileId === "string" ? fileId : null;
  } catch (err) {
    console.warn("[ChatOps] File upload error", (err as { message?: string })?.message);
    return null;
  }
}

export async function postToChatOps(
  message: string,
  fileIds?: string[]
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const url = process.env.CHAT_OPS_URL_FOR_POSTS;
  const authToken = process.env.MM_AUTHTOKEN;
  const csrf = process.env.MM_CSRF;
  const userId = process.env.FROM_USER_ID;
  const channelId = process.env.CHANNEL_ID;

  if (!url || !authToken || !csrf || !userId || !channelId) {
    console.warn("[ChatOps] Missing ChatOps env vars, skipping notification");
    return { ok: false, error: "ChatOps not configured", status: 502 };
  }

  try {
    const payload: {
      message: string;
      channel_id: string;
      user_id: string;
      file_ids?: string[];
    } = {
      message,
      channel_id: channelId,
      user_id: userId,
    };

    if (fileIds && fileIds.length > 0) {
      payload.file_ids = fileIds;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-csrf-token": csrf,
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

