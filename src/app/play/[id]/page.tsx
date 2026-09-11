import { LEVELS } from '@/levels/levels'
import { Play } from '@/views/Play'

/**
 * `output: 'export'` builds only the ids listed here, which is also the guard that
 * makes an unreachable level impossible: a route that does not exist cannot be
 * typed into the address bar (ADR-0004).
 */
export function generateStaticParams() {
  return LEVELS.map((level) => ({ id: String(level.id) }))
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Play levelId={Number(id)} />
}
