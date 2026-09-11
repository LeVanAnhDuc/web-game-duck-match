#!/usr/bin/env bash
# doc-flush.sh — hook Stop. Script DUY NHẤT trong bộ này có quyền chặn.
#
# Trả {"decision":"block","reason":"..."} thì model KHÔNG dừng được lượt và phải
# làm tiếp theo lý do. Viết sai chỗ này là tự khoá mình vào vòng lặp vô tận, nên
# có ba lớp chống:
#   1. stop_hook_active=true  -> thoát ngay (đang ở trong lượt tiếp tục do một
#      Stop hook trước gây ra).
#   2. sentinel một lần mỗi phiên, GHI TRƯỚC khi in lệnh chặn.
#   3. chỉ chặn khi có lý do CỤ THỂ, đo được. Không chặn theo cảm giác.
#
# Lời nhắc luôn cho HAI đường ra — "cập nhật, HOẶC nói rõ vì sao không cần".
# Nếu chỉ có một đường ra, model sẽ điền tài liệu bằng phỏng đoán để dập lời
# nhắc, và tài liệu phỏng đoán tệ hơn tài liệu trống.
set -uo pipefail

input=$(cat)

# Lớp 1 — không bao giờ chặn hai lần liên tiếp.
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root" 2>/dev/null || exit 0
[ -f docs/README.md ] || exit 0

json_str() { printf '%s' "$input" | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed -E 's/.*"([^"]*)"$/\1/'; }
sid=$(json_str session_id); [ -z "${sid:-}" ] && sid="default"
state=".claude/.doc-state"
mkdir -p "$state" 2>/dev/null || true

# Sinh lại phần máy suy ra được — bảng trạng thái, mục lục ADR. Luôn chạy,
# kể cả khi không chặn: đây là phần không cần ai duyệt.
report=$(bash .claude/scripts/docs-regen.sh 2>/dev/null)

# Lớp 2 — mỗi phiên chỉ chặn một lần.
[ -f "$state/$sid.flushed" ] && exit 0

# Lớp 3 — thu thập lý do cụ thể.
reasons=""
add() { reasons="$reasons$1 "; }

[ -n "$report" ] && add "$report"

if git rev-parse --git-dir >/dev/null 2>&1; then
  changed=$(git status --porcelain -uall 2>/dev/null | sed 's/^...//')
  if [ -n "$changed" ]; then
    if ! printf '%s' "$changed" | grep -q 'docs/04-state/backlog.md'; then
      n=$(printf '%s\n' "$changed" | sed '/^$/d' | wc -l | tr -d ' ')
      add "Phiên này có $n file thay đổi nhưng docs/04-state/backlog.md không nằm trong số đó."
    fi
    if printf '%s' "$changed" | grep -qE '\.(ts|tsx|js|jsx|mjs|py|go|rs|java)$' \
       && ! printf '%s' "$changed" | grep -q '^docs/'; then
      add "Có thay đổi mã nguồn nhưng không có tài liệu nào trong docs/ được sửa."
    fi
  fi
fi

[ -z "$reasons" ] && exit 0

: > "$state/$sid.flushed" 2>/dev/null || true

msg="[docs] Trước khi dừng phiên: $reasons-- Hãy CẬP NHẬT phần liên quan (thường là docs/04-state/backlog.md §Đang làm: đang làm gì, dừng ở bước nào, gì đang chặn), HOẶC nói rõ trong một câu vì sao lượt này không cần cập nhật tài liệu nào. Không điền file đang 🔴 bằng phỏng đoán, và không ghi con số nào chưa vừa chạy ra."
esc=$(printf '%s' "$msg" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n\t' '  ' | tr -s ' ')
printf '{"decision":"block","reason":"%s"}\n' "$esc"
exit 0
