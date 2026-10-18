import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useGameSession } from './useGameSession'
import { LEAD } from './timeline'
import { createMemoryRepository } from '@/storage/memory'
import { EMPTY_PROGRESS } from '@/storage/local'
import { findLegalMoves, isLegalSwap } from '@/engine/moves'
import type { LevelConfig, Pos, Session } from '@/engine'
import type { ProgressRepository } from '@/storage/ports'

const level: LevelConfig = {
  id: 1,
  rows: 7,
  cols: 7,
  colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 5,
  goals: [{ kind: 'score', target: 1 }],
  stars: [1, 2, 3],
}

/** One move and a target no single move can reach: the first swap always loses. */
const losingLevel: LevelConfig = {
  ...level,
  id: 2,
  moves: 1,
  goals: [{ kind: 'score', target: 1_000_000 }],
  stars: [1_000_000, 2_000_000, 3_000_000],
}

/**
 * A winning move on this fixture cascades for ~1.5s of real animation, which is
 * longer than `waitFor`'s 1s default — and the lock is meant to last exactly that
 * long. Kept under Vitest's 5s test timeout so a real hang still fails as a hang.
 */
const QUEUE_TIMEOUT = 4000

const setup = () =>
  renderHook(() =>
    useGameSession({
      level,
      seed: 1,
      repository: createMemoryRepository(),
      lastLevelId: 6,
    }),
  )

function firstLegalMove(session: Session): { from: Pos; to: Pos } {
  const move = findLegalMoves(session.grid)[0]
  if (!move) throw new Error('the fixture board has no legal move — pick another seed')
  return move
}

/** An adjacent pair that matches nothing: the swap the engine reverts for free. */
function firstIllegalMove(session: Session): { from: Pos; to: Pos } {
  for (let row = 0; row < session.level.rows; row += 1) {
    for (let col = 0; col < session.level.cols; col += 1) {
      const from = { row, col }
      const neighbours = [
        { row, col: col + 1 },
        { row: row + 1, col },
      ]
      for (const to of neighbours) {
        if (to.row >= session.level.rows || to.col >= session.level.cols) continue
        if (!isLegalSwap(session.grid, from, to)) return { from, to }
      }
    }
  }
  throw new Error('every adjacent pair on the fixture board is legal — pick another seed')
}

/** A repository that also reports how many times it was written to (invariant 10). */
function countingRepository(): {
  repository: ProgressRepository
  saveCount: () => number
} {
  const inner = createMemoryRepository()
  let saves = 0
  return {
    repository: {
      load: () => inner.load(),
      async save(progress) {
        saves += 1
        await inner.save(progress)
      },
    },
    saveCount: () => saves,
  }
}

/** Grids compare by content, since every restart builds new `Piece` objects. */
const layoutOf = (session: Session): string =>
  session.grid
    .map((row) =>
      row.map((cell) => `${cell?.color ?? '.'}:${cell?.special ?? '.'}`).join(),
    )
    .join('|')

function reducedMotionMatchMedia(): typeof window.matchMedia {
  return ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useGameSession', () => {
  it('starts idle with a full board', () => {
    const { result } = setup()
    expect(result.current.busy).toBe(false)
    expect(result.current.session.movesLeft).toBe(5)
  })

  it('goes busy on a swap and idle again when the queue drains', async () => {
    const { result } = setup()
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    expect(result.current.busy).toBe(true)
    await waitFor(() => expect(result.current.busy).toBe(false), {
      timeout: QUEUE_TIMEOUT,
    })
  })

  it('ignores a swap while busy — invariant 3', async () => {
    const { result } = setup()
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    const movesAfterFirst = result.current.session.movesLeft
    act(() => result.current.trySwap(move.from, move.to))
    await waitFor(() => expect(result.current.busy).toBe(false), {
      timeout: QUEUE_TIMEOUT,
    })
    expect(result.current.session.movesLeft).toBeLessThanOrEqual(movesAfterFirst)
    // Spelled out as well as bounded: the dropped swap must have cost nothing.
    expect(result.current.session.movesLeft).toBe(4)
  })

  it('reports the result and persists a win', async () => {
    const repository = createMemoryRepository()
    const { result } = renderHook(() =>
      useGameSession({ level, seed: 1, repository, lastLevelId: 6 }),
    )
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    await waitFor(() => expect(result.current.lastResult?.status).toBe('won'), {
      timeout: QUEUE_TIMEOUT,
    })
    // The write is awaited inside an effect, so it lands a tick after the result.
    await waitFor(async () => {
      const saved = await repository.load()
      expect(saved.unlockedUpTo).toBe(2)
      expect(saved.levels[1]?.bestScore).toBeGreaterThan(0)
    })
  })

  it('restart gives a fresh board and clears the result', async () => {
    const { result } = setup()
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    await waitFor(() => expect(result.current.lastResult).not.toBeNull(), {
      timeout: QUEUE_TIMEOUT,
    })
    act(() => result.current.restart())
    expect(result.current.lastResult).toBeNull()
    expect(result.current.session.movesLeft).toBe(5)
  })

  it('shows each cause as it plays, and the settled board only at the end', async () => {
    const { result } = setup()
    const before = result.current.session
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))

    // The first step is the swap itself, so mid-queue the player already sees the
    // two pieces exchanged and the move spent — but not the cleared cells, and not
    // the refill. Showing the settled board here would show effects before causes.
    const midQueue = result.current.session
    expect(midQueue).not.toBe(before)
    expect(midQueue.movesLeft).toBe(4)
    expect(midQueue.grid[move.to.row]?.[move.to.col]).toEqual(
      before.grid[move.from.row]?.[move.from.col],
    )
    expect(midQueue.score).toBe(before.score)

    await waitFor(() => expect(result.current.busy).toBe(false), {
      timeout: QUEUE_TIMEOUT,
    })

    // Once the queue drains, what is shown is the engine's own settled session —
    // the projection and the engine must never disagree.
    expect(result.current.session.movesLeft).toBe(4)
    expect(result.current.session.score).toBeGreaterThan(before.score)
    expect(result.current.session.grid.flat().every((cell) => cell !== null)).toBe(true)
  })

  it('holds the input lock for the whole animation, not just its first step', async () => {
    vi.useFakeTimers()
    const { result } = setup()
    const move = firstLegalMove(result.current.session)
    const start = Date.now()
    act(() => result.current.trySwap(move.from, move.to))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LEAD.swap - 1)
    })
    expect(result.current.busy).toBe(true)
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.busy).toBe(false)
    expect(Date.now() - start).toBeGreaterThan(LEAD.swap)
  })

  it('spends no time animating under reduced motion — NFR-A11Y-05', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(reducedMotionMatchMedia())
    vi.useFakeTimers()
    const { result } = setup()
    const move = firstLegalMove(result.current.session)
    const start = Date.now()
    act(() => result.current.trySwap(move.from, move.to))
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.busy).toBe(false)
    expect(result.current.lastResult?.status).toBe('won')
    // Every duration is 0, so the whole queue costs less than a single animated
    // step: the player jumps to the settled board instead of watching it arrive.
    // It is not exactly 0 only because the fake clock nudges each nested
    // zero-delay timer forward by 1ms to protect itself from a runaway loop.
    expect(Date.now() - start).toBeLessThan(LEAD.swap)
  })

  it('asks matchMedia for the reduced-motion query', () => {
    const spy = vi.spyOn(window, 'matchMedia')
    setup()
    expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('plays a move on a browser that has no matchMedia at all', async () => {
    const original = window.matchMedia
    Reflect.deleteProperty(window, 'matchMedia')
    try {
      vi.useFakeTimers()
      const { result } = setup()
      const move = firstLegalMove(result.current.session)
      act(() => result.current.trySwap(move.from, move.to))
      await act(async () => {
        await vi.runAllTimersAsync()
      })
      expect(result.current.busy).toBe(false)
      expect(result.current.lastResult?.status).toBe('won')
    } finally {
      window.matchMedia = original
    }
  })

  it('does nothing at all for a swap the engine refuses outright', () => {
    const { result } = setup()
    const before = result.current.session
    act(() => result.current.trySwap({ row: 0, col: 0 }, { row: 3, col: 3 }))
    expect(result.current.busy).toBe(false)
    expect(result.current.session).toBe(before)
    expect(result.current.lastResult).toBeNull()
  })

  it('animates a reverted swap without spending a move — invariant 6', async () => {
    const { result } = setup()
    const move = firstIllegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    expect(result.current.busy).toBe(true)
    await waitFor(() => expect(result.current.busy).toBe(false), {
      timeout: QUEUE_TIMEOUT,
    })
    expect(result.current.session.movesLeft).toBe(5)
    expect(result.current.session.status).toBe('playing')
    expect(result.current.lastResult).toBeNull()
  })

  it('never writes progress on a loss — invariant 10', async () => {
    vi.useFakeTimers()
    const { repository, saveCount } = countingRepository()
    const { result } = renderHook(() =>
      useGameSession({ level: losingLevel, seed: 1, repository, lastLevelId: 6 }),
    )
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.lastResult).not.toBeNull()
    expect(result.current.lastResult?.status).toBe('lost')
    expect(result.current.lastResult?.stars).toBe(0)
    expect(await repository.load()).toEqual(EMPTY_PROGRESS)
    expect(saveCount()).toBe(0)
  })

  it('restart reseeds the board, and the same attempt reseeds it the same way', () => {
    const first = setup()
    const beforeRestart = layoutOf(first.result.current.session)
    act(() => first.result.current.restart())
    const afterRestart = layoutOf(first.result.current.session)
    expect(afterRestart).not.toBe(beforeRestart)

    // Reproducible from `(level, seed, attempt)` alone — no clock and no
    // `Math.random` anywhere in the chain (invariant 1).
    const second = setup()
    act(() => second.result.current.restart())
    expect(layoutOf(second.result.current.session)).toBe(afterRestart)
  })

  it('restart cancels a queue in flight so the abandoned move never lands', async () => {
    vi.useFakeTimers()
    const { result } = setup()
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    act(() => result.current.restart())
    expect(result.current.busy).toBe(false)
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.session.movesLeft).toBe(5)
    expect(result.current.lastResult).toBeNull()
  })

  it('clears the pending timer on unmount', () => {
    vi.useFakeTimers()
    const { result, unmount } = setup()
    const move = firstLegalMove(result.current.session)
    act(() => result.current.trySwap(move.from, move.to))
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
