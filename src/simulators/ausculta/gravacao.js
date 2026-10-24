/**
 * Biblioteca de gravações clínicas com forma de onda e espectrograma.
 * Cada trecho mostra o rótulo ORIGINAL do acervo, a procedência, a licença
 * e os eventos anotados pelos autores do acervo. Nada toca sem clique.
 *
 * Também exporta dois componentes de som esquemático:
 *  somEsquema    botão que toca um ciclo sintetizado (laboratório) em laço
 *  fasesNormais  traqueal, broncovesicular e vesicular, com diagrama de fases
 */
import { CLIPS, TERMO, TIPO, loadClip, procedencia } from '../../core/clips.js';
import { SignalView } from '../../core/spectro.js';
import { toBuffer, playBuffer } from '../../core/audio.js';
import { renderLab } from '../../core/synth.js';
import { button, setIcon, captureKeys } from '../../core/ui.js';

const COR = { normal: '--ink-3', continuo: '--cont', descontinuo: '--desc' };
const curto = { Normal: 'normal', Wheeze: 'sibilo', Rhonchi: 'ronco', 'Fine Crackle': 'fino', 'Coarse Crackle': 'grosso' };

export function gravacao(node) {
  const ids = (node.dataset.clips || '').split(',').map((s) => s.trim()).filter((k) => CLIPS[k]);
  const cmp = (node.dataset.comparar || '').split('|').filter((k) => CLIPS[k]);
  node.classList.add('gravacao');
  node.innerHTML = `
    <div class="gv-tabs" role="radiogroup" aria-label="Gravações"></div>
    <div class="gv-head"><span class="tag clin">Gravação clínica</span><span class="gv-orig"></span></div>
    <canvas class="gv-sig" role="img"></canvas>
    <div class="gv-ctrl"></div>
    <p class="gv-proc"></p>
    <details class="gv-ficha"><summary>Ficha do trecho: procedência, licença e modificações</summary><div class="gv-fbody"></div></details>`;
  const sv = new SignalView(node.querySelector('.gv-sig'), { fmax: Number(node.dataset.fmax || 1000) });
  const canvas = node.querySelector('.gv-sig');
  const st = { id: ids[0], clip: null, player: null, loop: false, raf: 0, seq: null };
  const css = getComputedStyle(document.documentElement);

  const tabs = ids.map((id) => {
    const f = CLIPS[id];
    const b = button({ label: `${TERMO[f.rotulo_original]} (${f.uso})`, text: `${cap(TERMO[f.rotulo_original].split(' (')[0])} · ${f.uso === 'principal' ? 'A' : 'B'}`, cls: 'seg', pressed: id === st.id });
    b.dataset.id = id;
    b.addEventListener('click', () => select(id));
    node.querySelector('.gv-tabs').appendChild(b);
    return b;
  });
  if (ids.length < 2) node.querySelector('.gv-tabs').hidden = true;
  const ctrl = node.querySelector('.gv-ctrl');
  const bPlay = button({ icon: 'play', label: 'Ouvir a gravação', text: 'Ouvir', cls: 'primary' });
  const bLoop = button({ icon: 'loop', label: 'Repetir em laço', text: 'Laço', cls: 'chip', pressed: false });
  const bSpec = button({ label: 'Mostrar ou ocultar o espectrograma', text: 'Espectrograma', cls: 'chip', pressed: true });
  ctrl.append(bPlay, bLoop, bSpec);
  let bCmp = null;
  if (cmp.length === 2) {
    bCmp = button({ icon: 'play', label: `Comparar em sequência: ${TERMO[CLIPS[cmp[0]].rotulo_original]} e depois ${TERMO[CLIPS[cmp[1]].rotulo_original]}`, text: `Comparar ${curto[CLIPS[cmp[0]].rotulo_original]} × ${curto[CLIPS[cmp[1]].rotulo_original]}`, cls: 'ghost' });
    ctrl.append(bCmp);
  }
  const live = document.createElement('span'); live.className = 'gv-now'; live.setAttribute('aria-live', 'polite'); ctrl.append(live);

  async function select(id, keepSeq = false) {
    if (!keepSeq) stop();
    st.id = id;
    tabs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    const f = CLIPS[id];
    node.querySelector('.gv-orig').innerHTML = `Rótulo do acervo: <b>${f.rotulo_original}</b> → ${TERMO[f.rotulo_original]}`;
    node.querySelector('.gv-proc').textContent = `${procedencia(f)}${f.nota ? ` · ${f.nota}` : ''}`;
    node.querySelector('.gv-fbody').innerHTML = `
      <dl>
        <div><dt>Acervo</dt><dd>${f.fonte.acervo}, conjunto ${f.fonte.conjunto}</dd></div>
        <div><dt>Trecho do acervo</dt><dd class="mono">${f.id} · rótulo do registro: ${f.fonte.rotulo_do_registro}</dd></div>
        <div><dt>Aquisição</dt><dd>Ponto ${f.fonte.ponto}; ${f.fonte.estetoscopio}, ${f.fonte.amostragem_hz} Hz. Dados de paciente omitidos.</dd></div>
        <div><dt>Trecho usado</dt><dd>${f.trecho_original_s.map((x) => String(x).replace('.', ',')).join(' a ')} s do arquivo original</dd></div>
        <div><dt>Modificações</dt><dd>${f.modificacoes.join('; ')}</dd></div>
        <div><dt>Licença</dt><dd><a href="${f.licenca.url}" target="_blank" rel="noopener">${f.licenca.nome}</a>. ${f.citacao}</dd></div>
        <div><dt>SHA-256 do original</dt><dd class="mono gv-hash">${f.fonte.sha256_original}</dd></div>
      </dl>`;
    canvas.setAttribute('aria-label', `Forma de onda e espectrograma: ${TERMO[f.rotulo_original]}`);
    st.clip = await loadClip(id);
    if (st.id !== id) return;
    const col = (k) => css.getPropertyValue(COR[TIPO[k] || 'normal']).trim();
    sv.set({ data: st.clip.data, sr: st.clip.sr, events: f.eventos.map((e) => ({ ...e, cor: col(e.rotulo), curto: curto[e.rotulo] || e.rotulo })) });
  }
  function tick() {
    if (!st.player) return;
    const p = st.player;
    let tt = p.ctx.currentTime - p.startedAt;
    if (st.loop) tt %= p.duration;
    sv.setCursor(Math.max(0, Math.min(p.duration, tt)));
    st.raf = requestAnimationFrame(tick);
  }
  function play(onEnd = null) {
    if (!st.clip) return;
    st.player = playBuffer(toBuffer(st.clip.data, st.clip.sr), { loop: st.loop, onStop: () => { if (st.player && !st.seq) { st.player = null; cancelAnimationFrame(st.raf); sv.setCursor(-1); idle(); } }, onEnd: () => { st.player = null; cancelAnimationFrame(st.raf); sv.setCursor(-1); idle(); onEnd?.(); } });
    setIcon(bPlay, 'pause'); bPlay.querySelector('span').textContent = 'Parar';
    live.textContent = `Tocando: ${TERMO[CLIPS[st.id].rotulo_original]}`;
    cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(tick);
  }
  function idle() { setIcon(bPlay, 'play'); bPlay.querySelector('span').textContent = 'Ouvir'; live.textContent = ''; }
  function stop() { st.seq = null; st.player?.stop(); st.player = null; cancelAnimationFrame(st.raf); sv.setCursor(-1); idle(); }
  bPlay.addEventListener('click', () => (st.player ? stop() : play()));
  bLoop.addEventListener('click', () => { st.loop = !st.loop; bLoop.setAttribute('aria-pressed', String(st.loop)); if (st.player) { stop(); play(); } });
  bSpec.addEventListener('click', () => { const on = bSpec.getAttribute('aria-pressed') !== 'true'; bSpec.setAttribute('aria-pressed', String(on)); sv.setSpecVisible(on); });
  bCmp?.addEventListener('click', async () => {
    stop();
    const token = {}; st.seq = token;
    const loopWas = st.loop; st.loop = false;
    await select(cmp[0], true); if (st.seq !== token) return;
    play(async () => {
      if (st.seq !== token) return;
      await new Promise((r) => setTimeout(r, 500)); if (st.seq !== token) return;
      await select(cmp[1], true); if (st.seq !== token) return;
      play(() => { st.loop = loopWas; st.seq = null; });
    });
  });
  captureKeys(node, (e) => { if (e.key === ' ' && e.target === node) { bPlay.click(); return true; } return false; });
  select(st.id);
  return { deactivate: stop, pause: stop };
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------------------------------------ */
let esqAtual = null;
export function somEsquema(node) {
  const ponto = node.dataset.ponto || 'base', achado = node.dataset.achado || 'normal';
  const b = button({ icon: 'play', label: `${node.dataset.texto || 'Ouvir'} (som sintetizado esquemático)`, text: node.dataset.texto || 'Ouvir', cls: 'chip som' });
  node.appendChild(b);
  let player = null, buf = null;
  const stop = () => { player?.stop(); player = null; setIcon(b, 'play'); b.setAttribute('aria-pressed', 'false'); if (esqAtual === stop) esqAtual = null; };
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => {
    if (player) { stop(); return; }
    esqAtual?.();
    if (!buf) { const r = renderLab(ponto, achado); const d = new Float32Array(r.data.length * 2); d.set(r.data); d.set(r.data, r.data.length); buf = toBuffer(d, r.sr); }
    player = playBuffer(buf, { loop: true, onStop: () => { player = null; setIcon(b, 'play'); b.setAttribute('aria-pressed', 'false'); } });
    esqAtual = stop;
    setIcon(b, 'pause'); b.setAttribute('aria-pressed', 'true');
  });
  return { deactivate: stop, pause: stop };
}

/* ------------------------------------------------------------------------ */
export function fasesNormais(node) {
  const SONS = [
    { k: 'traqueal', nome: 'Traqueal', onde: 'sobre a traqueia, no pescoço', ins: 1, exp: 1.1, iInt: 0.9, eInt: 1, gap: true,
      txt: 'Áspero e alto. Expiração igual ou mais longa que a inspiração, com pausa nítida entre as fases.' },
    { k: 'bronco', nome: 'Broncovesicular', onde: 'junto ao esterno (2º espaço) e entre as escápulas', ins: 1, exp: 1, iInt: 0.7, eInt: 0.65, gap: false,
      txt: 'Intermediário: inspiração e expiração de duração parecida. Fora dessas áreas, é anormal.' },
    { k: 'vesic', nome: 'Murmúrio vesicular', onde: 'na maior parte dos campos pulmonares', ins: 1, exp: 0.38, iInt: 0.55, eInt: 0.25, gap: false,
      txt: 'Suave e grave. Ocupa toda a inspiração e só o início da expiração, mais fraco. É o normal na periferia do pulmão.' },
  ];
  node.classList.add('fases-normais');
  node.innerHTML = SONS.map((s) => `
    <div class="fn-row" data-k="${s.k}">
      <div class="fn-n"><b>${s.nome}</b><span>${s.onde}</span></div>
      <svg class="fn-svg" viewBox="0 0 220 60" aria-label="Inspiração ${s.ins === s.exp ? 'igual à' : 'mais longa que a'} expiração">
        <path class="fn-i" d="M10 50 L${10 + 100 * s.ins} ${50 - 40 * s.iInt} L${10 + 100 * s.ins} 50 Z"/>
        <path class="fn-e" d="M${10 + 100 * s.ins + (s.gap ? 14 : 4)} 50 L${10 + 100 * s.ins + (s.gap ? 14 : 4)} ${50 - 40 * s.eInt} L${10 + 100 * s.ins + (s.gap ? 14 : 4) + 96 * s.exp} 50 Z"/>
      </svg>
      <p class="fn-t">${s.txt}</p>
      <div class="fn-play"></div>
    </div>`).join('') + '<p class="fn-leg"><span class="fn-sw i"></span>inspiração <span class="fn-sw e"></span>expiração · altura = intensidade, largura = duração</p>';
  let atual = null;
  const bufs = {};
  function buffer(k) {
    if (bufs[k]) return bufs[k];
    let r;
    if (k === 'traqueal') r = renderLab('traqueia', 'normal');
    else if (k === 'vesic') r = renderLab('base', 'normal');
    else {
      const a = renderLab('traqueia', 'normal'), b = renderLab('base', 'normal');
      const d = new Float32Array(a.data.length);
      for (let i = 0; i < d.length; i++) {
        // atenua as altas do som traqueal com média móvel curta
        d[i] = 0.42 * (a.data[i] + (a.data[i - 1] || 0) + (a.data[i - 2] || 0)) / 3 * 2 + 0.6 * b.data[i];
      }
      r = { data: d, sr: a.sr };
    }
    const d2 = new Float32Array(r.data.length * 2); d2.set(r.data); d2.set(r.data, r.data.length);
    bufs[k] = toBuffer(d2, r.sr);
    return bufs[k];
  }
  const stopAll = () => { atual?.p.stop(); if (atual) { setIcon(atual.b, 'play'); atual.b.setAttribute('aria-pressed', 'false'); } atual = null; };
  node.querySelectorAll('.fn-row').forEach((row) => {
    const b = button({ icon: 'play', label: `Ouvir ${row.querySelector('b').textContent} (sintetizado esquemático)`, text: 'Ouvir', cls: 'chip som', pressed: false });
    row.querySelector('.fn-play').appendChild(b);
    b.addEventListener('click', () => {
      if (atual?.b === b) { stopAll(); return; }
      stopAll();
      atual = { b, p: playBuffer(buffer(row.dataset.k), { loop: true, onStop: () => { setIcon(b, 'play'); b.setAttribute('aria-pressed', 'false'); if (atual?.b === b) atual = null; } }) };
      setIcon(b, 'pause'); b.setAttribute('aria-pressed', 'true');
    });
  });
  return { deactivate: stopAll, pause: stopAll };
}

