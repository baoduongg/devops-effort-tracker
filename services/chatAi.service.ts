import axios from "axios";
import type { AiProvider } from "@/services/ai-provider.service";
import type { ChatMode } from "@/types/chat";

interface FormatEntryParams {
  memberId: string;
  askerMemberName: string | null;
  text: string;
  imageUrl: string | null;
  provider: AiProvider;
  threadId: string;
}

export async function submitFormatEntry(params: FormatEntryParams) {
  const res = await axios.post("/api/ai/format-entry", {
    memberId: params.memberId,
    askerMemberName: params.askerMemberName,
    text: params.text,
    userInput: params.text,
    imageUrl: params.imageUrl,
    provider: params.provider,
    threadId: params.threadId,
  });
  return res.data;
}

interface AnswerQueryParams {
  question: string;
  memberId: string;
  mode: ChatMode;
  askerRole?: string;
  provider: AiProvider;
  threadId: string;
}

export async function submitAnswerQuery(params: AnswerQueryParams) {
  const res = await axios.post("/api/ai/answer-query", {
    question: params.question,
    query: params.question,
    memberId: params.memberId,
    mode: params.mode,
    askerRole: params.askerRole,
    provider: params.provider,
    threadId: params.threadId,
  });
  return res.data;
}
