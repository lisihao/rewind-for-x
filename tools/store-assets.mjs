// Chrome Web Store images: 1280x800 screenshots of the real extension on a
// mock timeline filled with invented posts, plus the promo tiles.
//   node tools/store-assets.mjs   (needs Playwright with Chromium)
// Writes store/screenshots/*.png and store/promo/*.png.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = process.env.OUT || path.join(root, 'store');
mkdirSync(`${out}/screenshots`, { recursive: true });
mkdirSync(`${out}/promo`, { recursive: true });

// ---------------------------------------------------------------- pictures

const uri = (s) => 'data:image/svg+xml,' + encodeURIComponent(s);
const avatar = (a, b) =>
  uri(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="rgba(255,255,255,.85)"/><path d="M14 80c2-16 13-24 26-24s24 8 26 24Z" fill="rgba(255,255,255,.85)"/></svg>`);
// A small landscape: sky gradient, sun, two hills.
const scene = (sky1, sky2, sun, hill1, hill2) =>
  uri(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="440" cy="150" r="46" fill="${sun}"/><path d="M0 250 C120 170 230 190 340 240 S540 200 640 230 V360 H0Z" fill="${hill1}"/><path d="M0 300 C140 250 300 280 420 300 S580 280 640 290 V360 H0Z" fill="${hill2}"/></svg>`);
// Flat still life: a coloured table and a few shapes.
const still = (bg, a, b, c) =>
  uri(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="${bg}"/><rect y="250" width="640" height="110" fill="${a}"/><ellipse cx="250" cy="220" rx="110" ry="70" fill="${b}"/><path d="M180 205 q70 -45 140 0" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="420" y="130" width="70" height="130" rx="12" fill="${c}"/></svg>`);

const AV = {
  maya: avatar('#f97316', '#db2777'),
  sky: avatar('#1e3a8a', '#7c3aed'),
  sam: avatar('#059669', '#0ea5e9'),
  bread: avatar('#d97706', '#92400e'),
  ana: avatar('#e11d48', '#f59e0b'),
  jun: avatar('#475569', '#0f172a'),
  dev: avatar('#2563eb', '#06b6d4'),
  rio: avatar('#16a34a', '#a3e635'),
};
const IMG = {
  dusk: scene('#fb923c', '#fde68a', '#fff7ed', '#9a3412', '#431407'),
  night: scene('#0b1026', '#312e81', '#f8fafc', '#1e1b4b', '#020617'),
  hills: scene('#7dd3fc', '#e0f2fe', '#fef08a', '#65a30d', '#3f6212'),
  bread1: still('#fef3c7', '#b45309', '#f5d0a9', '#92400e', '#78350f'),
  bread2: still('#fde68a', '#78350f', '#e7c08f', '#7c2d12', '#451a03'),
  bread3: still('#fff7ed', '#a16207', '#fcd9a8', '#9a3412', '#7c2d12'),
  film1: scene('#cbd5e1', '#f1f5f9', '#fde68a', '#64748b', '#334155'),
  film2: scene('#fecaca', '#fff1f2', '#fef9c3', '#be123c', '#881337'),
  film3: scene('#a5f3fc', '#ecfeff', '#fefce8', '#0e7490', '#164e63'),
  film4: scene('#ddd6fe', '#f5f3ff', '#fef3c7', '#6d28d9', '#3b0764'),
};

// --------------------------------------------------------------- the posts

const POSTS = {
  en: {
    rt: (n) => `${n} reposted`,
    list: [
      ['maya', 'Maya Chen', 'mayabuilds', 'Shipped the new onboarding flow today. Seven steps down to three, and sign-ups are up 18% overnight.', { media: [IMG.dusk, IMG.hills] }],
      ['sky', 'Night Sky Notes', 'nightskynotes', "Tonight the Moon passes right next to Jupiter. Look southeast about an hour after sunset. No telescope needed.", { media: [IMG.night], context: 'Leo Park' }],
      ['sam', 'Sam Okafor', 'samokafor', 'The best code review comment is a question, not a command.', { quote: ['Priya R.', "What's one habit that made you a better reviewer?"] }],
      ['bread', 'The Bread Lab', 'breadlab', 'Day 3 of the sourdough starter. It finally doubled overnight 🍞', { media: [IMG.bread1, IMG.bread2, IMG.bread3] }],
      ['ana', 'Ana Lima', 'analima', 'Ten small CSS tricks I use every single day. A thread 🧵'],
      ['jun', 'Jun Watanabe', 'junwatanabe', 'Picked up an old film camera at a flea market for $12. The first roll came back today.', { media: [IMG.film1, IMG.film2, IMG.film3, IMG.film4] }],
      ['dev', 'Dev Weekly', 'devweekly', 'This week: faster builds, smaller bundles, and a calmer way to test in the browser.'],
      ['rio', 'Rio Santos', 'riosantos', 'Week 6 of learning to draw every morning. Hands are still impossible.'],
    ],
    feed: [
      ['Kai Turner', 'kaiturner', 'Coffee first, then the inbox. Never the other way round.'],
      ['Lena Fischer', 'lenafischer', 'Our team just moved to a four-day week. Ask me anything.'],
      ['Omar Haddad', 'omarhaddad', 'Rainy Sunday, good book, nowhere to be.'],
    ],
    search: 'sourdough',
  },
  zh_CN: {
    rt: (n) => `${n} 转帖了`,
    list: [
      ['maya', '陈小满', 'mayabuilds', '新的注册引导今天上线了。七步减到三步，一夜之间注册量涨了 18%。', { media: [IMG.dusk, IMG.hills] }],
      ['sky', '夜空笔记', 'nightskynotes', '今晚月亮会紧挨着木星。日落后一小时朝东南方看，不用望远镜。', { media: [IMG.night], context: '朴乐' }],
      ['sam', '萨姆', 'samokafor', '最好的代码评审意见是一个问题，而不是一条命令。', { quote: ['普丽雅', '有什么习惯让你成了更好的评审者？'] }],
      ['bread', '面包实验室', 'breadlab', '养酸种的第三天，终于一夜涨了一倍 🍞', { media: [IMG.bread1, IMG.bread2, IMG.bread3] }],
      ['ana', '安娜', 'analima', '我每天都在用的十个 CSS 小技巧，一条串讲完 🧵'],
      ['jun', '渡边纯', 'junwatanabe', '在跳蚤市场花 12 块淘了台老胶片机，第一卷今天冲出来了。', { media: [IMG.film1, IMG.film2, IMG.film3, IMG.film4] }],
      ['dev', '开发者周刊', 'devweekly', '本周：更快的构建、更小的包，还有更省心的浏览器测试。'],
      ['rio', '里奥', 'riosantos', '每天早上画画的第六周，手还是画不好。'],
    ],
    feed: [
      ['凯', 'kaiturner', '先喝咖啡，再看邮件，顺序不能反。'],
      ['莉娜', 'lenafischer', '我们团队刚改成每周四天工作，有问题尽管问。'],
      ['奥马尔', 'omarhaddad', '下雨的周日，一本好书，哪儿也不用去。'],
    ],
    search: '酸种',
  },
};

function items(lang) {
  const p = POSTS[lang];
  const now = Date.now();
  // Two sittings: the first six a few minutes ago, the rest earlier today.
  const seen = [2, 3, 4, 6, 7, 9, 95, 97].map((m) => now - m * 60000);
  return p.list.map(([av, name, handle, text, o = {}], i) => ({
    id: String(1000 + i),
    url: `https://x.com/${handle}/status/${1000 + i}`,
    handle,
    name,
    avatar: AV[av],
    text,
    quote: o.quote ? { name: o.quote[0], text: o.quote[1] } : null,
    media: o.media || [],
    context: o.context ? p.rt(o.context) : '',
    postedAt: new Date(seen[i] - (i + 1) * 23 * 60000).toISOString(),
    seenAt: seen[i],
  }));
}

// A plain three-column page so the drawer has something to sit on. Its posts
// sit below the fold of X's real markup, so the content script records none.
const PAGE = (lang, dark) => {
  const c = dark
    ? { bg: '#000', fg: '#e7e9ea', muted: '#71767b', line: '#2f3336', block: '#16181c' }
    : { bg: '#fff', fg: '#0f1419', muted: '#536471', line: '#eff3f4', block: '#f7f9f9' };
  const feed = POSTS[lang].feed
    .map(([name, handle, text], i) => `
      <div class="post"><img class="av" src="${Object.values(AV)[(i + 3) % 8]}">
        <div><div><b>${name}</b> <span class="m">@${handle} · ${i + 1}m</span></div><p>${text}</p>
        <div class="pic" style="background-image:url('${[IMG.hills, IMG.film2, IMG.dusk][i]}')"></div></div></div>`)
    .join('');
  return `<!doctype html><html lang="${lang === 'en' ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><style>
    body { margin: 0; background: ${c.bg}; color: ${c.fg}; font: 15px/20px -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif; }
    .wrap { display: flex; justify-content: center; }
    nav { width: 240px; padding: 16px 12px; box-sizing: border-box; }
    nav i { display: block; height: 22px; border-radius: 11px; background: ${c.block}; margin: 0 0 26px; }
    nav i:first-child { width: 34px; height: 34px; border-radius: 10px; }
    main { width: 600px; border-left: 1px solid ${c.line}; border-right: 1px solid ${c.line}; min-height: 100vh; }
    .tabs { height: 53px; border-bottom: 1px solid ${c.line}; }
    .post { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid ${c.line}; }
    .av { width: 40px; height: 40px; border-radius: 50%; flex: none; }
    .m { color: ${c.muted}; } p { margin: 2px 0 12px; }
    .pic { width: 516px; height: 290px; border-radius: 16px; background-size: cover; }
    aside { width: 350px; padding: 12px 24px; box-sizing: border-box; }
    aside i { display: block; height: 42px; border-radius: 21px; background: ${c.block}; }
    aside b { display: block; height: 300px; border-radius: 16px; margin-top: 16px; background: ${c.block}; }
  </style></head><body><div class="wrap">
    <nav>${'<i></i>'.repeat(8)}</nav>
    <main><div class="tabs"></div>${feed}</main>
    <aside><i></i><b></b></aside>
  </div></body></html>`;
};

// ------------------------------------------------------------- screenshots

// chrome.i18n follows the browser's UI language. On macOS that comes from
// AppleLanguages and --lang is ignored, so set it for Chrome for Testing
// while the screenshots are taken, then remove it again.
const BUNDLE = 'com.google.chrome.for.testing';
const mac = process.platform === 'darwin';
const prefs = (...a) => execFileSync('defaults', a, { stdio: 'ignore' });

for (const lang of ['en', 'zh_CN']) {
  const tag = lang === 'en' ? 'en-US' : 'zh-CN';
  if (mac) prefs('write', BUNDLE, 'AppleLanguages', '-array', tag);
  const ctx = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: tag,
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, `--lang=${tag}`],
  });
  let dark = false;
  await ctx.route(/^https:\/\/x\.com\//, (r) => r.fulfill({ contentType: 'text/html', body: PAGE(lang, dark) }));
  const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker'));
  await sw.evaluate((list) => chrome.storage.local.set({ items: list }), items(lang));
  const page = await ctx.newPage();

  const shot = async (name, query = '') => {
    await page.goto('https://x.com/home');
    await page.waitForSelector('#x-rewind', { state: 'attached' });
    await page.waitForTimeout(600);
    await page.locator('#x-rewind .fab').click();
    if (query) await page.locator('#x-rewind .search').fill(query);
    await page.locator('#x-rewind .search').blur();
    await page.mouse.move(600, 30); // no hover highlight on a card
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}/screenshots/${lang}-${name}.png` });
    console.log(`ok  ${lang}-${name}.png`);
  };
  await shot('1-light');
  dark = true;
  await shot('2-dark');
  dark = false;
  await shot('3-search', POSTS[lang].search);
  await ctx.close();
  if (mac) prefs('delete', BUNDLE, 'AppleLanguages');
}

// ------------------------------------------------------------------ promo

const icon = 'data:image/png;base64,' + readFileSync(path.join(root, 'icons/128.png')).toString('base64');
const TAG = {
  en: 'See the posts your timeline just replaced.',
  zh_CN: '刷过的推文，随时回看。',
};
const tile = (w, h, lang) => {
  const big = w > 500;
  const cards = items(lang).slice(0, big ? 3 : 2);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { margin: 0; width: ${w}px; height: ${h}px; overflow: hidden; color: #e7e9ea;
      font: 15px/20px -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: radial-gradient(120% 140% at 85% 10%, #1c2733 0%, #0b0f14 55%, #000 100%);
      display: flex; align-items: center; gap: ${big ? 72 : 0}px; padding: 0 ${big ? 110 : 34}px; }
    .brand { flex: none; }
    .brand img { width: ${big ? 96 : 64}px; height: ${big ? 96 : 64}px; display: block; border-radius: ${big ? 22 : 15}px; }
    h1 { margin: ${big ? 28 : 18}px 0 ${big ? 12 : 8}px; font-size: ${big ? 56 : 34}px; line-height: 1.05; letter-spacing: -.02em; font-weight: 800; }
    p { margin: 0; color: #9aa4ad; font-size: ${big ? 24 : 17}px; line-height: 1.3; max-width: ${big ? 440 : 330}px; }
    .stack { flex: 1; display: ${big ? 'flex' : 'none'}; flex-direction: column; gap: 14px; }
    .card { display: flex; gap: 12px; padding: 16px; border-radius: 18px; background: #0d1115; border: 1px solid #2f3336; }
    .card:nth-child(2) { margin-left: 36px; opacity: .8; } .card:nth-child(3) { margin-left: 72px; opacity: .6; }
    .card img { width: 40px; height: 40px; border-radius: 50%; flex: none; }
    .card b { color: #e7e9ea; } .card span { color: #71767b; }
    .card div div { margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  </style></head><body>
    <div class="brand"><img src="${icon}"><h1>Rewind for X</h1><p>${TAG[lang]}</p></div>
    <div class="stack">${cards.map((c) => `<div class="card"><img src="${c.avatar}"><div><b>${c.name}</b> <span>@${c.handle}</span><div>${c.text}</div></div></div>`).join('')}</div>
  </body></html>`;
};

const browser = await chromium.launch({ channel: 'chromium', headless: true });
for (const lang of ['en', 'zh_CN']) {
  for (const [w, h, name] of [[440, 280, 'small'], [1400, 560, 'marquee']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(tile(w, h, lang));
    await page.screenshot({ path: `${out}/promo/${lang}-${name}-${w}x${h}.png` });
    await page.close();
    console.log(`ok  ${lang}-${name}-${w}x${h}.png`);
  }
}
await browser.close();
