import type { Progress } from '@/engine/types'

/**
 * The one gate between the game and wherever progress lives. It is async even
 * though the only adapter today is synchronous `localStorage`: turning a sync
 * port async later would ripple a loading state and an error branch through
 * every call site, so we pay that price now while there are only two screens
 * (ADR-0001).
 *
 * Neither method may reject. A corrupt or unavailable store means "brand-new
 * player", not a broken app (NFR-REL-03) — the adapter absorbs the failure so
 * no caller has to remember to.
 */
export interface ProgressRepository {
  load(): Promise<Progress>
  save(progress: Progress): Promise<void>
}
