/**
 * Mecânica ventilatória: por que o ar entra e sai.
 * O diafragma e os intercostais aumentam o volume do tórax; a pressão
 * pleural fica mais negativa, o pulmão se expande, a pressão alveolar cai
 * abaixo da atmosférica e o ar entra. Na expiração tranquila o recuo
 * elástico inverte o gradiente. Condições mostram o que muda quando a
 * pleura recebe ar ou líquido, ou quando a via aérea se estreita.
 * Valores em cmH2O, ilustrativos.
 */
import { createThorax } from '../../core/thorax.js';
import { stateAt } from '../../core/synth.js';
import { button, setIcon, captureKeys, prefersReducedMotion } from '../../core/ui.js';

const COND = {
  normal: {
    nome: 'Normal', variante: 'normal',
    th: {}, ppl: (v, f) => [-5 - 3 * v - 1 * f, -5 - 3 * v - 1 * f], palv: (f) => -1 * f,
    titulo: 'Gradiente de pressão gera o fluxo',
    texto: 'Na inspiração o tórax se amplia, a pressão pleural cai de cerca de −5 para −8 cmH₂O e o pulmão acompanha a parede. A pressão alveolar fica um pouco abaixo da atmosférica e o ar entra. Na expiração tranquila não há esforço: o recuo elástico do pulmão torna a pressão alveolar positiva e o ar sai.',
    exame: 'Expansibilidade simétrica, murmúrio vesicular presente nos dois lados.',
  },
  pneumo: {
    nome: 'Pneumotórax à direita', variante: 'normal',
    th: { D: { colapso: 0.85, expande: 0 } }, ppl: (v, f) => [0, -5 - 3 * v - 1 * f], palv: (f) => -1 * f, ladoD: 'parado',
    titulo: 'Ar na pleura desfaz o acoplamento',
    texto: 'Com ar entre as pleuras, a pressão pleural daquele lado iguala a atmosférica. Nada mais puxa o pulmão contra a parede: ele se retrai pelo próprio recuo elástico e não acompanha a inspiração. O outro lado ventila normalmente.',
    exame: 'Expansibilidade e frêmito diminuídos à direita, hipersonoridade, murmúrio diminuído ou abolido. Se a pressão do ar aprisionado subir (pneumotórax hipertensivo), o mediastino é empurrado para o outro lado: emergência.',
  },
  derrame: {
    nome: 'Derrame pleural à direita', variante: 'normal',
    th: { D: { liquido: 0.55, expande: 0.35 } }, ppl: (v, f) => [-2 - 1 * v - 0.4 * f, -5 - 3 * v - 1 * f], palv: (f) => -1 * f,
    titulo: 'Líquido ocupa o espaço do pulmão',
    texto: 'O líquido se acumula primeiro no recesso costofrênico e comprime o pulmão de baixo para cima. A base daquele lado se expande pouco e o pulmão fica afastado da parede.',
    exame: 'Expansibilidade diminuída, frêmito diminuído ou abolido e macicez na base direita; murmúrio diminuído; egofonia possível na borda superior do líquido.',
  },
  obstrucao: {
    nome: 'Obstrução ao fluxo', variante: 'obstrutivo',
    th: { hiper: 0.6, bronco: 1 }, ppl: (v, f) => [-6 - 3 * v - 2.6 * f, -6 - 3 * v - 2.6 * f], palv: (f) => -2.6 * f,
    titulo: 'Via aérea estreita, expiração longa',
    texto: 'Com brônquios estreitados, o mesmo fluxo exige uma diferença de pressão maior. A expiração fica lenta e pode terminar antes de o pulmão esvaziar: o ar fica aprisionado e o tórax trabalha mais insuflado.',
    exame: 'Expiração prolongada, sibilos, murmúrio diminuído; com aprisionamento, hipersonoridade e expansibilidade reduzida dos dois lados.',
  },
};

export function mecanica(node) {
  node.classList.add('mecanica');
  node.tabIndex = 0;
  node.setAttribute('role', 'application');
  node.setAttribute('aria-label', 'Mecânica ventilatória. Espaço: reproduzir ou pausar.');
  node.innerHTML = `
    <div class="mc-fig"></div>
    <div class="mc-right">
      <div class="mc-gauges">
        <div class="mc-g"><span class="k">Fase</span><span class="v mc-fase"></span></div>
        <div class="mc-g"><span class="k">Pressão alveolar</span><span class="v mono mc-palv"></span></div>
        <div class="mc-g"><span class="k">Pleural direita</span><span class="v mono mc-pplD"></span></div>
        <div class="mc-g"><span class="k">Pleural esquerda</span><span class="v mono mc-pplE"></span></div>
      </div>
      <svg class="mc-plot" viewBox="0 0 700 300" preserveAspectRatio="none" aria-hidden="true"></svg>
      <div class="mc-card" aria-live="polite"></div>
    </div>
    <div class="mc-controls">
      <div class="grp mc-tr"></div>
      <div class="grp mc-cond" role="radiogroup" aria-label="Condição"></div>
      <span class="tag sim">Modelo esquemático · valores ilustrativos em cmH₂O</span>
    </div>`;
  const th = createThorax(node.querySelector('.mc-fig'));
  const plot = node.querySelector('.mc-plot');
  const card = node.querySelector('.mc-card');
  const R = { fase: node.querySelector('.mc-fase'), palv: node.querySelector('.mc-palv'), D: node.querySelector('.mc-pplD'), E: node.querySelector('.mc-pplE') };
  let cond = 'normal', playing = false, raf = 0, t = 0, last = 0, active = false;

  const bPlay = button({ icon: 'play', label: 'Reproduzir (espaço)', cls: 'primary' });
  node.querySelector('.mc-tr').append(bPlay);
  const cb = node.querySelector('.mc-cond');
  const cbtn = Object.entries(COND).map(([k, c]) => {
    const b = button({ label: `Condição: ${c.nome}`, text: c.nome, cls: 'chip', pressed: k === cond });
    b.setAttribute('role', 'radio');
    b.addEventListener('click', () => { cond = k; cbtn.forEach((x, i) => x.setAttribute('aria-pressed', String(Object.keys(COND)[i] === k))); setCond(); });
    cb.appendChild(b); return b;
  });

  const W = 700, H = 300, rows = [
    { k: 'vol', nome: 'Volume', y0: 10, h: 70, min: 0, max: 1, cor: 'var(--ink-2)' },
    { k: 'palv', nome: 'P alveolar', y0: 100, h: 80, min: -3, max: 3, cor: 'var(--insp)', zero: true },
    { k: 'ppl', nome: 'P pleural', y0: 200, h: 90, min: -12, max: 1, cor: 'var(--petrol)', zero: true },
  ];
  function setCond() {
    const c = COND[cond];
    th.reset(); th.set(c.th);
    card.innerHTML = `<h4>${c.titulo}</h4><p>${c.texto}</p><p class="mc-ex"><b>No exame:</b> ${c.exame}</p>`;
    drawStatic(); render();
  }
  function series(k, span) {
    const c = COND[cond]; const pts = { a: [], b: [] };
    for (let s = 0; s <= span; s += 0.05) {
      const st = stateAt(s, c.variante);
      let v;
      if (k === 'vol') v = [st.vol];
      if (k === 'palv') v = [c.palv(st.flow)];
      if (k === 'ppl') v = c.ppl(st.vol, st.flow);
      pts.a.push([s, v[0]]); if (v[1] !== undefined) pts.b.push([s, v[1]]);
    }
    return pts;
  }
  function drawStatic() {
    const c = COND[cond]; const span = stateAt(0, c.variante).tab.T * 2;
    const X = (s) => 80 + (s / span) * (W - 90);
    let h = '';
    // faixas de inspiração
    const tab = stateAt(0, c.variante).tab;
    for (let n = 0; n < 2; n++) h += `<rect class="mc-ib" x="${X(n * tab.T)}" y="0" width="${X(tab.ti) - 80}" height="${H}"/>`;
    for (const r of rows) {
      const Y = (v) => r.y0 + r.h - ((v - r.min) / (r.max - r.min)) * r.h;
      h += `<text class="mc-rt" x="4" y="${r.y0 + 14}">${r.nome}</text>`;
      if (r.zero) h += `<path class="mc-zero" d="M80 ${Y(0)}H${W}"/><text class="mc-tk" x="74" y="${Y(0) + 4}">0</text>`;
      if (r.k === 'ppl') { h += `<text class="mc-tk" x="74" y="${Y(-5) + 4}">−5</text><text class="mc-tk" x="74" y="${Y(-10) + 4}">−10</text>`; }
      const p = series(r.k, span);
      const d = (arr) => arr.map(([s, v], i) => `${i ? 'L' : 'M'}${X(s).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
      if (r.k === 'ppl' && p.b.length && cond !== 'normal' && cond !== 'obstrucao') {
        h += `<path class="mc-tr2 e" d="${d(p.b)}"/><path class="mc-tr2 d" d="${d(p.a)}"/>
          <text class="mc-lg d" x="${W - 6}" y="${Y(p.a[0][1]) - 6}">direita</text><text class="mc-lg e" x="${W - 6}" y="${Y(p.b[4][1]) + 16}">esquerda</text>`;
      } else h += `<path class="mc-tr2" style="stroke:${r.cor}" d="${d(p.a)}"/>`;
    }
    h += '<path class="mc-cursor"/>';
    plot.innerHTML = h;
  }
  function render() {
    const c = COND[cond];
    const st = stateAt(t, c.variante);
    const span = st.tab.T * 2;
    const X = (s) => 80 + ((s % span) / span) * (W - 90);
    plot.querySelector('.mc-cursor')?.setAttribute('d', `M${X(t)} 0V${H}`);
    const [pD, pE] = c.ppl(st.vol, st.flow);
    const pa = c.palv(st.flow);
    const fmt = (v) => `${v > 0.05 ? '+' : v < -0.05 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`;
    R.fase.textContent = st.fase === 'insp' ? 'Inspiração' : st.fase === 'exp' ? 'Expiração' : 'Pausa';
    R.fase.className = `v mc-fase ${st.fase}`;
    R.palv.textContent = fmt(pa); R.D.textContent = fmt(pD); R.E.textContent = fmt(pE);
    th.set({ vol: st.vol, fluxo: st.flow });
  }
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
    t += dt; th.tick(now); render();
    if (playing) raf = requestAnimationFrame(frame);
  }
  function play() { if (prefersReducedMotion()) { t += 0.7; render(); return; } playing = true; last = 0; setIcon(bPlay, 'pause'); raf = requestAnimationFrame(frame); }
  function pause() { playing = false; cancelAnimationFrame(raf); setIcon(bPlay, 'play'); }
  bPlay.addEventListener('click', () => (playing ? pause() : play()));
  captureKeys(node, (e) => { if (e.key === ' ' && e.target === node) { playing ? pause() : play(); return true; } return false; });
  setCond();
  return {
    activate() { active = true; if (!playing && !prefersReducedMotion()) play(); },
    deactivate() { active = false; pause(); },
    pause,
  };
}

