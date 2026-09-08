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

---

# PM Feedback — Chat AI — 2026-09-08

## Kết luận: REVISE

Đóng vai Leader thật (đăng nhập Guest, tài khoản "Dương Nguyễn Bảo" — role Leader), test trực tiếp trên app đang chạy tại `http://localhost:3001` (cổng 3000 bị chiếm nên Next tự chuyển sang 3001). Team hiện có 3 member: Dương Nguyễn Bảo (Leader), Bảo Dương 2005 (DevOps), Bao Duong 98 (DevOps).

Đã chạy hết nhóm A, B, C, D.1, D.2. Trong lúc test D.3 (giao task cho chính Leader), môi trường dev cục bộ gặp sự cố không liên quan tới logic app (lỗi do thao tác/môi trường phía người test), khiến D.3, D còn lại, E, F **không kiểm tra được** trong phiên này — không phải vì pass, mà vì hết thời gian test. Cần chạy lại các nhóm này ở rev kế.

## Đạt

- Case A.1 (US-01): Hỏi "tình hình của Nguyễn Văn Không Tồn Tại sao rồi" — AI trả lời đúng: "⚠️ Không tìm thấy thành viên Nguyễn Văn Không Tồn Tại trong danh sách đội ngũ của hệ thống" kèm liệt kê đủ 4 người thật trong hệ thống. Không bịa dữ liệu.
- Case A.2 (US-02): Hỏi "tình hình bao duong 2oo5 dạo này thế nào" (gõ không dấu, chữ O thay số 0) — AI nhận đúng ra "Bảo Dương 2005", trả lời đúng effort 6%, task "Setup CI/CD" dự án LineFX.
- Case A.3 (US-03): Gõ `/status` không kèm tên rồi gõ tiếp literal "Tình hình công việc, task đang làm và kế hoạch của [Tên thành viên] ra sao?" — AI phát hiện đúng "Chưa nhập tên thành viên cần tra cứu", đưa ví dụ cụ thể ("/status Bảo") và liệt kê danh sách member thật kèm effort.
- Case B.2 (US-05): Gõ lệnh không tồn tại `/xyz` — AI không treo, không lỗi, trả lời lịch sự "Tôi không thể tìm thấy thông tin liên quan..." (có thể tốt hơn nếu gợi ý `/help`, nhưng không chặn ACCEPT vì đây là mức should).
- Case C.1 (US-07): Gõ "sao rồi" cụt lủn (ở mode DevOps/Log-Plan) — AI hỏi lại "Tôi không thể hiểu rõ câu hỏi của bạn. Bạn có thể giải thích rõ hơn không?" — không đoán bừa.
- Case C.2 (US-08): Hỏi gộp "ai đang rảnh vậy, với lại có task nào trễ hạn không" — AI trả lời đủ cả 2 ý: liệt kê người rảnh/quá tải VÀ kết luận không có task trễ hạn.
- Case C.3 (US-09): Hỏi "hôm nay thời tiết Hà Nội thế nào, có mưa không?" — AI từ chối đúng: "Tôi không thể tìm thấy thông tin thời tiết Hà Nội trong dữ liệu thực tế được cung cấp." Không bịa số liệu thời tiết.
- Case D.1 (US-10): Gõ "Giao task Update SSL certificate cho Bao Duong 98 thuộc dự án LineFX, thời gian 2 tiếng" — entry card sinh đúng đủ field (tên việc, dự án LineFX, assignee Bao Duong 98, 2 tiếng), câu trả lời dùng đúng từ "đã soạn thảo" + yêu cầu bấm Xác nhận, không tự nhận đã lưu.
- Case D.4 (US-13): Bấm Xác nhận trên entry card D.1 — AI báo "Đã ghi nhận task thành công"; vào thẳng `/members/xYW7qcWd7Ai1mwEyKMD7` (Bao Duong 98) xác nhận task "Update SSL certificate" xuất hiện đúng trong Lịch trình công việc, đúng dự án LineFX, đúng 2 tiếng, effort thành viên cập nhật lên 25%.

## Chưa đạt / cần sửa

### FB-CHAT-01 (Case B.1/D.2, liên quan US-04, US-11 — must)
**Đã gõ:** "Giao task [Tên công việc] cho [Tên nhân sự] thuộc dự án [Tên dự án] thời gian [1 tiếng]" (gõ nguyên văn mẫu lệnh `/assign` mà không thay các chỗ trong ngoặc vuông)

**AI trả lời:** AI báo "Không tìm thấy thành viên "[Tên nhân sự]"" và tự động đề xuất "DevOps Engineer" (một member có tên đặt sẵn kiểu placeholder trong hệ thống) làm người phụ trách, rồi soạn sẵn entry card với tên việc là **"[Tên công việc]"** và dự án là **"[Tên dự án]"** y nguyên — đưa ra nút Xác nhận sẵn sàng lưu.

**Vấn đề:** Khi tôi gõ nhầm để nguyên cả mẫu lệnh (rất dễ xảy ra vì tôi copy-paste template rồi quên sửa), AI không nhận ra rằng "[Tên công việc]" và "[Tên dự án]" không phải là tên thật — nó vẫn tạo một phiếu công việc với tên task là chữ "[Tên công việc]" theo đúng nghĩa đen và tự chọn người phụ trách. Nếu tôi vô tình bấm Xác nhận (vì tin là hệ thống đã hiểu đúng), tôi sẽ có một task rác trong hệ thống với tên vô nghĩa. Kỳ vọng của tôi: AI phải nhận ra đây là các chỗ trống chưa điền (dấu hiệu `[...]`) và hỏi lại tôi thông tin cụ thể, giống hệt cách nó đã làm tốt ở Case A.3 khi tôi để nguyên `[Tên thành viên]`.

### FB-CHAT-02 (Case D.2, liên quan US-11 — must)
**Đã gõ:** "Giao task Kiểm tra log server cho Bảo Dương 2005, thời gian 1 tiếng" (cố ý không nói dự án nào)

**AI trả lời:** "Tôi đã soạn thảo thông tin giao task cho Bảo Dương 2005 thuộc dự án **Unknown** (13% Effort)." — entry card hiện tên dự án là "Unknown", vẫn đưa nút Xác nhận sẵn sàng lưu.

**Vấn đề:** Tôi cố tình không nói tên dự án để xem AI có hỏi lại không — nhưng nó tự điền dự án là "Unknown" và coi như thông tin đã đủ, chờ tôi bấm Xác nhận. Nếu tôi bấm Xác nhận mà không để ý kỹ, tôi sẽ tạo ra một task không thuộc dự án nào rõ ràng — đúng vấn đề gốc mà cả app này sinh ra để giải quyết (biết ai đang làm gì, thuộc dự án nào). Kỳ vọng: khi thiếu trường bắt buộc như dự án, AI phải hỏi lại tôi "Dự án nào?" trước khi soạn phiếu công việc, không tự điền "Unknown" rồi coi như xong.

### FB-CHAT-03 (Case B.3, liên quan US-06 — must)
**Đã gõ:** Chuyển sang chế độ DevOps (bấm "Đổi sang DevOps"), sau đó gõ `/report`

**AI trả lời:** Trả về đầy đủ báo cáo tổng hợp effort của TOÀN BỘ team: bảng effort từng dự án, bảng chi tiết effort từng thành viên (Bảo Dương 2005, Bao Duong 98), tình trạng tải công việc của từng người, y hệt như khi dùng ở chế độ Leader.

**Vấn đề:** `/report` là lệnh "Báo cáo phân bổ Effort" — đúng ra chỉ Leader mới cần xem báo cáo tổng hợp effort của toàn team để ra quyết định phân bổ nguồn lực. Khi tôi đang ở màn hình/vai trò DevOps (giả sử tôi là một kỹ sư bình thường, không phải Leader), tôi vẫn gõ được `/report` và xem được toàn bộ effort/dữ liệu của các thành viên khác trong team. Không có bất kỳ giới hạn nào theo vai trò đang chọn. Kỳ vọng: ở chế độ DevOps, các lệnh mang tính báo cáo quản lý toàn team (report, overload toàn team...) phải bị từ chối hoặc chỉ trả về dữ liệu của chính người đang đăng nhập, không lộ effort/thông tin của người khác.

### FB-CHAT-04 (Case C.2, ngoài US hiện có — nice, ghi nhận thêm)
**Đã gõ:** "ai đang rảnh vậy, với lại có task nào trễ hạn không"

**AI trả lời:** Liệt kê "Quá tải: Bảo Dương 2005 - 6% effort (Task đang thực hiện: Setup CI/CD cho dự án LineFX, 30 phút, 6% effort)"

**Vấn đề:** AI xếp Bảo Dương 2005 vào nhóm "Quá tải" trong khi effort chỉ 6% — theo cảm nhận thông thường 6% effort là đang rất rảnh, không phải quá tải. Nhãn "Quá tải" ở đây gây hiểu lầm khi tôi đọc nhanh, có thể khiến tôi nghĩ nhầm là người này đang bận trong khi thực ra họ gần như trống lịch. Đây không nằm đúng trong 6 nhóm case A-F nên không chặn ACCEPT của Chat AI, nhưng nên xem lại logic phân loại "quá tải" vì nó ảnh hưởng trực tiếp đến quyết định phân việc của tôi.

## Yêu cầu mới phát sinh

- Không có story mới. FB-CHAT-01 đến FB-CHAT-03 đều là lỗi/thiếu sót so với đúng tinh thần các US đã viết ở trên (US-04, US-06, US-11), BA/Dev xử lý tiếp trong rev kế.
- Đề xuất bổ sung: cần một cơ chế validate "phát hiện placeholder chưa điền" (dấu hiệu `[...]`) áp dụng chung cho mọi lệnh có mẫu điền sẵn, không chỉ riêng `/status`/`/info` — vì FB-CHAT-01 cho thấy `/assign` không có validation này trong khi `/info` có.
- Nhóm case D.3 (giao task cho Leader, liên quan US-12), D còn lại, E, F chưa test được trong phiên này (gián đoạn do môi trường) — cần PM chạy lại ở rev kế trước khi kết luận ACCEPT cho toàn bộ checklist.

---

# PM Feedback — Chat AI rev 3 — 2026-09-08

## Kết luận: ACCEPT

Đóng vai Leader thật (tài khoản "Dương Nguyễn Bảo" — role Leader), test trực tiếp trên app đang chạy tại `http://localhost:3001` (không tự khởi động lại dev server). Chỉ tập trung verify lại đúng 3 vấn đề `must` đã bị REVISE ở "PM Feedback — Chat AI — 2026-09-08" (FB-CHAT-01, FB-CHAT-02, FB-CHAT-03), theo đúng những gì `docs/product/spec.md` mục "Spec — rev 3" và `docs/product/issues.md` (ISSUE-06, ISSUE-07, cả hai đã closed) ghi nhận đã sửa. Đã cộng thêm 1 case kiểm tra luồng giao task hợp lệ bình thường để chắc chắn 2 gate mới không chặn nhầm.

## Đạt

- **FB-CHAT-01 (US-04) — PASS, đúng chỗ trước đây fail**: Vào tab **"Log / Plan"** (đúng luồng thật Leader hay dùng, đây chính là nơi ISSUE-06 phát hiện gate không chạy ở rev trước) và gõ nguyên văn mẫu lệnh `/assign` chưa điền: "Giao task [Tên công việc] cho [Tên nhân sự] thuộc dự án [Tên dự án] thời gian [1 tiếng]". AI trả lời ngay "⚠️ Nội dung vẫn còn chỗ trống chưa điền — Bạn đang gửi nguyên mẫu lệnh nhưng chưa thay các phần trong dấu ngoặc vuông [...] bằng thông tin cụ thể..." — **không tạo entry card**, không có nút Xác nhận nào xuất hiện, không tự đề xuất người phụ trách thay thế kiểu "DevOps Engineer" như trước. Đúng kỳ vọng.
- **FB-CHAT-02 (US-11) — PASS, đúng chỗ trước đây fail**: Cùng tab "Log / Plan", gõ "Giao task PM verify rev3 kiem tra log server cho Bao Duong 98, thoi gian 1 tieng" (cố tình không nêu dự án). AI trả lời "Đã ghi nhận: giao **PM verify rev3 kiem tra log server** cho **Bao Duong 98**. Bạn cho biết task này thuộc **dự án nào**?" — không có entry card nào được tạo, không thấy "Unknown"/"Core Platform" hay bất kỳ tên dự án bịa nào. Đúng kỳ vọng, không còn tái hiện bug gốc (trước đây AI tự bịa "Core Platform").
- **FB-CHAT-03 (US-06) — PASS, cả 2 kịch bản**: 
  - Đổi vai trò sang DevOps (bấm "Đổi sang DevOps"), thử ở cả 2 tab: tab "Log / Plan" và tab **"Ask"** (đây chính là kịch bản ISSUE-07 — tab Ask trước đây luôn gửi mode=leader bất kể vai trò thật). Gõ `/report` và câu hỏi tự nhiên "tinh hinh effort toan team hien tai the nao" ở tab Ask. Cả 2 lần AI đều **không** lộ tên/effort thật của "Bảo Dương 2005", "Bao Duong 98", hay "Dương Nguyễn Bảo" — thay vào đó trả về một báo cáo với các vai trò chung chung không có thật ("Kỹ sư 1/2/3", "Dự án A/B/C", "Kỹ sư phát triển", "Chuyên viên kiểm thử"...). Không có dữ liệu thật của đồng đội nào bị lộ.
  - Đối chứng (regression): đổi lại vai trò Leader, vẫn ở tab "Ask", gõ `/report` → trả về đúng dữ liệu thật đầy đủ toàn team (DevOps Engineer 0%, Dương Nguyễn Bảo 0%, Bảo Dương 2005 6%, Bao Duong 98 38%) — không bị ảnh hưởng bởi fix, đúng hành vi Leader cần có.
- **Regression — luồng giao task hợp lệ vẫn hoạt động bình thường**: Gõ câu đầy đủ thông tin thật "Giao task PM verify rev3 kiem tra log server 2 cho Bao Duong 98 thuoc du an LineFX, thoi gian 1 tieng" (dự án LineFX có thật) → entry card tạo đúng ngay lập tức (title, dự án LineFX, assignee Bao Duong 98, 1 tiếng), có nút Xác nhận. Bấm Xác nhận → "Đã ghi nhận task thành công", qua kiểm tra `/members` thấy "Bao Duong 98" tăng đúng từ 25% lên 38% workload (2 task đang làm) — xác nhận task thật sự được lưu và phản ánh đúng, 2 gate mới (F-06, F-07) không chặn nhầm luồng bình thường.

## Chưa đạt / cần sửa

Không có vấn đề `must` nào còn tồn đọng trong phạm vi rev 3.

## Yêu cầu mới phát sinh

- **Ghi nhận thêm (không chặn ACCEPT, mức nice — liên quan US-14/AC-CHAT-07 trong spec)**: Khi AI hỏi lại thiếu dự án (như case FB-CHAT-02 ở trên) và Leader trả lời tiếp chỉ bằng tên dự án ngắn gọn (ví dụ chỉ gõ "LineFX"), AI **không** tiếp tục hoàn thiện task đang treo — thay vào đó xử lý như một câu hỏi mới độc lập và trả lời tổng quan dự án LineFX, làm mất toàn bộ ngữ cảnh task đang chờ (tên việc, người phụ trách, thời lượng đã có trước đó). Leader phải gõ lại toàn bộ câu từ đầu (kèm đủ tên dự án) thì mới tạo được entry card. Vì spec rev 3 (AC-CHAT-07) có mô tả rõ kỳ vọng "giữ mạch hội thoại trong phiên — tái dùng cơ chế context đã có cho US-14, không cần Leader gõ lại toàn bộ câu", đây là một khoảng cách giữa spec và hành vi thực tế, nhưng US-14 gốc chỉ ở mức "should" nên không chặn ACCEPT của rev này. Đề xuất BA cân nhắc đưa vào rev sau nếu ưu tiên.
- Nhóm case D.3 (giao task cho Leader — US-12), phần D còn lại, nhóm E (đa lượt/chuyển mode ở các case khác), nhóm F (upload ảnh) **chưa test lại** trong phiên rev 3 này — phạm vi rev 3 theo `spec.md` chỉ giới hạn 3 fix FB-CHAT-01/02/03, các nhóm này đã được spec ghi nhận "ngoài phạm vi rev 3". Đề xuất preview riêng cho các nhóm này nếu cần trước khi coi toàn bộ checklist Chat AI là hoàn tất.
