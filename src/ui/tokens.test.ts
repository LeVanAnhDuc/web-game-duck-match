import { describe, expect, it } from 'vitest'
import { ACCENT, PIECE_COLORS, SURFACE } from './tokens'

/**
 * The palette was re-picked by measurement (ADR-0008), so the measurement is a test.
 * Without this, the numbers in MASTER.md are a claim nobody re-checks.
 */
const channel = (hex: string, index: number) => {
  const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const luminance = (hex: string) =>
  0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2)

const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** CIE76 in Lab — enough to say "these two are not confusable". */
const lab = (hex: string): [number, number, number] => {
  const [r, g, b] = [channel(hex, 0), channel(hex, 1), channel(hex, 2)]
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [f(x), f(y), f(z)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

const deltaE = (a: string, b: string) => {
  const [la, lb] = [lab(a), lab(b)]
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2])
}

describe('piece colours', () => {
  it.each(Object.entries(PIECE_COLORS))(
    '%s clears the 3:1 floor for graphical objects against the board',
    (_name, hex) => {
      expect(contrast(hex, SURFACE.board)).toBeGreaterThanOrEqual(3)
    },
  )

  it.each(Object.entries(PIECE_COLORS))(
    '%s is also readable inside a well',
    (_n, hex) => {
      expect(contrast(hex, SURFACE.well)).toBeGreaterThanOrEqual(3)
    },
  )

  it('keeps every pair far enough apart to be told apart', () => {
    const names = Object.keys(PIECE_COLORS) as (keyof typeof PIECE_COLORS)[]
    const pairs: [string, number][] = []
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i] as keyof typeof PIECE_COLORS
        const b = names[j] as keyof typeof PIECE_COLORS
        pairs.push([`${a}/${b}`, deltaE(PIECE_COLORS[a], PIECE_COLORS[b])])
      }
    }
    const worst = pairs.reduce((low, pair) => (pair[1] < low[1] ? pair : low))
    // The set this replaced had red/orange at 23, which players could not separate.
    expect(worst[1]).toBeGreaterThanOrEqual(45)
  })

  it('has six distinct values', () => {
    expect(new Set(Object.values(PIECE_COLORS)).size).toBe(6)
  })
})

describe('surfaces', () => {
  it('keeps both text roles above 4.5:1 on the board and on a card', () => {
    for (const surface of [SURFACE.board, SURFACE.card]) {
      expect(contrast(SURFACE.inkStrong, surface)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(SURFACE.inkMuted, surface)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('deliberately does NOT separate the well from the board by colour', () => {
    // The hollow is an inset shadow. If someone "fixes" this to a colour step, the
    // clay reading breaks — so the intent is asserted rather than left as a comment.
    expect(contrast(SURFACE.board, SURFACE.well)).toBeLessThan(1.3)
  })
})

describe('accents', () => {
  it('never places a UI accent next to a piece colour', () => {
    for (const accent of Object.values(ACCENT)) {
      for (const piece of Object.values(PIECE_COLORS)) {
        expect(deltaE(accent, piece)).toBeGreaterThan(20)
      }
    }
  })
})
