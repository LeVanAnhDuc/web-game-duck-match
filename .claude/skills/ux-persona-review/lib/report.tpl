# {{PRODUCT_NAME}} — UX persona review · {{RUN_DATE}}

> {{SESSION_COUNT}} phiên · {{PERSONA_COUNT}} persona · {{RED_ROUTE_COUNT}} Red Route
> Công cụ trình duyệt: {{BROWSER_TOOL}}{{DEGRADED_NOTE}}
> Red route chốt ngày: {{RED_ROUTES_DATE}}

## Ấn tượng đầu

Tính trên toàn bộ persona — ấn tượng đầu chỉ xảy ra một lần.

| Thước | Kết quả |
| --- | --- |
| Đoán đúng đây là trang gì | {{GUESSED_RIGHT}}/{{PERSONA_COUNT}} |
| Dám nhập email | {{WOULD_TRUST}}/{{PERSONA_COUNT}} |
| Lý do người không dám | {{DISTRUST_REASONS}} |

**Ba từ trước khi dùng:** {{WORDS_BEFORE}}
**Ba từ sau khi dùng:** {{WORDS_AFTER}}
**Đổi theo hướng:** {{SENTIMENT_SHIFT}}

## Bảng điểm theo Red Route

| Red Route | Hiệu quả | Hiệu suất | Hài lòng |
| --- | --- | --- | --- |
| {{RR_ID}} {{RR_NAME}} | {{DONE}}/{{TRIED}} | {{MEDIAN_STEPS}} / {{MIN_STEPS}} | {{SATISFACTION}} |

## Phát hiện

Xếp theo mức nghiêm trọng giảm dần.

### {{FINDING_ID}} · {{SEVERITY}} · {{LENSES}}

**Ở đâu:** {{RED_ROUTE}} — {{LOCATION}}

**Chuyện gì xảy ra:** {{WHAT_HAPPENED}}

**Dẫn chứng:** {{PERSONA}} bước {{STEP}} — "{{VERBATIM_QUOTE}}"
{{SCREENSHOT_REF}}

**Bao nhiêu người vấp:** {{HIT_COUNT}}/{{TRIED}} persona

**Hướng xử lý:** {{DIRECTION}}

## Không phát hiện được gì ở

{{CLEAN_ROUTES}}

## Ghi chú về chính lần chạy này

{{RUN_CAVEATS}}
