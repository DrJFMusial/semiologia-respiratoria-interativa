/**
 * Capa: tórax esquemático que respira em repouso, com a curva de volume
 * desenhada em tempo real. Sem som (nenhum áudio toca sem gesto do usuário).
 */
import { createThorax } from '../core/thorax.js';
import { stateAt, cycleTable } from '../core/synth.js';
import { prefersReducedMotion } from '../core/ui.js';

export function capa(node) {
  node.innerHTML = `<div class="cp-fig"></div>
    <svg class="cp-curve" viewBox="0 0 600 120" aria-hidden="true">
      <rect class="cp-insp" x="0" y="0" height="120"/>
      <path class="cp-base" d="M0 100H600"/>
      <path class="cp-trace"/>
      <circle class="cp-dot" r="6"/>
      <text x="6" y="16" class="cp-t">volume pulmonar</text>
    </svg>`;
  const th = createThorax(node.querySelector('.cp-fig'), { labels: false, compact: true });
  const trace = node.querySelector('.cp-trace');
  const dot = node.querySelector('.cp-dot');
  const insp = node.querySelector('.cp-insp');
  const tab = cycleTable('normal');
  const span = tab.T * 2.5; // segundos visíveis
  let raf = 0, t0 = 0, active = false;
  const X = (t) => (t / span) * 600, Y = (v) => 100 - v * 80;
  function frame(now) {
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    const st = stateAt(t);
    th.set({ vol: st.vol, fluxo: st.flow });
    th.tick(now);
    // curva: janela que termina no tempo atual
    const tl = t % span;
    let d = '';
    for (let s = 0; s <= tl; s += 0.04) d += `${d ? 'L' : 'M'}${X(s).toFixed(1)} ${Y(stateAt(t - tl + s).vol).toFixed(1)}`;
    trace.setAttribute('d', d);
    dot.setAttribute('cx', X(tl)); dot.setAttribute('cy', Y(st.vol));
    insp.setAttribute('width', st.fase === 'insp' ? 600 : 0);
    insp.setAttribute('x', 0);
    dot.classList.toggle('exp', st.fase !== 'insp');
    if (active) raf = requestAnimationFrame(frame);
  }
  function still() {
    th.set({ vol: 0.6, fluxo: 0 });
    let d = '';
    for (let s = 0; s <= span; s += 0.04) d += `${d ? 'L' : 'M'}${X(s).toFixed(1)} ${Y(stateAt(s).vol).toFixed(1)}`;
    trace.setAttribute('d', d);
    dot.setAttribute('cx', -20);
  }
  still();
  return {
    activate() { if (active) return; if (prefersReducedMotion()) { still(); return; } active = true; t0 = 0; raf = requestAnimationFrame(frame); },
    deactivate() { active = false; cancelAnimationFrame(raf); },
    pause() { active = false; cancelAnimationFrame(raf); },
  };
}

