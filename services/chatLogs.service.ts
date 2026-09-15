import { collection, doc, addDoc, updateDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString } from "@/lib/date";
import type {
  ChatLog,
  ChatMessage,
  ChatMode,
  FormattedEntry,
  AiResponsePayload,
  TaskChangeProposal,
  ClarificationRequest,
  MemberAvailability,
} from "@/types/chat";

import { deriveSlashCommandFromText } from "@/lib/slash-commands";

const chatLogsCol = collection(db, "chatLogs");

export async function getChatLogsByThread(threadId: string): Promise<ChatLog[]> {
  // Sorted client-side (not orderBy in the query) to avoid requiring a composite Firestore index
  // for the threadId + createdAt combination.
  const q = query(chatLogsCol, where("threadId", "==", threadId));
  const snapshot = await getDocs(q);
  const logs = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      memberId: data.memberId,
      mode: data.mode,
      threadId: data.threadId,
      rawInput: data.rawInput,
      imageUrl: data.imageUrl,
      aiResponse: data.aiResponse,
      confirmed: data.confirmed,
      createdAt: toIsoString(data.createdAt),
    } satisfies ChatLog;
  });
  return logs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

interface CreateChatLogInput {
  memberId: string;
  mode: ChatMode;
  threadId: string;
  rawInput: string | null;
  imageUrl: string | null;
  aiResponse: AiResponsePayload;
  confirmed: boolean;
}

export async function createChatLog(input: CreateChatLogInput): Promise<string> {
  const ref = await addDoc(chatLogsCol, { ...input, createdAt: Timestamp.now() });
  return ref.id;
}

export async function confirmChatLog(id: string): Promise<void> {
  await updateDoc(doc(db, "chatLogs", id), { confirmed: true });
}

export function chatLogsToMessages(logs: ChatLog[]): ChatMessage[] {
  return logs.flatMap((log): ChatMessage[] => {
    const raw = log.rawInput?.trim() || "";
    const detectedCmd = deriveSlashCommandFromText(raw);

    const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
    const timeStr = !isNaN(logDate.getTime())
      ? logDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      : undefined;

    const userMessage: ChatMessage = {
      role: "user",
      id: `${log.id}-user`,
      text: log.rawInput,
      imageUrl: log.imageUrl,
      command: detectedCmd,
      senderName: log.mode === "leader" ? "Tech Lead" : "DevOps Engineer",
      time: timeStr,
    };

    const messages: ChatMessage[] = [userMessage];
    const resp = log.aiResponse as Record<string, unknown>;

    if (resp && typeof resp === "object") {
      if ("proposal" in resp && resp.proposal) {
        if ("answer" in resp && typeof resp.answer === "string" && resp.answer) {
          messages.push({
            role: "ai-answer",
            id: `${log.id}-ai-answer`,
            text: resp.answer,
          });
        }
        messages.push({
          role: "ai-proposal",
          id: `${log.id}-ai-proposal`,
          chatLogId: log.id,
          proposal: resp.proposal as TaskChangeProposal,
          confirmed: log.confirmed,
        });
      } else if ("clarification" in resp && resp.clarification) {
        messages.push({
          role: "ai-clarification",
          id: `${log.id}-ai-clarification`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          clarification: resp.clarification as ClarificationRequest,
        });
      } else if ("entry" in resp && resp.entry) {
        if ("answer" in resp && typeof resp.answer === "string" && resp.answer) {
          messages.push({
            role: "ai-answer",
            id: `${log.id}-ai-answer`,
            text: resp.answer,
          });
        }
        messages.push({
          role: "ai-entry",
          id: `${log.id}-ai-entry`,
          chatLogId: log.id,
          entry: resp.entry as FormattedEntry,
          confirmed: log.confirmed,
        });
      } else if ("memberAvailability" in resp && resp.memberAvailability) {
        messages.push({
          role: "ai-member-availability",
          id: `${log.id}-ai-availability`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          availability: resp.memberAvailability as MemberAvailability,
        });
      } else if ("taskList" in resp && resp.taskList) {
        messages.push({
          role: "ai-task-list",
          id: `${log.id}-ai-task-list`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          taskList: resp.taskList as import("@/types/chat").TaskListPayload,
        });
      } else if ("overloadData" in resp && resp.overloadData) {
        messages.push({
          role: "ai-overload",
          id: `${log.id}-ai-overload`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          overloadData: resp.overloadData as import("@/types/chat").OverloadPayload,
        });
      } else if ("effortData" in resp && resp.effortData) {
        messages.push({
          role: "ai-effort",
          id: `${log.id}-ai-effort`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          effortData: resp.effortData as import("@/types/chat").EffortPayload,
        });
      } else if ("loadData" in resp && resp.loadData) {
        messages.push({
          role: "ai-load",
          id: `${log.id}-ai-load`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          loadData: resp.loadData as import("@/types/chat").LoadPayload,
        });
      } else if ("reportData" in resp && resp.reportData) {
        messages.push({
          role: "ai-report",
          id: `${log.id}-ai-report`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          reportData: resp.reportData as import("@/types/chat").ReportPayload,
        });
      } else if ("overdueData" in resp && resp.overdueData) {
        messages.push({
          role: "ai-overdue",
          id: `${log.id}-ai-overdue`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          overdueData: resp.overdueData as import("@/types/chat").OverduePayload,
        });
      } else if ("membersListData" in resp && resp.membersListData) {
        messages.push({
          role: "ai-members-list",
          id: `${log.id}-ai-members-list`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          membersListData: resp.membersListData as import("@/types/chat").MembersListPayload,
        });
      } else if ("projectsListData" in resp && resp.projectsListData) {
        messages.push({
          role: "ai-projects-list",
          id: `${log.id}-ai-projects-list`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          projectsListData: resp.projectsListData as import("@/types/chat").ProjectsListPayload,
        });
      } else if ("helpData" in resp && resp.helpData) {
        messages.push({
          role: "ai-help",
          id: `${log.id}-ai-help`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          helpData: resp.helpData as import("@/types/chat").HelpPayload,
        });
      } else if ("memberInfoData" in resp && resp.memberInfoData) {
        messages.push({
          role: "ai-member-info",
          id: `${log.id}-ai-member-info`,
          text: typeof resp.answer === "string" ? resp.answer : "",
          memberInfoData: resp.memberInfoData as import("@/types/chat").MemberInfoPayload,
        });
      } else if ("answer" in resp && typeof resp.answer === "string") {
        messages.push({
          role: "ai-answer",
          id: `${log.id}-ai`,
          text: resp.answer,
        });
      } else if ("title" in resp && "projectName" in resp) {
        messages.push({
          role: "ai-entry",
          id: `${log.id}-ai`,
          chatLogId: log.id,
          entry: resp as unknown as FormattedEntry,
          confirmed: log.confirmed,
        });
      }
    }

    return messages;
  });
}
