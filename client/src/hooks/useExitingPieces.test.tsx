import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { Piece } from '@/engine'
import { useExitingPieces, type Placed } from './useExitingPieces'

/**
 * `waitFor` is deliberately absent from this file: it polls on real timers, so
 * mixing it with `vi.useFakeTimers()` either hangs or advances one virtual
 * millisecond per await. Every wait here is an explicit `advanceTimersByTime`.
 */

const piece = (id: number): Piece => ({ id, color: 'red', special: 'none' })
const at = (id: number, row: number, col: number): Placed => ({
  piece: piece(id),
  row,
  col,
})

/** Ids in returned order — the assertions are about identity and order, not colours. */
const ids = (list: Placed[]) => list.map((p) => p.piece.id)
const exitingIds = (list: Placed[]) =>
  list.filter((p) => p.exiting).map((p) => p.piece.id)

const BEAT = 200

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('useExitingPieces', () => {
  it('keeps a piece that vanished, once, marked exiting, at its last cell', () => {
    const { result, rerender } = renderHook(
      ({ placed }: { placed: Placed[] }) => useExitingPieces(placed, BEAT),
      { initialProps: { placed: [at(1, 0, 0), at(2, 1, 3)] } },
    )

    rerender({ placed: [at(1, 0, 0)] })

    // Live first, then exiting: React reorders DOM nodes when the order churns, and
    // an exiting node must not push a live one around while it pops.
    expect(ids(result.current)).toEqual([1, 2])
    expect(exitingIds(result.current)).toEqual([2])
    const gone = result.current[1] as Placed
    expect({ row: gone.row, col: gone.col }).toEqual({ row: 1, col: 3 })
    // The live piece is passed through untouched — no stray flag on it.
    expect(result.current[0]?.exiting).toBeFalsy()
  })

  it('drops the exiting piece once ms has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ placed }: { placed: Placed[] }) => useExitingPieces(placed, BEAT),
      { initialProps: { placed: [at(1, 0, 0), at(2, 1, 3)] } },
    )

    rerender({ placed: [at(1, 0, 0)] })
    expect(ids(result.current)).toEqual([1, 2])

    act(() => {
      vi.advanceTimersByTime(BEAT - 1)
    })
    expect(ids(result.current)).toEqual([1, 2])

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(ids(result.current)).toEqual([1])
  })

  it('never marks a piece that only moved', () => {
    const { result, rerender } = renderHook(
      ({ placed }: { placed: Placed[] }) => useExitingPieces(placed, BEAT),
      { initialProps: { placed: [at(1, 0, 0), at(2, 1, 3)] } },
    )

    // Same ids, new cells — this is the whole point of keying by `Piece.id`: a fall
    // or a swap is one node changing `translate`, not a removal plus an insert.
    rerender({ placed: [at(1, 3, 0), at(2, 4, 3)] })

    expect(ids(result.current)).toEqual([1, 2])
    expect(exitingIds(result.current)).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('lists a piece that comes back before ms once, and not as exiting', () => {
    const { result, rerender } = renderHook(
      ({ placed }: { placed: Placed[] }) => useExitingPieces(placed, BEAT),
      { initialProps: { placed: [at(1, 0, 0), at(2, 1, 3)] } },
    )

    rerender({ placed: [at(1, 0, 0)] })
    act(() => {
      vi.advanceTimersByTime(BEAT / 2)
    })
    rerender({ placed: [at(1, 0, 0), at(2, 6, 3)] })

    expect(ids(result.current)).toEqual([1, 2])
    expect(exitingIds(result.current)).toEqual([])
    expect(result.current[1]?.row).toBe(6)
    // Its removal timer is cancelled on the way in, or it would fire later and drop
    // a piece that is on the board.
    expect(vi.getTimerCount()).toBe(0)

    act(() => {
      vi.advanceTimersByTime(BEAT)
    })
    expect(ids(result.current)).toEqual([1, 2])
    expect(exitingIds(result.current)).toEqual([])
  })

  it('times each exiting piece out on its own clock', () => {
    const { result, rerender } = renderHook(
      ({ placed }: { placed: Placed[] }) => useExitingPieces(placed, BEAT),
      { initialProps: { placed: [at(1, 0, 0), at(2, 1, 1), at(3, 2, 2)] } },
    )

    rerender({ placed: [at(1, 0, 0), at(3, 2, 2)] })
    act(() => {
      vi.advanceTimersByTime(BEAT / 2)
    })
    rerender({ placed: [at(1, 0, 0)] })

    expect(ids(result.current)).toEqual([1, 2, 3])

    // Piece 2 started half a beat earlier, so it leaves half a beat earlier.
    act(() => {
      vi.advanceTimersByTime(BEAT / 2)
    })
    expect(ids(result.current)).toEqual([1, 3])

    act(() => {
      vi.advanceTimersByTime(BEAT / 2)
    })
    expect(ids(result.current)).toEqual([1])
  })

  it('keeps the exiting order stable while more pieces leave', () => {
    const { result, rerender } = renderHook(
      ({ placed }: { placed: Placed[] }) => useExitingPieces(placed, BEAT),
      { initialProps: { placed: [at(1, 0, 0), at(2, 1, 1), at(3, 2, 2)] } },
    )

    rerender({ placed: [at(1, 0, 0), at(3, 2, 2)] })
    rerender({ placed: [at(1, 0, 0)] })
    // 2 left first and stays ahead of 3; a re-render with unchanged input moves
    // nothing.
    expect(ids(result.current)).toEqual([1, 2, 3])
    rerender({ placed: [at(1, 0, 0)] })
    expect(ids(result.current)).toEqual([1, 2, 3])
  })

  it('leaves no pending timer after unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ placed }: { placed: Placed[] }) => useExitingPieces(placed, BEAT),
      { initialProps: { placed: [at(1, 0, 0), at(2, 1, 1), at(3, 2, 2)] } },
    )

    rerender({ placed: [at(1, 0, 0)] })
    expect(vi.getTimerCount()).toBe(2)

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
