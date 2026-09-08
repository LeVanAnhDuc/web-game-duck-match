// Lai game vao khung hinh dung de chup anh README.
// Chay boi web-game/.claude/skills/readme-game/scripts/capture-screenshots.mjs.
// Khong co file nay thi anh chup ra "Ban do man" - 6 the level, 5 cai con khoa.
//
// Hop dong: export default async (page) => {...}. Viewport la 1280x720.

export default async function setup(page) {
  await page.getByText('Màn 1', { exact: false }).first().click();
  // Doi luoi roi xuong va cascade dau tien lang xuong truoc khi chup.
  await page.waitForTimeout(1200);
}
