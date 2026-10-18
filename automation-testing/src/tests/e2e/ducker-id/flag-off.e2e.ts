import { expect, test } from '@/fixtures'

/**
 * The deployed build ships with Ducker ID sign-in off (ADR-0012): no button, no
 * request to anything but the page's own origin. Runs against the normal `out/`.
 */
test('the default build has no sign-in and makes no outside request', async ({
  page,
  urls,
}) => {
  const outside: string[] = []
  const own = new URL(urls.webUrl).host
  page.on('request', (request) => {
    const { protocol, host } = new URL(request.url())
    if (protocol.startsWith('http') && host !== own)
      outside.push(request.url())
  })
  await page.goto('./')
  await expect(page.getByTestId('product-header')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Tài khoản Ducker ID' })).toHaveCount(0)
  expect(outside).toEqual([])
})
