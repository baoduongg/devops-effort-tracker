# AI Chat: Tool-Calling Routing (thay thế regex cascade)

Date: 2026-09-23

## Vấn đề

`app/api/ai/answer-query/route.ts` hiện route câu hỏi qua **15 regex pattern** (card triggers,
dòng 77-231) + **4 hàm intent classifier regex** (`lib/intent.ts`: create/update/delete/informational).
Mỗi câu hỏi phải khớp đúng một trong các pattern hand-tuned này để được xử lý đúng; câu hỏi diễn đạt
khác đi (vd "bạn có thể phân bổ task cố định cho member theo dự án được không") rơi qua nhánh cuối
cùng — gọi thẳng LLM với toàn bộ snapshot nhét vào prompt, không có hướng dẫn gì về việc hệ thống
có hỗ trợ tính năng đó hay không → model tự đoán/bịa câu trả lời.

Thêm phrasing mới = thêm regex mới, không scale, dễ vỡ, không "thông minh" theo yêu cầu người dùng.

Root cause: **routing quyết định bằng regex, không phải bằng model reasoning.**

## Mục tiêu

- Thay routing regex bằng **tool-calling**: model tự chọn gọi tool nào dựa trên hiểu ngữ nghĩa câu
  hỏi, không cần liệt kê pattern.
- Giữ nguyên 100% UI: các card đẹp hiện có (free-list, member-info, overload, effort, load, report,
  overdue, members, projects, help, task-list) và luồng confirm-before-write cho create/update/delete
  task không đổi hình dạng payload (`AiResponsePayload` trong `types/chat.ts` giữ nguyên).
- Sửa luôn 2 bug đã phát hiện:
  1. Model mặc định đang là NVIDIA Llama-3.2 dù UI ghi "Claude 3.5 Sonnet" (`ai-provider.service.ts:6-10`).
  2. Không có hướng dẫn cho model khi được hỏi về tính năng hệ thống không hỗ trợ (vd recurring task)
     → phải trả lời "không hỗ trợ", không bịa.

## Kiến trúc

### Model bắt buộc: Claude

Route `answer-query` luôn dùng Claude (bỏ nhánh chọn nvidia mặc định cho route này) — tool-calling
cần model đủ mạnh để chọn đúng tool nhiều lựa chọn bằng tiếng Việt tự nhiên. `services/nvidia.service.ts`
và cờ `provider` client vẫn giữ nguyên cho các chỗ khác (vd task-extractor vision path) không đổi.

### Vòng lặp tool-calling (1-2 round trip)

1. Server build `tools` array dựa trên quyền của người hỏi (leader thấy đủ 13 tool, devops chỉ thấy
   tool truy vấn + tool tạo/sửa/xóa **bị loại khỏi danh sách hoàn toàn** — model không thể gọi tool nó
   không thấy, thay cho check "F-02" sau khi đã phân loại intent bằng regex như hiện tại).
2. Gọi Claude 1 lần với `system` (system prompt mới, xem dưới) + `messages: [{role: user, content: query}]`
   + `tools`. Claude trả về `tool_use` block (đúng 1 tool, vì mỗi câu hỏi ứng với đúng 1 hành động).
3. Server chạy hàm implementation tương ứng (tái dùng nguyên xi các hàm đã có: `buildFreeCardAvailability`,
   `buildTaskListPayload`, `extractTaskEntryFromInput`, `extractTaskMutationFromInput`, v.v. — không viết
   lại logic nghiệp vụ, chỉ đổi cách nó được **gọi tới**).
4. Với tool loại "card" (free/tasks/overload/effort/load/report/overdue/members/projects/help/member-info):
   trả `tool_result` là JSON payload đó, gọi Claude vòng 2 chỉ để sinh câu `answer` ngắn tự nhiên giới
   thiệu card (giống các dòng `answer = "..."` hiện có ở mỗi nhánh) — hoặc, để tiết kiệm 1 round trip,
   server tự sinh answer template ngắn như hiện tại (không cần AI cho câu giới thiệu card, giữ y hệt
   UX hiện có). **Quyết định: giữ answer template tĩnh do server sinh (như code cũ)**, không cần vòng 2,
   trừ tool Q&A tự do.
5. Với tool `answer_general_question` (thay thế nhánh LLM tự do cuối cùng, dùng khi câu hỏi không khớp
   card/mutation nào — vd hỏi về tính năng, hỏi tổng hợp linh hoạt): model trả lời trực tiếp bằng text,
   không cần thêm round trip, dùng system prompt + grounding snapshot y như nhánh hiện tại.
6. Với tool `create_task`/`update_task`/`delete_task`: model trả `tool_use` với args (title, projectName,
   assigneeName, effortMinutes, ...) trích xuất trực tiếp từ câu hỏi bằng chính model đang chạy — **bỏ
   luôn bước gọi phụ `extractTaskEntryFromInput`/`extractTaskMutationFromInput` qua AI riêng** (hiện tại
   đang gọi AI 2 lần: 1 lần đoán intent bằng regex, 1 lần gọi AI khác để extract JSON). Tool schema định
   nghĩa rõ input shape (title, projectName, effortMinutes, assigneeName, startDate, endDate, status),
   Claude tool-calling tự điền đúng kiểu, đỡ 1 lệnh gọi AI + đỡ toàn bộ `extractJsonFromAiText` parsing
   fallback (raw text JSON parsing không còn cần thiết vì tool input đã có schema-validated JSON).
   Việc validate field bắt buộc (projectName, effortMinutes) chuyển thành **tool `input_schema` required
   fields** — nếu thiếu, Claude tự hỏi lại (không cần code check `mentionsProject`/`mentionsEffort` bằng
   regex như hiện tại, dòng 323-336).
   Logic hậu xử lý (match assignee với danh sách thành viên thật, chặn giao cho leader, suggest người
   phù hợp khi tên không khớp) **giữ nguyên**, chỉ đổi input đến từ tool args thay vì từ AI-extract JSON.

### Danh sách tool (13)

Card tools (deterministic, không cần AI thực thi, chỉ cần AI **chọn**):
`list_free_members`, `list_all_tasks`, `list_overloaded_members`, `get_effort_summary`,
`get_workload_by_member`, `get_project_report`, `list_overdue_tasks`, `list_members`, `list_projects`,
`get_help`, `get_member_info(memberName)`.

Mutation tools (cần confirm trước khi ghi, giữ nguyên UX "soạn đề xuất → user bấm Xác nhận"):
`create_task(title, projectName, effortMinutes, assigneeName?, startDate?, endDate?, status?)`,
`update_task(taskIdentifier, changes)`, `delete_task(taskIdentifier)`.

Q&A tự do:
`answer_general_question` — dùng khi câu hỏi không map vào tool nào ở trên (hỏi về tính năng, hỏi so
sánh, hỏi tổng hợp không chuẩn card nào). Trả lời trực tiếp bằng text dựa trên grounding snapshot +
system prompt.

Audit trail (`AUDIT_QUERY_PATTERN` hiện tại) **giữ nguyên là regex-deterministic**, không qua AI — đây
là truy vấn chính xác 1-1 vào `taskChangeLogs`, không cần suy luận ngôn ngữ tự nhiên, converting nó
sang tool không có lợi ích, chỉ tốn 1 lệnh gọi AI cho việc đã chắc chắn 100%. Giữ y nguyên
`AUDIT_QUERY_PATTERN.test()` check trước khi vào tool loop.

### System prompt — bổ sung

Thêm đoạn mới vào `SYSTEM_PROMPT` (route.ts:32-75), sau mục 5 hiện có:

> 6. GIỚI HẠN TÍNH NĂNG HỆ THỐNG: Hệ thống này CHỈ hỗ trợ giao task một lần (one-off) với
>    startDate/endDate cụ thể. KHÔNG có tính năng task lặp lại/định kỳ/cố định theo lịch (recurring/
>    template task). Nếu người dùng hỏi về khả năng này, trả lời rõ ràng là tính năng chưa được hỗ
>    trợ, KHÔNG suy đoán hoặc trả lời như thể tính năng đó tồn tại. Không dùng bất kỳ tool nào cho câu
>    hỏi loại này — dùng `answer_general_question`.

Đoạn này generalize được cho mọi câu hỏi "hệ thống có làm được X không" nằm ngoài tool list — không
chỉ riêng recurring task.

### Quyền hạn (thay F-02 check)

`buildToolsForRole(isLeader: boolean): Tool[]` — nếu `!isLeader`, loại bỏ `create_task`, `update_task`,
`delete_task` khỏi mảng tools gửi lên Claude. Model không có tool này trong ngữ cảnh thì không gọi được.
Giữ nguyên câu trả lời "không đủ quyền" tĩnh cho trường hợp devops cố tình gõ lệnh tạo/sửa/xóa — nhưng
giờ đơn giản hơn: nếu Claude (không thấy tool) vẫn trả lời bằng text thường mô tả ý định tạo task thay
vì gọi tool, server phát hiện qua **không có tool_use nào được gọi + response rơi vào
`answer_general_question`** — không cần giữ check tay nữa vì tool ẩn hoàn toàn khỏi model.
(Rủi ro nhỏ: model có thể trả lời chung chung thay vì báo "không đủ quyền" rõ ràng — thêm 1 câu trong
system prompt: "Nếu người dùng không có tool tạo/sửa/xóa nhưng câu hỏi rõ ràng là muốn tạo/sửa/xóa task,
trả lời rõ: không đủ quyền, hành động này chỉ dành cho Leader.")

### File thay đổi

- `app/api/ai/answer-query/route.ts` — xóa 15 regex pattern (dòng 77-231), xóa gọi
  `isTaskCreationIntent/isTaskUpdateIntent/isTaskDeleteIntent`, thay bằng 1 lệnh gọi
  `runChatToolLoop()` mới.
- `services/chat-tools.service.ts` (mới) — định nghĩa tool schemas (`input_schema` JSON Schema cho
  từng tool) + `runChatToolLoop(query, snapshot, allMembers, isLeader, threadId)` orchestrator: gọi
  Claude với tools → dispatch tool_use → trả `AiResponsePayload`.
- `services/claude.service.ts` — thêm `callClaudeTool(systemPrompt, userText, tools)` trả về
  `{ toolUse: {name, input} | null, text: string | null }` (mở rộng `callClaudeText`, dùng chung
  client/model, thêm `tools` param vào body request).
- `lib/intent.ts` — xóa toàn bộ (4 hàm không còn ai gọi). Giữ `isInformationalQuery` **chỉ nếu**
  còn nơi khác dùng — grep xác nhận trước khi xóa (kiểm tra lúc viết plan).
- `services/ai-provider.service.ts` — route `answer-query` gọi thẳng `callClaudeTool` thay vì qua
  `getProvider()`/`callAiText` (không đổi hành vi các route khác dùng `callAiText`).
- `services/task-extractor.service.ts`, `services/task-mutation-extractor.service.ts` — logic hậu xử
  lý (match assignee, chặn leader, default field) tách thành hàm thuần `(rawArgs, allMembers) => FormattedEntry`
  tái sử dụng được từ cả tool dispatcher lẫn (nếu còn dùng) đường cũ; bản thân bước gọi-AI-để-extract-JSON
  trong 2 file này không còn được route `answer-query` gọi tới nữa (nhưng vẫn có thể còn dùng ở nơi
  khác — kiểm tra khi viết plan trước khi xóa hẳn).
- `types/chat.ts` — không đổi (payload union đã đúng shape cần).
- `components/chat/chat-box.tsx:815` — sửa text footer từ "Claude 3.5 Sonnet" thành tên model thật
  đang chạy (đọc từ response hoặc hardcode đúng theo `ANTHROPIC_MODEL`), hoặc bỏ tuyên bố model cụ thể
  nếu không muốn hardcode — quyết định lúc viết plan.

### Không đổi

- `services/grounding.service.ts` (buildGroundingSnapshot) — giữ nguyên, vẫn là nguồn dữ liệu duy nhất
  nhét vào system prompt cho `answer_general_question` và làm input cho các card builder.
- Toàn bộ `chat-card-builders.service.ts` — các hàm pure `(snapshot) => payload` giữ nguyên 100%, chỉ
  đổi nơi gọi.
- Luồng confirm/xác nhận task ở frontend (`ai-entry`, `ai-proposal` message types) — không đổi.
- Audit trail branch (regex-deterministic) — không đổi.
- `resolveIsLeader`, `detectSelfQueryTarget` cho pronoun "tôi/mình" — vẫn cần, tool `get_member_info`
  cần biết ai đang hỏi để tự resolve "tôi" → tên thật trước khi đưa cho model (đơn giản hơn: nhét thẳng
  tên người hỏi vào system prompt as context, để model tự hiểu "tôi" = người hỏi, không cần preprocess
  regex nữa — quyết định lúc viết plan xem có bỏ được `detectSelfQueryTarget` không).

## Rủi ro & đánh đổi

- **Chi phí**: mỗi câu hỏi giờ luôn gọi Claude thật (không còn nhánh card trả lời "miễn phí" bằng
  regex-deterministic không qua AI) — trước đây card branches (5a-5j) hoàn toàn không gọi AI, giờ vẫn
  cần 1 lệnh gọi AI để *chọn* tool dù tool tự nó deterministic. Đánh đổi: mất tốc độ/chi phí một chút,
  đổi lấy độ chính xác routing cao hơn nhiều và code ít hơn ~300 dòng regex.
- **Latency**: 1 network round-trip tới Claude cho mọi câu hỏi kể cả card đơn giản, thay vì trả lời
  tức thì bằng regex. Chấp nhận được — route hiện tại đã luôn gọi AI cho nhánh Q&A cuối cùng, giờ mọi
  nhánh giống vậy.
- **Proxy endpoint lạ** (`code.runagent.click/v1/messages`, không phải Anthropic thật): cần xác nhận
  proxy này có forward đúng `tools` param theo chuẩn Anthropic Messages API không — nếu proxy strip
  field lạ, tool-calling sẽ fail im lặng. Việc đầu tiên trong plan: test 1 lệnh gọi `tools` thật qua
  proxy này trước khi viết toàn bộ service.
- **Model tự extract task fields** thay vì extractor riêng: rủi ro model tool-calling kém chính xác hơn
  extractor prompt chuyên biệt hiện có (prompt task-extractor rất chi tiết về effort/date parsing, xem
  `task-extractor.service.ts:30-73`). Giảm rủi ro: nhét nguyên đoạn hướng dẫn effort/date parsing đó
  vào **description của tool `create_task`** thay vì xóa mất, giữ độ chính xác tương đương.

## Ngoài phạm vi

- Không đổi devops "format-entry" self-log flow (`submitFormatEntry` trong chat-box.tsx) — flow đó
  không đi qua route `answer-query`, đã hoạt động tốt, không liên quan tới bug được báo cáo.
- Không thêm tính năng recurring/fixed task thật — chỉ dạy AI trả lời đúng "chưa hỗ trợ" thay vì bịa.
  Nếu muốn thêm tính năng đó thật, đó là spec khác.
- Không đổi vision path (`callClaudeVision`, `callAiVision`) — chụp ảnh giao task không liên quan routing.
