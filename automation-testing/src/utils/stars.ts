// Star arithmetic from a level's three thresholds (docs FR-05, ux-remediation F-04): a star per threshold reached, and
// the points still missing for the next one (null at three stars).

export function starsFor(score: number, thresholds: readonly number[]): number {
  return thresholds.filter((threshold) => score >= threshold).length;
}

export function gapToNextStar(score: number, thresholds: readonly number[]): number | null {
  const next = thresholds.find((threshold) => score < threshold);
  return next === undefined ? null : next - score;
}
