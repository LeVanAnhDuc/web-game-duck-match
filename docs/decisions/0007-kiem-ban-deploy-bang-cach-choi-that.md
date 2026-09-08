# ADR-0007 · Kiểm bản deploy bằng cách chơi thử nó, không tin mã trạng thái HTTP

> **Ngày:** 2026-09-07
> **Trạng thái:** accepted
> **Liên quan:** ADR-0006 · NFR-REL-03 · US-01

## 1. Bối cảnh

`deploy.yml` (ADR-0006) chạy xanh, `actions/deploy-pages` báo thành công, và
`gh api .../pages` trả về đúng URL. Kiểm bằng lệnh hiển nhiên nhất:

```bash
curl -s -o /dev/null -w '%{http_code}' https://levananhduc.github.io/web-game-duck-match/
# 200
```

Ba đường dẫn đều 200, kể cả một file asset. Nhưng mở bằng trình duyệt thật thì
`document.title` là **"Site not found · GitHub Pages"** — thân trang là trang 404 của
GitHub, còn mã trạng thái trên đường đó vẫn là 200. Nếu chỉ có mã trạng thái làm bằng
chứng thì một lần deploy phục vụ trang 404 sẽ được tính là thành công.

Nguyên nhân thật lúc đó chỉ là Pages chưa propagate xong. Nhưng cái đáng sửa không
phải là chờ lâu hơn — mà là **phương pháp kiểm**.

## 2. Quyết định

Thêm job `verify` vào `deploy.yml`, chạy **sau** `deploy`, mở URL mà Pages vừa
publish (`needs.deploy.outputs.page_url`) và:

1. chờ đến khi `document.title === 'Match 3'` — tín hiệu của chính app, không phải
   một `sleep` cố định, vì "propagate mất bao lâu" không ai cam kết được;
2. kiểm bản đồ màn hiện đúng 1 link mở và 5 thẻ khoá;
3. **đi một nước hợp lệ bằng bàn phím** và kiểm số lượt giảm, điểm khác 0;
4. kiểm không có `pageerror` nào.

Nước đi hợp lệ được **tính bằng chính engine** trong tiến trình test (cùng commit ⇒
cùng seed ⇒ cùng bàn), chứ không dò ngẫu nhiên các ô kề nhau.

Chạy được cả ở máy: `yarn verify:live`.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Tin mã trạng thái HTTP | Chính là thứ đã nói dối: 200 cho trang "Site not found" |
| `curl` rồi `grep` một chuỗi trong HTML | Bản đồ màn render ở client — HTML tĩnh không chứa thẻ màn nào, nên phải là trình duyệt thật |
| `sleep 60` rồi kiểm | Chọn một con số không ai bảo vệ được: quá ngắn thì đỏ oan, quá dài thì mỗi lần deploy chậm thêm |
| Chỉ kiểm trang bản đồ tải được | Bản đồ tải được mà bàn chơi vỡ vẫn là deploy hỏng. US-01 là "chơi được", nên phép kiểm phải là chơi |
| Lighthouse / smoke test bằng ảnh | Đắt và giòn; không trả lời được câu hỏi duy nhất đang hỏi — bản live có nhận input và tính điểm không |
| Dò ngẫu nhiên các ô để tìm nước đi | Đã thử: 25 lần "Enter → ArrowRight → Enter" từ ô (0,0) không trúng nước hợp lệ nào, và test đỏ vì **may mắn**, không vì app sai |

## 4. Hệ quả

**Được:**
- Một lần deploy phục vụ sai nội dung sẽ đỏ, thay vì nằm im với badge xanh.
- Phép kiểm cuối cùng của pipeline chính là US-01: mở link, vào màn, đi một nước.
- Bắt được cả lỗi chỉ xuất hiện ở production: `basePath` sai, asset 404, hydrate lỗi.

**Mất / phải chấp nhận:**
- Deploy dài thêm ~1 phút (cài Chromium) và cần mạng ra ngoài GitHub.
- Job phụ thuộc vào seed và dữ liệu level của **đúng commit đang deploy**. Đổi seed
  trong `PlayScreen` mà quên sửa `e2e-live/` là job đỏ — chấp nhận, vì cái đỏ đó
  đúng: nó nói rằng hai chỗ đã lệch nhau.
- Không có gì chặn được `verify` đỏ sau khi site đã publish; nó phát hiện, không
  phòng ngừa. Muốn phòng ngừa thì phải deploy vào môi trường tạm trước, mà Pages
  không có khái niệm đó ở mức miễn phí.

**Điều kiện xem lại quyết định này:** nếu `verify` bắt đầu đỏ vì propagate chậm hơn
180 giây một cách thường xuyên, thì tách nó ra thành workflow riêng chạy theo lịch
thay vì gắn vào deploy.
