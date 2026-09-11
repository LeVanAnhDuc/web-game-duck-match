'use client'

import Link from 'next/link'
import { pointsToNextStar } from '@/engine'
import type { LevelConfig, Progress } from '@/engine'
import { formatScore, t } from '@/i18n/vi'
import { StarRow } from '@/components/StarRow'

const MAX_STARS = 3

export type LevelMapProps = {
  progress: Progress
  levels: readonly LevelConfig[]
}

/**
 * The level list. A locked level is deliberately NOT a link: an `aria-disabled`
 * anchor still gets followed by a keyboard, and there is nothing behind it — the
 * play route only builds ids that exist, and entering one that is not unlocked
 * would skip the progression the six levels exist to teach.
 */
export function LevelMap({ progress, levels }: LevelMapProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-ink-strong">{t.levelMapTitle}</h1>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {levels.map((level) => {
          const unlocked = level.id <= progress.unlockedUpTo
          const record = progress.levels[level.id]
          const gap = record ? pointsToNextStar(record.bestScore, level.stars) : null

          const card = (
            <>
              <span className="text-lg font-semibold text-ink-strong">
                {t.levelLabel(level.id)}
              </span>
              {unlocked ? (
                <>
                  <StarRow stars={record?.stars ?? 0} max={MAX_STARS} />
                  <span className="text-xs text-ink-muted">
                    {record
                      ? `${t.bestScore}: ${formatScore(record.bestScore)}`
                      : t.noProgressYet}
                  </span>
                  {/* The thresholds were always in `levels.ts` and on no screen, so
                      a card could read "1/3 sao" forever without ever saying what
                      the second one costs (F-04). */}
                  {gap !== null && gap > 0 ? (
                    <span className="text-xs text-ink-muted">
                      {t.starGap(formatScore(gap))}
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="text-xs text-ink-muted">{t.locked}</span>
                  {/* "Chưa mở" is a state; this is the condition. Without it a
                      locked card cannot be told apart from an unbuilt one — which
                      is exactly the ambiguity the negative persona hit (F-09). */}
                  <span className="text-xs text-ink-muted">
                    {t.unlockHint(level.id - 1)}
                  </span>
                </>
              )}
            </>
          )

          return (
            <li key={level.id}>
              {unlocked ? (
                <Link
                  href={`/play/${level.id}/`}
                  className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl bg-surface-card p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-strong"
                >
                  {card}
                </Link>
              ) : (
                <div
                  aria-disabled="true"
                  className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl bg-surface-card/50 p-4 opacity-60"
                >
                  {card}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
