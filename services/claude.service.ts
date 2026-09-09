import axios, { type AxiosInstance } from "axios";

const claudeClient: AxiosInstance = axios.create({
  baseURL: "https://code.runagent.click/v1",
  headers: {
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-cc";

interface ClaudeMessageResponse {
  content: { type: string; text?: string }[];
}

export async function callClaudeText(systemPrompt: string, userText: string): Promise<string> {
  const response = await claudeClient.post<ClaudeMessageResponse>("/messages", {
    model: MODEL,
    system: systemPrompt,
    messages: [{ role: "user", content: userText }],
    max_tokens: 1024,
    temperature: 0.1,
  });

  const content = response.data?.content?.find((b) => b.type === "text")?.text;
  if (!content) throw new Error("Claude text response missing content");
  return content;
}

export async function callClaudeVision(prompt: string, imageUrl: string): Promise<string> {
  let mediaType = "image/png";
  let base64Image: string;

  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URL image");
    mediaType = match[1];
    base64Image = match[2];
  } else {
    const imageResponse = await axios.get<ArrayBuffer>(imageUrl, { responseType: "arraybuffer" });
    mediaType = (imageResponse.headers["content-type"] as string) ?? "image/png";
    base64Image = Buffer.from(imageResponse.data).toString("base64");
  }

  const response = await claudeClient.post<ClaudeMessageResponse>("/messages", {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: prompt },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.1,
  });

  const content = response.data?.content?.find((b) => b.type === "text")?.text;
  if (!content) throw new Error("Claude vision response missing content");
  return content;
}
