#!/usr/bin/env bash
# docs-route.sh — hook UserPromptSubmit. Định tuyến theo Ý ĐỊNH của prompt.
#
# Với hook UserPromptSubmit, stdout khi exit 0 được bơm vào ngữ cảnh cùng prompt
# của người dùng. Ta dùng nó để nhắc ĐÚNG tài liệu cho ĐÚNG loại việc — thay vì
# nhắc tất cả mọi thứ ở mọi lượt.
#
# NGUYÊN TẮC: chỉ bắt cụm tín hiệu MẠNH, và IM LẶNG TUYỆT ĐỐI ở mọi prompt khác.
# Một hook nhắc quá nhiều là một hook bị bỏ qua. Tối đa 2 gợi ý mỗi lượt.
#
# Không cần jq: grep thẳng stdin. Khoá JSON không khớp các cụm bên dưới.
set -uo pipefail

input=$(cat)
lc=$(printf '%s' "$input" | tr '[:upper:]' '[:lower:]')

p_feature='thêm chức năng|thêm tính năng|tính năng mới|chức năng mới|làm tính năng|làm chức năng|feature mới|new feature|add feature|xây tính năng'
p_code='refactor|sửa code|sửa lại|sửa lỗi|fix bug|fix lỗi|đổi logic|tối ưu lại|viết lại hàm|dọn code'
p_tech='dùng thư viện|dùng package|cài thêm|thêm package|thêm dependency|chuyển sang|thay bằng|đổi sang dùng|nên dùng gì|chọn thư viện'
p_data='thêm bảng|đổi schema|thêm cột|đổi model|migration|prisma migrate'

hits=0
emit() { [ "$hits" -ge 2 ] && return 0; hits=$((hits+1)); printf '%s\n' "$1"; }

if printf '%s' "$lc" | grep -Eq "$p_feature"; then
  emit '🧭 [docs] Việc này trông như một CHỨC NĂNG MỚI. Trước khi thiết kế: đọc docs/01-product/overview.md §Non-Goals (nếu xung đột thì đây là chuyện phạm vi, không phải chuyện thiết kế), docs/02-requirements/scope.md (cấp FR-xx mới) và docs/02-requirements/nfr.md (ngưỡng áp cho mọi feature).'
fi
if printf '%s' "$lc" | grep -Eq "$p_data"; then
  emit '🧭 [docs] Việc này chạm MÔ HÌNH DỮ LIỆU. Đọc docs/03-design/invariants.md trước — quy ước khoá, soft-delete, timezone, và luật "migration chỉ tiến" nằm ở đó. Đổi ranh giới bảng thì cần một ADR.'
fi
if printf '%s' "$lc" | grep -Eq "$p_tech"; then
  emit '🧭 [docs] Việc này là một QUYẾT ĐỊNH KỸ THUẬT. Kiểm docs/decisions/ xem đã có ADR nào quyết chuyện này chưa. Nếu chốt phương án mới, viết ADR NGAY trong phiên này — đừng để cuối phiên, context có thể bị nén trước đó.'
fi
if printf '%s' "$lc" | grep -Eq "$p_code"; then
  emit '🧭 [docs] Trước khi sửa code: đọc docs/03-design/invariants.md. Đó là những điều kiện mà vi phạm thì hệ thống sai ÂM THẦM — code vẫn chạy, test vẫn xanh.'
fi

[ "$hits" -gt 0 ] && echo '(Nhắc tự động từ hook. Nếu prompt không thuộc loại này, BỎ QUA hoàn toàn và đừng nhắc lại với người dùng.)'
exit 0
