import { NextRequest, NextResponse } from "next/server";
import { callNvidiaText } from "@/services/nvidia.service";
import { buildGroundingSnapshot, GroundingSnapshot } from "@/services/grounding.service";
import { createChatLog } from "@/services/chatLogs.service";
import { extractTaskEntryFromInput } from "@/services/task-extractor.service";
import { getMembers, findMemberByName } from "@/services/members.service";
import { isTaskCreationIntent } from "@/lib/intent";
import type { Member } from "@/types/member";

const SYSTEM_PROMPT = `Bạn là Trợ lý AI Quản lý Nguồn lực & Điều phối Nhân sự DevOps (DevOps Effort & Resource Assistant).
Nhiệm vụ của bạn là giải đáp câu hỏi của Leader / Quản lý một cách CHUYÊN NGHIỆP, RÕ RÀNG, TRỰC QUAN và CHÍNH XÁC dựa trên dữ liệu thực tế được cung cấp.

QUY TẮC BẮT BUỘC KHI TRẢ LỜI:
1. NGÔN NGỮ: Luôn trả lời hoàn toàn bằng TIẾNG VIỆT tự nhiên, mạch lạc, chuẩn phong thái quản trị điều hành.
2. ĐỊNH DẠNG:
   - TUYỆT ĐỐI KHÔNG xuất ra raw JSON hoặc khối code kỹ thuật (\`\`\`json ... \`\`\`).
   - Sử dụng Markdown trực quan: in đậm tiêu đề, gạch đầu dòng rõ ràng, làm nổi bật tên người, dự án, phần trăm effort.
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
   - TUYỆT ĐỐI KHÔNG tự khẳng định rằng 'Đã gán task vào cơ sở dữ liệu' hoặc 'Đã thêm task vào danh sách plannedTasks' trong văn bản trả lời thuần túy khi chưa qua bước xác nhận thẻ công việc.`;

const MEMBER_QUERY_PATTERN =
  /(?:thông tin|tình hình|task|công việc|tiến độ|kế hoạch|status|effort|tải công việc|báo cáo)\s+(?:công việc\s+)?(?:của|về)\s+(?:thành viên|nhân sự|member|bạn|anh|chị|em|chú|bác)?\s*([^?.,!]+)|(?:thành viên|nhân sự|member)\s+([^?.,!]+?)(?:\s+(?:đang làm gì|làm gì|có task gì|đang phụ trách gì|bận không|rảnh không|effort bao nhiêu|như thế nào|ra sao|hiện tại|trong tuần))?$|(?:tra cứu|xem|kiểm tra|tìm|check)\s+(?:thông tin\s+)?(?:thành viên|nhân sự|member)\s+([^?.,!]+)|^\/(?:status|member|nhansu)\s+(.+)$/i;

const GENERAL_TEAM_KEYWORDS = [
  "toàn bộ", "toan bo", "cả team", "ca team", "toàn team", "toan team",
  "các thành viên", "cac thanh vien", "mọi người", "moi nguoi",
  "ai trong team", "những ai", "nhung ai", "ai đang", "ai dang", "ai rảnh", "ai ranh", "ai quá tải", "ai qua tai",
  "dự án", "du an", "project", "hệ thống", "he thong",
  "tất cả", "tat ca", "danh sách", "danh sach", "tổng hợp", "tong hop",
  "báo cáo", "bao cao", "trễ hạn", "tre han", "deadline", "overdue",
  "hướng dẫn", "huong dan", "help", "slash", "lệnh", "của tôi", "cua toi", "tôi", "toi", "mình", "minh",
];

function isGeneralTeamKeyword(str: string): boolean {
  const s = str.toLowerCase().trim();
  if (!s || s.length < 2) return true;
  return GENERAL_TEAM_KEYWORDS.some((k) => s === k || s.startsWith(k + " ") || s.endsWith(" " + k));
}

function cleanMemberNameTarget(raw: string): string {
  return raw
    .replace(/^(chú|anh|chị|em|bạn|bác|ông|thầy)\s+/i, "")
    .replace(/\s+(ra sao|như thế nào|thế nào|hôm nay|trong tuần|tháng này|\?)$/i, "")
    .replace(/[?.,!]+$/g, "")
    .trim();
}

function detectMemberQueryTarget(query: string): { isMemberQuery: boolean; rawTarget: string | null; isPlaceholder: boolean } {
  const q = query.trim();

  // Unfilled placeholder e.g. "/status [Tên thành viên]" or "kế hoạch của [Tên thành viên]"
  if (/[[<]\s*(?:tên\s+)?(?:thành\s+viên|nhân\s+sự|member|name)\s*[\]>]/i.test(q)) {
    return { isMemberQuery: true, rawTarget: null, isPlaceholder: true };
  }

  // /status template prompt: "Tình hình công việc, task đang làm và kế hoạch của XYZ ra sao?"
  const statusTplMatch = q.match(/Tình hình công việc,?\s*task đang làm và kế hoạch của\s+(.+?)(?:\s+ra sao\??|\?|$)/i);
  const rawMatch = statusTplMatch?.[1] ?? MEMBER_QUERY_PATTERN.exec(q)?.slice(1).find(Boolean);
  if (!rawMatch) return { isMemberQuery: false, rawTarget: null, isPlaceholder: false };

  const target = cleanMemberNameTarget(rawMatch);
  if (!target) return { isMemberQuery: true, rawTarget: null, isPlaceholder: true };
  if (isGeneralTeamKeyword(target) || target.length < 2) return { isMemberQuery: false, rawTarget: null, isPlaceholder: false };
  return { isMemberQuery: true, rawTarget: target, isPlaceholder: false };
}

function renderMemberList(members: Member[], snapshotMembers?: GroundingSnapshot["members"]): string {
  if (!members || members.length === 0) {
    return "- *(Chưa có thành viên nào được đăng ký trong hệ thống)*";
  }

  const snapshotMap = new Map((snapshotMembers || []).map((m) => [m.name.toLowerCase(), m]));

  return members
    .map((m) => {
      const snap = snapshotMap.get(m.name.toLowerCase());
      const effort = snap ? snap.totalEffortPercent : (m.effortPercent ?? 0);
      const statusIcon = effort > 100 ? "🔴 Quá tải" : effort > 60 ? "🟡 Vừa tải" : "🟢 Sẵn sàng";
      const roleText = m.role === "leader" ? "Leader" : "DevOps Engineer";
      const skillsText = m.skills && m.skills.length > 0 ? ` [${m.skills.slice(0, 3).join(", ")}]` : "";
      return `- **${m.name}** (${roleText}${skillsText}) — ${statusIcon} (${effort}% Effort)`;
    })
    .join("\n");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { question, query, memberId, mode } = body as {
    question?: string;
    query?: string;
    memberId?: string;
    mode?: "leader" | "devops";
  };
  const userQuery = (question ?? query ?? "").trim();
  const currentMode = mode || "leader";
  const currentMemberId = memberId || (currentMode === "devops" ? "" : "leader");

  if (!userQuery) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  try {
    // 1. Check if user is asking to create / assign / plan a task
    if (isTaskCreationIntent(userQuery)) {
      const result = await extractTaskEntryFromInput(userQuery);
      if (result && result.entry) {
        const { entry, notificationMessage } = result;
        const assigneeText = entry.assigneeName ? `cho **${entry.assigneeName}**` : "";
        const projectText = entry.projectName ? `thuộc dự án **${entry.projectName}**` : "";
        const effortText = entry.effortPercent ? ` (${entry.effortPercent}% Effort)` : "";
        let answer = `Tôi đã soạn thảo thông tin giao task ${assigneeText} ${projectText}${effortText}.\n\nVui lòng kiểm tra thẻ công việc bên dưới và bấm **Xác nhận** để chính thức lưu task vào hệ thống.`;
        if (notificationMessage) {
          answer = `${notificationMessage}\n\n---\n${answer}`;
        }

        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, entry },
          confirmed: false,
        });

        return NextResponse.json({ answer, entry, chatLogId });
      }
    }

    // 2. Load members & grounding snapshot from Firestore
    const [snapshot, allMembers] = await Promise.all([buildGroundingSnapshot(), getMembers()]);

    // 3. Check if user is specifically querying information of a member
    const memberQueryCheck = detectMemberQueryTarget(userQuery);
    if (memberQueryCheck.isMemberQuery) {
      if (memberQueryCheck.isPlaceholder) {
        const answer = `⚠️ **Chưa nhập tên thành viên cần tra cứu**\n\nVui lòng nhập tên thành viên cụ thể (Ví dụ: \`/status Bảo\` hoặc \`Tình hình công việc của Bảo ra sao?\`).\n\n📋 **Danh sách thành viên hiện có trong team:**\n${renderMemberList(allMembers, snapshot.members)}`;

        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer },
          confirmed: true,
        });

        return NextResponse.json({ answer, chatLogId });
      }

      if (memberQueryCheck.rawTarget) {
        const matchedMember = findMemberByName(allMembers, memberQueryCheck.rawTarget);
        if (!matchedMember) {
          const answer = `⚠️ **Không tìm thấy thành viên: "${memberQueryCheck.rawTarget}"**\n\nNhân sự **"${memberQueryCheck.rawTarget}"** không tồn tại trong danh sách đội ngũ của hệ thống.\n\n📋 **Danh sách thành viên hiện có trong team:**\n${renderMemberList(allMembers, snapshot.members)}\n\n💡 *Vui lòng kiểm tra lại chính tả hoặc chọn một thành viên trong danh sách trên để tra cứu.*`;

          const chatLogId = await createChatLog({
            memberId: currentMemberId || "leader",
            mode: currentMode,
            rawInput: userQuery,
            imageUrl: null,
            aiResponse: { answer },
            confirmed: true,
          });

          return NextResponse.json({ answer, chatLogId });
        }
      }
    }

    // 4. Standard Q&A flow with grounding
    const answer = await callNvidiaText(
      `${SYSTEM_PROMPT}\n\nDỮ LIỆU THỜI GIAN THỰC (REALTIME DATABASE):\n${JSON.stringify(snapshot, null, 2)}`,
      userQuery
    );

    const chatLogId = await createChatLog({
      memberId: currentMemberId || "leader",
      mode: currentMode,
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

