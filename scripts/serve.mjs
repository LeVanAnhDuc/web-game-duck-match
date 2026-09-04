import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

/**
 * Serves ./out the way GitHub Pages will, for the e2e suite.
 *
 * `next start` cannot serve a static export, and `npx serve` has to be fetched from
 * the network on a cold machine — plus its `-s` flag rewrites every unknown path to
 * index.html, which silently answered /play/1/ with the level map and made four
 * tests fail for a reason that had nothing to do with the app. A twenty-line server
 * with no flags to get wrong is the safer dependency.
 *
 *   node scripts/serve.mjs 4173 out
 */
const PORT = Number(process.argv[2] ?? 4173)
const ROOT = resolve(process.argv[3] ?? 'out')

if (!existsSync(ROOT)) {
  console.error(`${ROOT} does not exist — run \`yarn build\` first.`)
  process.exit(1)
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  // Normalise first, then check the result is still inside ROOT: a test server
  // should not double as a way to read the rest of the repository.
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '')
  let file = join(ROOT, rel)
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('forbidden')
    return
  }

  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html')
  } catch {
    // `trailingSlash: true` means /play/1 also lives at /play/1/index.html
    try {
      statSync(join(file, 'index.html'))
      file = join(file, 'index.html')
    } catch {
      res.writeHead(404).end('not found')
      return
    }
  }

  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    // No caching: a rebuilt bundle between two runs must not be served stale.
    'cache-control': 'no-store',
  })
  createReadStream(file).pipe(res)
}).listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`serving ${ROOT} on http://127.0.0.1:${PORT}\n`)
})
