/**
 * Expansibilidade: mãos sobre as bases, polegares junto à coluna. Na
 * inspiração profunda as mãos se afastam; o que se compara é a simetria.
 * Animação esquemática; o achado real é tátil e visual.
 */
import { button, setIcon, captureKeys, prefersReducedMotion } from '../../core/ui.js';

const COND = {
  normal: { nome: 'Simétrica', d: 1, e: 1, txt: 'Os dois polegares se afastam da linha média igualmente na inspiração profunda. Registro: expansibilidade preservada e simétrica.' },
  direita: { nome: 'Reduzida à direita', d: 0.25, e: 1, txt: 'O polegar direito quase não se move. Redução unilateral aponta para o lado em que o pulmão não acompanha a parede ou dói ao expandir: derrame, consolidação, atelectasia, pneumotórax, dor pleurítica. O lado alterado é o que se move MENOS.' },
  bilateral: { nome: 'Reduzida bilateral', d: 0.35, e: 0.35, txt: 'Os dois lados se movem pouco. Ocorre quando o tórax já está insuflado (enfisema), quando a parede é rígida ou os músculos estão fracos (doenças neuromusculares, cifoescoliose), e com a dor.' },
};

function mao(lado) {
  // lado: -1 mão sobre o hemitórax esquerdo do paciente (esquerda da tela), +1 direito.
  // Palma espalmada, quatro dedos seguindo as costelas para fora, polegar junto à coluna.
  const g = (x) => 250 + lado * x;
  const palma = `M${g(34)} 268 L${g(118)} 262 C${g(130)} 262 ${g(134)} 270 ${g(134)} 280 L${g(132)} 322 C${g(130)} 332 ${g(122)} 336 ${g(112)} 336 L${g(44)} 332 C${g(34)} 330 ${g(28)} 322 ${g(28)} 312 L${g(28)} 278 C${g(28)} 272 ${g(30)} 268 ${g(34)} 268 Z`;
  const dedos = [0, 1, 2, 3].map((k) => {
    const y = 268 + k * 17, len = [66, 74, 70, 56][k], dy = -10 - k * 2;
    return `<path class="ex-fing" d="M${g(126)} ${y} L${g(126 + len)} ${y + dy}"/>`;
  }).join('');
  const polegar = `<path class="ex-fing" d="M${g(40)} 276 L${g(10)} 296"/>`;
  return `<g class="ex-hand" data-lado="${lado}">${dedos}${polegar}<path class="ex-palm" d="${palma}"/></g>`;
}

export function expansib(node) {
  node.classList.add('expansib');
  node.tabIndex = 0;
  node.innerHTML = `
    <figure class="ex-photo"><img src="${window.__img?.['expansibilidade.webp'] || ''}" alt="Examinadora atrás do paciente sentado, com as mãos espalmadas sobre as bases do tórax e os polegares junto à coluna"></figure>
    <div class="ex-sim">
      <svg class="ex-svg" viewBox="0 0 500 420" aria-hidden="true">
        <path class="ex-back" d="M40 40 C60 20 150 10 250 10 C350 10 440 20 460 40 C480 160 478 300 470 420 L30 420 C22 300 20 160 40 40 Z"/>
        <path class="ex-spine" d="M250 10V420"/>
        <path class="ex-rib" d="M250 120 C300 112 380 128 452 170 M250 120 C200 112 120 128 48 170 M250 190 C300 182 380 198 458 240 M250 190 C200 182 120 198 42 240 M250 260 C300 252 380 268 462 310 M250 260 C200 252 120 268 38 310"/>
        <g class="ex-hands">${mao(-1)}${mao(1)}</g>
        <g class="ex-meter"><path class="ex-mid" d="M250 210V236"/><path class="ex-bar e" d=""/><path class="ex-bar d" d=""/></g>
        <text class="ex-lado" x="80" y="404">esquerdo</text><text class="ex-lado" x="420" y="404">direito</text>
      </svg>
      <div class="ex-phase" aria-live="polite"></div>
    </div>
    <div class="ex-panel">
      <div class="ex-tr"></div>
      <div class="ex-cond" role="radiogroup" aria-label="Situação"></div>
      <div class="ex-card" aria-live="polite"></div>
      <p class="ex-tip"><b>Ápices:</b> mãos sobre as regiões supraclaviculares e escapulares superiores, polegares junto à coluna, comparando a elevação dos dois lados.</p>
      <span class="tag sim">Animação esquemática · o achado real é tátil</span>
    </div>`;
  const hands = [...node.querySelectorAll('.ex-hand')];
  const barE = node.querySelector('.ex-bar.e'), barD = node.querySelector('.ex-bar.d');
  const phase = node.querySelector('.ex-phase');
  const card = node.querySelector('.ex-card');
  let cond = 'normal', raf = 0, t0 = 0, active = false, playing = false;
  const bPlay = button({ icon: 'play', label: 'Respirar fundo (espaço)', text: 'Respirar fundo', cls: 'primary' });
  node.querySelector('.ex-tr').appendChild(bPlay);
  const cbs = Object.entries(COND).map(([k, c]) => {
    const b = button({ label: c.nome, text: c.nome, cls: 'chip', pressed: k === cond });
    b.addEventListener('click', () => { cond = k; cbs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); card.innerHTML = `<h4>${c.nome}</h4><p>${c.txt}</p>`; set(0.95); });
    node.querySelector('.ex-cond').appendChild(b); return b;
  });
  card.innerHTML = `<h4>${COND.normal.nome}</h4><p>${COND.normal.txt}</p>`;
  function set(v) {
    const c = COND[cond];
    const dx = { '-1': -c.e * v * 26, 1: c.d * v * 26 };
    hands.forEach((h) => h.setAttribute('transform', `translate(${dx[h.dataset.lado]} ${-v * 4})`));
    barE.setAttribute('d', `M250 223H${250 + dx[-1]}`); barD.setAttribute('d', `M250 223H${250 + dx[1]}`);
    phase.textContent = v > 0.05 ? 'inspiração profunda' : 'expiração';
  }
  function frame(now) {
    if (!t0) t0 = now;
    const u = ((now - t0) / 1000) % 5;
    const v = u < 2 ? (1 - Math.cos((Math.PI * u) / 2)) / 2 : u < 4 ? (1 + Math.cos((Math.PI * (u - 2)) / 2)) / 2 : 0;
    set(v);
    if (playing) raf = requestAnimationFrame(frame);
  }
  function play() { if (prefersReducedMotion()) { set(0.95); return; } playing = true; t0 = 0; setIcon(bPlay, 'pause'); raf = requestAnimationFrame(frame); }
  function stop() { playing = false; cancelAnimationFrame(raf); setIcon(bPlay, 'play'); }
  bPlay.addEventListener('click', () => (playing ? stop() : play()));
  captureKeys(node, (e) => { if (e.key === ' ' && e.target === node) { playing ? stop() : play(); return true; } return false; });
  set(0);
  return { activate() { active = true; }, deactivate() { active = false; stop(); }, pause: stop };
}

