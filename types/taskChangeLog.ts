export type TaskChangeAction = "create" | "update" | "delete";
export type TaskChangeStatus = "confirmed" | "cancelled";

export interface TaskChangeLog {
  id: string;
  actorUid: string; // AppUser.uid của leader ra lệnh
  actorName: string; // display name, để hiện audit trail không cần join thêm
  action: TaskChangeAction;
  taskId: string | null; // null nếu action="create" và task chưa từng được tạo (bị hủy trước khi tạo)
  taskTitle: string; // snapshot tên task tại thời điểm log, để đọc được kể cả nếu task sau đó bị xóa
  proposedChanges: Record<string, unknown>; // đề xuất AI đưa ra ban đầu
  appliedChanges: Record<string, unknown>; // đúng những gì thực sự ghi (có thể khác nếu leader sửa trước khi xác nhận)
  status: TaskChangeStatus; // "confirmed" = đã ghi vào tasks thật, "cancelled" = leader bấm Hủy
  chatLogId: string; // liên kết ngược sang chatLogs — 1 audit log map đúng 1 chat message gốc
  createdAt: string;
}

export type TaskChangeLogInput = Omit<TaskChangeLog, "id" | "createdAt">;
