import type { Progress } from '@/engine/types'
// Only the constant is taken from the adapter, so the empty state has one
// definition; nothing here touches `localStorage`.
import { EMPTY_PROGRESS } from './local'
import type { ProgressRepository } from './ports'

/**
 * In-memory `ProgressRepository`. Two users: tests, which want progress they
 * can set up in one line, and the first server render, where no storage exists
 * yet and the level map still has to render something (ADR-0001).
 *
 * State is copied in and out so a caller holding the same object cannot change
 * what the repository reports afterwards — the localStorage adapter has that
 * property for free, and tests should not pass only because of a shared
 * reference.
 */
export function createMemoryRepository(
  initial: Progress = EMPTY_PROGRESS,
): ProgressRepository {
  let current = snapshot(initial)

  return {
    async load(): Promise<Progress> {
      return snapshot(current)
    },

    async save(progress: Progress): Promise<void> {
      current = snapshot(progress)
    },
  }
}

/** Shallow copy — a level entry is never mutated in place, only replaced. */
function snapshot(progress: Progress): Progress {
  return {
    version: 1,
    levels: { ...progress.levels },
    unlockedUpTo: progress.unlockedUpTo,
  }
}
