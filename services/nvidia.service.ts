import axios, { type AxiosInstance } from "axios";

const nvidiaClient: AxiosInstance = axios.create({
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

const TEXT_MODEL = "nvidia/nemotron-3-super-120b-a12b";
const VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

export async function callNvidiaText(systemPrompt: string, userText: string): Promise<string> {
  const response = await nvidiaClient.post<ChatCompletionResponse>("/chat/completions", {
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ],
  });
  return response.data.choices[0].message.content;
}

export async function callNvidiaVision(prompt: string, imageUrl: string): Promise<string> {
  const imageResponse = await axios.get<ArrayBuffer>(imageUrl, { responseType: "arraybuffer" });
  const contentType = imageResponse.headers["content-type"] ?? "image/png";
  const base64Image = Buffer.from(imageResponse.data).toString("base64");

  const response = await nvidiaClient.post<ChatCompletionResponse>("/chat/completions", {
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${contentType};base64,${base64Image}` } },
        ],
      },
    ],
  });
  return response.data.choices[0].message.content;
}
