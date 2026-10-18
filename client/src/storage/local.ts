import type { Progress, Stars } from '@/engine/types'
import type { ProgressRepository } from './ports'

/**
 * The `localStorage` adapter for `ProgressRepository`.
 *
 * Two rules shape everything here: a read never throws and a write never
 * throws. Stored progress is the only persisted data in the game and losing it
 * is acceptable (NFR-DATA-03), so any doubt about it — bad JSON, an old shape,
 * a browser that denies storage — resolves to "brand-new player" rather than to
 * an error the UI would have to render (NFR-REL-03).
 */

/**
 * One key, carrying its schema version in the name as well as in the payload,
 * so a future shape change is a new key and a readable migration rather than a
 * guess about what the old value meant (NFR-DATA-04).
 */
export const STORAGE_KEY = 'match3.progress.v1'

/**
 * Frozen because it is a module-level singleton handed to callers as their
 * starting state: an accidental write to it would silently become every other
 * caller's starting state too.
 */
export const EMPTY_PROGRESS: Progress = Object.freeze({
  version: 1,
  levels: Object.freeze({}),
  unlockedUpTo: 1,
})

/**
 * Shallow shape check on data that came from outside the program. It answers
 * only "can the rest of the app treat this as `Progress`" — the three fields the
 * level map actually reads.
 */
function isProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const candidate = value as {
    version?: unknown
    levels?: unknown
    unlockedUpTo?: unknown
  }
  if (candidate.version !== 1) return false
  const levels = candidate.levels
  // `typeof [] === 'object'`, so arrays need their own rejection.
  if (typeof levels !== 'object' || levels === null || Array.isArray(levels)) return false
  return (
    typeof candidate.unlockedUpTo === 'number' && Number.isFinite(candidate.unlockedUpTo)
  )
}

/**
 * Records a win without ever downgrading what the player already achieved:
 * score and stars are each kept at their maximum, and `unlockedUpTo` only ever
 * moves forward, by at most one level (invariant 10). Pure — it returns a new
 * `Progress` and touches neither the argument nor its `levels` map.
 */
export function recordWin(
  progress: Progress,
  levelId: number,
  score: number,
  stars: Stars,
  lastLevelId: number,
): Progress {
  const previous = progress.levels[levelId]
  // Compared rather than `Math.max`-ed to keep the `Stars` union instead of widening to number.
  const bestStars: Stars = previous && previous.stars > stars ? previous.stars : stars
  return {
    version: 1,
    levels: {
      ...progress.levels,
      [levelId]: {
        stars: bestStars,
        bestScore: Math.max(previous?.bestScore ?? 0, score),
      },
    },
    unlockedUpTo: Math.max(progress.unlockedUpTo, Math.min(levelId + 1, lastLevelId)),
  }
}

export function createLocalRepository(storage?: Storage): ProgressRepository {
  /**
   * Resolved per call, never captured at construction. This repository is built
   * inside a client component of a statically exported app, so construction can
   * happen while `window` does not exist; binding the store then would leave
   * the hydrated page reading from nothing forever.
   */
  function resolveStorage(): Storage | null {
    if (storage) return storage
    try {
      // Reading `window.localStorage` itself throws when site data is blocked,
      // so the guard has to cover the property access, not just its use.
      return typeof window === 'undefined' ? null : window.localStorage
    } catch {
      return null
    }
  }

  return {
    async load(): Promise<Progress> {
      const store = resolveStorage()
      if (!store) return EMPTY_PROGRESS
      try {
        const raw = store.getItem(STORAGE_KEY)
        if (!raw) return EMPTY_PROGRESS
        const parsed: unknown = JSON.parse(raw)
        return isProgress(parsed) ? parsed : EMPTY_PROGRESS
      } catch {
        return EMPTY_PROGRESS
      }
    },

    async save(progress: Progress): Promise<void> {
      const store = resolveStorage()
      if (!store) return
      try {
        store.setItem(STORAGE_KEY, JSON.stringify(progress))
      } catch {
        // Quota exceeded, private mode, serialisation failure — a lost save is a
        // lost high score, which must never be a lost game.
      }
    },
  }
}
