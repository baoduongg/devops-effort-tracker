---
name: nextjs-refactor-cleanup
description: Refactor và dọn dẹp các file Next.js/React/TypeScript quá dài, khó maintain — tách logic khỏi UI, gom API calls vào service layer, trích custom hooks, chia nhỏ component. Dùng skill này bất cứ khi nào user nói "refactor", "file này dài quá", "clean code", "dọn code", "tách file", "chia nhỏ component", "code khó improve", "khó đọc", hoặc paste vào một file component/page/hook lớn và than phiền về độ phức tạp — kể cả khi họ không dùng đúng từ "refactor".
---

# Next.js Refactor & Cleanup

Skill này giúp phân tích và tách nhỏ những file React/Next.js đã phình to (component, page, hook, service) thành cấu trúc gọn gàng, dễ đọc, dễ mở rộng — mà KHÔNG thay đổi behavior.

Stack mặc định giả định (theo user preferences, có thể khác nếu codebase nói khác):
- Next.js 15 App Router, React 19, TypeScript strict mode
- Zustand cho state phức tạp/shared
- shadcn/ui + Tailwind, `cn()` (clsx + tailwind-merge)
- API calls qua axios instance, tách vào `/api` hoặc `/services`
- Functional component only, named export ưu tiên hơn default export

## Nguyên tắc cốt lõi

Không refactor theo số dòng cố định. Đánh giá theo **độ phức tạp/số trách nhiệm (responsibilities)** file đang gánh. Một file 150 dòng nhưng trộn 4 concern khác nhau vẫn cần tách; một file 400 dòng nhưng là 1 component thuần UI, logic đơn giản, có thể không cần đụng vào.

## Bước 1 — Đọc và chẩn đoán (Diagnose)

Đọc toàn bộ file, liệt kê ra các "code smell" sau nếu có:

| Smell | Dấu hiệu |
|---|---|
| Logic lẫn UI | `useEffect`/`useState`/business logic nằm chung JSX phức tạp |
| Gọi API trực tiếp | `fetch`/`axios` gọi thẳng trong component thay vì qua service |
| Component đa nhiệm | Component render nhiều block UI độc lập, không liên quan chức năng |
| State phức tạp | >3-4 `useState` liên quan lẫn nhau, nên gộp `useReducer` hoặc tách hook |
| Duplicate logic | Cùng 1 đoạn xử lý lặp lại nhiều nơi trong file hoặc với file khác |
| Prop drilling | Truyền props qua nhiều tầng con chỉ để tới component sâu bên trong |
| Type lộn xộn | Interface/type định nghĩa rải rác, không tái sử dụng được |
| Side-effect phức tạp | Nhiều `useEffect` với dependency phức tạp, khó trace |

Nếu file không có smell đáng kể, nói thẳng với user là file này ổn, không cần tách — đừng tách chỉ để tách.

## Bước 2 — Đề xuất cấu trúc tách file

Dựa theo smell tìm được ở bước 1, chọn chiến lược tách phù hợp cho từng trường hợp (không áp 1 công thức cứng cho mọi file):

- **Logic phức tạp (state, effect, computed value)** → trích ra custom hook riêng: `use<TenChucNang>.ts`, đặt cạnh component hoặc trong `/hooks`.
- **Gọi API** → chuyển vào `/services/<domain>.service.ts` hoặc `/api/<domain>.ts`, dùng axios instance có sẵn trong project (tìm file instance hiện có, không tạo mới nếu đã tồn tại).
- **Block UI lặp lại hoặc độc lập về mặt chức năng** → tách component con cùng thư mục, ví dụ `components/<Feature>/<Feature>Header.tsx`.
- **Nhiều interface/type** → gom vào `types.ts` cùng thư mục hoặc `/types/<domain>.ts`.
- **Pure function xử lý dữ liệu, format, validate** → chuyển vào `utils/<domain>.utils.ts`.
- **State dùng chung nhiều component** → chuyển sang Zustand store (`store/use<Domain>Store.ts`), tránh prop drilling.

Trước khi viết code: liệt kê ngay danh sách file sẽ tạo/sửa (đường dẫn cụ thể) để user thấy toàn bộ scope, đúng theo preference của user — không viết code trước khi có danh sách này.

## Bước 3 — Thực thi refactor

- Giữ nguyên behavior và props/API public của component/hook gốc trừ khi user yêu cầu đổi.
- Code chạy được thật, không để `// TODO`, không placeholder.
- Giữ nguyên TypeScript types chặt chẽ, không dùng `any` để né lỗi.
- Không thêm comment giải thích trừ khi logic thực sự khó hiểu (theo preference user).
- File gốc sau refactor chỉ còn đóng vai trò "compose": import hook/component/service con và render/orchestrate, không còn chứa logic nghiệp vụ trực tiếp.
- Nếu phát hiện logic có bug tiềm ẩn trong lúc đọc code cũ, báo cho user riêng — không tự ý "sửa luôn" mà không nói, tránh thay đổi behavior ngoài ý muốn.

## Bước 4 — Xác nhận không phá vỡ gì

- Nếu project có test cho file này, chạy lại test sau refactor.
- Nếu không có test, liệt kê nhanh checklist thủ công để user tự verify (props nào cần check, luồng nào cần click thử).
- Báo cáo ngắn gọn: file nào bị ảnh hưởng, import nào cần cập nhật ở nơi khác dùng component/hook này (search toàn repo nếu có thể).

## Khi nào KHÔNG refactor

- File đã gọn, chỉ dài do nhiều JSX tĩnh (ví dụ landing page section-by-section rõ ràng) — không cần tách nếu không có trộn concern.
- User chỉ muốn hỏi ý kiến/đánh giá, chưa muốn sửa — chỉ đưa nhận xét + đề xuất, chờ xác nhận rồi mới code.