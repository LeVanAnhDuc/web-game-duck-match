import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Progress } from '@/engine/types'
import { EMPTY_PROGRESS, STORAGE_KEY, createLocalRepository, recordWin } from './local'
import { createMemoryRepository } from './memory'

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

/** A storage whose every method explodes — private mode, or quota exhausted. */
function throwingStorage(): Storage {
  return {
    getItem: () => {
      throw new Error('access denied')
    },
    setItem: () => {
      throw new Error('quota')
    },
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as unknown as Storage
}

describe('createLocalRepository', () => {
  it('returns empty progress when nothing is stored', async () => {
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it('round-trips', async () => {
    const repo = createLocalRepository()
    const p = recordWin(EMPTY_PROGRESS, 1, 2000, 2, 6)
    await repo.save(p)
    expect(await repo.load()).toEqual(p)
  })

  it('writes under the single versioned key — NFR-DATA-04', async () => {
    await createLocalRepository().save(EMPTY_PROGRESS)
    expect(STORAGE_KEY).toBe('match3.progress.v1')
    expect(Object.keys(localStorage)).toEqual([STORAGE_KEY])
  })

  it('falls back to empty progress on garbage — NFR-REL-03', async () => {
    localStorage.setItem(STORAGE_KEY, '{ not json at all')
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it('falls back when the shape is wrong', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, levels: 'nope' }))
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it.each([
    ['a future version', { version: 2, levels: {}, unlockedUpTo: 1 }],
    ['a missing version', { levels: {}, unlockedUpTo: 1 }],
    ['a string version', { version: '1', levels: {}, unlockedUpTo: 1 }],
    ['string levels', { version: 1, levels: 'nope', unlockedUpTo: 1 }],
    ['null levels', { version: 1, levels: null, unlockedUpTo: 1 }],
    ['array levels', { version: 1, levels: [], unlockedUpTo: 1 }],
    ['missing levels', { version: 1, unlockedUpTo: 1 }],
    ['string unlockedUpTo', { version: 1, levels: {}, unlockedUpTo: '3' }],
    ['missing unlockedUpTo', { version: 1, levels: {} }],
  ])('falls back on %s', async (_label, stored) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it.each([
    ['null', 'null'],
    ['a bare number', '42'],
    ['a bare string', '"progress"'],
    ['an array', '[]'],
    ['the empty string', ''],
  ])('falls back when the stored value is %s', async (_label, raw) => {
    localStorage.setItem(STORAGE_KEY, raw)
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it('survives a storage that throws on write', async () => {
    await expect(
      createLocalRepository(throwingStorage()).save(EMPTY_PROGRESS),
    ).resolves.toBeUndefined()
  })

  it('survives a storage that throws on read', async () => {
    await expect(createLocalRepository(throwingStorage()).load()).resolves.toEqual(
      EMPTY_PROGRESS,
    )
  })

  it('does not throw and reads empty progress when there is no window', async () => {
    vi.stubGlobal('window', undefined)
    const repo = createLocalRepository()
    expect(await repo.load()).toEqual(EMPTY_PROGRESS)
    await expect(repo.save(EMPTY_PROGRESS)).resolves.toBeUndefined()
  })

  it('resolves the default storage per call, not at construction', async () => {
    // The repository is built in a client component that also runs during the
    // static export, so construction can happen while `window` is absent.
    vi.stubGlobal('window', undefined)
    const repo = createLocalRepository()
    vi.unstubAllGlobals()
    const p = recordWin(EMPTY_PROGRESS, 1, 700, 1, 6)
    await repo.save(p)
    expect(await repo.load()).toEqual(p)
  })
})

describe('recordWin', () => {
  it('unlocks exactly the next level', () => {
    const p = recordWin(EMPTY_PROGRESS, 1, 1000, 1, 6)
    expect(p.unlockedUpTo).toBe(2)
  })

  it('keeps the best score and the best stars', () => {
    let p = recordWin(EMPTY_PROGRESS, 1, 3000, 3, 6)
    p = recordWin(p, 1, 500, 1, 6)
    expect(p.levels[1]).toEqual({ stars: 3, bestScore: 3000 })
  })

  it('never unlocks past the last level', () => {
    const p = recordWin({ ...EMPTY_PROGRESS, unlockedUpTo: 6 }, 6, 9000, 3, 6)
    expect(p.unlockedUpTo).toBe(6)
  })

  it('takes the higher score and the higher stars independently', () => {
    let p = recordWin(EMPTY_PROGRESS, 2, 3000, 1, 6)
    p = recordWin(p, 2, 1000, 3, 6)
    expect(p.levels[2]).toEqual({ stars: 3, bestScore: 3000 })
  })

  it('raises the score when the new run is better', () => {
    let p = recordWin(EMPTY_PROGRESS, 2, 1000, 1, 6)
    p = recordWin(p, 2, 4200, 2, 6)
    expect(p.levels[2]).toEqual({ stars: 2, bestScore: 4200 })
  })

  it('never lowers unlockedUpTo when an early level is replayed', () => {
    const p = recordWin({ ...EMPTY_PROGRESS, unlockedUpTo: 5 }, 1, 100, 1, 6)
    expect(p.unlockedUpTo).toBe(5)
  })

  it('unlocks only one level even if a later level is somehow won', () => {
    const p = recordWin(EMPTY_PROGRESS, 4, 100, 1, 6)
    expect(p.unlockedUpTo).toBe(5)
  })

  it('leaves other levels untouched', () => {
    let p = recordWin(EMPTY_PROGRESS, 1, 1000, 2, 6)
    p = recordWin(p, 2, 2000, 3, 6)
    expect(p.levels[1]).toEqual({ stars: 2, bestScore: 1000 })
    expect(p.levels[2]).toEqual({ stars: 3, bestScore: 2000 })
  })

  it('is pure — it mutates neither the progress nor its levels map', () => {
    const before: Progress = {
      version: 1,
      levels: { 1: { stars: 1, bestScore: 10 } },
      unlockedUpTo: 2,
    }
    const snapshot = structuredClone(before)
    const after = recordWin(before, 1, 9999, 3, 6)
    expect(before).toEqual(snapshot)
    expect(after).not.toBe(before)
    expect(after.levels).not.toBe(before.levels)
  })
})

describe('createMemoryRepository', () => {
  it('starts empty', async () => {
    expect(await createMemoryRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it('starts from the progress it was given', async () => {
    const p = recordWin(EMPTY_PROGRESS, 1, 1000, 1, 6)
    expect(await createMemoryRepository(p).load()).toEqual(p)
  })

  it('round-trips', async () => {
    const repo = createMemoryRepository()
    const p = recordWin(EMPTY_PROGRESS, 3, 2500, 2, 6)
    await repo.save(p)
    expect(await repo.load()).toEqual(p)
  })

  it('keeps its own copy — a later mutation of the caller’s object cannot leak in', async () => {
    const p: Progress = { version: 1, levels: {}, unlockedUpTo: 1 }
    const repo = createMemoryRepository(p)
    p.unlockedUpTo = 99
    expect((await repo.load()).unlockedUpTo).toBe(1)
  })

  it('does not share state between instances', async () => {
    const a = createMemoryRepository()
    await a.save(recordWin(EMPTY_PROGRESS, 1, 1000, 1, 6))
    expect(await createMemoryRepository().load()).toEqual(EMPTY_PROGRESS)
  })
})

describe('EMPTY_PROGRESS', () => {
  it('describes a brand-new player with only level 1 open', () => {
    expect(EMPTY_PROGRESS).toEqual({ version: 1, levels: {}, unlockedUpTo: 1 })
  })

  it('cannot be mutated by a caller', () => {
    expect(() => {
      ;(EMPTY_PROGRESS as { unlockedUpTo: number }).unlockedUpTo = 6
    }).toThrow()
  })
})
