'use client'

import Link from 'next/link'
import type { LevelConfig, Progress } from '@/engine'
import { formatScore, t } from '@/i18n/vi'
import { StarRow } from './StarRow'

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
                </>
              ) : (
                <span className="text-xs text-ink-muted">{t.locked}</span>
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
