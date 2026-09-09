# Requirements — Chat AI: Ra lệnh quản lý team bằng ngôn ngữ tự nhiên

## Vấn đề / Motivation

Chat AI hiện tại chỉ làm được hai việc: (1) tự ghi lại nhật ký công việc khi member gõ tự nhiên, và (2) trả lời câu hỏi tra cứu dựa trên dữ liệu thật. Nhưng khi tôi (PM/Lead) cần **thay đổi** thực sự — giao task mới cho ai đó, sửa lại ngày/trạng thái một task, hay xóa một task không còn cần nữa — tôi vẫn phải rời khỏi chat, vào đúng màn hình member/task, tìm đúng dòng, rồi thao tác tay. Chat AI biết hết dữ liệu nhưng không giúp tôi "làm" được gì với nó. Mục tiêu là để chat trở thành nơi tôi có thể vừa hỏi vừa ra lệnh, mà vẫn an toàn — không lo AI hiểu lầm rồi tự ý sửa/xóa nhầm dữ liệu thật của team.

## Tính năng đề xuất

Mở rộng Chat AI để PM/Lead có thể: thêm task, sửa task, xóa task cho member bằng câu lệnh tự nhiên, và hỏi sâu hơn về tình hình team (ai rảnh/quá tải, task trễ hạn, tiến độ dự án, khối lượng việc của một người) — dựa trên nền answer-query đã có.

### Nguyên tắc quyết định cốt lõi: mọi thay đổi dữ liệu đều phải qua xác nhận

AI **không bao giờ** được tự ý ghi/sửa/xóa dữ liệu thật ngay khi "hiểu" ý định trong câu chat. Lý do: rủi ro AI nhận nhầm member, nhầm task trùng tên, nhầm ngày tháng là có thật và hậu quả là xóa/sửa nhầm dữ liệu thật của cả team — khác hẳn việc chat lỡ hiểu sai một dòng ghi log rồi mình discard. Vì vậy, với mọi lệnh thêm/sửa/xóa:
1. AI diễn giải câu lệnh thành một **đề xuất thay đổi** cụ thể, hiển thị rõ ràng: đang định làm gì, trên task/member nào, thay đổi ra sao.
2. PM/Lead phải bấm xác nhận thì thay đổi mới thực sự được ghi vào dữ liệu thật. Trước khi bấm xác nhận, AI không được nói/ngụ ý rằng việc đã xong.
3. Nếu PM/Lead sửa lại đề xuất trước khi xác nhận (đổi người, đổi ngày...), hệ thống phải lưu đúng theo bản đã sửa, không lưu theo bản AI đề xuất ban đầu.

Đây là nguyên tắc bắt buộc — không có ngoại lệ "lệnh đơn giản thì cho làm luôn".

### Phân quyền theo vai trò hiện có (leader / devops)

- Chỉ tài khoản vai trò **leader** được ra lệnh thêm/sửa/xóa task qua chat — kể cả task của chính họ hay của người khác. Đây là hành động quản lý, không phải tự ghi log việc mình làm.
- Tài khoản vai trò **devops** dùng chat theo đúng cách hiện tại: tự ghi log việc mình làm (format-entry), và hỏi được thông tin liên quan đến bản thân (task của tôi, effort của tôi). Devops **không** được thêm/sửa/xóa task qua chat — kể cả task của chính mình — vì đó là nơi leader theo dõi và điều phối; nếu devops cần chỉnh sửa việc đã ghi, họ dùng đúng luồng ghi log tự nhiên đã có (ghi log mới, hoặc nhờ leader chỉnh).
- Nếu một tài khoản không đủ quyền gõ lệnh thay đổi, AI từ chối lịch sự và nói rõ lý do (không đủ quyền), không âm thầm bỏ qua hoặc giả vờ thực hiện.
- Truy vấn/tra cứu (mục "trong phạm vi" bên dưới) thì cả leader và devops đều dùng được như hiện tại, chỉ khác phạm vi dữ liệu: leader hỏi được về bất kỳ ai/dự án nào, devops hỏi về bản thân là chính (giữ nguyên hành vi hiện có, không mở rộng thêm ở tính năng này).

### Trong phạm vi (in scope)

**Thêm task** — Leader mô tả bằng lời: giao việc gì, cho ai, thuộc dự án nào, thời gian dự kiến (ngày bắt đầu/kết thúc), effort. AI dựng đề xuất, leader xác nhận mới tạo task thật.

**Sửa task đã có** — Đổi trạng thái, đổi ngày, đổi người phụ trách, đổi mô tả/tên việc của một task đã tồn tại. Cũng qua bước đề xuất → xác nhận như trên.

**Xóa task** — Xóa một task cụ thể đã xác định rõ ràng, qua bước đề xuất → xác nhận.

**Xử lý khi lệnh mơ hồ, thiếu thông tin, hoặc chỉ định không rõ đối tượng** — đây là phần bắt buộc, không phải hiệu ứng phụ:
- Thiếu trường bắt buộc (vd giao task không nói dự án nào, hoặc không nói effort) → AI phải hỏi lại để bổ sung, **không được tự đoán/tự chọn giá trị mặc định** thay người dùng.
- Nhắc đến một member/task mà hệ thống không tìm thấy khớp chính xác, hoặc khớp với nhiều kết quả (vd "xóa task deploy của Huy" mà Huy có 3 task chứa từ "deploy") → AI phải liệt kê các khả năng khớp và hỏi lại người dùng chọn đúng cái nào. Tuyệt đối không tự chọn đại một cái "khớp nhất" rồi âm thầm thao tác trên đó.
- Ra lệnh giao/sửa task mà đối tượng được nhắc tới là một tài khoản vai trò leader (kể cả chính leader đang chat) → AI từ chối, giải thích task trong hệ thống là để giao cho kỹ sư (devops), gợi ý chọn một devops cụ thể thay thế.

**Mở rộng truy vấn (answer-query)** — vẫn trên nền dữ liệu thật (GroundingSnapshot) đã có, bổ sung khả năng trả lời được các câu hỏi quản lý hằng ngày:
- Ai đang làm gì, thuộc dự án nào.
- Ai đang rảnh / ai đang quá tải.
- Task nào sắp trễ hoặc đã trễ hạn.
- Tiến độ một dự án cụ thể (bao nhiêu task done/đang làm/kế hoạch).
- Khối lượng công việc của một member cụ thể.
- Câu hỏi gộp nhiều ý trong một lượt (vd vừa hỏi ai rảnh vừa hỏi task nào trễ) → trả lời đủ từng ý, không chỉ trả lời ý đầu tiên rồi bỏ qua phần còn lại.
- Câu hỏi ngoài phạm vi hệ thống (thời tiết, kiến thức chung không liên quan team) → từ chối lịch sự, không bịa số liệu, không cố trả lời cho có.

**Ghi log riêng cho hành động thay đổi dữ liệu qua AI** — mỗi lần một đề xuất thêm/sửa/xóa task được xác nhận (hoặc bị hủy) đều phải để lại dấu vết: ai ra lệnh, đề xuất là gì, đã áp dụng vào task nào, khi nào. Đây là nhật ký audit riêng, khác với `chatLogs` hiện tại (vốn chỉ dùng cho việc ghi log công việc kiểu format-entry) — vì đây là log cho hành động **thay đổi dữ liệu quản lý**, cần tra được "ai đã đổi cái gì qua chat" khi có sai sót, không lẫn với log tự ghi việc hằng ngày của member.

### Ngoài phạm vi (out of scope)

- **Không** cho xóa hay tạo project qua chat — project là đơn vị tổ chức lớn, thay đổi có ảnh hưởng rộng, vẫn thao tác trực tiếp trên màn hình quản lý như hiện tại.
- **Không** cho AI tự động chọn người để gán task dựa trên suy luận "ai đang rảnh" — AI chỉ được trả lời câu hỏi "ai đang rảnh" khi được hỏi (tra cứu), nhưng khi giao task thì người phụ trách phải do chính leader chỉ định rõ trong câu lệnh. AI không tự quyết thay leader ai sẽ làm việc gì.
- **Không** cho xóa/sửa hàng loạt nhiều task cùng lúc bằng một câu lệnh (vd "xóa hết task đã done của dự án X") — mỗi lệnh thay đổi chỉ áp dụng cho một task xác định, để giảm rủi ro xác nhận nhầm trên diện rộng.
- **Không** thêm/sửa/xóa thông tin member (tên, email, kỹ năng, trạng thái available/busy/overloaded) qua chat — chat chỉ thao tác trên task, quản lý member vẫn qua màn hình member hiện có.
- **Không** cho phép hoàn tác (undo) một thay đổi đã xác nhận ngay trong chat — nếu xác nhận nhầm, sửa/xóa lại bằng một lệnh mới như thao tác thông thường.
- **Không** mở rộng quyền tra cứu của devops sang dữ liệu của người khác trong tính năng này — giữ nguyên ranh giới hiện tại, chỉ mở rộng thêm loại câu hỏi trả lời được, không mở rộng người được hỏi về.

## User Story

- Là Leader, tôi muốn gõ một câu tự nhiên để giao task cho một kỹ sư (kèm dự án, thời gian), để tôi không phải mở form nhập liệu mỗi lần giao việc nhỏ. (must)
- Là Leader, tôi muốn thấy rõ AI định tạo/sửa/xóa task gì trước khi nó thực sự lưu, để tôi kiểm tra lại trước khi đồng ý, tránh sai sót do AI hiểu nhầm. (must)
- Là Leader, tôi muốn sửa nhanh trạng thái/ngày/người phụ trách một task đã có bằng lời, để không phải tìm đúng dòng trong danh sách task để sửa tay. (must)
- Là Leader, tôi muốn xóa một task không còn cần nữa bằng lời, nhưng phải được hỏi lại nếu AI không chắc tôi đang nói đến task nào. (must)
- Là Leader, khi tôi ra lệnh thiếu thông tin (vd không nói dự án), tôi muốn AI hỏi lại thay vì tự đoán, để dữ liệu tạo ra luôn đúng ý tôi. (must)
- Là Leader, tôi muốn hỏi AI những câu quản lý hằng ngày (ai rảnh, ai quá tải, task nào trễ, tiến độ dự án nào đó, khối lượng việc của ai) và nhận câu trả lời dựa trên dữ liệu thật, để tôi ra quyết định nhanh mà không phải tự tổng hợp. (must)
- Là Leader, tôi muốn khi mình hỏi những điều ngoài phạm vi hệ thống, AI từ chối lịch sự thay vì bịa ra câu trả lời, để tôi không bị hiểu nhầm thông tin sai là thật. (must)
- Là Leader, tôi muốn khi có sự cố (task bị xóa/sửa nhầm), tôi tra được ai đã ra lệnh gì qua chat và khi nào, để xác định nguyên nhân và khắc phục. (should)
- Là Devops, tôi muốn chat của tôi tiếp tục dùng để tự ghi log việc mình làm và hỏi về task/effort của chính mình như hiện tại, không bị lẫn hay ảnh hưởng bởi tính năng quản lý mới dành cho leader. (must)
- Là Leader, tôi muốn nếu lỡ nhắc đến một task/member mà hệ thống thấy nhiều khả năng trùng khớp, AI liệt kê rõ để tôi chọn đúng, để tránh thao tác nhầm trên task của người khác. (must)

## Câu hỏi PM cần trả lời được khi dùng Chat AI (bổ sung, ngoài các câu hỏi tra cứu đã có)

- "Ai đang rảnh trong team?" / "Ai đang quá tải?"
- "Có task nào sắp/đã trễ hạn không, của ai?"
- "Dự án X đang tiến độ tới đâu?"
- "Khối lượng công việc của [member] hiện tại thế nào?"
- "Vừa nãy tôi (hoặc leader khác) đã đổi/xóa task gì qua chat?" (audit trail)

## Tiêu chí thành công

- Không có thay đổi dữ liệu thật nào (tạo/sửa/xóa task) xảy ra qua chat mà chưa qua bước xác nhận rõ ràng của leader.
- Devops không thể thêm/sửa/xóa bất kỳ task nào qua chat, kể cả task của chính mình — chat của devops hoạt động y như trước khi có tính năng này.
- Khi lệnh thiếu thông tin hoặc nhắc đến đối tượng mơ hồ (nhiều task/member khớp), AI luôn hỏi lại thay vì tự đoán hoặc tự chọn.
- Khi leader thử giao/sửa task liên quan đến một tài khoản leader khác, hệ thống từ chối và gợi ý chọn devops.
- Mọi đề xuất thêm/sửa/xóa đã được xác nhận đều xuất hiện đúng, đầy đủ trên các màn hình Member/Dashboard/Task hiện có ngay sau đó — không cần tải lại nhiều lần hay tin vào lời AI nói "đã lưu".
- Tra được lịch sử "ai đã đổi gì qua chat, lúc nào" khi cần điều tra sự cố.
- Các câu hỏi tra cứu mở rộng (ai rảnh, task trễ, tiến độ dự án, khối lượng việc) trả lời đúng với dữ liệu thật hiện có, không bịa số liệu.
- Câu hỏi ngoài phạm vi hệ thống luôn bị từ chối lịch sự, không có câu trả lời bịa.
- Các luồng hiện có (format-entry tự ghi log, answer-query tra cứu cơ bản, xác nhận entry cũ) không bị phá vỡ hay thay đổi hành vi ngoài ý muốn.
</content>
