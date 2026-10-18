import { MapPage } from "@/pages/map.page";
import { PlayPage } from "@/pages/play.page";
import { test as core } from "./core.fixture";

// One fixture per page object, named like the class in camelCase. The game has two screens: the level map and the
// play screen (which carries its result and restart dialogs as properties).
export const test = core.extend<{ mapPage: MapPage; playPage: PlayPage }>({
  mapPage: async ({ page }, use) => use(new MapPage(page)),
  playPage: async ({ page }, use) => use(new PlayPage(page)),
});
