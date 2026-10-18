/**
 * happy-dom does not implement matchMedia. `game/` reads it to honour
 * prefers-reduced-motion (NFR-A11Y-05), so give it a stub that reports
 * "no preference" — the branch that actually animates.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}
