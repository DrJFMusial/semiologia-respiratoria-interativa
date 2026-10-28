/**
 * Laboratório do ciclo respiratório: tórax esquemático, traçados de fase,
 * volume, fluxo e pressão pleural, e o som ESQUEMÁTICO com forma de onda e
 * espectrograma, tudo no mesmo eixo de tempo. Ensina EM QUE MOMENTO do
 * ciclo cada som ocorre; o timbre real é ensinado com gravações clínicas.
 */
import { createThorax } from '../../core/thorax.js';
import { ACHADOS_LAB, renderLab, stateAt, cycleTable } from '../../core/synth.js';
import { SignalView } from '../../core/spectro.js';
import { toBuffer, playBuffer, stopCurrent } from '../../core/audio.js';
import { button, setIcon, captureKeys, prefersReducedMotion } from '../../core/ui.js';
import { loadLabWheeze } from '../../core/lab-audio.js';
import { loadStridor } from '../../core/estridor-audio.js';

const SPEEDS = [{ v: 0.25, l: '0,25×' }, { v: 0.5, l: '0,5×' }, { v: 1, l: '1×' }];
const COR_EV = { finos: 'var(--desc)', grossos: 'var(--desc)', atrito: 'var(--desc)', sibilos: 'var(--cont)', roncos: 'var(--cont)', estridor: 'var(--cont)' };

export function cicloResp(node) {
  node.classList.add('ciclo-resp');
  node.tabIndex = 0;
  node.setAttribute('role', 'application');
  node.setAttribute('aria-label', 'Laboratório do ciclo respiratório. Espaço: reproduzir ou pausar. Setas: fase anterior ou seguinte.');
  node.innerHTML = `
    <div class="cr-left">
      <div class="cr-phase" aria-live="polite"><span class="cr-ph-dot"></span><div><div class="cr-ph-name"></div><div class="cr-ph-sum"></div></div></div>
      <div class="cr-fig"></div>
      <div class="cr-readout">
        <div><span class="k">Volume</span><span class="v mono" data-r="vol"></span></div>
        <div><span class="k">Fluxo</span><span class="v" data-r="flow"></span></div>
        <div><span class="k">Frequência</span><span class="v mono" data-r="fr"></span></div>
        <div><span class="k">Inspiração : expiração</span><span class="v mono" data-r="ie"></span></div>
      </div>
    </div>
    <div class="cr-right">
      <svg class="cr-plots" viewBox="0 0 900 250" preserveAspectRatio="none" aria-hidden="true"></svg>
      <div class="cr-sig-head"><span class="cr-sig-t">Som no ponto escolhido</span><span class="tag esq">Som sintetizado esquemático</span></div>
      <canvas class="cr-sig" role="img" aria-label="Forma de onda e espectrograma do som do laboratório"></canvas>
      <div class="cr-detail" aria-live="polite"></div>
    </div>
    <div class="cr-controls">
      <div class="grp cr-tr"></div>
      <div class="grp cr-speed" role="radiogroup" aria-label="Velocidade"></div>
      <div class="grp cr-ponto" role="radiogroup" aria-label="Ponto de ausculta"></div>
      <div class="grp cr-ach" role="radiogroup" aria-label="Achado"></div>
      <div class="grp cr-lay"></div>
    </div>`;

  const th = createThorax(node.querySelector('.cr-fig'));
  const plots = node.querySelector('.cr-plots');
  const sig = new SignalView(node.querySelector('.cr-sig'), { fmax: 1500 });
  const detail = node.querySelector('.cr-detail');
  const ph = { name: node.querySelector('.cr-ph-name'), sum: node.querySelector('.cr-ph-sum'), dot: node.querySelector('.cr-ph-dot') };
  const rd = Object.fromEntries([...node.querySelectorAll('[data-r]')].map((e) => [e.dataset.r, e]));

  let ponto = 'base', achado = 'normal', speed = 0.5, t = 0, playing = false, soundOn = false, raf = 0, last = 0, player = null, render = null, showPpl = false;
  let authoredStridor = null;
  let authoredWheeze = null, revision = 0, active = false, resumeAfterLoad = false;

  // ---- controles -------------------------------------------------------------
  const bPrev = button({ icon: 'prev', label: 'Fase anterior (seta esquerda)' });
  const bPlay = button({ icon: 'play', label: 'Reproduzir (espaço)', cls: 'primary' });
  const bNext = button({ icon: 'next', label: 'Próxima fase (seta direita)' });
  const bSound = button({ icon: 'mute', label: 'Som esquemático (só em 1×)', text: 'Som', pressed: false });
  node.querySelector('.cr-tr').append(bPrev, bPlay, bNext, bSound);
  const spB = SPEEDS.map((s) => {
    const b = button({ label: `Velocidade ${s.l}`, text: s.l, cls: 'seg', pressed: s.v === speed });
    b.addEventListener('click', () => { setSpeed(s.v); });
    node.querySelector('.cr-speed').appendChild(b); return b;
  });
  function setSpeed(v) {
    speed = v; spB.forEach((b, i) => b.setAttribute('aria-pressed', String(SPEEDS[i].v === v)));
    if (speed !== 1 && soundOn) toggleSound(false);
    restartAudio();
  }
  const pB = [['base', 'Base pulmonar'], ['traqueia', 'Traqueia']].map(([k, l]) => {
    const b = button({ label: `Ponto: ${l}`, text: l, cls: 'seg', pressed: k === ponto });
    b.addEventListener('click', () => { ponto = k; pB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); rebuild(); });
    node.querySelector('.cr-ponto').appendChild(b); return b;
  });
  const aB = Object.entries(ACHADOS_LAB).map(([k, a]) => {
    const b = button({ label: `Achado: ${a.nome}`, text: k === 'normal' ? 'Normal' : k === 'bronquico' ? 'Som brônquico' : a.nome, cls: 'chip', pressed: k === achado });
    b.addEventListener('click', () => { achado = k; aB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); rebuild(); });
    node.querySelector('.cr-ach').appendChild(b); return b;
  });
  const bPpl = button({ label: 'Mostrar a pressão pleural', text: 'Pressão pleural', cls: 'chip', pressed: false });
  bPpl.addEventListener('click', () => { showPpl = !showPpl; bPpl.setAttribute('aria-pressed', String(showPpl)); drawPlots(); });
  node.querySelector('.cr-lay').append(bPpl);

  // ---- traçados ----------------------------------------------------------------
  const W = 900, L = 96;
  function drawPlots() {
    const tab = render.tab;
    if (achado === 'estridor') {
      plots.innerHTML = ''; plots.hidden = true; return;
    }
    plots.hidden = false;
    const X = (s) => L + (s / tab.T) * (W - L - 6);
    const strips = [{ k: 'vol', nome: 'Volume', h: 70 }, { k: 'flow', nome: 'Fluxo', h: 80 }];
    if (showPpl) strips.push({ k: 'ppl', nome: 'P pleural', h: 60 });
    const H = 30 + strips.reduce((a, s) => a + s.h + 12, 0);
    plots.setAttribute('viewBox', `0 0 ${W} ${H}`);
    plots.style.aspectRatio = `${W} / ${H}`;
    let h = `<g class="cr-bands">
      <rect class="b-insp" data-ph="insp" x="${X(0)}" y="2" width="${X(tab.ti) - X(0)}" height="22"/>
      <rect class="b-exp" data-ph="exp" x="${X(tab.ti)}" y="2" width="${X(tab.fimExp) - X(tab.ti)}" height="22"/>
      <rect class="b-pau" data-ph="pausa" x="${X(tab.fimExp)}" y="2" width="${Math.max(0, X(tab.T) - X(tab.fimExp))}" height="22"/>
      <text x="${(X(0) + X(tab.ti)) / 2}" y="17">inspiração</text><text x="${(X(tab.ti) + X(tab.fimExp)) / 2}" y="17">expiração</text>
      ${tab.T - tab.fimExp > 0.4 ? `<text x="${(X(tab.fimExp) + X(tab.T)) / 2}" y="17">pausa</text>` : ''}
    </g><text class="cr-st" x="4" y="17">Fase</text>`;
    let y = 30;
    for (const s of strips) {
      const vals = []; for (let q = 0; q <= tab.T; q += 0.02) { const st = stateAt(q, ACHADOS_LAB[achado].variante); vals.push([q, s.k === 'vol' ? st.vol : s.k === 'flow' ? st.flow : -5 - 3 * st.vol - st.flow]); }
      const [mn, mx] = s.k === 'vol' ? [0, 1] : s.k === 'flow' ? [-1, 1] : [-9.5, -3.5];
      const Y = (v) => y + s.h - ((v - mn) / (mx - mn)) * s.h;
      h += `<rect class="cr-sbg" x="${L}" y="${y}" width="${W - L - 6}" height="${s.h}"/>
        <text class="cr-st" x="4" y="${y + 16}">${s.nome}</text>`;
      if (s.k === 'flow') h += `<path class="cr-zero" d="M${L} ${Y(0)}H${W - 6}"/><text class="cr-ax" x="${L - 6}" y="${y + 12}">entra</text><text class="cr-ax" x="${L - 6}" y="${y + s.h - 2}">sai</text>`;
      if (s.k === 'ppl') h += `<text class="cr-ax" x="${L - 6}" y="${Y(-5) + 4}">−5</text><text class="cr-ax" x="${L - 6}" y="${Y(-8) + 4}">−8</text>`;
      h += `<path class="cr-tr ${s.k}" d="${vals.map(([q, v], i) => `${i ? 'L' : 'M'}${X(q).toFixed(1)} ${Y(v).toFixed(1)}`).join('')}"/>`;
      y += s.h + 12;
    }
    // eventos do achado
    for (const ev of render.eventos) {
      const [a, b] = [ev.inicio, ev.fim];
      h += `<rect class="cr-ev" style="fill:${COR_EV[achado]}" x="${X(a)}" y="26" width="${X(b) - X(a)}" height="${H - 28}"/>`;
    }
    h += `<path class="cr-cursor" d=""/>`;
    plots.innerHTML = h;
    plots.querySelectorAll('[data-ph]').forEach((r) => r.addEventListener('click', () => goPhase(r.dataset.ph)));
  }

  async function rebuild() {
    const request = ++revision;
    const resume = playing || resumeAfterLoad;
    pause();
    resumeAfterLoad = resume;
    let audioError = false;
    if (achado === 'sibilos' && !authoredWheeze) {
      node.dataset.audioSource = 'loading';
      bPlay.disabled = bSound.disabled = true;
      detail.textContent = 'Carregando o novo arquivo de sibilos…';
      try { authoredWheeze = await loadLabWheeze(); }
      catch { audioError = true; }
    }
    if (achado === 'estridor' && !authoredStridor) {
      bPlay.disabled = bSound.disabled = true;
      detail.textContent = 'Carregando o arquivo de estridor do professor…';
      try { authoredStridor = await loadStridor(); } catch { audioError = true; }
    }
    if (request !== revision) return;
    bPlay.disabled = false;
    bSound.disabled = audioError;
    const usesAuthor = achado === 'sibilos' && authoredWheeze;
    node.dataset.audioSource = audioError ? 'error' : achado === 'estridor' ? 'professor-stridor' : usesAuthor ? 'author' : 'synthetic';
    const tag = node.querySelector('.cr-sig-head .tag');
    tag.textContent = audioError ? 'Áudio indisponível' : achado === 'estridor' ? 'Arquivo de estridor do professor' : usesAuthor ? 'Trecho de sibilo.mp3 do professor' : 'Som sintetizado esquemático';
    // Na falha de carregamento não substitui silenciosamente o arquivo pelo tom antigo.
    const wheeze = authoredWheeze || { data: new Float32Array(0), sr: 16000 };
    if (achado === 'estridor') {
      const r = authoredStridor || {data:new Float32Array(16000),sr:16000};
      render = { ...r, tab:{T:r.data.length/r.sr}, eventos:[] };
    } else render = renderLab(ponto, achado, achado === 'sibilos' ? { wheeze } : {});
    const tab = render.tab;
    const ach = ACHADOS_LAB[achado];
    sig.fmax = achado === 'estridor' ? 4000 : usesAuthor ? 2000 : 1500;
    sig.set({
      data: render.data, sr: render.sr,
      bands: achado === 'estridor' ? [] : [{ t0: 0, t1: tab.ti, cor: getVar('--insp') }, { t0: tab.ti, t1: tab.fimExp, cor: getVar('--exp') }],
      events: render.eventos.map(ev => ({ ...ev, cor: getVar(achado in COR_EV ? (COR_EV[achado] === 'var(--cont)' ? '--cont' : '--desc') : '--sound') })),
      range: 50,
    });
    const pontoTxt = ponto === 'traqueia'
      ? 'Na traqueia o som é áspero e alto, com expiração tão longa ou mais longa que a inspiração e uma pausa nítida entre as fases.'
      : 'Na base, o murmúrio vesicular ocupa toda a inspiração e só o início da expiração, mais fraco: o pulmão aerado filtra as frequências altas.';
    detail.innerHTML = `<p><b>${ach.nome}.</b> ${ach.texto || pontoTxt}</p>${ach.soBase && ponto === 'traqueia' ? '<p class="cr-warn">Este achado é definido pela base: na traqueia esse padrão é o normal.</p>' : ''}
      ${achado === 'estridor' && ponto === 'base' ? '<p class="cr-warn">O estridor nasce na via aérea alta: compare com o ponto traqueia, onde é mais intenso.</p>' : ''}`;
    if (achado === 'estridor') {
      detail.innerHTML = '<p><b>Estridor — arquivo selecionado pelo professor.</b> Reprodução integral em velocidade original. Não há marcação das fases respiratórias neste arquivo; volume, fluxo, FR e relação I:E não são inferidos do áudio. O mesmo arquivo é usado nas duas seleções de ponto.</p>';
    }
    if (usesAuthor) detail.insertAdjacentHTML('beforeend', `<p class="cr-audio-note">Trecho de sibilo.mp3 (${authoredWheeze.start.toFixed(2)}–${authoredWheeze.end.toFixed(2)} s do arquivo de ${authoredWheeze.originalDuration.toFixed(1)} s), inserido na expiração do modelo em velocidade original. O ciclo é ilustrativo.</p>`);
    if (audioError) {
      detail.insertAdjacentHTML('beforeend', '<p class="cr-warn">Não foi possível carregar o áudio. Selecione outro achado e tente novamente.</p>');
      toggleSound(false);
    }
    rd.fr.textContent = `${Math.round(60 / tab.T)} irpm`;
    rd.ie.textContent = `1 : ${((tab.fimExp - tab.ti) / tab.ti).toFixed(1).replace('.', ',')}`;
    if (achado === 'estridor') { rd.fr.textContent = 'não medida'; rd.ie.textContent = 'não medida'; }
    bPrev.disabled = bNext.disabled = bPpl.disabled = achado === 'estridor';
    for (const b of spB) b.disabled = achado === 'estridor';
    for (const b of pB) b.disabled = achado === 'estridor';
    bSound.setAttribute('aria-label', achado === 'estridor' ? 'Som do arquivo de estridor (velocidade original)' : 'Som esquemático (só em 1×)');
    if (achado === 'estridor') { speed = 1; spB.forEach((b,i)=>b.setAttribute('aria-pressed', String(SPEEDS[i].v===1))); }
    t = t % tab.T;
    drawPlots();
    restartAudio();
    paint();
    const shouldResume = resumeAfterLoad && active;
    resumeAfterLoad = false;
    if (shouldResume) play();
  }
  const getVar = (v) => getComputedStyle(node).getPropertyValue(v).trim() || '#888';

  // ---- tempo ---------------------------------------------------------------------
  const FASE = {
    insp: ['Inspiração', 'Diafragma desce, tórax se amplia, pressão alveolar abaixo da atmosférica: o ar entra.'],
    exp: ['Expiração', 'Passiva em repouso: o recuo elástico torna a pressão alveolar positiva e o ar sai.'],
    pausa: ['Pausa', 'Fluxo zero: sem fluxo não há som respiratório.'],
  };
  function paint() {
    if (achado === 'estridor') {
      th.set({vol:0,fluxo:0,hiper:0,bronco:0,D:{consol:0}});
      ph.name.textContent = 'Arquivo de estridor'; ph.sum.textContent = 'Sem fases respiratórias anotadas; escuta em velocidade original.';
      node.dataset.fase = 'nao-anotada'; rd.vol.textContent = 'não medido'; rd.flow.textContent = 'não medido';
      sig.setCursor(t); return;
    }
    const st = stateAt(t, ACHADOS_LAB[achado].variante);
    th.set({ vol: st.vol, fluxo: st.flow, hiper: achado === 'sibilos' ? 0.25 : 0, bronco: achado === 'sibilos' ? 1 : 0, D: { consol: achado === 'bronquico' ? 0.9 : 0 } });
    ph.name.textContent = FASE[st.fase][0]; ph.sum.textContent = FASE[st.fase][1];
    node.dataset.fase = st.fase;
    rd.vol.textContent = `${Math.round(st.vol * 100)}%`;
    rd.flow.textContent = Math.abs(st.flow) < 0.04 ? 'zero' : st.flow > 0 ? 'entrando' : 'saindo';
    const tab = st.tab;
    const X = (s) => L + (s / tab.T) * (W - L - 6);
    plots.querySelector('.cr-cursor')?.setAttribute('d', `M${X(st.t)} 0V2000`);
    plots.querySelectorAll('[data-ph]').forEach((r) => r.classList.toggle('on', r.dataset.ph === st.fase));
    sig.setCursor(st.t);
  }
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
    if (player && soundOn) t = (player.offset + Math.max(0, player.ctx.currentTime - player.startedAt)) % render.tab.T;
    else t = (t + dt * speed) % render.tab.T;
    th.tick(now);
    paint();
    if (playing) raf = requestAnimationFrame(frame);
  }
  function restartAudio() {
    { const p = player; player = null; p?.stop(); }
    if (playing && soundOn && speed === 1) {
      player = playBuffer(toBuffer(render.data, render.sr), { loop: true, offset: t, onStop: () => { if (player && playing) { player = null; pause(); } } });
    }
  }
  function play() {
    if (prefersReducedMotion() && !soundOn) { stepPhase(1); return; }
    playing = true; last = 0; setIcon(bPlay, 'pause'); restartAudio(); raf = requestAnimationFrame(frame);
  }
  function pause() { playing = false; resumeAfterLoad = false; cancelAnimationFrame(raf); setIcon(bPlay, 'play'); { const p = player; player = null; p?.stop(); } }
  function toggleSound(on = !soundOn) {
    soundOn = on; setIcon(bSound, on ? 'sound' : 'mute'); bSound.setAttribute('aria-pressed', String(on));
    if (on && speed !== 1) setSpeed(1);
    if (!on) { { const p = player; player = null; p?.stop(); } } else restartAudio();
  }
  function goPhase(f) {
    const tab = render.tab; pause();
    t = f === 'insp' ? 0.001 : f === 'exp' ? tab.ti + 0.001 : tab.fimExp + 0.001;
    paint();
  }
  function stepPhase(dir) {
    if (achado === 'estridor') return;
    const order = render.tab.T - render.tab.fimExp > 0.3 ? ['insp', 'exp', 'pausa'] : ['insp', 'exp'];
    const cur = stateAt(t, ACHADOS_LAB[achado].variante).fase;
    let i = order.indexOf(cur); if (i < 0) i = order.length - 1;
    goPhase(order[(i + dir + order.length) % order.length]);
  }
  bPlay.addEventListener('click', () => (playing ? pause() : play()));
  bPrev.addEventListener('click', () => stepPhase(-1));
  bNext.addEventListener('click', () => stepPhase(1));
  bSound.addEventListener('click', () => toggleSound());
  captureKeys(node, (e) => {
    if (e.target !== node) return false;
    if (e.key === ' ') { playing ? pause() : play(); return true; }
    if (e.key === 'ArrowRight') { stepPhase(1); return true; }
    if (e.key === 'ArrowLeft') { stepPhase(-1); return true; }
    return false;
  });
  rebuild();
  cycleTable('obstrutivo');
  return { activate() { active = true; }, deactivate() { active = false; pause(); }, pause };
}

