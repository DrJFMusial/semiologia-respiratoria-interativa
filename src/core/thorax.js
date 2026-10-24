/**
 * Tórax esquemático em corte frontal (vista anterior: o lado DIREITO do
 * paciente fica à ESQUERDA da tela). Usado pela capa, pelo laboratório do
 * ciclo, pela mecânica ventilatória e pela matriz das síndromes.
 *
 * Estado por lado (direito 'D', esquerdo 'E'):
 *   colapso   0..1  pneumotórax: o pulmão se retrai em direção ao hilo
 *   liquido   0..1  derrame: altura do líquido na cavidade pleural
 *   consol    0..1  consolidação do lobo inferior (opacidade sólida)
 *   atelect   0..1  atelectasia do lobo inferior (lobo retraído, sem ar)
 *   expande   0..1  quanto aquele lado acompanha a inspiração
 * Global: vol (0..1), hiper (0..1), desvio (px, + para a direita da tela),
 *         bronco (0..1, estreitamento brônquico), fluxo (-1..1, partículas).
 */
const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

export function createThorax(host, { compact = false, labels = true } = {}) {
  const id = `tx${++uid}`;
  host.innerHTML = `
  <svg class="thorax-fr" viewBox="0 0 400 420" role="img" aria-label="Tórax em corte frontal, esquemático">
    <defs>
      <clipPath id="${id}-cD"><path class="cav-d"/></clipPath>
      <clipPath id="${id}-cE"><path class="cav-e"/></clipPath>
      <clipPath id="${id}-lD"><path class="lclip-d"/></clipPath>
      <clipPath id="${id}-lE"><path class="lclip-e"/></clipPath>
      <pattern id="${id}-sol" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <rect width="7" height="7" fill="#c98f86"/><path d="M0 0V7" stroke="#a9675f" stroke-width="3"/>
      </pattern>
      <linearGradient id="${id}-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc6e6"/><stop offset="1" stop-color="#5f99c8"/></linearGradient>
    </defs>
    <path class="tx-wall" d="M78 40 C40 70 26 150 30 250 C33 320 40 360 52 380 L348 380 C360 360 367 320 370 250 C374 150 360 70 322 40 Z"/>
    <g class="tx-ribs"></g>
    <path class="cav cav-d"/><path class="cav cav-e"/>
    <g clip-path="url(#${id}-cD)"><path class="air-pt air-d"/><path class="liq liq-d" fill="url(#${id}-liq)"/></g>
    <g clip-path="url(#${id}-cE)"><path class="air-pt air-e"/><path class="liq liq-e" fill="url(#${id}-liq)"/></g>
    <path class="lung lung-d"/><path class="lung lung-e"/>
    <g clip-path="url(#${id}-lD)"><path class="sol sol-d" fill="url(#${id}-sol)"/></g><g clip-path="url(#${id}-lE)"><path class="sol sol-e" fill="url(#${id}-sol)"/></g>
    <path class="fiss fiss-d"/><path class="fiss fiss-e"/>
    <g class="medi">
      <path class="heart" d="M196 262 C196 236 232 228 256 240 C288 254 292 292 268 318 C252 334 222 338 206 322 C196 312 196 290 196 262 Z"/>
      <path class="airway trachea" d="M200 0 V142"/>
      <path class="airway bronch" d="M200 140 C190 152 176 160 160 168 M200 140 C210 152 224 162 240 170"/>
      <path class="airway br2" d="M160 168 C150 158 142 140 136 116 M160 168 C150 186 140 204 128 226 M164 172 C168 196 170 214 168 240 M240 170 C252 160 260 142 264 118 M240 170 C252 190 262 210 272 232"/>
      <g class="parts"></g>
    </g>
    <path class="diaph diaph-d"/><path class="diaph diaph-e"/>
    ${labels ? `<g class="tx-lab">
      <text x="98" y="408">direito</text><text x="302" y="408">esquerdo</text>
    </g>` : ''}
  </svg>`;
  const svg = host.querySelector('svg');
  const q = (s) => svg.querySelector(s);
  const el = {
    cavD: svg.querySelectorAll('.cav-d'), cavE: svg.querySelectorAll('.cav-e'),
    lungD: q('.lung-d'), lungE: q('.lung-e'), lcD: q('.lclip-d'), lcE: q('.lclip-e'), solD: q('.sol-d'), solE: q('.sol-e'),
    liqD: q('.liq-d'), liqE: q('.liq-e'), airD: q('.air-d'), airE: q('.air-e'),
    fissD: q('.fiss-d'), fissE: q('.fiss-e'), diaD: q('.diaph-d'), diaE: q('.diaph-e'),
    medi: q('.medi'), bronch: svg.querySelectorAll('.airway'), parts: q('.parts'), ribs: q('.tx-ribs'),
  };
  // costelas (decorativas)
  let ribs = '';
  for (let k = 0; k < 7; k++) {
    const y = 78 + k * 40;
    ribs += `<path d="M52 ${y + 34} C80 ${y - 6} 150 ${y - 10} 186 ${y + 6}"/><path d="M348 ${y + 34} C320 ${y - 6} 250 ${y - 10} 214 ${y + 6}"/>`;
  }
  el.ribs.innerHTML = ribs;
  const parts = [];
  for (let k = 0; k < 7; k++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', compact ? 3 : 3.6); c.setAttribute('cx', 200); c.setAttribute('class', 'part');
    el.parts.appendChild(c); parts.push({ c, p: k / 7 });
  }

  /** Contorno da cavidade (pleura parietal) de um lado; s = +1 esquerdo, -1 direito. */
  function cavity(s, st) {
    const X = (x) => 200 + s * x;
    const d = st.dia;
    return `M${X(14)} 70 C${X(40)} 46 ${X(80)} 50 ${X(104)} 76 C${X(150)} 118 ${X(166)} 220 ${X(162 + st.wall)} ${330 + d.low}
      L${X(150 + st.wall)} ${348 + d.low} C${X(120)} ${d.top + 4} ${X(60)} ${d.top + 2} ${X(s > 0 ? 44 : 14)} ${d.medial} Z`;
  }
  /** Pulmão: forma base com lado lateral, ápice e base que segue o diafragma. */
  function lung(s, st) {
    const X = (x) => 200 + s * x;
    const d = st.dia, w = st.wall;
    const medial = s > 0 ? 46 : 18;
    return `M${X(20)} 78 C${X(40)} 56 ${X(78)} 60 ${X(98)} 84 C${X(140)} 126 ${X(154 + w)} 220 ${X(152 + w)} ${322 + d.low}
      C${X(130)} ${d.top + 8} ${X(76)} ${d.top + 4} ${X(medial)} ${d.medial - 8}
      C${X(medial - 4)} ${250} ${X(s > 0 ? 34 : 22)} ${200} ${X(30)} 172 C${X(22)} 140 ${X(18)} 100 ${X(20)} 78 Z`;
  }
  function diaph(s, st) {
    const X = (x) => 200 + s * x; const d = st.dia;
    return `M${X(s > 0 ? 40 : 10)} ${d.medial + 2} C${X(70)} ${d.top + 2} ${X(126)} ${d.top + 6} ${X(158 + st.wall)} ${340 + d.low}`;
  }
  function fiss(s, st) {
    const X = (x) => 200 + s * x; const d = st.dia;
    // oblíqua (os dois lados) e horizontal (só direito)
    const ob = `M${X(32)} 128 C${X(70)} 170 ${X(120)} 230 ${X(132)} ${d.top + 12}`;
    const ho = s < 0 ? ` M${X(146 + st.wall * 0.8)} 206 C${X(120)} 204 ${X(80)} 200 ${X(70)} 198` : '';
    return ob + ho;
  }
  /** Lobo inferior (região abaixo da oblíqua) para consolidação/atelectasia. */
  function lowerLobe(s, st, shrink = 0) {
    const X = (x) => 200 + s * x; const d = st.dia; const w = st.wall;
    const k = 1 - shrink * 0.55;
    const yTop = 128 + (1 - k) * 120;
    return `M${X(32)} ${yTop} C${X(70)} ${170 + (1 - k) * 80} ${X(120)} ${230 + (1 - k) * 40} ${X(132)} ${d.top + 12}
      C${X(76 + (1 - k) * 20)} ${d.top + 4} ${X(s > 0 ? 46 : 20)} ${d.medial - 8} ${X(s > 0 ? 46 : 20)} ${d.medial - 8}
      C${X(s > 0 ? 40 : 22)} 250 ${X(28)} 200 ${X(30)} 172 Z`;
  }

  function scaleAbout(path, cx, cy, k) {
    return path.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (m, a, b) => `${(cx + (a - cx) * k).toFixed(1)} ${(cy + (b - cy) * k).toFixed(1)}`);
  }

  const S = { vol: 0, hiper: 0, desvio: 0, bronco: 0, fluxo: 0, D: {}, E: {} };
  function side(s, st) {
    const sideSt = st[s > 0 ? 'E' : 'D'];
    const exp = sideSt.expande ?? 1;
    const v = st.vol * exp;
    const hiper = st.hiper;
    const dia = { top: 286 + v * 26 + hiper * 30, low: v * 12 + hiper * 14, medial: (s > 0 ? 300 : 296) + v * 18 + hiper * 20 };
    if (hiper) dia.top = dia.top + hiper * 6; // diafragma rebaixado e retificado
    return { dia, wall: v * 7 + hiper * 8 };
  }
  function render() {
    const st = S;
    for (const s of [-1, 1]) {
      const k = s > 0 ? 'E' : 'D';
      const ss = st[k] || {};
      const g = side(s, st);
      const cav = cavity(s, g);
      (s > 0 ? el.cavE : el.cavD).forEach((p) => p.setAttribute('d', cav));
      let lp = lung(s, g);
      const hx = 200 + s * 42, hy = 176;
      const col = ss.colapso || 0;
      const liq = ss.liquido || 0;
      if (col) lp = scaleAbout(lp, hx, hy, 1 - col * 0.5);
      if (liq) { // pulmão comprimido de baixo para cima pelo líquido
        lp = lp.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (m, a, b) => {
          const yy = Number(b); const ny = yy > 170 ? 170 + (yy - 170) * (1 - liq * 0.62) : yy;
          return `${a} ${ny.toFixed(1)}`;
        });
      }
      const L = s > 0 ? el.lungE : el.lungD;
      L.setAttribute('d', lp);
      (s > 0 ? el.lcE : el.lcD).setAttribute('d', lp);
      L.classList.toggle('hiper', st.hiper > 0.2);
      const F = s > 0 ? el.fissE : el.fissD;
      F.setAttribute('d', col || liq ? '' : fiss(s, g));
      // ar livre (pneumotórax): toda a cavidade fora do pulmão
      (s > 0 ? el.airE : el.airD).setAttribute('d', col ? cav : '');
      // líquido: retângulo abaixo do nível, recortado pela cavidade, com menisco
      const LQ = s > 0 ? el.liqE : el.liqD;
      if (liq) {
        const yl = 360 + g.dia.low - liq * 200;
        const X = (x) => 200 + s * x;
        LQ.setAttribute('d', `M${X(0)} ${yl + 14} C${X(60)} ${yl + 14} ${X(140)} ${yl + 2} ${X(180)} ${yl - 18} L${X(180)} 420 L${X(0)} 420 Z`);
      } else LQ.setAttribute('d', '');
      const SO = s > 0 ? el.solE : el.solD;
      const sh = ss.atelect || 0;
      if ((ss.consol || sh) && !col && !liq) {
        if (sh) SO.setAttribute('d', lowerLobe(s, g, sh));
        else { const X = (x) => 200 + s * x; SO.setAttribute('d', `M${X(0)} ${206 - (ss.consol - 1) * 0} H${X(190)} V420 H${X(0)} Z`); }
        SO.style.opacity = String(Math.max(ss.consol || 0, sh) * 0.9);
        SO.classList.toggle('atelect', !!sh);
      } else SO.setAttribute('d', '');
      (s > 0 ? el.diaE : el.diaD).setAttribute('d', diaph(s, g));
    }
    el.medi.setAttribute('transform', `translate(${st.desvio || 0} 0)`);
    el.bronch.forEach((b) => { b.style.strokeWidth = ''; b.classList.toggle('narrow', st.bronco > 0.3); });
  }
  let lastT = 0;
  function tickParticles(dt) {
    const f = S.fluxo || 0;
    for (const pt of parts) {
      pt.p = (pt.p + dt * f * 0.55 + 1) % 1;
      const y = 4 + pt.p * 134;
      pt.c.setAttribute('cy', y.toFixed(1));
      pt.c.setAttribute('opacity', Math.min(1, Math.abs(f) * 3).toFixed(2));
      pt.c.classList.toggle('exp', f < 0);
    }
  }
  render();
  return {
    svg,
    set(patch) {
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'D' || k === 'E') S[k] = { ...S[k], ...v }; else S[k] = v;
      }
      render();
    },
    reset() { Object.assign(S, { vol: 0, hiper: 0, desvio: 0, bronco: 0, fluxo: 0, D: {}, E: {} }); render(); },
    tick(tNow) { const dt = lastT ? Math.min(0.05, (tNow - lastT) / 1000) : 0; lastT = tNow; tickParticles(dt); },
    state: S,
  };
}

