import { readFileSync } from 'node:fs'

/**
 * Enforces NFR-SEC-05 — "no vulnerability at high or above" — exactly as written.
 *
 *   pnpm audit --json | node scripts/check-audit.mjs
 *
 * `pnpm audit` cannot express that threshold on its own: `--audit-level=high` exits
 * non-zero on high and above but says nothing about the advisories BELOW the line,
 * and a bare `pnpm audit` fails on any severity at all. Gating on either is stricter
 * or blinder than the threshold anyone agreed to, and a gate nobody agreed to is a
 * gate people start skipping.
 *
 * The second job of this file is refusing to report a pass it cannot justify. That
 * is not hypothetical: under yarn 1 the audit endpoint timed out from the machine
 * this project is developed on, and a gate that reports "clean" when it checked
 * nothing is worse than no gate, because people trust it. `pnpm audit` queries the
 * npm advisory database and actually answers, so the gate can now genuinely go red —
 * but every sanity check below stays, because that failure mode is a silent one.
 *
 * Shape note: pnpm emits ONE JSON object in the npm v6 audit shape, not yarn 1's
 * stream of newline-delimited events. It also files every package under
 * `dependencies` and leaves `devDependencies` at 0, so the "did it really look at
 * the tree" check counts `totalDependencies` and never the dev split.
 */
const BLOCKING = new Set(['high', 'critical'])

let raw = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) raw += chunk

let report
try {
  report = JSON.parse(raw)
} catch {
  console.error('NFR-SEC-05 NOT CHECKED: `pnpm audit --json` produced no JSON.')
  console.error('')
  console.error('Either the audit failed or nothing was piped in. Treating that as a')
  console.error('pass would mean shipping an unchecked dependency tree while the log')
  console.error('says "clean".')
  console.error('')
  console.error('  pnpm audit --json | node scripts/check-audit.mjs')
  console.error('')
  console.error('What arrived on stdin, first 400 characters:')
  console.error(raw.slice(0, 400) || '  (nothing at all)')
  process.exit(1)
}

const metadata = report.metadata ?? null
const counts = metadata?.vulnerabilities ?? {}
// Already keyed by advisory id: the same advisory is reported once per dependency
// path, and a count that grows with the shape of the tree tells nobody anything.
const advisories = Object.values(report.advisories ?? {}).map((advisory) => ({
  severity: advisory.severity,
  module: advisory.module_name,
  vulnerable: advisory.vulnerable_versions,
  patched: advisory.patched_versions,
  title: advisory.title,
  path: advisory.findings?.[0]?.paths?.[0] ?? '',
}))

const blocking = advisories.filter((advisory) => BLOCKING.has(advisory.severity))
const rest = advisories.filter((advisory) => !BLOCKING.has(advisory.severity))

// Sanity checks BEFORE anything is reported. "No advisories" is evidence of a clean
// tree only if the audit actually looked at the tree.
const scanned = metadata?.totalDependencies ?? metadata?.dependencies ?? 0
const declared = Object.keys(
  JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    .devDependencies ?? {},
).length

const reasons = []
if (!metadata) reasons.push('the report carried no `metadata` block at all')
if (scanned === 0) reasons.push('the report counted 0 dependencies scanned')
if (declared > 0 && scanned < declared) {
  reasons.push(
    `only ${scanned} dependencies were scanned while package.json alone declares ${declared} devDependencies`,
  )
}
// The two halves of the report have to agree. A severity count with no advisory
// behind it means one of them is lying, and a gate cannot pick which.
const countedBlocking = [...BLOCKING].reduce(
  (n, severity) => n + (counts[severity] ?? 0),
  0,
)
if (countedBlocking > 0 && blocking.length === 0) {
  reasons.push(
    `metadata counts ${countedBlocking} high/critical vulnerability(ies) but no advisory was listed`,
  )
}

if (reasons.length > 0) {
  console.error('NFR-SEC-05 NOT CHECKED: the audit did not really run.')
  console.error('')
  for (const reason of reasons) console.error(`  - ${reason}`)
  console.error('')
  console.error('Treat this as UNKNOWN, not clean.')
  process.exit(1)
}

if (rest.length > 0) {
  console.log(`${rest.length} advisory(ies) below high, not blocking:`)
  for (const advisory of rest) {
    console.log(`  ${advisory.severity.padEnd(8)} ${advisory.module}  ${advisory.title}`)
  }
  console.log('')
}

if (blocking.length === 0) {
  console.log(
    `NFR-SEC-05: no high or critical advisory. ` +
      `${scanned} dependencies audited, ` +
      `${advisories.length} advisory(ies) found ` +
      `(high ${counts.high ?? 0}, critical ${counts.critical ?? 0}).`,
  )
  process.exit(0)
}

console.error(`NFR-SEC-05 violated: ${blocking.length} advisory(ies) at high or above\n`)
for (const advisory of blocking) {
  console.error(
    `  ${advisory.severity.toUpperCase()}  ${advisory.module} ${advisory.vulnerable}`,
  )
  console.error(`    ${advisory.title}`)
  console.error(`    via ${advisory.path}`)
  console.error(`    fixed in ${advisory.patched}\n`)
}
console.error(
  'Fix it, or pin the patched range through `pnpm.overrides` in package.json.',
)
process.exit(1)
