// End-to-end check against a mock of X's timeline markup, served at
// https://x.com/home so the real content script runs.
//   node test/e2e.mjs   (needs Playwright with Chromium)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

// require() so a global install found through NODE_PATH works too.
const { chromium } = createRequire(import.meta.url)('playwright');
const ext = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.env.SHOTS || path.join(ext, 'test', 'out');

const pic = (c) =>
  'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${c}"/></svg>`);

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; background: BG; color: FG; font-family: sans-serif; }
  article { height: 300px; border-bottom: 1px solid #888; padding: 10px; box-sizing: border-box; }
  .dock { position: fixed; right: 20px; bottom: 16px; display: flex; flex-direction: column; gap: 12px; }
  .dock button { width: 55px; height: 55px; border-radius: 16px; }
</style></head><body><main><div id="tl"></div></main>
<div class="dock"><button data-testid="GrokDrawerHeader">G</button><button data-testid="chat-drawer-main">C</button></div><script>
  const pic = ${pic.toString()};
  window.tweet = (id, handle, name, text, o = {}) => \`
    <div data-testid="cellInnerDiv"><article data-testid="tweet" role="article">
      \${o.rt ? '<span data-testid="socialContext">' + o.rt + ' reposted</span>' : ''}
      <div data-testid="Tweet-User-Avatar"><img src="\${pic('#c33')}"></div>
      <div data-testid="User-Name"><a href="/\${handle}"><span>\${name}<img alt="🔥" src=""></span></a>
        <div><a href="/\${handle}">@\${handle}</a> · \${o.ad ? '<span>Ad</span>' : '<a href="/' + handle + '/status/' + id + '"><time datetime="2026-11-09T10:00:00.000Z">1h</time></a>'}</div></div>
      <div data-testid="tweetText"><span>\${text}\${o.tr ? '<font class="notranslate immersive-translate-target-wrapper"><br><font class="notranslate immersive-translate-target-translation-block-wrapper">' + o.tr + '</font></font>' : ''}</span></div>
      \${o.video ? '<div data-testid="videoPlayer"><video poster="' + pic('#933') + '#video_thumb"></video></div>' : ''}
      \${(o.photos || []).map(c => '<a href="/' + handle + '/status/' + id + '/photo/1"><div data-testid="tweetPhoto"><img src="' + pic(c) + '"></div></a>').join('')}
      \${o.quote ? '<div role="link" tabindex="0"><div data-testid="User-Name"><div><span>Quoted Person</span></div><div><span>@qp</span><span>·</span><time>2h</time></div></div><a href="/q/status/999"><time datetime="x">2h</time></a><div data-testid="tweetText"><span>' + o.quote + '</span></div><div data-testid="tweetPhoto"><img src="' + pic('#000') + '"></div></div>' : ''}
    </article></div>\`;
  window.setTimeline = (...html) => { document.getElementById('tl').innerHTML = html.join(''); };
  setTimeline(
    tweet('101', 'alice', 'Alice', 'first post of the morning', { photos: ['#36c', '#3c6'] }),
    tweet('102', 'bob', 'Bob', 'second post'),
    tweet('103', 'carol', 'Carol', 'third post'),
    tweet('104', 'dave', 'Dave', 'below the fold'),
  );
</script></body></html>`;

const errors = [];
const ctx = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 800 },
  locale: 'zh-CN',
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--lang=zh-CN'],
});
let theme = { BG: '#fff', FG: '#000' };
await ctx.route(/^https:\/\/x\.com\//, (r) =>
  r.fulfill({ contentType: 'text/html', body: PAGE.replace('BG', theme.BG).replace('FG', theme.FG) })
);
const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker'));
const stored = async () => (await sw.evaluate(() => chrome.storage.local.get('items'))).items || [];
const ids = async () => (await stored()).map((i) => i.id).sort();

const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto('https://x.com/home');
await page.waitForTimeout(2500);

// 1. Visible posts are recorded, the one below the fold is not.
assert.deepEqual(await ids(), ['101', '102', '103']);
const alice = (await stored()).find((i) => i.id === '101');
assert.equal(alice.name, 'Alice🔥');
assert.equal(alice.url, 'https://x.com/alice/status/101');
assert.equal(alice.media.length, 2);
assert.equal(alice.text, 'first post of the morning');
console.log('ok  visible posts recorded');

// 2. The feed refreshes and replaces everything; the old posts stay stored.
await page.evaluate(() =>
  setTimeline(
    tweet('201', 'erin', 'Erin', 'fresh one', { rt: 'Frank', video: true }),
    tweet('202', 'gina', 'Gina', 'my take', { quote: 'the original quoted text', tr: '我的看法' }),
    tweet('900', 'brand', 'Brand', 'buy stuff', { ad: true })
  )
);
await page.waitForTimeout(2500);
assert.deepEqual(await ids(), ['101', '102', '103', '201', '202']);
const gina = (await stored()).find((i) => i.id === '202');
assert.equal(gina.text, 'my take', 'a translation extension\'s text is left out');
assert.equal(gina.quote.text, 'the original quoted text');
assert.equal(gina.quote.name, 'Quoted Person');
assert.equal(gina.media.length, 0, "the quoted post's image is not the post's own");
assert.equal((await stored()).find((i) => i.id === '201').context, 'Frank reposted');
console.log('ok  replaced posts kept, ads skipped, quotes and reposts parsed');

// 3. Off the home timeline nothing is recorded.
await page.evaluate(() => {
  history.pushState({}, '', '/someone/status/1');
  setTimeline(tweet('301', 'zed', 'Zed', 'a reply on a thread'));
});
await page.waitForTimeout(1500);
assert.ok(!(await ids()).includes('301'));
assert.equal(await page.locator('#x-rewind .fab').isHidden(), true);
console.log('ok  other pages ignored, button hidden');

// 4. The drawer lists everything newest-first and searches.
await page.evaluate(() => history.pushState({}, '', '/home'));
await page.waitForTimeout(800);
// The button sits in X's column of floating buttons, above Grok, not on it.
const fabBox = await page.locator('#x-rewind .fab').boundingBox();
const grokBox = await page.locator('[data-testid="GrokDrawerHeader"]').boundingBox();
assert.equal(Math.round(fabBox.x + fabBox.width), Math.round(grokBox.x + grokBox.width));
assert.equal(Math.round(grokBox.y - (fabBox.y + fabBox.height)), 12);
await page.locator('#x-rewind .fab').click();
await page.waitForTimeout(400);
assert.equal(await page.locator('#x-rewind .count').textContent(), '5');
const names = await page.locator('#x-rewind .card .name').allTextContents();
assert.equal(names.length, 5);
assert.equal(await page.locator('#x-rewind .card').first().getAttribute('target'), '_blank');
await page.screenshot({ path: `${shots}/light.png` });
await page.locator('#x-rewind .search').fill('quoted');
await page.waitForTimeout(100);
assert.deepEqual(await page.locator('#x-rewind .card .name').allTextContents(), ['Gina🔥']);
// Typing must not reach X's own keyboard shortcuts.
await page.evaluate(() => {
  window.leaked = 0;
  document.addEventListener('keydown', () => window.leaked++);
});
await page.locator('#x-rewind .search').press('j');
assert.equal(await page.evaluate(() => window.leaked), 0);
console.log('ok  drawer lists and searches');

// 4b. Filter chips narrow the list, together with search.
await page.locator('#x-rewind .search').fill('');
const chip = (label) => page.locator('#x-rewind .chip', { hasText: label });
const shownNames = () => page.locator('#x-rewind .card .name').allTextContents();
await chip('图片').click();
assert.deepEqual(await shownNames(), ['Alice🔥']);
assert.equal(await page.locator('#x-rewind .count').textContent(), '1');
await chip('引用').click();
assert.deepEqual(await shownNames(), ['Gina🔥']);
await chip('转帖').click();
assert.deepEqual(await shownNames(), ['Erin🔥']);
await page.locator('#x-rewind .search').fill('nothing like this');
assert.equal(await page.locator('#x-rewind .reset').count(), 1);
await page.locator('#x-rewind .search').fill('');
await chip('视频').click();
assert.deepEqual(await shownNames(), ['Erin🔥']);
assert.equal(await page.locator('#x-rewind .card .play').count(), 1);
assert.equal(await chip('视频').getAttribute('aria-pressed'), 'true');
await page.mouse.move(600, 30);
await page.waitForTimeout(300);
await page.screenshot({ path: `${shots}/filter.png` });
console.log('ok  filter chips');

// 5. Escape and a click outside close it; clear needs two clicks.
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
assert.equal(await page.locator('#x-rewind .panel').isVisible(), false);
await page.locator('#x-rewind .fab').click();
await page.waitForTimeout(300);
await page.mouse.click(200, 400);
await page.waitForTimeout(300);
assert.equal(await page.locator('#x-rewind .panel').isVisible(), false);
await page.locator('#x-rewind .fab').click();
await page.locator('#x-rewind .search').fill('');
await page.locator('#x-rewind .clear').click();
await page.waitForTimeout(200);
assert.equal((await stored()).length, 5);
await page.locator('#x-rewind .clear').click();
await page.waitForTimeout(200);
assert.equal((await stored()).length, 0);
console.log('ok  escape and outside click close, clear asks twice');

// 6. Dark ("Lights out") theme, with posts again.
theme = { BG: 'rgb(0, 0, 0)', FG: '#eee' };
await page.goto('https://x.com/home');
await page.waitForTimeout(2000);
await page.evaluate(() => window.scrollTo(0, 400));
await page.waitForTimeout(2000);
await page.locator('#x-rewind .fab').click();
await page.waitForTimeout(400);
assert.equal(await page.evaluate(() => document.getElementById('x-rewind').dataset.theme), 'dark');
// The last filter is remembered: Videos again, nothing matches, "show all" resets.
assert.equal(await chip('视频').getAttribute('aria-pressed'), 'true');
assert.equal(await page.locator('#x-rewind .card').count(), 0);
await page.locator('#x-rewind .reset').click();
assert.equal(await chip('全部').getAttribute('aria-pressed'), 'true');
assert.equal(await page.locator('#x-rewind .count').textContent(), '4');
await page.screenshot({ path: `${shots}/dark.png` });
console.log('ok  dark theme; scrolling records the post below the fold');

assert.deepEqual(errors, []);
await ctx.close();
console.log('all passed');
