/**
 * Forma de onda e espectrograma calculados no navegador.
 * Espectrograma: tempo na horizontal, frequência na vertical (0 a fmax),
 * intensidade em cor (claro = fraco, escuro = forte). Janela de Hann,
 * FFT com preenchimento de zeros para suavizar o eixo de frequência.
 * Nenhum filtro é aplicado ao sinal: o que se vê é o que se ouve.
 */

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}

/** Calcula o espectrograma em dB. */
export function computeSpec(data, sr, { win = Math.round(sr * 0.032), nfft = 1024, hop = Math.round(sr * 0.004), fmax = 1000 } = {}) {
  let N = 1; while (N < Math.max(win, nfft)) N <<= 1;
  const cols = Math.max(1, Math.floor((data.length - win) / hop) + 1);
  const rows = Math.min(N / 2, Math.ceil((fmax / sr) * N));
  const hann = new Float32Array(win).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (win - 1)));
  const db = new Float32Array(cols * rows);
  const re = new Float32Array(N), im = new Float32Array(N);
  let mx = -Infinity;
  for (let c = 0; c < cols; c++) {
    re.fill(0); im.fill(0);
    const o = c * hop;
    for (let i = 0; i < win; i++) re[i] = (data[o + i] || 0) * hann[i];
    fft(re, im);
    for (let r = 0; r < rows; r++) {
      const v = 10 * Math.log10(re[r] * re[r] + im[r] * im[r] + 1e-12);
      db[c * rows + r] = v; if (v > mx) mx = v;
    }
  }
  return { db, cols, rows, hop, sr, fmax: (rows / N) * sr, max: mx, dur: data.length / sr };
}

// escala sequencial clara -> escura (legível em projetor e em impressão)
const STOPS = [[255, 255, 255], [222, 238, 241], [150, 200, 209], [40, 132, 148], [14, 72, 86], [16, 33, 43]];
const LUT = (() => {
  const t = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const p = (i / 255) * (STOPS.length - 1), k = Math.min(STOPS.length - 2, Math.floor(p)), f = p - k;
    for (let c = 0; c < 3; c++) t[i * 3 + c] = STOPS[k][c] + (STOPS[k + 1][c] - STOPS[k][c]) * f;
  }
  return t;
})();

/** Desenha o espectrograma num canvas fora da tela (1 pixel por coluna e linha). */
export function specImage(spec, range = 55) {
  const cv = document.createElement('canvas');
  cv.width = spec.cols; cv.height = spec.rows;
  const g = cv.getContext('2d');
  const img = g.createImageData(spec.cols, spec.rows);
  const top = spec.max, bot = top - range;
  for (let c = 0; c < spec.cols; c++) {
    for (let r = 0; r < spec.rows; r++) {
      let v = (spec.db[c * spec.rows + r] - bot) / range;
      v = Math.max(0, Math.min(1, v));
      const li = Math.round(v * 255) * 3, p = ((spec.rows - 1 - r) * spec.cols + c) * 4;
      img.data[p] = LUT[li]; img.data[p + 1] = LUT[li + 1]; img.data[p + 2] = LUT[li + 2]; img.data[p + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return cv;
}

/**
 * Painel de sinal: faixa de eventos, forma de onda e espectrograma.
 * opts.events: [{inicio, fim, rotulo, cor}], opts.bands: [{t0, t1, cor, rotulo}]
 * (fases inspiração/expiração quando conhecidas). Cursor em segundos.
 */
export class SignalView {
  constructor(canvas, { fmax = 1000, showSpec = true, labels = true } = {}) {
    this.c = canvas; this.fmax = fmax; this.showSpec = showSpec; this.labels = labels;
    this.data = null; this.cursor = -1; this.events = []; this.bands = [];
    this.ro = new ResizeObserver(() => this.render());
    this.ro.observe(canvas);
    this.onThemeChange = () => this.render();
    window.addEventListener('e2m08-theme-change', this.onThemeChange);
  }
  set({ data, sr, events = [], bands = [], spec = null, range = 55 }) {
    this.data = data; this.sr = sr; this.events = events; this.bands = bands;
    this.spec = spec || (this.showSpec ? computeSpec(data, sr, { fmax: this.fmax }) : null);
    this.img = this.spec ? specImage(this.spec, range) : null;
    // envelope da forma de onda (pico por coluna), recalculado na largura atual
    this.envW = 0;
    this.render();
  }
  setSpecVisible(on) { this.showSpec = on; if (on && !this.spec && this.data) this.set({ data: this.data, sr: this.sr, events: this.events, bands: this.bands }); else this.render(); }
  setCursor(t) { this.cursor = t; this.render(); }
  dur() { return this.data ? this.data.length / this.sr : 1; }
  render() {
    const cv = this.c, dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); this.envW = 0; }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    if (!this.data) return;
    const css = getComputedStyle(cv);
    const col = (v, d) => css.getPropertyValue(v).trim() || d;
    const left = this.labels ? 44 : 6, right = 8;
    const evH = 20, axisH = this.labels ? 18 : 4;
    const plotW = w - left - right;
    const waveH = this.showSpec ? Math.max(40, (h - evH - axisH) * 0.3) : h - evH - axisH;
    const specY = evH + waveH + 6, specH = this.showSpec ? h - specY - axisH : 0;
    const D = this.dur();
    const X = (t) => left + (t / D) * plotW;

    // faixas de fase (inspiração / expiração) e eventos rotulados
    for (const b of this.bands) {
      g.fillStyle = b.cor; g.globalAlpha = 0.16;
      g.fillRect(X(b.t0), evH, X(b.t1) - X(b.t0), h - evH - axisH);
      g.globalAlpha = 1;
    }
    g.font = '600 11.5px Inter Variable, Inter, sans-serif'; g.textBaseline = 'middle';
    for (const e of this.events) {
      const x0 = X(e.inicio), x1 = X(e.fim);
      g.fillStyle = e.cor || col('--sound', '#c98a12');
      g.globalAlpha = 0.9; g.fillRect(x0, 3, Math.max(2, x1 - x0), evH - 7); g.globalAlpha = 1;
      if (x1 - x0 > 46) { g.fillStyle = '#fff'; g.fillText(e.curto || e.rotulo, x0 + 5, 3 + (evH - 7) / 2 + 0.5); }
      g.fillStyle = e.cor || col('--sound', '#c98a12'); g.globalAlpha = 0.07;
      g.fillRect(x0, evH, x1 - x0, h - evH - axisH); g.globalAlpha = 1;
    }

    // forma de onda (envelope de pico por pixel)
    if (this.envW !== Math.round(plotW)) {
      this.envW = Math.round(plotW);
      const n = this.data.length, env = new Float32Array(this.envW * 2);
      for (let x = 0; x < this.envW; x++) {
        let lo = 0, hi = 0;
        const a = Math.floor((x / this.envW) * n), b = Math.floor(((x + 1) / this.envW) * n);
        for (let i = a; i < b; i++) { const v = this.data[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
        env[x * 2] = lo; env[x * 2 + 1] = hi;
      }
      let pk = 1e-6; for (const v of env) pk = Math.max(pk, Math.abs(v));
      this.env = env; this.envPk = pk;
    }
    const mid = evH + waveH / 2, amp = waveH / 2 - 3;
    g.fillStyle = col('--ink-2', '#3c4f5c');
    for (let x = 0; x < this.envW; x++) {
      const lo = this.env[x * 2] / this.envPk, hi = this.env[x * 2 + 1] / this.envPk;
      g.fillRect(left + x, mid - hi * amp, 1, Math.max(1, (hi - lo) * amp));
    }
    g.strokeStyle = col('--line', '#dbe3e8'); g.lineWidth = 1;
    g.beginPath(); g.moveTo(left, mid + 0.5); g.lineTo(left + plotW, mid + 0.5); g.stroke();

    // espectrograma
    if (this.showSpec && this.img) {
      g.imageSmoothingEnabled = true;
      const frac = Math.min(1, this.fmax / this.spec.fmax);
      const sh = this.img.height * frac;
      g.drawImage(this.img, 0, this.img.height - sh, this.img.width, sh, left, specY, plotW, specH);
      g.strokeStyle = col('--line-2', '#c3cfd7'); g.strokeRect(left + 0.5, specY + 0.5, plotW - 1, specH - 1);
      if (this.labels) {
        g.fillStyle = col('--ink-3', '#6b7d89'); g.font = '500 11px IBM Plex Mono, monospace'; g.textAlign = 'right';
        const step = this.fmax <= 1000 ? 250 : 500;
        for (let f = 0; f <= this.fmax; f += step) {
          const y = specY + specH - (f / this.fmax) * specH;
          g.fillText(String(f), left - 6, Math.min(specY + specH - 5, Math.max(specY + 6, y)));
        }
        g.save(); g.translate(11, specY + specH / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center';
        g.font = '500 11px Inter Variable, Inter, sans-serif'; g.fillText('Hz', 0, 0); g.restore();
      }
    }
    // eixo do tempo
    if (this.labels) {
      g.fillStyle = col('--ink-3', '#6b7d89'); g.font = '500 11px IBM Plex Mono, monospace'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      const step = D > 8 ? 2 : D > 3 ? 1 : 0.5;
      for (let t = 0; t <= D + 1e-6; t += step) g.fillText(`${(Math.round(t * 10) / 10).toString().replace('.', ',')} s`, Math.min(w - 22, Math.max(left + 14, X(t))), h - 3);
    }
    // cursor
    if (this.cursor >= 0) {
      const x = X(Math.min(D, this.cursor));
      g.strokeStyle = col('--art', '#c3323c'); g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, evH - 2); g.lineTo(x, h - axisH); g.stroke();
    }
  }
  destroy() { this.ro.disconnect(); window.removeEventListener('e2m08-theme-change', this.onThemeChange); }
}

