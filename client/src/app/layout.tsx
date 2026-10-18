import type { Metadata, Viewport } from 'next'
import { Baloo_2, Nunito } from 'next/font/google'
import './globals.css'

/**
 * Fonts are self-hosted at build time by `next/font`, not linked from
 * fonts.googleapis.com: the site is served from GitHub Pages and should not make a
 * third-party request to render its own text, and this removes the layout shift a
 * late-arriving font causes.
 *
 * `vietnamese` is not optional. The UI is Vietnamese, and without that subset the
 * U+1EA0–1EF9 block falls back glyph by glyph — "Lượt", "Điểm" and "Mục tiêu" would
 * each render in two faces. It is also why the heading font is Baloo 2 and not the
 * Fredoka the design system proposed: Google serves Fredoka without it (ADR-0008).
 */
const heading = Baloo_2({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const body = Nunito({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Duck Match',
  description: 'Duck Match - match-3 theo màn, chơi ngay trên trình duyệt.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
