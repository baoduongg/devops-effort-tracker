import { NextRequest, NextResponse } from "next/server";
import { extractTaskEntryFromInput } from "@/services/task-extractor.service";
import { createChatLog } from "@/services/chatLogs.service";
import { getProjects } from "@/services/projects.service";
import { hasUnfilledPlaceholder, findUnfilledPlaceholderFields, isRealProjectName } from "@/lib/intent";

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
    // F-06 checkpoint 1: block before extraction if the raw input still has an unfilled
    // template placeholder like "[Tên công việc]" (same gate as answer-query/route.ts).
    if (hasUnfilledPlaceholder(inputText)) {
      const message = `⚠️ **Nội dung vẫn còn chỗ trống chưa điền**\n\nBạn đang gửi nguyên mẫu lệnh nhưng chưa thay các phần trong dấu ngoặc vuông \`[...]\` bằng thông tin cụ thể. Vui lòng điền đầy đủ: tên công việc, tên nhân sự phụ trách, tên dự án (và thời lượng nếu có), rồi gửi lại.`;

      const chatLogId = await createChatLog({
        memberId: memberId || "leader",
        mode: "devops",
        rawInput: inputText || null,
        imageUrl: imageUrl ?? null,
        aiResponse: { answer: message },
        confirmed: true,
      });

      return NextResponse.json({ chatLogId, entry: null, message });
    }

    const result = await extractTaskEntryFromInput(inputText, imageUrl);

    if (!result || !result.entry) {
      return NextResponse.json({ error: "AI could not produce a valid structured entry" }, { status: 502 });
    }

    const { entry, notificationMessage } = result;

    // F-06 checkpoint 2: block if the model echoed back an unfilled placeholder in any field.
    const placeholderFields = findUnfilledPlaceholderFields(entry);
    if (placeholderFields.length > 0) {
      const message = `⚠️ **Còn thiếu thông tin cụ thể**\n\nBạn chưa điền: **${placeholderFields.join(", ")}**. Vui lòng bổ sung thông tin cụ thể rồi gửi lại.`;

      const chatLogId = await createChatLog({
        memberId: memberId || "leader",
        mode: "devops",
        rawInput: inputText || null,
        imageUrl: imageUrl ?? null,
        aiResponse: { answer: message },
        confirmed: true,
      });

      return NextResponse.json({ chatLogId, entry: null, message });
    }

    // F-07: project must match a real project in the system, not a fabricated/empty "unknown"
    // value — ask instead of letting the entry card through with a made-up project (ISSUE-06).
    const realProjects = await getProjects();
    if (!isRealProjectName(entry.projectName, realProjects.map((p) => p.name))) {
      const assigneeNote = entry.assigneeName ? `cho **${entry.assigneeName}**` : "";
      const message = `Đã ghi nhận: giao **${entry.title}** ${assigneeNote}. Bạn cho biết task này thuộc **dự án nào**?`;

      const chatLogId = await createChatLog({
        memberId: memberId || "leader",
        mode: "devops",
        rawInput: inputText || null,
        imageUrl: imageUrl ?? null,
        aiResponse: { answer: message },
        confirmed: true,
      });

      return NextResponse.json({ chatLogId, entry: null, message });
    }

    const chatLogId = await createChatLog({
      memberId: memberId || "leader",
      mode: "devops",
      rawInput: inputText || null,
      imageUrl: imageUrl ?? null,
      aiResponse: notificationMessage ? { answer: notificationMessage, entry } : entry,
      confirmed: false,
    });

    return NextResponse.json({ chatLogId, entry, message: notificationMessage });
  } catch (error) {
    console.error("format-entry error:", error);
    return NextResponse.json({ error: "Failed to reach NVIDIA AI service" }, { status: 502 });
  }
}
