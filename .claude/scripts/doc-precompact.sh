#!/usr/bin/env bash
# doc-precompact.sh — hook PreCompact. Chạy TRƯỚC khi context bị nén.
#
# PreCompact không chặn được việc nén, và nó không đọc được "model đang làm gì" —
# nó là một script thường, không phải AI. Vì vậy vai trò của nó hẹp và cụ thể:
# ghi lại phần trạng thái ĐO ĐƯỢC xuống đĩa, để bản brief chạy ngay sau khi nén
# (docs-brief.sh với source=compact) đọc lại và nói ra.
#
# Phần "đang làm gì" thì không hook nào lấy hộ được — nó phải nằm trong
# docs/04-state/backlog.md §Đang làm, do model tự ghi. Nhắc bên dưới là để đó.
set -uo pipefail

input=$(cat)
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root" 2>/dev/null || exit 0

json_str() { printf '%s' "$input" | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed -E 's/.*"([^"]*)"$/\1/'; }
sid=$(json_str session_id); [ -z "${sid:-}" ] && sid="default"
trigger=$(json_str trigger)

state=".claude/.doc-state"
mkdir -p "$state" 2>/dev/null || true

{
  printf 'nén lúc %s (trigger=%s)' "$(date '+%Y-%m-%d %H:%M')" "${trigger:-?}"
  if git rev-parse --git-dir >/dev/null 2>&1; then
    printf ' · %s file đang thay đổi · HEAD=%s' \
      "$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')" \
      "$(git rev-parse --short HEAD 2>/dev/null || echo '?')"
  fi
  printf '\n'
} > "$state/$sid.precompact" 2>/dev/null || true

echo '🧭 [docs] Context sắp bị nén. Nếu đang làm dở việc gì, ghi nó vào docs/04-state/backlog.md §Đang làm NGAY — sau khi nén thì thông tin đó không còn trong ngữ cảnh nữa.'
exit 0
