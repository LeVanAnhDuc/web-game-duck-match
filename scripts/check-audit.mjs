/**
 * Enforces NFR-SEC-05 — "no vulnerability at high or above" — exactly as written.
 *
 * `yarn audit` cannot express that on its own: yarn 1 exits with a bitmask covering
 * EVERY severity it found, so a single moderate advisory fails the build too. Gating
 * on that is stricter than the threshold anyone agreed to, and a gate nobody agreed
 * to is a gate people start skipping.
 *
 *   yarn audit --json | node scripts/check-audit.mjs
 *
 * This is the reason the threshold can finally be checked at all: the audit endpoint
 * times out from the machine this project was built on, so CI is the first place it
 * has ever run.
 */
const BLOCKING = new Set(['high', 'critical'])

let raw = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) raw += chunk

const advisories = new Map()
for (const line of raw.split('\n')) {
  if (!line.trim()) continue
  let entry
  try {
    entry = JSON.parse(line)
  } catch {
    continue // yarn interleaves non-JSON lines into the same stream
  }
  if (entry.type !== 'auditAdvisory') continue
  const advisory = entry.data.advisory
  // Keyed by id: the same advisory is reported once per dependency path, and a
  // count that grows with the shape of the tree tells nobody anything.
  advisories.set(advisory.id, {
    severity: advisory.severity,
    module: advisory.module_name,
    vulnerable: advisory.vulnerable_versions,
    patched: advisory.patched_versions,
    title: advisory.title,
    path: entry.data.resolution?.path ?? '',
  })
}

const all = [...advisories.values()]
const blocking = all.filter((advisory) => BLOCKING.has(advisory.severity))
const rest = all.filter((advisory) => !BLOCKING.has(advisory.severity))

if (rest.length > 0) {
  console.log(`${rest.length} advisory(ies) below high, not blocking:`)
  for (const advisory of rest) {
    console.log(`  ${advisory.severity.padEnd(8)} ${advisory.module}  ${advisory.title}`)
  }
  console.log('')
}

if (blocking.length === 0) {
  console.log(`NFR-SEC-05: no high or critical advisory (${all.length} total).`)
  process.exit(0)
}

console.error(`NFR-SEC-05 violated: ${blocking.length} advisory(ies) at high or above\n`)
for (const advisory of blocking) {
  console.error(`  ${advisory.severity.toUpperCase()}  ${advisory.module} ${advisory.vulnerable}`)
  console.error(`    ${advisory.title}`)
  console.error(`    via ${advisory.path}`)
  console.error(`    fixed in ${advisory.patched}\n`)
}
console.error('Fix it, or pin the patched range with a resolutions entry in package.json.')
process.exit(1)
