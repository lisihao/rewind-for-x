// Phone layout of x.com: a tab bar along the bottom and a compose button
// above it, a touch screen 390px wide.
//   node test/mobile.mjs   (needs Playwright with Chromium)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)('playwright');
const ext = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.env.SHOTS || path.join(ext, 'test', 'out');

const pic = (c) =>
  'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${c}"/></svg>`);
const tweet = (id, handle, name, text, photo) => `
  <div data-testid="cellInnerDiv"><article data-testid="tweet" role="article">
    <div data-testid="Tweet-User-Avatar"><img src="${pic('#c33')}"></div>
    <div data-testid="User-Name"><a href="/${handle}"><span>${name}</span></a>
      <div><a href="/${handle}">@${handle}</a> · <a href="/${handle}/status/${id}"><time datetime="2026-11-09T10:00:00.000Z">1h</time></a></div></div>
    <div data-testid="tweetText"><span>${text}</span></div>
    ${photo ? `<a href="/${handle}/status/${id}/photo/1"><div data-testid="tweetPhoto"><img src="${pic(photo)}"></div></a>` : ''}
  </article></div>`;
const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>
  body { margin: 0; background: #fff; font-family: sans-serif; }
  article { height: 260px; border-bottom: 1px solid #888; padding: 10px; box-sizing: border-box; }
  nav { position: fixed; left: 0; right: 0; bottom: 0; height: 53px; background: #eee; }
  .compose { position: fixed; right: 16px; bottom: 69px; width: 56px; height: 56px; border-radius: 50%; }
</style></head><body><main>
${tweet('1', 'ann', 'Ann', 'on the train', '#36c')}${tweet('2', 'ben', 'Ben', 'second')}${tweet('3', 'cy', 'Cy', 'third')}
</main>
<nav data-testid="BottomBar"></nav>
<a class="compose" data-testid="FloatingActionButtons_Tweet_Button" href="/compose/post">+</a>
</body></html>`;

const errors = [];
const ctx = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  headless: true,
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'zh-CN',
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--lang=zh-CN'],
});
await ctx.route(/^https:\/\/x\.com\//, (r) => r.fulfill({ contentType: 'text/html', body: PAGE }));
const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker'));
const stored = async () => (await sw.evaluate(() => chrome.storage.local.get('items'))).items || [];

const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto('https://x.com/home');
await page.waitForTimeout(2500);
assert.ok((await stored()).length >= 2, 'posts are recorded on a phone too');

// The button stands on X's compose button, right edges lined up.
const fab = page.locator('#x-rewind .fab');
const box = await fab.boundingBox();
const compose = await page.locator('.compose').boundingBox();
assert.equal(Math.round(box.x + box.width), Math.round(compose.x + compose.width));
assert.equal(Math.round(compose.y - (box.y + box.height)), 12);
await page.screenshot({ path: `${shots}/mobile-home.png` });

// Without a compose button it sits just above the tab bar.
await page.evaluate(() => document.querySelector('.compose').remove());
await page.waitForTimeout(700);
const bare = await fab.boundingBox();
assert.equal(Math.round(844 - 53 - (bare.y + bare.height)), 16);
assert.equal(Math.round(390 - (bare.x + bare.width)), 16);
console.log('ok  button sits above the compose button / tab bar');

// The drawer covers the screen, with finger-sized controls.
await fab.tap();
await page.waitForTimeout(400);
const panel = await page.locator('#x-rewind .panel').boundingBox();
assert.deepEqual([panel.x, panel.width], [0, 390]);
const sizes = await page.evaluate(() => {
  const r = document.getElementById('x-rewind').shadowRoot;
  const px = (sel, prop) => parseFloat(getComputedStyle(r.querySelector(sel))[prop]);
  return { search: px('.search', 'fontSize'), icon: px('.close', 'height'), chip: px('.chip', 'height') };
});
assert.deepEqual(sizes, { search: 16, icon: 44, chip: 36 });
await page.locator('#x-rewind .chip', { hasText: '图片' }).tap();
assert.deepEqual(await page.locator('#x-rewind .card .name').allTextContents(), ['Ann']);
await page.waitForTimeout(300);
await page.screenshot({ path: `${shots}/mobile-drawer.png` });
await page.locator('#x-rewind .close').tap();
await page.waitForTimeout(300);
assert.equal(await page.locator('#x-rewind .panel').isVisible(), false);
console.log('ok  full-screen drawer with touch-sized controls');

assert.deepEqual(errors, []);
await ctx.close();
console.log('all passed');
