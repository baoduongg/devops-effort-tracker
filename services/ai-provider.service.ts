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

/**
 * Given a first AI response that failed JSON/schema validation, retries once with `raw` echoed
 * back for self-correction and re-validates. Shared by task-extractor.service.ts and
 * task-mutation-extractor.service.ts, which previously duplicated this retry-once sequence.
 */
export async function retryAiJsonOnce<R extends { success: boolean }>(
  systemPrompt: string,
  raw: string,
  extractJson: (raw: string) => unknown,
  parse: (candidate: unknown) => R,
  buildRetryPrompt: (raw: string) => string,
  provider?: AiProvider | null
): Promise<R> {
  const retryRaw = await callAiText(systemPrompt, buildRetryPrompt(raw), provider);
  return parse(extractJson(retryRaw));
}
