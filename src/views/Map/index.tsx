'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Progress } from '@/engine'
import { t } from '@/i18n/vi'
import { LEVELS } from '@/levels/levels'
import { createLocalRepository } from '@/storage/local'
import { LevelMap } from './mains/LevelMap'
import { ProductHeader } from './components/ProductHeader'

/**
 * Loads progress and hands it to the map.
 *
 * The repository is async on purpose even though localStorage is not (ADR-0001),
 * so this screen has a loading branch from day one and gaining a backend later
 * does not mean inventing one. It also cannot read storage during the static
 * export, which is the other reason the read happens in an effect.
 */
export function Map() {
  const repository = useMemo(() => createLocalRepository(), [])
  const [progress, setProgress] = useState<Progress | null>(null)

  useEffect(() => {
    let cancelled = false
    void repository.load().then((loaded) => {
      // A corrupt or foreign-version save resolves to the empty progress rather
      // than rejecting, so there is no error branch to render here (NFR-REL-03).
      if (!cancelled) setProgress(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  if (!progress) {
    return (
      <main>
        <ProductHeader />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold text-ink-strong">{t.levelMapTitle}</h1>
          <p className="text-ink-muted">{t.loading}</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      {/* Above the list, not in front of it: the map is still the first thing a
          player can act on, one tap from level 1 (RR-01). */}
      <ProductHeader />
      <LevelMap progress={progress} levels={LEVELS} />
    </main>
  )
}
