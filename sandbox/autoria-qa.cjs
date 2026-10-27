const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const base = process.env.QA_URL || 'http://127.0.0.1:5192/';
  const browser = await chromium.launch({ channel: 'chrome' });
  const report = { base, errors: [], httpErrors: [], cases: [], slideChecks: 0 };
  const rectanglesOverlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  fs.mkdirSync('evidencias/autoria', { recursive: true });
  try {
    for (const [width, height] of [[1920,1080], [1366,768], [390,844], [844,390], [768,1024], [320,640]]) {
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width, height } });
        page.on('pageerror', e => report.errors.push(e.message));
        page.on('response', r => { if (r.status() >= 400) report.httpErrors.push({ url: r.url(), status: r.status() }); });
        await page.addInitScript(t => localStorage.setItem('e2m08-theme', t), theme);
        await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => !!window.__deck && getComputedStyle(document.documentElement).getPropertyValue('--author-footer-height').trim().endsWith('px'));
        await page.evaluate(() => document.fonts.ready);
        const footer = page.getByRole('contentinfo', { name: 'Autoria e direitos autorais' });
        assert.equal(await footer.count(), 1);
        assert.match(await footer.innerText(), /© 2026 João Frederico Musial\. Todos os direitos reservados\./);
        assert.equal(await page.locator('.slides > section').count(), 26);
        const presentation = await page.locator('body').evaluate(e => e.classList.contains('modo-apresentacao'));
        const footerBox = await footer.boundingBox();
        assert(footerBox.y >= 0 && footerBox.y + footerBox.height <= height + 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        if (presentation) {
          for (let i = 0; i < 26; i++) {
            await page.evaluate(n => window.__deck.slide(n), i);
            await page.waitForTimeout(60);
            const layout = await page.evaluate(() => ({
              footer: document.querySelector('.author-footer').getBoundingClientRect().toJSON(),
              reveal: document.querySelector('.reveal').getBoundingClientRect().toJSON(),
              nav: document.querySelector('.appbar').getBoundingClientRect().toJSON(),
              controls: [...document.querySelectorAll('section.present button, section.present input')]
                .map(e => e.getBoundingClientRect().toJSON()).filter(r => r.width && r.height),
            }));
            assert(layout.reveal.bottom <= layout.footer.top + 1, `Área reservada, tela ${i + 1}`);
            assert(!rectanglesOverlap(layout.nav, layout.footer), `Barra sobre rodapé, tela ${i + 1}`);
            assert(layout.controls.every(r => !rectanglesOverlap(r, layout.footer)), `Controle sobre rodapé, tela ${i + 1}`);
            assert(layout.controls.every(r => !rectanglesOverlap(r, layout.nav)), `Barra sobre controle, tela ${i + 1}`);
            assert(await footer.isVisible());
            report.slideChecks++;
          }
          await page.evaluate(() => window.__deck.slide(5));
        } else {
          for (let i = 0; i < 26; i++) {
            await page.locator('.slides > section').nth(i).evaluate(e => e.scrollIntoView({ behavior: 'instant', block: 'start' }));
            assert(await footer.isVisible());
            report.slideChecks++;
          }
          // Último controle também deve poder ser deslocado acima do rodapé.
          await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
          const last = page.locator('.slides > section').last();
          const lastBox = await last.boundingBox();
          assert(lastBox.y + lastBox.height <= footerBox.y + 1);
          await page.evaluate(() => scrollTo(0, 0));
        }
        const open = page.getByRole('button', { name: 'Direitos autorais e utilização', exact: true });
        await open.focus();
        await open.press('Enter');
        const dialog = page.getByRole('dialog', { name: 'AUTORIA E DIREITOS AUTORAIS', exact: true });
        assert(await dialog.isVisible());
        assert.match(await dialog.innerText(), /direitos de terceiros/);
        assert.match(await dialog.innerText(), /independentemente de registro formal/);
        const index = await page.evaluate(() => window.__deck.getIndices().h);
        await page.keyboard.press('m');
        await page.keyboard.press('Home');
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.evaluate(() => window.__deck.getIndices().h), index);
        assert.equal(await page.locator('.sections-menu').isVisible(), false);
        for (const key of ['Tab', 'Tab', 'Shift+Tab']) {
          await page.keyboard.press(key);
          assert.equal(await page.evaluate(() => document.getElementById('author-rights').contains(document.activeElement)), true);
        }
        const dialogBox = await dialog.boundingBox();
        assert(dialogBox.x >= 0 && dialogBox.y >= 0 && dialogBox.width <= width && dialogBox.height <= height);
        await dialog.screenshot({ path: `evidencias/autoria/modal-${width}-${theme}.png` });
        await page.keyboard.press('Escape');
        assert.equal(await dialog.isVisible(), false);
        assert.equal(await open.evaluate(e => document.activeElement === e), true);
        await open.press('Space');
        await page.getByRole('button', { name: 'Fechar direitos autorais', exact: true }).click();
        assert.equal(await open.evaluate(e => document.activeElement === e), true);
        await page.screenshot({ path: `evidencias/autoria/rodape-${width}-${theme}.png` });
        const colors = await footer.evaluate(e => ({ background: getComputedStyle(e).backgroundColor, text: getComputedStyle(e.querySelector('.author-nature')).color, copyright: getComputedStyle(e.querySelector('.author-copyright')).color, button: getComputedStyle(e.querySelector('button')).color }));
        report.cases.push({ width, height, theme, presentation, footerBox, dialogBox, colors });
        console.log(`Aprovado: ${width}×${height}, ${theme}`);
        await page.close();
      }
    }
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.goto(base + '?modo=apresentacao', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.appbar');
    await page.waitForTimeout(3000);
    assert(await page.locator('.author-footer').isVisible(), 'Autoria permanece durante inatividade');
    await page.getByRole('button', { name: 'Direitos autorais e utilização', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Tela cheia (F)', exact: true }).focus();
    await page.getByRole('button', { name: 'Tela cheia (F)', exact: true }).click();
    assert(await page.evaluate(() => !!document.fullscreenElement));
    assert(await page.locator('.author-footer').isVisible());
    await page.getByRole('button', { name: 'Tela cheia (F)', exact: true }).click();
    assert.equal(await page.locator('meta[name="author"]').getAttribute('content'), 'João Frederico Musial');
    assert.match(await page.locator('meta[name="copyright"]').getAttribute('content'), /© 2026/);
    assert.equal(await page.locator('meta[property="og:type"]').getAttribute('content'), 'website');
    await page.close();
    if (!process.env.QA_URL) {
      const offline = await browser.newPage({ viewport: { width: 390, height: 844 } });
      offline.on('pageerror', e => report.errors.push(e.message));
      await offline.goto(require('node:url').pathToFileURL(path.resolve('dist-offline/index.html')).href);
      await offline.getByRole('button', { name: 'Direitos autorais e utilização', exact: true }).click();
      assert(await offline.getByRole('dialog').isVisible());
      await offline.keyboard.press('Escape');
      report.offline = 'passed';
    }
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.httpErrors, []);
    report.status = 'passed';
  } finally {
    await browser.close();
    fs.writeFileSync('evidencias/autoria/qa.json', JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify({ status: report.status, cases: report.cases.length, slideChecks: report.slideChecks, errors: report.errors, httpErrors: report.httpErrors, offline: report.offline }));
})().catch(e => { console.error(e); process.exit(1); });
