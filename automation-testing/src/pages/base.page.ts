import type { Page } from "@playwright/test";
import { PROGRESS_KEY, type Progress } from "@/data/test-data";

// Shared parts of every screen: components that appear everywhere (header, toast…) are created here.
// Relative URLs resolve against the project's baseURL (the web host).
export abstract class BasePage {
  constructor(readonly page: Page) {}

  /**
   * Writes the game's own save (localStorage `match3.progress.v1`) the way the game itself would, then leaves the
   * page where it is: the next `goto()` loads with it. Not an init script — that would rewrite the save on every
   * navigation and wipe whatever the game saved in between.
   */
  async seedProgress(progress: Progress | string): Promise<void> {
    if (this.page.url() === "about:blank") await this.page.goto("./");
    const raw = typeof progress === "string" ? progress : JSON.stringify(progress);
    await this.page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [PROGRESS_KEY, raw] as const);
  }

  /** The save as the game left it (null when there is none). */
  async readProgress(): Promise<Progress | null> {
    const raw = await this.page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Progress) : null;
  }

  /** Every key the page has put in local and session storage. */
  async storageKeys(): Promise<{ local: string[]; session: string[] }> {
    return this.page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  }
}
