import { useCallback, useEffect, useRef, useState } from 'react'

/** Behaviour of the account popover. Styling lives in the component. */
export function useAccountMenu() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback((refocus: boolean) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const items = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
    const inside = (node: Node | null) =>
      !!node && (!!menuRef.current?.contains(node) || !!triggerRef.current?.contains(node))

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return close(true)
      // Tab moves on to whatever is next; focus must not be pulled back.
      if (event.key === 'Tab') return close(false)
      const list = items()
      if (list.length === 0) return
      const current = list.indexOf(document.activeElement as HTMLElement)
      let next: number | null = null
      if (event.key === 'ArrowDown') next = (current + 1) % list.length
      else if (event.key === 'ArrowUp') next = (current - 1 + list.length) % list.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = list.length - 1
      if (next === null) return
      event.preventDefault()
      list[next]?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!inside(event.target as Node)) close(false)
    }
    // Only a REAL destination outside counts. Safari does not focus a button on
    // click, so a null relatedTarget is a click, not a departure — pointerdown
    // already covers outside clicks.
    const onFocusOut = (event: FocusEvent) => {
      const target = event.relatedTarget as Node | null
      if (target && !inside(target)) close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('focusout', onFocusOut)
    items()[0]?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [open, close])

  return { open, toggle: () => setOpen((value) => !value), close, triggerRef, menuRef }
}
