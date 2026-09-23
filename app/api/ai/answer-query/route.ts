import { NextRequest, NextResponse } from "next/server";
import { buildGroundingSnapshot } from "@/services/grounding.service";
import { createChatLog } from "@/services/chatLogs.service";
import { getMembers } from "@/services/members.service";
import { getAllTaskChangeLogs, getTaskChangeLogsByActor } from "@/services/taskChangeLogs.service";
import { runChatToolLoop } from "@/services/chat-tools.service";
import { renderTaskChangeAudit } from "@/services/chat-card-builders.service";
import type { AiResponsePayload } from "@/types/chat";
import type { Member } from "@/types/member";

const SYSTEM_PROMPT = `Bạn là Trợ lý AI Quản lý Nguồn lực & Điều phối Nhân sự DevOps (DevOps Effort & Resource Assistant).
Nhiệm vụ của bạn là giải đáp câu hỏi của Leader / Quản lý một cách CHUYÊN NGHIỆP, RÕ RÀNG, TRỰC QUAN và CHÍNH XÁC dựa trên dữ liệu thực tế được cung cấp.

QUY TẮC BẮT BUỘC KHI TRẢ LỜI:
1. NGÔN NGỮ: Luôn trả lời hoàn toàn bằng TIẾNG VIỆT tự nhiên, mạch lạc, chuẩn phong thái quản trị điều hành.
2. ĐỊNH DẠNG:
   - TUYỆT ĐỐI KHÔNG xuất ra raw JSON hoặc khối code kỹ thuật (\`\`\`json ... \`\`\`).
   - TUYỆT ĐỐI KHÔNG xuất ra Markdown Table (| ... | ... |) khi liệt kê danh sách task vì gây vỡ bố cục trên khung chat.
   - Sử dụng Markdown trực quan: in đậm tiêu đề, gạch đầu dòng rõ ràng, làm nổi bật tên người, dự án, thời lượng effort (phút/giờ).
3. QUY TẮC KIỂM TRA SỰ TỒN TẠI CỦA THÀNH VIÊN (MEMBER EXISTENCE CHECK):
   - Khi người dùng hỏi thông tin, tình hình, task hoặc kế hoạch của một thành viên / nhân sự cụ thể:
     + BẮT BUỘC phải đối chiếu tên người được hỏi với danh sách "members" trong DỮ LIỆU THỜI GIAN THỰC.
     + NẾU TÊN THÀNH VIÊN ĐÓ KHÔNG CÓ trong danh sách "members" (hoặc nếu là placeholder như "[Tên thành viên]"):
       * TUYỆT ĐỐI KHÔNG xuất ra bảng thông tin giả định (không ghi "Trống việc 0%", không ghi "Task: Không có", không đề xuất giao việc).
       * BẮT BUỘC PHẢI TRẢ LỜI: "⚠️ Không tìm thấy thành viên **[Tên]** trong danh sách đội ngũ của hệ thống." và liệt kê danh sách các thành viên hiện có trong database để người dùng chọn lại.
     + CHỈ xuất cấu trúc báo cáo chi tiết cho thành viên khi thành viên đó THỰC SỰ TỒN TẠI trong cơ sở dữ liệu.

4. CẤU TRÚC PHẢN HỒI THEO LOẠI CÂU HỎI & QUY TẮC ĐIỀU PHỐI:
   - **QUY TẮC PHÂN BỔ & GỢI Ý GIAO TASK CHO LEADER**:
     + Người đang hỏi là LEADER (Quản lý / Điều phối đội ngũ).
     + Khi Leader hỏi về các nhân sự đang rảnh hoặc tìm người nhận việc (Ví dụ: "/free", "Ai trong team đang rảnh việc?", "Ai có thể nhận thêm task?", "Gợi ý người làm task..."):
       * CHỈ liệt kê và đề xuất các KỸ SƯ / THÀNH VIÊN KỸ THUẬT DEVOPS (role: 'devops' hoặc kỹ sư trong team).
       * TUYỆT ĐỐI KHÔNG gợi ý giao task kỹ thuật cho chính Leader hoặc những người có role 'leader', vì Leader là người quản lý phân công việc, không phải nhân sự nhận task kỹ thuật để thực thi.
       * Nếu tất cả kỹ sư DevOps đều bận hoặc quá tải, hãy thông báo rõ tình trạng tải của đội ngũ DevOps và gợi ý giải pháp điều phối/san sẻ giữa các kỹ sư, KHÔNG đề xuất Leader tự làm.

   - **KHI HỎI VỀ MỘT THÀNH VIÊN CỤ THỂ ĐÃ TỒN TẠI** (Ví dụ: "Bảo đang làm gì?", "Tình hình của Nam ra sao?"):
     Áp dụng cấu trúc định dạng chi tiết:
     + **Tình trạng tải công việc**: Nêu rõ trạng thái (Trống việc / Vừa tải / Quá tải) và Tổng % Effort hiện tại.
     + **Task đang thực hiện (In Progress)**: Tên task, Dự án, % tải, hạn hoàn thành (nếu có) hoặc ghi không có.
     + **Task kế hoạch (Planned)**: Tên task, Dự án, % tải, ngày bắt đầu (nếu có) hoặc ghi không có.
     + **Kết luận & Đề xuất**: Nhận xét khả năng nhận việc hoặc san sẻ tải cho thành viên này.

   - **KHI HỎI TỔNG QUAN TEAM / DANH SÁCH / AI RẢNH / AI QUÁ TẢI / ĐIỀU PHỐI** (Ví dụ: "Ai trong team đang rảnh?", "Ai đang quá tải?", "Tổng quan nhân sự"):
     + Trả lời TRỰC TIẾP và TẬP TRUNG vào nội dung hỏi:
       * Danh sách các kỹ sư/thành viên liên quan (kèm % Effort, trạng thái, kỹ năng nếu phù hợp).
       * Gợi ý phân bổ / giải pháp điều phối nguồn lực thực tế cho Leader.
     + Trình bày gãy gọn bằng gạch đầu dòng hoặc bảng ngắn gọn để Leader dễ dàng nắm bắt số liệu.

5. TÍNH CHÍNH XÁC & GIỚI HẠN THỰC THI (GROUNDING & TASK CREATION):
   - Chỉ sử dụng số liệu có trong dữ liệu đính kèm. Không suy đoán hay tự bịa số liệu.
   - TUYỆT ĐỐI KHÔNG tự khẳng định rằng 'Đã gán task vào cơ sở dữ liệu' hoặc 'Đã thêm task vào danh sách plannedTasks' trong văn bản trả lời thuần túy khi chưa qua bước xác nhận thẻ công việc.
   - Dùng đúng các trường tính sẵn "overdueTasks", "freeMembers", "busyMembers", "overloadedMembers", "projectProgress" trong dữ liệu đính kèm khi câu hỏi liên quan (trễ hạn / ai rảnh / ai quá tải / tiến độ dự án) thay vì tự suy luận lại từ danh sách thô.
   - Nếu câu hỏi có NHIỀU Ý (vd vừa hỏi ai rảnh vừa hỏi task nào trễ), PHẢI trả lời đủ TẤT CẢ các ý trong cùng một câu trả lời, không được chỉ trả lời ý đầu rồi bỏ qua ý sau.
   - Nếu câu hỏi KHÔNG liên quan tới effort/task/team/dự án (vd thời tiết, kiến thức chung ngoài hệ thống), từ chối lịch sự và nêu rõ đây là hệ thống quản lý task/effort, không trả lời nội dung ngoài phạm vi đó.
6. GIỚI HẠN TÍNH NĂNG HỆ THỐNG: Hệ thống này CHỈ hỗ trợ giao task một lần (one-off) với startDate/endDate cụ thể. KHÔNG có tính năng task lặp lại/định kỳ/cố định theo lịch (recurring/template task). Nếu người dùng hỏi về khả năng này hoặc bất kỳ tính năng nào không nằm trong danh sách tool được cấp, trả lời rõ ràng là tính năng chưa được hỗ trợ, KHÔNG suy đoán hoặc trả lời như thể tính năng đó tồn tại.
7. QUYỀN HẠN: Nếu người dùng không có quyền tạo/sửa/xóa task (không thấy các tool create_task/update_task/delete_task trong danh sách) nhưng câu hỏi rõ ràng là muốn tạo/sửa/xóa task, trả lời rõ: hành động này chỉ dành cho Leader, dùng tool answer_general_question để trả lời.
8. CÂU HỎI NHIỀU Ý: Bạn chỉ được gọi ĐÚNG MỘT tool cho mỗi câu hỏi. Nếu câu hỏi có nhiều ý thuộc nhiều tool khác nhau (vd "ai đang rảnh và có task nào trễ hạn không" — vừa khớp list_free_members vừa khớp list_overdue_tasks), KHÔNG chọn đại 1 tool rồi bỏ qua ý còn lại — thay vào đó dùng tool answer_general_question và trả lời ĐẦY ĐỦ tất cả các ý trong cùng một câu trả lời bằng văn bản, dựa trên dữ liệu thời gian thực đính kèm.`;

/**
 * Resolves the real `role` from Firestore for the given memberId, so the route doesn't blindly
 * trust the client-supplied `mode`. Falls back to trusting `mode` when memberId can't be resolved
 * (e.g. leader's placeholder memberId="leader") — documented assumption, see spec "Phân quyền".
 */
async function resolveIsLeader(mode: "leader" | "devops", memberId: string, allMembers: Member[]): Promise<boolean> {
  if (!memberId || memberId === "leader") {
    return mode === "leader";
  }
  const matched = allMembers.find((m) => m.id === memberId);
  if (!matched) {
    return mode === "leader";
  }
  return matched.role === "leader";
}

const AUDIT_QUERY_PATTERN =
  /(vừa nãy|vừa rồi).*(đổi|sửa|xóa|xoá).*(qua chat|task)|(?:tôi|leader)\s+(?:vừa|đã)\s+(?:đổi|sửa|xóa|xoá).*task/i;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { question, query, memberId, mode, askerRole, provider, threadId } = body as {
    question?: string;
    query?: string;
    memberId?: string;
    mode?: "leader" | "devops";
    askerRole?: "leader" | "devops";
    provider?: "claude" | "nvidia";
    threadId?: string;
  };
  const userQuery = (question ?? query ?? "").trim();
  const currentMode = mode || "leader";
  const currentMemberId = memberId || (currentMode === "devops" ? "" : "leader");
  // ISSUE-14/ISSUE-17: `currentMode` is the UI tab (routing only) and can differ from who is really
  // asking (e.g. a devops user on the "Ask" tab still sends mode:"leader"). `askerRole` is the
  // asker's real account role, fixed per login — use it for identity/permission checks below.
  // Falls back to currentMode when the client didn't send it (e.g. older client), same as before.
  const currentAskerRole = askerRole || currentMode;

  if (!userQuery) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  // Every branch below writes the same chatLog shape (memberId/mode/threadId/rawInput fixed,
  // only aiResponse's extra fields and `confirmed` vary) then echoes those same fields back as
  // the JSON response. `extra` holds the branch-specific fields (answer + at most one payload).
  async function logAndRespond(extra: AiResponsePayload, confirmed: boolean): Promise<NextResponse> {
    const chatLogId = await createChatLog({
      memberId: currentMemberId || "leader",
      mode: currentMode,
      threadId: threadId!,
      rawInput: userQuery,
      imageUrl: null,
      aiResponse: extra,
      confirmed,
    });
    return NextResponse.json({ ...extra, chatLogId });
  }

  try {
    const allMembersForRoleCheck = await getMembers();
    const isLeader = await resolveIsLeader(currentMode, currentMemberId, allMembersForRoleCheck);

    // Audit trail stays regex-deterministic: it's an exact 1:1 lookup into taskChangeLogs, no
    // natural-language ambiguity to resolve, so routing it through the AI would cost a call for
    // something already 100% certain.
    if (AUDIT_QUERY_PATTERN.test(userQuery)) {
      const logs =
        currentMode === "leader" && currentMemberId === "leader"
          ? await getAllTaskChangeLogs()
          : await getTaskChangeLogsByActor(currentMemberId || "leader");
      const answer = renderTaskChangeAudit(logs);
      return logAndRespond({ answer }, true);
    }

    // ISSUE-17/FB-CHAT-04: build the snapshot pre-filtered for devops askers (scoped down to just
    // their own member) so the free-text Q&A branch never leaks any other member's data.
    const [snapshot, allMembers] = [
      await buildGroundingSnapshot(currentAskerRole === "devops" ? currentMemberId : undefined),
      allMembersForRoleCheck,
    ];

    const askerMember: Member | undefined =
      currentAskerRole === "devops" ? allMembers.find((m) => m.id === currentMemberId) : undefined;
    const askerContextLine = askerMember
      ? `\n\nNGƯỜI ĐANG HỎI: ${askerMember.name} (khi câu hỏi dùng "tôi"/"mình"/"của tôi", đó là chỉ chính người này).`
      : "";
    const fullSystemPrompt = `${SYSTEM_PROMPT}${askerContextLine}\n\nDỮ LIỆU THỜI GIAN THỰC (REALTIME DATABASE):\n${JSON.stringify(snapshot, null, 2)}`;

    const responsePayload = await runChatToolLoop({
      systemPrompt: fullSystemPrompt,
      userQuery,
      effectiveQuery: userQuery,
      snapshot,
      allMembers,
      isLeader,
      currentAskerRole,
      currentMemberId,
    });

    const confirmed = !("clarification" in responsePayload) && !("entry" in responsePayload) && !("proposal" in responsePayload);
    return logAndRespond(responsePayload, confirmed);
  } catch (error) {
    console.error("answer-query error:", error);
    return NextResponse.json({ error: "Failed to reach AI service" }, { status: 502 });
  }
}

