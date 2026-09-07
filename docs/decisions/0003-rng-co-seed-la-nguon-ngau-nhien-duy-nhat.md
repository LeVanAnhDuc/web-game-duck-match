# ADR-0003 · PRNG mulberry32 có seed là nguồn ngẫu nhiên duy nhất

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** FR-01 · FR-08 · NFR-PERF-05 · NFR-REL-04

## 1. Bối cảnh

Match-3 dùng ngẫu nhiên ở ba chỗ: sinh bàn ban đầu, refill viên mới từ đỉnh, và xáo
bàn khi bế tắc. Nếu dùng `Math.random()` thì mỗi lần chạy ra một bàn khác: bug
"cascade tính điểm sai ở tình huống này" không dựng lại được, và test hoặc phải chấp
nhận bất định, hoặc phải mock global — cả hai đều tệ.

## 2. Quyết định

Một PRNG mulberry32 tự viết (khoảng 10 dòng), giữ **trạng thái dạng giá trị**
(`RngState = number`) nằm trong `Session`. Mọi hàm cần ngẫu nhiên nhận `rng` và trả
về `rng` mới cùng kết quả — không có biến toàn cục, không có instance mang trạng
thái ẩn. `Math.random()` bị cấm trong toàn bộ `src/engine/`, và lệnh cấm được canh
bằng **một test grep source**, không chỉ bằng lời trong `invariants.md`.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| `Math.random()` | Bàn không tái tạo được. Test phải mock global, và mock global rò rỉ giữa các test file |
| Thư viện (`seedrandom`, `pure-rand`) | Một dependency cho 10 dòng code, trong một dự án mà `yarn audit` là một ngưỡng NFR (NFR-SEC-05). `pure-rand` là lựa chọn tốt nếu sau này cần nhiều phân phối |
| PRNG có seed nhưng giữ instance mang trạng thái (`rng.next()`) | `applySwap` không còn là hàm thuần: gọi hai lần với cùng `Session` cho hai kết quả. Phá bất biến 4 |
| Mersenne Twister | Chất lượng thống kê không cần thiết ở đây; mulberry32 đủ tốt cho việc chọn màu và đủ nhanh cho NFR-PERF-05 |

## 4. Hệ quả

**Được:**
- Một bug dựng lại được từ `(LevelConfig, seed, danh sách nước đi)` — đủ để viết một
  test hồi quy chính xác.
- Test luật chơi hoàn toàn tất định, không mock gì.
- Level validate được: "bàn ban đầu sinh được với ba seed cố định" là một test thật.

**Mất / phải chấp nhận:**
- `rng` phải được luồn qua chữ ký của mọi hàm cần nó và trả về — dài dòng hơn
  `Math.random()`, và dễ quên trả về `rng` mới (một bug im lặng: cùng seed lặp lại
  mãi một màu).
- Chất lượng ngẫu nhiên của mulberry32 không phù hợp cho mật mã. Dự án không dùng nó
  cho việc đó, và không được dùng.

**Điều kiện xem lại quyết định này:** nếu sau này cần phân phối có trọng số phức tạp
cho việc sinh viên (ví dụ tăng xác suất màu đang thiếu), lúc đó cân `pure-rand` thay
vì tự mở rộng.
