/**
 * Artefato de ausculta sobre a roupa (SIMULAÇÃO sintetizada).
 * Comparar: o mesmo ponto, três ciclos, sobre a pele e sobre tecido, com a
 *           origem de cada som revelável (ruído adventício x artefato).
 * Desafio:  três casos ouvidos sobre a roupa; o aluno decide e só então
 *           "repete sobre a pele" para conferir.
 * Nada aqui é registro clínico: a tela identifica todos os sons como simulação.
 */
import { renderArtefato } from '../../core/synth.js';
import { SignalView } from '../../core/spectro.js';
import { toBuffer, playBuffer } from '../../core/audio.js';
import { button, setIcon, captureKeys } from '../../core/ui.js';

const CONDS = {
  normal: { n: 'Pulmão normal', real: false },
  finos: { n: 'Estertores finos', real: true },
  atrito: { n: 'Atrito pleural', real: true },
};
const EXPL = {
  pele: {
    normal: 'Sobre a pele, só o murmúrio vesicular: nenhum ruído adventício.',
    finos: 'Sobre a pele, os estertores finos aparecem no meio e no fim da inspiração, neste modelo, na mesma fase dos ciclos.',
    atrito: 'Sobre a pele, o atrito aparece no fim da inspiração e no início da expiração, neste modelo, repetindo a mesma fase dos ciclos.',
  },
  tecido: {
    normal: 'Sobre a roupa, o atrito do tecido produz estalos e rangidos em momentos irregulares, nas duas fases e diferentes a cada ciclo. O pulmão é normal: todos esses sons são artefato.',
    finos: 'Sobre a roupa, os estertores verdadeiros ficam mais fracos e se misturam aos estalos do tecido. Não dá para separar um do outro sem repetir sobre a pele.',
    atrito: 'Sobre a roupa, o atrito verdadeiro fica abafado e os rangidos do tecido se somam a ele. Só a ausculta sobre a pele mostra o que pertence à pleura.',
  },
};
const CASOS = [
  { c: 'atrito', n: 'Caso 1' },
  { c: 'normal', n: 'Caso 2' },
  { c: 'finos', n: 'Caso 3' },
];

export function artefato(node) {
  node.classList.add('art');
  node.innerHTML = `
    <div class="art-left">
      <svg class="art-fig" viewBox="0 0 360 200" role="img" aria-label="Corte da parede do tórax com o diafragma do estetoscópio; sobre a roupa, o tecido fica entre a pele e o diafragma">
        <rect class="art-lung" x="0" y="150" width="360" height="50"/>
        <path class="art-skin" d="M0 150 H360"/>
        <text class="art-l" x="8" y="186">pulmão e parede torácica</text>
        <g class="art-cloth"><path d="M0 140 C30 132 50 146 80 138 C110 130 130 146 160 138 C190 130 210 146 240 138 C270 130 290 146 320 138 C340 133 352 140 360 138" /><text class="art-l w" x="250" y="128">tecido</text>
          <g class="art-spark"><path d="M112 126 l6 -10 M120 128 l10 -6 M104 124 l-2 -11"/><path d="M232 126 l6 -10 M240 128 l10 -6"/></g></g>
        <g class="art-steth"><rect x="130" y="96" width="100" height="22" rx="10"/><rect x="170" y="40" width="20" height="58" rx="6"/><path d="M180 40 C180 18 230 10 250 6"/></g>
        <text class="art-l art-cap" x="10" y="22"></text>
      </svg>
      <div class="art-txt">
        <h4>Conduta diante de um ruído suspeito</h4>
        <ol>
          <li>Repetir a ausculta <b>diretamente sobre a pele</b>; se a exposição for limitada, deslizar o diafragma por baixo da roupa.</li>
          <li><b>Persistência:</b> o som volta em vários ciclos?</li>
          <li><b>Localização:</b> continua no mesmo ponto?</li>
          <li><b>Fase:</b> mantém relação fixa com a inspiração ou a expiração?</li>
        </ol>
        <p class="art-key">Antes de interpretar o achado, repita a ausculta diretamente sobre a pele. A regularidade mostrada é uma convenção desta simulação, não um teste diagnóstico.</p>
      </div>
    </div>
    <div class="art-right">
      <div class="art-modo" role="radiogroup" aria-label="Modo"></div>
      <div class="art-ctl"></div>
      <canvas class="art-sig" role="img" aria-label="Forma de onda e espectrograma, com faixas de inspiração e expiração"></canvas>
      <div class="art-bar"><span class="tag sim">Simulação sintetizada · não é gravação clínica</span></div>
      <div class="art-res" aria-live="polite"></div>
    </div>`;
  const sv = new SignalView(node.querySelector('.art-sig'), { fmax: 1000 });
  const cache = {};
  const get = (c) => (cache[c] ||= renderArtefato(c));
  const st = { modo: 'comparar', cond: 'normal', sup: 'tecido', origem: false, caso: 0, resp: {}, conferido: {}, player: null, raf: 0 };
  const ctl = node.querySelector('.art-ctl'), res = node.querySelector('.art-res');
  const cloth = node.querySelector('.art-cloth'), cap = node.querySelector('.art-cap');

  function atual() {
    const c = st.modo === 'comparar' ? st.cond : CASOS[st.caso].c;
    const sup = st.modo === 'comparar' ? st.sup : (st.conferido[st.caso] ? 'pele' : 'tecido');
    return { c, sup, r: get(c) };
  }
  function draw() {
    const { c, sup, r } = atual();
    const mostrar = st.modo === 'comparar' ? st.origem : !!st.conferido[st.caso];
    sv.set({ data: r[sup].data, sr: r.sr, bands: r.bands, events: mostrar ? r[sup].events : [] });
    cloth.style.display = sup === 'tecido' ? '' : 'none';
    cap.textContent = sup === 'tecido' ? 'diafragma sobre a roupa' : 'diafragma sobre a pele';
    node.querySelector('.art-steth').setAttribute('transform', `translate(0 ${sup === 'tecido' ? 20 : 32})`);
    if (st.modo === 'comparar') {
      res.innerHTML = `<p><b>${CONDS[c].n}, ${sup === 'pele' ? 'sobre a pele' : 'sobre a roupa'}.</b> ${EXPL[sup][c]}</p>${st.origem ? '<p class="art-leg"><span class="lg r"></span>ruído adventício <span class="lg a"></span>artefato do tecido · faixas: inspiração (azul), expiração (cinza)</p>' : '<p class="art-hint">Ouça e tente dizer o que é pulmão e o que é tecido; depois toque em "Mostrar a origem dos sons".</p>'}`;
    } else desafio();
  }
  function desafio() {
    const k = st.caso, cs = CASOS[k], r = st.resp[k], ok = r !== undefined && r === CONDS[cs.c].real;
    let h = `<p><b>${cs.n}.</b> Ausculta na base, sobre a roupa. Há ruído adventício verdadeiro?</p>`;
    if (r === undefined) h += '<p class="art-hint">Ouça e responda antes de repetir sobre a pele.</p>';
    else if (!st.conferido[k]) h += `<p>Você respondeu: <b>${r ? 'ruído adventício verdadeiro' : 'artefato da roupa'}</b>. Agora repita sobre a pele e confira.</p>`;
    else h += `<p class="${ok ? 'ok' : 'no'}"><b>${ok ? 'Certo.' : 'Não.'}</b> Sobre a pele: ${CONDS[cs.c].real ? `<b>${CONDS[cs.c].n.toLowerCase()}</b>; o achado persiste neste modelo, na mesma fase dos ciclos.` : '<b>pulmão normal</b>; os estalos e rangidos ouvidos sobre a roupa eram artefato.'}</p>`;
    res.innerHTML = h;
    bRep.disabled = r === undefined || !!st.conferido[k];
    bSim.setAttribute('aria-pressed', String(r === true)); bNao.setAttribute('aria-pressed', String(r === false));
    bSim.disabled = bNao.disabled = !!st.conferido[k];
  }
  // controles
  const bPlay = button({ icon: 'play', label: 'Ouvir três ciclos', text: 'Ouvir', cls: 'primary' });
  const condRow = document.createElement('div'); condRow.className = 'art-row';
  const condBtns = Object.entries(CONDS).map(([k, v]) => {
    const b = button({ label: v.n, text: v.n, cls: 'chip', pressed: k === st.cond });
    b.addEventListener('click', () => { stop(); st.cond = k; condBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    condRow.appendChild(b); return b;
  });
  const supRow = document.createElement('div'); supRow.className = 'art-row seg-row';
  const supBtns = [['pele', 'Sobre a pele'], ['tecido', 'Sobre a roupa']].map(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: k === st.sup });
    b.addEventListener('click', () => { const tocando = !!st.player; stop(); st.sup = k; supBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); if (tocando) play(); });
    supRow.appendChild(b); return b;
  });
  const bOrig = button({ label: 'Mostrar a origem dos sons', text: 'Mostrar a origem dos sons', cls: 'chip', pressed: false });
  bOrig.addEventListener('click', () => { st.origem = !st.origem; bOrig.setAttribute('aria-pressed', String(st.origem)); draw(); });
  const casoRow = document.createElement('div'); casoRow.className = 'art-row seg-row';
  const casoBtns = CASOS.map((cs, i) => {
    const b = button({ label: cs.n, text: cs.n, cls: 'seg', pressed: i === 0 });
    b.addEventListener('click', () => { stop(); st.caso = i; casoBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    casoRow.appendChild(b); return b;
  });
  const bSim = button({ label: 'Ruído adventício verdadeiro', text: 'Ruído adventício verdadeiro', cls: 'chip', pressed: false });
  const bNao = button({ label: 'Artefato da roupa', text: 'Artefato da roupa', cls: 'chip', pressed: false });
  const bRep = button({ label: 'Repetir sobre a pele', text: 'Repetir sobre a pele', cls: 'ghost' });
  const ansRow = document.createElement('div'); ansRow.className = 'art-row'; ansRow.append(bSim, bNao, bRep);
  bSim.addEventListener('click', () => { st.resp[st.caso] = true; desafio(); });
  bNao.addEventListener('click', () => { st.resp[st.caso] = false; desafio(); });
  bRep.addEventListener('click', () => { stop(); st.conferido[st.caso] = true; draw(); play(); });
  const bReset = button({ icon: 'restart', label: 'Recomeçar o desafio', text: 'Recomeçar', cls: 'ghost' });
  bReset.addEventListener('click', () => { stop(); st.resp = {}; st.conferido = {}; draw(); });

  function layout() {
    ctl.replaceChildren();
    if (st.modo === 'comparar') { ctl.append(condRow, supRow); const r = document.createElement('div'); r.className = 'art-row'; r.append(bPlay, bOrig); ctl.append(r); }
    else { ctl.append(casoRow, ansRow); const r = document.createElement('div'); r.className = 'art-row'; r.append(bPlay, bReset); ctl.append(r); }
  }
  const modo = node.querySelector('.art-modo');
  const modoBtns = [['comparar', 'Comparar pele × roupa'], ['desafio', 'Desafio: artefato ou achado?']].map(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: k === st.modo });
    b.addEventListener('click', () => { stop(); st.modo = k; modoBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); layout(); draw(); });
    modo.appendChild(b); return b;
  });

  function tick() {
    if (!st.player) return;
    const p = st.player;
    sv.setCursor(Math.max(0, Math.min(p.duration, p.ctx.currentTime - p.startedAt)));
    st.raf = requestAnimationFrame(tick);
  }
  function play() {
    const { sup, r } = atual();
    st.player = playBuffer(toBuffer(r[sup].data, r.sr), {
      onEnd: () => { st.player = null; cancelAnimationFrame(st.raf); sv.setCursor(-1); idle(); },
      onStop: () => { st.player = null; cancelAnimationFrame(st.raf); sv.setCursor(-1); idle(); },
    });
    setIcon(bPlay, 'pause'); bPlay.querySelector('span').textContent = 'Parar';
    cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(tick);
  }
  function idle() { setIcon(bPlay, 'play'); bPlay.querySelector('span').textContent = 'Ouvir'; }
  function stop() { st.player?.stop(); st.player = null; cancelAnimationFrame(st.raf); sv.setCursor(-1); idle(); }
  bPlay.addEventListener('click', () => (st.player ? stop() : play()));
  captureKeys(node, () => false);
  layout(); draw();
  return { deactivate: stop, pause: stop };
}
