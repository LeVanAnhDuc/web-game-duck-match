'use client'

import { t } from '@/i18n/vi'

/**
 * The block that tells a stranger what they just opened (FR-20, F-05).
 *
 * Seven persona sessions opened this screen cold. Six correctly guessed "puzzle
 * game" from the grid of level cards, so the category was never the gap — but not
 * one of them would have trusted the page with an email address, and five gave the
 * same reason in their own words: nothing on it says whose it is. Four reached for
 * the word "trống" in their first three words.
 *
 * It is emphatically **not** a hero. `MASTER.md` deletes the hero/CTA/testimonial
 * page pattern outright and records that this product has two screens; a landing
 * page in front of the map would put a wall between the link and level 1, which is
 * the one path the whole product depends on (RR-01).
 */

/**
 * The mark. Drawn rather than typed: `MASTER.md` §Anti-Patterns forbids emoji as
 * icons, and the tab's own emoji would not survive a favicon anyway.
 *
 * One continuous clay-coloured silhouette in the accent amber the stars already
 * use, so it introduces no colour the palette had not already measured.
 */
function DuckMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className="h-11 w-11 shrink-0"
    >
      {/* Body: a wide ellipse sitting low, so the head reads as sitting ON it
          rather than as a second blob beside it. At 44px the silhouette has to
          survive without any internal detail. */}
      <ellipse cx="30" cy="42" rx="20" ry="13" className="fill-accent-amber" />
      {/* Tail, squared off against the round body so the direction is readable. */}
      <path d="M10 38l-8-7 8-4z" className="fill-accent-amber" />
      {/* Neck, wide enough not to snap at small sizes. */}
      <path d="M34 24h11v16H34z" className="fill-accent-amber" />
      <circle cx="42" cy="22" r="11" className="fill-accent-amber" />
      {/* Bill: the one feature that makes this a duck and not a chick. */}
      <path d="M52 20h11a1 1 0 010 2l-4 2 4 2a1 1 0 01 0 2H52z" className="fill-piece-orange" />
      {/* Eye punched in the page colour, large enough to survive a 16px favicon. */}
      <circle cx="45" cy="19" r="2.6" className="fill-surface-base" />
      {/* Wing, as a single stroke of the page colour — depth without a second hue. */}
      <path
        d="M22 42c4-6 12-6 16-1"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-surface-base/40"
      />
    </svg>
  )
}

export function ProductHeader() {
  return (
    <header
      data-testid="product-header"
      className="mx-auto flex w-full max-w-3xl items-start gap-3 px-4 pt-4"
    >
      <DuckMark />
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight text-ink-strong">
          {t.productName}
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">{t.productTagline}</p>
        {/* Two personas assumed a paywall or an energy timer before touching
            anything. Cheaper to answer here than to be assumed about. */}
        <p className="mt-0.5 text-xs text-ink-muted">{t.productReassurance}</p>
      </div>
    </header>
  )
}
