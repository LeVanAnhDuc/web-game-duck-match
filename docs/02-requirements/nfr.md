# Yêu cầu phi chức năng

> **Trả lời:** Ngưỡng nào áp cho **mọi** feature, để không phải nhắc lại từng lần?
> **Trạng thái:** 🟢 đủ — đã rà theo dự án 04.09.2026
> **Cập nhật:** 2026-09-04 · commit feat/core-engine-and-goals
> **Cập nhật khi:** thêm loại tài nguyên mới · thêm nhóm người dùng · sau sự cố sinh ra ngưỡng mới

<!-- CÁCH ĐIỀN
Mỗi dòng phải ĐO ĐƯỢC. Không viết được cách kiểm thì chưa phải yêu cầu.

ID không tái dùng. Ngưỡng mặc định của bộ scaffold mà dự án này không dùng được
GIỮ NGUYÊN DÒNG và đánh (bỏ) kèm lý do — không xoá, để commit/test cũ và người đọc
sau vẫn tra được vì sao nó biến mất.

Dự án này là game chạy hoàn toàn ở client: không server, không datastore trung tâm,
không tài khoản, không PII, không tiền. Đó là lý do phần lớn khối SEC và DATA bị bỏ.
-->

## Performance

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-PERF-01 | ~~Mọi endpoint trả danh sách đều phân trang~~ **(bỏ)** — không có endpoint nào | — |
| NFR-PERF-02 | ~~p95 < 300ms cho endpoint đọc~~ **(bỏ)** — không có server | — |
| NFR-PERF-03 | ~~Không có truy vấn N+1~~ **(bỏ)** — không có datastore | — |
| NFR-PERF-04 | ~~Mọi cột filter/sort có index~~ **(bỏ)** — không có bảng | — |
| NFR-PERF-05 | `applySwap` cho bàn 9×9 chạy < 16ms ở p95, kể cả khi có cascade và kích hoạt chuỗi | benchmark trong Vitest, 1000 nước đi từ seed cố định |
| NFR-PERF-06 | Animation giữ 60fps trên bàn 9×9: không có frame > 32ms trong một cascade | Chrome DevTools Performance, ghi một cascade dài trên màn 6 |
| NFR-PERF-07 | Bundle JS đầu vào của trang chơi < 200KB gzip | `yarn check:bundle` trong CI, đọc từ HTML đã export nên vỡ khi code phình chứ không vỡ khi Next đổi định dạng log. Đo 04.09.2026: bản đồ 106KB, bàn chơi 114KB |

## Security

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-SEC-01 | ~~Mọi mutation kiểm quyền ở server~~ **(bỏ)** — không có server, không có dữ liệu của người khác để bảo vệ | — |
| NFR-SEC-02 | ~~Không log PII/token/mật khẩu~~ **(bỏ)** — dự án không thu thập dữ liệu cá nhân nào | — |
| NFR-SEC-03 | ~~Rate limit endpoint đăng nhập~~ **(bỏ)** — không có đăng nhập | — |
| NFR-SEC-04 | Không có secret nào trong repo. `.env.example` chỉ ghi **tên** biến và cách lấy giá trị, không bao giờ ghi giá trị; chạy dự án không cần biến nào, hai biến đang có là do CI đặt | grep + review |
| NFR-SEC-05 | Dependency không có lỗ hổng mức high trở lên | `yarn check:audit` (CI gọi trong `ci.yml`). Gác đúng mức high/critical, không gác vào exit code của `yarn audit` — nó là bitmask cho **mọi** severity. Gate **fail-closed**: thiếu dòng `auditSummary` nghĩa là audit không chạy, và đó là lỗi, không phải "sạch". Đo 07.09.2026: 576 dependency, 0 advisory |
| NFR-SEC-06 | ~~Lỗi trả client không chứa stack trace~~ **(bỏ)** — không có lỗi từ server; lỗi client do NFR-REL-03 lo | — |

## Accessibility

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-A11Y-01 | Tương phản chữ thường >= 4.5:1, chữ lớn >= 3:1 | devtools |
| NFR-A11Y-02 | Chơi được trọn một màn **chỉ bằng bàn phím**, và focus luôn thấy được | test Testing Library + thử tay |
| NFR-A11Y-03 | Ô bấm được >= 44×44px trên cảm ứng. Ngoại lệ duy nhất: bàn 9×9 dưới 400px — xem `backlog.md` §Nợ kỹ thuật | đo trên ảnh chụp 375 |
| NFR-A11Y-04 | Mọi thay đổi trạng thái quan trọng (điểm, lượt còn lại, thắng/thua) được thông báo qua `aria-live` | review + test |
| NFR-A11Y-05 | Tôn trọng `prefers-reduced-motion`: mọi thời lượng animation về 0, trạng thái nhảy thẳng đến kết quả | test `game/timeline` + thử tay |
| NFR-A11Y-06 | Sáu màu viên **không phân biệt chỉ bằng màu** — mỗi màu có một hình khối riêng | review UI |

## i18n

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-I18N-01 | Không hardcode chuỗi hiển thị trong component. Mọi chuỗi nằm ở `src/i18n/` | grep |
| NFR-I18N-02 | ~~Thời gian lưu ở UTC~~ **(bỏ)** — dự án không lưu và không hiển thị mốc thời gian nào | — |
| NFR-I18N-03 | Số điểm định dạng theo `Intl.NumberFormat` locale `vi-VN`, không tự nối chuỗi | review |

## Reliability

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-REL-01 | ~~Mọi lệnh gọi ra ngoài có timeout~~ **(bỏ)** — không có lệnh gọi mạng nào | — |
| NFR-REL-02 | ~~Tác vụ ghi quan trọng là idempotent~~ **(bỏ)** — ghi duy nhất là `Progress.save()`, ghi lại cùng dữ liệu là vô hại | — |
| NFR-REL-03 | Dữ liệu lưu bị hỏng, thiếu, hay sai version thì app **vẫn mở được** và quay về trạng thái người chơi mới. Không màn hình trắng, không màn hình lỗi | test `storage/local` với JSON rác |
| NFR-REL-04 | Engine không bao giờ treo: kích hoạt chuỗi và cascade đều có chặn trên và có test cho trường hợp xấu nhất | test bàn dày quân đặc biệt |

## Data & Privacy

| ID | Ngưỡng | Cách kiểm |
| --- | --- | --- |
| NFR-DATA-01 | ~~Trường nào là PII được liệt kê rõ~~ **(bỏ)** — dự án không thu thập PII nào | — |
| NFR-DATA-02 | ~~Xoá tài khoản thì xoá PII~~ **(bỏ)** — không có tài khoản | — |
| NFR-DATA-03 | ~~Có đường khôi phục dữ liệu~~ **(bỏ)** — dữ liệu duy nhất là tiến độ chơi trên máy người dùng, chấp nhận mất | — |
| NFR-DATA-04 | Dữ liệu lưu có `version` và một key duy nhất `match3.progress.v1`. Đổi cấu trúc thì tăng version và viết đường đọc dữ liệu cũ | review + test |

**Trường PII trong dự án này:** không có. Dự án không thu thập, không truyền và không
lưu bất kỳ dữ liệu định danh nào — đó là hệ quả của Non-Goal "không có tài khoản".
