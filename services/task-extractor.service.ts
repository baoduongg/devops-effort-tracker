import { callNvidiaText, callNvidiaVision } from "@/services/nvidia.service";
import { formattedEntrySchema } from "@/lib/schemas";
import { getMembers } from "@/services/members.service";
import type { FormattedEntry } from "@/types/chat";

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTaskExtractionSystemPrompt(teamMembersContext = ""): string {
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
3. "effortPercent": Integer number between 0 and 200 (MUST be a whole integer, e.g. 15, 20, 25, 50, 100 - NEVER return decimal values like 12.5).
   - If hours/time are mentioned (e.g. "~1h", "1 tiếng", "1 giờ", "2 giờ", "nửa ngày", "1 ngày"), convert based on an 8-hour working day: 1h ≈ 15%, 2h ≈ 25%, 4h ≈ 50%, 8h/1 ngày ≈ 100%. Always round to whole integer percentages.
   - If a percentage is explicitly mentioned (e.g. "30%"), use that exact integer.
   - Default to 30-50% if unspecified.
4. "assigneeName": The engineer actually doing the work or being assigned / borrowed.
   - Match with known team members if available (e.g. "Dương Bao 98", "Linh Tran", "Huy Nguyen", "Mai Pham").
   - If someone is logging their own work without mentioning another person, return null.
5. "startDate" and "endDate": Strictly YYYY-MM-DD format based on the calendar rules above (e.g. today is ${todayStr}).
6. "status": "planned" | "in_progress" | "done".
   - If user asks to plan a task for future or next week, set "planned".
   - If user asks to create/execute a task now or fix an active issue, set "in_progress".

Return ONLY a single valid JSON object with this exact shape, no markdown, no explanation:
{"title": string, "projectName": string, "effortPercent": integer (0-200), "assigneeName": string | null, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" | null, "status": "planned" | "in_progress" | "done"}`;
}

export function extractJsonFromAiText(raw: string): unknown {
  if (!raw || typeof raw !== "string") return null;

  // 1. Try stripping markdown code block ```json ... ```
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const target = (codeBlockMatch ? codeBlockMatch[1] : raw).trim();

  try {
    const parsed = JSON.parse(target);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
    return parsed;
  } catch {
    // 2. Try regex object match { ... }
    const objMatch = target.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {
        // continue
      }
    }
    // 3. Try regex array match [ ... ]
    const arrMatch = target.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try {
        const arr = JSON.parse(arrMatch[0]);
        return Array.isArray(arr) && arr.length > 0 ? arr[0] : arr;
      } catch {
        // continue
      }
    }
    return null;
  }
}

export async function extractTaskEntryFromInput(
  inputText: string,
  imageUrl?: string | null
): Promise<FormattedEntry | null> {
  let teamMembersContext = "";
  try {
    const members = await getMembers();
    teamMembersContext = members.map((m) => `- ${m.name} (${m.skills.join(", ") || "DevOps"})`).join("\n");
  } catch (err) {
    console.warn("Could not load team members for AI grounding:", err);
  }

  const systemPrompt = getTaskExtractionSystemPrompt(teamMembersContext);

  try {
    const raw = imageUrl
      ? await callNvidiaVision(`${systemPrompt}\n\nIMPORTANT: Return ONLY the JSON object. Do not explain.\nUser note: ${inputText}`, imageUrl)
      : await callNvidiaText(systemPrompt, inputText);

    const jsonCandidate = extractJsonFromAiText(raw);
    let parsed = formattedEntrySchema.safeParse(jsonCandidate);

    if (!parsed.success) {
      console.warn("Initial format-entry parse failed, retrying with text model correction...", raw);
      const retryRaw = await callNvidiaText(
        systemPrompt,
        `The previous response was not valid JSON or was missing fields.\nRaw response: "${raw}"\nOriginal text: "${inputText || "Screenshot analysis"}"\nReturn ONLY the single JSON object starting with { and ending with }.`
      );
      const retryCandidate = extractJsonFromAiText(retryRaw);
      parsed = formattedEntrySchema.safeParse(retryCandidate);
    }

    if (!parsed.success) {
      return null;
    }

    const data = parsed.data;
    data.effortPercent = Math.round(data.effortPercent);
    return data;
  } catch (err) {
    console.error("extractTaskEntryFromInput error:", err);
    return null;
  }
}
