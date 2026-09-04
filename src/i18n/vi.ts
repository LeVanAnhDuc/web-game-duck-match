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
  appTitle: 'Match 3',

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
  /** Text equivalent of the icon-plus-numbers goal row, for the accessible name. */
  goalScoreLabel: (current: number, target: number) =>
    `Mục tiêu điểm ${formatScore(current)}/${formatScore(target)}`,
  goalCollectLabel: (colorName: string, current: number, target: number) =>
    `Mục tiêu viên ${colorName} ${current}/${target}`,

  // Result dialog + navigation
  replay: 'Chơi lại',
  backToMap: 'Về bản đồ',
  nextLevel: 'Màn tiếp',
  won: 'Thắng màn!',
  lost: 'Hết lượt!',
  starsEarned: (stars: number, max: number) => `Đạt ${stars}/${max} sao`,
  loading: 'Đang tải…',

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
