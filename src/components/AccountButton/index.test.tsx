import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ value: {} as Record<string, unknown> }))
vi.mock('@/hooks/useDuckerAuth', () => ({ useDuckerAuth: () => auth.value }))

import { AccountButton } from './index'

const base = {
  enabled: true,
  profileUrl: 'http://localhost:3000/profile',
  signIn: vi.fn(),
  signOut: vi.fn(),
}
const signedIn = {
  ...base,
  status: 'signed-in',
  profile: { sub: 'u1', name: 'Lê Văn Anh Đức', email: 'duc@ducker.id' },
}

describe('AccountButton', () => {
  beforeEach(() => {
    base.signIn.mockClear()
    base.signOut.mockClear()
  })

  it('renders nothing when the feature is disabled', () => {
    auth.value = { ...base, enabled: false, status: 'idle', profile: null }
    const { container } = render(<AccountButton />)
    expect(container.innerHTML).toBe('')
  })

  it('shows the sign-in button while idle, so server and first client render agree', () => {
    auth.value = { ...base, status: 'idle', profile: null }
    render(<AccountButton />)
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeTruthy()
  })

  it('shows the sign-in button when signed out and starts login on click', () => {
    auth.value = { ...base, status: 'signed-out', profile: null }
    render(<AccountButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))
    expect(base.signIn).toHaveBeenCalledOnce()
  })

  it('disables the button while signing in', () => {
    auth.value = { ...base, status: 'loading', profile: null }
    render(<AccountButton />)
    const button = screen.getByRole('button', { name: 'Đang đăng nhập…' })
    expect((button as HTMLButtonElement).disabled).toBe(true)
  })

  it('opens the account menu with profile link and sign out; Esc closes and refocuses', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const trigger = screen.getByRole('button', { name: 'Tài khoản Ducker ID' })
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Lê Văn Anh Đức')).toBeTruthy()
    expect(screen.getByText('duc@ducker.id')).toBeTruthy()
    const link = screen.getByRole('menuitem', { name: 'Mở hồ sơ Ducker ID' })
    expect(link.getAttribute('href')).toBe('http://localhost:3000/profile')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Đăng xuất' }))
    expect(base.signOut).toHaveBeenCalledOnce()
  })

  it('moves focus with the arrow keys, wrapping, and Home / End', () => {
    auth.value = signedIn
    render(<AccountButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Tài khoản Ducker ID' }))
    const items = screen.getAllByRole('menuitem')
    expect(items).toHaveLength(2)
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(document.activeElement!, { key: 'End' })
    expect(document.activeElement).toBe(items[1])
  })

  it('closes on Tab without pulling focus back to the trigger', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const trigger = screen.getByRole('button', { name: 'Tài khoản Ducker ID' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).not.toBe(trigger)
  })

  it('closes when focus leaves to an element outside the menu and trigger', () => {
    auth.value = signedIn
    render(
      <>
        <AccountButton />
        <button type="button">elsewhere</button>
      </>,
    )
    const trigger = screen.getByRole('button', { name: 'Tài khoản Ducker ID' })
    fireEvent.click(trigger)
    const items = screen.getAllByRole('menuitem')
    fireEvent.focusOut(items[0]!, { relatedTarget: screen.getByText('elsewhere') })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('stays open on a focusout with no relatedTarget (Safari does not focus buttons on click)', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const trigger = screen.getByRole('button', { name: 'Tài khoản Ducker ID' })
    fireEvent.click(trigger)
    fireEvent.focusOut(screen.getAllByRole('menuitem')[0]!, { relatedTarget: null })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('closes on a pointerdown outside', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const trigger = screen.getByRole('button', { name: 'Tài khoản Ducker ID' })
    fireEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('shows no email line when the profile has none', () => {
    auth.value = { ...signedIn, profile: { sub: 'u1', name: 'Đức' } }
    render(<AccountButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Tài khoản Ducker ID' }))
    expect(screen.getByText('Đức')).toBeTruthy()
    expect(screen.queryByText(/@/)).toBeNull()
  })

  it('uses the email as the main line when there is no name', () => {
    auth.value = { ...signedIn, profile: { sub: 'u1', email: 'duc@ducker.id' } }
    render(<AccountButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Tài khoản Ducker ID' }))
    expect(screen.getAllByText('duc@ducker.id')).toHaveLength(1)
  })

  it('puts focus on the sign-in button after signing out from the menu', () => {
    auth.value = signedIn
    const { rerender } = render(<AccountButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Tài khoản Ducker ID' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Đăng xuất' }))
    auth.value = { ...base, status: 'signed-out', profile: null }
    rerender(<AccountButton />)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Đăng nhập' }))
  })
})
