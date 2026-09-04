import type { NextConfig } from 'next'

/**
 * Static export: the whole game runs in the browser, there is no server side
 * (ADR-0004). `out/` is the deployable artifact.
 */
const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}

export default config
