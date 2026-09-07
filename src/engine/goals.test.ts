import { describe, expect, it } from 'vitest'
import { allDone, applyCleared, initProgress, starsFor } from './goals'
import {
  CASCADE_MULTIPLIERS,
  POINTS_PER_PIECE,
  SPECIAL_ACTIVATION_BONUS,
  cascadeMultiplier,
  scoreFor,
} from './scoring'
import type { GoalProgress, Piece } from './types'

let nextId = 1
const piece = (color: Piece['color'], special: Piece['special'] = 'none'): Piece => ({
  id: nextId++,
  color,
  special,
})

/** Narrowing helpers — a wrong goal kind should fail loudly, not silently pass. */
const scoreGoal = (progress: GoalProgress[], index = 0) => {
  const goal = progress[index]
  if (goal?.kind !== 'score') throw new Error(`goal ${index} is not a score goal`)
  return goal
}

const collectGoal = (progress: GoalProgress[], index = 0) => {
  const goal = progress[index]
  if (goal?.kind !== 'collect') throw new Error(`goal ${index} is not a collect goal`)
  return goal
}

describe('scoring', () => {
  it('keeps the design.md §4 constants', () => {
    expect(POINTS_PER_PIECE).toBe(60)
    expect(SPECIAL_ACTIVATION_BONUS).toBe(120)
    expect(CASCADE_MULTIPLIERS).toEqual([1, 2, 3, 4, 5])
  })

  it('multiplies by cascade level and caps at 5', () => {
    expect(cascadeMultiplier(1)).toBe(1)
    expect(cascadeMultiplier(4)).toBe(4)
    expect(cascadeMultiplier(9)).toBe(5)
  })

  it('maps every listed cascade level to its multiplier', () => {
    expect([1, 2, 3, 4, 5].map(cascadeMultiplier)).toEqual([1, 2, 3, 4, 5])
  })

  it('treats a level below one as level one instead of returning NaN', () => {
    expect(cascadeMultiplier(0)).toBe(1)
    expect(cascadeMultiplier(-3)).toBe(1)
  })

  it('adds a bonus per activation', () => {
    expect(scoreFor(3, 1, 0)).toBe(180)
    expect(scoreFor(3, 2, 1)).toBe(180 * 2 + 120)
  })

  it('scores an activation-only round and an empty round', () => {
    expect(scoreFor(0, 1, 2)).toBe(240)
    expect(scoreFor(0, 3, 0)).toBe(0)
  })

  it('caps the multiplier inside scoreFor too', () => {
    expect(scoreFor(2, 7, 0)).toBe(2 * 60 * 5)
  })
})

describe('goals', () => {
  it('tracks a score goal', () => {
    let p = initProgress([{ kind: 'score', target: 100 }])
    expect(allDone(p)).toBe(false)
    p = applyCleared(p, [], 100)
    expect(allDone(p)).toBe(true)
  })

  it('counts collected pieces per colour, including specials', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 2 } }])
    p = applyCleared(p, [piece('red'), { id: 2, color: 'red', special: 'stripedH' }], 0)
    expect(allDone(p)).toBe(true)
  })

  it('does not count colours the goal did not ask for', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 1 } }])
    p = applyCleared(p, [piece('blue'), piece('green')], 0)
    expect(allDone(p)).toBe(false)
  })

  it('needs every goal done when there are two', () => {
    let p = initProgress([
      { kind: 'score', target: 50 },
      { kind: 'collect', per: { red: 1 } },
    ])
    p = applyCleared(p, [], 50)
    expect(allDone(p)).toBe(false)
    p = applyCleared(p, [piece('red')], 50)
    expect(allDone(p)).toBe(true)
  })

  it('rates stars by threshold, and zero below the first', () => {
    expect(starsFor(10, [100, 200, 300])).toBe(0)
    expect(starsFor(100, [100, 200, 300])).toBe(1)
    expect(starsFor(250, [100, 200, 300])).toBe(2)
    expect(starsFor(999, [100, 200, 300])).toBe(3)
  })

  it('starts a score goal at zero and a collect goal at zero per colour', () => {
    const p = initProgress([
      { kind: 'score', target: 1500 },
      { kind: 'collect', per: { red: 8, blue: 4 } },
    ])
    expect(scoreGoal(p)).toEqual({ kind: 'score', current: 0, target: 1500, done: false })
    expect(collectGoal(p, 1)).toEqual({
      kind: 'collect',
      current: { red: 0, blue: 0 },
      per: { red: 8, blue: 4 },
      done: false,
    })
  })

  it('does not share the spec object with the progress it returns', () => {
    const per = { red: 3 }
    const p = initProgress([{ kind: 'collect', per }])
    expect(collectGoal(p).per).not.toBe(per)
  })

  it('has nothing to do with no goals', () => {
    expect(initProgress([])).toEqual([])
    // Vacuously true: a level with no goals is a config error levels.test.ts catches,
    // not something applySwap should hang on.
    expect(allDone([])).toBe(true)
  })

  it('takes the running total, so re-applying the same score does not double count', () => {
    let p = initProgress([{ kind: 'score', target: 300 }])
    p = applyCleared(p, [], 180)
    expect(scoreGoal(p).current).toBe(180)
    p = applyCleared(p, [], 180)
    expect(scoreGoal(p).current).toBe(180)
    expect(allDone(p)).toBe(false)
    p = applyCleared(p, [], 300)
    expect(scoreGoal(p).done).toBe(true)
  })

  it('leaves a score goal untouched by cleared pieces', () => {
    let p = initProgress([{ kind: 'score', target: 60 }])
    p = applyCleared(p, [piece('red'), piece('blue')], 0)
    expect(scoreGoal(p)).toMatchObject({ current: 0, done: false })
  })

  it('accumulates a collect goal across rounds', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 3 } }])
    p = applyCleared(p, [piece('red')], 0)
    expect(collectGoal(p).current.red).toBe(1)
    p = applyCleared(p, [piece('red'), piece('red')], 0)
    expect(collectGoal(p).current.red).toBe(3)
    expect(collectGoal(p).done).toBe(true)
  })

  it('needs every requested colour, not just one of them', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 2, yellow: 1 } }])
    p = applyCleared(p, [piece('red'), piece('red')], 0)
    expect(collectGoal(p).done).toBe(false)
    p = applyCleared(p, [piece('yellow')], 0)
    expect(collectGoal(p).done).toBe(true)
  })

  it('caps a colour at its target and stays done afterwards', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 2 } }])
    p = applyCleared(p, [piece('red'), piece('red'), piece('red'), piece('red')], 0)
    expect(collectGoal(p).current.red).toBe(2)
    expect(collectGoal(p).done).toBe(true)
    p = applyCleared(p, [piece('red')], 0)
    expect(collectGoal(p).current.red).toBe(2)
    expect(collectGoal(p).done).toBe(true)
  })

  it('counts every special kind, since a special keeps its colour', () => {
    let p = initProgress([{ kind: 'collect', per: { purple: 4 } }])
    p = applyCleared(
      p,
      [
        piece('purple', 'stripedH'),
        piece('purple', 'stripedV'),
        piece('purple', 'wrapped'),
        piece('purple', 'colorBomb'),
      ],
      0,
    )
    expect(collectGoal(p).done).toBe(true)
  })

  it('ignores unrequested colours while counting requested ones in the same batch', () => {
    let p = initProgress([{ kind: 'collect', per: { green: 2 } }])
    p = applyCleared(p, [piece('green'), piece('orange'), piece('green')], 0)
    expect(collectGoal(p).current).toEqual({ green: 2 })
  })

  it('is pure — the progress it was given is unchanged', () => {
    const p = initProgress([
      { kind: 'score', target: 500 },
      { kind: 'collect', per: { red: 2 } },
    ])
    const before = JSON.stringify(p)
    const next = applyCleared(p, [piece('red'), piece('red')], 500)
    expect(JSON.stringify(p)).toBe(before)
    expect(next).not.toBe(p)
    expect(next[0]).not.toBe(p[0])
    expect(collectGoal(next, 1).current).not.toBe(collectGoal(p, 1).current)
  })

  it('reports done only when the last goal is too', () => {
    const p = initProgress([
      { kind: 'score', target: 10 },
      { kind: 'collect', per: { blue: 1 } },
    ])
    expect(allDone(applyCleared(p, [piece('blue')], 5))).toBe(false)
    expect(allDone(applyCleared(p, [piece('blue')], 10))).toBe(true)
  })

  it('rates stars exactly at each threshold', () => {
    expect(starsFor(1499, [1500, 2200, 3000])).toBe(0)
    expect(starsFor(2200, [1500, 2200, 3000])).toBe(2)
    expect(starsFor(2999, [1500, 2200, 3000])).toBe(2)
    expect(starsFor(3000, [1500, 2200, 3000])).toBe(3)
    expect(starsFor(0, [1500, 2200, 3000])).toBe(0)
  })
})
