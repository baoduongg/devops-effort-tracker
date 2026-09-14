export async function sendChatOpsMessage(message: string): Promise<void> {
  try {
    const response = await fetch("/api/chatops/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      console.warn(`[ChatOps] send failed: ${response.status}`);
    }
  } catch (err) {
    console.warn("[ChatOps] send failed", err);
  }
}

export function toMention(email?: string): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;
  return `@${local}-${domain}`;
}

interface TaskCreatedNotice {
  title: string;
  memberName: string;
  memberEmail?: string;
  projectName: string;
  link: string;
  creatorName: string;
  endDate?: string | null;
}

export function notifyTaskCreated(notice: TaskCreatedNotice): Promise<void> {
  const mention = toMention(notice.memberEmail);
  const deadline = notice.endDate ?? "Chưa xác định";

  const message = [
    `Chào ${mention || notice.memberName}, bạn vừa được giao một task mới:`,
    ``,
    `Task: ${notice.title}`,
    ``,
    `Dự án: ${notice.projectName}`,
    ``,
    `Hạn chót: ${deadline}`,
    ``,
    `Chi tiết: [Link](${notice.link})`,
    ``,
    `Cần thêm thông tin hay hỗ trợ gì cứ hú ${notice.creatorName} liền nha. Chúc bạn một ngày làm việc mượt mà, không bug! 🚀`,
  ].join("\n");

  return sendChatOpsMessage(message);
}

interface TaskStatusChangedNotice {
  title: string;
  memberName: string;
  memberEmail?: string;
  projectName: string;
  oldStatus: string;
  newStatus: string;
  link: string;
}

const STATUS_LABELS: Record<string, string> = {
  planned: "Kế hoạch",
  in_progress: "Đang thực hiện",
  done: "Hoàn thành",
};

export function notifyTaskStatusChanged(notice: TaskStatusChangedNotice): Promise<void> {
  const mention = toMention(notice.memberEmail);
  const oldLabel = STATUS_LABELS[notice.oldStatus] ?? notice.oldStatus;
  const newLabel = STATUS_LABELS[notice.newStatus] ?? notice.newStatus;
  const icon = notice.newStatus === "done" ? "✅" : "🔄";

  const message = [
    `${icon} Task đổi trạng thái: ${notice.title}`,
    ``,
    `Dự án: ${notice.projectName}`,
    `Người thực hiện: ${mention || notice.memberName}`,
    `Trạng thái: ${oldLabel} → ${newLabel}`,
    ``,
    `Chi tiết: [Link](${notice.link})`,
  ].join("\n");

  return sendChatOpsMessage(message);
}

interface TaskReassignedNotice {
  title: string;
  projectName: string;
  oldMemberName: string;
  newMemberName: string;
  newMemberEmail?: string;
  link: string;
}

export function notifyTaskReassigned(notice: TaskReassignedNotice): Promise<void> {
  const mention = toMention(notice.newMemberEmail);

  const message = [
    `🔁 Task được chuyển người thực hiện: ${notice.title}`,
    ``,
    `Dự án: ${notice.projectName}`,
    `Từ: ${notice.oldMemberName} → Đến: ${mention || notice.newMemberName}`,
    ``,
    `Chi tiết: [Link](${notice.link})`,
  ].join("\n");

  return sendChatOpsMessage(message);
}

interface TaskOverdueNotice {
  title: string;
  memberName: string;
  memberEmail?: string;
  projectName: string;
  overdueDays: number;
  dueDate: string;
  link: string;
}

export function notifyTaskOverdue(notice: TaskOverdueNotice): Promise<void> {
  const mention = toMention(notice.memberEmail);

  const message = [
    `⚠️ Task quá hạn: ${notice.title}`,
    ``,
    `Dự án: ${notice.projectName}`,
    `Người thực hiện: ${mention || notice.memberName}`,
    `Trễ ${notice.overdueDays} ngày (hạn ${notice.dueDate})`,
    ``,
    `Chi tiết: [Link](${notice.link})`,
  ].join("\n");

  return sendChatOpsMessage(message);
}

interface MemberOverloadedNotice {
  memberName: string;
  memberEmail?: string;
  effortMinutes: number;
  activeTaskCount: number;
  link: string;
}

export function notifyMemberOverloaded(notice: MemberOverloadedNotice): Promise<void> {
  const mention = toMention(notice.memberEmail);
  const hours = (notice.effortMinutes / 60).toFixed(1);

  const message = [
    `🔥 Cảnh báo quá tải: ${mention || notice.memberName}`,
    ``,
    `Đang có ${notice.activeTaskCount} task active, tổng ${hours}h effort (>8h/ngày).`,
    ``,
    `Chi tiết: [Link](${notice.link})`,
  ].join("\n");

  return sendChatOpsMessage(message);
}
