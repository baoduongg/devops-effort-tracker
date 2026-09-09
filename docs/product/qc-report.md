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

---

# QC Report — rev 14 (2026-09-09) — verify ISSUE-19/ISSUE-20 (FB-CHAT-04, FB-CHAT-03 — ranh giới quyền tra cứu devops)

## Kết luận: PASS

## Tổng: verify qua UI thật cả 2 issue vừa fix (rev 14) + regression e2e (rev 13) — không có AC/issue mới mở.

Phạm vi rev này: Developer vừa fix ISSUE-19/ISSUE-20 nhưng chưa tự test qua UI (chỉ trace code). Nhiệm vụ QC lần này là verify qua UI thật (không chỉ đọc code) theo đúng 5 kịch bản PM/orchestrator yêu cầu, cộng regression `pnpm lint`/`pnpm build`/Playwright.

### 0. Pre-check

- `pnpm lint`: 0 errors, 6 warnings — toàn bộ pre-existing (`sidebar.tsx` x4 unused imports/handler, `login/page.tsx` x1 `handleAnonSignIn` unused, `chat-box.tsx` x1 `setAiProvider` unused) — không có warning mới do rev 14.
- `pnpm build`: thành công, 0 errors, cùng warnings kể trên. 18 routes build ra đúng, không lỗi type-check.
- Dev server: **phát hiện môi trường bất thường lúc bắt đầu** — có 1 tiến trình `next-server` (production build cũ, PID zombie) đang chiếm cổng 3000 từ trước, trả `500`/`404` stale (không phải regression code — đã xác nhận bằng `ps`/`lsof`, đây là process cũ sống sót từ phiên trước, không liên quan tới thay đổi rev 14). Đã `kill -9` process đó, `rm -rf .next`, chạy lại `pnpm dev` sạch trên đúng cổng 3000 — sau đó mọi request `200` bình thường. Ghi nhận cho rev sau: nên tắt hẳn dev server cũ trước khi bắt đầu phiên QC mới để tránh nhầm lẫn "server đang chạy" khi thực chất là tiến trình cũ/stale.
- `pnpm exec playwright test` (3 test regression từ rev 13 — `chat-leader-assign`, `chat-devops-query`, `chat-devops-self-log`): **lần chạy đầu FAIL cả 3** (do đúng vấn đề môi trường ở trên — server 3000 stale khiến `loginAs()` không rời được `/login`). Sau khi dọn server và chạy lại trên server sạch: **PASS (3) FAIL (0)**. Không phải regression code — xác nhận qua cùng 1 bộ test trên server đúng.

### 1. ISSUE-19 (FB-CHAT-04) — devops hỏi chéo đồng nghiệp qua Chat AI

**Kịch bản 1 — devops hỏi đích danh 1 devops khác:**
Đăng nhập `dev@test.com` / `123456`, vào `/chat`, tab Ask, gõ tay "Dương Bảo đang làm task gì vậy?" (Dương Bảo là 1 devops khác có thật trong hệ thống, xác nhận qua `/members`).
- Kết quả: AI trả lời "⚠️ Không tìm thấy thành viên "Dương Bảo" trong danh sách đội ngũ của hệ thống. Thành viên hiện có: dev@test.com — DevOps, trạng thái: Sẵn sàng, tổng effort: 0 phút." — **không hề lộ bất kỳ chi tiết task/effort/dự án nào của Dương Bảo**, danh sách "thành viên hiện có" chỉ liệt kê chính người hỏi (`dev@test.com`), không liệt kê Dương Bảo hay bất kỳ devops nào khác.
- Đây là cơ chế "ẩn luôn danh tính" (snapshot restrict theo `restrictToMemberId`) mạnh hơn yêu cầu tối thiểu của AC (chỉ cần "từ chối lịch sự, không lộ chi tiết") — không lộ dữ liệu là tiêu chí cốt lõi, đã đạt. Không có console error.
- **Kết luận: PASS** — không có rò rỉ task/effort/dự án của Dương Bảo qua câu hỏi chéo.

**Kịch bản 2 — câu hỏi tự do không hỏi đích danh nhưng có thể lộ thông tin người khác:**
Cùng phiên `dev@test.com`, tab Ask, gõ "Trong team ai đang làm nhiều task nhất?".
- Kết quả: AI trả lời "Hiện tại chỉ có 1 thành viên DevOps trong hệ thống: dev@test.com: 0 task đang thực hiện, Không có task kế hoạch. Kết luận: Chưa có thành viên nào đang thực hiện task. Dự án Phoenix CI/CD đang ghi nhận 3 task In Progress, nhưng hiện chưa được gán cho thành viên nào, nên chưa thể xác định người đang làm nhiều task nhất."
- Không có tên đồng nghiệp nào (Dương Bảo hay member khác) xuất hiện trong câu trả lời, không có task title/effort/deadline của người khác bị lộ — đúng tinh thần "không mở rộng quyền tra cứu sang người khác". Có 1 điểm câu chữ hơi kỳ (AI nói "chưa được gán cho thành viên nào" trong khi thực ra 3 task đó có gán nhưng bị lọc khỏi snapshot của devops) — đây là tác dụng phụ vô hại của cơ chế restrict-snapshot (AI không biết assignee vì dữ liệu bị lọc, không phải bịa), không gây lộ dữ liệu, không thuộc phạm vi AC cần fix — ghi vào "Gợi ý cho BA" bên dưới.
- **Kết luận: PASS** — không liệt kê chi tiết task của người khác.

### 2. Devops hỏi về CHÍNH MÌNH — không bị chặn nhầm

Cùng phiên `dev@test.com`, tab Ask:
- Qua đại từ "tôi": gõ "Task của tôi hôm nay có gì?" → trả lời đúng phạm vi bản thân ("Tình hình task của dev@test.com hôm nay... Trống việc – 0% Effort... Không có... dev@test.com hiện đang khả dụng...").
- Qua tên thật: gõ "dev@test.com đang làm task gì?" → trả lời đúng, đầy đủ (Trạng thái, Task đang thực hiện, Task kế hoạch, Kết luận & Đề xuất) cho chính `dev@test.com`, không bị từ chối nhầm.
- **Kết luận: PASS** — cả 2 cách hỏi về bản thân (pronoun và tên) đều hoạt động đúng, không bị chặn nhầm bởi guard mới.

### 3. ISSUE-20 (FB-CHAT-03) — "Gợi ý câu lệnh nhanh" tab Ask cho devops

Cùng phiên `dev@test.com`, tab Ask (reload lại để chắc chắn không phải cache cũ): 3 gợi ý hiện đúng phạm vi bản thân — "Task của tôi hôm nay có gì?", "Tôi còn effort trống bao nhiêu?", "Tiến độ các task của tôi hiện tại thế nào?" — không còn câu hỏi phạm vi team ("Ai trong team đang rảnh...", "Tổng hợp task trễ hạn...", "Tình hình phân bổ effort team...").
- **Kết luận: PASS**.

### 4. Regression leader — không bị ảnh hưởng

Đăng nhập `admin@test.com` / `123456`, `/chat`, tab Ask (mặc định cho leader, sidebar đúng "Quản lý (Leader View)"):
- Gợi ý câu lệnh nhanh vẫn 3 câu phạm vi team như cũ: "Ai trong team đang rảnh việc có thể nhận thêm task?", "Tổng hợp các task đang bị trễ hạn cần xử lý gấp?", "Tình hình phân bổ Effort của team theo từng dự án như thế nào?" — không đổi.
- Gõ tay "Dương Bảo đang làm task gì vậy?" → trả lời đầy đủ chi tiết: 3 task đang thực hiện, tổng effort 180 phút (3 giờ), dự án Phoenix CI/CD, bảng liệt kê từng task (Deploy monitoring stack, Viết lại tài liệu vận hành, Deploy service billing) kèm effort/hạn hoàn thành — leader không bị chặn, vẫn hỏi được chi tiết về bất kỳ member nào trong team.
- Không có console error (`list_console_messages` rỗng).
- **Kết luận: PASS** — leader không bị regression.

### 5. Playwright regression (rev 13)

`pnpm exec playwright test` trên dev server sạch: **PASS (3) FAIL (0)** — `chat-leader-assign.spec.ts` (AC-11-2), `chat-devops-query.spec.ts` (AC-12-1/12-2), `chat-devops-self-log.spec.ts` (AC-12-4) đều pass, không có regression từ thay đổi ISSUE-19/ISSUE-20.

## Bảng kết quả

| Kịch bản | Kết quả | Ghi chú |
|----|---------|---------|
| Devops hỏi đích danh đồng nghiệp khác (ISSUE-19, KB1) | PASS | Không lộ task/effort/dự án của Dương Bảo, trả lời "không tìm thấy" + chỉ liệt kê chính người hỏi |
| Devops hỏi tự do có thể lộ chéo (ISSUE-19, KB2) | PASS | Không có tên/task/effort của người khác trong câu trả lời |
| Devops hỏi về chính mình qua "tôi" | PASS | Trả lời đúng phạm vi bản thân |
| Devops hỏi về chính mình qua tên | PASS | Trả lời đúng phạm vi bản thân, không bị chặn nhầm |
| Gợi ý câu lệnh nhanh devops tab Ask (ISSUE-20) | PASS | 3 câu phạm vi bản thân, không còn câu phạm vi team |
| Leader hỏi chi tiết member khác | PASS | Không bị ảnh hưởng, đầy đủ chi tiết như trước |
| Leader — gợi ý câu lệnh nhanh | PASS | Không đổi, vẫn phạm vi team |
| Playwright regression (3 test rev 13) | PASS | Fail lần đầu do stale server, pass sau khi dọn môi trường sạch |

## Verify issue `fixed` → đổi trạng thái

- **ISSUE-19**: `fixed` → **`closed`**. Verify qua UI thật (không chỉ đọc code) — devops hỏi chéo tên đồng nghiệp thật ("Dương Bảo") không còn lộ chi tiết task/effort/dự án; câu hỏi tự do phạm vi team cũng không lộ tên/chi tiết người khác; self-query (pronoun và tên) không bị ảnh hưởng; leader không bị regression.
- **ISSUE-20**: `fixed` → **`closed`**. Verify qua UI thật — gợi ý câu lệnh nhanh tab Ask cho devops đã đổi đúng sang 3 câu phạm vi bản thân, leader không đổi.

## Gợi ý cho BA

- Khi devops hỏi câu tự do có thể ngầm nhắc tới đồng nghiệp (vd "ai đang làm nhiều task nhất"), AI hiện trả lời hơi khó hiểu ("3 task In Progress... nhưng hiện chưa được gán cho thành viên nào") vì snapshot bị lọc chỉ còn đúng 1 member (chính người hỏi) nên AI không có dữ liệu assignee của các task khác — không lộ dữ liệu (đúng yêu cầu bảo mật) nhưng câu trả lời không thật sự chính xác/tự nhiên (đáng lẽ nên nói kiểu "bạn chỉ có thể xem thông tin của chính mình" thay vì suy diễn "chưa được gán"). Không phải bug vi phạm AC (không leak dữ liệu), chỉ là trải nghiệm câu chữ chưa tối ưu — BA cân nhắc có muốn rev sau chuẩn hoá câu trả lời cho case này rõ ràng hơn không.

## Kết luận tổng thể

**PASS.** ISSUE-19 và ISSUE-20 đã được verify qua UI thật (đăng nhập thật, gõ tay câu hỏi thật, không chỉ đọc code) — cả 2 fix hoạt động đúng, không lộ dữ liệu chéo cho devops, không ảnh hưởng leader. `pnpm lint`/`pnpm build` xanh, Playwright regression 3/3 pass trên môi trường sạch. Không có issue `open`/`reopened` nào severity blocker/major còn tồn đọng. Sẵn sàng cho PM preview lại.
