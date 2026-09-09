# PM Feedback — 2026-09-09 (lần 5, xác nhận fix FB-CHAT-04/FB-CHAT-03 — QC rev 14 PASS)

## Kết luận: ACCEPT

Vòng preview này chỉ tập trung xác nhận lại bằng chính tay 2 vấn đề đã ghi ở feedback lần 4 (FB-CHAT-04, FB-CHAT-03), sau khi QC đã verify PASS ở rev 14. Đăng nhập cả devops thật (`dev@test.com`) và leader thật (`admin@test.com`), gõ tay trực tiếp vào ô chat (không dùng lại text/session cũ — có sign out/sign in lại giữa 2 role để đảm bảo đúng phiên).

## Đạt

- **FB-CHAT-04 (devops hỏi chéo bị lộ thông tin đồng nghiệp) — đã hết.** Đăng nhập `dev@test.com`, `/chat` tab Ask, gõ tay đúng câu đã fail trước: `"Dương Bảo đang làm task gì vậy?"`. Kết quả nhận được: `"⚠️ Không tìm thấy thành viên Dương Bảo trong danh sách đội ngũ của hệ thống. Thành viên hiện có: dev@test.com — Kỹ sư DevOps, đang sẵn sàng, 0 phút effort."` — không còn lộ bất kỳ chi tiết task/effort/dự án nào của Dương Bảo, và danh sách "thành viên hiện có" cũng chỉ liệt kê chính người hỏi, không còn liệt kê đồng nghiệp khác để dò tiếp. Khớp đúng kỳ vọng "devops không mở rộng quyền tra cứu sang người khác".
- **FB-CHAT-03 (gợi ý câu lệnh nhanh sai phạm vi) — đã hết.** Cùng phiên `dev@test.com`, tab Ask, phần "Gợi ý câu lệnh nhanh" giờ chỉ còn 3 câu đúng phạm vi bản thân: "Task của tôi hôm nay có gì?", "Tôi còn effort trống bao nhiêu?", "Tiến độ các task của tôi hiện tại thế nào?" — không còn 3 câu phạm vi toàn team ("Ai trong team đang rảnh...", "Tổng hợp task trễ hạn...", "Tình hình phân bổ effort team...") từng mời devops thử hỏi ngoài quyền.
- **Regression leader — không bị ảnh hưởng.** Đăng nhập `admin@test.com` (sidebar đúng "Quản lý (Leader View)"), `/chat` tab Ask: (a) gợi ý câu lệnh nhanh vẫn đúng phạm vi team như cũ (3 câu team-wide, không đổi so với trước); (b) gõ tay lại đúng câu `"Dương Bảo đang làm task gì vậy?"` — leader vẫn nhận được đầy đủ chi tiết: trạng thái, tổng effort (180 phút/3 giờ), bảng 3 task đang làm (tên task, dự án Phoenix CI/CD, effort, hạn hoàn thành) và phần kết luận/đề xuất. Đúng như spec — chỉ leader mới tra cứu chi tiết người khác được.

## Chưa đạt / cần sửa

Không có. Cả 2 vấn đề của lần feedback trước đã được xác nhận đóng bằng thao tác tay thật, không có regression phát sinh.

## Yêu cầu mới phát sinh

Không có.

---

# PM Feedback — 2026-09-09 (lần 4, preview lại sau fix P0 — QC rev 13 PASS 12/12 AC)

## Kết luận: ACCEPT (kèm 1 vấn đề mới cần theo dõi, không phải blocker)

Vòng preview này tập trung xác nhận lại đúng 2 bug P0 đã chặn hoàn toàn ở lần feedback trước (FB-CHAT-01, FB-CHAT-02), sau khi QC đã verify PASS 12/12 AC ở rev 13. Đã tự tay đăng nhập cả leader thật (`admin@test.com`) và devops thật (`dev@test.com`), gõ tay trực tiếp vào ô chat (không dùng lại text cũ, không chỉ đọc code) — cả 2 bug P0 đều đã hết. Đi thêm 1 vòng Dashboard/Dự án/Đội ngũ/Danh sách Task không thấy hỏng gì mới. Phát hiện thêm 1 vấn đề ranh giới quyền chưa từng ghi nhận trước đây (devops hỏi được task của đồng nghiệp khác qua chat) — không phải blocker vận hành hàng ngày nhưng cần fix vì trái spec, ghi làm rev sau.

## Đạt

- **FB-CHAT-01 (leader bị từ chối quyền khi giao task) — đã hết.** Đăng nhập `admin@test.com`, sidebar đúng "Quản lý (Leader View)", vào `/chat` tab Ask, gõ tay: `"Giao task deploy service billing cho Dương Bảo thuộc dự án Phoenix CI/CD, effort 1 tiếng, bắt đầu hôm nay"`. AI không còn từ chối quyền — trả lời đúng tinh thần "đã soạn đề xuất, vui lòng bấm Xác nhận", hiện EntryCard đúng field: tên task "Deploy service billing", dự án "Phoenix CI/CD", Assignee "Dương Bảo", 1 tiếng, ngày 2026-09-09, có 2 nút "Chỉnh sửa"/"Xác nhận". Bấm Xác nhận → AI báo "Đã ghi nhận task thành công". Verify tiếp: qua lại Dashboard leader (không tải lại nhiều lần, chỉ chuyển trang bình thường), thấy ngay task mới nằm đúng dưới card Dương Bảo, đúng dự án Phoenix CI/CD, đúng 1 tiếng, "ĐANG LÀM" tăng đúng từ 2 lên 3. Cũng thấy lại đúng task này ở `/tasks` (Danh sách Task) và `/projects` (Dự án). Tính năng cốt lõi nhất của cả spec — "leader giao task bằng lời" — giờ dùng được thật, không chỉ verify qua Firestore như QC mà còn thấy tận mắt trên UI.
- **FB-CHAT-02 (devops hỏi việc của mình bị hiểu nhầm thành lệnh tạo task/gán nhầm người) — đã hết ở cả 2 nhánh.** Đăng nhập `dev@test.com`, sidebar đúng "Không gian (DevOps View)". Ở tab **Log/Plan** (tab mặc định), gõ tay `"task của tôi hôm nay là gì?"` — không còn tạo EntryCard bịa/gán nhầm người như trước; AI trả lời đúng dạng báo cáo tình trạng cá nhân ("Trống việc – 0 phút, không có task nào, đang rảnh có thể nhận task mới"), đúng phạm vi `dev@test.com`. Chuyển sang tab **Ask**, gõ lại y hệt câu hỏi — cũng trả lời đúng, tự nhận diện "tôi" = user đang đăng nhập, không cần gõ đích danh tên như khuyến nghị tạm thời trước đây. Đây là 2 nhánh đã từng lỗi khác nhau (a: Log/Plan route sai thành lệnh tạo task; b: Ask không tự suy ra "tôi") — cả hai đều xác nhận hết lỗi qua thao tác tay thật.
- Đi thêm 1 vòng nhanh Dashboard (leader và devops), `/projects`, `/members`, `/tasks` — không phát hiện hỏng gì mới so với các lần preview trước, số liệu nhất quán giữa các màn hình (effort, task, dự án khớp nhau).

## Chưa đạt / cần sửa

- **FB-CHAT-04 (mới, ranh giới quyền tra cứu của devops)**: Vẫn trong phiên `dev@test.com`, tab Ask, sau khi hỏi đúng về bản thân, tôi hỏi tiếp (đa lượt, cùng phiên) `"Dương Bảo đang làm task gì vậy?"` — kỳ vọng theo `requirements.md` ("devops hỏi về bản thân là chính... không mở rộng quyền tra cứu của devops sang dữ liệu người khác") là AI từ chối hoặc chỉ trả lời được về chính `dev@test.com`. Thực tế AI trả lời đầy đủ chi tiết: "Dương Bảo hiện đang có 3 task đang thực hiện, tổng effort 180 phút (3 giờ) trong dự án Phoenix CI/CD" kèm bảng liệt kê tên task/dự án/effort/hạn hoàn thành của Dương Bảo — một devops khác, không phải người đang hỏi. Đây là rò rỉ dữ liệu ngoài phạm vi: một kỹ sư devops bất kỳ có thể dùng chat để xem chi tiết task/effort của đồng nghiệp khác, điều mà theo đúng tinh thần spec chỉ leader mới được làm. Không phải lỗi chặn dùng hàng ngày (không mất dữ liệu, không ghi sai), nhưng là lỗ hổng ranh giới quyền cần vá ở rev sau.
- FB-CHAT-03 (nhỏ, UX, đã ghi nhận từ lần trước, vẫn còn nguyên) — Ở tab Ask của devops, "Gợi ý câu lệnh nhanh" vẫn hiện y hệt leader (3 câu hỏi phạm vi toàn team: "Ai trong team đang rảnh...", "Tổng hợp task trễ hạn...", "Tình hình phân bổ effort team..."), trong khi devops chỉ nên hỏi về bản thân. Sau phát hiện FB-CHAT-04 ở trên, gợi ý sai phạm vi này càng đáng lo hơn vì nó chủ động mời devops thử những câu hỏi ngoài quyền — nên gộp sửa cùng lúc với FB-CHAT-04.

## Góp ý UI/UX tổng thể (vai trò leader dùng hàng ngày, không phải bug)

- Dashboard leader (`/dashboard`) là điểm mạnh nhất của app: nhìn một màn hình biết ngay ai rảnh (5), ai đang làm (1), quá tải (0), trễ hạn (0), đúng đúng câu hỏi cốt lõi "tuần này ai rảnh". Card mỗi member gộp đủ trạng thái + danh sách task đang làm kèm dự án/hạn/effort — không cần bấm thêm để biết.
- Luồng giao task qua chat (proposal → xác nhận → xuất hiện ngay trên Dashboard) mượt, không cần F5, đúng kỳ vọng "làm xong là thấy ngay" của một leader bận rộn.
- Trang Danh sách Task (`/tasks`) và Dự án (`/projects`) hiển thị nhất quán với Dashboard — dùng được để đối chiếu nhanh khi cần.
- 1 điểm nên cân nhắc (không phải bug, chỉ là nhận xét dùng thật): trang "Đội ngũ DevOps" hiện đầy đủ cả leader (`admin@test.com`, badge "Trưởng nhóm") khi devops xem, trong khi Chat AI lại lọc leader ra khỏi câu trả lời cho devops — hai nơi đang không nhất quán về việc devops có "thấy" leader hay không. Có thể là chủ ý (trang Member là danh bạ tổ chức công khai, Chat là hỏi-đáp cá nhân hóa), nhưng nên xác nhận lại đây là chủ ý chứ không phải sót, để tránh mâu thuẫn khi có câu hỏi từ team sau này.

## Chưa test được (giới hạn công cụ, không phải PASS)

- Nhóm B (slash-command sai mode), D-đầy đủ (giao task thiếu trường, giao cho leader bị từ chối, bấm Chỉnh sửa), F (upload ảnh) — không lặp lại trong lượt này vì đã PASS ở QC rev 8-13 và trọng tâm lượt này là verify riêng 2 bug P0 đã báo. Khuyến nghị PM đi lại đầy đủ checklist A-F một lượt nữa ở lần preview kế tiếp (không phải vì nghi ngờ, mà vì đã khá lâu chưa PM tự tay đi lại toàn bộ từ đầu).
- Test dùng nhiều tab trình duyệt cùng lúc (để so sánh leader/devops song song) gây hiện tượng phụ: điều hướng bằng gõ thẳng URL đôi lúc load nhầm sidebar/session cũ trong tích tắc do các tab share chung localStorage — đây là nhiễu do cách test (nhiều tab cùng origin), không phải bug ứng dụng; khi dùng đúng 1 tab/1 phiên như người dùng thật (click điều hướng trong app, không mở nhiều tab) thì không gặp lại hiện tượng này.

## Yêu cầu mới phát sinh

Không có yêu cầu mới. FB-CHAT-04 là vấn đề ranh giới quyền phát sinh trong lúc verify (không có trong checklist gốc — đã bổ sung case "hỏi chéo về đồng nghiệp" làm case mới cho nhóm E của checklist Chat AI trong `pm.md`/quy trình test kế tiếp), xử lý ở rev sau theo đúng tinh thần "devops không mở rộng quyền tra cứu sang người khác" đã ghi trong `requirements.md`.

---

# PM Feedback — 2026-09-09 (lần 3, preview UI đầy đủ qua browser) — REGRESSION nghiêm trọng

## Kết luận: REVISE (blocker — không dùng được cho team ngay lúc này)

Đây là vòng preview tổng thể app (không chỉ Chat AI) trong vai leader thật: đăng nhập, tạo dự án, giao task qua form, sửa/hoàn thành task, quản lý member, và quan trọng nhất — dùng Chat AI đúng checklist bắt buộc (nhóm A-F). Các màn hình Dashboard/Dự án/Quản lý Đội ngũ/Danh sách Task hoạt động tốt, UI rõ ràng (xem phần "Đạt" bên dưới). Nhưng khi test Chat AI bằng thao tác thật trên trình duyệt (không chỉ đọc code), phát hiện **2 bug blocker mới** khiến đúng 2 tính năng cốt lõi nhất của Chat AI — "leader giao task bằng lời" và "devops hỏi việc của chính mình" — không dùng được, mâu thuẫn trực tiếp với kết luận ACCEPT đã ghi ở lần feedback trước (bên dưới). Có thể đây là regression phát sinh sau lần ACCEPT đó (nhiều file liên quan đang ở trạng thái sửa dở theo git status), cần dev kiểm tra lại trước khi đưa cho team dùng thật.

## Đạt

- Luồng leader cơ bản ngoài chat: đăng nhập `admin@test.com`, tạo dự án mới ("Phoenix CI/CD") qua `/projects`, giao task cho member qua modal "Tạo Task mới" ở Dashboard, sửa task sang "Hoàn thành" qua trang member detail — tất cả hoạt động đúng, cập nhật real-time ngay trên Dashboard/member detail/`/tasks` mà không cần tải lại trang. Trang `/tasks` (Danh sách Task) mới thêm cũng hoạt động tốt, có filter theo trạng thái/dự án/nhân sự.
- Trang Quản lý Đội ngũ (`/members`) rõ ràng: card grid, tự ẩn hồ sơ của chính leader kèm link "Xem hồ sơ của tôi", có nút Thêm Thành viên/Xóa thành viên.
- Chat AI — nhóm truy vấn (A, C) hoạt động đúng và ấn tượng: hỏi tên member không tồn tại → báo rõ + liệt kê danh sách thật để chọn lại, không bịa. Gõ tên viết thường/không dấu ("duong bao") vẫn fuzzy-match đúng ra "Dương Bảo". Gõ `/status` rồi gửi khi còn nguyên placeholder `[Tên nhân sự]` chưa điền → AI nhận biết được, hỏi lại thay vì tra cứu nhầm theo nghĩa đen. Câu cụt lủn "sao rồi" được diễn giải hợp lý thành tổng quan team. Câu hỏi gộp "thời tiết Hà Nội... với lại ai đang rảnh" → từ chối lịch sự phần ngoài phạm vi (thời tiết), trả lời đúng phần trong phạm vi (ai rảnh), không bịa số liệu thời tiết.

## Chưa đạt / cần sửa (blocker)

- **FB-CHAT-01 (nghiêm trọng nhất — chặn nhầm chính leader thật, vi phạm US-must "giao task bằng lời")**: Đăng nhập `admin@test.com` (role leader, sidebar hiện đúng "Quản lý (Leader View)"), vào `/chat`, gõ trực tiếp câu tự nhiên đầy đủ thông tin: `"Giao task viết lại tài liệu vận hành cho Dương Bảo thuộc dự án Phoenix CI/CD, effort 1 tiếng, bắt đầu hôm nay"`. AI trả lời: `"⚠️ Bạn không đủ quyền để thêm/sửa/xóa task qua chat. Hành động này chỉ dành cho Leader. Vui lòng dùng cách ghi log công việc tự nhiên hiện có, hoặc nhờ Leader thực hiện thay đổi này."` — Đây chính là message dành cho **devops bị chặn** theo đúng spec, nhưng lại trả về cho **leader thật**. Đã thử lại 3 lần (qua template `/assign`, câu tự nhiên gõ tay, đổi cả 2 provider NVIDIA và Claude) — kết quả giống hệt nhau cả 3 lần, không phải flake ngẫu nhiên. Hệ quả: leader **hoàn toàn không thể** giao/sửa/xóa task qua chat bằng bất kỳ cách nào tôi thử — tính năng chính của cả spec rev 1 không dùng được trên UI thật, dù QC trước đó báo đã verify qua Firestore thật là hoạt động. Nghi vấn: chỗ check role trong route xử lý mutation đọc sai field (có thể đọc `role` từ nguồn khác với nơi hiển thị sidebar, hoặc logic bị đảo ngược true/false).
- **FB-CHAT-02 (nghiêm trọng — vi phạm ranh giới dữ liệu devops, đã từng là ISSUE-14 nhưng giờ nặng hơn)**: Đăng nhập `dev@test.com` (role devops), vào `/chat` tab "Log / Plan" (tab mặc định khi devops mở trang), gõ câu hỏi tự nhiên `"task của tôi hôm nay là gì"`. Thay vì trả lời tình trạng task của chính dev@test.com, hệ thống **hiểu nhầm thành lệnh tạo task mới** và hiện hẳn 1 `EntryCard` với tiêu đề bịa "DevOps task for today", **Assignee: qc1@test.com** (không phải người đang hỏi!), 1 tiếng, kèm nút "Xác nhận". Nếu tôi bấm Xác nhận theo phản xạ (như hướng dẫn cũ khuyến nghị "đọc kỹ trước → sau" nhưng ở đây không có task thật nào để so sánh, chỉ là nội dung bịa hoàn toàn), hệ thống sẽ tạo ra 1 task giả gán nhầm cho qc1@test.com mà không ai yêu cầu. Chuyển đúng sang tab "Ask" và hỏi lại y hệt câu trên thì đỡ hơn (không tạo task giả) nhưng vẫn không nhận diện "tôi" = người đang đăng nhập — AI hỏi lại "Vui lòng cho biết tên thành viên" và liệt kê **cả admin@test.com (leader)** như một lựa chọn hợp lệ để devops tra cứu, trong khi spec ghi rõ devops chỉ nên hỏi về bản thân. Đây là 2 vấn đề: (a) tab Log/Plan route sai câu hỏi thành lệnh tạo task kèm bịa nội dung/gán nhầm người — nặng hơn ISSUE-14 cũ; (b) tab Ask không tự suy ra "tôi" = user hiện tại — đúng như ISSUE-14 đã ghi nhận trước đây, xác nhận chưa được fix.
- FB-CHAT-03 (nhỏ, UX): Ở tab "Ask" của devops, phần "Gợi ý câu lệnh nhanh" hiển thị y hệt leader — ví dụ "Ai trong team đang rảnh việc có thể nhận thêm task?", "Tổng hợp các task đang bị trễ hạn" — đều là câu hỏi phạm vi toàn team, trong khi theo spec devops chỉ nên hỏi về bản thân. Không phải lỗi chặn cứng (nếu devops bấm vào, chưa rõ AI có từ chối đúng hay không vì chưa test hết), nhưng gợi ý ngay trên UI đang ngầm mời devops hỏi những câu ngoài phạm vi quyền của họ.

## Chưa test được (giới hạn công cụ, không phải PASS)

- Nhóm F (upload ảnh kèm/không kèm text): chưa test được trong lần preview này do không có sẵn ảnh mẫu phù hợp trong môi trường — cần bổ sung ở lượt sau.
- Nhóm B slash-command sai mode (leader gõ lệnh devops hoặc ngược lại), D-đầy đủ (do FB-CHAT-01 chặn ngay từ đầu nên không đi tiếp được tới bước xem ProposalCard/xác nhận), E-đa lượt giữ ngữ cảnh nhiều câu liên tiếp: chưa test được trọn vẹn vì bug FB-CHAT-01/02 chặn ngay ở bước đầu.

## Yêu cầu mới phát sinh

Không có yêu cầu mới — đây là lỗi/regression so với đúng tinh thần spec.md rev 1 và feedback ACCEPT lần trước, cần fix lại cho đúng hành vi đã từng verify được, không phải tính năng mới.

---

# PM Feedback — 2026-09-09 — Chat AI: Ra lệnh quản lý team bằng ngôn ngữ tự nhiên (spec rev 1)

## Kết luận: ACCEPT (kèm rủi ro đã ghi nhận)

Feature này đã qua 3 vòng dev↔QC (giới hạn tối đa của quy trình). Sau vòng cuối (QC rev 9), 3/6 issue phát hiện ở vòng test UI thật đã đóng hẳn, không còn crash/blocker nào. Còn 3 issue major tồn đọng, không phải lỗi chặn dùng (app vẫn dùng được bình thường cho việc chính: giao/sửa/xóa task qua chat có xác nhận), nhưng có rủi ro nghiệp vụ thật cần leader lưu ý khi dùng. Quyết định: **chấp nhận đưa bản hiện tại cho team dùng ngay**, không kéo dài thêm vòng dev↔QC, xử lý 3 hạn chế còn lại ở rev sau.

## Đạt

- US phân quyền (leader được ra lệnh thêm/sửa/xóa, devops bị chặn hoàn toàn kể cả task của chính mình) — verify qua UI thật rev 8: devops gõ lệnh giao/sửa/xóa đều bị từ chối rõ ràng, không tạo bất kỳ thay đổi nào trên Firestore; leader gõ cùng dạng lệnh thì đi đúng vào luồng đề xuất.
- US "thấy rõ AI định làm gì trước khi lưu" — luồng đề xuất → xác nhận cho cả 3 loại thao tác (thêm/sửa/xóa) đã verify qua UI thật + Firestore thật: trước khi bấm Xác nhận, dữ liệu chưa đổi gì; text trả lời của AI không có câu khẳng định "đã lưu" khi chưa xác nhận; sau khi bấm Xác nhận thì task xuất hiện đúng trên Firestore/Dashboard/Member ngay lập tức; bấm Hủy thì task không bị đụng tới.
- US "hỏi lại khi thiếu thông tin" — gõ lệnh giao task thiếu dự án hoặc thiếu effort, AI hỏi lại đúng trường còn thiếu, không tự đoán/tự set mặc định.
- US "từ chối giao task cho leader" — gõ lệnh giao/sửa task nhắm tới một tài khoản leader, hệ thống từ chối và gợi ý một devops thật thay thế, không tự gán.
- US "câu hỏi quản lý cơ bản" (ai rảnh, task nào trễ, câu hỏi gộp nhiều ý, câu hỏi ngoài phạm vi như hỏi thời tiết) — trả lời đúng dữ liệu thật, trả lời đủ từng ý trong câu gộp, từ chối lịch sự câu ngoài phạm vi mà không bịa số liệu.
- ISSUE-09 (ProposalCard crash khi bấm Chỉnh sửa) — **closed**, verify lại qua UI thật rev 9: bấm Chỉnh sửa không còn crash trang, ngày tháng hiện đúng, xác nhận lưu thành công.
- ISSUE-11 (fuzzy match nhầm tên bịa hoàn toàn sang một member thật, không cảnh báo gì) — **closed**, verify lại qua UI thật rev 9: gõ tên bịa giờ hiện rõ banner cảnh báo "không tìm thấy thành viên", kèm gợi ý người thay thế tường minh, không còn âm thầm gán nhầm.
- ISSUE-13 (devops tự ghi log việc bằng câu tự nhiên bị route nhầm sang hỏi-đáp, không tạo được entry) — **closed**.

## Rủi ro đã biết khi đưa cho team dùng (không yêu cầu sửa ngay — ghi nhận cho rev sau)

- **ISSUE-10** — Câu hỏi audit "vừa nãy tôi đã đổi/xóa task gì qua chat?" trả lời sai (báo "chưa thay đổi gì") ngay cả khi leader vừa xác nhận một thay đổi thật trong chính phiên đó. Root cause đã xác định rõ: nơi ghi log dùng `user.uid`, nơi truy vấn lại dùng `user.memberId` — hai giá trị khác nhau nên không bao giờ khớp. Rủi ro: nếu có sự cố cần tra "ai đã đổi gì qua chat", tính năng audit trail qua chat hiện không dùng được — leader cần tra trực tiếp qua nơi khác (không phải qua câu hỏi tự nhiên trong chat) nếu cần điều tra thật.
- **ISSUE-12 (đáng chú ý nhất về rủi ro dữ liệu)** — Khi leader gõ lệnh sửa task mà không nói rõ muốn đổi field nào (ví dụ chỉ nói "sửa task Tăng số node eks lên 36"), thay vì hỏi lại, hệ thống có thể tạo ra đề xuất (ProposalCard) với nội dung bịa — ví dụ tự đổi tên dự án (`projectName`) của task thành trùng với tiêu đề task, không phải tên dự án thật. Vì mọi thay đổi vẫn phải qua bước Xác nhận nên **không tự động xảy ra** — nhưng nếu leader không đọc kỹ nội dung "trước → sau" trên ProposalCard mà bấm Xác nhận theo phản xạ, dữ liệu dự án thật của task sẽ bị ghi sai. Đây là rủi ro thao tác của người dùng, không phải lỗi tự động ghi sai, nhưng cần lưu ý vì hậu quả (sai lệch dữ liệu dự án) khó nhận ra ngay bằng mắt nếu không so sánh kỹ.
- **ISSUE-14** — Devops hỏi bằng đại từ nhân xưng ("task của tôi hôm nay là gì?") không được nhận diện là hỏi về chính họ — hệ thống hiểu "tôi" như một từ khóa chung và liệt kê nhầm toàn bộ task của cả team thay vì chỉ của người hỏi. Phải gõ đích danh tên thật của mình thì mới trả lời đúng phạm vi. Rủi ro: devops có thể đọc nhầm là "cả team đều bận/rảnh như vậy" thay vì thấy đúng việc của riêng mình.

## Khuyến nghị hành động ngắn hạn cho leader/devops khi dùng thật (tới khi rev sau fix xong)

- Luôn đọc kỹ nội dung "trước → sau" trên ProposalCard trước khi bấm Xác nhận, đặc biệt với lệnh sửa task không nói rõ field nào — nếu thấy AI tự đổi những field mình không hề nhắc tới (nhất là tên dự án), bấm Hủy và gõ lại lệnh rõ ràng hơn thay vì Xác nhận.
- Khi cần tra "ai đã đổi/xóa task gì qua chat" để điều tra sự cố, tạm thời không dựa vào câu hỏi tự nhiên trong chat (đang trả lời sai) — nhờ người có quyền truy cập dữ liệu trực tiếp tra giúp cho tới khi ISSUE-10 được fix.
- Devops khi hỏi việc của chính mình, tạm thời gõ đích danh tên mình thay vì dùng "tôi"/"của tôi" cho tới khi ISSUE-14 được fix, để tránh nhận nhầm danh sách của cả team.

## Yêu cầu mới phát sinh

Không có — đây là ACCEPT, không mở rộng phạm vi. 3 issue trên (ISSUE-10, ISSUE-12, ISSUE-14) giữ nguyên trạng thái đang mở trong `docs/product/issues.md`, xử lý tiếp ở rev sau theo đúng gợi ý fix đã có trong issue.

---

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
