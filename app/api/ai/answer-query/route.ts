import { NextRequest, NextResponse } from "next/server";
import { callNvidiaText } from "@/services/nvidia.service";
import { buildGroundingSnapshot } from "@/services/grounding.service";
import { createChatLog } from "@/services/chatLogs.service";
import { extractTaskEntryFromInput } from "@/services/task-extractor.service";

const SYSTEM_PROMPT = `Bạn là Trợ lý AI Quản lý Nguồn lực & Điều phối Nhân sự DevOps (DevOps Effort & Resource Assistant).
Nhiệm vụ của bạn là giải đáp câu hỏi của Leader / Quản lý một cách CHUYÊN NGHIỆP, RÕ RÀNG, TRỰC QUAN và CHÍNH XÁC dựa trên dữ liệu thực tế được cung cấp.

QUY TẮC BẮT BUỘC KHI TRẢ LỜI:
1. NGÔN NGỮ: Luôn trả lời hoàn toàn bằng TIẾNG VIỆT tự nhiên, mạch lạc, chuẩn phong thái quản trị điều hành.
2. ĐỊNH DẠNG:
   - TUYỆT ĐỐI KHÔNG xuất ra raw JSON hoặc khối code kỹ thuật (\`\`\`json ... \`\`\`).
   - Sử dụng Markdown trực quan: in đậm tiêu đề, gạch đầu dòng rõ ràng, làm nổi bật tên người, dự án, phần trăm effort.
3. CẤU TRÚC PHẢN HỒI THEO LOẠI CÂU HỎI:
   - **KHI HỎI VỀ MỘT THÀNH VIÊN CỤ THỂ** (Ví dụ: "Bảo đang làm gì?", "Tình hình của Nam ra sao?"):
     Áp dụng cấu trúc định dạng chi tiết:
     + **Tình trạng tải công việc**: Nêu rõ trạng thái (Trống việc / Vừa tải / Quá tải) và Tổng % Effort hiện tại.
     + **Task đang thực hiện (In Progress)**: Tên task, Dự án, % tải, hạn hoàn thành (nếu có) hoặc ghi không có.
     + **Task kế hoạch (Planned)**: Tên task, Dự án, % tải, ngày bắt đầu (nếu có) hoặc ghi không có.
     + **Kết luận & Đề xuất**: Nhận xét khả năng nhận việc hoặc san sẻ tải cho thành viên này.

   - **KHI HỎI TỔNG QUAN TEAM / DANH SÁCH / AI RẢNH / AI QUÁ TẢI / ĐIỀU PHỐI** (Ví dụ: "Ai trong team đang rảnh?", "Ai đang quá tải?", "Tổng quan nhân sự"):
     + Trả lời TRỰC TIẾP và TẬP TRUNG vào nội dung hỏi:
       * Danh sách các thành viên liên quan (kèm % Effort, trạng thái, kỹ năng nếu phù hợp).
       * Gợi ý phân bổ / giải pháp điều phối nguồn lực thực tế cho Leader.
     + Trình bày gãy gọn bằng gạch đầu dòng hoặc bảng ngắn gọn để Leader dễ dàng nắm bắt số liệu.

4. TÍNH CHÍNH XÁC & GIỚI HẠN THỰC THI (GROUNDING & TASK CREATION):
   - Chỉ sử dụng số liệu có trong dữ liệu đính kèm. Không suy đoán hay tự bịa số liệu.
   - TUYỆT ĐỐI KHÔNG tự khẳng định rằng 'Đã gán task vào cơ sở dữ liệu' hoặc 'Đã thêm task vào danh sách plannedTasks' trong văn bản trả lời thuần túy khi chưa qua bước xác nhận thẻ công việc.`;

function isTaskCreationIntent(query: string): boolean {
  const q = query.toLowerCase();
  const patterns = [
    /(tạo|gán|phân công|thực hiện|lên|thêm|giao|giao cho|setup|cần|lập)\s+(task|việc|công việc|nhiệm vụ|kế hoạch)/i,
    /(hãy|nhờ|vui lòng)\s+(tạo|gán|phân công|lên lịch|log)/i,
    /(create|assign|add|schedule|log)\s+(task|work)/i,
    /(tạo|gán)\s+cho/i,
    /hãy\s+tạo\s+task/i,
    /cần\s+tạo\s+task/i,
  ];
  return patterns.some((p) => p.test(q));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { question, query } = body as { question?: string; query?: string };
  const userQuery = (question ?? query ?? "").trim();

  if (!userQuery) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  try {
    // 1. Check if user is asking to create / assign / plan a task
    if (isTaskCreationIntent(userQuery)) {
      const entry = await extractTaskEntryFromInput(userQuery);
      if (entry) {
        const assigneeText = entry.assigneeName ? `cho **${entry.assigneeName}**` : "";
        const projectText = entry.projectName ? `thuộc dự án **${entry.projectName}**` : "";
        const effortText = entry.effortPercent ? ` (${entry.effortPercent}% Effort)` : "";
        const answer = `Tôi đã soạn thảo thông tin giao task ${assigneeText} ${projectText}${effortText}.\n\nVui lòng kiểm tra thẻ công việc bên dưới và bấm **Xác nhận** để chính thức lưu task vào hệ thống.`;

        const chatLogId = await createChatLog({
          memberId: "leader",
          mode: "leader",
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, entry },
          confirmed: false,
        });

        return NextResponse.json({ answer, entry, chatLogId });
      }
    }

    // 2. Standard Q&A flow with grounding
    const snapshot = await buildGroundingSnapshot();
    const answer = await callNvidiaText(
      `${SYSTEM_PROMPT}\n\nDỮ LIỆU THỜI GIAN THỰC (REALTIME DATABASE):\n${JSON.stringify(snapshot, null, 2)}`,
      userQuery
    );

    const chatLogId = await createChatLog({
      memberId: "leader",
      mode: "leader",
      rawInput: userQuery,
      imageUrl: null,
      aiResponse: { answer },
      confirmed: true,
    });

    return NextResponse.json({ answer, chatLogId });
  } catch (error) {
    console.error("answer-query error:", error);
    return NextResponse.json({ error: "Failed to reach NVIDIA AI service" }, { status: 502 });
  }
}
