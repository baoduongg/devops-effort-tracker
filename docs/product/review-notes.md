# Review Notes — rev 3 (Chat AI: F-06/F-07/F-08)

Code review (`code-review medium`) trên diff implement spec rev 3 (`lib/intent.ts`, `services/grounding.service.ts`, `app/api/ai/answer-query/route.ts`, + `app/landing/page.tsx`, `app/login/page.tsx`, `app/globals.css` từ commit trước đó nằm trong cùng diff).

## Correctness — cần fix trước khi QC (severity cao → thấp)

1. **Devops-mode data scoping tin `memberId` client gửi lên, không xác thực danh tính** — `app/api/ai/answer-query/route.ts:261`. F-08 chỉ check `memberId` có tồn tại trong danh sách member, không check nó có thuộc đúng người đang đăng nhập. Client devops có thể gửi `memberId` của người khác và nhận data effort/task của người đó — đúng lỗ hổng F-08 sinh ra để chặn nhưng chưa chặn hết. **Cần fix**: ràng `memberId` với session/identity thật của người gọi (không chỉ validate tồn tại).

2. **`EntryCard` Confirm button không chặn placeholder "unknown" khi user tự sửa tay** — `components/chat/entry-card.tsx:304`. `isDisabled` chỉ check `!edited.projectName` (rỗng), không check các giá trị sentinel (`unknown`, `n/a`, `không rõ`...) giống `isUnknownProjectName` phía server. User bấm "Chỉnh sửa" gõ tay "n/a" vào ô dự án → Confirm vẫn bật, lưu thẳng task với project rác — vòng qua đúng gate F-07 mới thêm (gate server chỉ chạy ở lần extract đầu, không chạy lại lúc confirm). **Cần fix**: dùng chung `isUnknownProjectName` (hoặc tương đương) ở client trước khi enable Confirm.

3. **`hasUnfilledPlaceholder` regex `\[[^\]]+\]` match mọi ngoặc vuông, không riêng placeholder mẫu** — `lib/intent.ts:44`, chạy trên nguyên văn input trước khi phân loại. Input hợp lệ chứa ngoặc vuông thật (`server[prod-01]`, link markdown `[chi tiết](url)`, `items[0]`) đi kèm ý định giao task → bị chặn nhầm là "còn placeholder chưa điền". **Cần fix**: thu hẹp pattern để chỉ khớp các placeholder có nghĩa (theo đúng `template` khai báo trong `SLASH_COMMANDS`, hoặc danh sách nhãn tiếng Việt cụ thể như spec đã liệt) thay vì "bất kỳ `[...]`".

## Nên cân nhắc (không chặn merge)

4. **`isUnknownProjectName` chặn luôn một dự án tên thật là "Unknown"/"N/A"** — `app/api/ai/answer-query/route.ts:12`. Edge case hiếm nhưng có thật với đội đặt tên dự án kiểu bucket chung. Chấp nhận rủi ro này theo giả định trong spec.
5. **`getMembers()` gọi trùng** — route gọi riêng trong khi `buildGroundingSnapshot()` đã gọi `getMembers()` nội bộ → tốn 1 lần đọc Firestore thừa mỗi tin nhắn chat.
6. **`scopeSnapshotToMember` recompute projects sau khi `buildGroundingSnapshot` đã tính project data đầy đủ** — lãng phí allocate/compute cho phần bị bỏ đi ở mode devops. Không chặn, chỉ là hiệu năng.
7. **Landing page mới (`app/landing/page.tsx`) + đoạn thêm trong `app/login/page.tsx` + `app/globals.css` vi phạm quy tắc Astryx trong CLAUDE.md** — dùng `<div>`/`<a>` thô, hex cứng (`bg-[#070a0f]`...) thay vì component/token. Đây là code có sẵn từ trước rev 3 (không phải do Developer agent vừa thêm cho spec này) — ghi nhận nợ kỹ thuật, không thuộc scope fix F-06/07/08, để riêng nếu cần dọn sau.
8. **7 khối lặp tạo `answer` + `createChatLog` + `NextResponse.json` trong route** — có thể gộp 1 helper `respondAndLog`. 1 nhánh (unknown-project) bỏ qua `createChatLog` không rõ chủ đích — nên có comment giải thích hoặc gộp cho nhất quán.
9. **Thiếu guard `?? 0` cho `task.effortPercent` ở vài nơi hiển thị** (`workload-matrix.tsx:208,271`, `devops-workspace.tsx:323,410,474`, `app/projects/page.tsx:387`, `team-timeline-chart.tsx:258,271,350`) — không thuộc diff rev 3 (code cũ), hiển thị "undefined%" nếu field thiếu. Ngoài scope, ghi nhận riêng.

## Quyết định

Finding #1, #2, #3 thuộc nhóm correctness liên quan trực tiếp tới đúng 3 vấn đề must (F-08, F-07, F-06) — đáng kể, quay lại bước [2] để Developer fix trước khi qua QC.
