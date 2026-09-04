import axios, { type AxiosInstance } from "axios";

const gatewayClient: AxiosInstance = axios.create({
  baseURL: process.env.AI_GATEWAY_URL ?? "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

interface GatewayResponse {
  raw: string;
}

export async function callGeminiText(systemPrompt: string, userText: string): Promise<string> {
  const prompt = `${systemPrompt}\n\n${userText}`;
  const response = await gatewayClient.post<GatewayResponse>("/answer-query", { prompt });
  return response.data.raw;
}

export async function callGeminiVision(prompt: string, imageUrl: string): Promise<string> {
  const response = await gatewayClient.post<GatewayResponse>("/format-entry", { prompt, imageUrl });
  return response.data.raw;
}
