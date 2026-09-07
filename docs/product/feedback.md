# PM Feedback — 2026-09-07 (lần 2)

## Kết luận: ACCEPT

## Đạt

- FB-01 (US-2) — đã sửa đúng gốc: Tạo thử một task quá hạn mới và theo dõi qua nhiều lần load lại, notification luôn ghi đúng tên dự án thật ngay từ lần đầu tiên (đọc code `app/dashboard/page.tsx`: effect tạo notification giờ có `if (!projectsLoaded) return;` — chờ `projects` load xong mới ghi, đúng tra cứu `projects.find()` y hệt Dashboard đang dùng để hiển thị). Notification cũ "Rebuild pipeline caching layer — No project" vẫn còn thấy trên `/notifications` thật, nhưng đây là dữ liệu bị ghi sai **từ trước khi vá lỗi**, đúng như đã thống nhất trong spec là chấp nhận để nguyên, không backfill — không phải lỗi mới, cơ chế mới đã chứng minh hoạt động đúng.
- FB-02 (US-3) — đã sửa đúng tinh thần: Vào `/members/member-linh` và `/members/member-huy`, Timeline giờ hiện badge màu cam/đỏ "Overdue" rõ ràng cho các task quá hạn (khác hẳn "Planned"/"In Progress" màu trung tính), còn task đã Done dù endDate cũ vẫn hiện "Done" bình thường, không bị gắn nhầm Overdue. Giờ đứng ở đúng màn hình member tự xem task của mình, member/lead thấy ngay task nào đang trễ mà không cần qua Dashboard của PM.
- FB-03 (UX) — đã sửa đúng: đọc code `app/notifications/page.tsx`, `loading` khởi tạo `true` và chỉ tắt sau khi `subscribeNotifications` trả callback đầu tiên; trong lúc loading chỉ render Skeleton, không có đường nào để "You're all caught up" hiện ra trước rồi biến mất — không còn hiện tượng chớp gây hiểu lầm.
- Dashboard tổng thể không bị ảnh hưởng: StatCard "Overdue Tasks", danh sách Overdue Tasks (3 dòng, sắp xếp trễ nhiều nhất lên đầu), nút "Xem team đang trễ" lọc đúng còn Huy Nguyen + Linh Tran ở mọi tab, nút "Reset" hoạt động bình thường — mọi thứ đã ACCEPT ở lần preview trước vẫn giữ nguyên.

## Chưa đạt / cần sửa

Không có. Cả 3 góp ý FB-01/FB-02/FB-03 đã được giải quyết đúng gốc rễ (root cause), không phải vá tạm ở bề mặt. Đã tự tay đi qua từng màn hình bằng trình duyệt để xác nhận, không chỉ đọc báo cáo QC.

## Yêu cầu mới phát sinh

Không có. Sẵn sàng đưa cho team dùng thật.

---

## Feedback lần 1 (2026-09-07) — lịch sử/tham chiếu

### Kết luận: REVISE

### Đạt
- US-1 (Dashboard biết ngay ai trễ, task gì, dự án nào, trễ bao lâu): StatCard "Overdue Tasks" hiện "3 tasks" tone đỏ ngay khi vào Dashboard, khu vực "Overdue Tasks" bên dưới liệt kê đủ 3 dòng, sắp xếp trễ nhiều nhất lên đầu, mỗi dòng có tên task, member, dự án, badge "Trễ N ngày" rõ ràng — nhìn phát biết ngay, không phải rà thủ công.
- US-1 (nút "Xem team đang trễ"): bấm vào lọc đúng còn các member đang trễ, đã kiểm tra cả 4 tab Matrix/Timeline/By Project/Cards đều nhất quán (chỉ còn Huy Nguyen + Linh Tran). Nút "Reset" tắt lại đúng. UI rõ ràng, không gây nhầm lẫn với bộ lọc Bandwidth.
- US-1 (điều hướng): click vào dòng task quá hạn "QC Overdue 5 days task" đưa đúng tới trang chi tiết member Linh Tran, thấy được toàn bộ timeline task của member đó.
- US-2 (notification khi task trễ): vào `/notifications` thấy 3 notification loại quá hạn, đúng format "`<task>` đã quá hạn" / "`<member>` — `<project>` — trễ N ngày (hạn dd/mm/yyyy)" — đọc là hiểu ngay, không lặp/không trùng.

### Chưa đạt / cần sửa

- FB-01 (US-2, nghiêm trọng): Notification của task "Rebuild pipeline caching layer đã quá hạn" ghi **"Huy Nguyen — No project — trễ 1 ngày"**, trong khi Dashboard cùng lúc đó hiển thị task này rõ ràng thuộc dự án **"Phoenix CI/CD"**. Đây đúng là loại thông tin mà tính năng này sinh ra để tôi khỏi phải hỏi ai — nếu vào Notifications tôi thấy "No project" tôi sẽ phải quay lại Dashboard/hỏi người khác task này thuộc dự án nào, tức là quay lại đúng vấn đề gốc. Cần kiểm tra lại chỗ tạo notification (`relatedProjectId`/tra cứu tên dự án) đang lấy sai hoặc thiếu dữ liệu so với chỗ Dashboard đang tra cứu đúng.
- FB-02 (US-3, nhỏ nhưng đáng sửa): Khi click từ Dashboard vào task quá hạn để tới trang member (ví dụ "QC Overdue 5 days task" của Linh Tran), sang tới trang "Edit Linh Tran" thì task đó nằm trong Timeline với nhãn trạng thái "Planned" bình thường — không còn dấu hiệu nào (màu, badge, chữ) cho biết task này đang quá hạn. Member/Lead đứng ở màn hình này (đúng nơi họ xem task của chính mình theo US-3 "member muốn task của mình được đánh dấu rõ khi quá hạn") lại không thấy tín hiệu overdue nào cả — tín hiệu chỉ tồn tại ở Dashboard của PM. Cần ít nhất 1 dấu hiệu trực quan (màu đỏ, chữ "Overdue", badge) cho task quá hạn ngay tại trang member detail.
- FB-03 (nhỏ, trải nghiệm): Vào `/notifications` lần đầu (chưa từng mở trong phiên), trang có một khoảng hiện "You're all caught up / No notifications right now" trong chốc lát trước khi danh sách thật load ra. Nhìn thoáng qua dễ hiểu lầm là không có gì cần chú ý, rồi mới giật mình thấy 3 cảnh báo trễ hạn xuất hiện sau. Nên có trạng thái loading rõ ràng (skeleton) thay vì hiện luôn "đã xong việc" rồi đổi ý.

### Yêu cầu mới phát sinh
- Không có yêu cầu mới. FB-01 và FB-02 là lỗi/thiếu sót so với đúng tinh thần requirements.md ban đầu (biết đúng dự án; member tự thấy task mình bị đánh dấu), BA/Dev xử lý tiếp trong rev kế, không cần story mới.
