const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [], ext = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('data:') && !u.startsWith('file:') && !u.startsWith('http://localhost:5190') && !u.startsWith('blob:')) ext.push(u); });
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const n = await p.evaluate(() => window.__deck.getTotalSlides());
  await p.evaluate(() => window.__deck.slide(15)); await p.waitForTimeout(800);
  await p.locator('section.present [aria-label*="Ouvir a gravação"]').click(); await p.waitForTimeout(1200);
  const drawn = await p.evaluate(() => { const c = document.querySelector('section.present .gv-sig'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 400) s += d[i + 3]; return s; });
  await p.evaluate(() => window.__deck.slide(6)); await p.waitForTimeout(500);
  const img = await p.evaluate(() => [...document.querySelectorAll('img')].filter((i) => !i.complete || !i.naturalWidth).length);
  await p.screenshot({ path: 'sandbox/out/dist.png' });
  console.log(JSON.stringify({ n, drawn, brokenImgs: img, errs, ext })); await b.close();
})();

