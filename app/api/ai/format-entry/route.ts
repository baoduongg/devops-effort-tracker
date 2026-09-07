import { NextRequest, NextResponse } from "next/server";
import { extractTaskEntryFromInput } from "@/services/task-extractor.service";
import { createChatLog } from "@/services/chatLogs.service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { text, userInput, imageUrl, memberId } = body as {
    text?: string;
    userInput?: string;
    imageUrl?: string | null;
    memberId?: string;
  };

  const inputText = (text ?? userInput ?? "").trim();

  if (!inputText && !imageUrl) {
    return NextResponse.json({ error: "text or imageUrl is required" }, { status: 400 });
  }

  try {
    const entry = await extractTaskEntryFromInput(inputText, imageUrl);

    if (!entry) {
      return NextResponse.json({ error: "AI could not produce a valid structured entry" }, { status: 502 });
    }

    const chatLogId = await createChatLog({
      memberId: memberId || "leader",
      mode: "devops",
      rawInput: inputText || null,
      imageUrl: imageUrl ?? null,
      aiResponse: entry,
      confirmed: false,
    });

    return NextResponse.json({ chatLogId, entry });
  } catch (error) {
    console.error("format-entry error:", error);
    return NextResponse.json({ error: "Failed to reach NVIDIA AI service" }, { status: 502 });
  }
}
