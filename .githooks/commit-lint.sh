#!/usr/bin/env bash
# commit-lint.sh - kiem mot subject commit theo Conventional Commits 1.0.0.
#
#   bash .githooks/commit-lint.sh --subject "feat(engine): pathfinding"
#   bash .githooks/commit-lint.sh --file .git/COMMIT_EDITMSG
#   bash .githooks/commit-lint.sh --range v1.2.0..HEAD
#   bash .githooks/commit-lint.sh --types            # in danh sach type dang nhan
#
# Exit 0 neu hop le, 1 neu khong. In loi kem cach sua.
#
# DANH SACH TYPE DOC TU cliff.toml, khong giu ban sao o day. Them mot type vao
# cliff.toml la du: hook nhan no VA release note co ro cho no, cung mot lan sua.
# Do la toan bo ly do hai skill nay khop nhau duoc.
set -uo pipefail

# Bo type dung khi chua co cliff.toml (repo vua scaffold, chua cai release-note).
# Day la bo cua conventional-changelog cong `a11y` - type rieng cua web-game/.
FALLBACK_TYPES="feat fix perf a11y refactor style docs test build ci chore revert"

MAX_SUBJECT=72

repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

allowed_types() {
  local cfg="$(repo_root)/cliff.toml"
  if [ -f "$cfg" ]; then
    # Rut `^feat` -> `feat` tu commit_parsers. Bo parser bat-tat-ca `.*` va cac
    # parser skip merge commit.
    local types
    types=$(sed -nE 's/^[[:space:]]*\{[[:space:]]*message[[:space:]]*=[[:space:]]*"\^([a-z0-9]+)".*/\1/p' "$cfg" |
      sort -u | tr '\n' ' ')
    if [ -n "${types// /}" ]; then
      printf '%s' "$types"
      return 0
    fi
  fi
  printf '%s' "$FALLBACK_TYPES"
}

# Nhung subject KHONG phai commit cua nguoi viet, hoac git tu sinh -> cho qua.
is_exempt() {
  case "$1" in
    Merge\ *|Revert\ *|fixup!\ *|squash!\ *|amend!\ *) return 0 ;;
    "Initial commit") return 0 ;;
  esac
  return 1
}

fail() {
  printf '  ✗ %s\n' "$1" >&2
}

# validate_subject <subject> -> 0/1
validate_subject() {
  local subject="$1"
  local types pattern ok=0

  is_exempt "$subject" && return 0

  types=$(allowed_types)
  pattern="^($(printf '%s' "$types" | tr -s ' ' '|' | sed 's/|$//'))(\([^)]+\))?!?: .+"

  if ! printf '%s' "$subject" | grep -qE "$pattern"; then
    fail "sai dinh dang: $subject"
    printf '     can: <type>[(<scope>)][!]: <mo ta>\n' >&2
    printf '     type nhan duoc: %s\n' "$types" >&2
    printf '     vi du : feat(engine): pathfinding\n' >&2
    printf '             fix(ui)!: drop the legacy prop\n' >&2
    ok=1
  fi

  if [ "${#subject}" -gt "$MAX_SUBJECT" ]; then
    fail "subject dai ${#subject} ky tu, toi da $MAX_SUBJECT: $subject"
    ok=1
  fi

  case "$subject" in
    *.) fail "subject khong ket thuc bang dau cham: $subject"; ok=1 ;;
  esac

  return $ok
}

# Marker chi co tac dung o SUBJECT. Nam trong body la vo hieu - canh bao, khong chan.
warn_markers_in_body() {
  local file="$1" subject body
  subject=$(head -1 "$file")
  body=$(tail -n +2 "$file" | grep -v '^#' || true)
  local m
  for m in '[skip release]' '[release minor]' '[release major]'; do
    case "$body" in
      *"$m"*)
        case "$subject" in
          *"$m"*) ;;
          *) printf '  ! "%s" nam trong body nen KHONG co tac dung. Dua len subject neu that su muon.\n' "$m" >&2 ;;
        esac
        ;;
    esac
  done
}

main() {
  case "${1:-}" in
    --types)
      allowed_types; echo
      ;;
    --subject)
      validate_subject "${2:?can mot subject}"
      ;;
    --file)
      local f="${2:?can duong dan file}"
      local subject
      subject=$(head -1 "$f")
      warn_markers_in_body "$f"
      validate_subject "$subject"
      ;;
    --range)
      local range="${2:?can mot range, vi du v1.2.0..HEAD}"
      local bad=0 n=0 s
      while IFS= read -r s; do
        [ -z "$s" ] && continue
        n=$((n + 1))
        validate_subject "$s" || bad=1
      done < <(git log --no-merges --pretty=%s "$range")
      if [ "$bad" -eq 0 ]; then
        printf '✓ %d commit trong %s deu dat Conventional Commits\n' "$n" "$range"
      fi
      return $bad
      ;;
    *)
      printf 'dung: %s --subject <s> | --file <path> | --range <a..b> | --types\n' "$0" >&2
      return 2
      ;;
  esac
}

main "$@"
