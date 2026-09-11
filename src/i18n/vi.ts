import type { Color, Special } from '@/engine/types'

/**
 * Every string the player can see, in Vietnamese (NFR-I18N-01). Screens import
 * `t` and nothing else, so a wording change is one edit here instead of a grep
 * across `ui/`.
 *
 * Wording is not free-form: it is the "Tên trên UI (VI)" column of
 * docs/01-product/glossary.md — viên, ô, bàn, match, chuỗi, lượt, mục tiêu, màn,
 * sao, tiến độ, xáo bàn. Synonyms are what make two screens describe the same
 * thing differently, so they are forbidden even when they read better.
 *
 * Anything with a number in it is exported as a **function**, not a string with a
 * placeholder — that way no screen ever concatenates, and score grouping stays
 * inside `formatScore` (NFR-I18N-03).
 */

/**
 * Names for the special pieces, used in a cell's accessible label. A plain piece
 * has no name of its own — the colour is the whole description — so it maps to an
 * empty string and `cellLabel` falls back to its plain wording.
 */
const SPECIAL_NAME: Record<Special, string> = {
  none: '',
  stripedH: 'viên sọc ngang',
  stripedV: 'viên sọc dọc',
  wrapped: 'viên bom',
  colorBomb: 'bom màu',
}

/** One formatter instance: constructing `Intl.NumberFormat` per render is the slow path. */
const scoreFormat = new Intl.NumberFormat('vi-VN')

export function formatScore(n: number): string {
  return scoreFormat.format(n)
}

export const t = Object.freeze({
  appTitle: 'Duck Match',

  // Level map (`/`)
  levelMapTitle: 'Bản đồ màn',
  levelLabel: (id: number) => `Màn ${id}`,
  locked: 'Chưa mở',
  bestScore: 'Điểm cao nhất',
  noProgressYet: 'Chưa có tiến độ',

  // Play screen HUD (`/play/[id]`)
  movesLeft: 'Lượt',
  score: 'Điểm',
  goals: 'Mục tiêu',
  /** Both sides grouped: score targets reach five digits (màn 5 wants 5 000). */
  goalScore: (current: number, target: number) =>
    `${formatScore(current)}/${formatScore(target)}`,
  /** Deliberately ungrouped: collect counts top out at 20, so grouping would only add noise. */
  goalCollect: (current: number, target: number) => `${current}/${target}`,
  /**
   * The visible noun on a score goal row (FR-21, F-06).
   *
   * Short because the row has to survive a one-line HUD at 720x450, and because
   * the point is only to stop "0/4.000" from being a number with nothing attached
   * to it. The long form stays in `goalScoreLabel` for the accessible name.
   */
  goalScoreShort: 'Điểm',
  /** Text equivalent of the icon-plus-numbers goal row, for the accessible name. */
  goalScoreLabel: (current: number, target: number) =>
    `Mục tiêu điểm ${formatScore(current)}/${formatScore(target)}`,
  goalCollectLabel: (colorName: string, current: number, target: number) =>
    `Mục tiêu viên ${colorName} ${current}/${target}`,

  // Confirming a destructive action (FR-22)
  confirmRestartTitle: 'Chơi lại từ đầu?',
  /**
   * Names the number being thrown away rather than saying "tiến độ", because a
   * player deciding in half a second needs the size of the loss, not its category.
   */
  confirmRestartLoses: (score: string) =>
    `Điểm ${score} của lượt chơi này sẽ mất và bàn được xếp lại từ đầu.`,
  /**
   * The other half, and the reason this dialog is two sentences instead of one:
   * persona p02 had to leave the level and go read the map herself before she
   * believed a loss cost her nothing (F-10). Say it where the fear happens.
   */
  confirmRestartKeeps: 'Sao và điểm cao nhất bạn đã đạt ở màn này vẫn được giữ nguyên.',
  confirmRestartCancel: 'Thôi, chơi tiếp',
  /**
   * Said after every restart, including the ones that skip the confirm.
   *
   * The gate only asks when there is something to lose, but a restart with nothing
   * to lose still replaces all 49 pieces at once. Silence there is the same silence
   * that made persona p03 read her own keypress as the game breaking (F-07) — the
   * confirm answers "are you sure", this answers "that just happened".
   */
  levelRestarted: 'Đã xếp lại bàn từ đầu',

  // Result dialog + navigation
  replay: 'Chơi lại',
  backToMap: 'Về bản đồ',
  nextLevel: 'Màn tiếp',
  won: 'Thắng màn!',
  lost: 'Hết lượt!',
  starsEarned: (stars: number, max: number) => `Đạt ${stars}/${max} sao`,
  /**
   * The missing half of a three-star system (FR-20, F-04). Every win in the
   * 2026-09-11 persona run scored 1/3 — one at 132% of the level goal — and the
   * players read it as a near miss with no explanation, because the thresholds
   * were in `levels.ts` and on no screen.
   */
  starGap: (points: string) => `Còn ${points} điểm nữa là thêm một sao`,
  /**
   * Said on the loss dialog (F-10). Persona p02 would not press "Chơi lại" until
   * she had left the level and audited the map herself, because nothing on the
   * loss screen told her a loss costs nothing. Every player should not have to
   * run that experiment once.
   */
  lostKeepsProgress: 'Sao và điểm cao nhất của bạn được giữ nguyên.',
  loading: 'Đang tải…',

  /**
   * The product's own name on its own first screen (FR-20, F-05).
   *
   * Seven persona sessions opened the map and none of them would have trusted the
   * page with an email address; five said the same reason in five different
   * wordings — nothing on it says who made it or what it is. Six of seven guessed
   * "puzzle game" correctly from the grid of level cards alone, so the missing
   * message is identity, not category.
   *
   * Deliberately NOT a hero. MASTER.md drops the hero/CTA/testimonial pattern in
   * full and records that this product has two screens; this is a heading block
   * above the list, not a landing page in front of it.
   */
  productName: 'Duck Match',
  productTagline: 'Xếp 3 viên cùng hình để đạt mục tiêu của từng màn',
  /** Answers the fear directly: two personas expected a paywall or an energy timer. */
  productReassurance: '6 màn · chơi ngay trên trình duyệt · không đăng nhập, không mất phí',
  /**
   * What "Chưa mở" never said (F-09). The negative persona clicked a locked card,
   * got nothing at all, and could not tell "not yet earned" from "not yet built".
   */
  unlockHint: (previousLevel: number) => `Thắng màn ${previousLevel} để mở`,

  // Board a11y (NFR-A11Y-02): the grid and each cell need a name of their own.
  boardLabel: 'Bàn',
  /**
   * `row`/`col` arrive 0-based from the engine and are announced 1-based.
   *
   * `specialName` is optional and appended when present: without it a screen
   * reader cannot tell a plain viên from a sọc or a bom, which is the whole point
   * of the piece (NFR-A11Y-04).
   */
  cellLabel: (row: number, col: number, colorName: string, specialName?: string) =>
    specialName
      ? `Ô hàng ${row + 1} cột ${col + 1}, ${specialName} ${colorName}`
      : `Ô hàng ${row + 1} cột ${col + 1}, viên ${colorName}`,
  /** Empty string for a plain piece, so callers can pass the result straight through. */
  specialName: (special: Special): string => SPECIAL_NAME[special],
  selected: 'Đã chọn',
  /** Announced in a live region — a reshuffle changes the whole bàn without any input. */
  reshuffled: 'Đã xáo bàn',
  /**
   * The refused-swap announcement. The slide-and-return lasts about 300ms and then
   * the bàn looks exactly as it did before, so anyone who blinked, looked away, or
   * uses a screen reader is left with no evidence the game even noticed (F-03).
   * It names the reason, because "nothing happened" is the reading that made
   * persona p07 conclude he was pressing wrong and stop.
   */
  moveRejected: 'Nước đi không hợp lệ — hai viên không tạo được hàng ba, lượt chưa bị trừ',
})

export type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'hexagon'

/**
 * One distinct shape per colour, so colour is never the only channel carrying the
 * difference between two viên (NFR-A11Y-06).
 */
export const SHAPE_BY_COLOR: Record<Color, Shape> = {
  red: 'circle',
  blue: 'square',
  green: 'triangle',
  yellow: 'diamond',
  purple: 'star',
  orange: 'hexagon',
}

/** Colour names for accessible labels — the only place a colour becomes words. */
export const COLOR_NAME: Record<Color, string> = {
  red: 'đỏ',
  blue: 'xanh dương',
  green: 'xanh lá',
  yellow: 'vàng',
  purple: 'tím',
  orange: 'cam',
}
