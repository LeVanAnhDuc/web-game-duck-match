'use client'

import { useEffect, useRef } from 'react'
import { useAccountMenu, useDuckerAuth } from '@/hooks'
import { initialOf } from '@/lib/initials'
import { t } from '@/i18n/vi'

/**
 * Optional Ducker ID sign-in (ADR-0012), claymorphism per MASTER.md: raised clay
 * button, pink avatar (pink is the interactive/focus colour; amber stays reserved
 * for stars and CTAs). Renders NOTHING when the feature is off, so the slot is
 * byte-identical to the build before it existed.
 *
 * `idle` (the server snapshot) draws the same button as `signed-out`: the first
 * client render must match the static HTML, and the module-level capture has
 * usually already decided by the time React hydrates.
 */
export function AccountButton() {
  const auth = useDuckerAuth()
  const menu = useAccountMenu()
  const signInRef = useRef<HTMLButtonElement>(null)
  const refocusSignIn = useRef(false)

  // After "Đăng xuất" the trigger unmounts — hand focus to the button that takes
  // its place instead of letting it fall to <body>.
  useEffect(() => {
    if (auth.status === 'signed-out' && refocusSignIn.current) {
      refocusSignIn.current = false
      signInRef.current?.focus()
    }
  }, [auth.status])

  if (!auth.enabled) return null

  if (auth.status !== 'signed-in' || !auth.profile) {
    const loading = auth.status === 'loading'
    return (
      <button
        ref={signInRef}
        type="button"
        onClick={auth.signIn}
        disabled={loading}
        aria-busy={loading}
        className="ml-auto inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-clay bg-surface-raised px-4 text-sm font-semibold text-ink-strong shadow-clay transition-transform duration-200 ease-press active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
        <span>{loading ? t.accountSigningIn : t.accountSignIn}</span>
      </button>
    )
  }

  const { profile } = auth
  const primary = profile.name?.trim() || profile.email?.trim() || ''
  const secondary = profile.name?.trim() && profile.email?.trim() ? profile.email.trim() : ''
  const itemClass =
    'flex min-h-[44px] w-full cursor-pointer items-center rounded-xl bg-surface-raised px-4 text-left text-sm font-semibold text-ink-strong'

  return (
    <div className="relative ml-auto shrink-0">
      <button
        ref={menu.triggerRef}
        type="button"
        onClick={menu.toggle}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-label={t.accountMenuLabel}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface-raised shadow-clay transition-transform duration-200 ease-press active:translate-y-px"
      >
        {profile.picture ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export, `images.unoptimized`; the URL is the IdP's
          <img
            src={profile.picture}
            alt=""
            width={36}
            height={36}
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-pink font-heading text-lg font-bold text-surface-base"
          >
            {initialOf(profile)}
          </span>
        )}
      </button>
      {menu.open && (
        <div
          ref={menu.menuRef}
          className="absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-clay bg-surface-card p-3 shadow-clay"
        >
          <div className="px-1 pb-3">
            {primary && (
              <p className="truncate text-sm font-bold text-ink-strong" title={primary}>
                {primary}
              </p>
            )}
            {secondary && (
              <p className="truncate text-xs text-ink-muted" title={secondary}>
                {secondary}
              </p>
            )}
          </div>
          <div role="menu" aria-label={t.accountMenuLabel} className="flex flex-col gap-2">
            <a
              role="menuitem"
              href={auth.profileUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => menu.close(false)}
              className={itemClass}
            >
              {t.accountOpenProfile}
            </a>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                menu.close(false)
                refocusSignIn.current = true
                auth.signOut()
              }}
              className={itemClass}
            >
              {t.accountSignOut}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
