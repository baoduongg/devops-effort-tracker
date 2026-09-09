# QC Report — rev 13 (2026-09-09) — verify ISSUE-17 / AC-12-6 (vòng QC thứ 3, cuối cùng cho spec rev 2)

## Kết luận: PASS

## Tổng: 12/12 AC (F-11 + F-12, spec rev 2) pass — ISSUE-17 đóng, không còn AC nào tồn đọng.

Phạm vi rev này: chỉ verify lại ISSUE-17 (AC-12-6), theo yêu cầu — không test lại toàn bộ từ đầu. Các AC còn lại (AC-11-1..6, AC-12-1..5) đã PASS ở rev 10-12 và giữ nguyên kết luận, không có regression nào phát sinh trong phiên này ảnh hưởng tới chúng.

### 0. Pre-check

- `pnpm lint`: 0 errors, 6 warnings (pre-existing, `sidebar.tsx` x4, `page.tsx` x1, `chat-box.tsx` x1 — không liên quan tới fix ISSUE-17).
- Dev server: đã chạy sẵn tại `localhost:3000`, HTTP 200.
- Đọc trước code fix: `services/grounding.service.ts#buildGroundingSnapshot(excludeLeaders)` — filter `role !== "leader"` áp dụng lên mảng `members` **trước** khi tính mọi field phái sinh (`memberData`, `freeMembers`/`busyMembers`/`overloadedMembers`, `projects[].assignedMembers`, `overdueTasks[].memberName`). `app/api/ai/answer-query/route.ts` dòng 390 gọi `buildGroundingSnapshot(currentAskerRole === "devops")` — đúng như mô tả trong dev-log/issues.md.

### 1. Verify ISSUE-17 / AC-12-6

Đăng nhập devops thật `dev@test.com`, `/chat`, tab **Ask**, provider **Claude**.

| Câu hỏi | Kết quả | Ghi chú |
|---------|---------|---------|
| "Hoangzzz đang làm gì?" (tên bịa — đúng câu đã fail rev 12) | PASS | Trả lời "Không tìm thấy thành viên Hoangzzz..." + "Các thành viên hiện có": `qc1@test.com`, `qc@test.com`, `Dương Bảo`, `dev@test.com`, `DevOps Engineer` — không có `admin@test.com`, không có leader nào. |
| "trong team có ai đang rảnh không?" | PASS | Bảng liệt kê 5 kỹ sư DevOps sẵn sàng, không có leader nào trong bảng hay phần khuyến nghị. |
| "liệt kê toàn bộ nhân sự trong công ty hiện tại" | PASS | Rơi vào nhánh `renderMemberList` (path đã fix từ rev 11) — vẫn chỉ 5 devops, không leader, nhất quán với 2 câu trên. |

Không có console error ở cả 3 lần gọi (`list_console_messages` types=["error"] → rỗng).

**Kết luận AC-12-6: PASS.** Fix tại nguồn (`buildGroundingSnapshot`) hoạt động đúng cho nhánh Q&A tự do lẫn nhánh `renderMemberList` cứng — không phải vá đúng 1 câu.

### 2. Regression nhanh — leader vẫn thấy đầy đủ team

Đăng nhập leader thật `admin@test.com` / `123456`, `/chat`, tab Ask (mặc định), gõ "liệt kê toàn bộ nhân sự hiện tại" → danh sách đầy đủ 6 thành viên, **bao gồm `admin@test.com — Leader`**. Xác nhận `excludeLeaders=false` cho asker leader không bị lọc nhầm. Không có console error.

## Bảng AC tổng hợp (F-11 + F-12, spec rev 2)

| AC | Kết quả | Ghi chú |
|----|---------|---------|
| AC-11-1 | PASS | Verify rev 10, giữ nguyên. |
| AC-11-2 | PASS | Verify rev 10, giữ nguyên. |
| AC-11-3 | PASS | Verify rev 10, giữ nguyên. |
| AC-11-4 | PASS | Verify rev 10, giữ nguyên. |
| AC-11-5 | PASS | Verify rev 10, giữ nguyên. |
| AC-11-6 | PASS | Verify rev 10, giữ nguyên. |
| AC-12-1 | PASS | Verify rev 10, giữ nguyên. |
| AC-12-2 | PASS | Verify rev 10, giữ nguyên. |
| AC-12-3 | PASS | Verify rev 10, giữ nguyên. |
| AC-12-4 | PASS | ISSUE-18 đóng ở rev 12, verify qua UI cả 2 provider. |
| AC-12-5 | PASS | ISSUE-14 đóng ở rev 12. |
| AC-12-6 | PASS | ISSUE-17 đóng ở rev 13 (phiên này) — xem mục 1 ở trên. |

## Verify issue `fixed` → đổi trạng thái

- **ISSUE-17**: `fixed` → **`closed`**. Verify qua UI thật 3 biến thể câu hỏi tự do + curl-equivalent qua UI, không có AC nào còn fail. Xem chi tiết trong `docs/product/issues.md`.

## Kết luận tổng thể

**Toàn bộ spec rev 2 (F-11 + F-12, 12/12 AC) đã PASS.** Không còn issue `open`/`reopened` severity blocker/major nào liên quan tới F-11/F-12. Sẵn sàng cho PM preview.
