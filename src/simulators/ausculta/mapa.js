/**
 * Mapa de ausculta: pontos simétricos sobre as ilustrações do autor
 * (posterior e lateral) e sobre o desenho anterior. Modo "sequência" mostra
 * o zigue-zague; modo "exercício" pede que o estudante marque a ordem,
 * comparando sempre o ponto simétrico antes de descer.
 */
import { button, captureKeys } from '../../core/ui.js';

const VISTAS = {
  posterior: {
    nome: 'Posterior', img: 'torax-posterior.webp', ratio: 824 / 1100,
    nota: 'Braços cruzados à frente: as escápulas se afastam e liberam a área interescapular. Sobre a escápula o som chega abafado.',
    lados: ['esquerdo', 'direito'],
    niveis: [['supraescapular', 39, 61, 41], ['interescapular superior', 42, 58, 48.5], ['interescapular inferior', 42, 58, 56], ['infraescapular', 35, 65, 63.5], ['base', 33, 67, 70.5]],
  },
  lateral: {
    nome: 'Lateral', img: 'torax-lateral-direito.webp', ratio: 823 / 1100,
    nota: 'Braço elevado, mão atrás da cabeça. Na axila direita se ausculta o lobo médio; compare com o mesmo nível à esquerda.',
    lados: ['direito'],
    niveis: [['axilar alto', 50, null, 40], ['axilar médio', 51, null, 49], ['axilar baixo', 52, null, 57.5], ['base lateral', 53, null, 65]],
  },
  anterior: {
    nome: 'Anterior', svg: true, ratio: 500 / 600,
    nota: 'Comece nas fossas supraclaviculares (ápices). Afaste a mama quando necessário e evite a área cardíaca à esquerda.',
    lados: ['direito', 'esquerdo'],
    niveis: [['supraclavicular', 38, 62, 12], ['2º espaço, hemiclavicular', 33, 67, 28], ['4º espaço, hemiclavicular', 33, 74, 39.5], ['6º espaço, axilar anterior', 20, 80, 50]],
  },
};

const ANTERIOR_SVG = `<svg viewBox="0 0 500 600" class="ma-svgbase" aria-hidden="true">
  <path class="ma-body" d="M214 0 C214 40 210 62 190 72 C140 82 82 92 62 124 C46 164 52 234 60 304 C66 384 72 470 84 560 L416 560 C428 470 434 384 440 304 C448 234 454 164 438 124 C418 92 360 82 310 72 C290 62 286 40 286 0"/>
  <path class="ma-bone" d="M236 100 H264 L266 150 L262 332 L250 362 L238 332 L234 150 Z"/>
  <path class="ma-clav" d="M236 100 C200 96 150 82 108 86 M264 100 C300 96 350 82 392 86"/>
  <path class="ma-heart" d="M244 196 C276 186 330 206 334 252 C338 292 300 316 262 318 C246 318 238 300 240 270 Z"/>
  <circle class="ma-nip" cx="165" cy="250" r="5"/><circle class="ma-nip" cx="335" cy="250" r="5"/>
</svg>`;

export function mapaAusculta(node) {
  node.classList.add('mapa-ausculta');
  node.innerHTML = `
    <div class="ma-top"><div class="ma-views" role="radiogroup" aria-label="Vista"></div><div class="ma-modes" role="radiogroup" aria-label="Modo"></div></div>
    <div class="ma-body-wrap"><div class="ma-fig"></div>
      <div class="ma-side"><div class="ma-card" aria-live="polite"></div><div class="ma-act"></div></div></div>`;
  const fig = node.querySelector('.ma-fig');
  const card = node.querySelector('.ma-card');
  const act = node.querySelector('.ma-act');
  let vista = 'posterior', modo = 'seq', clicks = [], done = false;

  const vB = Object.entries(VISTAS).map(([k, v]) => {
    const b = button({ label: `Vista ${v.nome}`, text: v.nome, cls: 'seg', pressed: k === vista });
    b.addEventListener('click', () => { vista = k; vB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); reset(); });
    node.querySelector('.ma-views').appendChild(b); return b;
  });
  const mB = [['seq', 'Sequência'], ['ex', 'Exercício']].map(([k, l]) => {
    const b = button({ label: `Modo ${l}`, text: l, cls: 'seg', pressed: k === modo });
    b.addEventListener('click', () => { modo = k; mB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); reset(); });
    node.querySelector('.ma-modes').appendChild(b); return b;
  });
  const bReset = button({ icon: 'restart', label: 'Recomeçar o exercício', text: 'Recomeçar', cls: 'ghost' });
  bReset.addEventListener('click', reset);
  act.appendChild(bReset);

  function pontos() {
    const v = VISTAS[vista];
    const out = [];
    v.niveis.forEach(([nome, xa, xb, y], n) => {
      out.push({ n, lado: 0, x: xa, y, nome: `${nome}, ${v.lados[0]}` });
      if (xb !== null) out.push({ n, lado: 1, x: xb, y, nome: `${nome}, ${v.lados[1]}` });
    });
    return out;
  }
  function draw() {
    const v = VISTAS[vista];
    const P = pontos();
    const ordem = []; // sequência de referência: em cada nível, lado 0 depois lado 1
    P.forEach((p) => ordem.push(p));
    const showSeq = modo === 'seq';
    const path = showSeq ? ordem.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y / (1 / v.ratio) * (1 / v.ratio)}`).join('') : '';
    fig.style.aspectRatio = `${v.ratio}`;
    fig.innerHTML = `${v.svg ? ANTERIOR_SVG : `<img src="${window.__img?.[v.img] || ''}" alt="Tórax, vista ${v.nome.toLowerCase()}">`}
      <svg class="ma-over" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${showSeq ? `<path class="ma-path" d="${path}"/>` : ''}</svg>
      ${P.map((p, i) => {
        const k = clicks.indexOf(i);
        const lab = showSeq ? i + 1 : k >= 0 ? k + 1 : '';
        return `<button type="button" class="ma-pt${k >= 0 ? ' on' : ''}${showSeq ? ' seq' : ''}" style="left:${p.x}%;top:${p.y}%" data-i="${i}" aria-label="${p.nome}">${lab}</button>`;
      }).join('')}`;
    fig.querySelectorAll('.ma-pt').forEach((b) => b.addEventListener('click', () => clickPt(Number(b.dataset.i))));
    bReset.hidden = modo !== 'ex';
    if (modo === 'seq') {
      card.innerHTML = `<h4>${v.nome}: ${P.length} pontos</h4><p>${v.nota}</p>
        <p>Em cada ponto, <b>um ciclo completo</b> (inspiração e expiração), com o paciente respirando pela boca, um pouco mais fundo que o normal. Compare cada ponto com o simétrico antes de descer.</p>`;
    } else if (!clicks.length) {
      card.innerHTML = `<h4>Exercício</h4><p>Marque os pontos na ordem em que você auscultaria, começando pelo alto.</p>${v.lados.length === 1 ? '<p class="ma-hint">Nesta vista só aparece o lado direito: desça um nível de cada vez.</p>' : ''}`;
    }
  }
  function clickPt(i) {
    if (modo !== 'ex' || done || clicks.includes(i)) return;
    const P = pontos();
    const p = P[i];
    const prev = clicks.length ? P[clicks[clicks.length - 1]] : null;
    const doisLados = VISTAS[vista].lados.length === 2;
    const nivelAtual = prev ? prev.n : -1;
    const parAberto = prev && doisLados && clicks.filter((c) => P[c].n === prev.n).length === 1;
    let erro = null;
    if (!prev && p.n !== 0) erro = 'Comece pelo nível mais alto (ápices).';
    else if (parAberto && p.n !== prev.n) erro = 'Antes de descer, ausculte o ponto simétrico do outro lado, no mesmo nível.';
    else if (prev && !parAberto && p.n !== nivelAtual + 1) erro = 'Desça um nível de cada vez, sem pular regiões.';
    if (erro) { card.innerHTML = `<div class="fb no"><p>${erro}</p></div>`; flash(i); return; }
    clicks.push(i);
    if (clicks.length === P.length) {
      done = true;
      card.innerHTML = `<div class="fb ok"><p><b>Sequência completa.</b> Comparar lado a lado, nível a nível, é o que permite reconhecer uma assimetria: o achado unilateral muitas vezes só aparece na comparação.</p></div>`;
    } else card.innerHTML = `<p class="ma-prog">${clicks.length} de ${P.length} pontos.</p><p class="ma-last">Último: ${p.nome}.</p>`;
    draw();
  }
  function flash(i) { const b = fig.querySelector(`[data-i="${i}"]`); b?.classList.add('err'); setTimeout(() => b?.classList.remove('err'), 600); }
  function reset() { clicks = []; done = false; draw(); }
  captureKeys(node, () => false);
  draw();
  return {};
}

