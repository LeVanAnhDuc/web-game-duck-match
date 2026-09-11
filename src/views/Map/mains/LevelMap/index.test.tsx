import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LEVELS } from '@/levels/levels'
import { EMPTY_PROGRESS } from '@/storage/local'
import { formatScore, t } from '@/i18n/vi'
import { LevelMap } from './index'

describe('LevelMap', () => {
  it('shows every level', () => {
    render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    for (const level of LEVELS) {
      expect(screen.getByText(t.levelLabel(level.id))).toBeTruthy()
    }
  })

  it('links only the unlocked levels', () => {
    render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    // next/link normalises the trailing slash away in this environment; the built
    // site serves /play/1/ because of next.config trailingSlash.
    expect(links[0]?.getAttribute('href')).toMatch(/^\/play\/1\/?$/)
  })

  it('marks locked levels as disabled rather than as dead links', () => {
    const { container } = render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    expect(container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(5)
  })

  it('says a locked level is locked', () => {
    render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    expect(screen.getAllByText(t.locked)).toHaveLength(5)
  })

  it('says an unlocked level has no progress yet', () => {
    render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    expect(screen.getByText(t.noProgressYet)).toBeTruthy()
  })

  it('shows the best score and stars for a finished level', () => {
    const progress = {
      version: 1 as const,
      levels: { 1: { stars: 2 as const, bestScore: 2340 } },
      unlockedUpTo: 2,
    }
    render(<LevelMap progress={progress} levels={LEVELS} />)
    expect(screen.getByText(`${t.bestScore}: ${formatScore(2340)}`)).toBeTruthy()
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByLabelText(t.starsEarned(2, 3))).toBeTruthy()
  })

  it('unlocks everything when progress says so', () => {
    const progress = { version: 1 as const, levels: {}, unlockedUpTo: 6 }
    render(<LevelMap progress={progress} levels={LEVELS} />)
    expect(screen.getAllByRole('link')).toHaveLength(6)
    expect(screen.queryByText(t.locked)).toBeNull()
  })

  it('renders the map heading', () => {
    render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    expect(screen.getByRole('heading', { name: t.levelMapTitle })).toBeTruthy()
  })
})
