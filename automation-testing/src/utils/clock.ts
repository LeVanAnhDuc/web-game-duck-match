import type { Page } from "@playwright/test";

const T0 = new Date("2026-01-01T00:00:00Z").getTime();

/**
 * Installs Playwright's fake clock and stops it, before the page loads. `clock.install()` alone keeps time flowing
 * in real time, so under a loaded CI runner a "4.9 seconds" check could see 6. Frozen, the game's timers (the
 * 5-second hint, the beat-by-beat timeline) only move when the test calls `page.clock.runFor(ms)`.
 */
export async function freezeClock(page: Page): Promise<void> {
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 1_000);
}
