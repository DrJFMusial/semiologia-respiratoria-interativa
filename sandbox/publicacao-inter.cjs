const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await p.goto('http://127.0.0.1:5191/?modo=apresentacao', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  const go = async (n) => { await p.evaluate((k) => window.__deck.slide(k), n - 1); await p.waitForTimeout(500); };
  const cur = () => p.locator('section.present');
  const click = async (txt) => { await cur().locator(`[aria-label*="${txt}"]`).first().click(); await p.waitForTimeout(250); };
  const shot = async (n) => p.screenshot({ path: `sandbox/out/i-${n}.png` });
  // ciclo
  await go(6); await click('Achado: Sibilos'); await click('Reproduzir'); await p.waitForTimeout(1200); await shot('ciclo-sib');
  await click('Som esquemático'); await p.waitForTimeout(1500); await click('Ponto: Traqueia'); await p.waitForTimeout(800); await shot('ciclo-traq');
  await click('Achado: Estertores finos'); await click('Mostrar a pressão pleural'); await p.waitForTimeout(600); await shot('ciclo-finos');
  // mecanica
  await go(5); await click('Condição: Pneumotórax'); await p.waitForTimeout(700); await shot('mec-pneumo');
  await click('Condição: Obstrução'); await p.waitForTimeout(700); await shot('mec-obs');
  // percussão
  await go(13); await click('Condição: Derrame'); await cur().locator('.pc-pt').nth(9).click(); await p.waitForTimeout(300); await click('Percutir o mesmo nível'); await p.waitForTimeout(900); await shot('perc-derrame');
  await click('Vista Anterior'); await cur().locator('.pc-pt').nth(5).click(); await p.waitForTimeout(300); await shot('perc-ant');
  // mapa
  await go(14); await click('Modo Exercício'); const pts = cur().locator('.ma-pt');
  await pts.nth(2).click(); await p.waitForTimeout(200); await shot('mapa-err');
  for (let i = 0; i < 10; i++) { await pts.nth(i).click(); await p.waitForTimeout(80); } await shot('mapa-ok');
  await click('Vista Anterior'); await p.waitForTimeout(200); await click('Modo Sequência'); await shot('mapa-ant');
  // gravações
  await go(16); await click('Comparar em sequência'); await p.waitForTimeout(2500); await shot('grav-cmp');
  await cur().locator('summary').click(); await p.waitForTimeout(300); await shot('grav-ficha');
  // quiz
  await go(20); await p.waitForTimeout(500); await click('Ouvir a gravação'); await p.waitForTimeout(1200); await cur().locator('.qe-opt').nth(1).click(); await p.waitForTimeout(800); await shot('quiz');
  // sindromes
  await go(21); await cur().locator('.sd-cell').nth(10).click(); await p.waitForTimeout(300); await shot('sd-cel');
  await click('Modo Do achado'); await cur().locator('[data-c="perc"][data-v="mac"]').click(); await cur().locator('[data-c="fre"][data-v="down"]').click(); await p.waitForTimeout(300); await shot('sd-achado');
  await click('Modo Exercício'); await p.waitForTimeout(300); await shot('sd-ex'); await cur().locator('.sd-ex .qe-opt').nth(0).click(); await p.waitForTimeout(400); await shot('sd-ex2');
  // ressonância
  await go(19); await click('Consolidação'); await p.waitForTimeout(500); await click('Ouvir com o filtro'); await p.waitForTimeout(400); await shot('voz');
  // formas
  await go(8); await click('Em tonel'); await click('Comparar com a forma normal'); await p.waitForTimeout(400); await shot('formas');
  await go(9); await click('Sinal de Schamroth'); await shot('schamroth-n'); await click('Baqueteamento'); await shot('schamroth-b');
  await click('Ângulo ungueal'); await shot('lovibond-b');
  await go(12); await click('Consolidação'); await p.waitForTimeout(500); await shot('fremito');
  await go(11); await click('Reduzida à direita'); await p.waitForTimeout(300); await shot('expans');
  await go(22); await click('Com a tosse: modificam-se'); await shot('descr');
  await go(23); await click('Preencher: Caso didático'); await shot('reg');
  await go(4); await click('Vista Lateral'); await click('Camada: Linhas'); await click('Camada: Limites'); await shot('sup-lat');
  await click('Vista Anterior'); await shot('sup-ant'); await cur().locator('[data-k="lmed"]').first().click({ force: true }); await shot('sup-ant-sel');
  await go(10); await click('Kussmaul'); await shot('pad-kus'); await click('Cheyne'); await shot('pad-cs'); await click('Biot'); await shot('pad-biot');
  await click('Iniciar 30'); await p.waitForTimeout(31500); await shot('pad-fim'); await cur().locator('.pd-in').fill('8'); await cur().locator('.pd-form button').click(); await shot('pad-fb');
  console.log('errors:', errs.length ? errs.join('\n') : 'none');
  await b.close();
})();




