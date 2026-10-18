import { expect, test, type Page } from '@playwright/test'

/**
 * Optional Ducker ID sign-in (ADR-0012) against the export built WITH the flag on
 * (`pnpm build:e2e-auth`). The issuer is a fake host: every request to it is
 * answered here, so nothing leaves the machine.
 */
const ISSUER = 'http://ducker.test'
const CORS = { 'access-control-allow-origin': '*' }

async function fakeIssuer(page: Page, opts: { deny?: boolean; tamper?: boolean } = {}) {
  const seen: string[] = []
  await page.route(`${ISSUER}/**`, async (route) => {
    const url = new URL(route.request().url())
    seen.push(url.pathname)
    if (url.pathname === '/oauth/authorize') {
      const back = new URL(url.searchParams.get('redirect_uri')!)
      if (opts.deny) {
        back.searchParams.set('error', 'access_denied')
      } else {
        back.searchParams.set('code', 'code-1')
      }
      back.searchParams.set(
        'state',
        opts.tamper ? 'tampered' : url.searchParams.get('state')!,
      )
      return route.fulfill({ status: 302, headers: { location: back.toString() } })
    }
    if (url.pathname === '/oauth/token') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: CORS,
        body: JSON.stringify({
          access_token: 'at-1',
          token_type: 'Bearer',
          expires_in: 900,
        }),
      })
    }
    if (url.pathname === '/oauth/userinfo') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: CORS,
        body: JSON.stringify({
          sub: 'u1',
          name: 'Lê Văn Anh Đức',
          email: 'duc@ducker.id',
        }),
      })
    }
    return route.fulfill({ status: 404 })
  })
  return seen
}

const signInButton = (page: Page) => page.getByRole('button', { name: 'Đăng nhập' })
const account = (page: Page) => page.getByRole('button', { name: 'Tài khoản Ducker ID' })

test('signs in, shows the name, keeps the URL clean, signs out', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await fakeIssuer(page)
  await page.goto('/')
  await signInButton(page).click()
  await expect(account(page)).toBeVisible()
  await expect.poll(() => new URL(page.url()).search).toBe('')

  await account(page).click()
  await expect(page.getByText('Lê Văn Anh Đức')).toBeVisible()
  await expect(page.getByText('duc@ducker.id')).toBeVisible()
  await expect(
    page.getByRole('menuitem', { name: 'Mở hồ sơ Ducker ID' }),
  ).toHaveAttribute('href', `${ISSUER}/profile`)
  await page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
  await expect(signInButton(page)).toBeVisible()
  await expect(signInButton(page)).toBeFocused()
  expect(errors.filter((text) => /hydrat/i.test(text))).toEqual([])
})

test('keeps the game URL params across the round trip', async ({ page }) => {
  await fakeIssuer(page)
  await page.goto('/?keep=1')
  await signInButton(page).click()
  await expect(account(page)).toBeVisible()
  await expect.poll(() => new URL(page.url()).search).toBe('?keep=1')
})

test('a reload is signed out again (nothing is persisted)', async ({ page }) => {
  await fakeIssuer(page)
  await page.goto('/')
  await signInButton(page).click()
  await expect(account(page)).toBeVisible()
  await page.reload()
  await expect(signInButton(page)).toBeVisible()
  await expect(account(page)).toHaveCount(0)
})

test('denying at Ducker ID lands signed out with a clean URL', async ({ page }) => {
  await fakeIssuer(page, { deny: true })
  await page.goto('/?keep=1')
  await signInButton(page).click()
  await expect(signInButton(page)).toBeVisible()
  await expect.poll(() => new URL(page.url()).search).toBe('?keep=1')
  await expect(account(page)).toHaveCount(0)
})

test('a tampered state never exchanges the code', async ({ page }) => {
  const seen = await fakeIssuer(page, { tamper: true })
  await page.goto('/')
  await signInButton(page).click()
  await expect(signInButton(page)).toBeVisible()
  await expect.poll(() => new URL(page.url()).search).toBe('')
  expect(seen).not.toContain('/oauth/token')
})

test('the sign-in button is 44px and clear of the header text at 375px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  const box = await signInButton(page).boundingBox()
  const text = await page
    .getByTestId('product-header')
    .locator('div.min-w-0')
    .boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(44)
  expect(box!.x).toBeGreaterThanOrEqual(text!.x + text!.width)
  expect(box!.x + box!.width).toBeLessThanOrEqual(375)
})

test('makes no request to the issuer before the player clicks', async ({ page }) => {
  const seen = await fakeIssuer(page)
  await page.goto('/')
  await expect(signInButton(page)).toBeVisible()
  expect(seen).toEqual([])
})

for (const width of [320, 375]) {
  test(`the open menu stays inside the viewport and does not move the header at ${width}px`, async ({
    page,
  }) => {
    await fakeIssuer(page)
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    const header = page.getByTestId('product-header')
    await signInButton(page).click()
    await expect(account(page)).toBeVisible()
    const before = await header.boundingBox()
    await account(page).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const box = (await menu.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(width)
    expect(box.y + box.height).toBeLessThanOrEqual(800)
    expect(await header.boundingBox()).toEqual(before)
    expect(await menu.evaluate((el) => getComputedStyle(el.parentElement!).position)).toBe(
      'absolute',
    )
  })
}
