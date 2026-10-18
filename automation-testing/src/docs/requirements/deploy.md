# DEPLOY — Bản xuất tĩnh và bản trên GitHub Pages

Truy vết phía app: ADR-0004 (static export) · ADR-0006 (GitHub Pages, basePath) · ADR-0007 (kiểm bản deploy bằng cách chơi thật).

- **REQ-DEPLOY-01** Địa chỉ của site trả về chính game — tiêu đề trang "Duck Match", bản đồ có màn 1 mở và 5 màn khoá — chứ không phải trang 404 của GitHub (trang đó cũng trả 200). Ngay sau deploy, chờ tối đa 3 phút cho Pages cập nhật.
- **REQ-DEPLOY-02** Bản đã deploy chơi được: vào màn 1 từ bản đồ, một nước hợp lệ trừ một lượt và cộng điểm, không có lỗi JavaScript trên trang.
- **REQ-DEPLOY-03** Bản xuất tĩnh có đủ trang của sáu màn: mở thẳng `play/1/` … `play/6/` (tải lại trang, không qua bản đồ) đều ra đúng màn; màn không tồn tại (`play/7/`) không có trang (404).
- **REQ-DEPLOY-04** Mọi tài nguyên của trang (script, style, font, ảnh) tải được dưới đúng đường dẫn gốc của site: mở bản đồ và màn 1 không có response lỗi (≥ 400) nào từ chính site.
