'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGameSession } from '@/game/useGameSession'
import { LAST_LEVEL_ID, levelById } from '@/levels/levels'
import { createLocalRepository } from '@/storage/local'
import { t } from '@/i18n/vi'
import { Board } from './mains/Board'
import { GoalHud } from './components/GoalHud'
import { MoveCounter } from './components/MoveCounter'
import { ResultDialog } from './components/ResultDialog'
import { ConfirmRestart, isLevelInProgress } from './components/ConfirmRestart'

/**
 * The play route's whole client side. It owns the session, wires the board to it,
 * and is the only place besides the level map that touches storage — the adapter is
 * constructed here and nowhere deeper, so swapping it for a backend later is a
 * one-line change (ADR-0001, architecture.md §3).
 */
export function Play({ levelId }: { levelId: number }) {
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
    <PlayBody
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
function PlayBody({ levelId, level, repository, onBackToMap, onNext }: BodyProps) {
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

  /**
   * FR-22. Restarting is one Tab and one Enter away from the bàn — `Về bản đồ`,
   * a cell, then this — and persona p03 walked that path by accident and read the
   * consequence as a bug (design.md §2.1). The gate only closes when there is
   * something behind it.
   */
  const [confirmingRestart, setConfirmingRestart] = useState(false)
  /**
   * Counts restarts rather than holding a boolean: the announcement has to fire
   * again on a second restart, and identical text in a live region is not
   * re-announced. The number never reaches the screen.
   */
  const [restartCount, setRestartCount] = useState(0)

  function doRestart() {
    restart()
    setRestartCount((count) => count + 1)
  }

  function requestRestart() {
    if (isLevelInProgress(session, level)) {
      setConfirmingRestart(true)
      return
    }
    // Nothing earned yet, so nothing to ask about — but all 49 pieces still change
    // at once, and that is announced below either way.
    doRestart()
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-2 p-4 [@media(max-height:560px)]:gap-1 [@media(max-height:560px)]:p-2">
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
      {/*
        FR-21. At 720x450 — a 1440x900 laptop at 200% zoom, which is how persona
        p05 browses — the header plus these two stacked cards ate 230 of 450px and
        left 3.5 of 8 board rows visible. By the time she was watching the bàn the
        counters had scrolled off entirely, so cause and effect were never on
        screen together (F-06).

        The `lg` layout is unchanged. The short-viewport rule folds the two cards
        into one row so the numbers stay in the same glance as the bàn.
      */}
      <div className="grid gap-3 [@media(max-height:560px)]:gap-2 lg:grid-cols-[14rem_1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-6">
        {/* `contents` by default, so the two cards stay direct grid items and the
            `lg` placement below keeps working untouched. The short-viewport rule
            in globals.css turns this wrapper into a real flex row instead — one
            place, one media query, rather than a variant on every child. */}
        <div className="hud-strip contents">
          <div className="lg:col-start-1 lg:row-start-1">
            <MoveCounter movesLeft={session.movesLeft} score={session.score} />
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <GoalHud progress={session.progress} />
          </div>
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
          onClick={requestRestart}
          className="min-h-[44px] rounded-xl bg-surface-raised px-4 font-semibold text-ink-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-strong lg:col-start-1 lg:row-start-3 lg:self-start"
        >
          {t.replay}
        </button>
      </div>

      {confirmingRestart ? (
        <ConfirmRestart
          session={session}
          onConfirm={() => {
            setConfirmingRestart(false)
            doRestart()
          }}
          onCancel={() => setConfirmingRestart(false)}
        />
      ) : null}

      {/*
        The other half of FR-22: the confirm asks, this reports. A board that
        replaces every piece with no word said is the same failure whether or not
        the player had anything to lose.

        The alternating non-breaking space is not decoration. Most screen readers
        skip a live region whose text is byte-identical to what they just read, so
        two restarts in a row would announce once. It flips the string without
        changing a spoken word or a rendered pixel.
      */}
      <div role="status" aria-live="polite" className="sr-only">
        {restartCount > 0 ? t.levelRestarted + ' '.repeat(restartCount % 2) : ''}
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
