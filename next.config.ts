import type { NextConfig } from 'next'

/**
 * Static export: the whole game runs in the browser, there is no server side
 * (ADR-0004). `out/` is the deployable artifact.
 *
 * GitHub Pages serves this repository from `/web-game-duck-match`, not from the root,
 * so `basePath` has to be on there and off everywhere else. `GITHUB_PAGES` is set
 * by the deploy workflow and nowhere else — deriving it from `NODE_ENV` would be
 * wrong, because `next build` is a production build on a laptop too, and then every
 * asset path in a local `out/` would point at a directory that does not exist
 * (ADR-0006).
 */
const isGithubPages = process.env.GITHUB_PAGES === 'true'
const basePath = '/web-game-duck-match'

const config: NextConfig = {
  output: 'export',
  basePath: isGithubPages ? basePath : undefined,
  assetPrefix: isGithubPages ? basePath : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
}

export default config
