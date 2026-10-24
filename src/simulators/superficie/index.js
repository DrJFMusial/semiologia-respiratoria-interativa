/**
 * Anatomia de superfície do tórax: vistas posterior, lateral direita e
 * anterior, desenhadas para esta aula, com camadas que se ligam e desligam
 * (referências ósseas, linhas, lobos, fissuras e limites inferiores).
 * Projeções aproximadas, para orientar o exame; variam com o biotipo e com
 * a fase da respiração.
 */
import { button, captureKeys } from '../../core/ui.js';

const LOBO = { sup: 'lb-sup', med: 'lb-med', inf: 'lb-inf' };

/* ----------------------------------------------------------------------- */
/* Vistas                                                                  */
/* ----------------------------------------------------------------------- */
const mir = (d) => d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (m, x, y) => `${(500 - x).toFixed(0)} ${y}`);

function posterior() {
  const T = (k) => 96 + 34 * (k - 1);
  const tronco = 'M214 0 C214 42 208 60 186 70 C138 80 80 92 60 122 C44 162 50 232 58 302 C64 382 70 470 82 560 L418 560 C430 470 436 382 442 302 C450 232 456 162 440 122 C420 92 362 80 314 70 C292 60 286 42 286 0';
  let costelas = '';
  for (let k = 1; k <= 11; k++) { const y = T(k); costelas += `<path d="M262 ${y + 4} C310 ${y - 4} 380 ${y + 6} 420 ${y + 44}"/><path d="${mir(`M262 ${y + 4} C310 ${y - 4} 380 ${y + 6} 420 ${y + 44}`)}"/>`; }
  let processos = '';
  for (let k = 1; k <= 12; k++) processos += `<rect x="244" y="${T(k) - 5}" width="12" height="10" rx="3"/>`;
  const escE = 'M198 104 C176 112 140 118 112 124 C122 170 150 250 180 300 C188 240 196 160 198 104 Z';
  const espinhaE = 'M206 140 C176 132 140 124 104 116';
  const pulmaoE = `M232 96 C206 92 176 104 150 136 C104 196 96 300 104 392 C150 398 200 404 238 404 Z`;
  const pulmaoD = mir(pulmaoE);
  const supE = `M232 96 C206 92 176 104 150 136 C120 176 106 232 102 290 C150 270 200 210 236 164 Z`;
  const infE = `M236 164 C200 210 150 270 102 290 C100 330 100 360 104 392 C150 398 200 404 238 404 Z`;
  const obliquaE = 'M236 164 C200 210 150 270 102 290';
  return {
    nome: 'Posterior', lados: ['esquerdo', 'direito'],
    base: `<path class="sf-skin" d="${tronco}"/>`,
    camadas: {
      osso: `<g class="sf-rib">${costelas}</g><g class="sf-proc">${processos}</g>
        <path class="sf-scap" d="${escE}"/><path class="sf-scap" d="${mir(escE)}"/>
        <path class="sf-spine" d="${espinhaE}"/><path class="sf-spine" d="${mir(espinhaE)}"/>`,
      lobos: `<path class="${LOBO.sup}" data-k="lsupE" d="${supE}"/><path class="${LOBO.inf}" data-k="linfE" d="${infE}"/>
        <path class="${LOBO.sup}" data-k="lsupD" d="${mir(supE)}"/><path class="${LOBO.inf}" data-k="linfD" d="${mir(infE)}"/>`,
      fissuras: `<path class="sf-fiss" data-k="obliqua" d="${obliquaE}"/><path class="sf-fiss" data-k="obliqua" d="${mir(obliquaE)}"/>`,
      limites: `<path class="sf-lim pulm" data-k="limpost" d="M104 392 C150 398 200 404 238 404 M262 404 C300 404 350 398 396 392"/>
        <path class="sf-lim pleura" data-k="pleurapost" d="M96 458 C150 466 200 470 238 470 M262 470 C300 470 350 466 404 458"/>
        <path class="sf-out" d="${pulmaoE}"/><path class="sf-out" d="${pulmaoD}"/>`,
      linhas: `<path class="sf-line" data-k="lvert" d="M250 60 V560"/>
        <path class="sf-line" data-k="lparav" d="M214 80 V560 M286 80 V560"/>
        <path class="sf-line" data-k="lescap" d="M180 110 V560 M320 110 V560"/>`,
      ref: `<g data-k="c7" class="sf-ref"><circle cx="250" cy="70" r="9"/><text x="268" y="74">C7</text></g>
        <g data-k="t3" class="sf-ref"><circle cx="250" cy="${T(3)}" r="6"/><text x="266" y="${T(3) + 4}">T3</text></g>
        <g data-k="angescap" class="sf-ref"><circle cx="180" cy="300" r="7"/><circle cx="320" cy="300" r="7"/><text x="332" y="304">T7</text></g>
        <g data-k="t10" class="sf-ref"><circle cx="250" cy="${T(10)}" r="6"/><text x="266" y="${T(10) + 4}">T10</text></g>
        <g data-k="t12" class="sf-ref"><circle cx="250" cy="${T(12)}" r="6"/><text x="266" y="${T(12) + 4}">T12</text></g>`,
    },
    textos: [['esquerdo', 120, 590], ['direito', 380, 590]],
  };
}

function lateral() {
  // paciente olhando para a direita da tela; braço elevado
  const tronco = 'M150 40 C130 60 126 120 128 200 C130 300 140 420 150 560 L360 560 C368 470 380 400 384 330 C388 270 380 220 370 180 C360 140 330 108 300 98 L292 30 C292 10 262 0 244 4 C222 8 206 20 200 40 Z';
  const braco = 'M200 40 C196 0 214 -20 240 -24 L292 -24 C300 0 300 20 292 30';
  let costelas = '';
  for (let k = 2; k <= 11; k++) { const y = 150 + (k - 2) * 42; costelas += `<path d="M142 ${y - 40} C200 ${y - 16} 300 ${y + 6} 372 ${y + 34}"/>`; }
  const pulmao = 'M262 92 C220 96 176 120 160 170 C148 240 148 330 156 470 C210 440 260 410 340 382 C362 330 368 260 352 190 C340 140 300 100 262 92 Z';
  const ob = 'M150 176 C210 226 290 330 344 392';
  const ho = 'M250 292 C290 280 330 268 362 258';
  const sup = 'M262 92 C220 96 176 120 160 170 L150 176 C210 226 236 260 250 292 C290 280 330 268 362 258 C366 230 362 210 352 190 C340 140 300 100 262 92 Z';
  const med = 'M250 292 C270 318 300 352 344 392 L340 382 C356 340 364 300 362 258 C330 268 290 280 250 292 Z';
  const inf = 'M150 176 C210 226 290 330 344 392 L340 382 C260 410 210 440 156 470 C148 330 146 240 150 176 Z';
  return {
    nome: 'Lateral direita', lados: ['posterior', 'anterior'],
    base: `<path class="sf-skin" d="${braco}"/><path class="sf-skin" d="${tronco}"/>`,
    camadas: {
      osso: `<g class="sf-rib">${costelas}</g>`,
      lobos: `<path class="${LOBO.sup}" data-k="lsupD" d="${sup}"/><path class="${LOBO.med}" data-k="lmed" d="${med}"/><path class="${LOBO.inf}" data-k="linfD" d="${inf}"/>`,
      fissuras: `<path class="sf-fiss" data-k="obliqua" d="${ob}"/><path class="sf-fiss" data-k="horizontal" d="${ho}"/>`,
      limites: `<path class="sf-lim pulm" data-k="limlat" d="M156 470 C210 440 260 410 340 382"/>
        <path class="sf-lim pleura" data-k="pleuralat" d="M150 548 C214 520 280 490 360 452"/>
        <path class="sf-out" d="${pulmao}"/>`,
      linhas: `<path class="sf-line" data-k="laxpost" d="M196 70 V560"/><path class="sf-line" data-k="laxmed" d="M250 100 V560"/><path class="sf-line" data-k="laxant" d="M306 104 V560"/>`,
      ref: `<g data-k="axila" class="sf-ref"><circle cx="252" cy="108" r="8"/><text x="186" y="104">axila</text></g>
        <g data-k="costela8" class="sf-ref"><circle cx="250" cy="402" r="6"/><text x="260" y="420">8ª costela</text></g>`,
    },
    textos: [['posterior', 120, 590], ['anterior', 380, 590]],
  };
}

function anterior() {
  const tronco = 'M214 0 C214 40 210 62 190 72 C140 82 82 92 62 124 C46 164 52 234 60 304 C66 384 72 470 84 560 L416 560 C428 470 434 384 440 304 C448 234 454 164 438 124 C418 92 360 82 310 72 C290 62 286 40 286 0';
  const Y = [0, 118, 150, 185, 220, 255, 290, 322];
  let costelas = '';
  for (let k = 1; k <= 7; k++) { const y = Y[k]; const c = `M238 ${y} C200 ${y + 4} 130 ${y + 4} 76 ${y + 36}`; costelas += `<path d="${c}"/><path d="${mir(c)}"/>`; }
  const esterno = 'M236 100 H264 L266 150 L262 332 L250 362 L238 332 L234 150 Z';
  const clav = 'M236 100 C200 96 150 82 108 86';
  // pulmão direito (à esquerda da tela) e esquerdo
  const pD = 'M190 62 C150 70 110 110 96 170 C84 230 84 300 90 398 C130 370 160 346 196 334 C222 330 240 330 246 330 L246 120 C238 90 216 64 190 62 Z';
  const pE = 'M310 62 C350 70 390 110 404 170 C416 230 416 300 410 398 C370 370 340 346 326 340 L330 250 C300 236 270 226 256 220 L254 120 C262 90 284 64 310 62 Z';
  const supD = 'M190 62 C150 70 110 110 96 170 C90 196 88 214 88 232 C150 226 200 222 246 220 L246 120 C238 90 216 64 190 62 Z';
  const medD = 'M88 232 C150 226 200 222 246 220 L246 330 C240 330 222 330 196 334 C170 310 130 296 92 290 C88 270 88 250 88 232 Z';
  const infD = 'M92 290 C130 296 170 310 196 334 C160 346 130 370 90 398 C86 360 86 320 92 290 Z';
  const supE = 'M310 62 C350 70 390 110 404 170 C414 220 414 260 412 282 C380 300 350 320 330 334 L330 250 C300 236 270 226 256 220 L254 120 C262 90 284 64 310 62 Z';
  const infE = 'M412 282 C380 300 350 320 330 334 L326 340 C340 346 370 370 410 398 C414 360 414 320 412 282 Z';
  return {
    nome: 'Anterior', lados: ['direito', 'esquerdo'],
    base: `<path class="sf-skin" d="${tronco}"/>`,
    camadas: {
      osso: `<g class="sf-rib">${costelas}</g><path class="sf-bone" d="${esterno}"/>
        <path class="sf-clav" d="${clav}"/><path class="sf-clav" d="${mir(clav)}"/>`,
      lobos: `<path class="${LOBO.sup}" data-k="lsupD" d="${supD}"/><path class="${LOBO.med}" data-k="lmed" d="${medD}"/><path class="${LOBO.inf}" data-k="linfD" d="${infD}"/>
        <path class="${LOBO.sup}" data-k="lsupE" d="${supE}"/><path class="${LOBO.inf}" data-k="linfE" d="${infE}"/>`,
      fissuras: `<path class="sf-fiss" data-k="horizontal" d="M88 232 C150 226 200 222 246 220"/>
        <path class="sf-fiss" data-k="obliqua" d="M92 290 C130 296 170 310 196 334"/><path class="sf-fiss" data-k="obliqua" d="M412 282 C380 300 350 320 330 334"/>`,
      limites: `<path class="sf-lim pulm" data-k="limant" d="M90 398 C130 370 160 346 196 334 M326 340 C340 346 370 370 410 398"/>
        <path class="sf-lim pleura" data-k="pleuraant" d="M86 470 C130 430 180 396 236 384 M264 384 C320 396 370 430 414 470"/>
        <path class="sf-out" d="${pD}"/><path class="sf-out" d="${pE}"/>`,
      linhas: `<path class="sf-line" data-k="lmedio" d="M250 100 V560"/><path class="sf-line" data-k="lhc" d="M165 80 V560 M335 80 V560"/>
        <path class="sf-line" data-k="laxantA" d="M92 140 V560 M408 140 V560"/>`,
      ref: `<g data-k="louis" class="sf-ref"><circle cx="250" cy="150" r="8"/><text x="270" y="146">ângulo de Louis</text></g>
        <g data-k="apice" class="sf-ref"><circle cx="190" cy="70" r="7"/><circle cx="310" cy="70" r="7"/></g>
        <g data-k="costela6" class="sf-ref"><circle cx="165" cy="338" r="6"/><text x="104" y="360">6ª</text></g>`,
    },
    textos: [['direito', 120, 590], ['esquerdo', 380, 590]],
  };
}

/* ----------------------------------------------------------------------- */
/* Descrições                                                              */
/* ----------------------------------------------------------------------- */
const INFO = {
  c7: ['Processo espinhoso de C7', 'A saliência mais proeminente na base do pescoço com o paciente fletindo a cabeça. A partir dela se contam os processos torácicos.'],
  t3: ['Processo espinhoso de T3', 'Nível em que começa, atrás, a fissura oblíqua: acima dela, só lobo superior.'],
  angescap: ['Ângulo inferior da escápula', 'Com os braços ao longo do corpo, fica aproximadamente no nível de T7 (sétima costela). Separa as regiões interescapulovertebral e infraescapular.'],
  t10: ['T10: limite inferior do pulmão atrás', 'Em expiração tranquila, a base do pulmão fica em torno de T10; na inspiração profunda desce alguns centímetros.'],
  t12: ['T12: limite inferior da pleura atrás', 'A pleura parietal desce cerca de dois espaços abaixo do pulmão: é o recesso costofrênico, onde o derrame se acumula primeiro.'],
  louis: ['Ângulo do esterno (de Louis)', 'Junção do manúbrio com o corpo do esterno. A cartilagem da 2ª costela se articula ali: é o ponto de partida para contar costelas e espaços intercostais na frente. Projeta a bifurcação da traqueia.'],
  apice: ['Ápices pulmonares', 'Ultrapassam a clavícula em 2 a 4 cm, no terço medial: por isso se percutem e se auscultam as fossas supraclaviculares.'],
  costela6: ['6ª costela na linha hemiclavicular', 'Limite inferior do pulmão na frente; a pleura vai até a 8ª costela nessa linha.'],
  costela8: ['8ª costela na linha axilar média', 'Limite inferior do pulmão na lateral; a pleura chega à 10ª costela.'],
  axila: ['Axila', 'Ápice da região axilar. Os pontos de ausculta lateral seguem a linha axilar média, do oco axilar à base.'],
  lvert: ['Linha vertebral', 'Passa pelos processos espinhosos.'],
  lparav: ['Linhas paravertebrais', 'Tangenciam as bordas laterais das vértebras. A região entre elas e a borda medial da escápula é a interescapulovertebral.'],
  lescap: ['Linhas escapulares', 'Verticais pelo ângulo inferior da escápula, com os braços ao longo do corpo.'],
  laxpost: ['Linha axilar posterior', 'Prolonga a prega axilar posterior.'],
  laxmed: ['Linha axilar média', 'Parte do ápice da axila. Referência para o limite inferior do pulmão (8ª costela) e da pleura (10ª).'],
  laxant: ['Linha axilar anterior', 'Prolonga a prega axilar anterior.'],
  laxantA: ['Linhas axilares anteriores', 'Prolongam as pregas axilares anteriores.'],
  lmedio: ['Linha medioesternal', 'Divide o esterno ao meio.'],
  lhc: ['Linhas hemiclaviculares', 'Verticais pelo ponto médio das clavículas.'],
  obliqua: ['Fissura oblíqua', 'Vai de T3, atrás, à 6ª articulação costocondral, na frente. Separa o lobo inferior dos lobos superior e médio. Por trás, quase todo o pulmão abaixo de T3 é lobo inferior.'],
  horizontal: ['Fissura horizontal (só à direita)', 'Da fissura oblíqua, na linha axilar média, até a 4ª cartilagem costal, na frente. Separa o lobo superior do médio.'],
  lsupD: ['Lobo superior direito', 'Na frente, ocupa a área acima da 4ª cartilagem; atrás, apenas a região acima de T3.'],
  lsupE: ['Lobo superior esquerdo', 'Ocupa quase toda a face anterior do pulmão esquerdo, inclusive a língula, que faz o papel do lobo médio desse lado.'],
  lmed: ['Lobo médio', 'Só existe à direita e só é acessível pela frente e pela axila: não se ausculta pelas costas.'],
  linfD: ['Lobo inferior direito', 'Ocupa quase todo o dorso abaixo de T3: é o lobo examinado na ausculta posterior das bases.'],
  linfE: ['Lobo inferior esquerdo', 'Como à direita, ocupa quase todo o dorso abaixo de T3.'],
  limpost: ['Limite inferior dos pulmões', 'Atrás, em torno de T10 na expiração tranquila.'],
  pleurapost: ['Limite inferior das pleuras', 'Atrás, em torno de T12.'],
  limlat: ['Limite inferior do pulmão', 'Na linha axilar média, em torno da 8ª costela.'],
  pleuralat: ['Limite inferior da pleura', 'Na linha axilar média, em torno da 10ª costela.'],
  limant: ['Limite inferior dos pulmões', 'Na frente, em torno da 6ª costela na linha hemiclavicular.'],
  pleuraant: ['Limite inferior das pleuras', 'Na frente, em torno da 8ª costela na linha hemiclavicular.'],
};

const CAMADAS = [
  ['osso', 'Ossos'], ['linhas', 'Linhas'], ['lobos', 'Lobos'], ['fissuras', 'Fissuras'], ['limites', 'Limites'], ['ref', 'Referências'],
];

export function superficie(node) {
  node.classList.add('superficie');
  node.innerHTML = `
    <div class="sf-fig"><svg class="sf-svg" viewBox="0 -30 500 640" role="img"></svg></div>
    <div class="sf-panel">
      <div class="sf-views" role="radiogroup" aria-label="Vista"></div>
      <div class="sf-layers" aria-label="Camadas"></div>
      <div class="sf-card" aria-live="polite"></div>
      <ul class="sf-keys">
        <li><span class="sw lb-sup"></span>Lobo superior</li><li><span class="sw lb-med"></span>Lobo médio</li><li><span class="sw lb-inf"></span>Lobo inferior</li>
        <li><span class="ln pulm"></span>Limite do pulmão</li><li><span class="ln pleura"></span>Limite da pleura</li>
      </ul>
      <p class="sf-note">Projeções aproximadas: mudam com o biotipo e com a fase da respiração.</p>
    </div>`;
  const svg = node.querySelector('.sf-svg');
  const card = node.querySelector('.sf-card');
  const VIEWS = { posterior: posterior(), lateral: lateral(), anterior: anterior() };
  let view = node.dataset.vista || 'posterior';
  const on = { osso: true, linhas: false, lobos: true, fissuras: true, limites: false, ref: true };
  let sel = null;

  const vb = node.querySelector('.sf-views');
  const vbtn = Object.entries(VIEWS).map(([k, v]) => {
    const b = button({ label: `Vista ${v.nome}`, text: v.nome, cls: 'seg', pressed: k === view });
    b.setAttribute('role', 'radio');
    b.addEventListener('click', () => { view = k; sel = null; vbtn.forEach((x, i) => x.setAttribute('aria-pressed', String(Object.keys(VIEWS)[i] === k))); draw(); });
    vb.appendChild(b); return b;
  });
  const lb = node.querySelector('.sf-layers');
  for (const [k, l] of CAMADAS) {
    const b = button({ label: `Camada: ${l}`, text: l, cls: 'chip', pressed: on[k] });
    b.addEventListener('click', () => { on[k] = !on[k]; b.setAttribute('aria-pressed', String(on[k])); draw(); });
    lb.appendChild(b);
  }
  function showCard() {
    if (!sel) {
      card.innerHTML = `<p class="sf-kicker">${VIEWS[view].nome}</p><h4>Toque numa estrutura</h4>
        <p class="sf-hint">Lobos, fissuras, linhas e referências ósseas abrem uma explicação. Ligue e desligue as camadas para comparar as vistas.</p>`;
      return;
    }
    const [t, d] = INFO[sel];
    card.innerHTML = `<p class="sf-kicker">${VIEWS[view].nome}</p><h4>${t}</h4><p>${d}</p>`;
  }
  function draw() {
    const v = VIEWS[view];
    const order = ['osso', 'lobos', 'limites', 'fissuras', 'linhas', 'ref'];
    svg.innerHTML = `<g class="sf-base">${v.base}</g>${order.map((k) => `<g class="sf-l sf-${k}" ${on[k] ? '' : 'style="display:none"'}>${v.camadas[k] || ''}</g>`).join('')}
      <g class="sf-side">${v.textos.map(([t, x, y]) => `<text x="${x}" y="${y}">${t}</text>`).join('')}</g>`;
    svg.setAttribute('aria-label', `Tórax, vista ${v.nome.toLowerCase()}`);
    svg.querySelectorAll('[data-k]').forEach((e) => {
      e.classList.add('sf-hot'); e.setAttribute('tabindex', '0'); e.setAttribute('role', 'button');
      e.setAttribute('aria-label', INFO[e.dataset.k]?.[0] || e.dataset.k);
      if (sel && e.dataset.k === sel) e.classList.add('sel');
    });
    svg.classList.toggle('has-sel', !!sel);
    showCard();
  }
  const pick = (k) => { sel = sel === k ? null : k; draw(); };
  svg.addEventListener('click', (e) => { const t = e.target.closest('[data-k]'); if (t) pick(t.dataset.k); });
  captureKeys(node, (e) => {
    const t = e.target.closest?.('[data-k]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { pick(t.dataset.k); return true; }
    if (e.key === 'Escape' && sel) { pick(sel); return true; }
    return false;
  });
  draw();
  return {};
}

