import { callAiText, callAiVision, type AiProvider } from "@/services/ai-provider.service";
import { formattedEntrySchema } from "@/lib/schemas";
import { getMembers, findBestSuitableMember, findMemberByName } from "@/services/members.service";
import { formatEffortDuration } from "@/lib/effort";
import { formatDateLocal, calculateDefaultEndDate } from "@/lib/date";
import type { FormattedEntry } from "@/types/chat";

function formatDate(d: Date): string {
  return formatDateLocal(d);
}

export function getTaskExtractionSystemPrompt(teamMembersContext = "", hasAskerMemberName = false): string {
  const now = new Date();
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayOfWeek = now.getDay();
  const todayStr = formatDate(now);
  const dayName = dayNames[dayOfWeek];

  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() + diffToMonday);
  const thisFriday = new Date(thisMonday);
  thisFriday.setDate(thisMonday.getDate() + 4);

  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);
  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);

  return `You are an expert DevOps Project Management AI. You extract structured DevOps work log entries or task assignment intents from free text, task boards, or chat messages (e.g. assigning tasks, creating tickets, cross-team resource borrowing, incident fixing).

CURRENT CALENDAR REFERENCE:
- Today: ${todayStr} (${dayName})
- This working week (Mon - Fri): ${formatDate(thisMonday)} to ${formatDate(thisFriday)}
- Next working week (Mon - Fri): ${formatDate(nextMonday)} to ${formatDate(nextFriday)}

${teamMembersContext ? `KNOWN DEVOPS TEAM MEMBERS:\n${teamMembersContext}\n` : ""}

EXTRACTION & INFERENCE RULES:
1. "title": Concise, professional summary of the task or incident (e.g. "Hook - Issue AWS", "Setup CI/CD pipeline", "Fix lỗi connect AWS bên service Hook").
2. "projectName": Project or module name (e.g. "Hook", "Core Platform", "EKS Cluster", "Atlas Migration").
3. "effortMinutes": Integer number representing the estimated duration in MINUTES (MUST be an integer, e.g. 15, 30, 45, 60, 90, 120, 240, 480).
   - If minutes are mentioned (e.g. "15 phút", "15p", "30 phút", "30p", "45 phút"), extract exact minutes (15, 30, 45).
   - If hours are mentioned (e.g. "1 tiếng", "1 giờ", "1h", "2 tiếng", "2h", "4 tiếng", "4h"), convert to minutes (1h -> 60, 1.5h -> 90, 2h -> 120, 4h -> 240).
   - If days are mentioned (e.g. "nửa ngày", "1 ngày", "2 ngày"), convert based on an 8-hour working day: nửa ngày = 240, 1 ngày = 480, 2 ngày = 960.
   - If a percentage was mentioned (e.g. "50%"), convert based on an 8h day: 15% -> 60, 25% -> 120, 50% -> 240, 100% -> 480.
   - Default to 60 (1 tiếng) if unspecified.
4. "assigneeName": The engineer actually assigned to perform the work or being borrowed.
   - In chat dialogues, Slack/Teams/Zalo screenshots, or cross-team requests:
     * Identify who will execute the task: look for phrases like "mượn [Tên]", "nhờ [Tên]", "giao cho [Tên]", "assign [Tên]", "chú [Tên]", "anh [Tên]", "em [Tên]", "bạn [Tên]", "bác [Tên]", "[Tên] cứu nạn / support / fix / xử lý", "e gấp thì dùng đi" -> The assignee is "[Tên]".
     * Always remove Vietnamese honorific prefixes ("chú", "anh", "chị", "em", "bạn", "bác", "ông") to return the clean name (e.g. "chú Sang" -> "Sang", "anh Huy" -> "Huy", "em Linh" -> "Linh").
     * Ignore people mentioned as absent/off/on leave (e.g. "Tùng off", "nghỉ") — do NOT assign to them.
     * Ignore requesters/managers in the chat headers unless they are doing the work themselves.
   - Match with known team members list if available.
   - ${
     hasAskerMemberName
       ? "If no specific assignee is found or mentioned in the text, return null for \"assigneeName\". Do NOT pick or guess a name yourself — the calling system already knows who is chatting and will default to them."
       : "If no specific assignee is found or mentioned, pick the most suitable engineer from the KNOWN DEVOPS TEAM MEMBERS list whose role is NOT Leader (only pick DevOps engineers), matching skills and availability. NEVER assign to a Leader unless explicitly instructed."
   }
5. "startDate" and "endDate": Strictly YYYY-MM-DD format based on the calendar rules above (e.g. today is ${todayStr}).
   - "startDate": Starting date of the task. Default to ${todayStr} if unspecified.
   - "endDate": Task deadline / completion date.
     * If user explicitly specifies a deadline (e.g. "deadline 15/09", "hạn hoàn thành 2026-09-12", "hạn cuối thứ 6"), extract that exact date in YYYY-MM-DD.
     * If user does NOT mention a deadline: calculate deadline = "startDate" + effort duration:
       - For effort <= 1 working day (effortMinutes <= 480, e.g. 15p, 1h, 2h, 4h, 1 ngày): "endDate" MUST be the SAME as "startDate" (e.g. "${todayStr}").
       - For effort > 1 day (effortMinutes > 480, e.g. 2 ngày -> +1 day, 3 ngày -> +2 days): "endDate" is the completion date taking working days into account.
     * NEVER default "endDate" to 1-2 weeks in the future when effort is only 1 hour or 1 day.
6. "status": "planned" | "in_progress" | "done".
   - If user asks to plan a task for future or next week, set "planned".
   - If user asks to create/execute a task now or fix an active issue/incident, set "in_progress".

Return ONLY a single valid JSON object with this exact shape, no markdown, no explanation:
{"title": string, "projectName": string, "effortMinutes": integer (minutes, e.g. 15, 30, 60, 120, 240, 480), "assigneeName": string | null, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" | null, "status": "planned" | "in_progress" | "done"}`;
}

export function extractJsonFromAiText(raw: string): unknown {
  if (!raw || typeof raw !== "string") return null;

  // 1. Try stripping markdown code block ```json ... ```
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // continue
    }
  }

  // 2. Try parsing raw directly
  try {
    return JSON.parse(raw.trim());
  } catch {
    // continue
  }

  // 3. Find individual JSON objects { ... } (non-greedy or balanced)
  const regex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const matches = raw.match(regex) || raw.match(/\{[\s\S]*?\}/g);
  if (matches) {
    for (const match of matches) {
      try {
        const obj = JSON.parse(match.trim());
        if (obj && typeof obj === "object" && (obj.title || obj.projectName)) {
          return obj;
        }
      } catch {
        // continue
      }
    }
    // Fallback try any parsed match
    for (const match of matches) {
      try {
        const obj = JSON.parse(match.trim());
        if (obj && typeof obj === "object") return obj;
      } catch {
        // continue
      }
    }
  }

  // 4. Try greedy match as last resort
  const greedyMatch = raw.match(/\{[\s\S]*\}/);
  if (greedyMatch) {
    try {
      return JSON.parse(greedyMatch[0].trim());
    } catch {
      // continue
    }
  }

  return null;
}

export interface ExtractTaskResult {
  entry: FormattedEntry;
  notificationMessage?: string | null;
}

export async function extractTaskEntryFromInput(
  inputText: string,
  imageUrl?: string | null,
  provider?: AiProvider | null,
  askerMemberName?: string | null
): Promise<ExtractTaskResult | null> {
  let teamMembersContext = "";
  let allMembers: import("@/types/member").Member[] = [];
  try {
    allMembers = await getMembers();
    teamMembersContext = allMembers
      .map((m) => `- ${m.name} (Role: ${m.role || "devops"}, Skills: ${m.skills.join(", ") || "DevOps"}, Status: ${m.status}, Effort: ${formatEffortDuration(m.effortMinutes)})`)
      .join("\n");
  } catch (err) {
    console.warn("Could not load team members for AI grounding:", err);
  }

  // ISSUE-18: when askerMemberName is known (devops self-logging), the AI must not hallucinate an
  // assignee — leave it null so the askerMemberName fallback below actually runs. Auto-suggestion
  // stays enabled for the leader-create branch (no askerMemberName, F-06).
  const systemPrompt = getTaskExtractionSystemPrompt(teamMembersContext, Boolean(askerMemberName));

  try {
    const visionPrompt = `${systemPrompt}

SCREENSHOT ANALYSIS INSTRUCTIONS:
Carefully inspect all text, messages, timestamps, and usernames in this screenshot from top to bottom.
- Extract the core task/incident (e.g. "Fix lỗi connect AWS bên service Hook").
- Extract the project name (e.g. "Hook").
- Extract the assigned engineer for assigneeName (e.g. "Sang", after stripping Vietnamese prefixes like "chú", "anh", etc. Ignore people who are off/absent like "Tùng off", and ignore managers/requesters in the headers).
- Extract effort / duration in minutes (e.g. 15p -> 15, 30m -> 30, 1h -> 60, 2h -> 120, 1 ngày -> 480).
- Set status to "in_progress" for immediate bug/incident fixes or "planned" for future tasks.

${inputText ? `Additional user note: ${inputText}\n` : ""}Return ONLY the JSON object.`;

    const raw = imageUrl
      ? await callAiVision(visionPrompt, imageUrl, provider)
      : await callAiText(systemPrompt, inputText, provider);

    const jsonCandidate = extractJsonFromAiText(raw);
    let parsed = formattedEntrySchema.safeParse(jsonCandidate);

    if (!parsed.success) {
      console.warn("Initial format-entry parse failed, retrying with text model correction...", raw);
      const retryRaw = await callAiText(
        systemPrompt,
        `The previous response was not valid JSON or was missing fields.\nRaw response: "${raw}"\nOriginal text: "${inputText || "Screenshot analysis"}"\nReturn ONLY the single JSON object starting with { and ending with }.`,
        provider
      );
      const retryCandidate = extractJsonFromAiText(retryRaw);
      parsed = formattedEntrySchema.safeParse(retryCandidate);
    }

    if (!parsed.success) {
      return null;
    }

    const data = parsed.data;
    data.effortMinutes = Math.max(1, Math.round(data.effortMinutes || 60));

    if (!data.startDate) {
      data.startDate = formatDateLocal(new Date());
    }

    if (!data.endDate) {
      data.endDate = calculateDefaultEndDate(data.startDate, data.effortMinutes);
    }

    if (data.assigneeName) {
      data.assigneeName = data.assigneeName
        .replace(/^(chú|anh|chị|em|bạn|bác|ông|thầy)\s+/i, "")
        .replace(/\s+(cứu nạn|support|fix|xử lý|làm)$/i, "")
        .trim();
    }

    let notificationMessage: string | null = null;
    const rawAssignee = data.assigneeName;

    // CHECK IF ASSIGNEE IS IN MEMBER LIST:
    if (allMembers.length > 0) {
      if (rawAssignee) {
        const matched = findMemberByName(allMembers, rawAssignee);
        if (matched) {
          // Confirmed member in the team
          data.assigneeName = matched.name;
        } else {
          // Specified person was not found in team members (e.g. "Sang" is not in team members)
          const suitable = findBestSuitableMember(allMembers, data.title, data.projectName);
          if (suitable) {
            data.assigneeName = suitable.name;
            const skillsStr = suitable.skills && suitable.skills.length > 0 ? suitable.skills.join(", ") : "DevOps";
            const note = `Không tìm thấy nhân sự "${rawAssignee}" trong danh sách thành viên. Hệ thống tự động đề xuất ${suitable.name} (Kỹ năng: ${skillsStr}, Trạng thái: ${suitable.status}).`;
            data.suggestionNote = note;
            notificationMessage = `⚠️ **Lưu ý nhân sự:** Không tìm thấy thành viên **"${rawAssignee}"** trong danh sách đội ngũ hiện tại.\n\n💡 Dựa trên chuyên môn và lịch làm việc, hệ thống đã tự động đề xuất **${suitable.name}** (kỹ năng: ${skillsStr}, trạng thái: ${suitable.status}) phụ trách công việc này.\n\n👉 Bạn có thể bấm **Chỉnh sửa** trên thẻ bên dưới nếu muốn đổi người khác trước khi **Xác nhận**.`;
          } else {
            data.assigneeName = null;
            notificationMessage = `⚠️ **Lưu ý:** Không tìm thấy nhân sự **"${rawAssignee}"** trong danh sách thành viên. Vui lòng bấm **Chỉnh sửa** để chọn người thực hiện.`;
          }
        }
      } else if (askerMemberName) {
        // F-12/ISSUE-16: devops self-logging (format-entry) with no assignee mentioned defaults to
        // the person actually chatting, not a skill-based auto-suggestion across the whole team —
        // findBestSuitableMember stays reserved for the leader/answer-query create branch (F-06),
        // which still calls this function without an askerMemberName.
        const self = findMemberByName(allMembers, askerMemberName);
        if (self) {
          data.assigneeName = self.name;
        } else {
          data.assigneeName = askerMemberName;
        }
      } else {
        // No assignee specified in input, and no asker identity known (e.g. leader create branch)
        // -> auto-suggest best available member (unchanged, F-06).
        const suitable = findBestSuitableMember(allMembers, data.title, data.projectName);
        if (suitable) {
          data.assigneeName = suitable.name;
          const skillsStr = suitable.skills && suitable.skills.length > 0 ? suitable.skills.join(", ") : "DevOps";
          data.suggestionNote = `Tự động phân công cho ${suitable.name} dựa trên độ phù hợp kỹ năng.`;
          notificationMessage = `💡 Tự động phân công cho **${suitable.name}** (kỹ năng: ${skillsStr}, trạng thái: ${suitable.status}) phù hợp nhất với task này.`;
        }
      }
    }

    return { entry: data, notificationMessage };
  } catch (err) {
    console.error("extractTaskEntryFromInput error:", err);
    return null;
  }
}
