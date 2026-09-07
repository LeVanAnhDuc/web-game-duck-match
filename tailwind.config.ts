import type { Config } from 'tailwindcss'
import { ACCENT, PIECE_COLORS, SURFACE } from './src/ui/tokens'

/**
 * Tokens are imported, not retyped: `src/ui/tokens.ts` is the copy tests can read,
 * and `docs/design-system/match-3/MASTER.md` is the document both answer to
 * (ADR-0008). A hex written twice is a hex that will disagree with itself.
 *
 * Spacing, shadow depths and the a11y rules come from MASTER.md's step-1 half and
 * are not overridable; the palette and type pairing are step-2 decisions.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        piece: PIECE_COLORS,
        surface: {
          base: SURFACE.base,
          board: SURFACE.board,
          well: SURFACE.well,
          card: SURFACE.card,
          raised: SURFACE.raised,
        },
        ink: {
          strong: SURFACE.inkStrong,
          muted: SURFACE.inkMuted,
        },
        accent: ACCENT,
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Claymorphism: 16-24px, per MASTER.md's style guidelines.
        clay: '20px',
        slab: '24px',
      },
      boxShadow: {
        well: 'var(--clay-well)',
        clay: 'var(--clay-piece)',
        'clay-lift': 'var(--clay-lift)',
      },
      transitionTimingFunction: {
        // Overshoot for a piece settling; the soft press MASTER.md asks for.
        pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        press: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
