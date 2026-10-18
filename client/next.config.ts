import type { NextConfig } from 'next'

/**
 * Static export: the whole game runs in the browser, there is no server side
 * (ADR-0004). `out/` is the deployable artifact.
 *
 * GitHub Pages serves this repository from `/web-game-duck-match`, not from the root,
 * so `basePath` has to be on there and off everywhere else. `NEXT_PUBLIC_BASE_PATH`
 * is set by the deploy workflow (and by the e2e build for the same reason the
 * deployed one is: it is the value the OAuth redirect URI is built from) — deriving
 * it from `NODE_ENV` would be wrong, because `next build` is a production build on a
 * laptop too, and then every asset path in a local `out/` would point at a directory
 * that does not exist (ADR-0006). Unset or empty means the site root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined

const config: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  trailingSlash: true,
}

export default config
