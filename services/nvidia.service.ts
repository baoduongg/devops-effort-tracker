import axios, { type AxiosInstance } from "axios";

const nvidiaClient: AxiosInstance = axios.create({
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

const MODELS = ["meta/llama-3.2-11b-vision-instruct", "meta/llama-3.2-90b-vision-instruct"];

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

export async function callNvidiaText(systemPrompt: string, userText: string): Promise<string> {
  let lastError: unknown = null;

  for (const model of MODELS) {
    try {
      const response = await nvidiaClient.post<ChatCompletionResponse>("/chat/completions", {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
        temperature: 0.1,
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (err) {
      console.warn(`[NVIDIA AI] Model ${model} failed, trying fallback...`, (err as { message?: string })?.message);
      lastError = err;
    }
  }

  throw lastError ?? new Error("All NVIDIA text models failed");
}

export async function callNvidiaVision(prompt: string, imageUrl: string): Promise<string> {
  let formattedImageUrl = imageUrl;

  if (!imageUrl.startsWith("data:")) {
    const imageResponse = await axios.get<ArrayBuffer>(imageUrl, { responseType: "arraybuffer" });
    const contentType = imageResponse.headers["content-type"] ?? "image/png";
    const base64Image = Buffer.from(imageResponse.data).toString("base64");
    formattedImageUrl = `data:${contentType};base64,${base64Image}`;
  }

  let lastError: unknown = null;

  for (const model of MODELS) {
    try {
      const response = await nvidiaClient.post<ChatCompletionResponse>("/chat/completions", {
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: formattedImageUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (err) {
      console.warn(`[NVIDIA AI] Vision model ${model} failed, trying fallback...`, (err as { message?: string })?.message);
      lastError = err;
    }
  }

  throw lastError ?? new Error("All NVIDIA vision models failed");
}

