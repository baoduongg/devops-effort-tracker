import { NextRequest, NextResponse } from "next/server";
import { callNvidiaText } from "@/services/nvidia.service";
import { buildGroundingSnapshot } from "@/services/grounding.service";
import { createChatLog } from "@/services/chatLogs.service";

const SYSTEM_PROMPT = `You are a DevOps team assistant. Answer the leader's question using ONLY the JSON data provided below.
If the data does not contain information to answer the question, say clearly that you don't have that information — never invent names, projects, or numbers.`;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { question } = (await request.json()) as { question: string };

  if (!question || !question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  try {
    const snapshot = await buildGroundingSnapshot();
    const answer = await callNvidiaText(`${SYSTEM_PROMPT}\n\nDATA:\n${JSON.stringify(snapshot)}`, question);

    await createChatLog({
      memberId: "leader",
      mode: "leader",
      rawInput: question,
      imageUrl: null,
      aiResponse: { answer },
      confirmed: true,
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("answer-query error:", error);
    return NextResponse.json({ error: "Failed to reach NVIDIA AI service" }, { status: 502 });
  }
}
