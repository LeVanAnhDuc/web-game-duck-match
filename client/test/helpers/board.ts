import type { Cell, Color, Grid, Piece, Special } from '@/engine/types'

/**
 * TEST ONLY. Never imported from src/.
 *
 * Cascade rules are unreadable as nested arrays, so board fixtures are written as
 * strings: `parseBoard('RRB / GBR / YYY')` (design.md §7).
 *
 *   R B G Y P O   the six colours
 *   .             an empty cell
 *   suffix >      stripedH      R>
 *   suffix ^      stripedV      R^
 *   suffix *      wrapped       R*
 *   suffix #      colorBomb     R#
 */

const COLOR_BY_LETTER: Record<string, Color> = {
  R: 'red',
  B: 'blue',
  G: 'green',
  Y: 'yellow',
  P: 'purple',
  O: 'orange',
}

const LETTER_BY_COLOR: Record<Color, string> = {
  red: 'R',
  blue: 'B',
  green: 'G',
  yellow: 'Y',
  purple: 'P',
  orange: 'O',
}

const SPECIAL_BY_SUFFIX: Record<string, Special> = {
  '>': 'stripedH',
  '^': 'stripedV',
  '*': 'wrapped',
  '#': 'colorBomb',
}

const SUFFIX_BY_SPECIAL: Record<Special, string> = {
  none: '',
  stripedH: '>',
  stripedV: '^',
  wrapped: '*',
  colorBomb: '#',
}

/** Ids start at 1 and increase row-major, so a fixture's ids are predictable. */
export function parseBoard(text: string): Grid {
  let nextId = 1
  return text.split('/').map((rowText) => {
    const chars = [...rowText.trim()]
    const row: Cell[] = []
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i] as string
      if (ch === ' ') continue
      if (ch === '.') {
        row.push(null)
        continue
      }
      const color = COLOR_BY_LETTER[ch]
      if (!color) throw new Error(`parseBoard: unknown character '${ch}' in '${rowText}'`)
      const suffix = chars[i + 1]
      const special = suffix ? SPECIAL_BY_SUFFIX[suffix] : undefined
      if (special) i++
      const piece: Piece = { id: nextId++, color, special: special ?? 'none' }
      row.push(piece)
    }
    return row
  })
}

/** Inverse of parseBoard, for readable assertions and failure messages. */
export function formatBoard(grid: Grid): string {
  return grid
    .map((row) =>
      row
        .map((cell) =>
          cell ? LETTER_BY_COLOR[cell.color] + SUFFIX_BY_SPECIAL[cell.special] : '.',
        )
        .join(''),
    )
    .join(' / ')
}

/** Just the colours, for comparing multisets after a reshuffle. */
export function colorLetters(grid: Grid): string[] {
  return grid
    .flat()
    .filter((cell): cell is Piece => cell !== null)
    .map((piece) => LETTER_BY_COLOR[piece.color])
    .sort()
}
