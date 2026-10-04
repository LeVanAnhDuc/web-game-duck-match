import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exchangeCode, fetchProfile } from './duckerRequests'

const config = {
  issuer: 'http://localhost:3000',
  clientId: 'game-client',
  scope: 'openid profile email',
  profileUrl: 'http://localhost:3000/profile',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

describe('duckerRequests', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('posts the code exchange as a public client with a timeout signal', async () => {
    fetchMock.mockResolvedValue(json({ access_token: 'at-1' }))
    await expect(exchangeCode(config, 'code-1', 'verifier-1')).resolves.toEqual({
      accessToken: 'at-1',
    })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe('http://localhost:3000/oauth/token')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const body = init.body as URLSearchParams
    expect(Object.fromEntries(body)).toEqual({
      grant_type: 'authorization_code',
      code: 'code-1',
      code_verifier: 'verifier-1',
      redirect_uri: new URL('/', window.location.origin).toString(),
      client_id: 'game-client',
    })
    expect(body.has('client_secret')).toBe(false)
  })

  it('throws on a non-ok token response', async () => {
    fetchMock.mockResolvedValue(json({}, 400))
    await expect(exchangeCode(config, 'c', 'v')).rejects.toThrow('token_exchange_failed_400')
  })

  it('throws when a 200 response has no string access_token', async () => {
    fetchMock.mockResolvedValue(json({ token_type: 'Bearer' }))
    await expect(exchangeCode(config, 'c', 'v')).rejects.toThrow()
    fetchMock.mockResolvedValue(json({ access_token: 42 }))
    await expect(exchangeCode(config, 'c', 'v')).rejects.toThrow()
  })

  it('sends the bearer token to userinfo with a timeout signal', async () => {
    fetchMock.mockResolvedValue(json({ sub: 'u1', name: 'Đức' }))
    await expect(fetchProfile(config, 'at-1')).resolves.toEqual({ sub: 'u1', name: 'Đức' })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe('http://localhost:3000/oauth/userinfo')
    expect(init.headers).toEqual({ Authorization: 'Bearer at-1' })
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('throws on a non-ok userinfo response', async () => {
    fetchMock.mockResolvedValue(json({}, 401))
    await expect(fetchProfile(config, 'at')).rejects.toThrow('userinfo_failed_401')
  })
})
