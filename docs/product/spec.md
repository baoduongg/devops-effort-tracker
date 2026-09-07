# Spec — rev 2 (2026-09-07)

> Rev 2 sửa 3 vấn đề PM trả về `REVISE` sau khi preview rev 1 (`docs/product/feedback.md`: FB-01, FB-02, FB-03). Nội dung Rev 1 giữ nguyên bên dưới làm lịch sử/tham chiếu — Developer/QC đọc **Rev 2 — Thay đổi** trước, phần Rev 1 vẫn còn hiệu lực cho mọi thứ không bị nhắc tới ở đây.

## Rev 2 — Thay đổi

### FB-01 (nghiêm trọng) → sửa F-02

**Nguyên nhân (đã xác nhận qua code, không phải đoán):**
`app/dashboard/page.tsx` load `projects` bằng `getProjects().then(setProjects)` — one-shot promise, độc lập hoàn toàn với `subscribeAllTasks` (realtime). `useEffect` sinh notification (F-02) chỉ phụ thuộc `[overdueTasks]` và chạy ngay khi `tasks` snapshot đầu tiên về, **không đợi** `projects` promise resolve. Nếu tại thời điểm đó `projects` vẫn còn là mảng rỗng ban đầu, `projects.find((p) => p.id === task.projectId)` trả `undefined` → message bị ghi cứng `"No project"`.

Vì `createNotification` dùng `setDoc` với id cố định `overdue_task_<taskId>` để dedup (rev 1, ISS-01), một khi message sai đã được ghi, effect sẽ **không bao giờ ghi đè lại** kể cả khi `projects` load xong sau đó — vì logic dedup coi task này "đã được báo rồi" và bỏ qua hoàn toàn (không gọi lại `createNotification`). Đây là lý do khác biệt với Dashboard: Dashboard *render lại* mỗi khi `projects` state đổi nên luôn hiện đúng tên dự án, còn notification là *một lần ghi Firestore* bị đóng băng với dữ liệu tại đúng thời điểm effect chạy lần đầu.

**Rule sửa:**
- Effect tạo notification (F-02) không được chạy cho tới khi **cả** `tasks` (subscription đầu tiên) **và** `projects` (fetch đầu tiên) đều đã có dữ liệu lần đầu — thêm điều kiện chờ tương tự cờ `loading` hiện có của `members`/`tasks`, áp dụng thêm cho `projects`. Cách làm cụ thể (component nào chờ ra sao) là quyết định của Developer; yêu cầu bắt buộc: **không gọi `createNotification` khi chưa chắc chắn `projects` đã sẵn sàng.**
- Tên dự án ghi vào notification phải tra cứu bằng đúng cơ chế Dashboard đang dùng để hiển thị (`projects.find((p) => p.id === task.projectId)`), không thêm cơ chế tra cứu song song thứ hai.
- Nếu về sau `projects` load xong mà notification đã lỡ ghi sai (case tồn đọng từ trước rev 2, hoặc do lỗi khác), không có yêu cầu tự sửa lại notification cũ trong rev này (xem "Ngoài phạm vi") — rule trên chỉ đảm bảo **từ rev 2 trở đi không phát sinh case mới**.

**Acceptance criteria mới:**
- `AC-04-1`: Given task quá hạn có `projectId` hợp lệ trỏ tới một project có thật, When Dashboard vừa mở lần đầu trong phiên (cả `tasks` và `projects` cùng đang load), Then notification `overdue_task` được tạo cho task đó có tên dự án đúng như project thật (không phải "No project"), giống hệt tên project mà khu vực "Overdue Tasks" trên Dashboard đang hiển thị cho task đó.
- `AC-04-2`: Given mạng chậm khiến `getProjects()` trả về sau `subscribeAllTasks` vài giây, When effect tạo notification có khả năng chạy trước khi `projects` kịp có dữ liệu, Then notification vẫn không được tạo với message chứa "No project" cho task có `projectId` hợp lệ — effect phải đợi `projects` sẵn sàng trước khi ghi.
- `AC-04-3`: Given task có `projectId` không khớp với bất kỳ project nào đang tồn tại (project đã bị xoá — trường hợp hợp lệ, khác với "chưa load xong"), When notification được tạo, Then message vẫn được phép hiện "No project" (đây là dữ liệu thật, không phải do race).

---

### FB-02 (nhỏ nhưng cần) → thêm vào S-03 (màn hiện có) + F-04 mới

**Xác nhận qua code:** `components/timeline/timeline-item.tsx` chỉ hiện `Token label={statusLabels[task.status]}` ("Planned"/"In Progress"/"Done"), không có bất kỳ liên hệ nào với `lib/overdue.ts`. `app/members/[memberId]/page.tsx` (trang "Edit {member.name}") render `TimelineView` → `TimelineItem` cho toàn bộ task của member, không truyền thông tin overdue nào xuống.

### S-03 Member Detail (sửa màn hiện có) — route `/members/[memberId]`
- Mục đích bổ sung: trả lời "trong các task của tôi, cái nào đang quá hạn" ngay tại nơi Lead/Member xem task của chính mình (US-3), không chỉ ở Dashboard của PM.
- Hiển thị bổ sung trong khu vực Timeline (component `TimelineItem`, dùng lại nguyên trạng cho mọi trang khác gọi `TimelineView`, không tách riêng cho member-detail):
  - Với mỗi task mà `isOverdue(task)` (từ `lib/overdue.ts`, tái dùng nguyên hàm đã có — không viết lại logic) trả `true`: thêm dấu hiệu trực quan overdue, tối thiểu là đổi `Token` trạng thái hiện tại sang tone cảnh báo/đỏ kèm chữ "Overdue" (ví dụ thay `statusLabels[task.status]` bằng "Overdue" khi quá hạn, giữ nguyên "Planned"/"In Progress" khi không quá hạn), tương tự cách `OverdueTasksList` trên Dashboard đang dùng `Token color="red"`/`"orange"` để nhất quán màu sắc giữa 2 nơi.
  - Task `done` không bao giờ hiện dấu hiệu overdue (đã đúng theo `isOverdue()`).
- Hành động: không đổi — vẫn chỉ là danh sách xem, không click-through thêm.
- Vì `TimelineItem`/`TimelineView` được dùng chung (không chỉ riêng member-detail), thay đổi này áp dụng cho **mọi nơi** đang render Timeline, không chỉ trang member-detail — đây là điều mong muốn (nhất quán, không phải side-effect ngoài ý muốn).

### F-04 Đánh dấu overdue trên Timeline (US-3)
- Mô tả: hiển thị dấu hiệu quá hạn cho task ngay tại Timeline (dùng ở `/members/[memberId]` và bất kỳ nơi nào khác dùng `TimelineView`), tái dùng đúng `isOverdue()` từ `lib/overdue.ts` — không định nghĩa lại điều kiện "quá hạn" ở nơi thứ hai.
- Rule nghiệp vụ: điều kiện overdue giống hệt F-01 (đã có), không có ngưỡng hay rule riêng cho màn này.
- Acceptance criteria:
  - `AC-05-1`: Given task của member có `status = "in_progress"` và `endDate` = hôm qua (thoả `isOverdue`), When vào `/members/[memberId]` của member đó, Then dòng task này trong Timeline hiện dấu hiệu overdue (Token đổi màu đỏ/cam và/hoặc chữ "Overdue"), khác biệt rõ với các task không quá hạn.
  - `AC-05-2`: Given task của member có `status = "done"` dù `endDate` đã qua, When vào `/members/[memberId]`, Then dòng task này **không** hiện dấu hiệu overdue, vẫn hiện "Done" như bình thường.
  - `AC-05-3`: Given task có `endDate` chưa tới hoặc = hôm nay, When vào `/members/[memberId]`, Then dòng task hiện đúng "Planned"/"In Progress" như hiện tại, không có dấu hiệu overdue.
  - `AC-05-4`: Given cùng một task quá hạn, When so sánh dấu hiệu overdue giữa khu vực "Overdue Tasks" trên Dashboard (`OverdueTasksList`) và dòng tương ứng trong Timeline ở `/members/[memberId]`, Then cả hai đều xác định task đó là overdue nhất quán (không có trường hợp một nơi coi là overdue, nơi kia không) — vì cùng dùng chung `isOverdue()`.

---

### FB-03 (nhỏ, UX) → sửa S-02 Notifications + F-05 mới

**Xác nhận qua code:** `app/notifications/page.tsx` không có state `loading` — `notifications` khởi tạo `[]`, `NotificationList` render ngay lập tức, và với mảng rỗng nó luôn hiện `EmptyState` "You're all caught up / No notifications right now" cho tới khi `subscribeNotifications` bắn callback đầu tiên. Không có cách nào để component phân biệt "đang tải" với "tải xong và rỗng thật".

### S-02 Notifications (sửa bổ sung so với rev 1) — route `/notifications`
- Hiển thị bổ sung: trạng thái loading rõ ràng (skeleton) trong lúc chờ `subscribeNotifications` trả về lần đầu, thay vì render `NotificationList` với mảng rỗng ngay từ đầu. Dùng lại component `Skeleton` đã dùng ở Dashboard/Member Detail (không thêm thư viện/pattern loading mới).
- Chỉ sau khi đã nhận được callback đầu tiên từ `subscribeNotifications` (bất kể rỗng hay có dữ liệu) mới quyết định hiện `NotificationList` (rỗng → `EmptyState` như cũ, có dữ liệu → danh sách như cũ).
- Không đổi hành vi/format của `NotificationItem`, `NotificationList` khi đã có dữ liệu.

### F-05 Loading state cho trang Notifications (không map US cụ thể — sửa lỗi UX phát sinh từ F-02/rev 1, thuộc tinh thần chung "không gây hiểu lầm" của requirements.md)
- Mô tả: phân biệt rõ 3 trạng thái của trang Notifications: đang tải / tải xong nhưng rỗng / tải xong có dữ liệu.
- Rule nghiệp vụ: trạng thái "rỗng thật" (`EmptyState`) chỉ được hiện sau khi đã nhận ít nhất 1 lần callback từ subscription, không hiện ngay tại lần render đầu tiên của trang.
- Acceptance criteria:
  - `AC-06-1`: Given vào `/notifications` lần đầu trong phiên (chưa có snapshot nào về), When trang vừa mount, Then hiển thị skeleton/loading, **không** hiển thị "You're all caught up" hay "No notifications right now" trong khoảng thời gian này.
  - `AC-06-2`: Given `subscribeNotifications` đã trả về snapshot đầu tiên và có ít nhất 1 notification, When loading kết thúc, Then danh sách notification hiện ra như rev 1, skeleton biến mất hoàn toàn.
  - `AC-06-3`: Given `subscribeNotifications` đã trả về snapshot đầu tiên và collection thực sự rỗng (0 notification), When loading kết thúc, Then hiện đúng `EmptyState` "You're all caught up / No notifications right now" như rev 1 (không đổi copy).
  - `AC-06-4`: Given trang đang ở trạng thái đã tải xong có dữ liệu, When có notification mới được tạo (snapshot cập nhật), Then danh sách cập nhật ngay như hiện tại, không quay lại trạng thái loading.

## Ngoài phạm vi rev 2
- Sửa lại (backfill) các notification `overdue_task` đã lỡ bị ghi sai "No project" trước rev 2 — chỉ đảm bảo không phát sinh case mới.
- Thêm dấu hiệu overdue ở nơi khác ngoài Timeline (ví dụ MemberCard ở Dashboard) — không nằm trong 3 FB, không tự ý mở rộng.
- Mark-as-read, phân trang, hoặc thay đổi cấu trúc dữ liệu Notification — như rev 1 đã ghi, vẫn ngoài phạm vi.

---

## Rev 1 (2026-09-07) — giữ nguyên làm lịch sử/tham chiếu

## Tổng quan
Dashboard hiện cho PM biết ai đang bận, dự án nào phân bổ ra sao, nhưng không có tín hiệu nào cho biết task đã trễ deadline. Tính năng "Overdue Task Alerts" tự động phát hiện các task có `endDate` đã qua mà `status` chưa `done`, hiển thị nổi bật trên Dashboard hiện có (không tạo trang mới), và sinh notification khi một task vừa chuyển sang trạng thái quá hạn, để PM và Lead/Member biết ngay mà không phải rà thủ công từng người.

## Mô hình dữ liệu

### `types/notification.ts` — thêm giá trị enum
- `NotificationType` thêm `"overdue_task"` bên cạnh `"budget" | "other"`.
- Thêm field optional để item Notifications và mọi nơi khác trace lại đúng task/member, và để logic dedup (mục F-02) hoạt động:
  ```ts
  export interface Notification {
    ...
    relatedTaskId?: string | null;   // mới — id của task quá hạn liên quan, null cho notification loại khác
    relatedMemberId?: string | null; // mới — id member phụ trách task đó
  }
  ```
  (`relatedProjectId` đã có sẵn, tái dùng để liên kết dự án — không đổi.)

### Firestore — cần một nơi lưu "task này đã từng bị báo quá hạn chưa"
Hiện `services/notifications.service.ts` **chỉ có read** (`getNotifications`, `subscribeNotifications`) — không có hàm ghi nào, toàn bộ dữ liệu notification hiện tại là do `scripts/seed.ts` tạo sẵn. Rev này cần bổ sung khả năng ghi:
- Hàm mới `createNotification(input)` trong `services/notifications.service.ts` (theo đúng pattern service hiện có).
- Không thêm field mới vào `Task`. Dùng chính sự tồn tại của một `Notification` loại `overdue_task` có `relatedTaskId === task.id` làm dấu hiệu "task này đã được báo rồi" — xem rule dedup ở F-02. (Cân nhắc: đơn giản hơn thêm field `overdueNotifiedAt` vào Task, không cần đụng `tasks.service.ts`.)

### Không đổi
- `Task`, `Member`, `Project` giữ nguyên field. "Quá hạn" là giá trị suy ra (derived), không lưu thành field riêng trên Task.

## Màn hình

### S-01 Dashboard (sửa màn hiện có) — route `/dashboard`
- Mục đích: trả lời "hiện có bao nhiêu task trễ, của ai, dự án nào, trễ mấy ngày" trong vài giây khi vừa load trang.
- Vị trí chèn: 1 `StatCard` mới trong hàng KPI đầu trang (cạnh "Overloaded (>100%)"), cộng thêm 1 khu vực danh sách chi tiết ngay dưới toolbar tìm kiếm/lọc, phía trên khu vực tab Matrix/Timeline/Projects/Cards hiện tại.
- Hiển thị:
  - StatCard "Overdue Tasks": số lượng task quá hạn hiện tại, tone `destructive` khi > 0 (theo đúng pattern tone của `overloadedCount` đã có), tone `primary` khi = 0.
  - Khu vực "Overdue Tasks" (List, ẩn hoàn toàn nếu không có task quá hạn nào — không chiếm chỗ khi rỗng): mỗi dòng gồm
    - Tên task (`title`)
    - Tên member phụ trách (tra trong mảng `members` đã load theo `task.memberId`, theo đúng cách các component dashboard khác đang tra cứu bằng `.find()`/`.filter()` trên props, không thêm service call mới)
    - Tên dự án (tra trong mảng `projects` theo `task.projectId`)
    - Số ngày trễ = `floor((hôm nay - endDate) / 1 ngày)`, hiển thị dạng "Trễ N ngày"
    - Badge mức độ nghiêm trọng: dùng lại `Token`/`StatusDot` màu `error` khi trễ > 7 ngày, màu `warning` khi trễ 1–7 ngày (ngưỡng hiển thị thị giác — không phải điều kiện xác định quá hạn).
  - Sắp xếp: task trễ nhiều ngày nhất lên đầu.
- Hành động:
  - Click một dòng task quá hạn điều hướng tới `/members/[memberId]` của member phụ trách (trang chi tiết member đã có, hiển thị task list của member đó) — tái dùng route hiện có, không cần trang task-detail mới.
  - Thêm option `"Overdue"` vào bộ lọc "Bandwidth" (`Selector` hiện có trong toolbar Card) HOẶC thêm nút bấm nhanh "Xem team đang trễ" bên cạnh nút "Reset" hiện có, khi bấm sẽ lọc `filteredMembers` chỉ còn các member đang có ít nhất 1 task quá hạn. Chọn phương án nút bấm riêng (rõ ràng hơn, không lẫn với logic effort % của Bandwidth filter vốn đang đo effort chứ không đo deadline).
- Trạng thái rỗng: không có task nào quá hạn → StatCard hiện "0 members"-style value "0 tasks", tone `primary`; khu vực danh sách overdue ẩn hẳn, không hiện khung trống gây rối mắt.
- Trạng thái loading: dùng chung `Skeleton` đang có cho toàn bộ dashboard trong lúc `loading === true`; khu vực overdue chỉ render sau khi `tasks` đã có dữ liệu lần đầu.
- Lỗi: nếu subscribe tasks lỗi, khu vực overdue không hiển thị gì thêm ngoài hành vi lỗi chung hiện có của dashboard (không có yêu cầu UI lỗi riêng cho phần này).

### S-02 Notifications (không đổi UI, chỉ thêm dữ liệu) — route `/notifications`
- Mục đích: PM thấy lịch sử "task X mới bị trễ" xen kẽ với notification budget hiện có.
- Hiển thị: `NotificationItem` hiện tại đã tổng quát theo `severity` + `title` + `message`, không cần sửa component. Notification loại `overdue_task` dùng `severity: "warning"`.
  - `title`: `"<Tên task> đã quá hạn"`
  - `message`: `"<Tên member> — <Tên dự án> — trễ N ngày (hạn <endDate định dạng dd/mm/yyyy>)"`
- Hành động: giữ nguyên hành vi hiện có của trang (không có click-through hay mark-read trong phạm vi rev này vì trang hiện tại cũng chưa có).

## Tính năng

### F-01 Phát hiện task quá hạn (US-1, US-3)
- Mô tả: xác định trong bộ nhớ (derived, không lưu Firestore) tập task nào đang quá hạn, dùng lại `tasks` đã subscribe sẵn trên Dashboard.
- Rule nghiệp vụ:
  - Task được coi là "quá hạn" khi: `task.endDate !== null` AND `new Date(task.endDate) < startOfToday()` AND `task.status !== "done"` (áp dụng cho cả `"planned"` và `"in_progress"`).
  - So sánh theo ngày lịch (bỏ giờ/phút), dùng mốc đầu ngày hôm nay tại timezone trình duyệt — task có `endDate` là hôm nay chưa tính là trễ.
  - Số ngày trễ = số ngày lịch đầy đủ đã trôi qua kể từ `endDate` đến hôm nay (ví dụ endDate hôm qua → trễ 1 ngày).
- Acceptance criteria:
  - `AC-01-1`: Given task có `status = "in_progress"` và `endDate` = hôm qua, When vào Dashboard, Then task này xuất hiện trong danh sách Overdue Tasks với "Trễ 1 ngày".
  - `AC-01-2`: Given task có `status = "planned"` và `endDate` = 5 ngày trước, When vào Dashboard, Then task xuất hiện với "Trễ 5 ngày".
  - `AC-01-3`: Given task có `status = "done"` và `endDate` = 10 ngày trước, When vào Dashboard, Then task **không** xuất hiện trong danh sách Overdue Tasks.
  - `AC-01-4`: Given task có `endDate = null`, When vào Dashboard, Then task không bao giờ được tính là quá hạn.
  - `AC-01-5`: Given task có `endDate` = hôm nay, When vào Dashboard, Then task **không** tính là quá hạn (chỉ tính quá hạn khi qua khỏi ngày hiện tại).
  - `AC-01-6`: Given không có task nào thoả điều kiện quá hạn, When vào Dashboard, Then StatCard "Overdue Tasks" hiện giá trị 0 với tone primary và khu vực danh sách overdue không hiển thị.

### F-02 Notification khi task chuyển sang quá hạn, không lặp lại (US-2)
- Mô tả: sinh 1 `Notification` loại `overdue_task` đúng một lần cho mỗi task khi nó lần đầu được phát hiện là quá hạn, không sinh lại mỗi lần PM load lại trang.
- Rule nghiệp vụ:
  - App không có cron/backend — việc phát hiện chạy client-side mỗi khi Dashboard tính lại danh sách quá hạn (F-01) trên dữ liệu tasks đã subscribe.
  - Trước khi tạo notification cho một task quá hạn, kiểm tra: đã tồn tại `Notification` với `type === "overdue_task"` và `relatedTaskId === task.id`? Nếu có → bỏ qua (không tạo trùng). Nếu chưa có → gọi `createNotification` một lần.
  - Nếu một task quá hạn sau đó được cập nhật `status = "done"` rồi lại bị mở lại (đổi ngược về `planned`/`in_progress`) và vẫn còn quá `endDate` cũ: vẫn coi là "đã từng báo" (không sinh notification thứ hai cho cùng `relatedTaskId`) — tránh spam khi user qua lại trạng thái. *(giả định — xem Câu hỏi mở cho PM)*.
  - Việc kiểm tra dedup + tạo notification chạy trong `useEffect` trên Dashboard khi `tasks` thay đổi (không chạy trên mọi trang, tránh tạo trùng từ nhiều tab/màn hình).
  - **(rev 2 — xem FB-01 ở trên)**: effect này còn phải đợi `projects` sẵn sàng trước khi ghi, không chỉ đợi `tasks`.
- Acceptance criteria:
  - `AC-02-1`: Given một task chưa từng có notification `overdue_task` liên quan và vừa được xác định là quá hạn (theo F-01), When Dashboard tính toán lại (lần đầu tải hoặc khi task cập nhật), Then một `Notification` mới với `type = "overdue_task"`, `relatedTaskId = task.id`, `relatedMemberId = task.memberId`, `relatedProjectId = task.projectId`, `severity = "warning"` được tạo, và xuất hiện trong trang Notifications.
  - `AC-02-2`: Given task đã có sẵn một `Notification overdue_task` với `relatedTaskId` trùng, When PM tải lại Dashboard nhiều lần liên tiếp mà task vẫn ở trạng thái quá hạn không đổi, Then không có notification trùng nào được tạo thêm (tổng số notification cho task đó vẫn là 1).
  - `AC-02-3`: Given task quá hạn A (member Linh, project Atlas, trễ 3 ngày), When notification được tạo, Then `title` = "`<title task A>` đã quá hạn" và `message` chứa tên member "Linh", tên dự án "Atlas", và "trễ 3 ngày".
  - `AC-02-4`: Given task được sửa `endDate` dời sang tương lai trước khi tạo notification, When Dashboard tính lại, Then task không còn bị coi là quá hạn (theo AC-01-3/-4 logic) và không có notification nào được sinh cho nó.
  - **`AC-04-1`, `AC-04-2`, `AC-04-3` (rev 2)**: xem mục "Rev 2 — Thay đổi / FB-01" ở trên — bổ sung, không thay thế 4 AC trên.

### F-03 Xem nhanh / lọc task quá hạn trên Dashboard (US-1)
- Mô tả: cho phép PM thu hẹp Dashboard về đúng những member đang có task trễ, tái dùng cơ chế filter `filteredMembers` đã có.
- Rule nghiệp vụ: bấm nút "Xem team đang trễ" bật cờ lọc bổ sung (độc lập với Project/Bandwidth/Search hiện có) — chỉ giữ lại member có `>= 1` task thoả điều kiện quá hạn (F-01). Bấm lại (hoặc bấm "Reset" hiện có) tắt cờ này.
- Acceptance criteria:
  - `AC-03-1`: Given có 5 member trong đó 2 member đang có task quá hạn, When PM bấm "Xem team đang trễ", Then danh sách member hiển thị (ở mọi tab Matrix/Timeline/Projects/Cards) chỉ còn 2 member đó.
  - `AC-03-2`: Given bộ lọc "Xem team đang trễ" đang bật, When PM bấm nút "Reset" sẵn có, Then bộ lọc này tắt cùng với Search/Project/Bandwidth, danh sách trở lại đầy đủ.
  - `AC-03-3`: Given không có member nào đang trễ task, When PM bấm "Xem team đang trễ", Then hiển thị `EmptyState` "No matching team members" (tái dùng đúng component rỗng hiện có của Dashboard).
  - `AC-03-4`: Given danh sách Overdue Tasks đang hiển thị dòng của task T thuộc member M, When PM click vào dòng đó, Then trình duyệt điều hướng tới `/members/M` (trang chi tiết member M).

## Ngoài phạm vi rev này
- Gửi email/Slack cho task quá hạn.
- Cấu hình ngưỡng "sắp trễ" (near-due warning trước khi qua `endDate`).
- Workflow phê duyệt gia hạn deadline hoặc nhắc nhở lặp lại định kỳ.
- Đánh dấu đã đọc (mark-as-read) cho notification — trang Notifications hiện tại chưa có hành vi này cho bất kỳ loại notification nào, không mở rộng riêng cho `overdue_task`.
- Thay đổi form tạo/sửa task hoặc field `endDate`.

## Câu hỏi mở cho PM
- Khi một task quá hạn đã có notification, rồi user đổi `status` sang `done` rồi mở lại (`planned`/`in_progress`) và vẫn còn quá `endDate` cũ — có cần báo lại (notification thứ 2) không? Giả định hiện tại: **không báo lại** (dedup theo `relatedTaskId` duy nhất, xem F-02). Nếu PM muốn báo lại mỗi lần "tái quá hạn", cần đổi khoá dedup từ "theo task" sang "theo (task, lần chuyển trạng thái)" — ảnh hưởng thiết kế field lưu trữ.
- Không có cron/server job trong app (chỉ Next.js + Firestore client-side) — notification chỉ được sinh khi có người đang mở Dashboard để trigger tính toán. Nếu PM cần notification xuất hiện ngay cả khi không ai mở app hôm đó, cần một scheduled function (Cloud Function/cron) — ngoài phạm vi hạ tầng hiện tại, không đưa vào rev này.
- **(rev 2, mới)** Các notification `overdue_task` đã lỡ ghi sai "No project" trước khi fix FB-01 (nếu có tồn tại trong dữ liệu thật) — PM có cần dọn/sửa lại thủ công không, hay chấp nhận để nguyên vì đây là dữ liệu lịch sử? Giả định hiện tại: chấp nhận để nguyên, không backfill (xem "Ngoài phạm vi rev 2").

---

**Tóm tắt Rev 2**: Sửa 3 vấn đề PM trả `REVISE` (FB-01, FB-02, FB-03), không tạo màn hình mới. Thêm 2 tính năng mới F-04 (đánh dấu overdue trên Timeline, sửa `TimelineItem`/`TimelineView` dùng chung) và F-05 (loading state cho `/notifications`), cộng 1 sửa rule cho F-02 đã có (chờ `projects` sẵn sàng trước khi ghi notification). Thêm 10 AC mới: `AC-04-1..3` (FB-01), `AC-05-1..4` (FB-02), `AC-06-1..4` (FB-03) — cộng dồn với 15 AC của rev 1 (`AC-01-1..6`, `AC-02-1..4`, `AC-03-1..4`) thành tổng 25 AC. Không đổi mô hình dữ liệu, không đổi field `Notification`/`Task` nào thêm so với rev 1. Rev 1 giữ nguyên bên dưới làm tham chiếu cho những gì không bị FB nhắc tới.
