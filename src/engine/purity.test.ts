import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Enforces invariant 1 and ADR-0002/0003 by reading the source, because nothing
 * else can: an engine that quietly calls Math.random still passes every other
 * test — it just stops being reproducible.
 */
function engineSources(dir = 'src/engine'): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return engineSources(full)
    if (!full.endsWith('.ts') || full.endsWith('.test.ts')) return []
    return [full]
  })
}

/**
 * Comments are stripped first: a doc line that names the banned API is fine, a
 * call is not. Without this the ban cannot be documented where it applies.
 */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const FORBIDDEN: [label: string, pattern: RegExp][] = [
  ['Math.random', /Math\s*\.\s*random/],
  ['Date', /\bnew\s+Date\b|\bDate\s*\.\s*now\b/],
  ['window', /\bwindow\s*\./],
  ['document', /\bdocument\s*\./],
  ['react import', /from\s+['"]react['"]/],
  ['storage import', /from\s+['"].*storage/],
]

describe('engine purity', () => {
  it('has source files to check', () => {
    expect(engineSources().length).toBeGreaterThan(0)
  })

  it.each(FORBIDDEN)('never references %s', (_label, pattern) => {
    const offenders = engineSources().filter((file) => pattern.test(code(file)))
    expect(offenders).toEqual([])
  })
})
