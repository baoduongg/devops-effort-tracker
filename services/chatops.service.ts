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
    `### 🚀 Giao Task Mới Cho Thành Viên`,
    ``,
    `Chào **${mention || notice.memberName}**, bạn vừa được giao một task mới trong hệ thống:`,
    ``,
    `> **📋 Task:** \`${notice.title}\``,
    `> **📁 Dự án:** **${notice.projectName}**`,
    `> **⏰ Hạn chót:** \`${deadline}\``,
    `> **🔗 Chi tiết:** [Xem & Cập nhật Task](${notice.link})`,
    ``,
    `*Cần thêm thông tin hay hỗ trợ gì cứ hú **${notice.creatorName}** liền nha. Chúc bạn một ngày làm việc mượt mà, không bug! 🚀*`,
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
    `### ${icon} Cập Nhật Trạng Thái Task`,
    ``,
    `Task **${notice.title}** vừa được cập nhật trạng thái mới:`,
    ``,
    `> **📁 Dự án:** **${notice.projectName}**`,
    `> **👤 Người thực hiện:** **${mention || notice.memberName}**`,
    `> **🔄 Trạng thái:** \`${oldLabel}\` ➔ **\`${newLabel}\`**`,
    `> **🔗 Chi tiết:** [Xem Task](${notice.link})`,
    ``,
    `*Tiến độ Sprint đã được tự động cập nhật lên Gantt Timeline và Ma Trận Năng Lực.*`,
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
    `### 🔁 Chuyển Giao Người Phụ Trách Task`,
    ``,
    `Task **${notice.title}** đã được điều chuyển nhân sự:`,
    ``,
    `> **📁 Dự án:** **${notice.projectName}**`,
    `> **👤 Chuyển từ:** \`${notice.oldMemberName}\` ➔ **${mention || notice.newMemberName}**`,
    `> **🔗 Chi tiết:** [Xem Task](${notice.link})`,
    ``,
    `*Vui lòng kiểm tra lại kế hoạch và cập nhật effort tương ứng.*`,
  ].join("\n");

  return sendChatOpsMessage(message);
}

interface TaskDeletedNotice {
  title: string;
  memberName: string;
  memberEmail?: string;
  projectName: string;
  deletedByName: string;
}

export function notifyTaskDeleted(notice: TaskDeletedNotice): Promise<void> {
  const mention = toMention(notice.memberEmail);

  const message = [
    `### 🗑️ Task Đã Bị Xóa`,
    ``,
    `Task sau đây đã bị xóa khỏi hệ thống:`,
    ``,
    `> **📋 Task:** \`${notice.title}\``,
    `> **📁 Dự án:** **${notice.projectName}**`,
    `> **👤 Người phụ trách:** **${mention || notice.memberName}**`,
    `> **🧑‍💻 Xóa bởi:** **${notice.deletedByName}**`,
    ``,
    `*Nếu đây không phải chủ ý, vui lòng liên hệ Tech Lead để khôi phục.*`,
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
    `### ⚠️ Cảnh Báo Task Quá Hạn`,
    ``,
    `Phát hiện task quá hạn cần được kiểm tra và xử lý gấp:`,
    ``,
    `> **📋 Task:** \`${notice.title}\``,
    `> **📁 Dự án:** **${notice.projectName}**`,
    `> **👤 Người phụ trách:** **${mention || notice.memberName}**`,
    `> **🚨 Tình trạng:** **Trễ ${notice.overdueDays} ngày** *(Hạn chót: \`${notice.dueDate}\`)*`,
    `> **🔗 Chi tiết:** [Cập nhật tiến độ ngay](${notice.link})`,
    ``,
    `*Vui lòng cập nhật lại tình trạng thực tế hoặc liên hệ Tech Lead để điều chỉnh timeline nếu có blocker.*`,
  ].join("\n");

  return sendChatOpsMessage(message);
}

interface DeployAlarmNotice {
  title: string;
  memberName: string;
  memberEmail?: string;
  projectName: string;
  deployAtLabel: string;
  minutesBefore: number;
  link: string;
}

/** Builds the deploy-alarm ChatOps message. Exported (not sendChatOpsMessage-wrapped) so the
 * server-side alarm cron can post via postToChatOps directly, same as daily-digest does. */
export function buildDeployAlarmMessage(notice: DeployAlarmNotice): string {
  const mention = toMention(notice.memberEmail);

  return [
    `### ⏰ Nhắc Lịch Triển Khai Hạ Tầng`,
    ``,
    `Task sau sắp tới giờ triển khai đã được approve, vui lòng chuẩn bị sẵn sàng:`,
    ``,
    `> **📋 Task:** \`${notice.title}\``,
    `> **📁 Dự án:** **${notice.projectName}**`,
    `> **👤 Người thực hiện:** **${mention || notice.memberName}**`,
    `> **🚀 Giờ triển khai:** \`${notice.deployAtLabel}\` *(còn ${notice.minutesBefore} phút)*`,
    `> **🔗 Chi tiết:** [Xem Task](${notice.link})`,
    ``,
    `*Đảm bảo đã sẵn sàng checklist trước khi triển khai đúng khung giờ đã approve.*`,
  ].join("\n");
}

interface StandaloneAlarmNotice {
  content: string;
  projectName?: string | null;
  memberName: string;
  memberEmail?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  timeLabel: string;
  link: string;
}

/** Builds a standalone-alarm ChatOps message, formatted like buildDeployAlarmMessage. Exported
 * (not sendChatOpsMessage-wrapped) so the server-side alarm cron can post via postToChatOps
 * directly, same as the deploy alarm does. */
export function buildStandaloneAlarmMessage(notice: StandaloneAlarmNotice): string {
  const mention = toMention(notice.memberEmail);
  const supervisorMention = notice.supervisorName ? toMention(notice.supervisorEmail) : null;

  return [
    `### ⏰ Nhắc Alarm`,
    ``,
    `Đến giờ hẹn đã đặt, vui lòng thực hiện:`,
    ``,
    `> **📝 Nội dung:** \`${notice.content}\``,
    ...(notice.projectName ? [`> **📁 Dự án:** **${notice.projectName}**`] : []),
    `> **👤 Người thực hiện:** **${mention || notice.memberName}**`,
    ...(notice.supervisorName
      ? [`> **👁️ Người giám sát:** **${supervisorMention || notice.supervisorName}**`]
      : []),
    `> **🕒 Thời gian:** \`${notice.timeLabel}\``,
    `> **🔗 Chi tiết:** [Xem Alarm](${notice.link})`,
    ``,
    `*Nhắc việc tự động từ hệ thống Alarm.*`,
  ].join("\n");
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
    `### 🔥 Cảnh Báo Quá Tải Năng Lực Kỹ Sư`,
    ``,
    `Phát hiện tải công việc của **${mention || notice.memberName}** vượt quá ngưỡng an toàn (**>8h/ngày**):`,
    ``,
    `> **👤 Nhân sự:** **${mention || notice.memberName}**`,
    `> **📊 Tổng tải hiện tại:** **\`${hours}h\` effort** *(vượt ngưỡng 8h/ngày)*`,
    `> **⚡ Số task active:** **\`${notice.activeTaskCount}\` task** đang chạy song song`,
    `> **🔗 Chi tiết:** [Xem Ma trận Năng Lực](${notice.link})`,
    ``,
    `*Khuyến nghị: Dùng lệnh \`/reassign\` hoặc mở Ma Trận Năng Lực để san sẻ bớt task sang kỹ sư đang rảnh.*`,
  ].join("\n");

  return sendChatOpsMessage(message);
}
