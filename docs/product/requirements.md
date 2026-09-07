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
