# DUCKERID — Đăng nhập Ducker ID tuỳ chọn (sau cờ tính năng)

Truy vết phía app: FR-23 · US-05 · ADR-0012 · NFR-REL-01 · NFR-DATA-04 · NFR-A11Y-03.

- **REQ-DUCKERID-01** Cờ tắt (bản deploy): không nút "Đăng nhập", không menu tài khoản, không đọc URL (`?code=` để nguyên), không chạm `sessionStorage`, không request nào ra ngoài site; câu trấn an ở header là bản "không đăng nhập".
- **REQ-DUCKERID-02** Cờ bật: header có nút "Đăng nhập" và câu trấn an bản "đăng nhập tuỳ chọn"; chưa bấm thì không request nào tới Ducker ID.
- **REQ-DUCKERID-03** Bấm "Đăng nhập" đi qua Ducker ID rồi quay về đúng bản đồ: URL sạch (không `code` / `state`), tham số khác của trang còn nguyên, nút tài khoản hiện; không lỗi hydration.
- **REQ-DUCKERID-04** Menu tài khoản hiện tên, email, liên kết "Mở hồ sơ Ducker ID" tới trang hồ sơ trên issuer, và "Đăng xuất"; Esc đóng menu và trả focus về nút tài khoản.
- **REQ-DUCKERID-05** "Đăng xuất" đưa nút "Đăng nhập" trở lại và đặt focus vào nó.
- **REQ-DUCKERID-06** Đăng nhập không đổi gì về cách chơi: đã đăng nhập vẫn vào màn và đi nước như thường.
- **REQ-DUCKERID-07** Hồ sơ chỉ nằm trong bộ nhớ: không ghi xuống `localStorage` / `sessionStorage`, khoá `ducker.pkce` bị xoá khi quay về, tải lại trang là chưa đăng nhập.
- **REQ-DUCKERID-08** Từ chối ở Ducker ID, hoặc `state` bị sửa, thì về chưa đăng nhập, URL sạch, không báo lỗi; `state` sai thì không bao giờ gọi token endpoint.
- **REQ-DUCKERID-09** Issuer không trả lời thì sau tối đa 15 giây về lại chưa đăng nhập (NFR-REL-01).
- **REQ-DUCKERID-10** `sessionStorage` bị chặn thì bấm "Đăng nhập" không đưa đi đâu cả, nút vẫn dùng được.
- **REQ-DUCKERID-11** Nút đăng nhập rộng và cao ≥ 44px, không đè chữ của header ở 375px; menu tài khoản luôn nằm trọn trong màn hình ở 320 và 375px và mở ra không làm header nhảy.
