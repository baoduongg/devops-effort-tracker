import { NextRequest, NextResponse } from "next/server";
import { callAiText } from "@/services/ai-provider.service";
import { buildGroundingSnapshot } from "@/services/grounding.service";
import { createChatLog } from "@/services/chatLogs.service";
import { extractTaskEntryFromInput } from "@/services/task-extractor.service";
import { extractTaskMutationFromInput } from "@/services/task-mutation-extractor.service";
import { getMembers, findMemberByName, findBestSuitableMember } from "@/services/members.service";
import { getAllTaskChangeLogs, getTaskChangeLogsByActor } from "@/services/taskChangeLogs.service";
import { isTaskCreationIntent, isTaskUpdateIntent, isTaskDeleteIntent } from "@/lib/intent";
import { formatEffortDuration } from "@/lib/effort";
import { deriveSlashCommandFromText } from "@/lib/slash-commands";
import type { AiResponsePayload } from "@/types/chat";
import {
  renderMemberList,
  renderTaskChangeAudit,
  renderClarificationAnswer,
  buildTaskListPayload,
  buildFreeCardAvailability,
  buildOverloadPayload,
  buildEffortPayload,
  buildLoadPayload,
  buildReportPayload,
  buildOverduePayload,
  buildMembersListPayload,
  buildProjectsListPayload,
  buildHelpPayload,
  buildMemberInfoPayload,
} from "@/services/chat-card-builders.service";
import type { Member } from "@/types/member";
import type { ClarificationRequest } from "@/types/chat";

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

/**
 * Normalizes for name comparison (diacritics/case-insensitive), mirrors findMemberByName's
 * normalize() in members.service.ts.
 */
function normalizeForNameMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Root-cause fix: MEMBER_QUERY_PATTERN only matches when a trigger word (task/tình hình/thành
 * viên/...) appears immediately before the name, or the string starts with a trigger word. It
 * misses subject-first phrasing like "Team Leader đang làm task gì?" where the name comes first
 * and no trigger word precedes it. Since the trigger-word regex can't be generalized to catch
 * "name anywhere" without false-positiving on every sentence, fall back to scanning for a known
 * member's name as a whole-word match anywhere in the query — this is what actually lets
 * FB-CHAT-04's self-only check run for subject-first questions.
 */
function detectMemberQueryTarget(
  query: string,
  allMembers: Member[] = []
): { isMemberQuery: boolean; rawTarget: string | null; isPlaceholder: boolean } {
  const q = query.trim();

  // Unfilled placeholder e.g. "/status [Tên thành viên]" or "/info [Tên thành viên]"
  if (/[[<]\s*(?:tên\s+)?(?:thành\s+viên|nhân\s+sự|member|name)\s*[\]>]/i.test(q)) {
    return { isMemberQuery: true, rawTarget: null, isPlaceholder: true };
  }

  // Bare command without target e.g. "/status" or "/info"
  if (/^\s*\/(?:status|info|member|nhansu)\s*$/i.test(q)) {
    return { isMemberQuery: true, rawTarget: null, isPlaceholder: true };
  }

  // /status or /info template prompt: "Tình hình công việc, task đang làm và kế hoạch của XYZ ra sao?"
  const statusTplMatch = q.match(/Tình hình công việc,?\s*task đang làm và kế hoạch của\s+(.+?)(?:\s+ra sao\??|\?|$)/i);
  const rawMatch = statusTplMatch?.[1] ?? MEMBER_QUERY_PATTERN.exec(q)?.slice(1).find(Boolean);
  if (rawMatch) {
    const target = cleanMemberNameTarget(rawMatch);
    if (!target) return { isMemberQuery: true, rawTarget: null, isPlaceholder: true };
    if (isGeneralTeamKeyword(target) || target.length < 2) return { isMemberQuery: false, rawTarget: null, isPlaceholder: false };
    return { isMemberQuery: true, rawTarget: target, isPlaceholder: false };
  }

  // Subject-first fallback: no trigger word found, check if any known member's name appears
  // anywhere in the query as a whole word (longest name first, so "Team Leader" wins over "Leader").
  // Strip out common team phrases so "thành viên" doesn't falsely match a member named "Thành", etc.
  const qCleaned = q
    .replace(/\b(?:thành viên|thanh vien|nhân sự|nhan su|đội ngũ|doi ngu|toàn bộ|toan bo|tất cả|tat ca|hệ thống|he thong|báo cáo|bao cao|công việc|cong viec|tải công việc|tai cong viec|băng thông|bang thong|mức độ bận rộn|muc do ban ron)\b/gi, " ");
  const qNorm = normalizeForNameMatch(qCleaned);
  const sortedByLength = allMembers
    .map((member) => ({ member, nameNorm: normalizeForNameMatch(member.name) }))
    .sort((a, b) => b.nameNorm.length - a.nameNorm.length);
  for (const { member, nameNorm } of sortedByLength) {
    if (!nameNorm || nameNorm.length < 2) continue;
    const wordBoundaryMatch = new RegExp(`(?:^|\\s)${nameNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`).test(qNorm);
    if (wordBoundaryMatch) {
      return { isMemberQuery: true, rawTarget: member.name, isPlaceholder: false };
    }
  }

  return { isMemberQuery: false, rawTarget: null, isPlaceholder: false };
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

// FREE-CARD: leader-only "who's free" structured card, answered deterministically from the
// already-built grounding snapshot instead of an AI call (see buildFreeCardAvailability below).
// Anchored to a leading "ai ..." subject so it doesn't fire inside member-specific questions
// (e.g. "Bảo có thể nhận thêm task không?") or unrelated sentences containing "ranh"/"trong".
const FREE_QUERY_PATTERN =
  /(?:^\s*\/(?:free|available|ranh|nhansuranh)\b)|(?:\b(?:ai|nhân sự nào|những ai|thành viên nào)\b.*(?:rảnh|trống|con trong|chưa có task|nhận thêm task))/i;
const OVERLOAD_QUERY_PATTERN =
  /(?:^\s*\/(?:overload|overloaded|quatai|busy)\b)|(?:\b(?:quá tải|qua tai|vượt mức 480m|vượt ngưỡng|vượt mức 8h)\b)/i;
const EFFORT_QUERY_PATTERN =
  /(?:^\s*\/(?:effort|my-effort|taicongviec|totaleffort)\b)|(?:(?:tổng hợp phân bổ effort|phân bổ effort|tổng % effort|tổng effort|thời lượng công việc của toàn bộ thành viên)\b)/i;
const LOAD_QUERY_PATTERN =
  /(?:^\s*\/(?:load|workload|bandwidth|tinhtrangtai)\b)|(?:(?:tình trạng tải|mức độ bận rộn|băng thông|bandwidth)\b)/i;
const REPORT_QUERY_PATTERN =
  /(?:^\s*\/(?:report|baocao|summary|phanbo)\b)|(?:(?:báo cáo.*phân bổ effort|báo cáo.*dự án|báo cáo tổng hợp phân bổ)\b)/i;
const OVERDUE_QUERY_PATTERN =
  /(?:^\s*\/(?:overdue|trehan|deadline|gap)\b)|(?:(?:task.*(?:trễ hạn|quá hạn|deadline|gần đến hạn|gấp)|trễ hạn|cận kề deadline)\b)/i;
const TASKS_QUERY_PATTERN =
  /(?:^\s*\/(?:tasks?|all-tasks|danhsachtask|viec|my-tasks|vieccuatoi)\b)|(?:(?:danh sách.*task|các task đang thực hiện|task đang làm và kế hoạch|danh sách công việc)\b)/i;
const MEMBERS_QUERY_PATTERN =
  /(?:^\s*\/(?:members?|team|nhansu|danhsach)\b)|(?:(?:danh sách.*thành viên|toàn bộ thành viên trong đội ngũ|danh sách nhân sự)\b)/i;
const PROJECTS_QUERY_PATTERN =
  /(?:^\s*\/(?:projects?|duan|project-list|danhsachduan)\b)|(?:(?:danh sách.*dự án|các dự án hiện có|tiến độ dự án)\b)/i;
const HELP_QUERY_PATTERN =
  /(?:^\s*\/(?:help|huongdan|\?)\b)|(?:(?:hướng dẫn.*lệnh slash|hướng dẫn sử dụng|cách sử dụng ai assistant)\b)/i;

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

    const isDeleteIntent = isTaskDeleteIntent(userQuery);
    const isUpdateIntent = !isDeleteIntent && isTaskUpdateIntent(userQuery);
    const isCreateIntent = !isDeleteIntent && !isUpdateIntent && isTaskCreationIntent(userQuery);

    // 0. F-02: block devops from create/update/delete, even on their own tasks — checked before
    // calling any extractor/AI so no chatLogs proposal / taskChangeLogs is ever created for it.
    if ((isDeleteIntent || isUpdateIntent || isCreateIntent) && !isLeader) {
      const answer =
        "⚠️ Bạn không đủ quyền để thêm/sửa/xóa task qua chat. Hành động này chỉ dành cho Leader. Vui lòng dùng cách ghi log công việc tự nhiên hiện có, hoặc nhờ Leader thực hiện thay đổi này.";
      return logAndRespond({ answer }, true);
    }

    // 1. Delete intent (checked first, per F-01 order: delete -> update -> create -> query)
    if (isDeleteIntent) {
      const result = await extractTaskMutationFromInput(userQuery, "delete", provider);
      if (result.clarification) {
        const answer = renderClarificationAnswer(result.clarification);
        return logAndRespond({ answer, clarification: result.clarification }, false);
      }
      if (result.proposal) {
        const answer = `Đang định **xóa vĩnh viễn** task **${result.proposal.taskSnapshot.title}**. Vui lòng kiểm tra kỹ thông tin bên dưới và bấm **Xác nhận** nếu chắc chắn.`;
        return logAndRespond({ answer, proposal: result.proposal }, false);
      }
    }

    // 2. Update intent
    if (isUpdateIntent) {
      const result = await extractTaskMutationFromInput(userQuery, "update", provider);
      if (result.clarification) {
        const answer = renderClarificationAnswer(result.clarification);
        return logAndRespond({ answer, clarification: result.clarification }, false);
      }
      if (result.proposal) {
        const answer = `Đang định **sửa** task **${result.proposal.taskSnapshot.title}**. Vui lòng kiểm tra thay đổi bên dưới và bấm **Xác nhận** để lưu.`;
        return logAndRespond({ answer, proposal: result.proposal }, false);
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
        return logAndRespond({ answer, clarification }, false);
      }

      if (!mentionsEffort) {
        const clarification: ClarificationRequest = { reason: "missing_field", missingFields: ["effortMinutes"] };
        const answer = "Bạn dự kiến **effort** (thời lượng) cho task này là bao nhiêu? Vui lòng cho biết cụ thể (vd: 2 tiếng, 4 tiếng, 1 ngày).";
        return logAndRespond({ answer, clarification }, false);
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
            return logAndRespond({ answer, clarification }, false);
          }
        }

        const assigneeText = entry.assigneeName ? `cho **${entry.assigneeName}**` : "";
        const projectText = entry.projectName ? `thuộc dự án **${entry.projectName}**` : "";
        const effortText = entry.effortMinutes ? ` (${formatEffortDuration(entry.effortMinutes)} Effort)` : "";
        let answer = `Tôi đã soạn thảo thông tin giao task ${assigneeText} ${projectText}${effortText}.\n\nVui lòng kiểm tra thẻ công việc bên dưới và bấm **Xác nhận** để chính thức lưu task vào hệ thống.`;
        if (notificationMessage) {
          answer = `${notificationMessage}\n\n---\n${answer}`;
        }

        return logAndRespond({ answer, entry }, false);
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
    const derivedCommand = deriveSlashCommandFromText(userQuery) || deriveSlashCommandFromText(effectiveQuery);

    // 4a. F-08/AC-08-6: audit trail question is answered directly from taskChangeLogs, no AI.
    if (AUDIT_QUERY_PATTERN.test(userQuery)) {
      const logs =
        currentMode === "leader" && currentMemberId === "leader"
          ? await getAllTaskChangeLogs()
          : await getTaskChangeLogsByActor(currentMemberId || "leader");
      const answer = renderTaskChangeAudit(logs);
      return logAndRespond({ answer }, true);
    }

    // 4b. Member-specific lookup (e.g. /status, /info, or "task của Bảo ra sao?") must be resolved
    // before the generic list cards below (5a-5j) — those cards match on loose keyword substrings
    // (e.g. TASKS_QUERY_PATTERN matches "task đang làm và kế hoạch", which also appears verbatim in
    // /info's own resolved prompt), so a query naming a specific member would otherwise be hijacked
    // by the team-wide card instead of returning that member's info.
    const isExplicitMemberCommand = derivedCommand === "/info" || derivedCommand === "/status";
    const memberQueryCheck = detectMemberQueryTarget(effectiveQuery, allMembers);
    if (isExplicitMemberCommand || memberQueryCheck.isMemberQuery) {
      if (memberQueryCheck.isPlaceholder) {
        const answer = `⚠️ **Chưa nhập tên thành viên cần tra cứu**\n\nVui lòng nhập tên thành viên cụ thể (Ví dụ: \`/status Bảo\` hoặc \`Tình hình công việc của Bảo ra sao?\`).\n\n📋 **Danh sách thành viên hiện có trong team:**\n${renderMemberList(allMembers, snapshot.members, currentAskerRole)}`;
        return logAndRespond({ answer }, true);
      }

      if (memberQueryCheck.rawTarget) {
        const matchedMember = findMemberByName(allMembers, memberQueryCheck.rawTarget);
        if (!matchedMember) {
          const answer = `⚠️ **Không tìm thấy thành viên: "${memberQueryCheck.rawTarget}"**\n\nNhân sự **"${memberQueryCheck.rawTarget}"** không tồn tại trong danh sách đội ngũ của hệ thống.\n\n📋 **Danh sách thành viên hiện có trong team:**\n${renderMemberList(allMembers, snapshot.members, currentAskerRole)}\n\n💡 *Vui lòng kiểm tra lại chính tả hoặc chọn một thành viên trong danh sách trên để tra cứu.*`;
          return logAndRespond({ answer }, true);
        }

        // FB-CHAT-04: requirements.md — devops chỉ được tra cứu về bản thân, không mở rộng quyền
        // tra cứu sang dữ liệu người khác (kể cả đồng nghiệp devops khác, không chỉ leader).
        if (currentAskerRole === "devops" && matchedMember.id !== currentMemberId) {
          const answer =
            "🔒 Bạn chỉ có thể tra cứu thông tin của chính mình qua Chat AI. Vui lòng liên hệ Leader nếu cần xem thông tin của thành viên khác.";
          return logAndRespond({ answer }, true);
        }

        const memberInfoData = buildMemberInfoPayload(matchedMember, snapshot);
        const answer = `Hồ sơ năng lực & Task của ${matchedMember.name}`;
        return logAndRespond({ answer, memberInfoData }, true);
      }
    }

    // 5a. FREE-CARD: leader-only "who's free" structured card, answered deterministically
    if (isLeader && currentAskerRole === "leader" && (derivedCommand === "/free" || (!derivedCommand && FREE_QUERY_PATTERN.test(effectiveQuery)))) {
      const memberAvailability = buildFreeCardAvailability(snapshot);
      const freeCount = snapshot.freeMembers.length;
      const answer =
        freeCount > 0
          ? `🟢 Hiện có **${freeCount} thành viên** đang rảnh và có thể nhận thêm task: ${snapshot.freeMembers.join(", ")}.`
          : "⚠️ Hiện không có thành viên nào đang rảnh — toàn bộ đội ngũ đang bận hoặc quá tải.";
      return logAndRespond({ answer, memberAvailability }, true);
    }

    // 5b. TASK-CARD: structured task list card mirroring landing page UI
    if (derivedCommand === "/tasks" || (!derivedCommand && TASKS_QUERY_PATTERN.test(effectiveQuery))) {
      const taskList = buildTaskListPayload(snapshot);
      const answer = `📋 Danh sách ${taskList.tasks.length} task đang thực hiện và kế hoạch.`;
      return logAndRespond({ answer, taskList }, true);
    }

    // 5c. OVERLOAD-CARD: structured overload alert card
    if (derivedCommand === "/overload" || (!derivedCommand && OVERLOAD_QUERY_PATTERN.test(effectiveQuery))) {
      const overloadData = buildOverloadPayload(snapshot);
      const answer = `⚠️ Cảnh báo quá tải: Phát hiện ${overloadData.overloadedMembers.length} thành viên vượt ngưỡng an toàn.`;
      return logAndRespond({ answer, overloadData }, true);
    }

    // 5d. EFFORT-CARD: structured effort distribution card with progress bar
    if (derivedCommand === "/effort" || (!derivedCommand && EFFORT_QUERY_PATTERN.test(effectiveQuery))) {
      const effortData = buildEffortPayload(snapshot);
      const answer = `📊 Tổng hợp phân bổ Effort & thời lượng toàn đội ngũ hôm nay: ${effortData.totalEffortMinutes}m / ${effortData.totalCapacityMinutes}m (${effortData.overallPercentage}%).`;
      return logAndRespond({ answer, effortData }, true);
    }

    // 5e. LOAD-CARD: structured workload and bandwidth card
    if (derivedCommand === "/load" || (!derivedCommand && LOAD_QUERY_PATTERN.test(effectiveQuery))) {
      const loadData = buildLoadPayload(snapshot);
      const answer = `⚡ Tình trạng tải công việc và băng thông (Bandwidth) từng kỹ sư.`;
      return logAndRespond({ answer, loadData }, true);
    }

    // 5f. REPORT-CARD: structured project effort allocation report card
    if (derivedCommand === "/report" || (!derivedCommand && REPORT_QUERY_PATTERN.test(effectiveQuery))) {
      const reportData = buildReportPayload(snapshot);
      const answer = `📑 Báo cáo phân bổ Effort theo từng dự án (${reportData.projects.length} dự án).`;
      return logAndRespond({ answer, reportData }, true);
    }

    // 5g. OVERDUE-CARD: structured overdue tasks warning card
    if (derivedCommand === "/overdue" || (!derivedCommand && OVERDUE_QUERY_PATTERN.test(effectiveQuery))) {
      const overdueData = buildOverduePayload(snapshot);
      const answer = `🚨 Phát hiện ${overdueData.tasks.length} task đang bị trễ hạn hoặc cận kề deadline.`;
      return logAndRespond({ answer, overdueData }, true);
    }

    // 5h. MEMBERS-CARD: structured members roster card
    if (derivedCommand === "/members" || (!derivedCommand && MEMBERS_QUERY_PATTERN.test(effectiveQuery))) {
      const membersListData = buildMembersListPayload(snapshot);
      const answer = `👥 Danh sách ${membersListData.members.length} thành viên đội ngũ DevOps & SRE.`;
      return logAndRespond({ answer, membersListData }, true);
    }

    // 5i. PROJECTS-CARD: structured projects list card
    if (derivedCommand === "/projects" || (!derivedCommand && PROJECTS_QUERY_PATTERN.test(effectiveQuery))) {
      const projectsListData = buildProjectsListPayload(snapshot);
      const answer = `Danh sách các dự án hiện có (${projectsListData.projects.length} dự án).`;
      return logAndRespond({ answer, projectsListData }, true);
    }

    // 5j. HELP-CARD: structured help and slash commands guide card
    if (derivedCommand === "/help" || (!derivedCommand && HELP_QUERY_PATTERN.test(effectiveQuery))) {
      const helpData = buildHelpPayload();
      const answer = `💡 Hướng dẫn sử dụng DevOps AI Assistant & Hệ thống Slash Commands.`;
      return logAndRespond({ answer, helpData }, true);
    }

    // 4. Standard Q&A flow with grounding
    const answer = await callAiText(
      `${SYSTEM_PROMPT}\n\nDỮ LIỆU THỜI GIAN THỰC (REALTIME DATABASE):\n${JSON.stringify(snapshot, null, 2)}`,
      effectiveQuery,
      provider
    );

    return logAndRespond({ answer }, true);
  } catch (error) {
    console.error("answer-query error:", error);
    return NextResponse.json({ error: "Failed to reach AI service" }, { status: 502 });
  }
}

