import { callNvidiaText, callNvidiaVision } from "@/services/nvidia.service";
import { callClaudeText, callClaudeVision } from "@/services/claude.service";

export type AiProvider = "claude" | "nvidia";

// ponytail: AI_PROVIDER env var is the default; caller (chatbox UI) may override per-request.
function getProvider(override?: AiProvider | null): AiProvider {
  if (override === "claude" || override === "nvidia") return override;
  return process.env.AI_PROVIDER === "claude" ? "claude" : "nvidia";
}

export async function callAiText(systemPrompt: string, userText: string, provider?: AiProvider | null): Promise<string> {
  return getProvider(provider) === "claude" ? callClaudeText(systemPrompt, userText) : callNvidiaText(systemPrompt, userText);
}

export async function callAiVision(prompt: string, imageUrl: string, provider?: AiProvider | null): Promise<string> {
  return getProvider(provider) === "claude" ? callClaudeVision(prompt, imageUrl) : callNvidiaVision(prompt, imageUrl);
}
