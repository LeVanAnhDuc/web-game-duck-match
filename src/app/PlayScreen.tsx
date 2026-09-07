'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGameSession } from '@/game/useGameSession'
import { LAST_LEVEL_ID, levelById } from '@/levels/levels'
import { createLocalRepository } from '@/storage/local'
import { t } from '@/i18n/vi'
import { Board } from '@/ui/Board'
import { GoalHud } from '@/ui/GoalHud'
import { MoveCounter } from '@/ui/MoveCounter'
import { ResultDialog } from '@/ui/ResultDialog'

/**
 * The play route's whole client side. It owns the session, wires the board to it,
 * and is the only place besides the level map that touches storage — the adapter is
 * constructed here and nowhere deeper, so swapping it for a backend later is a
 * one-line change (ADR-0001, architecture.md §3).
 */
export function PlayScreen({ levelId }: { levelId: number }) {
  const router = useRouter()
  const level = levelById(levelId)

  // One repository per mount. Building it inside the render body would hand the
  // hook a new object every render and restart its effects.
  const repository = useMemo(() => createLocalRepository(), [])

  if (!level) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
        <Link href="/" className="text-ink-muted underline">
          {t.backToMap}
        </Link>
      </main>
    )
  }

  return (
    <PlayScreenBody
      key={level.id}
      levelId={level.id}
      level={level}
      repository={repository}
      onBackToMap={() => router.push('/')}
      onNext={() => router.push(`/play/${level.id + 1}/`)}
    />
  )
}

type BodyProps = {
  levelId: number
  level: NonNullable<ReturnType<typeof levelById>>
  repository: ReturnType<typeof createLocalRepository>
  onBackToMap: () => void
  onNext: () => void
}

/**
 * Split out so the hook is never called conditionally: the parent has to be able
 * to bail out on an unknown level id before any hook runs.
 */
function PlayScreenBody({ levelId, level, repository, onBackToMap, onNext }: BodyProps) {
  const {
    session,
    busy,
    trySwap,
    restart,
    lastResult,
    stepEvents,
    beat,
    reducedMotion,
    hint,
  } = useGameSession({
    level,
    // Deterministic per level, so a bug report of "level 3 was impossible" can be
    // reproduced; `restart` advances it, so a replay is a different board.
    seed: levelId * 1000,
    repository,
    lastLevelId: LAST_LEVEL_ID,
  })

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-3 p-4">
      {/* design.md §6 keeps the back link and the level name together on the left at
          every width; splitting them across the page pushes the name into the
          corner and reads as two unrelated things. */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="min-h-[44px] rounded-lg px-2 py-2 text-ink-muted underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-strong"
        >
          {t.backToMap}
        </Link>
        <h1 className="text-lg font-semibold text-ink-strong">{t.levelLabel(levelId)}</h1>
      </div>

      {/*
        One DOM order, two layouts. design.md §6 puts the counters and the goal
        above the board on 375 and the replay button below it, then moves all three
        into a left column from `lg` up. A grid with explicit placement gets both
        without duplicating the button — a second copy would give the e2e replay
        testid two matches, and a screen reader two buttons that do one thing.
      */}
      <div className="grid gap-3 lg:grid-cols-[14rem_1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-6">
        <div className="lg:col-start-1 lg:row-start-1">
          <MoveCounter movesLeft={session.movesLeft} score={session.score} />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <GoalHud progress={session.progress} />
        </div>

        <div className="flex justify-center lg:col-start-2 lg:row-span-3 lg:row-start-1">
          <Board
            session={session}
            busy={busy}
            onSwap={trySwap}
            events={stepEvents}
            beat={beat}
            reducedMotion={reducedMotion}
            hint={hint}
          />
        </div>

        <button
          type="button"
          data-testid="replay"
          onClick={restart}
          className="min-h-[44px] rounded-xl bg-surface-raised px-4 font-semibold text-ink-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-strong lg:col-start-1 lg:row-start-3 lg:self-start"
        >
          {t.replay}
        </button>
      </div>

      {lastResult ? (
        <ResultDialog
          result={lastResult}
          hasNextLevel={levelId < LAST_LEVEL_ID}
          // US-02: on a loss the player wants to see what was still missing, and
          // the dialog is given no goal data of its own.
          detail={<GoalHud progress={session.progress} />}
          onReplay={restart}
          onNext={onNext}
          onBackToMap={onBackToMap}
        />
      ) : null}
    </main>
  )
}
