const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 760 } });
 p.on('console', m => console.log('console', m.type(), m.text())); p.on('pageerror', e => console.log('ERR', e.message));
 await p.goto('http://localhost:5179/' + process.argv[2]); await p.waitForTimeout(1500); await p.screenshot({ path: process.argv[3], fullPage: true }); await b.close(); })();

