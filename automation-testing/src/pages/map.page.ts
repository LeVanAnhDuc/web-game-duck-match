import type { Locator } from "@playwright/test";
import { copy } from "@/data/copy";
import { BasePage } from "./base.page";

// The level map (`/`): the product header, the optional Ducker ID account control, and one card per level.
// An unlocked level is a link; a locked one is a plain block marked aria-disabled (never a link).
export class MapPage extends BasePage {
  async goto(query = ""): Promise<void> {
    await this.page.goto(`./${query}`);
    await this.heading().waitFor();
    // The map renders "Đang tải…" until progress has loaded from storage.
    await this.page.getByText(copy.loading).waitFor({ state: "detached" });
  }

  heading(): Locator {
    return this.page.getByRole("heading", { name: copy.levelMapTitle });
  }

  header(): Locator {
    return this.page.getByTestId("product-header");
  }

  /** Every level card, locked or not, in order. */
  cards(): Locator {
    return this.page.getByRole("list").getByRole("listitem");
  }

  card(levelId: number): Locator {
    return this.cards().nth(levelId - 1);
  }

  levelLinks(): Locator {
    return this.page.getByRole("list").getByRole("link");
  }

  levelLink(levelId: number): Locator {
    return this.card(levelId).getByRole("link");
  }

  lockedCards(): Locator {
    return this.page.locator('[aria-disabled="true"]');
  }

  /** The accessible "Đạt N/3 sao" star row on a card. */
  stars(levelId: number): Locator {
    return this.card(levelId).getByRole("img");
  }

  async openLevel(levelId: number): Promise<void> {
    await this.levelLink(levelId).click();
    await this.page.getByRole("grid").waitFor();
  }

  // Optional Ducker ID sign-in (only on a build with the flag on).
  signInButton(): Locator {
    return this.page.getByRole("button", { name: copy.accountSignIn, exact: true });
  }

  accountButton(): Locator {
    return this.page.getByRole("button", { name: copy.accountMenuLabel });
  }

  accountMenu(): Locator {
    return this.page.getByRole("menu");
  }

  profileLink(): Locator {
    return this.page.getByRole("menuitem", { name: copy.accountOpenProfile });
  }

  signOut(): Locator {
    return this.page.getByRole("menuitem", { name: copy.accountSignOut });
  }
}
