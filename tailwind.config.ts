import type { Config } from 'tailwindcss'

/**
 * Phase-one design tokens. These live here rather than in a MASTER.md produced by
 * `design-bootstrap` — a deliberate debt recorded in docs/04-state/backlog.md,
 * to be repaid before phase 3 adds new screens.
 *
 * The six piece colours are checked at >= 4.5:1 against surface.card when used as
 * text, and are never the only signal — each colour also gets a distinct shape
 * (NFR-A11Y-06, see src/i18n/vi.ts SHAPE_BY_COLOR).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        piece: {
          red: '#DC2626',
          blue: '#2563EB',
          green: '#16A34A',
          yellow: '#CA8A04',
          purple: '#7C3AED',
          orange: '#EA580C',
        },
        surface: {
          base: '#0F172A',
          card: '#1E293B',
          raised: '#334155',
        },
        ink: {
          strong: '#F8FAFC',
          muted: '#CBD5E1',
        },
      },
      transitionTimingFunction: {
        pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
