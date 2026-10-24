const { chromium } = require('playwright');
(async () => {
  const [W, H] = (process.argv[2] || '1600x900').split('x').map(Number);
  const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
  const out = process.argv[4] || 'sandbox/out';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await p.goto(process.env.URL || 'http://localhost:5179/?modo=apresentacao', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const n = await p.evaluate(() => window.__deck.getTotalSlides());
  for (let i = 0; i < n; i++) {
    if (only && !only.includes(i + 1)) continue;
    await p.evaluate((k) => window.__deck.slide(k), i);
    await p.waitForTimeout(700);
    const ov = await p.evaluate(() => {
      const s = window.__deck.getCurrentSlide(); const r = s.getBoundingClientRect(); const sc = window.__deck.getScale();
      const bad = [];
      s.querySelectorAll('*').forEach((e) => { const q = e.getBoundingClientRect(); if (q.width && q.height && (q.bottom > r.bottom + 2 || q.right > r.right + 2) && getComputedStyle(e).position !== 'fixed') bad.push(`${e.tagName}.${(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className) || ''} b=${Math.round((q.bottom - r.top) / sc)} r=${Math.round((q.right - r.left) / sc)}`); });
      return bad.slice(0, 6);
    });
    if (ov.length) console.log('slide', i + 1, 'OVERFLOW', ov.join(' | '));
    await p.screenshot({ path: `${out}/s${String(i + 1).padStart(2, '0')}.png` });
  }
  console.log('errors:', errs.length ? errs.join('\n') : 'none');
  await b.close();
})();

