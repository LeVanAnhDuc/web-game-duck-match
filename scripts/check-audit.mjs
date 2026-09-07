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
 * The endpoint times out intermittently from the network this project is developed
 * on, which is why the "no summary" branch below exists: a gate that cannot tell a
 * failed audit from a clean one is worse than no gate at all.
 */
const BLOCKING = new Set(['high', 'critical'])

/**
 * A failed audit and a clean audit look identical on stdout — both produce no
 * `auditAdvisory` lines. The version this was ported from treated that as a pass,
 * which is exactly the wrong way round: the audit endpoint times out from at least
 * one machine this project is developed on, and a gate that reports "clean" when it
 * checked nothing is worse than no gate. `auditSummary` is emitted on every
 * successful run, so its absence is the signal that nothing was audited.
 */

let raw = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) raw += chunk

const advisories = new Map()
let summary = null
for (const line of raw.split('\n')) {
  if (!line.trim()) continue
  let entry
  try {
    entry = JSON.parse(line)
  } catch {
    continue // yarn interleaves non-JSON lines into the same stream
  }
  if (entry.type === 'auditSummary') {
    summary = entry.data
    continue
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

if (!summary) {
  console.error('NFR-SEC-05 NOT CHECKED: yarn audit produced no summary.')
  console.error('')
  console.error('Either the audit failed (the registry endpoint times out from some')
  console.error('networks) or the output was not piped in. Treating that as a pass would')
  console.error('mean shipping an unchecked dependency tree while the log says "clean".')
  console.error('')
  console.error('  yarn audit --json | node scripts/check-audit.mjs')
  process.exit(1)
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
  const counts = summary.vulnerabilities ?? {}
  console.log(
    `NFR-SEC-05: no high or critical advisory. ` +
      `${summary.totalDependencies ?? '?'} dependencies audited, ` +
      `${all.length} advisory(ies) found ` +
      `(high ${counts.high ?? 0}, critical ${counts.critical ?? 0}).`,
  )
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
