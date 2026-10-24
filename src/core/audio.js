/**
 * Motor de áudio (Web Audio API).
 * - Nenhum som toca sem gesto do usuário: o AudioContext só é criado ou
 *   retomado dentro de um clique ou tecla.
 * - Volume mestre e mudo globais, controlados pela barra da aplicação.
 * - Um som por vez: iniciar um novo tocador encerra o anterior, para que
 *   gravações e esquemas nunca se sobreponham na sala.
 */
let ctx = null;
let master = null;
let volume = 0.8;
let muted = false;
const listeners = new Set();
let current = null; // função que encerra o som em curso

export function getContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export function out() { getContext(); return master; }
export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02);
  listeners.forEach((f) => f({ volume, muted }));
}
export function setMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02);
  listeners.forEach((f) => f({ volume, muted }));
}
export function audioState() { return { volume, muted }; }
export function onAudioChange(f) { listeners.add(f); return () => listeners.delete(f); }

/** Cria um AudioBuffer mono a partir de amostras Float32. */
export function toBuffer(data, sampleRate) {
  const buf = new AudioBuffer({ length: data.length, numberOfChannels: 1, sampleRate });
  buf.copyToChannel(data, 0);
  return buf;
}

/**
 * Toca um buffer uma vez ou em laço. `chain` permite inserir filtros
 * (recebe o contexto e devolve [entrada, saída]).
 * Devolve { stop, startedAt, duration, ctx } para sincronizar cursores.
 */
export function playBuffer(buf, { loop = false, gain = 1, chain = null, offset = 0, onEnd = null, onStop = null } = {}) {
  stopCurrent();
  const c = getContext();
  const src = c.createBufferSource();
  src.buffer = buf; src.loop = loop;
  const g = c.createGain(); g.gain.value = gain;
  if (chain) { const [i, o] = chain(c); src.connect(i); o.connect(g); } else src.connect(g);
  g.connect(out());
  const startedAt = c.currentTime + 0.03;
  src.start(startedAt, offset);
  let stopped = false;
  const stop = () => {
    if (stopped) return; stopped = true;
    try { src.stop(); } catch { /* já parado */ }
    if (current === stop) current = null;
    onStop?.();
  };
  src.onended = () => { if (!stopped) { stopped = true; if (current === stop) current = null; onEnd?.(); } };
  current = stop;
  return { src, startedAt, duration: buf.duration, ctx: c, stop, offset };
}

export function stopCurrent() { current?.(); current = null; }

/** Toca um efeito curto sem interromper o som em curso (ex.: percussão). */
export function playOneShot(buf, gain = 1) {
  const c = getContext();
  const src = c.createBufferSource(); src.buffer = buf;
  const g = c.createGain(); g.gain.value = gain;
  src.connect(g).connect(out());
  src.start(c.currentTime + 0.01);
  return src;
}

