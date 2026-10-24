/**
 * Percussão do tórax: técnica dígito-digital (desenho vetorial desta aula)
 * e mapa clicável, posterior e anterior, com sons ESQUEMÁTICOS que mudam
 * conforme a condição escolhida. Ensina a comparação entre lados no mesmo
 * nível e o que há embaixo de cada som.
 */
import { PERCUSSAO, renderPercussao } from '../../core/synth.js';
import { toBuffer, playOneShot } from '../../core/audio.js';
import { button, captureKeys } from '../../core/ui.js';

const TRONCO_P = 'M214 0 C214 42 208 60 186 70 C138 80 80 92 60 122 C44 162 50 232 58 302 C64 382 70 470 82 560 L418 560 C430 470 436 382 442 302 C450 232 456 162 440 122 C420 92 362 80 314 70 C292 60 286 42 286 0';
const NIVEIS_P = [
  { y: 128, nome: 'supraescapular' }, { y: 196, nome: 'interescapulovertebral superior' }, { y: 258, nome: 'interescapulovertebral inferior' },
  { y: 326, nome: 'infraescapular' }, { y: 392, nome: 'base' }, { y: 462, nome: 'abaixo da base' },
];
const PONTOS_A = {
  D: [{ k: 'a2', x: 165, y: 168, nome: '2º espaço, linha hemiclavicular' }, { k: 'a4', x: 165, y: 236, nome: '4º espaço, linha hemiclavicular' }, { k: 'a6', x: 165, y: 306, nome: '6º espaço, linha hemiclavicular' }],
  E: [{ k: 'a2', x: 335, y: 168, nome: '2º espaço, linha hemiclavicular' }, { k: 'ac', x: 284, y: 252, nome: '4º e 5º espaços, junto ao esterno' }, { k: 'tr', x: 352, y: 344, nome: 'espaço de Traube' }],
};

const CONDICOES = {
  normal: { nome: 'Normal', txt: 'Som claro pulmonar sobre o pulmão aerado, igual dos dois lados. Abaixo das bases, atrás, o som fica submaciço; na frente aparecem a macicez do fígado à direita, a do coração junto ao esterno e o timpanismo do estômago (espaço de Traube) à esquerda.' },
  derrame: { nome: 'Derrame pleural à direita', txt: 'Macicez na base direita, com submacicez na borda superior do líquido; acima, som claro. O limite sobe na lateral (o líquido se espalha pela pleura). Combine com frêmito diminuído e murmúrio diminuído.' },
  consolidacao: { nome: 'Consolidação na base direita', txt: 'Submacicez ou macicez sobre a região consolidada. A percussão sozinha não separa consolidação de derrame: o frêmito (aumentado na consolidação, diminuído no derrame) e a ausculta decidem.' },
  pneumotorax: { nome: 'Pneumotórax à direita', txt: 'Hipersonoridade (às vezes timpanismo) em todo o hemitórax direito. Compare sempre com o lado oposto: a diferença entre os lados é o achado.' },
  hiper: { nome: 'Hiperinsuflação', txt: 'Hipersonoridade dos dois lados, com bases mais baixas: o som claro chega a pontos que normalmente seriam submaciços, e as macicezes hepática e cardíaca diminuem.' },
};

function somP(cond, lado, n) {
  if (cond === 'normal') return n === 5 ? 'submacico' : 'claro';
  if (cond === 'hiper') return n === 5 ? 'claro' : 'hiper';
  if (lado === 'D') {
    if (cond === 'derrame') return n >= 4 ? 'macico' : n === 3 ? 'submacico' : 'claro';
    if (cond === 'consolidacao') return n === 4 ? 'macico' : n === 3 ? 'submacico' : n === 5 ? 'submacico' : 'claro';
    if (cond === 'pneumotorax') return 'hiper';
  }
  return n === 5 ? 'submacico' : 'claro';
}
function somA(cond, lado, k) {
  const base = { D: { a2: 'claro', a4: 'claro', a6: 'macico' }, E: { a2: 'claro', ac: 'macico', tr: 'timpanico' } }[lado][k];
  if (cond === 'hiper') return { a6: 'claro', ac: 'submacico' }[k] || (k === 'tr' ? 'timpanico' : 'hiper');
  if (cond === 'pneumotorax' && lado === 'D') return k === 'a6' ? 'submacico' : 'hiper';
  if (cond === 'derrame' && lado === 'D' && k === 'a4') return 'submacico';
  return base;
}
const POR_QUE = {
  claro: 'pulmão aerado sob a parede',
  hiper: 'excesso de ar (alvéolos distendidos ou ar na pleura)',
  timpanico: 'ar livre numa cavidade',
  submacico: 'pouco ar sob a parede: borda de órgão sólido, de líquido ou de consolidação',
  macico: 'sólido ou líquido sob a parede',
};
const MOTIVO_A = { a6: 'fígado sob o pulmão a partir do 5º/6º espaço', ac: 'coração junto ao esterno', tr: 'bolha de ar do estômago' };

function tecnica() {
  const dedo = (d, cls = '') => `<path class="pc-f-out ${cls}" d="${d}"/><path class="pc-f-in ${cls}" d="${d}"/>`;
  return `<svg class="pc-tec" viewBox="0 0 400 250" role="img" aria-label="Técnica dígito-digital: o dedo médio de uma mão apoiado sobre a pele pelas falanges média e distal; o dedo médio da outra mão, fletido como martelo, golpeia a base da falange distal">
    <defs><marker id="pc-ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect class="pc-tissue" x="0" y="196" width="400" height="54"/><path class="pc-skin" d="M0 196H400"/>
    ${dedo('M40 120 C70 112 100 100 128 96', 'lift')}${dedo('M40 132 C76 128 106 122 138 120', 'lift')}
    <path class="pc-hand" d="M0 110 C20 104 44 108 56 118 C64 128 60 146 46 152 C30 158 10 156 0 152 Z"/>
    ${dedo('M44 146 L120 168 L184 184 L262 185')}
    <path class="pc-joint" d="M184 176V194M120 160V176"/>
    <path class="pc-hand" d="M318 30 C346 24 376 34 386 54 C392 70 380 90 360 94 C340 98 318 92 306 82 C296 70 300 40 318 30 Z"/>
    ${dedo('M312 74 C282 80 240 96 218 124 C202 144 194 158 190 170')}
    <circle class="pc-hit" cx="186" cy="180" r="11"/>
    <path class="pc-arrow" d="M392 104 C404 84 402 50 380 28" marker-end="url(#pc-ah)"/>
    <text class="pc-l" x="164" y="244">golpe na base da falange distal</text>
    <text class="pc-l" x="10" y="226">só o dedo médio encosta</text>
    <text class="pc-l" x="10" y="92">outros dedos levantados</text>
    <text class="pc-l" x="296" y="122">movimento</text><text class="pc-l" x="296" y="138">do punho</text>
  </svg>`;
}

export function percussao(node) {
  node.classList.add('percussao');
  node.tabIndex = 0;
  node.innerHTML = `
    <div class="pc-left">
      ${tecnica()}
      <ol class="steps pc-steps">
        <li>Dedo médio da mão não dominante <b>firme na pele</b>, paralelo às costelas, no espaço intercostal; os outros dedos levantados.</li>
        <li>Dedo médio da outra mão, <b>fletido como martelo</b>, golpeia a base da falange distal com a ponta do dedo.</li>
        <li>Movimento do <b>punho</b>, não do cotovelo; dois golpes rápidos e retirada imediata.</li>
        <li>De cima para baixo, <b>alternando os lados no mesmo nível</b>.</li>
      </ol>
    </div>
    <div class="pc-map">
      <div class="pc-views" role="radiogroup" aria-label="Vista"></div>
      <svg class="pc-svg" viewBox="0 -10 500 600" role="group" aria-label="Mapa de percussão"></svg>
    </div>
    <div class="pc-panel">
      <div class="pc-cond" role="radiogroup" aria-label="Condição"></div>
      <div class="pc-res" aria-live="polite"></div>
      <div class="pc-cmp"></div>
      <div class="pc-card"></div>
      <div class="pc-legend"></div>
      <span class="tag esq">Sons sintetizados esquemáticos</span>
    </div>`;
  const svg = node.querySelector('.pc-svg');
  const res = node.querySelector('.pc-res');
  const card = node.querySelector('.pc-card');
  let view = 'posterior', cond = 'normal', last = null;
  const bufs = {};
  const buf = (k) => { if (!bufs[k]) { const r = renderPercussao(k); bufs[k] = toBuffer(r.data, r.sr); } return bufs[k]; };

  node.querySelector('.pc-legend').innerHTML = Object.entries(PERCUSSAO).map(([k, p]) => `<span class="pc-lg ${k}"><i></i>${p.nome}</span>`).join('');
  const vB = [['posterior', 'Posterior'], ['anterior', 'Anterior']].map(([k, l]) => {
    const b = button({ label: `Vista ${l}`, text: l, cls: 'seg', pressed: k === view });
    b.addEventListener('click', () => { view = k; vB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); last = null; draw(); });
    node.querySelector('.pc-views').appendChild(b); return b;
  });
  const cB = Object.entries(CONDICOES).map(([k, c]) => {
    const b = button({ label: `Condição: ${c.nome}`, text: c.nome, cls: 'chip', pressed: k === cond });
    b.addEventListener('click', () => { cond = k; cB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); last = null; draw(); });
    node.querySelector('.pc-cond').appendChild(b); return b;
  });
  const bCmp = button({ icon: 'play', label: 'Percutir o mesmo nível dos dois lados', text: 'Comparar os dois lados neste nível', cls: 'ghost' });
  node.querySelector('.pc-cmp').appendChild(bCmp);
  bCmp.disabled = true;

  function pontos() {
    if (view === 'posterior') {
      const out = [];
      NIVEIS_P.forEach((nv, n) => {
        out.push({ lado: 'E', n, x: 172, y: nv.y, nome: `${nv.nome}, esquerdo`, som: somP(cond, 'E', n) });
        out.push({ lado: 'D', n, x: 328, y: nv.y, nome: `${nv.nome}, direito`, som: somP(cond, 'D', n) });
      });
      return out;
    }
    const out = [];
    for (const lado of ['D', 'E']) PONTOS_A[lado].forEach((p, n) => out.push({ lado, n, x: p.x, y: p.y, k: p.k, nome: `${p.nome}, ${lado === 'D' ? 'direito' : 'esquerdo'}`, som: somA(cond, lado, p.k) }));
    return out;
  }
  function draw() {
    const P = pontos();
    let base;
    if (view === 'posterior') {
      base = `<path class="pc-body" d="${TRONCO_P}"/><path class="pc-sp" d="M250 60V560"/>
        <path class="pc-scap" d="M198 104 C176 112 140 118 112 124 C122 170 150 250 180 300 C188 240 196 160 198 104 Z"/><path class="pc-scap" d="M302 104 C324 112 360 118 388 124 C378 170 350 250 320 300 C312 240 304 160 302 104 Z"/>
        <path class="pc-lung" d="M104 404 C150 410 200 412 238 412 M262 412 C300 412 350 410 396 404"/>
        <text class="pc-side" x="110" y="582">esquerdo</text><text class="pc-side" x="390" y="582">direito</text>`;
    } else {
      base = `<path class="pc-body" d="M214 0 C214 40 210 62 190 72 C140 82 82 92 62 124 C46 164 52 234 60 304 C66 384 72 470 84 560 L416 560 C428 470 434 384 440 304 C448 234 454 164 438 124 C418 92 360 82 310 72 C290 62 286 40 286 0"/>
        <path class="pc-sp" d="M236 100 H264 L266 150 L262 332 L250 362 L238 332 L234 150 Z"/>
        <path class="pc-org heart" d="M244 196 C276 186 330 206 334 252 C338 292 300 316 262 318 C246 318 238 300 240 270 Z"/>
        <path class="pc-org liver" d="M88 300 C140 290 220 292 300 312 C320 340 300 380 250 392 C180 404 110 384 92 352 Z"/>
        <path class="pc-org stom" d="M318 320 C352 314 392 326 400 356 C404 384 380 398 350 392 C328 386 312 360 318 320 Z"/>
        <text class="pc-side" x="110" y="582">direito</text><text class="pc-side" x="390" y="582">esquerdo</text>`;
    }
    svg.innerHTML = base + P.map((p, i) => `<g class="pc-pt ${p.som}${last && last.lado === p.lado && last.n === p.n ? ' sel' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="Percutir: ${p.nome}">
      <circle class="halo" cx="${p.x}" cy="${p.y}" r="21"/><circle class="dot" cx="${p.x}" cy="${p.y}" r="10"/></g>`).join('');
    svg.querySelectorAll('.pc-pt').forEach((g) => {
      const p = P[g.dataset.i];
      g.addEventListener('click', () => hit(p));
    });
    card.innerHTML = `<h4>${CONDICOES[cond].nome}</h4><p>${CONDICOES[cond].txt}</p>`;
    if (!last) res.innerHTML = '<p class="pc-hint">Toque num ponto para percutir. O som e o nome aparecem aqui.</p>';
    node.classList.toggle('revealed', true);
  }
  function hit(p) {
    playOneShot(buf(p.som));
    last = p;
    const s = PERCUSSAO[p.som];
    const motivo = view === 'anterior' && MOTIVO_A[p.k] && cond === 'normal' ? MOTIVO_A[p.k] : POR_QUE[p.som];
    res.innerHTML = `<p class="pc-where">${p.nome}</p><p class="pc-name ${p.som}">${s.nome}</p><p>${s.desc}</p><p class="pc-why">Embaixo: ${motivo}.</p>`;
    bCmp.disabled = view !== 'posterior';
    svg.querySelectorAll('.pc-pt').forEach((g) => g.classList.remove('sel'));
    svg.querySelector(`.pc-pt[data-i="${pontos().findIndex((q) => q.lado === p.lado && q.n === p.n)}"]`)?.classList.add('sel');
  }
  bCmp.addEventListener('click', () => {
    if (!last || view !== 'posterior') return;
    const P = pontos();
    const a = P.find((q) => q.n === last.n && q.lado === 'E'), b = P.find((q) => q.n === last.n && q.lado === 'D');
    hit(a);
    setTimeout(() => {
      hit(b);
      res.innerHTML = `<p class="pc-where">Nível ${NIVEIS_P[last.n].nome}</p>
        <p>Esquerdo: <b class="pc-name ${a.som}">${PERCUSSAO[a.som].nome}</b><br>Direito: <b class="pc-name ${b.som}">${PERCUSSAO[b.som].nome}</b></p>
        <p class="pc-why">${a.som === b.som ? 'Iguais: sem assimetria neste nível.' : 'Diferentes: a assimetria é o achado. Descreva o lado e o nível.'}</p>`;
    }, 650);
  });
  captureKeys(node, (e) => {
    const g = e.target.closest?.('.pc-pt');
    if (g && (e.key === 'Enter' || e.key === ' ')) { g.dispatchEvent(new Event('click')); return true; }
    return false;
  });
  draw();
  return {};
}

