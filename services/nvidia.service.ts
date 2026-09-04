import axios, { type AxiosInstance } from "axios";

const nvidiaClient: AxiosInstance = axios.create({
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export interface NvidiaMessage {
  role: "system" | "user";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
}

interface ChatCompletionResponse {
  choices: Array<{ message: { content: string } }>;
}

async function chatCompletion(model: string, messages: NvidiaMessage[]): Promise<string> {
  const response = await nvidiaClient.post<ChatCompletionResponse>("/chat/completions", {
    model,
    messages,
    temperature: 0.2,
  });
  return response.data.choices[0].message.content;
}

export async function callNvidiaText(messages: NvidiaMessage[]): Promise<string> {
  const model = process.env.NVIDIA_TEXT_MODEL ?? "meta/llama-3.1-405b-instruct";
  return chatCompletion(model, messages);
}

export async function callNvidiaVision(text: string, imageUrl: string): Promise<string> {
  const model = process.env.NVIDIA_VISION_MODEL ?? "meta/llama-3.2-90b-vision-instruct";
  const messages: NvidiaMessage[] = [
    {
      role: "user",
      content: [
        { type: "text", text },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    },
  ];
  return chatCompletion(model, messages);
}
