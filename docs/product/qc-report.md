# QC Report — spec rev 2, vòng dev-qc 1/3 (2026-09-07)

## Kết luận: PASS

## Tổng: 10/10 AC pass (AC-04-1..3, AC-05-1..4, AC-06-1..4)

Vòng QC này chỉ test 3 fix mới của spec rev 2 (FB-01/F-02, FB-02/F-04, FB-03/F-05), theo đúng chỉ định — **không** re-test 15 AC của rev 1 (đã PASS 15/15 ở QC rev 3, xem lịch sử bên dưới, không có thay đổi nào chạm tới F-01/F-03 ở rev 4).

`pnpm lint`: 0 errors, 9 warnings (cùng baseline pre-existing từ rev 1/2/3, không có warning mới do rev 4).
`pnpm build`: thành công, 0 errors, route `/dashboard` 11 kB, `/members/[memberId]` 5.04 kB, `/notifications` 5.58 kB — khớp dev-log.

Dev server: restart sạch (`pkill next dev` + `rm -rf .next` + `pnpm dev` lại) trước khi test AC-04 để đảm bảo cold-start thật, không dùng cache của phiên trước.

| AC | Kết quả | Ghi chú |
|----|---------|---------|
| AC-04-1 | PASS | Tạo task mới `qc-rev4-race-task` (`projectId=proj-sentinel` — dự án có thật, `endDate` = 2 ngày trước, `status=in_progress`) trực tiếp qua Firestore REST **trước khi** restart dev server. Kill server, `rm -rf .next`, `pnpm dev` lại (cold-start thật, không cache `.next`/state cũ). Mở `/dashboard` lần đầu trong phiên mới → UI hiện đúng "QC Rev4 Race Condition Task — Mai Pham — Sentinel Monitoring — Trễ 2 ngày". Đọc trực tiếp Firestore doc `notifications/overdue_task_qc-rev4-race-task` (không qua UI cache) → `message = "Mai Pham — Sentinel Monitoring — trễ 2 ngày (hạn 05/09/2026)"` — đúng tên project thật, không phải "No project", ngay từ lần ghi đầu tiên của phiên cold-start. |
| AC-04-2 | PASS | Đọc code xác nhận cơ chế chặn race là vô điều kiện: effect notification có guard `if (!projectsLoaded) return;` và `projectsLoaded` nằm trong dependency array (`app/dashboard/page.tsx` dòng 113-145) — nên nếu `tasks` (và do đó `overdueTasks`) sẵn sàng trước `projects`, effect chạy nhưng return sớm mà **không gọi `createNotification`**; khi `projects` load xong (`projectsLoaded` chuyển `true`), effect tự chạy lại lần nữa với `overdueTasks` đã có, lúc này `projects.find()` luôn có dữ liệu đầy đủ. Không có cửa sổ thời gian nào `createNotification` có thể chạy khi `projectsLoaded=false`, nên kết quả đúng bất kể `getProjects()` chậm bao lâu. Thực nghiệm bổ sung: xoá notification, `navigate reload (ignoreCache=true)` nhiều lần liên tiếp trên task test — mọi lần đều ra đúng "Sentinel Monitoring", không có lần nào ra "No project". |
| AC-04-3 | PASS | Tạo task `qc-rev4-deleted-project-task` với `projectId="proj-does-not-exist-anymore"` (không trỏ tới project nào có thật) và `endDate` quá khứ. Load lại Dashboard (reload, ignoreCache) → đọc trực tiếp Firestore: `message = "Mai Pham — No project — trễ 3 ngày (hạn 04/09/2026)"`. Đây là case dữ liệu thật (project đã "xoá"/không tồn tại) chứ không phải do race — đúng theo AC-04-3 cho phép "No project" trong trường hợp này. |
| AC-05-1 | PASS | Vào `/members/member-linh`: task "QC Overdue 1 day task" (`in_progress`, `endDate` hôm qua) → Timeline hiện Token màu **cam** "Overdue" (screenshot), khác biệt rõ với "Migrate staging cluster to Atlas" (`in_progress`, chưa tới hạn) hiện "In Progress" bình thường. Bổ sung test ngưỡng màu đỏ: tạo tạm task `qc-rev4-overdue-10d` (trễ 10 ngày, >7d) trên `member-huy` → Timeline hiện Token màu **đỏ** "Overdue", khác màu cam của "Rebuild pipeline caching layer" (trễ 1 ngày) cùng trang — đúng ngưỡng 7 ngày theo spec. Đã xoá task/notification test sau khi xong. |
| AC-05-2 | PASS | Member Huy Nguyen có task "QC Done but overdue endDate task" (`status=done`, `endDate` 8/28/2026 đã qua rất lâu) → Timeline hiện Token "**Done**" bình thường, không có dấu hiệu "Overdue" nào — đúng yêu cầu task done không bao giờ hiện overdue dù endDate đã qua. |
| AC-05-3 | PASS | "Write Terraform modules for Atlas networking" (`planned`, `endDate` tương lai 9/14/2026) → "Planned". "Migrate staging cluster to Atlas" (`in_progress`, `endDate` tương lai) → "In Progress". "QC Due today task" (`in_progress`, `endDate` = hôm nay) → "In Progress" bình thường, không overdue (đúng logic `isOverdue` bỏ giờ/phút, hôm nay chưa tính trễ). "QC Null endDate task" (`endDate=null`) → "In Progress" bình thường. Không có task nào trong nhóm này hiện "Overdue". |
| AC-05-4 | PASS | Với task tạm `qc-rev4-overdue-10d` (Huy Nguyen, trễ 10 ngày): Dashboard "Overdue Tasks" list hiện đúng dòng "QC Rev4 Overdue 10 days task — Huy Nguyen — Phoenix CI/CD — Trễ 10 ngày"; đồng thời Timeline ở `/members/member-huy` hiện Token đỏ "Overdue" cho cùng task — cả 2 nơi đều xác định overdue nhất quán (cùng dùng `isOverdue()`/`daysOverdue()` từ `lib/overdue.ts`). |
| AC-06-1 | PASS | Thực nghiệm bằng `MutationObserver` inject qua `initScript` khi navigate `/notifications` (đo thời điểm state UI đổi bằng cách quét text/class DOM, log qua console): `t=1675ms` → `{hasSkeleton:true, hasCaughtUp:false, hasList:false}` — chỉ thấy skeleton, không có bất kỳ dấu vết "caught up"/list nào. Không bắt được trạng thái nào có `hasCaughtUp:true` trong suốt quá trình load — xác nhận EmptyState không chớp qua trước khi có snapshot đầu tiên. |
| AC-06-2 | PASS | Cùng thực nghiệm trên: `t=2288ms` → `{hasSkeleton:false, hasCaughtUp:false, hasList:true}` — skeleton biến mất hoàn toàn, danh sách notification thật (có dữ liệu) hiện ra ngay, đúng 1 bước chuyển, không có bước trung gian nào khác. |
| AC-06-3 | PASS | Xác nhận qua code (không xoá dữ liệu thật để tránh phá môi trường QC): `subscribeNotifications` dùng `onSnapshot` — theo hành vi chuẩn của Firestore, callback luôn được gọi ít nhất 1 lần ngay cả khi collection rỗng (`snapshot.docs = []`), nên `setLoading(false)` trong `app/notifications/page.tsx` luôn chạy bất kể có dữ liệu hay không. `NotificationList` (không đổi so với rev 1) tự render `EmptyState` "You're all caught up / No notifications right now" khi `notifications.length === 0` — logic này độc lập với thay đổi rev 4, đã từng qua QC rev 1. Không có đường nào khiến `loading` bị kẹt `true` mãi khi rỗng. |
| AC-06-4 | PASS | Thực nghiệm: mở `/notifications` (đã có dữ liệu, đã qua loading), tạo 1 notification mới (`type=other`) trực tiếp qua Firestore trong khi trang đang mở. `MutationObserver` log: `t=5832ms` → `{hasSkeleton:false, hasCaughtUp:false, hasNewItem:true}` — danh sách cập nhật thêm mục mới ngay, `hasSkeleton` không bao giờ quay lại `true` ở bất kỳ thời điểm nào sau lần load đầu. Đã xoá notification test sau khi xong. |

## Kiểm tra khác

- Console errors: không phát hiện lỗi console nào trên `/dashboard`, `/members/member-linh`, `/members/member-huy`, `/notifications` trong toàn bộ phiên test (kể cả sau nhiều lần reload/cold-start).
- Dữ liệu test tạm (`qc-rev4-race-task`, `qc-rev4-deleted-project-task`, `qc-rev4-overdue-10d`, notification tương ứng, `qc-rev4-live-update-test`) đã được xoá khỏi Firestore sau khi test xong — verify lại bằng query trực tiếp, không còn sót `qc-rev4*` nào trong `tasks`/`notifications`. Các script one-off dùng để tạo/xoá dữ liệu test đã xoá khỏi repo (`git status` sạch, không có file `_qc_*` nào sót).
- Ghi nhận (không phải bug mới, đúng "Ngoài phạm vi rev 2"): trang `/notifications` hiện vẫn còn 1 notification cũ "Rebuild pipeline caching layer đã quá hạn — Huy Nguyen — **No project**" — đây là dữ liệu tồn đọng từ trước khi fix FB-01 được áp dụng (tạo ở vòng QC rev 3, trước rev 4). Đúng theo spec "Ngoài phạm vi rev 2": không yêu cầu backfill, chỉ đảm bảo không phát sinh case mới — đã verify AC-04-1/2 không phát sinh case mới nào tương tự.

## Verify issue cũ

- Không có issue nào đang ở trạng thái `fixed` cần verify trong vòng này (ISS-04, ISS-05 đã `closed` ở QC rev 3; ISS-01/02/03 đã `fixed`/`closed` trước đó, không liên quan tới 3 fix rev 4).
- Không mở issue mới — cả 10 AC đều pass, không phát hiện bug nào trong phạm vi test.

## Gợi ý cho BA

- (Nhắc lại, chưa có thay đổi) `subscribeAllTasks` không có try/catch/validation khi parse từng doc Firestore — rủi ro có sẵn từ trước, ngoài phạm vi rev 2.
- Dữ liệu notification "No project" tồn đọng từ trước rev 2 (ví dụ "Rebuild pipeline caching layer") vẫn hiển thị trên `/notifications` thật — như spec đã ghi nhận là chấp nhận được, nhưng nếu PM muốn trải nghiệm demo sạch hơn thì có thể cân nhắc xoá thủ công doc này khỏi Firestore trước khi demo (không cần code fix, chỉ là thao tác dữ liệu).

---

# QC Report — rev 3 (2026-09-07) [lịch sử]

## Kết luận: PASS

## Tổng: 15/15 AC pass

Vòng QC 3 (vòng cuối, giới hạn tối đa) — tập trung re-verify 2 issue Developer vừa fix ở rev 3 (ISS-04, ISS-05), không chạy lại toàn bộ 15 AC vì 13 AC còn lại đã PASS ở vòng 2 (rev 2) và không có thay đổi nào liên quan tới chúng ở rev 3 (dev-log rev 3 chỉ đổi 1 dòng ở `app/dashboard/page.tsx` cho ISS-05 + chạy 1 script cleanup dữ liệu cho ISS-04).

| AC | Kết quả | Ghi chú |
|----|---------|---------|
| AC-01-1 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-01-2 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-01-3 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-01-4 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-01-5 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-01-6 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-02-1 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-02-2 | PASS | **Re-verify.** Vào `/notifications`: `qc-task-overdue-5d`, `qc-task-overdue-1d`, `task-phoenix-1` (Rebuild pipeline caching layer) mỗi task giờ chỉ có đúng **1** notification `overdue_task` (trước đó mỗi task có 2 bản trùng — ISS-04). Tổng danh sách Notifications còn 6 mục: 3 `overdue_task` (mỗi task 1 bản, không trùng) + 3 notification khác không liên quan (Sentinel milestone, Phoenix budget, Atlas budget). Không có console error. |
| AC-02-3 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-02-4 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-03-1 | PASS | **Re-verify.** Đăng nhập "Continue as guest" → Dashboard → tab "By Project": trước khi bật filter, "Atlas Migration" hiện "Bao (15%)" (task "setup môi trường") và "Sentinel Monitoring" hiện "Mai (20%)" trong danh sách Active & Upcoming Tasks (vì Bao/Mai có task ở project khác chưa lọc). Bật "Xem team đang trễ" (chỉ Huy Nguyen + Linh Tran đang trễ) → task "setup môi trường" đổi label từ "Bao" thành **"Unassigned"**, task "Evaluate Grafana Cloud vs self-hosted" đổi từ "Mai" thành **"Unassigned"** — xác nhận "By Project" giờ phản ánh đúng `filteredMembers`, nhất quán với tab Matrix (bật cùng filter, Matrix cũng chỉ hiện đúng 2 member Huy + Linh, không có Bao/Mai). Trước fix (ISS-05), nội dung "By Project" hoàn toàn không đổi theo filter. Reset lại → dữ liệu trở về đầy đủ bình thường, không có console error. |
| AC-03-2 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-03-3 | PASS | Giữ nguyên từ vòng 2, không đổi. |
| AC-03-4 | PASS | Giữ nguyên từ vòng 2, không đổi. |

## Verify issue fixed → closed

- **ISS-04** (notification `overdue_task` trùng lặp còn tồn đọng trong Firestore): **CLOSED**. Đã verify trực tiếp trên UI `/notifications` — không còn task nào có 2 notification `overdue_task` trùng nội dung. `qc-task-overdue-5d`, `qc-task-overdue-1d`, `task-phoenix-1` mỗi task đúng 1 bản.
- **ISS-05** (nút "Xem team đang trễ" không lọc tab "By Project"): **CLOSED**. Đã verify `app/dashboard/page.tsx` đổi `members={filteredMembers}` cho `ProjectAllocationGrid` hoạt động đúng trên UI thực — bật/tắt filter "Xem team đang trễ" làm thay đổi rõ ràng nhãn "Assigned"/"Unassigned" của task trong "By Project", nhất quán với tab Matrix.

## Kiểm tra khác

- `pnpm lint`: 0 errors, 9 warnings (cùng baseline pre-existing từ rev 1/2, không có warning mới).
- `pnpm build`: thành công, 0 errors.
- Không có console error nào phát sinh trong toàn bộ phiên test (Dashboard 4 tab, Notifications).
- Không phát hiện regression mới ở các khu vực liên quan (Dashboard 4 tab, Notifications).
- Dev server: gặp lỗi 500 (stale `.next` cache từ session cũ) khi bắt đầu, đã tự khắc phục bằng `rm -rf .next` + restart — không phải lỗi source code, không mở issue (tương tự hiện tượng đã ghi nhận ở ISS-03 vòng trước).

## Gợi ý cho BA

- (Nhắc lại từ vòng 2, chưa có thay đổi) `subscribeAllTasks` (`services/tasks.service.ts`) không có try/catch/validation khi parse từng doc Firestore — 1 doc dữ liệu sai định dạng có thể làm sập toàn bộ danh sách task của mọi member. Rủi ro có sẵn từ trước rev "Overdue Task Alerts", đáng cân nhắc cho rev sau.
