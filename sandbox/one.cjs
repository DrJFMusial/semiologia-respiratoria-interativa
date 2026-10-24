const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:5179/?modo=apresentacao', { waitUntil: 'networkidle' });
  await p.evaluate((k) => window.__deck.slide(k), Number(process.argv[2]) - 1); await p.waitForTimeout(600);
  const cur = p.locator('section.present');
  for (const a of (process.argv[4] || '').split(';').filter(Boolean)) { await cur.locator(`[aria-label*="${a}"]`).first().click(); await p.waitForTimeout(300); }
  await p.screenshot({ path: process.argv[3] }); console.log(errs.join('\n') || 'ok'); await b.close(); })();

