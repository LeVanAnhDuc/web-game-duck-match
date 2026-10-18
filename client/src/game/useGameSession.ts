'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { applySwap, findHint, newSession, pointsToNextStar } from '@/engine'
import type { GameEvent, LevelConfig, Pos, Session, Stars, SwapResult } from '@/engine'
import { recordWin } from '@/storage/local'
import type { ProgressRepository } from '@/storage/ports'
import { projectEvents } from './project'
import { buildTimeline } from './timeline'
import type { Step } from './timeline'

/**
 * The whole glue layer between the pure engine and React.
 *
 * It owns exactly three things the engine deliberately refuses to know about: when
 * the player may move, when the board on screen catches up with the board the engine
 * already settled, and the single write to persisted progress. It computes no score,
 * finds no match and rates no star — every number it reports comes out of a `Session`
 * or off a `GameEvent` (invariant 2).
 */

export type GameResult = {
  status: 'won' | 'lost'
  stars: Stars
  score: number
  /**
   * Points still owed for the next star, or `null` once all three are earned.
   * Derived here rather than in the dialog, which is handed a result and has no
   * business reading level config (FR-20).
   */
  starGap: number | null
}

export type UseGameSessionArgs = {
  level: LevelConfig
  seed: number
  repository: ProgressRepository
  lastLevelId: number
}

export type UseGameSessionResult = {
  session: Session
  busy: boolean
  trySwap(from: Pos, to: Pos): void
  restart(): void
  lastResult: GameResult | null
  /** Events of the beat playing right now, for the effect layer. */
  stepEvents: GameEvent[]
  /** Monotonic, so two identical event lists still produce distinct effect keys. */
  beat: number
  reducedMotion: boolean
  /** What `findHint` suggests after the player has gone quiet, else null. */
  hint: { from: Pos; to: Pos } | null
}

/** How long the player has to be idle before the board offers a nudge. */
const HINT_AFTER_MS = 5_000

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function prefersReducedMotion(): boolean {
  // Absent during the static export's build-time render, and absent in test and
  // browser environments that never implemented it. Neither is a reason to refuse
  // to animate, so the fallback is "no preference stated" (NFR-A11Y-05).
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
  } catch {
    return false
  }
}

function isLevelWon(event: GameEvent): event is Extract<GameEvent, { t: 'levelWon' }> {
  return event.t === 'levelWon'
}

export function useGameSession(args: UseGameSessionArgs): UseGameSessionResult {
  const [session, setSession] = useState<Session>(() => newSession(args.level, args.seed))
  const [busy, setBusy] = useState(false)
  const [lastResult, setLastResult] = useState<GameResult | null>(null)
  const [beatState, setBeatState] = useState<{ events: GameEvent[]; beat: number }>({
    events: [],
    beat: 0,
  })
  const [hint, setHint] = useState<{ from: Pos; to: Pos } | null>(null)

  /**
   * The latest arguments, read by the timer chain and by the persistence effect.
   * They are held in a ref rather than closed over so those callbacks can stay
   * stable: rebuilding `trySwap` on every render would hand `Board` a new prop
   * identity on every animation step of every cascade.
   *
   * The level and the base seed are read only when a game starts, so pointing the
   * hook at a different level mid-game does nothing — the caller remounts (the play
   * route already does) or calls `restart`.
   */
  const argsRef = useRef(args)
  useEffect(() => {
    argsRef.current = args
  })

  /**
   * The session the player is looking at, mirrored so `trySwap` can hand the engine
   * the current board without depending on the render that produced it.
   */
  const sessionRef = useRef(session)

  /** Replay counter, folded into the seed so each attempt is a different board. */
  const attemptRef = useRef(0)

  /**
   * What `applySwap` returned: the truth about the board from the instant the swap
   * was made, but shown only after the queue has played every cause that led to it.
   * Adopting it early would show the player an effect before its cause.
   */
  const pendingRef = useRef<SwapResult | null>(null)
  const queueRef = useRef<Step[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Mirrors `busy`. `trySwap` can be called twice inside one React batch — a double
   * tap, or a pointer and a keyboard event describing the same gesture — and the
   * state value the second call closed over would still read `false` (invariant 3).
   */
  const busyRef = useRef(false)

  /**
   * Sampled once on mount rather than per swap: the value is only consulted when a
   * timeline is built, and re-reading it mid-queue would retime an animation that is
   * already playing.
   */
  const reducedMotionRef = useRef(false)
  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion()
  }, [])

  const commitSession = useCallback((next: Session) => {
    sessionRef.current = next
    setSession(next)
  }, [])

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current === null) return
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  /** Drops the queue and everything it was going to show. */
  const abandonQueue = useCallback(() => {
    clearPendingTimer()
    queueRef.current = []
    pendingRef.current = null
    busyRef.current = false
    setBusy(false)
  }, [clearPendingTimer])

  /**
   * Plays the queue one step at a time, each step held for its own duration, so the
   * input lock lasts exactly as long as the animation it protects — no arbitrary
   * timeout to keep in sync with `DURATIONS`. Under reduced motion every duration is
   * 0 and this collapses into one chain of immediate ticks.
   */
  const advance = useCallback(() => {
    timerRef.current = null
    const step = queueRef.current.shift()
    if (step) {
      // Project the step onto the board being shown. Without this the whole
      // cascade would land in one jump and the timeline would only be a pause —
      // the player would see the result before its cause. `sessionRef` is left
      // alone: the engine's own settled session stays the authority, and the
      // projection is only what is on screen (invariant 2).
      setSession((shown) => projectEvents(shown, step.events, step.visual))
      // The effect layer reads events, not state, so it needs the beat published
      // separately — and a counter, because the same event list can play twice.
      setBeatState((previous) => ({ events: step.events, beat: previous.beat + 1 }))
      // `lead` is when the NEXT beat starts, not how long this one animates — the
      // animation itself runs in CSS and deliberately outlives its lead, which is
      // what makes the beats overlap (ADR-0010).
      timerRef.current = setTimeout(advance, step.lead)
      return
    }

    const pending = pendingRef.current
    pendingRef.current = null
    busyRef.current = false
    setBusy(false)
    if (!pending) return

    commitSession(pending.session)

    // A finished level needs no extra input guard: `applySwap` reports a swap on a
    // finished session as "not a move", so `trySwap` drops it on its own.
    if (pending.session.status === 'playing') return

    // Stars are read off the event the engine emitted, never rated here; a lost
    // level earns none (invariant 2).
    const won = pending.events.find(isLevelWon)
    setLastResult({
      status: pending.session.status,
      score: pending.session.score,
      stars: won?.stars ?? 0,
      starGap: pointsToNextStar(pending.session.score, pending.session.level.stars),
    })
  }, [commitSession])

  const trySwap = useCallback(
    (from: Pos, to: Pos) => {
      // Invariant 3: a swap made mid-queue would be applied to the board the player
      // can see, which the engine has already moved past. The move is dropped, not
      // queued — queueing it would let a mistaken double tap spend two moves.
      if (busyRef.current) return

      const result = applySwap(sessionRef.current, from, to)

      // `applySwap` says "not a move at all" with an empty event list: a
      // non-adjacent pair, an empty cell, a level already over. Nothing to animate,
      // so nothing to lock either.
      if (result.events.length === 0) return

      pendingRef.current = result
      queueRef.current = buildTimeline(result.events, {
        reducedMotion: reducedMotionRef.current,
      })
      busyRef.current = true
      setBusy(true)
      advance()
    },
    [advance],
  )

  const restart = useCallback(() => {
    abandonQueue()
    attemptRef.current += 1
    const { level, seed } = argsRef.current
    // A replay must not be the same board — a level lost to a bad board would be
    // lost the same way forever — but it must still be reproducible from
    // `(level, seed, attempt)`, so the new seed is derived, never drawn from the
    // clock (invariant 1).
    commitSession(newSession(level, seed + attemptRef.current))
    setLastResult(null)
  }, [abandonQueue, commitSession])

  // Unmounting mid-cascade must not leave a timer behind to fire into a component
  // that is gone.
  useEffect(() => clearPendingTimer, [clearPendingTimer])

  /**
   * The only write to persisted progress in the whole app, and it happens only on a
   * win (invariant 10). It runs in an effect rather than in `advance` because the
   * port is async and a state update must not wait on IO; `recordWin` keeps the
   * better of old and new, so a repeated run of this effect cannot downgrade
   * anything.
   */
  useEffect(() => {
    if (lastResult === null || lastResult.status !== 'won') return

    const { repository, level, lastLevelId } = argsRef.current
    let cancelled = false

    void (async () => {
      const stored = await repository.load()
      // The player may have restarted or left while the read was in flight; writing
      // then would resurrect a finished level's result on top of what came after.
      if (cancelled) return
      await repository.save(
        recordWin(stored, level.id, lastResult.score, lastResult.stars, lastLevelId),
      )
    })()

    return () => {
      cancelled = true
    }
  }, [lastResult])

  /**
   * The idle nudge. Finding a move is a game rule, so `findHint` lives in the engine
   * and this only asks (design.md §C.3) — and it only asks while nothing is playing,
   * so a hint can never appear over a cascade the player is still watching.
   */
  useEffect(() => {
    setHint(null)
    if (busy || session.status !== 'playing' || lastResult) return

    const timer = setTimeout(() => {
      setHint(findHint(sessionRef.current))
    }, HINT_AFTER_MS)
    return () => clearTimeout(timer)
    // `session` is the dependency that matters: every accepted move replaces it and
    // therefore restarts the idle clock.
  }, [busy, session, lastResult])

  return {
    session,
    busy,
    trySwap,
    restart,
    lastResult,
    stepEvents: beatState.events,
    beat: beatState.beat,
    reducedMotion: reducedMotionRef.current,
    hint,
  }
}
