# Review notes — rev 1 (2026-09-09), sau Developer rev 5

Code-review (effort: medium) trên diff toàn bộ feature "Chat AI: Ra lệnh quản lý team bằng ngôn ngữ tự nhiên" (F-01..F-10).

## Cần fix (correctness)

1. **`components/chat/chat-box.tsx:553`** — `handleConfirmProposal` coi việc bỏ người phụ trách có chủ đích (`changes.assigneeName === null`, tức lệnh "bỏ người phụ trách task X") là lỗi "không tìm thấy nhân sự". `findMemberByName(allMembers, changes.assigneeName ?? undefined)` nhận `undefined` khi `assigneeName` là `null`, trả về `null` do guard `!targetName`, code hiểu nhầm thành "không khớp tên" → `setError` + throw, chặn luôn việc unassign hợp lệ dù `task-mutation-extractor.service.ts` và `taskChangeProposalSchema` đều cho phép `assigneeName: null`.
   - Fix: phân biệt rõ 3 case trong `changes.assigneeName`: không có field (giữ nguyên), `null` (chủ ý unassign → set `memberId: null`/tương đương, không gọi `findMemberByName`), có giá trị string (mới cần `findMemberByName` + validate khớp).

2. **`lib/intent.ts:90`** — `isTaskUpdateIntent`/`isTaskDeleteIntent` thiếu guard loại câu hỏi mà `isTaskCreationIntent` đã có (so với `isInformationalQuery`). Câu hỏi dùng động từ "đổi/xóa" nhưng thực chất là hỏi (vd "Nếu tôi đổi trạng thái task này thì effort có tính lại không?", "Task nào của Huy đã bị xóa tuần trước?") bị match nhầm thành lệnh update/delete → route xử lý sai nhánh: chặn devops nhầm bằng thông báo "không đủ quyền" (F-02), hoặc với leader thì đẩy vào `extractTaskMutationFromInput` đi tìm task để sửa/xóa thay vì trả lời câu hỏi thật.
   - Fix: thêm guard tương tự `isTaskCreationIntent` (loại trừ câu có dấu hiệu câu hỏi/`isInformationalQuery`) trước khi match `updateMiddlePatterns`/`deleteMiddlePatterns`.

## Nit (không bắt buộc fix ngay, nhưng nên biết)

3. `chat-box.tsx:528` — nhánh xóa task và nhánh đồng bộ `syncMemberEffortStatus` tương ứng cách nhau ~50 dòng (code nhánh update chen giữa), dễ gây lỗi khi sửa nhánh update sau này (bỏ sót/nhân đôi bước sync). Không crash hiện tại vì dùng `taskSnapshot` đã fetch sẵn, nhưng nên gom lại gần nhau cho rõ ràng.
4. `components/chat/proposal-card.tsx:189` — banner cảnh báo xóa dùng `<div className="...">` thô, vi phạm rule AGENTS.md "No `<div>`". Dev-log có ghi là "tái dùng convention cũ giống `EntryCard`" nhưng rule SELF-CHECK vẫn yêu cầu thay bằng component Astryx (HStack/Card) — nên đổi để nhất quán, không lấy tiền lệ cũ làm lý do giữ nguyên.

## Quyết định

Có 2 finding correctness (#1, #2) ảnh hưởng trực tiếp tới AC (F-04 unassign flow, F-01/F-02 intent classification) → quay lại Developer fix trước khi qua QC. Nit #3/#4 giao Developer tiện tay sửa luôn nếu không tốn thêm thời gian đáng kể, không bắt buộc.
