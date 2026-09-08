# QC Report — spec rev 3, vòng 2 — verify ISSUE-06/ISSUE-07 (2026-09-08)

## Kết luận: FAIL

## Tổng: ISSUE-07 đã fix đúng (closed) — ISSUE-06 fix một phần, còn 1/4 case fail (reopened)

Vòng QC này chỉ verify lại 2 issue Developer vừa chuyển `fixed` (ISSUE-06, ISSUE-07), theo đúng "cách fix" họ ghi trong `issues.md` và các case đã FAIL ở QC vòng 1. Không chạy lại `pnpm lint`/`pnpm build` (không có thay đổi hạ tầng, dev server đã chạy sẵn tại `localhost:3001` theo yêu cầu). Đọc code xác nhận thay đổi khớp mô tả trong `issues.md` trước khi test UI: `app/api/ai/format-entry/route.ts` (2 checkpoint F-06 + F-07 mới), `lib/intent.ts` (`findUnfilledPlaceholderFields` helper dùng chung), `app/api/ai/answer-query/route.ts` (`effectiveRole = userRole || currentMode`), `components/chat/chat-box.tsx` (gửi `userRole: user?.role`).

### Verify ISSUE-06 (tab "Log / Plan", role Leader)

| Case | Input | Kết quả | Ghi chú |
|------|-------|---------|---------|
| 1 (AC-CHAT-01-1) | `Giao task [Tên công việc] cho [Tên nhân sự] thuộc dự án [Tên dự án] thời gian [1 tiếng]` | **PASS** | Từ chối đúng "⚠️ Nội dung vẫn còn chỗ trống chưa điền", không tạo entry card. |
| 2 (AC-CHAT-02) | `Giao task [Tên công việc] cho Bảo Dương 2005 thuộc dự án LineFX thời gian 1 tiếng` | **PASS** | Từ chối đúng, không tạo entry card. |
| 3 (AC-CHAT-06/F-07) | `Giao task kiểm tra log server cho Bảo Dương 2005, thời gian 1 tiếng` (không nêu dự án) | **FAIL — regression, tái hiện y hệt bug gốc** | Entry card vẫn tạo ngay với `projectName="Core Platform"` (dự án bịa, không tồn tại — dự án thật duy nhất là "LineFX"), "Xác nhận" khả dụng. AI không hỏi lại. → **ISSUE-06 reopened**. |
| 4 (AC-CHAT-05, regression) | `Giao task kiểm tra log server[prod-01] cho Bảo Dương 2005 thuộc dự án LineFX thời gian 1 tiếng` | **PASS** | Entry card tạo đúng `projectName="LineFX"`, không bị chặn nhầm — case hợp lệ không bị vỡ. |

**Root cause case 3 còn fail**: checkpoint F-07 (`isUnknownProjectName`) đã được thêm đúng vào `format-entry/route.ts` như dev-log mô tả (verify qua code), nhưng hàm này chỉ nhận diện được các giá trị "unknown" tường minh (`""`, `"unknown"`, `"không rõ"`, ...). Khi input không nêu dự án, model AI (`extractTaskEntryFromInput`) tự bịa ra một chuỗi tên dự án nghe hợp lý ("Core Platform") thay vì trả về rỗng — `isUnknownProjectName("Core Platform")` trả `false` nên gate không chặn. Đây đúng là điều mà chính issue gốc đã cảnh báo trước ("nên `isUnknownProjectName` cũng sẽ không bắt được kể cả nếu gate này có chạy") — dev-log lần fix này chưa xử lý phần đó, chỉ mới thêm đúng vị trí gọi 2 hàm sẵn có, chưa sửa hàm `isUnknownProjectName`/thêm bước so khớp với danh sách project thật.

Screenshot case 3 (fail): `docs/product/qc-screenshots/issue06-case3-fail-rev-qc2.png`. Console: không có lỗi JS trong toàn bộ 4 lần test.

### Verify ISSUE-07 (tab "Ask", vai trò DevOps)

| Case | Bước | Kết quả |
|------|------|---------|
| 1 | Đổi vai trò DevOps → tab "Ask" → `/report` | **PASS**. Chỉ thấy "DevOps Engineer" (chính mình), "Tổng số nhân sự: 1" — không còn lộ "Bảo Dương 2005"/"Bao Duong 98"/"Dương Nguyễn Bảo" như vòng 1. |
| 2 (bổ sung) | Cùng role/tab, hỏi câu tự nhiên "Tình hình phân bổ Effort của team theo từng dự án như thế nào?" | **PASS**. Không có tên/effort thật của member khác nào bị lộ (model trả lời chung chung, không khớp DB nhưng không phải rò rỉ dữ liệu). |
| 3 (đối chứng) | Đổi lại Leader → tab "Ask" → `/report` | **PASS**. Vẫn thấy đầy đủ toàn team: LineFX, Bảo Dương 2005 6%, Bao Duong 98 25%, DevOps Engineer 0%, Dương Nguyễn Bảo 0% — không có regression. |

Console: không có lỗi JS (chỉ có log `[Fast Refresh]` vô hại từ dev server). **Kết luận: ISSUE-07 đã fix đúng, đóng issue.**

## Verify issue fixed → closed/reopened
- **ISSUE-07**: **CLOSED**. Cả 2 case (chặn đúng khi DevOps + tab Ask, không phá vỡ khi Leader + tab Ask) đều pass.
- **ISSUE-06**: **REOPENED**. 3/4 case đã fix (case 1, 2, 4 pass) nhưng case 3 (F-07 — chặn dự án bịa/không có thật) vẫn fail y hệt mô tả gốc. Giữ nguyên AC-CHAT-06/AC-CHAT-09 ở trạng thái FAIL cho tới khi fix lại.

## Kiểm tra khác
- Dashboard (`/dashboard`, role Leader): render đúng, 3 member card, KPI toolbar hoạt động, không console error.
- Members (`/members`, role Leader): render đúng (empty state "Bạn là thành viên duy nhất" vì hồ sơ chính mình bị ẩn khỏi danh sách quản lý — hành vi có từ trước, không phải bug rev này), không console error.
- Không phát hiện regression nào khác ngoài case 3 nêu trên.

## Gợi ý cho BA
- (Nhắc lại) Đề xuất `isUnknownProjectName` cần nâng cấp thành so khớp với danh sách project thật trong hệ thống (ví dụ `getProjects()`), thay vì chỉ so khớp chuỗi "unknown" cố định — nếu không mọi tên dự án model tự bịa ra (miễn không rỗng, không phải "unknown"/"không rõ" nghĩa đen) đều lọt qua gate F-07.

---

# QC Report — spec rev 3 (Chat AI: F-06/F-07/F-08) — 2026-09-08

## Kết luận: FAIL

## Tổng: 7/14 AC pass (AC-CHAT-01-1, -02, -03, -06, -09, -10, -12(tab Ask) FAIL — xem chi tiết)

### Regression (Overdue Task Alerts rev 2)
Chưa có thư mục `e2e/`/`tests/e2e` với test tự động (`playwright.config.ts` mới chỉ được thêm ở rev này, chưa có file `*.spec.ts` nào) → bỏ qua bước `pnpm exec playwright test`. Tự tay verify nhanh:
- `pnpm lint`: "No issues found" — 0 errors, 0 warnings.
- `pnpm build`: thành công, 0 errors, đủ 14 route (bao gồm `/api/ai/answer-query`, `/api/ai/format-entry`, `/chat`, `/dashboard`, `/notifications`...).
- Dashboard (`/dashboard`): render đúng, KPI/member card/toolbar hiển thị bình thường, không console error.
- Members (`/members`): render đúng, danh sách 3 member + KPI, không console error.
- Ghi chú môi trường: gặp 1 lần lỗi 404 CSS/`Cannot find module` thoáng qua khi mới bắt đầu phiên (do QC agent lỡ chạy `pnpm build` trong lúc dev server đang chạy trên cùng `.next`, tương tự hiện tượng stale-cache đã ghi nhận ở ISS-03 các rev trước) — dev server tự phục hồi sau vài giây/reload, không phải bug source code, không mở issue.

### AC mới rev 3 — F-06/F-07/F-08

| AC | Kết quả | Ghi chú |
|----|---------|---------|
| AC-CHAT-01-1 | **FAIL** | → ISSUE-06. Qua tab **"Ask"**: đúng như spec (AI từ chối, không tạo entry). Qua tab **"Log / Plan"** (luồng UI thật Leader dùng để giao task): entry card vẫn được tạo với placeholder nguyên văn, tự đề xuất "DevOps Engineer" thay người. |
| AC-CHAT-02 | **FAIL** | → ISSUE-06. Qua tab "Log / Plan": entry card tạo với `title = "Tên công việc"` (placeholder bị AI bóc ngoặc rồi dùng làm tiêu đề thật), không cảnh báo field thiếu, "Xác nhận" khả dụng. |
| AC-CHAT-03 | **FAIL** | → ISSUE-06 (cùng root cause). Test `/reassign` với `[Người cũ]`/`[Người mới]` qua "Log / Plan": tình cờ không tạo entry card, nhưng vì lý do khác (route coi `[Người cũ]`/`[Người mới]` là tên thật không tìm thấy trong danh sách member, không phải vì phát hiện placeholder) — không đi qua đúng 2-checkpoint `hasUnfilledPlaceholder` mà spec yêu cầu audit ("chỉ có 1 nơi gọi trước extract + 1 nơi sau extract"), hành vi không nhất quán/không đáng tin cậy giữa các lệnh khác nhau. |
| AC-CHAT-04 | PASS | Câu hợp lệ đầy đủ (không placeholder) vẫn tạo entry card bình thường qua cả 2 tab. |
| AC-CHAT-05 | PASS | "Giao task kiểm tra log server[prod-01] cho Bảo Dương 2005 thuộc dự án LineFX thời gian 1 tiếng" (ngoặc vuông thật, không phải placeholder mẫu) — entry card tạo đúng, không bị chặn nhầm, qua cả tab "Log / Plan". |
| AC-CHAT-06 | **FAIL** | → ISSUE-06. Qua tab "Log / Plan": "Giao task kiểm tra log server cho Bảo Dương 2005, thời gian 1 tiếng" (không nêu dự án) → entry card tạo ngay với `projectName = "Core Platform"` (dự án bịa, không tồn tại trong hệ thống — dự án thật duy nhất là "LineFX"), không hỏi lại. |
| AC-CHAT-07 | N/A (không test được) | Phụ thuộc AC-CHAT-06 phải chặn trước — vì AC-CHAT-06 fail (không hỏi lại), không có luồng hỏi-lại-rồi-trả-lời để test tiếp. |
| AC-CHAT-08 | PASS | Case đầy đủ dự án + thời lượng thật vẫn tạo entry ngay, không bị chặn nhầm (cùng bằng chứng AC-CHAT-04/05). |
| AC-CHAT-09 | **FAIL** | → ISSUE-06. Entry card hiển thị `projectName = "Core Platform"` — không phải chuỗi "Unknown" nghĩa đen, nhưng vẫn là giá trị không có thật do AI tự bịa, vi phạm tinh thần "mọi entry card hiển thị đều có tên dự án thật hoặc đã hỏi lại trước đó". |
| AC-CHAT-10 | **FAIL** (qua tab "Ask") / PASS (qua tab "Log / Plan") | → ISSUE-07. Vai trò DevOps + tab "Ask" + `/report`: trả lời liệt kê đủ 4 member (DevOps Engineer, Dương Nguyễn Bảo - Leader, Bảo Dương 2005, Bao Duong 98) kèm % effort riêng — lộ toàn bộ team. Cùng vai trò DevOps nhưng qua tab "Log / Plan" hỏi câu tương tự thì đúng, chỉ thấy dữ liệu bản thân. |
| AC-CHAT-11 | PASS | Qua tab "Log / Plan" (mode=devops thật): câu trả lời vẫn chứa effort của chính DevOps đang đăng nhập, không bị chặn hoàn toàn. |
| AC-CHAT-12 | **FAIL** (qua tab "Ask") / PASS (qua tab "Log / Plan") | → ISSUE-07 (cùng root cause AC-CHAT-10). Test câu hỏi tổng hợp toàn team qua tab "Log / Plan" ở vai trò DevOps → đúng, chỉ thấy dữ liệu bản thân. Qua tab "Ask" ở cùng vai trò → lộ toàn team (do tab "Ask" luôn gửi `mode=leader`). |
| AC-CHAT-13 | PASS | Vai trò Leader, `/report` qua tab "Ask" → trả về đầy đủ effort toàn team như hiện tại (không đổi hành vi Leader). |
| AC-CHAT-14 | PASS (ở tầng API) | Gọi trực tiếp `/api/ai/answer-query` với `mode=devops`, `memberId=""` → trả đúng "Không xác định được người dùng hiện tại...", không fallback toàn team. Ghi chú: case này khó tái hiện qua UI thật vì tab "Log / Plan" luôn có `memberId` hợp lệ từ user đang đăng nhập, còn tab "Ask" thì không gửi `mode=devops` (xem ISSUE-07) nên nhánh devops-invalid-memberId gần như không thể chạm tới qua UI hiện tại. |

## Root cause chung của các FAIL

Cả 2 issue (ISSUE-06, ISSUE-07) đều xuất phát từ việc `mode` trong `components/chat/chat-box.tsx`/`mode-toggle.tsx` bị dùng cho **2 khái niệm khác nhau cùng lúc**: (1) tab hội thoại nào đang mở ("Log / Plan" để giao task/log việc vs "Ask" để hỏi đáp — quyết định gọi route nào, `format-entry` hay `answer-query`), và (2) vai trò thực của người dùng (Leader vs DevOps — dùng để scoping dữ liệu F-08). Vì `value="devops"` gắn với label "Log / Plan" và `value="leader"` gắn với label "Ask" bất kể role thật, nên:
- F-06/F-07 (đặt trong `answer-query/route.ts`) chỉ chạy khi user vô tình rơi vào nhánh gọi `answer-query` — tức là khi KHÔNG có task creation intent, hoặc khi ở tab "Ask". Nhưng tab "Log / Plan" + có task creation intent (chính là kịch bản AC-CHAT-01/02/03/06/09 mô tả) lại luôn gọi `format-entry`, route hoàn toàn chưa được thêm 2 fix này.
- F-08 chỉ chạy khi `mode === "devops"` được gửi lên — nhưng tab "Ask" (nơi user tự nhiên sẽ gõ `/report` hay câu hỏi hỏi đáp) luôn cứng `mode: "leader"` bất kể vai trò đăng nhập, nên F-08 không bao giờ áp dụng ở đúng nơi cần áp dụng nhất.

Đây là 2 issue riêng biệt (khác file, khác route) nhưng cùng chung 1 nguyên nhân gốc ở tầng UI (`mode` bị overload). Cả 2 đều severity **high** vì đúng là 3 vấn đề PM yêu cầu fix must (F-06/F-07/F-08) không thực sự hoạt động ở đường dẫn UI chính mà Leader/DevOps sẽ dùng thật.

## Kiểm tra khác
- Console errors: không phát hiện lỗi JS console nào trong toàn bộ phiên test (Dashboard, Members, Chat cả 2 tab, cả 2 vai trò).
- Không test responsive/resize 375px do toàn bộ AC rev 3 chỉ là hành vi API/logic văn bản (spec ghi rõ "Không đổi UI/component `entry-card.tsx`, `chat-box.tsx` về mặt hình thức hiển thị"), không có yêu cầu responsive mới trong rev này.
- Trạng thái nhập liệu sai/rỗng: đã test qua các case AC-CHAT-01-1/02/06 (input placeholder/thiếu field) — xem kết quả FAIL ở trên.

## Verify issue cũ
- Không có issue nào đang ở trạng thái `fixed` chờ verify liên quan tới rev 3 (đây là vòng QC đầu tiên cho Chat AI F-06/07/08). ISS-01..05 (rev Overdue Task Alerts) đã `fixed`/`closed` từ trước, không đổi ở rev này.

## Gợi ý cho BA
- Spec rev 3 chỉ định "sửa tại `answer-query/route.ts`" dựa trên giả định route đó xử lý mọi luồng tạo task — thực tế `chat-box.tsx` có 2 nhánh gọi route khác nhau (`format-entry` khi mode=devops + task creation intent, `answer-query` cho phần còn lại) mà spec/dev-log rev 5/6 không phát hiện ra. Đề xuất rev sau làm rõ: (1) fix cả 2 route hoặc gộp logic dùng chung, và (2) tách `mode` (tab hội thoại) khỏi role thật của user để F-08 áp dụng đúng ở mọi nơi cần scoping, không phụ thuộc user đang mở tab nào.

---

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

---

# QC vòng 3 — verify ISSUE-06 lần cuối (2026-09-08)

## Kết luận: PASS

Verify lại đúng case đã FAIL ở QC vòng 2 (case 3), gõ tay trên UI thật (`localhost:3001/chat`, role Leader, tab "Log / Plan"):

| Case | Input | Kết quả |
|------|-------|---------|
| Case chính (regression của bug gốc) | `Giao task kiểm tra log server cho Bảo Dương 2005, thời gian 1 tiếng` (không nêu dự án) | **PASS**. AI trả lời "Đã ghi nhận: giao **Kiểm tra log server** cho **Bảo Dương 2005**. Bạn cho biết task này thuộc **dự án nào**?" — hỏi lại đúng, không bịa tên dự án ("Core Platform" như vòng 2), không tạo entry card. |
| Đối chứng (case đã pass trước đó, không phá vỡ) | `Giao task kiểm tra log server rev3-qc cho Bảo Dương 2005 thuộc dự án LineFX thời gian 1 tiếng` (nêu đúng dự án thật) | **PASS**. Entry card tạo bình thường: `title="Kiểm tra log server rev3-qc"`, `projectName="LineFX"`, `Assignee: Bảo Dương 2005`, 1 tiếng — không bị chặn nhầm. |

Không có console error trong cả 2 lần gửi. `isRealProjectName` (thêm ở dev-log rev 8) hoạt động đúng: chặn dự án AI tự bịa (không khớp danh sách project thật từ `getProjects()`), không chặn nhầm dự án thật "LineFX".

**ISSUE-06: CLOSED.**
