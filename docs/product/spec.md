# Spec — rev 2 (2026-09-09)

> Rev 2 là bản vá cho 2 bug P0 (blocker) mà PM phát hiện khi test qua UI thật bằng account leader thật (`admin@test.com`), ghi trong `docs/product/feedback.md` (block "lần 3 — REGRESSION nghiêm trọng"): **FB-CHAT-01** (leader thật bị chặn nhầm như devops khi ra lệnh giao/sửa/xóa task qua chat) và **FB-CHAT-02** (devops hỏi việc của chính mình ở tab Log/Plan bị hiểu nhầm thành lệnh tạo task, bịa nội dung + gán nhầm người — biến thể nặng hơn của ISSUE-14 cũ). Chỉ sửa/bổ sung phần liên quan tới 2 FB này, đánh dấu `(rev 2)` tại các mục thay đổi; phần còn lại của spec giữ nguyên nội dung rev 1 bên dưới.

## rev 1 (2026-09-09)

> Feature mới: "Chat AI: Ra lệnh quản lý team bằng ngôn ngữ tự nhiên" (`docs/product/requirements.md`). Rev này **ghi đè hoàn toàn** nội dung spec.md cũ (Overdue Task Alerts) — feature đó đã xong, không liên quan nữa, không giữ lại làm lịch sử trong file này (xem git history nếu cần tra cứu).

## Tổng quan

App hiện có chat AI với 2 luồng: `format-entry` (devops tự ghi log việc mình làm bằng ngôn ngữ tự nhiên/ảnh chụp màn hình) và `answer-query` (tra cứu dữ liệu thật qua `GroundingSnapshot`). Cả hai đã dùng chung một cơ chế "đề xuất → xác nhận" cho việc *tạo* task: AI trả JSON đề xuất, `EntryCard` hiển thị, `chatLogId` được ghi ngay với `confirmed: false`, và chỉ khi user bấm **Xác nhận** trên `EntryCard` thì `chat-box.tsx` mới thật sự gọi `createTask` + `updateMember` (client-side) và lật `confirmed: true` trên `chatLogs`.

Rev 1 mở rộng cơ chế đề xuất/xác nhận đã có sang 2 hành động mới trên task đã tồn tại — **sửa** và **xóa** — và bổ sung một bước **intent classification** rõ ràng trước khi vào các nhánh: hỏi thường / tạo task / sửa task / xóa task, để phân biệt lệnh thay đổi dữ liệu với câu hỏi tra cứu ngay từ đầu, thay vì chỉ có một nhánh `isTaskCreationIntent` như hiện tại. Đối tượng dùng: Leader (được phép thêm/sửa/xóa task + tra cứu toàn team) và Devops (chỉ tự ghi log + tra cứu bản thân, giữ nguyên như hiện tại — không được đổi hành vi).

Nguyên tắc cốt lõi giữ nguyên từ cơ chế đã có: **không có ghi Firestore thật nào xảy ra trước khi user bấm Xác nhận** — áp dụng cho cả sửa và xóa, y hệt cách tạo task đang hoạt động.

## Mô hình dữ liệu

### `types/chat.ts` — mở rộng để biểu diễn đề xuất sửa/xóa

Hiện `FormattedEntry` chỉ mô tả "tạo mới" (không có id task đích). Thêm một union mới cho đề xuất thay đổi, không sửa `FormattedEntry` hiện có (giữ nguyên để không phá vỡ luồng tạo task/format-entry cũ):

```ts
export type ProposedAction = "create" | "update" | "delete";

export interface TaskChangeProposal {
  action: "update" | "delete";
  taskId: string;              // id task Firestore đã xác định rõ ràng (không mơ hồ)
  taskSnapshot: {               // dữ liệu task hiện tại, để UI hiện "trước -> sau"
    title: string;
    projectName: string;
    assigneeName: string | null;
    status: TaskStatus;
    startDate: string;
    endDate: string | null;
    effortMinutes: number;
  };
  changes: Partial<{            // chỉ field được đổi (rỗng cho action "delete")
    title: string;
    projectName: string;
    assigneeName: string | null;
    status: TaskStatus;
    startDate: string;
    endDate: string | null;
    effortMinutes: number;
  }>;
}

// AiResponsePayload mở rộng thêm 2 nhánh, các nhánh cũ giữ nguyên nguyên văn:
export type AiResponsePayload =
  | FormattedEntry
  | { answer: string }
  | { answer?: string; entry: FormattedEntry }
  | { answer?: string; proposal: TaskChangeProposal }        // mới — sửa/xóa task
  | { answer: string; clarification: ClarificationRequest }; // mới — hỏi lại khi thiếu/mơ hồ

export interface ClarificationRequest {
  reason: "missing_field" | "ambiguous_match" | "no_match" | "target_is_leader";
  missingFields?: string[];        // vd ["projectName", "effortMinutes"]
  candidates?: Array<{ id: string; label: string }>; // vd danh sách task/member trùng khớp để chọn
}
```

`ChatMessage` (union hiện có) thêm 1 role mới song song với `ai-entry`:

```ts
| { role: "ai-proposal"; id: string; chatLogId: string; proposal: TaskChangeProposal; confirmed: boolean }
```

Không đổi field nào hiện có trên `FormattedEntry`, `ChatLog`, `Task`, `Member` — đây là diff cộng thêm, thuần túy cho đường dữ liệu sửa/xóa.

### `lib/schemas.ts` — schema zod mới cho biên giới tin cậy AI (sửa/xóa)

Theo đúng quy ước hiện có ("zod chỉ ở biên giới tin cậy AI output", không dùng cho dữ liệu nội bộ đã có type): thêm

```ts
export const taskChangeProposalSchema = z.object({
  action: z.enum(["update", "delete"]),
  taskId: z.string().min(1),
  changes: z.object({
    title: z.string().optional(),
    projectName: z.string().optional(),
    assigneeName: z.string().nullable().optional(),
    status: z.enum(["planned", "in_progress", "done"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().nullable().optional(),
    effortMinutes: z.coerce.number().min(1).optional(),
  }).default({}),
});
```

(Giữ `formattedEntrySchema` nguyên vẹn — dùng lại cho nhánh "create", không viết lại.)

### Firestore — collection audit log mới: `taskChangeLogs`

`chatLogs` hiện tại (theo `services/chatLogs.service.ts`) là log **mọi** tương tác AI (kể cả câu hỏi tra cứu thường), khóa theo `memberId` + `mode`, dùng để dựng lại lịch sử hội thoại hiển thị trong UI (`chatLogsToMessages`). Dùng chung field này cho audit "ai đổi gì qua chat" sẽ lẫn với log hội thoại thường và không đúng tinh thần yêu cầu ("khác với chatLogs hiện tại... không lẫn với log tự ghi việc hằng ngày").

→ Thêm collection Firestore mới `taskChangeLogs`, service mới `services/taskChangeLogs.service.ts` theo đúng pattern service hiện có (module sở hữu duy nhất collection này, `toX()` mapper Timestamp↔ISO):

```ts
// types/taskChangeLog.ts — type mới
export type TaskChangeAction = "create" | "update" | "delete";
export type TaskChangeStatus = "confirmed" | "cancelled";

export interface TaskChangeLog {
  id: string;
  actorUid: string;         // AppUser.uid của leader ra lệnh
  actorName: string;        // display name, để hiện audit trail không cần join thêm
  action: TaskChangeAction;
  taskId: string | null;    // null nếu action="create" và task chưa từng được tạo (bị hủy trước khi tạo)
  taskTitle: string;        // snapshot tên task tại thời điểm log, để đọc được kể cả nếu task sau đó bị xóa
  proposedChanges: Record<string, unknown>; // đề xuất AI đưa ra ban đầu
  appliedChanges: Record<string, unknown>;  // đúng những gì thực sự ghi (có thể khác nếu leader sửa trước khi xác nhận)
  status: TaskChangeStatus; // "confirmed" = đã ghi vào tasks thật, "cancelled" = leader bấm Hủy
  chatLogId: string;        // liên kết ngược sang chatLogs — 1 audit log map đúng 1 chat message gốc
  createdAt: string;
}
```

Ghi 1 bản ghi `taskChangeLogs` cho **mọi** đề xuất create/update/delete task qua chat, dù được xác nhận hay hủy (đúng yêu cầu "mỗi lần một đề xuất... được xác nhận (hoặc bị hủy) đều phải để lại dấu vết"). Đây cũng là nơi trả lời câu hỏi tra cứu mới "vừa nãy tôi đã đổi/xóa task gì qua chat" (không cần thêm UI riêng — xem F-08).

### `services/tasks.service.ts` — thêm hàm còn thiếu

Hiện chưa có hàm xóa task. Thêm `deleteTask(id: string): Promise<void>` (dùng `deleteDoc`, theo đúng pattern `deleteMember` đã có trong `members.service.ts`). `updateTask` đã tồn tại, dùng lại nguyên trạng cho nhánh sửa — không viết lại.

## Luồng dữ liệu mới

### 1. Intent classification (mở rộng `lib/intent.ts`)

Route `answer-query` hiện chỉ có 1 nhánh rẽ nhị phân: `isTaskCreationIntent()` → tạo, else → hỏi/tra cứu. Thêm 2 hàm phân loại mới cùng file, theo đúng phong cách heuristic regex đã có (không đổi sang gọi AI để phân loại — giữ chi phí thấp, nhất quán với cách làm hiện tại):

- `isTaskUpdateIntent(text)`: nhận diện các câu bắt đầu bằng "sửa/đổi/cập nhật/chuyển ... task/trạng thái/ngày/người phụ trách".
- `isTaskDeleteIntent(text)`: nhận diện "xóa/hủy/bỏ task...".

Thứ tự kiểm tra trong route handler: `isTaskDeleteIntent` → `isTaskUpdateIntent` → `isTaskCreationIntent` (giữ nguyên logic cũ) → còn lại rơi vào nhánh Q&A hiện có (member-query detection + `callNvidiaText` với `GroundingSnapshot`). Đây là nơi duy nhất cần đọc role để chặn devops (xem mục Phân quyền).

### 2. Extraction thành đề xuất có cấu trúc

Thêm `services/task-mutation-extractor.service.ts` (song song với `task-extractor.service.ts` hiện có cho nhánh "create" — không sửa file đó, chỉ thêm file mới cho update/delete vì prompt và schema đích khác hẳn):

- Input: câu lệnh tự nhiên + `GroundingSnapshot`/danh sách task thật của member được nhắc tới (cần load task theo tên member/tên task để đối chiếu — dùng lại `getAllTasks()` + `findMemberByName()` đã có, không viết lại matching logic).
- Gọi `callNvidiaText` (tái dùng `nvidia.service.ts` nguyên trạng — không thêm client NVIDIA mới) với system prompt riêng cho update/delete, yêu cầu model trả JSON theo `taskChangeProposalSchema`.
- Validate bằng `taskChangeProposalSchema`, retry 1 lần với corrective prompt — đúng pattern retry đã có trong `extractTaskEntryFromInput`.
- **Trước khi gọi AI**, hàm phải tự resolve "task nào" bằng matching cứng trên dữ liệu thật (tên member + từ khóa trong tiêu đề task), **không giao việc chọn task cho AI đoán id**:
  - 0 kết quả khớp → trả `ClarificationRequest{reason: "no_match"}`.
  - ≥ 2 kết quả khớp → trả `ClarificationRequest{reason: "ambiguous_match", candidates: [...]}` (liệt kê task trùng, kèm project/ngày để phân biệt).
  - Đúng 1 kết quả → mới đưa `taskId` đó cho bước AI extract phần "changes" (sửa gì) hoặc xác nhận "delete".
- Nếu lệnh thiếu trường bắt buộc (sửa: không rõ đổi gì; tạo: thiếu project/effort — logic đã có ở `extractTaskEntryFromInput`, giữ nguyên) → trả `ClarificationRequest{reason: "missing_field", missingFields: [...]}`, không tự set giá trị mặc định.
- Nếu member được nhắc đến (đối tượng nhận task khi tạo/sửa) có `role === "leader"` → trả `ClarificationRequest{reason: "target_is_leader"}`, kèm gợi ý danh sách member `role !== "leader"` khả dụng (tái dùng `findBestSuitableMember` để gợi ý, nhưng **không tự gán** — chỉ liệt kê).

### 3. Cơ chế lưu đề xuất tạm — **client-side, không có Firestore doc "pending" riêng**

Quyết định kỹ thuật quan trọng nhất, giữ nguyên đúng cơ chế đã chứng minh hoạt động cho luồng tạo task hiện tại (không phát minh cơ chế mới cho update/delete):

- Route handler trả `proposal` (hoặc `clarification`) trong response JSON — **không ghi gì vào `tasks`/`members`**.
- Route handler ghi 1 `chatLogs` doc ngay lập tức với `confirmed: false` và `aiResponse: { answer, proposal }` — đúng pattern `format-entry`/nhánh create trong `answer-query` đang làm (ghi log trước, áp dụng sau).
- Đề xuất "đang chờ xác nhận" **tồn tại dưới dạng**: (a) message trong `useChatStore` (Zustand, client-only, mất khi refresh) render bởi `EntryCard`-tương-đương mới (xem `ProposalCard` ở phần Màn hình), và (b) `chatLogs` doc `confirmed:false` làm nguồn phục hồi lại khi load lại lịch sử chat (`getChatLogsByMember` + `chatLogsToMessages` — cần mở rộng hàm này để dựng lại message `ai-proposal` từ `aiResponse.proposal`, tương tự nhánh `ai-entry` đã có).
- Khi user bấm **Xác nhận** trên `ProposalCard`: client gọi thẳng `updateTask(taskId, changes)` hoặc `deleteTask(taskId)` (Firestore ghi trực tiếp từ client, đúng y như `handleConfirmEntry` hiện tại gọi `createTask`/`updateMember` — không thêm route handler `/api/ai/apply-*` mới, vì bảo mật ghi Firestore ở app này vốn không phân biệt client/server, xem `firestore.rules` dev-only permissive), sau đó `confirmChatLog(chatLogId)` + ghi `taskChangeLogs` với `status:"confirmed"` và `appliedChanges` = đúng bản đã sửa (nếu user Edit trước khi xác nhận) chứ không phải bản AI đề xuất ban đầu.
- Khi user bấm **Hủy**: không ghi gì vào `tasks`, chỉ ghi `taskChangeLogs` với `status:"cancelled"`, `appliedChanges: {}`. `chatLogs.confirmed` giữ `false` (đã đúng ngữ nghĩa "chưa áp dụng"), thêm hiển thị "Đã hủy" trên `ProposalCard` (client-state, không cần field Firestore mới trên `chatLogs` — dùng flag cục bộ tương tự cách `EntryCard` phân biệt `editing`/`submitting`).

→ **Không tạo collection Firestore "pending change" riêng.** Lý do (ponytail): mọi state "pending" hiện tại của app (task chưa xác nhận) đã sống trong `chatLogs.confirmed=false` + client Zustand store, không có bảng trung gian nào khác kể cả cho luồng tạo task vốn rủi ro tương tự; thêm 1 collection mới chỉ để giữ "trạng thái chờ" là trùng lặp state đã có sẵn ở 2 nơi kia, tăng nguy cơ lệch dữ liệu (Firestore pending doc vs. chatLogs vs. client state) mà không giải quyết thêm rủi ro nghiệp vụ nào — `chatLogs` + `taskChangeLogs` (mới, cho audit) đã đủ để trả lời "ai đổi gì, khi nào, có xác nhận không".

### Tái sử dụng vs. thêm mới — tóm tắt

| | Tái dùng nguyên trạng | Thêm mới |
|---|---|---|
| Route handler | `app/api/ai/format-entry/route.ts` (không đổi) | Không thêm route mới — mở rộng trực tiếp `app/api/ai/answer-query/route.ts` với 2 nhánh rẽ mới (update/delete) trước nhánh Q&A hiện có, cùng vị trí nhánh "create" đang có sẵn ở đó |
| nvidia.service.ts | `callNvidiaText` nguyên trạng | không |
| grounding.service.ts | `buildGroundingSnapshot()` nguyên trạng, dùng cho Q&A mở rộng (F-06/F-07) | thêm field tính sẵn `overdueTasks`, `freeMembers`/`overloadedMembers` vào `GroundingSnapshot` để trả lời nhanh, chính xác, không dựa AI tự suy luận từ danh sách thô (xem F-06) |
| chatLogs.service.ts | `createChatLog`, `confirmChatLog`, `getChatLogsByMember` nguyên trạng | mở rộng `chatLogsToMessages` để dựng thêm message `ai-proposal` và `ai-clarification` |
| lib/intent.ts | `isTaskCreationIntent`, `isInformationalQuery` nguyên trạng | thêm `isTaskUpdateIntent`, `isTaskDeleteIntent` |
| lib/schemas.ts | `formattedEntrySchema` nguyên trạng | thêm `taskChangeProposalSchema` |
| tasks.service.ts | `updateTask`, `getAllTasks` nguyên trạng | thêm `deleteTask` |
| task-extractor.service.ts | nguyên trạng, dùng cho nhánh create | thêm file mới `task-mutation-extractor.service.ts` cho update/delete (prompt/schema khác hẳn, không nhồi chung 1 file) |
| Component chat | `EntryCard`, `ChatThread`, `MessageBubble`, `ModeToggle` nguyên trạng | thêm `ProposalCard` (component mới, cạnh `EntryCard`) cho update/delete; thêm nhánh render `ClarificationRequest` trong `ChatThread`/`MessageBubble` (dùng lại `Card`/`Token`/`Button` Astryx sẵn có, không thêm thư viện UI) |
| Audit log | — | collection Firestore mới `taskChangeLogs` + `services/taskChangeLogs.service.ts` + `types/taskChangeLog.ts` |

## Phân quyền leader/devops — xác minh qua code, không đoán

Field role thật: `AppUser.role` (`types/user.ts`, giá trị `"leader" | "devops"`), đồng bộ vào `useAuthStore` (`store/auth.store.ts`). Hiện tại **role chỉ được dùng ở client** (`chat-box.tsx` dòng ~170: `if (user?.role... ) setMode(user.role)`) để tự động chọn `ModeToggle`, và `mode` (`"devops" | "leader"`, `types/chat.ts`) được gửi thẳng lên route handler qua body request — **route handler hiện tại (`answer-query`, `format-entry`) không tự đọc/verify role phía server, chỉ tin `mode`/`memberId` do client gửi lên**. Đây là lỗ hổng có sẵn từ trước rev này (Firestore rules cũng dev-only permissive theo AGENTS.md) — rev này **không có yêu cầu build full auth middleware**, nhưng bắt buộc phải chặn đúng chỗ để đạt tiêu chí thành công của requirements ("Devops không thể... kể cả qua chat"):

- **Chặn ở route handler `answer-query`** (nơi duy nhất xử lý update/delete/create): ngay khi `isTaskUpdateIntent`/`isTaskDeleteIntent`/`isTaskCreationIntent` = true, kiểm tra `mode !== "leader"` → trả lời từ chối lịch sự (xem AC-02-x), **không gọi extractor, không gọi AI đề xuất, không ghi `taskChangeLogs`**, chỉ ghi 1 `chatLogs` bình thường như câu trả lời từ chối.
- Vì server tin `mode` client gửi lên (giới hạn đã biết, không phải phạm vi sửa của rev này), spec yêu cầu **thêm bước validate nhẹ**: route handler tự tra `getMembers()`/AppUser tương ứng `memberId` gửi lên (nếu có) để đối chiếu `role` thật trong Firestore thay vì chỉ tin `mode` string — dùng lại `getMembers()` đã có, không thêm dependency mới. Nếu không đối chiếu được (vd `memberId` rỗng ở mode leader — trường hợp hiện tại của leader dùng `memberId: "leader"` giả) thì tin `mode` như hiện trạng (không regressed so với luồng cũ, ghi rõ trong "Câu hỏi mở cho PM" bên dưới vì đây là giả định).
- **Không** thêm middleware Next.js hay đổi cấu trúc auth hiện có — ngoài phạm vi rev này, chỉ thêm 1 check role ngay đầu nhánh update/delete/create trong route handler đã có.

### (rev 2) Root cause xác định FB-CHAT-01 — `Member.role` không tồn tại trên doc `members`, khiến `resolveIsLeader()` luôn trả `false` cho leader thật

Đã đọc trực tiếp `services/auth.service.ts#linkOrCreateUser` (dòng 99-115, hàm tự tạo doc `members/<memberId>` lần đầu user đăng nhập) — payload ghi vào `members` chỉ có `name/email/photoURL/skills/status/currentTaskId/effortMinutes/updatedAt`, **không có field `role`**. `role` chỉ được lưu trên `users/<uid>` (`AppUser.role`), không bao giờ đồng bộ sang `members/<memberId>.role`.

`resolveIsLeader()` (`app/api/ai/answer-query/route.ts`, thêm ở rev 1) tra `role` từ đúng doc `members` này:
```ts
const matched = allMembers.find((m) => m.id === memberId);
if (!matched) return mode === "leader";
return matched.role === "leader";   // matched.role luôn undefined -> luôn false
```
Đồng thời `components/chat/chat-box.tsx` (dòng ~358) gửi lên route `memberId: user?.memberId || user?.uid || ...` — với leader thật (`admin@test.com`), `user.memberId` là 1 id thật (`member-<uid>`, luôn truthy) nên **luôn được gửi thay vì literal `"leader"`**. Route nhận `memberId` thật này, tra `members` collection, thấy `matched.role !== "leader"` (vì field không tồn tại) → `isLeader = false` → rơi vào đúng nhánh chặn dành cho devops ở F-02. Đây là lý do bug tái hiện 100% (3/3 lần), không phụ thuộc AI provider hay cách nhập lệnh (template/gõ tay) — lỗi hoàn toàn ở bước resolve role phía server, xảy ra **trước khi** gọi bất kỳ extractor/AI nào.

**Kết luận**: đây là lỗi thiết kế của chính cơ chế "đối chiếu role thật" mà rev 1 thêm vào (mục "Phân quyền leader/devops" ở trên) — ý tưởng đúng (không tin mù `mode` client gửi) nhưng nguồn dữ liệu tra cứu (`members.role`) chưa từng được ghi bởi bất kỳ luồng nào trong hệ thống, nên với **mọi** leader thật (không chỉ `admin@test.com`) check này luôn fail.

## Màn hình

Không có route/trang mới. Toàn bộ thay đổi nằm trong `components/chat/*` (dùng lại trang chat hiện có, route không đổi) và các trang hiển thị dữ liệu thật (`/dashboard`, `/members/[memberId]`) chỉ cần **không đổi gì** vì đã dùng `subscribeAllTasks`/`subscribeMembers` (realtime) — task sau khi `updateTask`/`deleteTask` tự động phản ánh, không cần thêm logic hiển thị.

### S-01 Chat (sửa màn hiện có) — route `/chat` (component `ChatBox`)
- Mục đích: nơi duy nhất Leader vừa hỏi vừa ra lệnh thay đổi task; Devops tiếp tục dùng y như cũ.
- Hiển thị mới trong luồng tin nhắn (`ChatThread`):
  - `ProposalCard` (mới) cho đề xuất sửa/xóa: hiện rõ "Đang định: Sửa/Xóa task **<tên>**", so sánh trước → sau cho từng field đổi (sửa), hoặc cảnh báo rõ "sẽ xóa vĩnh viễn task này" (xóa) kèm tóm tắt task.
  - Thẻ hỏi lại (`ClarificationCard`, dùng `Card` + `Button` liệt kê `candidates` để chọn, hoặc form nhỏ yêu cầu nhập field thiếu) khi `ClarificationRequest`.
  - Thẻ từ chối quyền (Card màu cảnh báo, text rõ lý do "không đủ quyền") khi devops gõ lệnh thay đổi.
- Hành động mới:
  - Trên `ProposalCard`: **Chỉnh sửa** (mở form sửa `changes` trước khi xác nhận — tái dùng input pattern của `EntryCard`: `TextInput`/`Selector`/`DateInput`/`NumberInput`), **Xác nhận** (ghi Firestore thật), **Hủy** (không ghi task, chỉ log cancelled).
  - Trên `ClarificationCard`: chọn 1 trong các `candidates` (bấm vào để điền lại câu lệnh đã bổ sung rõ, hoặc set thẳng `taskId` đã chọn và gọi lại extractor với lựa chọn đó) hoặc gõ tiếp câu trả lời bổ sung field thiếu.
- Trạng thái rỗng/lỗi/loading: giữ nguyên hành vi hiện có của `ChatBox` (spinner "thinking", lỗi 502 hiện `setError` banner) — không đổi cho nhánh Q&A/create cũ; nhánh mới dùng chung cơ chế loading/error đó.

Wireframe text (thẻ đề xuất sửa, dùng lại khung `Card` của `EntryCard`):
```
┌─ Đề xuất: SỬA task ─────────────────────────┐
│ "Deploy service Hook"  (Huy • Dự án Hook)   │
│                                              │
│  Trạng thái:  In Progress → Done            │
│  Ngày kết thúc: 12/09 → 10/09               │
│                                              │
│  [Chỉnh sửa]                [Hủy] [Xác nhận]│
└──────────────────────────────────────────────┘
```

Wireframe text (thẻ hỏi lại khi nhiều task khớp):
```
┌─ Cần bạn xác nhận rõ hơn ───────────────────┐
│ Huy có 3 task chứa từ "deploy":              │
│  ○ Deploy service Hook (Dự án Hook, 12/09)   │
│  ○ Deploy CI/CD staging (Dự án Core, 15/09)  │
│  ○ Deploy Atlas migration (Dự án Atlas, done)│
│  Bạn muốn xóa task nào?                      │
└──────────────────────────────────────────────┘
```

## Tính năng

### F-01 Intent classification thay đổi vs. tra cứu (US-1, US-3, US-4)
- Mô tả: phân loại câu lệnh vào đúng 1 trong 4 nhánh (create/update/delete/query) trước khi xử lý, đảm bảo lệnh thay đổi luôn đi qua bước đề xuất.
- Rule nghiệp vụ: thứ tự kiểm tra `delete` → `update` → `create` → còn lại là `query`; nếu một câu vừa có tín hiệu hỏi vừa có tín hiệu ra lệnh (vd "sửa task X xong cho tôi hỏi luôn ai đang rảnh") thì chỉ xử lý nhánh lệnh thay đổi trong lượt này, phần hỏi thêm không bị xử lý ngầm — ngoài phạm vi rev 1 (xem "Ngoài phạm vi").
- Acceptance criteria:
  - `AC-01-1`: Given leader gõ "sửa task Deploy Hook của Huy sang Done", When gửi, Then hệ thống nhận diện là lệnh sửa, không rơi vào nhánh trả lời câu hỏi/tạo task.
  - `AC-01-2`: Given leader gõ "xóa task Setup CI/CD staging của Nam", When gửi, Then hệ thống nhận diện là lệnh xóa.
  - `AC-01-3`: Given leader gõ "Nam đang làm gì?", When gửi, Then hệ thống vẫn xử lý như câu hỏi tra cứu (nhánh Q&A hiện có), không bị nhánh mới chặn nhầm.

### F-02 Phân quyền thay đổi task chỉ dành cho leader (US must, tiêu chí thành công #2)
- Mô tả: chặn devops thực hiện create/update/delete task qua chat, kể cả task của chính họ.
- Rule nghiệp vụ: field xác định quyền là `AppUser.role` (đồng bộ vào `mode` gửi lên route). `mode !== "leader"` → từ chối toàn bộ 3 hành động thay đổi, không phân biệt "task của chính mình" hay "của người khác".
- Acceptance criteria:
  - `AC-02-1`: Given tài khoản `role="devops"` đang ở mode devops, When gõ "giao task mới cho tôi: fix bug X, dự án Core, 2 tiếng", Then AI từ chối, trả lời nêu rõ lý do "không đủ quyền" (không tạo `chatLogs` proposal, không gọi extractor).
  - `AC-02-2`: Given tài khoản `role="devops"`, When gõ "sửa task của tôi tên Deploy Hook sang Done" (task đó đúng là của chính họ), Then AI vẫn từ chối với lý do không đủ quyền, gợi ý dùng cách ghi log tự nhiên hiện có hoặc nhờ leader.
  - `AC-02-3`: Given tài khoản `role="devops"`, When gõ "xóa task ABC", Then AI từ chối tương tự AC-02-1/02-2, không có task nào bị xóa trên Firestore.
  - `AC-02-4`: Given tài khoản `role="leader"`, When gõ các lệnh tương tự AC-02-1..3, Then không bị chặn, đi tiếp vào luồng đề xuất bình thường.

### F-03 Đề xuất → xác nhận cho thêm task (US-1, US-2 — mở rộng phần "must qua xác nhận" sang phát biểu rõ ràng cho create, tái dùng cơ chế đã có)
- Mô tả: giữ nguyên hành vi hiện có của nhánh "create" trong `answer-query` (đã hoạt động), chỉ bổ sung rule tường minh + AC để QC test được, không đổi code nếu đang đúng.
- Rule nghiệp vụ: `createTask`/`updateMember` chỉ được gọi từ `handleConfirmEntry` sau khi user bấm Xác nhận trên `EntryCard`; trước đó AI không được khẳng định "đã tạo/đã lưu" trong text trả lời (đã có rule này trong `SYSTEM_PROMPT` — giữ nguyên).
- Acceptance criteria:
  - `AC-03-1`: Given leader gõ "giao task Deploy staging cho Huy, dự án Core, 3 tiếng, bắt đầu hôm nay", When AI phản hồi, Then câu trả lời text không chứa khẳng định đã lưu (vd không có "đã gán task vào cơ sở dữ liệu"), và một `ProposalCard`/`EntryCard` xuất hiện ở trạng thái chưa xác nhận.
  - `AC-03-2`: Given thẻ đề xuất ở AC-03-1 đang hiện, When leader bấm **Xác nhận** mà không sửa gì, Then task mới xuất hiện trên `/dashboard` và `/members/<Huy>` ngay (không cần F5) với đúng title/dự án/effort/ngày đã đề xuất, và `taskChangeLogs` có 1 bản ghi `action:"create"`, `status:"confirmed"`.
  - `AC-03-3`: Given thẻ đề xuất đang hiện, When leader bấm **Hủy** (hoặc rời trang không xác nhận), Then không có task nào được tạo trên Firestore, `chatLogs.confirmed` vẫn `false`.

### F-04 Đề xuất → xác nhận cho sửa task (US-3)
- Mô tả: leader đổi trạng thái/ngày/người phụ trách/mô tả một task đã có bằng lời, qua bước đề xuất.
- Rule nghiệp vụ: đề xuất phải xác định đúng 1 `taskId` trước khi đưa AI diễn giải phần thay đổi (xem mục Luồng dữ liệu #2); áp dụng thay đổi bằng `updateTask(taskId, changes)` với đúng `changes` tại thời điểm bấm Xác nhận (có thể đã bị leader sửa tay trên `ProposalCard`).
- Acceptance criteria:
  - `AC-04-1`: Given task "Deploy Hook" của Huy đang `in_progress`, When leader gõ "chuyển task Deploy Hook của Huy sang Done", Then `ProposalCard` hiện đúng before→after (`in_progress` → `done`) cho đúng task đó, chưa có gì đổi trên Firestore.
  - `AC-04-2`: Given `ProposalCard` ở AC-04-1, When leader bấm **Xác nhận**, Then `/members/<Huy>` hiện task này với trạng thái Done ngay lập tức, `taskChangeLogs` ghi `action:"update"`, `appliedChanges:{status:"done"}`, `status:"confirmed"`.
  - `AC-04-3`: Given `ProposalCard` đang hiện đề xuất đổi ngày kết thúc sang 20/09, When leader bấm **Chỉnh sửa** và tự đổi thành 25/09 trước khi bấm **Xác nhận**, Then task được lưu với `endDate = 25/09` (bản leader sửa), không phải 20/09 (bản AI đề xuất ban đầu), và `taskChangeLogs.appliedChanges.endDate = "25/09"` trong khi `proposedChanges.endDate = "20/09"` vẫn giữ nguyên để đối chiếu.
  - `AC-04-4`: Given leader gõ lệnh sửa nhưng không nói rõ đổi field nào (vd chỉ "sửa task Deploy Hook của Huy"), When gửi, Then AI hỏi lại cụ thể muốn đổi gì (trạng thái/ngày/người phụ trách/mô tả), không tự đoán và không tạo `ProposalCard`.

### F-05 Đề xuất → xác nhận cho xóa task (US-4)
- Mô tả: leader xóa một task xác định rõ bằng lời, qua bước đề xuất, có cảnh báo rõ đây là xóa vĩnh viễn.
- Rule nghiệp vụ: chỉ xóa khi đúng 1 task khớp; `deleteTask` (mới thêm vào `tasks.service.ts`) chỉ được gọi sau khi Xác nhận.
- Acceptance criteria:
  - `AC-05-1`: Given Huy chỉ có đúng 1 task tên chứa "hotfix", When leader gõ "xóa task hotfix của Huy", Then `ProposalCard` hiện rõ tên task, dự án, cảnh báo "sẽ xóa vĩnh viễn", chưa xóa gì trên Firestore.
  - `AC-05-2`: Given `ProposalCard` ở AC-05-1, When leader bấm **Xác nhận**, Then task biến mất khỏi `/dashboard` và `/members/<Huy>` ngay lập tức, `taskChangeLogs` ghi `action:"delete"`, `status:"confirmed"`, `taskTitle` = tên task đã xóa (để vẫn đọc được dù `taskId` không còn tồn tại).
  - `AC-05-3`: Given `ProposalCard` xóa đang hiện, When leader bấm **Hủy**, Then task vẫn còn nguyên trên Firestore, `taskChangeLogs` ghi `status:"cancelled"`.

### F-06 Hỏi lại khi thiếu thông tin hoặc đối tượng mơ hồ (US-5, US-10, tiêu chí thành công #3)
- Mô tả: mọi lệnh create/update/delete thiếu trường bắt buộc, hoặc nhắc tới member/task không khớp chính xác 1 kết quả, đều dừng lại hỏi thay vì tự chọn.
- Rule nghiệp vụ:
  - Thiếu trường bắt buộc khi tạo task (không nói dự án, hoặc không nói effort) → hỏi lại, không set mặc định (lưu ý: khác với luồng "create" hiện tại của `task-extractor.service.ts` đang tự set `effortMinutes` mặc định 60 khi model không trích được — rev này giữ nguyên hành vi cũ đó cho format-entry devops tự ghi log, **nhưng** áp dụng rule "phải hỏi lại" mới cho lệnh tạo task do **leader** gõ qua answer-query, vì đây là hành động quản lý cần chính xác cao hơn tự ghi log cá nhân).
  - Member/task nhắc tới không có khớp chính xác nào, hoặc khớp ≥ 2 → liệt kê ứng viên, hỏi chọn lại (dùng `findMemberByName`/matching task theo keyword đã có, không tự chọn "khớp nhất").
- Acceptance criteria:
  - `AC-06-1`: Given leader gõ "giao task fix bug cho Huy, 2 tiếng" (không nói dự án), When gửi, Then AI hỏi lại rõ "thuộc dự án nào?", không tạo `ProposalCard`/`EntryCard` nào, không set project mặc định.
  - `AC-06-2`: Given leader gõ "giao task cho Huy, dự án Core" (không nói effort), When gửi, Then AI hỏi lại effort dự kiến, không tự set 60 phút mặc định.
  - `AC-06-3`: Given Huy có 3 task chứa từ "deploy" (khác project/ngày), When leader gõ "xóa task deploy của Huy", Then AI liệt kê đủ 3 task kèm thông tin phân biệt (dự án, ngày), hỏi chọn đúng cái nào, không tự xóa task nào.
  - `AC-06-4`: Given hệ thống không có member nào tên gần giống "Hoàng" (không tồn tại), When leader gõ "giao task cho Hoàng...", Then AI báo không tìm thấy, liệt kê danh sách member thật hiện có để chọn lại (tái dùng cách hiển thị danh sách đã có ở nhánh Q&A hiện tại — `renderMemberList`).

### F-07 Từ chối gán/sửa task cho tài khoản leader (US-11, tiêu chí thành công #4)
- Mô tả: khi đối tượng nhận task (tạo mới) hoặc đối tượng bị sửa (task của ai đó) là một tài khoản `role="leader"`, từ chối và gợi ý chọn devops.
- Rule nghiệp vụ: check theo `Member.role` (không theo tên hiển thị "leader" trong text) — match member trước, sau đó tra `role` field thật.
- Acceptance criteria:
  - `AC-07-1`: Given "Lan" là member có `role="leader"`, When bất kỳ leader nào (kể cả chính Lan) gõ "giao task Deploy cho Lan, dự án Core, 2 tiếng", Then AI từ chối, giải thích task chỉ giao cho kỹ sư (devops), gợi ý cụ thể tối thiểu 1 devops khác thay thế (không tự gán).
  - `AC-07-2`: Given task "Fix bug X" đang gán cho devops Huy, When leader gõ "đổi người phụ trách task Fix bug X sang Lan (leader)", Then AI từ chối tương tự AC-07-1, không tạo `ProposalCard` đổi assignee sang Lan.

### F-08 Mở rộng answer-query cho câu hỏi quản lý hằng ngày + audit trail (US-6, US-8, US-9, tiêu chí thành công #6/#7)
- Mô tả: bổ sung khả năng trả lời "ai rảnh/quá tải", "task nào trễ", "tiến độ dự án X", "khối lượng việc của Y", trả lời đủ nhiều ý trong 1 câu, từ chối câu ngoài phạm vi, và trả lời được "tôi vừa đổi/xóa gì qua chat" từ `taskChangeLogs`.
- Rule nghiệp vụ:
  - Bổ sung `GroundingSnapshot` (services/grounding.service.ts) các field tính sẵn để AI không tự suy luận: `overdueTasks` (dùng lại `isOverdue()` từ `lib/overdue.ts`, không viết lại điều kiện), `freeMembers`/`busyMembers`/`overloadedMembers` (dựa `Member.status`/`effortMinutes` đã tính sẵn), `projectProgress` (đếm task theo status mỗi project).
  - Câu hỏi audit ("vừa đổi/xóa gì qua chat") không đi qua `callNvidiaText`/AI — trả lời trực tiếp bằng cách đọc `taskChangeLogs` lọc theo `actorUid` (hoặc toàn team nếu leader hỏi chung), sắp theo `createdAt` giảm dần, render thành text liệt kê — để không có rủi ro AI bịa lại lịch sử.
  - Câu hỏi ngoài phạm vi (thời tiết, kiến thức chung) → AI từ chối, không dùng `GroundingSnapshot` để "cố" trả lời — dựa vào rule đã có sẵn trong `SYSTEM_PROMPT` ("chỉ dùng số liệu có trong dữ liệu đính kèm"), bổ sung câu rule tường minh "nếu câu hỏi không liên quan effort/task/team, từ chối lịch sự, không trả lời nội dung ngoài hệ thống".
- Acceptance criteria:
  - `AC-08-1`: Given team có Huy (available), Nam (overloaded > 480 phút in_progress), When leader hỏi "ai đang rảnh, ai đang quá tải?", Then câu trả lời liệt kê đúng Huy vào nhóm rảnh, Nam vào nhóm quá tải, khớp với `Member.status` thật trên Firestore.
  - `AC-08-2`: Given có task `endDate` đã qua và `status != done`, When leader hỏi "có task nào trễ hạn không?", Then câu trả lời liệt kê đúng (các) task đó kèm tên member phụ trách, khớp với `isOverdue()`.
  - `AC-08-3`: Given dự án "Core" có 5 task (2 done, 2 in_progress, 1 planned), When leader hỏi "dự án Core tiến độ tới đâu?", Then câu trả lời nêu đúng số liệu 2/2/1 (không bịa số khác).
  - `AC-08-4`: Given leader hỏi 1 câu gộp "ai đang rảnh và task nào đang trễ?", When gửi, Then câu trả lời có đủ 2 phần (rảnh + trễ hạn), không chỉ trả lời phần đầu rồi bỏ phần sau.
  - `AC-08-5`: Given leader hỏi "thời tiết hôm nay thế nào?", When gửi, Then AI từ chối lịch sự, nêu rõ đây là hệ thống quản lý task/effort, không đưa ra câu trả lời về thời tiết.
  - `AC-08-6`: Given leader vừa xác nhận xóa 1 task và sửa 1 task trong phiên làm việc, When leader hỏi "vừa nãy tôi đã đổi/xóa task gì qua chat?", Then câu trả lời liệt kê đúng cả 2 hành động (task nào, đổi gì, lúc nào) lấy từ `taskChangeLogs`, không thiếu không bịa thêm.

### F-09 Audit log riêng cho hành động thay đổi dữ liệu qua AI (US-8, tiêu chí thành công #5)
- Mô tả: mọi đề xuất create/update/delete (dù xác nhận hay hủy) đều ghi 1 bản ghi `taskChangeLogs`.
- Rule nghiệp vụ: ghi log xảy ra tại đúng 2 thời điểm — (1) khi leader bấm Xác nhận (status "confirmed", sau khi ghi Firestore task thành công), (2) khi leader bấm Hủy (status "cancelled", ngay khi bấm, không chờ gì thêm). Không ghi log ở bước AI đề xuất (tránh log rác nếu leader không phản hồi gì) — khớp đúng câu "mỗi lần một đề xuất... được xác nhận (hoặc bị hủy)".
- Acceptance criteria:
  - `AC-09-1`: Given leader xác nhận 1 lệnh sửa task, When kiểm tra Firestore collection `taskChangeLogs`, Then có đúng 1 bản ghi mới với `actorUid` = uid của leader đó, `action:"update"`, `status:"confirmed"`, `taskId` đúng, `appliedChanges` khớp đúng những gì thực lưu.
  - `AC-09-2`: Given leader bấm Hủy trên 1 đề xuất xóa task, When kiểm tra `taskChangeLogs`, Then có 1 bản ghi `status:"cancelled"`, task tương ứng vẫn còn nguyên trên `tasks`.
  - `AC-09-3`: Given leader chỉ đang xem `ProposalCard` chưa bấm gì (không xác nhận, không hủy, rời trang), Then không có bản ghi `taskChangeLogs` nào được tạo cho lượt đó (tránh log rác) — chỉ `chatLogs.confirmed=false` tồn tại như bình thường.

### F-10 Không phá vỡ luồng cũ (tiêu chí thành công #8)
- Mô tả: mọi thay đổi ở rev này phải là cộng thêm, các luồng cũ hoạt động y hệt trước.
- Rule nghiệp vụ: `format-entry` route không đổi; nhánh "create" hiện có trong `answer-query` (dùng `extractTaskEntryFromInput`) không đổi hành vi khi người gọi là leader hợp lệ và lệnh đầy đủ thông tin — chỉ thêm rule "hỏi lại nếu thiếu" ở lớp trên nó (F-06) chứ không sửa file `task-extractor.service.ts`.
- Acceptance criteria:
  - `AC-10-1`: Given devops gõ log việc tự nhiên như trước ("Fix lỗi connect AWS bên service Hook, 30 phút"), When gửi qua `format-entry` (mode devops), Then hành vi giống hệt trước rev này — `EntryCard` hiện, xác nhận tạo task bình thường, không bị ảnh hưởng bởi các nhánh update/delete mới.
  - `AC-10-2`: Given devops hỏi "task của tôi hôm nay là gì?", When gửi, Then trả lời đúng phạm vi bản thân như hiện tại, không mở rộng sang dữ liệu người khác.
  - `AC-10-3`: Given leader gõ câu hỏi tra cứu cơ bản đã có từ trước ("Bảo đang làm gì?"), When gửi, Then trả lời đúng format chi tiết đã có (Tình trạng tải / Task đang thực hiện / Task kế hoạch / Kết luận), không đổi cấu trúc.

### (rev 2) F-11 Đối chiếu role leader thật không được chặn nhầm (fix FB-CHAT-01, US must, sửa trực tiếp F-02)

- Mô tả: `resolveIsLeader()` (F-02) phải nhận diện đúng leader thật kể cả khi `Member.role` chưa từng được ghi trên doc `members`. Fix ở đúng gốc: bổ sung nơi ghi (`Member`/`AppUser` đồng bộ `role`) thay vì chỉ vá điều kiện đọc, để không tái diễn cho bug tương tự sau này (vd 1 chỗ khác trong app cũng đọc `Member.role` mà không biết field này rỗng).
- Rule nghiệp vụ:
  - `linkOrCreateUser` (`services/auth.service.ts`) khi tạo mới doc `members/<memberId>` phải ghi kèm `role` lấy từ chính `AppUser.role` đang xử lý tại thời điểm đó (không đoán/không mặc định `"devops"` một cách âm thầm cho member có `role="leader"` trên `users`).
  - Cần 1 bước migration/backfill cho các doc `members` đã tồn tại từ trước (tạo trước khi fix) đang thiếu `role` — đối chiếu theo `users` collection (field `memberId` trỏ ngược lại `members.id`), ghi `role` đúng cho từng doc `members` hiện có. Không tự suy luận role từ tên/email.
  - `resolveIsLeader()` giữ nguyên logic đối chiếu (`matched.role === "leader"`), không cần đổi — chỉ cần dữ liệu nguồn (`Member.role`) đúng thì hàm hoạt động đúng như thiết kế ban đầu của rev 1.
  - `chat-box.tsx` tiếp tục gửi `user.memberId` thật lên route như hiện tại (không cần đổi về literal `"leader"`) — vì sau khi `Member.role` được ghi đúng, route tự đối chiếu ra `isLeader = true` mà không cần phân biệt `memberId` là placeholder hay id thật.
- Acceptance criteria:
  - `AC-11-1`: Given tài khoản `admin@test.com` (role leader) đăng nhập lần đầu (doc `members` mới tạo), When kiểm tra Firestore `members/<memberId của admin@test.com>`, Then doc có field `role: "leader"`.
  - `AC-11-2`: Given leader thật `admin@test.com` đăng nhập, vào `/chat`, When gõ nguyên văn "Giao task viết lại tài liệu vận hành cho Dương Bảo thuộc dự án Phoenix CI/CD, effort 1 tiếng, bắt đầu hôm nay" (câu đúng PM đã tái hiện lỗi), Then hệ thống **không** trả lời "Bạn không đủ quyền...", đi tiếp vào luồng đề xuất bình thường (xem F-03), lặp lại 3 lần liên tiếp cho kết quả nhất quán.
  - `AC-11-3`: Given AC-11-2, When thử lại bằng template `/assign` (điền đủ field) thay vì gõ tay, Then kết quả giống hệt AC-11-2 (không bị chặn).
  - `AC-11-4`: Given AC-11-2, When thử lại với cả 2 provider AI (NVIDIA và Claude, đổi qua `ProviderToggle`), Then cả 2 đều không bị chặn.
  - `AC-11-5`: Given doc `members` của 1 leader đã tồn tại từ trước fix (tạo trước khi migration chạy) và đang thiếu `role`, When chạy migration/backfill, Then doc đó được cập nhật đúng `role: "leader"`, và leader đó gõ lệnh giao/sửa/xóa task qua chat không còn bị chặn nhầm.
  - `AC-11-6`: Given tài khoản devops thật (`role="devops"`, `Member.role` đã đúng là `"devops"` sau migration), When gõ lệnh giao/sửa/xóa task qua chat, Then **vẫn bị chặn đúng** như F-02 (không phải regression ngược — leader được cho qua nhưng devops vẫn phải bị chặn).

### (rev 2) F-12 Phân biệt câu hỏi (query) vs lệnh tạo task (mutation) chính xác hơn + luôn gán task tự ghi log cho đúng người đang chat (fix FB-CHAT-02, sửa trực tiếp F-01/F-06, thay thế cách tiếp cận cũ của ISSUE-14)

- Mô tả: 2 vấn đề PM báo cáo tách biệt rõ theo layer xử lý — (a) ở tab Log/Plan (mode devops), câu hỏi tự nhiên không có dấu `?` bị routing gate hiểu nhầm thành log việc cần tạo task mới; (b) `extractTaskEntryFromInput`/`format-entry` không biết ai đang chat nên khi không xác định được assignee, tự động gán cho **bất kỳ** devops rảnh nào (`findBestSuitableMember`) thay vì mặc định gán cho chính người đang gõ.
- Root cause đã xác định qua code (không đoán):
  - `isInformationalQuery()` (`lib/intent.ts`) chỉ nhận diện câu hỏi qua: có dấu `?` cuối câu, hoặc chứa 1 trong các từ khóa nghi vấn cố định (`ra sao/thế nào/bao nhiêu/ở đâu/khi nào/tại sao/báo cáo/tổng hợp/thống kê/danh sách/tra cứu/xem/kiểm tra/tình hình/tiến độ/hướng dẫn/trợ giúp`) hoặc tiểu từ nghi vấn cuối câu (`không/chưa/nhỉ/hả/chăng`). Câu "task của tôi hôm nay là gì" (không có `?`, kết thúc bằng "là gì" — không nằm trong danh sách từ khóa) trả về `false`.
  - `chat-box.tsx` (dòng ~328-331): với `mode === "devops"`, route sang `/api/ai/format-entry` (tạo task) bất cứ khi nào **không phải** `isInformationalQuery` và **không phải** `isTaskUpdateIntent`/`isTaskDeleteIntent` — câu hỏi trên không khớp intent nào trong 3 cái đó nên rơi vào nhánh mặc định "route sang format-entry", y hệt được coi là 1 câu tự ghi log việc.
  - `extractTaskEntryFromInput` (`services/task-extractor.service.ts`) không nhận tham số nào về danh tính người đang chat (`memberId`/tên) — khi AI không trích được `assigneeName` từ câu hỏi (đúng vậy, vì đây không phải câu giao việc), code rơi vào nhánh "No assignee specified... auto-suggest best available member" (dòng 230-239) và gán cho **member phù hợp nhất theo skill/status bất kỳ**, không phải người đang hỏi — đúng như PM quan sát "Assignee: qc1@test.com" dù người hỏi là chính `qc1@test.com` (hoặc người khác đăng nhập).
  - Trên tab Ask, `detectSelfQueryTarget`/pronoun-resolution (ISSUE-14 fix rev 8) đúng về logic nhưng chỉ chạy **bên trong** `answer-query` — không liên quan tới lỗi routing ở (a) vì bug (a) xảy ra trước khi request tới được `answer-query`. Phần "AI liệt kê cả admin@test.com (leader) trong danh sách gợi ý" mà PM báo cáo ở tab Ask là 1 gap riêng: `renderMemberList()` (dùng cho câu trả lời "không tìm thấy thành viên"/placeholder) liệt kê toàn bộ `members` không lọc theo role của người hỏi.
- Rule nghiệp vụ (fix):
  - Mở rộng `isInformationalQuery()` (hoặc thêm điều kiện tại điểm gọi ở `chat-box.tsx`) để nhận diện thêm các mẫu câu hỏi tiếng Việt không có dấu `?` và không rơi vào danh sách từ khóa hiện tại nhưng vẫn là câu hỏi rõ ràng — tối thiểu: các câu bắt đầu với "task/công việc/việc của tôi/của [tên]..." theo sau bởi "là gì/có gì/gồm gì" phải được coi là câu hỏi, không phải lệnh tạo. Không cần AI để phân loại (giữ đúng heuristic regex, nhất quán cách làm hiện tại) — chỉ mở rộng pattern.
  - Đảo nguyên tắc ưu tiên tại `chat-box.tsx`: khi `mode === "devops"` và không có ảnh đính kèm, chỉ route sang `format-entry` khi câu khớp rõ ràng 1 mẫu **ghi log việc đã làm/đang làm** (có động từ hành động + không phải câu hỏi) — mặc định khi không chắc chắn (không khớp intent tạo/sửa/xóa/hỏi rõ ràng nào) phải ưu tiên coi là câu hỏi (route Q&A) thay vì mặc định tạo task, vì hậu quả của "hiểu nhầm câu hỏi thành lệnh tạo" (bịa nội dung + gán nhầm người) nghiêm trọng hơn hậu quả "hiểu nhầm lệnh ghi log thành câu hỏi" (chỉ cần user gõ lại, không tạo dữ liệu rác).
  - `extractTaskEntryFromInput` (nhánh tự động gợi ý assignee khi không xác định được ai) phải nhận thêm tham số `askerMemberName`/`askerMemberId` (người đang chat). Khi không có `assigneeName` được trích từ câu, **mặc định gán cho chính người đang chat** (nếu người đó là devops hợp lệ) thay vì gọi `findBestSuitableMember` chọn người bất kỳ — `findBestSuitableMember` chỉ còn dùng cho trường hợp câu lệnh **do leader gõ** không chỉ định assignee (nhánh create trong `answer-query`, hành vi này giữ nguyên, không đổi).
  - `renderMemberList()`/mọi danh sách gợi ý member hiển thị cho **devops** (khi họ ở mode devops) phải lọc bỏ member có `role === "leader"` — devops chỉ nên thấy chính họ/đồng nghiệp devops trong các gợi ý tra cứu, đúng tinh thần "devops chỉ nên hỏi về bản thân" trong spec.
- Acceptance criteria:
  - `AC-12-1`: Given devops (`qc1@test.com`) đăng nhập, ở tab "Log / Plan" (mặc định), When gõ nguyên văn "task của tôi hôm nay là gì" (không có dấu `?`, đúng câu PM tái hiện), Then hệ thống nhận diện là câu hỏi, route sang `answer-query`, **không** hiện `EntryCard` nào, **không** có task nào được tạo/đề xuất tạo trên Firestore.
  - `AC-12-2`: Given AC-12-1, Then câu trả lời liệt kê đúng task của chính `qc1@test.com` (khớp dữ liệu thật trên Firestore của người này), không phải của người khác, không bịa nội dung.
  - `AC-12-3`: Given devops gõ câu tự ghi log việc thật như trước ("Fix lỗi connect AWS bên service Hook, 30 phút" — đúng ví dụ AC-10-1), When gửi, Then vẫn route đúng sang `format-entry`, `EntryCard` hiện như cũ — xác nhận fix AC-12-1 không phá vỡ AC-10-1.
  - `AC-12-4`: Given devops gõ 1 câu tự ghi log việc thật nhưng không nêu rõ ai làm (ví dụ mô tả công việc ở ngôi thứ nhất ngầm định, không có tên khác), When `EntryCard` được tạo, Then `assigneeName` mặc định là chính người đang chat (`qc1@test.com`/tên hiển thị của họ), không phải member khác được auto-suggest theo skill.
  - `AC-12-5`: Given devops (`qc1@test.com`) ở tab "Ask", When gõ "task của tôi hôm nay là gì?" (có dấu `?`, luồng cũ ISSUE-14 từng fix), Then vẫn trả lời đúng phạm vi bản thân — không regression so với hành vi đã fix ở ISSUE-14 rev 8.
  - `AC-12-6`: Given devops ở tab "Ask" gõ 1 câu bị hệ thống coi là chưa xác định rõ thành viên (rơi vào nhánh gợi ý danh sách member để chọn lại), Then danh sách gợi ý hiển thị **không chứa** member có `role === "leader"` (vd không hiện `admin@test.com`).

### (rev 2) Cập nhật AC liên quan sau fix

- `AC-10-2` (giữ nguyên nội dung) nay áp dụng cho cả câu có `?` (đã đúng từ rev 1/ISSUE-14) lẫn câu không có `?` như "task của tôi hôm nay là gì" (mới đúng từ F-12/AC-12-1..2) — coi `AC-12-1/12-2` là phần mở rộng cụ thể hóa của `AC-10-2`, không thay thế.

## Ngoài phạm vi rev này

- Xóa/tạo project qua chat.
- AI tự động chọn người gán task dựa trên suy luận "ai đang rảnh" khi tạo task (chỉ dùng gợi ý khi không tìm thấy người được nêu tên — hành vi tự động gợi ý hiện có trong `task-extractor.service.ts` giữ nguyên, không mở rộng thêm sang lệnh update/delete).
- Sửa/xóa hàng loạt nhiều task trong 1 lệnh.
- Thêm/sửa/xóa thông tin member qua chat.
- Undo một thay đổi đã xác nhận trong chat.
- Mở rộng phạm vi tra cứu của devops sang dữ liệu người khác.
- Middleware xác thực role phía server đầy đủ (session/JWT verify) — rev này chỉ thêm 1 lớp đối chiếu role nhẹ ngay trong route handler hiện có, không dựng lại cơ chế auth.
- Xử lý câu vừa chứa lệnh thay đổi vừa chứa câu hỏi tra cứu trong cùng 1 lượt gõ — chỉ xử lý nhánh lệnh thay đổi, phần hỏi bị bỏ qua trong lượt đó (leader cần hỏi lại riêng).
- UI riêng cho trang "Audit log" độc lập — audit trả lời qua chat (F-08/AC-08-6) là đủ theo `should` của US-8; màn hình liệt kê `taskChangeLogs` dạng bảng (nếu cần sau này) không nằm trong rev 1.
- (rev 2) Phân loại intent bằng AI/model thay vì heuristic regex — F-12 chỉ mở rộng pattern hiện có, không đổi cách tiếp cận.
- (rev 2) Chuẩn hóa lại toàn bộ danh sách từ khóa câu hỏi tiếng Việt cho mọi biến thể có thể có — chỉ thêm đủ pattern để 2 câu ví dụ cụ thể trong feedback (`"task của tôi hôm nay là gì"` và các biến thể gần nghĩa `"việc của tôi..."`) hoạt động đúng; các câu hỏi khác chưa gặp trong feedback để dành theo dõi phát sinh tiếp ở rev sau.
- (rev 2) Sửa toàn diện `findMemberByName`/gợi ý assignee cho nhánh update/delete theo danh tính người hỏi — rev 2 chỉ sửa nhánh **create/format-entry** (đúng phạm vi FB-CHAT-02); nhánh update/delete do leader gõ giữ nguyên hành vi F-06/F-07 hiện có (không đổi).

## Quyết định của PM (chốt trước khi giao Developer)

- **Auth rev 1**: chỉ đối chiếu `role` nhẹ qua `memberId` (như spec đã mô tả ở mục "Phân quyền leader/devops"), không dựng session-based verify. Rủi ro còn lại (client tự sửa `mode`) là hiện trạng có sẵn, để rev sau.
- **Đồng bộ Member sau update/delete**: áp dụng lại đúng công thức tính `effortMinutes`/`status` đã có trong `handleConfirmEntry` cho member liên quan, sau mọi update/delete task được xác nhận — không phát minh công thức mới. Bổ sung AC: `AC-04-2`/`AC-05-2` khi verify phải kiểm tra thêm `Member.effortMinutes`/`status` của member liên quan được cập nhật đúng (không chỉ riêng `Task`).
- "Xác nhận" khi `assigneeName` bị sửa tay thành người không tồn tại — validate như `EntryCard` hiện tại (chặn nút Xác nhận nếu field bắt buộc rỗng/không khớp member nào).

## (rev 2) Câu hỏi mở cho PM

- **F-11 migration**: chưa rõ có bao nhiêu tài khoản leader thật đã tồn tại trong Firestore (ngoài `admin@test.com`) đang thiếu `Member.role`. Giả định: Developer tự viết 1 script one-off backfill (theo đúng pattern các script one-off đã dùng trước đây, vd ISSUE-04/ISSUE-11 trong `issues.md`), chạy 1 lần, không giữ lại trong repo lâu dài — nếu PM muốn 1 cơ chế backfill tái sử dụng được lâu dài (vd admin UI), cần nêu rõ, ngoài phạm vi giả định hiện tại.
- **F-12 phạm vi "mặc định gán cho người đang chat"**: giả định chỉ áp dụng khi AI không trích được `assigneeName` nào từ câu (giữ nguyên hành vi hiện có khi assigneeName được nêu rõ, kể cả nếu người dùng ghi log hộ người khác qua ảnh chụp màn hình Slack/Zalo — trường hợp đó vẫn dùng người được nêu tên trong ảnh, không ép về người đang chat). Nếu PM muốn siết chặt hơn (devops chỉ được tự ghi log cho chính mình, không log hộ người khác) cần nêu rõ — đây là thay đổi hành vi lớn hơn phạm vi 2 bug đang fix.
- **Ranh giới "câu hỏi vs lệnh tạo" mở rộng tới đâu**: rev 2 chỉ đảm bảo 2 câu cụ thể trong feedback hoạt động đúng (`AC-12-1`, `AC-12-3`). Nếu QC/PM phát hiện thêm biến thể câu hỏi khác vẫn bị hiểu nhầm thành lệnh tạo sau khi fix, đây là phát sinh mới cần ghi issue riêng, không coi là fail lại của rev 2 (trừ khi đúng 2 câu ví dụ trên vẫn sai).
