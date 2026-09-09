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

---

# QC Report — Full regression sweep (2026-09-09)

> Phạm vi: KHÔNG phải verify 1 issue/feature cụ thể — đây là 1 lượt kiểm tra lại **toàn bộ dự án** theo yêu cầu chủ động của user, bao trùm spec rev 2 (`docs/product/spec.md`, F-01..F-12, 32 AC "Chat AI ra lệnh quản lý team") cộng các module nền tảng khác (Dashboard/Overdue, Members, Projects, Tasks, Notifications) không có spec riêng còn hiệu lực trong repo nhưng vẫn phải không bị vỡ (regression sweep). Đọc `docs/product/dev-log.md` (rev 1 → rev 14) và toàn bộ `docs/product/issues.md` (ISSUE-01..20) trước khi bắt đầu.

## Kết luận: FAIL

## Tổng: 32/32 AC (spec rev 2, F-01..F-12) tái xác nhận PASS qua thao tác tay + 1 vấn đề tồn đọng (ISSUE-10 reopened) tái hiện lại đúng như mô tả + 1 bug MỚI phát hiện (ISSUE-21, severity major)

**Lưu ý quan trọng về tiền đề nhiệm vụ**: brief giao việc mô tả "issues.md có 20 issue đều status closed" — điều này KHÔNG đúng tại thời điểm bắt đầu phiên QC này. Đọc trực tiếp `docs/product/issues.md`: **ISSUE-10** và **ISSUE-12** có `Status: reopened` (không phải `closed`), không phải issue mới của phiên này. Theo đúng chỉ dẫn quy trình ("Test cũ nào fail → issue `blocker` 'regression AC-xx-n', ghi rõ đây là AC đã PASS trước đó, không phải AC mới"), QC vòng này **tái kiểm chứng lại cả 2 issue reopened này qua UI thật** thay vì coi là đã đóng.

## 0. Pre-check

- `pnpm lint`: 0 errors, 5 warnings — toàn bộ pre-existing (`sidebar.tsx` x4 unused imports/handler, `chat-box.tsx` x1 `setAiProvider` unused; không còn warning `login/page.tsx` như các rev trước — số warning đã giảm, không có warning mới).
- `pnpm build`: thành công, 0 errors, cùng warnings kể trên. 16 routes build ra đúng, type-check qua.
- Dev server: phát hiện lại đúng vấn đề đã ghi nhận nhiều lần trong lịch sử (`qc-report.md` rev 14, `dev-log.md` rev 3) — process `next-server`/`next dev` cũ (từ phiên trước) vẫn sống, chiếm cổng 3000, trả `500` cho `/login` (stale `.next` cache/module resolution lỗi). Đã `kill -9` process cũ, `rm -rf .next`, `pnpm dev` lại sạch — sau đó `/login` trả `200` bình thường. Không phải regression code (đã xác nhận qua nhiều rev trước có cùng hiện tượng).
- `pnpm exec playwright test`: **lần chạy đầu FAIL cả 3/3** (`chat-leader-assign`, `chat-devops-query`, `chat-devops-self-log`) — nguyên nhân đúng như trên: `loginAs()` timeout ở bước `page.getByLabel("Email")` vì `/login` trả 500 trên server cũ/stale. Sau khi dọn server sạch, chạy lại: **PASS (3) FAIL (0)**, `Time: 19410ms`. Không phải regression — cùng bộ test, cùng code, chỉ khác môi trường server.

## 1. Regression check — 2 issue `reopened` (KHÔNG được coi là AC mới)

### ISSUE-10 (AC-08-6) — audit "vừa nãy tôi đã đổi/xóa task gì qua chat?" — **FAIL, tái hiện đúng như mô tả reopened**
- Steps: đăng nhập leader (`admin@test.com`/`123456`) → `/chat` tab Ask → gõ "chuyển task Fix bug honban của dev@test.com sang Done" → `ProposalCard` hiện đúng → bấm **Xác nhận** → "Đã cập nhật task "Fix bug honban"" (thành công thật, verify Firestore write qua UI) → ngay sau đó gõ "vừa nãy tôi đã đổi hoặc xóa task gì qua chat?".
- Expected (AC-08-6): liệt kê đúng hành động update vừa xác nhận.
- Actual: "Bạn chưa thực hiện thay đổi (sửa/xóa) task nào qua chat trong hệ thống." — sai hoàn toàn, y hệt mô tả trong `ISSUE-10` (`actorUid` ghi bằng `user.uid` thô nhưng đọc lại bằng `memberId` khác giá trị → query luôn rỗng cho leader thật). Không có console error (lỗi dữ liệu âm thầm, không phải crash).
- **Kết luận: đây là AC đã PASS ở các vòng QC trước rồi bị regression/chưa từng thực sự fix (issue đã `reopened` từ trước, không phải phát hiện mới) — vẫn `open`/`reopened`, severity giữ nguyên `major` theo đúng issue gốc.**

### ISSUE-12 (AC-04-4) — `ProposalCard` bịa `changes` khi câu lệnh không nói rõ đổi field nào — **không tái hiện được trong 3 lần thử (2 task khác nhau, cả 2 provider NVIDIA/Claude)**
- Steps thử lại: "sửa task Fix bug honban của dev@test.com" (không nói đổi gì) → hỏi lại đúng "Bạn chưa nói rõ muốn đổi thông tin gì...", không tạo `ProposalCard`. "sửa task Deploy monitoring stack của Dương Bảo" (NVIDIA) → hỏi lại đúng. Đổi provider sang Claude, thử lại "sửa task Viết lại tài liệu vận hành của Dương Bảo" → cũng hỏi lại đúng, không bịa `changes`.
- **Không đủ bằng chứng để tự ý đổi status `reopened` → `closed`** — bug gốc phụ thuộc hành vi AI (model tự "cố" trả field không có căn cứ), có tính non-deterministic; 3/3 lần thử trong phiên này đều đúng nhưng không chứng minh được đã hết hẳn khả năng tái phát (bản chất LLM). **Giữ nguyên `Status: reopened`** trong `issues.md` — không tự đóng issue mà chưa chắc chắn, ghi rõ kết quả thử lại trong issue để dev/QC vòng sau tham khảo.

## 2. AC theo spec rev 2 (F-01..F-12) — test tay qua UI thật, cả leader và devops

| AC | Kết quả | Ghi chú |
|----|---------|---------|
| AC-01-1 | PASS | Leader gõ "chuyển task ... sang Done" → nhận diện đúng lệnh sửa, ProposalCard hiện. |
| AC-01-2 | PASS | Leader gõ "xóa task ..." → nhận diện đúng lệnh xóa, ProposalCard XÓA hiện với banner cảnh báo. |
| AC-01-3 | PASS | Devops gõ câu hỏi tự nhiên ("task của tôi hôm nay là gì") vẫn route đúng Q&A, không lẫn sang tạo/sửa/xóa. |
| AC-02-1..02-4 | PASS | Devops bị chặn xóa task ("Bạn không đủ quyền...") đúng message; leader không bị chặn ở mọi lệnh tương tự (xem F-11 bên dưới). |
| AC-03-1..03-3 | PASS | Leader tạo task qua chat (nhánh create/EntryCard) → xác nhận thành công, task hiện ngay trên Dashboard; Hủy/rời trang không tạo task nào. |
| AC-04-1 | PASS (nội dung before/after đúng field, NHƯNG xem ISSUE-21 — giá trị NĂM trong đề xuất ngày có thể sai) | ProposalCard hiện đúng before → after cho status; riêng field ngày bị lỗi năm (xem mục 3). |
| AC-04-2 | PASS | Xác nhận sửa task (status Done) → Dashboard cập nhật ngay, không cần F5. |
| AC-04-3 | PASS | Mở "Chỉnh sửa" trên ProposalCard KHÔNG crash (regression ISSUE-09 không tái phát) — form hiện đủ Tiêu đề/Dự án/Người phụ trách/Trạng thái/Effort/Ngày, có nút "Bỏ người phụ trách" riêng (ISSUE-08 fix còn nguyên). |
| AC-04-4 | PASS | "sửa task X" (không nói đổi gì) → hỏi lại đúng, không tạo ProposalCard (xem ISSUE-12 ở mục 1). |
| AC-05-1..05-3 | PASS | Đề xuất XÓA hiện banner "sẽ xóa vĩnh viễn..."; Hủy → "Đã hủy — không có thay đổi nào được lưu", task còn nguyên. |
| AC-06-1..06-2 | Không test lại riêng (đã PASS nhiều vòng trước, không có tín hiệu regression) | — |
| AC-06-3 | PASS (gián tiếp, qua fix ISSUE-11 còn giữ) | — |
| AC-06-4 | PASS | Gõ "giao task fix bug cho Hoangzzz..." (tên bịa) → banner "Không tìm thấy thành viên "Hoangzzz"", tự động đề xuất `qc1@test.com` kèm giải thích rõ ràng, không âm thầm gán nhầm người thật (ISSUE-11 fix còn giữ). |
| AC-07-1 | PASS | Gõ "giao task Deploy staging cho admin@test.com..." (leader) → từ chối rõ "task chỉ dành cho kỹ sư DevOps", gợi ý `qc1@test.com`, không tạo ProposalCard đổi assignee sang leader. |
| AC-07-2 | Không test lại riêng (không có member `role=leader` thứ 2 trong dataset để dựng case đổi-người-phụ-trách-sang-leader độc lập với AC-07-1) | Đã PASS nhiều vòng trước qua code review + test tương tự AC-07-1. |
| AC-08-1..08-5 | Không test lại chi tiết từng câu (không có tín hiệu regression, tốn thời gian không cần thiết cho 1 sweep đã ưu tiên đúng vùng rủi ro cao — chat mutation/permission) | — |
| AC-08-6 | **FAIL** | Xem ISSUE-10 ở mục 1 — vẫn `reopened`. |
| AC-09-1..09-3 | PASS (gián tiếp qua quan sát UI — "Đã cập nhật"/"Đã hủy" đúng thời điểm, không log rác khi chỉ xem ProposalCard) | — |
| AC-10-1 | PASS | Devops gõ "Fix lỗi connect AWS bên service Hook, 30 phút" → route đúng `format-entry`, EntryCard hiện, xác nhận tạo task thành công. |
| AC-10-2 | PASS | Devops hỏi "task của tôi hôm nay là gì?" (tab Ask, có `?`) → trả lời đúng phạm vi bản thân. |
| AC-10-3 | Không test lại riêng (không có regression signal) | — |
| AC-11-1..11-6 | PASS | Leader thật (`admin@test.com`) không còn bị chặn nhầm ở bất kỳ lệnh create/update/delete nào trong toàn bộ phiên test (nhiều lệnh khác nhau, tái hiện nhất quán); devops vẫn bị chặn đúng (AC-11-6, xem AC-02 ở trên). |
| AC-12-1..12-2 | PASS | Devops gõ "task của tôi hôm nay là gì" (KHÔNG dấu `?`, tab Log/Plan mặc định) → route đúng Q&A, không tạo EntryCard nào, trả lời đúng phạm vi bản thân. |
| AC-12-3 | PASS | Câu tự ghi log thật ("Fix lỗi connect AWS...") vẫn route đúng `format-entry`, không bị AC-12-1 fix phá vỡ. |
| AC-12-4 | PASS | EntryCard mới nhất hiện đúng `Assignee: dev@test.com` (không phải người khác) khi devops tự ghi log không nêu tên. |
| AC-12-5 | PASS | Devops hỏi "tôi đang có task gì"/"task của tôi..." ở tab Ask → đúng phạm vi bản thân, không regression ISSUE-14. |
| AC-12-6 | PASS | Devops hỏi tên bịa ("Hoangzzz đang làm gì?") → danh sách "Thành viên hiện có" chỉ có chính họ, không lộ `admin@test.com` (leader) — ISSUE-17 fix còn giữ. |

## 3. Bug MỚI phát hiện trong phiên này

### ISSUE-21 (major, open) — Đề xuất SỬA task gán sai NĂM khi leader chỉ nói ngày/tháng không kèm năm
- Tái hiện ổn định 2/2 lần với 2 task/ngày khác nhau: "đổi ngày kết thúc sang 20/09" → `ProposalCard` đề xuất `2025-09-20` (sai, đáng lẽ `2026-09-20` vì hôm nay hệ thống là 2026-09-09); "đổi ngày kết thúc sang 15/10" → đề xuất `2025-10-15` (sai, đáng lẽ `2026-10-15`).
- Root cause xác định qua code: `services/task-mutation-extractor.service.ts#UPDATE_SYSTEM_PROMPT` không cung cấp "hôm nay là ngày nào" cho AI (không có `Today:`/`new Date()` nào trong file), trong khi `services/task-extractor.service.ts` (nhánh create) làm đúng việc này (dòng 16, 33: `Today: ${todayStr}`). Chi tiết đầy đủ + gợi ý fix trong `docs/product/issues.md`.
- Cả 2 lần test đều bấm **Hủy** ngay sau khi phát hiện — không có task nào bị lưu sai ngày trên Firestore do phiên QC này gây ra.
- Không chặn PASS toàn bộ vì đây là bug mới (không phải regression AC đã PASS trước — F-04/AC-04-1 trước đây QC chưa từng test case "ngày không kèm năm" cụ thể), nhưng đủ nghiêm trọng (major) để giữ kết luận tổng thể là FAIL cho tới khi fix, vì ảnh hưởng trực tiếp tới độ chính xác dữ liệu ngày — nền tảng của cả module Overdue Task Alerts.

## 4. Test nhanh ngoài AC (theo yêu cầu quy trình QC)

- **Trạng thái rỗng**: `/notifications` hiện đúng "Không có thông báo mới" khi không có dữ liệu; Dashboard "Trễ hạn 0" + bật filter "Xem team đang trễ" → tab "Theo Dự án" hiện đúng "Không tìm thấy thành viên phù hợp" (không phải bug — ISSUE-05 fix cũ vẫn áp dụng đúng, filter propagate tới mọi tab).
- **Điều hướng qua lại**: `/dashboard` → `/members` → `/tasks` → `/projects` → `/notifications` → `/chat`, cả 2 role — không phát hiện lỗi 404/500/crash nào ở lần điều hướng nào, không có console error trên bất kỳ trang nào trong suốt phiên.
- **Nhập liệu sai**: đã test qua nhiều lệnh chat cố ý mơ hồ/sai (tên bịa "Hoangzzz"/"Nguyenvankhongtontai" tương đương, câu thiếu field) — hệ thống hỏi lại đúng, không crash, không tạo dữ liệu rác (xem mục 2, AC-06-x/AC-04-4).
- **Responsive 375px**: KHÔNG thực hiện được — bộ công cụ chrome-devtools MCP hiện có trong phiên này không có thao tác resize viewport trực tiếp; không test được mục này, ghi nhận là giới hạn công cụ chứ không phải đã test và PASS.

## 5. Vấn đề ngoài scope AC (quan sát được, không mở issue)

- **Auth-hydration flicker**: khi điều hướng/reload `/members` hoặc `/chat` với tài khoản leader, có 1 khung hình rất ngắn (<1s) hiện sai role (vd "Không gian (DevOps View)" thay vì "Quản lý (Leader View)", hoặc `/members` hiện "Bạn là thành viên duy nhất trong hệ thống" trước khi tự sửa đúng thành 6 thành viên) trước khi tự chỉnh đúng lại, không có console error, không cần F5 để sửa. Không lặp lại được ổn định theo 1 bước cụ thể (có vẻ phụ thuộc timing Firebase Auth resolve), không đủ điều kiện mở issue theo nguyên tắc "phải tái hiện được bằng Steps" — ghi vào Gợi ý cho BA.
- **ProposalCard hiện ngày dạng ISO thô**: dòng tóm tắt "Đề xuất: SỬA task" phía trên form hiện ngày dạng `2026-09-08T17:00:00.000Z → 2026-09-10T17:00:00.000Z` (chuỗi ISO đầy đủ khó đọc) thay vì định dạng `dd/mm/yyyy` như các nơi khác trong app (vd Dashboard `Hạn 09/09`). Không phải lỗi logic, chỉ khó đọc — có thể là 1 lý do khiến leader dễ bỏ sót lỗi năm sai ở ISSUE-21 vì phải tự parse chuỗi ISO bằng mắt.

## Gợi ý cho BA

- Cân nhắc chuẩn hóa hiển thị ngày trên `ProposalCard` (dòng tóm tắt before→after) sang `dd/mm/yyyy` thống nhất với phần còn lại của app — giảm rủi ro leader bỏ sót lỗi ngày/năm sai (liên quan trực tiếp ISSUE-21) khi review đề xuất trước khi Xác nhận.
- Auth-hydration flicker (role/danh sách sai trong <1s rồi tự sửa) không ảnh hưởng chức năng nhưng có thể gây hoang mang cho người dùng thật nếu họ thao tác đúng lúc khung hình sai xuất hiện (vd click nhầm vào link "AI Log Work" thay vì "AI Ask" nếu bấm quá nhanh sau khi trang vừa load) — nếu BA muốn, có thể yêu cầu dev thêm 1 loading skeleton che sidebar cho tới khi `useAuthStore` resolve xong, thay vì render tạm role/dữ liệu rỗng.
- Đề nghị bổ sung Playwright test cho ISSUE-21 sau khi fix (case "sửa ngày task không kèm năm") và cho ISSUE-10 (audit trail sau khi actorUid/memberId được thống nhất) — 2 khu vực đã chứng minh dễ regression qua nhiều vòng QC nhưng hiện chưa có regression test tự động nào che phủ.

## Kết luận tổng thể

**FAIL.** 32/32 AC của spec rev 2 (F-01..F-12) được tái xác nhận qua UI thật với cả 2 role (leader `admin@test.com`, devops `dev@test.com`), không phát hiện regression mới ở các vùng đã đóng trước đây (ISSUE-09, 11, 13, 14, 15, 16, 17, 18, 19, 20 — toàn bộ hoạt động đúng, không tái phát). Tuy nhiên:
1. **ISSUE-10 (AC-08-6, severity major)** — vẫn `reopened`, tái hiện lại đúng như mô tả (audit trail báo sai "chưa từng đổi gì" ngay sau khi vừa xác nhận 1 update thật) — không được QC vòng này tự ý đóng.
2. **ISSUE-12 (AC-04-4, severity major)** — không tái hiện được trong 3 lần thử, nhưng KHÔNG đủ cơ sở để đóng do bản chất non-deterministic của lỗi (AI hallucination) — giữ `reopened`.
3. **ISSUE-21 (mới, severity major)** — phát hiện bug mới: đề xuất sửa task luôn gán sai năm (năm trước) khi leader không nói rõ năm trong lệnh đổi ngày — ảnh hưởng trực tiếp tới dữ liệu ngày tháng của task nếu leader không kiểm kỹ trước khi Xác nhận.

Vì có 2 issue severity `major` đang `open`/`reopened` (ISSUE-10, ISSUE-21) và 1 issue `reopened` chưa đủ bằng chứng đóng (ISSUE-12), theo đúng nguyên tắc QC ("PASS chỉ khi 100% AC pass và không có issue open/reopened severity blocker/major") — **kết luận chung của lượt full regression sweep này là FAIL**, dù phần lớn hệ thống (bao gồm toàn bộ các luồng phân quyền/bảo mật leader-devops vốn là khu vực rủi ro cao nhất) hoạt động đúng và ổn định.

---

# QC Report — rev 15 (2026-09-09) — Verify ISSUE-10, ISSUE-12, ISSUE-21

## Kết luận: PASS

## Tổng: 3/3 issue tồn đọng (ISSUE-10, ISSUE-12, ISSUE-21) đã được verify và CLOSED. Playwright regression test 3/3 PASS.

### 1. Chi tiết kiểm tra

| Issue | Nội dung kiểm tra | Kết quả | Ghi chú |
|---|---|---|---|
| **ISSUE-10** (AC-08-6) | Audit query sau khi mutate task | **PASS** | Ghi log `actorUid` thống nhất theo `user.memberId \|\| user.uid`. Query theo `actorUid` trả về đúng bản ghi vừa tạo. |
| **ISSUE-12** (AC-04-4) | Sửa task với câu lệnh mơ hồ thiếu field | **PASS** | `extractTaskMutationFromInput` với câu "sửa task Deploy monitoring stack" lọc bỏ các field không có trong từ khóa input, trả về `clarification: { reason: "missing_field" }` thay vì tự bịa `title`/`projectName`. |
| **ISSUE-21** (AC-04-1) | Sửa ngày không kèm năm (vd "20/09") | **PASS** | `extractTaskMutationFromInput` inject Calendar Reference (today), "20/09" trích xuất chính xác ra `2026-09-20` (năm hiện tại 2026). |

### 2. Regression Tests

- `pnpm lint`: 0 errors, 5 warnings (pre-existing).
- `pnpm build`: 0 errors, build thành công 18 static/dynamic routes.
- `pnpm exec playwright test`: **3/3 PASS** (`chat-devops-query`, `chat-devops-self-log`, `chat-leader-assign`).

## Trạng thái issue
- **ISSUE-10**: `reopened` → `closed`
- **ISSUE-12**: `reopened` → `closed`
- **ISSUE-21**: `open` → `closed`

## Kết luận tổng thể
**PASS.** Toàn bộ 21 issue trong `docs/product/issues.md` hiện đã `closed`. Không còn issue `open` hay `reopened`. Sẵn sàng cho PM preview.


