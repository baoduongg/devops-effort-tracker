---
name: product-loop
description: Chạy vòng lặp PM → BA → Developer → QC → PM preview cho DevOps Effort Tracker. Dùng khi user gõ /product-loop hoặc yêu cầu "chạy luồng multi-agent", "bắt đầu vòng phát triển sản phẩm".
---

# Product Loop

Bạn là orchestrator. Không tự làm việc của agent — chỉ dispatch, đọc kết quả, quyết định bước tiếp. Handoff giữa các agent qua file trong `docs/product/`:

| File | Chủ sở hữu | Người đọc |
|------|-----------|-----------|
| `requirements.md` | pm | ba |
| `spec.md` | ba | developer, qc, pm |
| `dev-log.md` | developer | qc, ba, tech lead (review) |
| `review-notes.md` | tech lead (code-review skill) | developer |
| `qc-report.md` | qc | orchestrator, pm |
| `issues.md` | qc (mở/đóng), developer (đổi status `fixed`) | developer, qc |
| `feedback.md` | pm | ba |
| `e2e/*.spec.ts` | developer (viết sau khi AC PASS) | qc (chạy lại như regression) |

## Luồng

```
[0] requirements.md chưa có?  → Agent(pm)   "Viết requirements"
[1] Agent(ba)        "Phân tích requirements (+feedback nếu có) → spec.md rev N"
[2] Agent(developer) "Implement spec rev N (ưu tiên issues open)"
[2.5] Skill(code-review, medium) trên diff hiện tại → review-notes.md
      Có finding correctness/severity đáng kể → quay [2] "fix theo review-notes.md" (tối đa 2 vòng; vượt → ghi lại, đi tiếp [3] kèm cảnh báo)
      Sạch/chỉ nit nhẹ → [3]
[3] Agent(qc)        "Chạy pnpm exec playwright test (regression AC cũ) + test AC mới rev N → qc-report.md, issues.md"
      FAIL → quay [2] (tối đa 3 vòng dev↔qc; vượt → dừng, báo user)
      PASS → Developer viết Playwright test cho AC `must`/quan trọng mới PASS (nếu chưa có) → [4]
[4] Agent(pm)        "Preview app → feedback.md"
      REVISE → quay [1] với feedback (tối đa 3 rev; vượt → dừng, báo user)
      ACCEPT → kết thúc
```

## Quy tắc dispatch
- Mỗi lần gọi Agent: `subagent_type` đúng tên (`pm`, `ba`, `developer`, `qc`), prompt nêu rõ **bước nào, rev nào, file nào cần đọc/ghi**. Agent không nhớ vòng trước — nói lại.
- Bước [2.5] không phải Agent riêng — orchestrator tự gọi `Skill(code-review, args: "medium")` trên diff kể từ lần review trước, ghi tóm tắt finding vào `docs/product/review-notes.md`. Không tạo agent Tech Lead riêng — trùng việc, code-review skill đã làm đúng job này.
- `run_in_background: false` — mỗi bước phụ thuộc bước trước.
- Sau mỗi agent: đọc file output nó ghi (không tin tóm tắt suông), rồi mới quyết định bước tiếp.
- Sau mỗi bước, in 1–2 dòng cho user: bước gì, kết quả, bước tiếp.
- Dev server: đảm bảo `pnpm dev` chạy nền trước bước [3] và [4].
- Regression: từ rev 2 trở đi, QC luôn chạy `pnpm exec playwright test` (test cũ) trước khi test AC mới bằng tay — AC cũ fail = issue `blocker`, không phải "ngoài phạm vi".
- Không commit trong loop. Khi ACCEPT, hỏi user có muốn commit không.

## Đối số
- `/product-loop` — chạy từ bước phù hợp với trạng thái file hiện tại
- `/product-loop reset` — xóa `docs/product/*` trừ `requirements.md`, chạy lại từ [1]
- `/product-loop from <pm|ba|developer|qc>` — nhảy tới bước chỉ định
