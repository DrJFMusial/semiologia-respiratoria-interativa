const { chromium } = require('playwright');
(async () => {
  const [W, H] = process.argv[2].split('x').map(Number);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 900, hasTouch: W < 900 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(`http://localhost:5179/${process.argv[4] || '?modo=estudo'}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth; const out = [];
    document.querySelectorAll('section *').forEach((e) => { const q = e.getBoundingClientRect(); if (q.right > vw + 1 && q.width > 0) { const sc = e.closest('.gv-tabs,.cl-plots,.sd-scroll,.cr-scroll,.pd-tabs'); if (!sc) out.push(`${e.tagName}.${String(e.className.baseVal ?? e.className).slice(0, 40)} r=${Math.round(q.right)} sec=${e.closest('section').dataset.menuTitle}`); } });
    return { sw: document.documentElement.scrollWidth, vw, out: out.slice(0, 15), h: document.documentElement.scrollHeight };
  });
  console.log(JSON.stringify(r, null, 1));
  const secs = await p.locator('section').count();
  const pick = (process.argv[3] || '').split(',').filter(Boolean).map(Number);
  for (const i of pick) { const s = p.locator('section').nth(i - 1); await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await s.screenshot({ path: `sandbox/out/st-${W}-${i}.png` }); }
  console.log('sections', secs, 'errors', errs.join('\n') || 'none'); await b.close();
})();

