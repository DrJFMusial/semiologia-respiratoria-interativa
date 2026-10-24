/**
 * Inspeção dinâmica: padrões respiratórios e contagem da frequência.
 * Cada padrão é um gerador de volume no tempo (esquemático). O exercício
 * de contagem mostra só o tórax se movendo: quem conta é o estudante;
 * o cronômetro apenas delimita os 30 segundos.
 */
import { button, setIcon, captureKeys, prefersReducedMotion } from '../../core/ui.js';

let s = 1;
const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

/** Gera uma lista de incursões {t0, ti, te, amp} cobrindo `dur` segundos. */
function gerar(p, dur, opts = {}) {
  s = opts.seed || 7;
  const out = [];
  let t = opts.offset ?? 0.3;
  const add = (T, amp) => { out.push({ t0: t, ti: T * 0.36, te: T * 0.5, amp }); t += T; };
  while (t < dur) {
    if (p === 'eupneia') add(60 / (opts.fr || 16) * (0.96 + rnd() * 0.08), 1);
    else if (p === 'taquipneia') add(60 / (opts.fr || 30) * (0.95 + rnd() * 0.1), 0.62);
    else if (p === 'bradipneia') add(60 / 8, 1.05);
    else if (p === 'kussmaul') add(60 / 20, 1.85);
    else if (p === 'cheyne') {
      // crescendo-decrescendo de ~36 s seguido de apneia de ~16 s
      const ciclo = 52, u = (t % ciclo) / 36;
      if ((t % ciclo) < 36) add(60 / 22, 0.15 + 1.5 * Math.sin(Math.PI * u) ** 1.4);
      else t += 1;
    } else if (p === 'biot') {
      const n = 2 + Math.floor(rnd() * 4);
      for (let k = 0; k < n && t < dur; k++) add(60 / (18 + rnd() * 10), 0.5 + rnd() * 0.9);
      t += 4 + rnd() * 9; // apneia irregular
    }
  }
  return out;
}
function volAt(lista, t) {
  for (const b of lista) {
    if (t < b.t0) break;
    const u = t - b.t0;
    if (u < b.ti) return b.amp * (1 - Math.cos((Math.PI * u) / b.ti)) / 2;
    if (u < b.ti + b.te) return b.amp * (1 + Math.cos((Math.PI * (u - b.ti)) / b.te)) / 2;
  }
  return 0;
}

const PADROES = {
  eupneia: { nome: 'Eupneia', txt: 'Ritmo regular, amplitude constante, sem esforço. Em adultos em repouso, a frequência costuma ficar entre 12 e 20 incursões por minuto.' },
  taquipneia: { nome: 'Taquipneia', txt: 'Frequência aumentada, em geral com incursões mais rasas. Acompanha febre, dor, ansiedade, hipoxemia e doenças pulmonares ou cardíacas: indica que algo exige mais ventilação, não qual é a causa.' },
  bradipneia: { nome: 'Bradipneia', txt: 'Frequência diminuída. Pode ocorrer com depressão do centro respiratório (opioides, sedativos, lesões do sistema nervoso) e em alguns atletas em repouso.' },
  kussmaul: { nome: 'Kussmaul', txt: 'Respirações amplas e profundas, regulares, com aumento do volume de cada incursão. É a resposta ventilatória à acidose metabólica, como na cetoacidose diabética e na uremia.' },
  cheyne: { nome: 'Cheyne-Stokes', txt: 'Incursões que crescem e depois diminuem de amplitude, separadas por períodos de apneia. Ocorre na insuficiência cardíaca grave, em lesões neurológicas e, às vezes, no sono de idosos.' },
  biot: { nome: 'Biot', txt: 'Incursões irregulares em ritmo e amplitude, interrompidas por apneias de duração variável. Sugere lesão do tronco encefálico (ponte e bulbo).' },
};

export function padroes(node) {
  node.classList.add('padroes');
  node.tabIndex = 0;
  node.innerHTML = `
    <div class="pd-left">
      <svg class="pd-chest" viewBox="0 0 240 240" aria-hidden="true">
        <path class="pd-body" d="M70 230 C64 170 60 120 72 84 C82 60 104 50 120 50 C136 50 158 60 168 84 C180 120 176 170 170 230 Z"/>
        <g class="pd-cage"><path class="pd-ribs" d="M86 100 C104 110 136 110 154 100 M84 124 C104 136 136 136 156 124 M84 148 C104 160 136 160 156 148 M86 172 C104 182 136 182 154 172"/></g>
        <circle class="pd-head" cx="120" cy="30" r="24"/>
        <path class="pd-belly" d="M90 200 C104 214 136 214 150 200"/>
      </svg>
      <div class="pd-ex">
        <h4>Conte a frequência</h4>
        <p class="pd-ex-txt">Olhe só o tórax. Inicie, conte as incursões em 30 segundos e multiplique por 2.</p>
        <div class="pd-ex-ctrl"></div>
        <div class="pd-ex-fb" aria-live="polite"></div>
      </div>
    </div>
    <div class="pd-right">
      <div class="pd-tabs" role="radiogroup" aria-label="Padrão respiratório"></div>
      <svg class="pd-trace" viewBox="0 0 900 200" preserveAspectRatio="none" aria-hidden="true"></svg>
      <div class="pd-axis"><span>0 s</span><span>10 s</span><span>20 s</span><span>30 s</span><span>40 s</span><span>50 s</span><span>60 s</span></div>
      <div class="pd-card" aria-live="polite"></div>
      <p class="pd-note">Traçados esquemáticos de volume ao longo de 60 segundos. Descreva o padrão (frequência, ritmo, amplitude), não só o nome.</p>
    </div>`;
  const chest = node.querySelector('.pd-cage');
  const belly = node.querySelector('.pd-belly');
  const trace = node.querySelector('.pd-trace');
  const card = node.querySelector('.pd-card');
  let pad = 'eupneia', lista = gerar(pad, 60), raf = 0, t0 = 0, active = false, modo = 'ver', alvo = null, exT0 = 0;

  const tabs = Object.entries(PADROES).map(([k, p]) => {
    const b = button({ label: p.nome, text: p.nome, cls: 'chip', pressed: k === pad });
    b.addEventListener('click', () => { pad = k; modo = 'ver'; tabs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); lista = gerar(pad, 60); drawTrace(); resetEx(); });
    node.querySelector('.pd-tabs').appendChild(b); return b;
  });
  function drawTrace() {
    const X = (t) => (t / 60) * 900, Y = (v) => 185 - v * 85;
    let d = '';
    for (let t = 0; t <= 60; t += 0.05) d += `${d ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(volAt(lista, t)).toFixed(1)}`;
    let grid = '';
    for (let k = 10; k < 60; k += 10) grid += `<path class="pd-grid" d="M${X(k)} 0V200"/>`;
    trace.innerHTML = `${grid}<path class="pd-line" d="${d}"/><path class="pd-cur" d=""/>`;
    card.innerHTML = `<h4>${PADROES[pad].nome}</h4><p>${PADROES[pad].txt}</p>`;
  }
  function frame(now) {
    if (!t0) t0 = now;
    const t = ((now - t0) / 1000);
    let v;
    if (modo === 'conta') {
      const u = t - exT0;
      v = volAt(alvo.lista, u);
      if (u >= 30) { fimEx(); }
    } else {
      v = volAt(lista, t % 60);
      trace.querySelector('.pd-cur')?.setAttribute('d', `M${((t % 60) / 60) * 900} 0V200`);
    }
    chest.setAttribute('transform', `translate(120 140) scale(${1 + v * 0.06} ${1 + v * 0.035}) translate(-120 -140)`);
    belly.setAttribute('transform', `translate(0 ${-v * 4})`);
    if (active) raf = requestAnimationFrame(frame);
  }
  // ---- exercício ----
  const exCtrl = node.querySelector('.pd-ex-ctrl');
  const exFb = node.querySelector('.pd-ex-fb');
  const bIni = button({ icon: 'play', label: 'Iniciar 30 segundos', text: 'Iniciar 30 s', cls: 'primary' });
  exCtrl.appendChild(bIni);
  function resetEx() { exFb.innerHTML = ''; bIni.disabled = false; bIni.querySelector('span').textContent = 'Iniciar 30 s'; }
  bIni.addEventListener('click', () => {
    const fr = 10 + Math.round(Math.random() * 22);
    const off = 0.2 + Math.random() * 2;
    alvo = { fr, lista: gerar('eupneia', 31, { fr, seed: Math.floor(Math.random() * 1000) + 1, offset: off }) };
    alvo.n = alvo.lista.filter((b) => b.t0 >= 0 && b.t0 < 30).length;
    modo = 'conta'; exT0 = t0 ? (performance.now() - t0) / 1000 : 0;
    if (!active) { active = true; t0 = 0; exT0 = 0; raf = requestAnimationFrame(frame); }
    node.classList.add('contando');
    bIni.disabled = true; bIni.querySelector('span').textContent = 'Contando…';
    exFb.innerHTML = '<p class="pd-run">Conte cada vez que o tórax sobe.</p>';
  });
  function fimEx() {
    modo = 'ver'; node.classList.remove('contando');
    exFb.innerHTML = `<form class="pd-form"><label>Incursões em 30 s <input type="number" min="0" max="40" inputmode="numeric" class="pd-in"></label>
      <button type="submit" class="btn primary">Conferir</button></form>`;
    const f = exFb.querySelector('form');
    f.querySelector('input').focus();
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = Number(f.querySelector('input').value);
      const real = alvo.n, d = Math.abs(n - real);
      exFb.innerHTML = `<div class="fb ${d <= 1 ? 'ok' : 'no'}"><p><b>${d <= 1 ? 'Boa contagem.' : 'Confira de novo.'}</b>
        Houve ${real} incursões nos 30 s: frequência de ${real * 2} irpm${n ? `; você contou ${n}, o que daria ${n * 2} irpm` : ''}.</p>
        <p>Conte cada subida do tórax como uma incursão e, se houver irregularidade, conte por 1 minuto inteiro.</p></div>`;
      bIni.disabled = false;
      bIni.querySelector('span').textContent = 'Outra contagem';
    });
  }
  captureKeys(node, (e) => e.target.matches?.('input') && ['ArrowLeft', 'ArrowRight', ' '].includes(e.key) ? (e.stopPropagation(), false) : false);
  drawTrace();
  return {
    activate() { if (active || prefersReducedMotion()) return; active = true; t0 = 0; raf = requestAnimationFrame(frame); },
    deactivate() { active = false; cancelAnimationFrame(raf); if (modo === 'conta') { modo = 'ver'; node.classList.remove('contando'); resetEx(); } },
    pause() { active = false; cancelAnimationFrame(raf); },
  };
}

