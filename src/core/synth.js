/**
 * Modelo esquemático do ciclo respiratório e síntese de sons ESQUEMÁTICOS.
 *
 * Tudo o que sai deste arquivo é rotulado na tela como "som sintetizado
 * esquemático": serve para mostrar EM QUE MOMENTO do ciclo cada som ocorre
 * e como ele se relaciona com o fluxo de ar. O timbre real é ensinado com
 * as gravações clínicas (core/clips.js).
 */

/* ------------------------------------------------------------------------ */
/* Ciclo respiratório                                                        */
/* ------------------------------------------------------------------------ */
/**
 * Variantes do ciclo (valores ilustrativos):
 *  normal: 15 incursões/min (4 s), inspiração 1,4 s, expiração passiva, pausa.
 *  obstrutivo: expiração prolongada (fluxo expiratório lento), ciclo de 5 s.
 */
export const VARIANTES = {
  normal: { T: 4.0, ti: 1.4, a: 0.36, nome: 'Repouso' },
  obstrutivo: { T: 5.0, ti: 1.2, a: 0.75, nome: 'Expiração prolongada' },
};

const cache = new Map();
/** Tabela de volume (0 a 1) e fluxo (normalizado, + inspiração) a cada 2 ms. */
export function cycleTable(vk = 'normal') {
  if (cache.has(vk)) return cache.get(vk);
  const { T, ti, a } = VARIANTES[vk];
  const dt = 0.002, n = Math.round(T / dt);
  const vol = new Float32Array(n + 1), flow = new Float32Array(n + 1);
  // expiração: fluxo em forma gama, escalado para devolver todo o volume
  const te = T - ti;
  let area = 0;
  for (let i = 0; i * dt < te; i++) { const u = (i * dt) / a; area += u * Math.exp(1 - u) * dt; }
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    if (t <= ti) {
      vol[i] = (1 - Math.cos((Math.PI * t) / ti)) / 2;
      flow[i] = Math.sin((Math.PI * t) / ti);
    } else {
      const u = (t - ti) / a;
      flow[i] = -(u * Math.exp(1 - u)) / area * (ti / Math.PI) * 2; // mesma escala do fluxo inspiratório
      vol[i] = Math.max(0, vol[i - 1] + (-(u * Math.exp(1 - u)) / area) * dt);
    }
  }
  // normaliza o fluxo para pico 1 (o maior entre inspiração e expiração)
  let pk = 0; for (const f of flow) pk = Math.max(pk, Math.abs(f));
  for (let i = 0; i <= n; i++) flow[i] /= pk;
  const tab = { T, ti, te, dt, vol, flow, fimExp: ti + Math.min(te, a * 5.2) };
  cache.set(vk, tab);
  return tab;
}

export function stateAt(t, vk = 'normal') {
  const tab = cycleTable(vk);
  const tt = ((t % tab.T) + tab.T) % tab.T;
  const i = Math.min(tab.vol.length - 1, Math.round(tt / tab.dt));
  const fase = tt < tab.ti ? 'insp' : tt < tab.fimExp ? 'exp' : 'pausa';
  return { t: tt, vol: tab.vol[i], flow: tab.flow[i], fase, tab };
}

/* ------------------------------------------------------------------------ */
/* Utilitários de síntese                                                     */
/* ------------------------------------------------------------------------ */
export const SR = 16000;
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;

function onePoleLP(x, fc, sr) { const k = Math.exp((-2 * Math.PI * fc) / sr); let y = 0; for (let i = 0; i < x.length; i++) { y = (1 - k) * x[i] + k * y; x[i] = y; } return x; }
function onePoleHP(x, fc, sr) { const k = Math.exp((-2 * Math.PI * fc) / sr); let y = 0, px = 0; for (let i = 0; i < x.length; i++) { y = k * (y + x[i] - px); px = x[i]; x[i] = y; } return x; }
function resonate(x, f, q, sr) {
  const w = (2 * Math.PI * f) / sr, r = Math.exp(-w / (2 * q));
  let y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const y = x[i] * (1 - r) + 2 * r * Math.cos(w) * y1 - r * r * y2; y2 = y1; y1 = y; x[i] = y; }
  return x;
}
function normalize(d, peak = 0.9) { let m = 0; for (const v of d) m = Math.max(m, Math.abs(v)); if (m > 0) for (let i = 0; i < d.length; i++) d[i] = (d[i] / m) * peak; return d; }
function flowAt(tab, t) { const i = Math.min(tab.flow.length - 1, Math.max(0, Math.round(t / tab.dt))); return tab.flow[i]; }

/** Ruído respiratório filtrado, com envelope proporcional ao fluxo. */
function breathNoise(n, sr, tab, { lp, hp, inspGain, expGain, expFade = Infinity, pow = 1.3 }) {
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = noise();
  if (hp) onePoleHP(x, hp, sr);
  if (lp) { onePoleLP(x, lp, sr); onePoleLP(x, lp, sr); onePoleLP(x, lp, sr); onePoleLP(x, lp, sr); }
  normalize(x, 1);
  for (let i = 0; i < n; i++) {
    const t = (i / sr) % tab.T, f = flowAt(tab, t);
    let e = 0;
    if (f > 0) e = inspGain * Math.pow(f, pow);
    else e = expGain * Math.pow(-f, pow) * (expFade === Infinity ? 1 : Math.exp(-Math.max(0, t - tab.ti) / expFade));
    x[i] *= e;
  }
  return x;
}

function addWavelet(d, sr, t, { f, tau, amp, pol = 1 }) {
  const i0 = Math.floor(t * sr), n = Math.floor(tau * sr * 6);
  for (let i = 0; i < n && i0 + i < d.length; i++) {
    const tt = i / sr;
    d[i0 + i] += pol * amp * Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt / tau);
  }
}

function addTone(d, sr, t0, t1, { f0, f1 = f0, harm = [1, 0.3, 0.12], amp, env = null, vib = 0 }) {
  const i0 = Math.floor(t0 * sr), i1 = Math.floor(t1 * sr);
  let ph = 0;
  for (let i = i0; i < i1 && i < d.length; i++) {
    const u = (i - i0) / Math.max(1, i1 - i0);
    const f = f0 + (f1 - f0) * u + vib * Math.sin(2 * Math.PI * 5.5 * (i / sr));
    ph += (2 * Math.PI * f) / sr;
    let s = 0; harm.forEach((h, k) => { s += h * Math.sin((k + 1) * ph); });
    const e = env ? env((i / sr) % 1e9) : Math.min(1, u * 12, (1 - u) * 12);
    d[i] += amp * e * s;
  }
}

/* ------------------------------------------------------------------------ */
/* Laboratório: um ciclo por ponto de ausculta e achado                       */
/* ------------------------------------------------------------------------ */
export const ACHADOS_LAB = {
  normal: {
    nome: 'Sem ruído adventício', variante: 'normal',
    eventos: [],
  },
  bronquico: {
    nome: 'Som brônquico na base (consolidação)', variante: 'normal', soBase: true,
    eventos: [],
    texto: 'Quando o parênquima está consolidado, o som gerado nos brônquios chega à parede sem o filtro do pulmão aerado: na base passa a soar como na traqueia, com expiração audível, longa e uma pausa entre as fases.',
  },
  finos: {
    nome: 'Estertores finos', variante: 'normal',
    eventos: [{ fase: 'insp', ini: 0.55, fim: 0.98, rotulo: 'estertores finos' }],
    texto: 'Ocorrem no meio e no fim da inspiração: pequenas vias aéreas fechadas por líquido ou fibrose abrem de forma súbita quando o pulmão se expande. Não mudam com a tosse.',
  },
  grossos: {
    nome: 'Estertores grossos', variante: 'normal',
    eventos: [{ fase: 'insp', ini: 0.04, fim: 0.4, rotulo: 'estertores grossos' }, { fase: 'exp', ini: 0.02, fim: 0.3, rotulo: 'grossos' }],
    texto: 'Ocorrem no início da inspiração e podem aparecer na expiração: bolhas de secreção em vias aéreas maiores. Podem mudar ou desaparecer com a tosse.',
  },
  sibilos: {
    nome: 'Sibilos', variante: 'obstrutivo',
    eventos: [{ fase: 'exp', ini: 0.04, fim: 0.62, rotulo: 'sibilos' }],
    texto: 'Som contínuo e musical, predominante na expiração, com expiração prolongada: a via aérea estreitada vibra com a passagem do ar, como uma palheta.',
  },
  roncos: {
    nome: 'Roncos', variante: 'normal',
    eventos: [{ fase: 'insp', ini: 0.2, fim: 0.95, rotulo: 'roncos' }, { fase: 'exp', ini: 0.04, fim: 0.45, rotulo: 'roncos' }],
    texto: 'Som contínuo grave, nas duas fases, por vibração de secreções e paredes de brônquios maiores. Pode mudar com a tosse.',
  },
  estridor: {
    nome: 'Estridor', variante: 'normal',
    eventos: [{ fase: 'insp', ini: 0.08, fim: 0.92, rotulo: 'estridor' }],
    texto: 'Som contínuo agudo e intenso, inspiratório, gerado por estreitamento da via aérea alta (laringe, traqueia extratorácica). É mais alto no pescoço que no tórax e indica avaliação imediata.',
  },
  atrito: {
    nome: 'Atrito pleural', variante: 'normal',
    eventos: [{ fase: 'insp', ini: 0.45, fim: 0.98, rotulo: 'atrito' }, { fase: 'exp', ini: 0.02, fim: 0.4, rotulo: 'atrito' }],
    texto: 'Ruído rangente, como couro novo, no fim da inspiração e no início da expiração: os folhetos pleurais inflamados deslizam um sobre o outro. Não muda com a tosse e costuma coincidir com dor ventilatória dependente.',
  },
};

/** Converte um evento por fase em segundos dentro do ciclo. */
export function eventTimes(ev, tab) {
  if (ev.fase === 'insp') return [ev.ini * tab.ti, ev.fim * tab.ti];
  const te = tab.fimExp - tab.ti;
  return [tab.ti + ev.ini * te, tab.ti + ev.fim * te];
}

/**
 * Renderiza 1 ciclo do laboratório em Float32 (SR Hz).
 * ponto: 'traqueia' | 'base'
 */
export function renderLab(ponto, achadoId) {
  seed = 777;
  const ach = ACHADOS_LAB[achadoId];
  const tab = cycleTable(ach.variante);
  const n = Math.round(tab.T * SR);
  const traq = ponto === 'traqueia' || achadoId === 'bronquico';
  let d;
  if (traq) {
    d = breathNoise(n, SR, tab, { hp: 180, lp: 1300, inspGain: 0.7, expGain: 0.85, pow: 1.4 });
    if (achadoId === 'bronquico') onePoleLP(d, 900, SR);
  } else {
    d = breathNoise(n, SR, tab, { lp: 260, inspGain: 1, expGain: 0.42, expFade: 0.38, pow: 1.2 });
  }
  const atenua = ponto === 'traqueia' ? 1 : 0.85;
  for (const ev of ach.eventos) {
    const [t0, t1] = eventTimes(ev, tab);
    if (achadoId === 'finos') {
      const k = 14;
      for (let j = 0; j < k; j++) {
        const t = t0 + (t1 - t0) * (j / k + rnd() * 0.06);
        addWavelet(d, SR, t, { f: 520 + rnd() * 160, tau: 0.0016, amp: 0.55 * atenua * (0.6 + rnd() * 0.5), pol: rnd() > 0.5 ? 1 : -1 });
      }
    } else if (achadoId === 'grossos') {
      const k = ev.fase === 'insp' ? 6 : 3;
      for (let j = 0; j < k; j++) {
        const t = t0 + (t1 - t0) * (j / k + rnd() * 0.1);
        addWavelet(d, SR, t, { f: 170 + rnd() * 60, tau: 0.0055, amp: 0.85 * atenua, pol: rnd() > 0.5 ? 1 : -1 });
      }
    } else if (achadoId === 'sibilos') {
      addTone(d, SR, t0, t1, { f0: 470, f1: 400, harm: [1, 0.28, 0.1], amp: 0.32 * atenua, vib: 4,
        env: (t) => { const f = -flowAt(tab, t % tab.T); return Math.max(0, Math.min(1, f * 1.6)) * Math.min(1, (t - t0) * 25, (t1 - t) * 25); } });
    } else if (achadoId === 'roncos') {
      addTone(d, SR, t0, t1, { f0: 150, f1: 135, harm: [1, 0.7, 0.5, 0.35, 0.25, 0.15], amp: 0.2 * atenua, vib: 3,
        env: (t) => { const f = Math.abs(flowAt(tab, t % tab.T)); return Math.min(1, f * 1.5) * Math.min(1, (t - t0) * 20, (t1 - t) * 20); } });
    } else if (achadoId === 'estridor') {
      const g = ponto === 'traqueia' ? 0.6 : 0.18;
      addTone(d, SR, t0, t1, { f0: 780, f1: 820, harm: [1, 0.4, 0.15], amp: g, vib: 6,
        env: (t) => Math.max(0, Math.min(1, flowAt(tab, t % tab.T) * 1.4)) });
    } else if (achadoId === 'atrito') {
      let t = t0;
      while (t < t1) {
        const dur = 0.006 + rnd() * 0.008;
        const burst = new Float32Array(Math.round(dur * SR)).map(() => noise());
        resonate(burst, 260 + rnd() * 200, 3, SR);
        const i0 = Math.floor(t * SR);
        for (let i = 0; i < burst.length && i0 + i < d.length; i++) d[i0 + i] += burst[i] * 0.9 * Math.sin((Math.PI * i) / burst.length);
        t += 0.018 + rnd() * 0.03;
      }
    }
  }
  return { data: normalize(d, 0.85), sr: SR, tab };
}

/* ------------------------------------------------------------------------ */
/* Percussão                                                                 */
/* ------------------------------------------------------------------------ */
/**
 * Sons de percussão ESQUEMÁTICOS: um golpe (transiente curto) excita uma
 * ressonância cuja frequência, duração e intensidade variam conforme o que
 * há embaixo (ar em alvéolos, ar livre, líquido ou tecido sólido).
 */
export const PERCUSSAO = {
  claro: { nome: 'Som claro pulmonar', f: 120, q: 4.5, dur: 0.38, amp: 0.85, desc: 'Grave, intenso e prolongado: pulmão aerado sob a parede.' },
  hiper: { nome: 'Hipersonoridade', f: 95, q: 6, dur: 0.55, amp: 1.0, desc: 'Mais grave, mais intenso e mais longo que o claro pulmonar: excesso de ar (enfisema, pneumotórax).' },
  timpanico: { nome: 'Timpanismo', f: 260, q: 14, dur: 0.42, amp: 0.8, tonal: true, desc: 'Musical, como tambor: ar livre em cavidade (espaço de Traube, estômago, pneumotórax extenso).' },
  submacico: { nome: 'Submacicez', f: 210, q: 2.2, dur: 0.14, amp: 0.45, desc: 'Intermediário entre claro e maciço: menos ar sob a parede (consolidação incompleta, borda de derrame).' },
  macico: { nome: 'Macicez', f: 260, q: 1.4, dur: 0.07, amp: 0.3, desc: 'Seco, curto, de baixa intensidade: tecido sólido ou líquido (fígado, derrame, consolidação).' },
};
export function renderPercussao(tipo) {
  seed = 99;
  const p = PERCUSSAO[tipo], sr = 22050;
  const n = Math.round((p.dur + 0.08) * sr);
  const d = new Float32Array(n);
  // golpe: ruído muito curto
  for (let i = 0; i < Math.round(0.004 * sr); i++) d[i] = noise() * (1 - i / (0.004 * sr));
  const exc = Float32Array.from(d);
  const body = resonate(exc, p.f, p.q, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t / (p.dur / 4.5));
    let s = body[i] * 30 * env;
    if (p.tonal) s += Math.sin(2 * Math.PI * p.f * t) * 0.5 * Math.exp(-t / (p.dur / 3.5)) + Math.sin(4 * Math.PI * p.f * t) * 0.12 * Math.exp(-t / (p.dur / 5));
    d[i] = d[i] * 0.5 + s;
  }
  onePoleLP(d, 1800, sr);
  return { data: normalize(d, p.amp * 0.95), sr };
}

/* ------------------------------------------------------------------------ */
/* Vogal sintetizada (alternativa ao microfone na ressonância vocal)          */
/* ------------------------------------------------------------------------ */
/** Vogal "i" esquemática: trem de pulsos glóticos por três formantes. */
export function renderVogal(vogal = 'i', dur = 1.6) {
  seed = 5;
  const sr = 22050, n = Math.round(dur * sr);
  const F = vogal === 'i' ? [[280, 1, 8], [2250, 0.55, 12], [2950, 0.35, 14]] : [[750, 1, 7], [1200, 0.7, 9], [2600, 0.25, 12]];
  const src = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const f0 = 130 + 4 * Math.sin(2 * Math.PI * 5 * (i / sr));
    ph += f0 / sr;
    if (ph >= 1) { ph -= 1; src[i] = 1; }
    src[i] += noise() * 0.01;
  }
  const out = new Float32Array(n);
  for (const [f, g, q] of F) {
    const x = resonate(Float32Array.from(src), f, q, sr);
    for (let i = 0; i < n; i++) out[i] += x[i] * g;
  }
  for (let i = 0; i < n; i++) { const u = i / n; out[i] *= Math.min(1, u * 14, (1 - u) * 10); }
  return { data: normalize(out, 0.8), sr };
}

