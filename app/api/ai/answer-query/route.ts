import { NextRequest, NextResponse } from "next/server";
import { callAiText } from "@/services/ai-provider.service";
import { buildGroundingSnapshot, GroundingSnapshot } from "@/services/grounding.service";
import { createChatLog } from "@/services/chatLogs.service";
import { extractTaskEntryFromInput } from "@/services/task-extractor.service";
import { extractTaskMutationFromInput } from "@/services/task-mutation-extractor.service";
import { getMembers, findMemberByName, findBestSuitableMember } from "@/services/members.service";
import { getAllTaskChangeLogs, getTaskChangeLogsByActor } from "@/services/taskChangeLogs.service";
import { isTaskCreationIntent, isTaskUpdateIntent, isTaskDeleteIntent } from "@/lib/intent";
import { formatEffortDuration } from "@/lib/effort";
import type { Member } from "@/types/member";
import type { ClarificationRequest } from "@/types/chat";

const SYSTEM_PROMPT = `Bạn là Trợ lý AI Quản lý Nguồn lực & Điều phối Nhân sự DevOps (DevOps Effort & Resource Assistant).
Nhiệm vụ của bạn là giải đáp câu hỏi của Leader / Quản lý một cách CHUYÊN NGHIỆP, RÕ RÀNG, TRỰC QUAN và CHÍNH XÁC dựa trên dữ liệu thực tế được cung cấp.

QUY TẮC BẮT BUỘC KHI TRẢ LỜI:
1. NGÔN NGỮ: Luôn trả lời hoàn toàn bằng TIẾNG VIỆT tự nhiên, mạch lạc, chuẩn phong thái quản trị điều hành.
2. ĐỊNH DẠNG:
   - TUYỆT ĐỐI KHÔNG xuất ra raw JSON hoặc khối code kỹ thuật (\`\`\`json ... \`\`\`).
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
   - Nếu câu hỏi KHÔNG liên quan tới effort/task/team/dự án (vd thời tiết, kiến thức chung ngoài hệ thống), từ chối lịch sự và nêu rõ đây là hệ thống quản lý task/effort, không trả lời nội dung ngoài phạm vi đó.`;

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

const FIRST_PERSON_PATTERN = /\b(của tôi|của mình|bản thân|tôi|mình)\b/i;

/**
 * ISSUE-14: "tôi"/"mình"/"của tôi" used to be treated as a GENERAL_TEAM_KEYWORD (no specific
 * target), so a devops asking about themselves fell through to the generic team Q&A with no
 * identity context. When the asker has a real resolvable member (not leader mode's generic
 * "leader" placeholder), map the pronoun straight to that member instead of treating it as
 * "no specific member" / requiring a name lookup.
 */
function detectSelfQueryTarget(query: string, askerRole: "leader" | "devops", currentMemberId: string, allMembers: Member[]): Member | null {
  if (!FIRST_PERSON_PATTERN.test(query)) return null;
  if (askerRole !== "devops" || !currentMemberId || currentMemberId === "leader") return null;
  return allMembers.find((m) => m.id === currentMemberId) ?? null;
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

/**
 * F-12/ISSUE-16(c): when rendering the "here are the members you can pick from" list for a devops
 * asker, leader accounts must be filtered out — devops should only see themselves/peers, never a
 * leader offered as a valid lookup/assignment target. `forMode` is the identity of the person the
 * list is being shown to, not the member being described.
 */
function renderMemberList(members: Member[], snapshotMembers?: GroundingSnapshot["members"], forMode: "leader" | "devops" = "leader"): string {
  const visibleMembers = forMode === "devops" ? members.filter((m) => m.role !== "leader") : members;
  if (!visibleMembers || visibleMembers.length === 0) {
    return "- *(Chưa có thành viên nào được đăng ký trong hệ thống)*";
  }

  const snapshotMap = new Map((snapshotMembers || []).map((m) => [m.name.toLowerCase(), m]));

  return visibleMembers
    .map((m) => {
      const snap = snapshotMap.get(m.name.toLowerCase());
      const effortMinutes = snap ? snap.totalEffortMinutes : (m.effortMinutes ?? 0);
      const statusIcon = effortMinutes > 480 ? "🔴 Quá tải" : effortMinutes > 288 ? "🟡 Vừa tải" : "🟢 Sẵn sàng";
      const roleText = m.role === "leader" ? "Leader" : "DevOps Engineer";
      const skillsText = m.skills && m.skills.length > 0 ? ` [${m.skills.slice(0, 3).join(", ")}]` : "";
      return `- **${m.name}** (${roleText}${skillsText}) — ${statusIcon} (${formatEffortDuration(effortMinutes)} Effort)`;
    })
    .join("\n");
}

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

function renderTaskChangeAudit(logs: Awaited<ReturnType<typeof getAllTaskChangeLogs>>): string {
  if (logs.length === 0) {
    return "Bạn chưa thực hiện thay đổi (sửa/xóa) task nào qua chat trong hệ thống.";
  }
  const actionLabel: Record<string, string> = { create: "Tạo", update: "Sửa", delete: "Xóa" };
  const statusLabel: Record<string, string> = { confirmed: "đã xác nhận", cancelled: "đã hủy" };
  const lines = logs
    .slice(0, 20)
    .map(
      (l) =>
        `- **${actionLabel[l.action] ?? l.action}** task **${l.taskTitle}** — ${statusLabel[l.status] ?? l.status} lúc ${new Date(l.createdAt).toLocaleString("vi-VN")}`
    );
  return `📋 **Lịch sử thay đổi task qua chat:**\n${lines.join("\n")}`;
}

function renderClarificationAnswer(clarification: ClarificationRequest): string {
  switch (clarification.reason) {
    case "missing_field":
      return "Bạn chưa nói rõ muốn đổi thông tin gì (trạng thái/ngày/người phụ trách/mô tả/effort). Vui lòng bổ sung rõ trước khi tôi soạn đề xuất.";
    case "no_match":
      return clarification.candidates && clarification.candidates.length > 0
        ? `Không tìm thấy task/nhân sự khớp với yêu cầu. Danh sách hiện có:\n${clarification.candidates.map((c) => `- ${c.label}`).join("\n")}`
        : "Không tìm thấy task/nhân sự nào khớp với yêu cầu của bạn. Vui lòng kiểm tra lại tên.";
    case "ambiguous_match":
      return `Có nhiều task khớp với yêu cầu, vui lòng chọn rõ:\n${(clarification.candidates ?? []).map((c) => `- ${c.label}`).join("\n")}`;
    case "target_is_leader":
      return `Không thể giao/sửa task cho tài khoản có vai trò Leader — task chỉ dành cho kỹ sư DevOps.${
        clarification.candidates && clarification.candidates.length > 0
          ? ` Gợi ý: ${clarification.candidates.map((c) => c.label).join(", ")}.`
          : ""
      }`;
    default:
      return "Cần bạn xác nhận rõ hơn trước khi tiếp tục.";
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { question, query, memberId, mode, askerRole, provider } = body as {
    question?: string;
    query?: string;
    memberId?: string;
    mode?: "leader" | "devops";
    askerRole?: "leader" | "devops";
    provider?: "claude" | "nvidia";
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

  try {
    const allMembersForRoleCheck = await getMembers();
    const isLeader = await resolveIsLeader(currentMode, currentMemberId, allMembersForRoleCheck);

    const isDeleteIntent = isTaskDeleteIntent(userQuery);
    const isUpdateIntent = !isDeleteIntent && isTaskUpdateIntent(userQuery);
    const isCreateIntent = !isDeleteIntent && !isUpdateIntent && isTaskCreationIntent(userQuery);

    // 0. F-02: block devops from create/update/delete, even on their own tasks — checked before
    // calling any extractor/AI so no chatLogs proposal / taskChangeLogs is ever created for it.
    if ((isDeleteIntent || isUpdateIntent || isCreateIntent) && !isLeader) {
      const answer =
        "⚠️ Bạn không đủ quyền để thêm/sửa/xóa task qua chat. Hành động này chỉ dành cho Leader. Vui lòng dùng cách ghi log công việc tự nhiên hiện có, hoặc nhờ Leader thực hiện thay đổi này.";
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

    // 1. Delete intent (checked first, per F-01 order: delete -> update -> create -> query)
    if (isDeleteIntent) {
      const result = await extractTaskMutationFromInput(userQuery, "delete", provider);
      if (result.clarification) {
        const answer = renderClarificationAnswer(result.clarification);
        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, clarification: result.clarification },
          confirmed: false,
        });
        return NextResponse.json({ answer, clarification: result.clarification, chatLogId });
      }
      if (result.proposal) {
        const answer = `Đang định **xóa vĩnh viễn** task **${result.proposal.taskSnapshot.title}**. Vui lòng kiểm tra kỹ thông tin bên dưới và bấm **Xác nhận** nếu chắc chắn.`;
        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, proposal: result.proposal },
          confirmed: false,
        });
        return NextResponse.json({ answer, proposal: result.proposal, chatLogId });
      }
    }

    // 2. Update intent
    if (isUpdateIntent) {
      const result = await extractTaskMutationFromInput(userQuery, "update", provider);
      if (result.clarification) {
        const answer = renderClarificationAnswer(result.clarification);
        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, clarification: result.clarification },
          confirmed: false,
        });
        return NextResponse.json({ answer, clarification: result.clarification, chatLogId });
      }
      if (result.proposal) {
        const answer = `Đang định **sửa** task **${result.proposal.taskSnapshot.title}**. Vui lòng kiểm tra thay đổi bên dưới và bấm **Xác nhận** để lưu.`;
        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, proposal: result.proposal },
          confirmed: false,
        });
        return NextResponse.json({ answer, proposal: result.proposal, chatLogId });
      }
    }

    // 3. Create intent (existing behavior, reused as-is — task-extractor.service.ts unchanged).
    // F-06: for leader commands here, missing project/effort must ask back instead of the
    // extractor's own default-60-minutes behavior (that default is kept for devops format-entry).
    if (isCreateIntent) {
      const mentionsProject = /(?:dự án|du an|project)\s+\S/i.test(userQuery);
      const mentionsEffort = /(\d+(?:[.,]\d+)?\s*(?:phút|p\b|tiếng|giờ|h\b|ngày|%))/i.test(userQuery);

      if (!mentionsProject) {
        const clarification: ClarificationRequest = { reason: "missing_field", missingFields: ["projectName"] };
        const answer = "Task này thuộc **dự án nào**? Vui lòng cho biết tên dự án trước khi tôi soạn đề xuất.";
        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, clarification },
          confirmed: false,
        });
        return NextResponse.json({ answer, clarification, chatLogId });
      }

      if (!mentionsEffort) {
        const clarification: ClarificationRequest = { reason: "missing_field", missingFields: ["effortMinutes"] };
        const answer = "Bạn dự kiến **effort** (thời lượng) cho task này là bao nhiêu? Vui lòng cho biết cụ thể (vd: 2 tiếng, 4 tiếng, 1 ngày).";
        const chatLogId = await createChatLog({
          memberId: currentMemberId || "leader",
          mode: currentMode,
          rawInput: userQuery,
          imageUrl: null,
          aiResponse: { answer, clarification },
          confirmed: false,
        });
        return NextResponse.json({ answer, clarification, chatLogId });
      }

      const result = await extractTaskEntryFromInput(userQuery, null, provider);
      if (result && result.entry) {
        const { entry, notificationMessage } = result;

        if (entry.assigneeName) {
          const matchedAssignee = findMemberByName(allMembersForRoleCheck, entry.assigneeName);
          if (matchedAssignee?.role === "leader") {
            const suggestion = findBestSuitableMember(allMembersForRoleCheck, entry.title, entry.projectName);
            const clarification: ClarificationRequest = {
              reason: "target_is_leader",
              candidates: suggestion ? [{ id: suggestion.id, label: suggestion.name }] : [],
            };
            const answer = renderClarificationAnswer(clarification);
            const chatLogId = await createChatLog({
              memberId: currentMemberId || "leader",
              mode: currentMode,
              rawInput: userQuery,
              imageUrl: null,
              aiResponse: { answer, clarification },
              confirmed: false,
            });
            return NextResponse.json({ answer, clarification, chatLogId });
          }
        }

        const assigneeText = entry.assigneeName ? `cho **${entry.assigneeName}**` : "";
        const projectText = entry.projectName ? `thuộc dự án **${entry.projectName}**` : "";
        const effortText = entry.effortMinutes ? ` (${formatEffortDuration(entry.effortMinutes)} Effort)` : "";
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

    // 4. Load members & grounding snapshot from Firestore
    // ISSUE-17/FB-CHAT-04: build the snapshot pre-filtered for devops askers (scoped down to just
    // their own member) so the free-text Q&A branch (which serializes the whole snapshot into the
    // AI prompt below) never leaks any other member's data — leader or peer devops.
    const [snapshot, allMembers] = [
      await buildGroundingSnapshot(currentAskerRole === "devops" ? currentMemberId : undefined),
      allMembersForRoleCheck,
    ];

    // ISSUE-14: resolve first-person pronouns ("tôi"/"mình"/"của tôi") to the asker's own member
    // name before anything else treats the query as a generic/team-wide question — swaps the
    // pronoun for the real name so the rest of the flow (member-query detection + grounded Q&A)
    // answers scoped to that member, same as if they'd typed their own name.
    const selfMember = detectSelfQueryTarget(userQuery, currentAskerRole, currentMemberId, allMembers);
    const effectiveQuery = selfMember ? userQuery.replace(FIRST_PERSON_PATTERN, selfMember.name) : userQuery;

    // 4a. F-08/AC-08-6: audit trail question is answered directly from taskChangeLogs, no AI.
    if (AUDIT_QUERY_PATTERN.test(userQuery)) {
      const logs =
        currentMode === "leader" && currentMemberId === "leader"
          ? await getAllTaskChangeLogs()
          : await getTaskChangeLogsByActor(currentMemberId || "leader");
      const answer = renderTaskChangeAudit(logs);
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

    // 5. Check if user is specifically querying information of a member
    const memberQueryCheck = detectMemberQueryTarget(effectiveQuery);
    if (memberQueryCheck.isMemberQuery) {
      if (memberQueryCheck.isPlaceholder) {
        const answer = `⚠️ **Chưa nhập tên thành viên cần tra cứu**\n\nVui lòng nhập tên thành viên cụ thể (Ví dụ: \`/status Bảo\` hoặc \`Tình hình công việc của Bảo ra sao?\`).\n\n📋 **Danh sách thành viên hiện có trong team:**\n${renderMemberList(allMembers, snapshot.members, currentAskerRole)}`;

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
          const answer = `⚠️ **Không tìm thấy thành viên: "${memberQueryCheck.rawTarget}"**\n\nNhân sự **"${memberQueryCheck.rawTarget}"** không tồn tại trong danh sách đội ngũ của hệ thống.\n\n📋 **Danh sách thành viên hiện có trong team:**\n${renderMemberList(allMembers, snapshot.members, currentAskerRole)}\n\n💡 *Vui lòng kiểm tra lại chính tả hoặc chọn một thành viên trong danh sách trên để tra cứu.*`;

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

        // FB-CHAT-04: requirements.md — devops chỉ được tra cứu về bản thân, không mở rộng quyền
        // tra cứu sang dữ liệu người khác (kể cả đồng nghiệp devops khác, không chỉ leader).
        if (currentAskerRole === "devops" && matchedMember.id !== currentMemberId) {
          const answer =
            "🔒 Bạn chỉ có thể tra cứu thông tin của chính mình qua Chat AI. Vui lòng liên hệ Leader nếu cần xem thông tin của thành viên khác.";
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
    const answer = await callAiText(
      `${SYSTEM_PROMPT}\n\nDỮ LIỆU THỜI GIAN THỰC (REALTIME DATABASE):\n${JSON.stringify(snapshot, null, 2)}`,
      effectiveQuery,
      provider
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
    return NextResponse.json({ error: "Failed to reach AI service" }, { status: 502 });
  }
}

