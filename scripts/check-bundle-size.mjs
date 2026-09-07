import { gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Enforces NFR-PERF-07 (first-load JS under 200 kB gzipped) in CI.
 *
 * The measurement comes from the EXPORTED HTML, never from scraping `next build`'s
 * printed table: whatever `out/index.html` references is by definition what a
 * browser fetches on a first load. A guard built on Next's output format breaks on
 * a Next release; this one breaks on a regression.
 *
 * Summing every file under _next/static/chunks would be the easy version and it is
 * wrong — it counts `polyfills` (served only to browsers that ask) and every other
 * route's chunk, which reads far above a real first load.
 *
 *   node scripts/check-bundle-size.mjs out            # the level map
 *   node scripts/check-bundle-size.mjs out play/1/index.html
 */
const LIMIT_KB = Number(process.env.BUNDLE_LIMIT_KB ?? 200)
const root = resolve(process.argv[2] ?? 'out')
const page = process.argv[3] ?? 'index.html'

let html
try {
  html = readFileSync(join(root, page), 'utf8')
} catch {
  console.error(`cannot read ${join(root, page)} — run \`yarn build\` first`)
  process.exit(1)
}

// <script src="/_next/..."> and <link rel="preload" as="script" href="/_next/...">
const refs = new Set()
for (const [, url] of html.matchAll(/(?:src|href)="((?:\/[^"]*)?\/_next\/[^"]+\.js)"/g)) {
  refs.add(url)
}
// The App Router also lists chunks inside the inlined flight payload.
for (const [, url] of html.matchAll(/\\?"((?:\/[^"\\]*)?\/_next\/static\/chunks\/[^"\\]+\.js)\\?"/g)) {
  refs.add(url)
}

if (refs.size === 0) {
  console.error('found no script references in the exported HTML — check the regexes')
  process.exit(1)
}

let total = 0
let legacy = 0
const rows = []
for (const url of refs) {
  // With basePath on (the Pages build) every URL is prefixed with the repo name,
  // which is not a directory inside out/. Strip anything before /_next/.
  //
  // And decode: a dynamic route's chunk is referenced as `app/play/%5Bid%5D/page-…`
  // because `[id]` is a real directory name on disk. Joining the encoded form looks
  // for a directory called `%5Bid%5D` and reports the file as missing.
  const relative = decodeURIComponent(url.slice(url.indexOf('/_next/')).replace(/^\//, ''))
  const file = join(root, relative)
  let bytes
  try {
    bytes = readFileSync(file)
  } catch {
    console.error(`referenced but missing: ${url}`)
    process.exit(1)
  }
  const gz = gzipSync(bytes).length
  // polyfills-*.js goes only to browsers that ask for it, and Next leaves it out of
  // the "First Load JS" figure NFR-PERF-07's 200 kB was written against. Measured
  // and printed anyway, so it cannot grow unnoticed.
  const isLegacy = /\/polyfills-[^/]*\.js$/.test(url)
  if (isLegacy) legacy += gz
  else total += gz
  rows.push({ url, gz, isLegacy })
}

rows.sort((a, b) => b.gz - a.gz)
for (const row of rows) {
  const tag = row.isLegacy ? '   (legacy browsers only)' : ''
  console.log(`  ${(row.gz / 1024).toFixed(1).padStart(7)} kB gz  ${row.url}${tag}`)
}

const totalKb = total / 1024
const legacyKb = legacy / 1024
console.log(
  `\nfirst load: ${totalKb.toFixed(1)} kB gzipped / ${LIMIT_KB} kB (NFR-PERF-07)` +
    `\nplus ${legacyKb.toFixed(1)} kB of polyfills for browsers that ask for them` +
    ` — ${(totalKb + legacyKb).toFixed(1)} kB worst case`,
)

if (totalKb > LIMIT_KB) {
  console.error(`\nover budget by ${(totalKb - LIMIT_KB).toFixed(1)} kB`)
  process.exit(1)
}
