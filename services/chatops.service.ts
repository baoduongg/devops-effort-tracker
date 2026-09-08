interface TaskCreatedNotice {
  title: string;
  memberName: string;
  memberEmail?: string;
  projectName: string;
  link: string;
  creatorName: string;
  endDate?: string | null;
}

function toMention(email?: string): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;
  return `@${local}-${domain}`;
}

export async function notifyTaskCreated(notice: TaskCreatedNotice): Promise<void> {
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

  try {
    const response = await fetch("/api/chatops/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      console.warn(`[ChatOps] notifyTaskCreated failed: ${response.status}`);
    }
  } catch (err) {
    console.warn("[ChatOps] notifyTaskCreated failed", err);
  }
}
