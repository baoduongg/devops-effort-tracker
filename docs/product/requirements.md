# Requirements — Overdue Task Alerts

## Vấn đề / Motivation

Mỗi task hiện có ngày kết thúc dự kiến (`endDate`), nhưng không ai theo dõi việc task có bị trễ hay không. Muốn biết ai đang trễ deadline, tôi (PM) phải tự lướt qua từng member, từng task và tự so ngày bằng mắt — đúng cái việc mà cả app này sinh ra để tránh phải "đi hỏi". Team càng đông, việc này càng dễ bị bỏ sót, và task trễ thường là dấu hiệu sớm của rủi ro dự án hoặc overload.

## Tính năng đề xuất

Hệ thống tự động phát hiện các task đã quá `endDate` mà vẫn ở trạng thái `planned` hoặc `in_progress`, và hiển thị rõ ràng cho PM biết ngay khi vào dashboard — không cần lọc thủ công.

### Trong phạm vi (in scope)
- Tự động xác định task "quá hạn": có `endDate` trong quá khứ và `status` khác `done`.
- Một khu vực/tín hiệu trên Dashboard cho biết ngay: có bao nhiêu task đang quá hạn, của ai, thuộc dự án nào.
- Mỗi task quá hạn cần thấy được: tên task, member phụ trách, dự án, đã trễ bao nhiêu ngày.
- Sinh một notification (dùng cơ chế notification đã có sẵn) khi một task chuyển sang trạng thái quá hạn, để mục Notifications cũng phản ánh đúng thực tế.
- Có thể lọc/xem nhanh danh sách task quá hạn từ dashboard hiện tại (tái dùng bộ lọc đang có nếu hợp lý).

### Ngoài phạm vi (out of scope)
- Không cần gửi email/Slack — chỉ hiển thị trong app.
- Không cần cấu hình ngưỡng cảnh báo (ví dụ "sắp trễ trong 2 ngày") — chỉ xử lý task đã trễ thật sự.
- Không cần workflow phê duyệt gia hạn deadline hay nhắc nhở tự động lặp lại.
- Không thay đổi cách tạo/sửa task hiện tại (form nhập `endDate` giữ nguyên).

## User Story

- Là PM, tôi muốn nhìn vào Dashboard là biết ngay có bao nhiêu task đang quá hạn và của ai, để tôi không phải rà từng member một cách thủ công.
- Là PM, tôi muốn thấy trong mục Notifications khi có task mới bị trễ, để tôi không bỏ sót các trường hợp phát sinh.
- Là Lead/Member, tôi muốn task của mình được đánh dấu rõ khi đã quá hạn, để tôi biết cần cập nhật trạng thái hoặc báo cáo lý do trễ.

## Tiêu chí thành công

- Vào Dashboard, PM biết ngay trong vài giây có task nào quá hạn hay không, không cần tính toán hay hỏi ai.
- Không có task quá hạn nào "vô hình" — tất cả task thoả điều kiện (quá `endDate`, chưa `done`) đều được liệt kê.
- Thông tin hiển thị đủ để PM hành động ngay: biết ai, biết task gì, biết dự án nào, biết trễ bao lâu.
- Không phá vỡ các luồng hiện có (tạo/sửa task, dashboard filter, notifications) đang hoạt động.

---

# Requirements — Chat AI (Trợ lý hỏi đáp & giao task bằng ngôn ngữ tự nhiên)

## Vấn đề / Motivation

Là Leader, hàng ngày tôi cần biết nhanh tình hình team (ai rảnh, ai đang làm gì, task nào trễ) và thường xuyên phải giao việc mới. Việc gõ form từng ô rất mất thời gian giữa lúc đang trao đổi công việc. Tôi muốn có một trợ lý chat mà tôi có thể hỏi bằng câu nói tự nhiên như đang nhắn tin cho một trợ lý thật, hoặc gõ tắt bằng lệnh nhanh, và tin tưởng được câu trả lời — nếu nó không chắc hoặc thiếu thông tin, nó phải hỏi lại tôi thay vì tự bịa hoặc tự đoán bừa, vì tôi sẽ dùng thông tin đó để ra quyết định thật và giao việc thật cho người thật.

## User Story

- US-01 (must): Là Leader, tôi muốn khi tôi hỏi tình hình một người không có trong hệ thống (gõ sai tên hoàn toàn, không tồn tại), trợ lý phải báo rõ là không tìm thấy và cho tôi biết danh sách người thật đang có, để tôi không bị hiểu nhầm là người đó "không có việc gì" hay nhận một câu trả lời bịa ra.

- US-02 (must): Là Leader, tôi muốn khi tôi gõ tên một thành viên có lỗi chính tả nhẹ (thiếu dấu, viết hoa/thường lẫn lộn, thiếu số...), trợ lý vẫn nhận ra đúng người đó và trả lời đúng dữ liệu của họ, để tôi không phải gõ lại tên cho thật chuẩn xác mới hỏi được.

- US-03 (must): Là Leader, tôi muốn khi tôi dùng lệnh nhanh (ví dụ lệnh xem thông tin thành viên) mà quên điền tên hoặc để nguyên chỗ trống mẫu, trợ lý phải nhắc tôi điền tên cụ thể kèm ví dụ, thay vì trả lời chung chung hoặc báo lỗi khó hiểu.

- US-04 (must): Là Leader, tôi muốn khi tôi gõ một lệnh nhanh nhưng không điền đủ thông tin bắt buộc trong mẫu (bỏ trống tên người nhận việc hoặc tên dự án), trợ lý phải hỏi lại tôi phần còn thiếu, không được tự bịa ra một task với tên việc/tên dự án là chữ mẫu placeholder rồi đưa tôi bấm xác nhận.

- US-05 (should): Là Leader, tôi muốn khi tôi gõ một lệnh không tồn tại trong hệ thống, trợ lý báo cho tôi biết lệnh đó không có và gợi ý tôi xem hướng dẫn hoặc các lệnh đang hỗ trợ, thay vì im lặng, treo, hoặc báo lỗi kỹ thuật.

- US-06 (must): Là Leader, tôi muốn khi tôi dùng một lệnh chỉ dành cho vai trò Leader (ví dụ lệnh xem báo cáo tổng effort toàn team) trong khi tôi đang ở màn hình/vai trò của một kỹ sư DevOps, hệ thống phải từ chối hoặc giới hạn đúng phạm vi của vai trò đó, không được lộ dữ liệu tổng hợp của toàn team cho một tài khoản không phải Leader.

- US-07 (must): Là Leader, tôi muốn khi tôi hỏi một câu cụt lủn, mơ hồ (ví dụ chỉ gõ "sao rồi", "ổn không"), trợ lý hỏi lại tôi muốn biết về ai/việc gì, thay vì đoán bừa hoặc trả lời sai chủ đề.

- US-08 (should): Là Leader, tôi muốn khi tôi hỏi gộp nhiều ý trong cùng một câu (ví dụ vừa hỏi ai đang rảnh vừa hỏi có task nào trễ hạn), trợ lý trả lời đầy đủ cả hai ý, không bỏ sót ý nào.

- US-09 (must): Là Leader, tôi muốn khi tôi hỏi một điều nằm ngoài phạm vi quản lý team (ví dụ hỏi thời tiết, hỏi kiến thức chung không liên quan effort/task/dự án), trợ lý từ chối lịch sự và không bịa ra số liệu hay câu trả lời không có thật để làm hài lòng tôi.

- US-10 (must): Là Leader, tôi muốn khi tôi giao một task bằng câu nói tự nhiên có đầy đủ thông tin (việc gì, giao cho ai, dự án nào, mất bao lâu), trợ lý soạn sẵn một phiếu công việc đúng với các thông tin tôi đã nói và chỉ thực sự lưu vào hệ thống sau khi tôi bấm xác nhận — trợ lý không được tự nhận là "đã lưu xong" khi tôi chưa xác nhận.

- US-11 (must): Là Leader, tôi muốn khi tôi giao task nhưng quên nói dự án hoặc quên nói thời lượng, trợ lý phải hỏi lại tôi thông tin còn thiếu đó, không được tự ý đoán ra một dự án/thời lượng không có thật rồi đưa tôi phiếu công việc coi như đã đủ thông tin.

- US-12 (must): Là Leader, tôi muốn khi tôi lỡ giao task cho chính Leader (hoặc một người có vai trò quản lý) thay vì kỹ sư thực thi, hệ thống từ chối hoặc gợi ý tôi chọn một kỹ sư DevOps khác phù hợp hơn, không được âm thầm tạo task giao cho Leader, và tuyệt đối không được làm sập cả hệ thống chỉ vì một yêu cầu giao việc như vậy.

- US-13 (must): Là Leader, tôi muốn sau khi tôi bấm xác nhận trên phiếu công việc do trợ lý soạn, task đó phải thực sự xuất hiện ngay trong trang cá nhân của thành viên đó và trên Dashboard, để tôi biết chắc việc giao task đã có hiệu lực thật, không phải chỉ là một câu trả lời cho có.

- US-14 (should): Là Leader, tôi muốn khi tôi hỏi tiếp một câu có liên quan đến câu hỏi ngay trước đó trong cùng một phiên chat (ví dụ vừa hỏi tình hình một người, hỏi tiếp "vậy ai rảnh hơn?"), trợ lý hiểu được tôi đang so sánh tiếp với câu trước, không hỏi lại từ đầu như thể không nhớ gì.

- US-15 (must): Là Leader, tôi muốn khi tôi chuyển qua lại giữa chế độ xem của Leader và chế độ xem của một kỹ sư DevOps cụ thể, các câu hỏi kiểu "việc của tôi", "effort của tôi" phải luôn trả lời đúng của người đang được chọn ở chế độ đó, không bị lẫn sang dữ liệu của người khác.

- US-16 (should): Là Leader, tôi muốn khi tôi gửi kèm một ảnh chụp màn hình công việc (có hoặc không kèm chữ), trợ lý phản hồi cho tôi một cách hợp lý và không bị treo hay báo lỗi hệ thống, đồng thời nếu trợ lý không thực sự đọc được nội dung trong ảnh thì phải nói rõ là không đọc được, không được giả vờ đã hiểu nội dung ảnh rồi bịa ra thông tin.

## Câu hỏi PM cần trả lời được khi dùng Chat AI

- Tôi vừa gõ một câu hỏi/lệnh có vấn đề (sai tên, thiếu thông tin, ngoài phạm vi) — trợ lý có báo cho tôi biết rõ ràng là có vấn đề không, hay nó cứ trả lời như không có chuyện gì?
- Tôi giao task bằng lời nói — trước khi tôi bấm xác nhận, task đó đã được lưu vào hệ thống chưa hay chỉ là bản nháp?
- Tôi đang ở chế độ nào (Leader hay của một kỹ sư cụ thể) — câu trả lời tôi nhận được có đúng phạm vi/dữ liệu của chế độ đó không?

## Ngoài phạm vi (out of scope)

- Không cần trợ lý tự động sửa lỗi chính tả nặng hoặc hiểu được viết tắt tùy tiện không theo quy luật nào.
- Không cần trợ lý đọc và trích xuất chi tiết mọi loại ảnh (ví dụ ảnh biểu đồ, ảnh tài liệu phức tạp) — chỉ cần không giả vờ đọc được khi không đọc được.
- Không cần trợ lý ghi nhớ lịch sử hội thoại qua nhiều ngày/nhiều phiên đăng nhập khác nhau, chỉ cần giữ mạch trong một phiên đang trò chuyện.
- Không yêu cầu trợ lý tự động phê duyệt hoặc từ chối task thay Leader — quyền xác nhận cuối cùng luôn thuộc về người dùng.
