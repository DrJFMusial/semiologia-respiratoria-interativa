/**
 * Ressonância vocal: a própria voz do estudante (ou do professor), gravada
 * no navegador, ou uma vogal sintetizada, passa por filtros que IMITAM, de
 * forma aproximada, o que o pulmão faz com a voz: o pulmão aerado abafa as
 * frequências altas; o parênquima consolidado as transmite; líquido ou ar
 * na pleura atenuam tudo. A gravação fica só na memória da página e some
 * ao sair dela: nada é enviado nem armazenado.
 */
import { SignalView } from '../../core/spectro.js';
import { toBuffer, playBuffer, getContext } from '../../core/audio.js';
import { renderVogal } from '../../core/synth.js';
import { button, setIcon, captureKeys } from '../../core/ui.js';

function chain(tipo) {
  return (c) => {
    const nodes = [];
    const bq = (type, f, q = 0.7, g = 0) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; n.gain.value = g; nodes.push(n); return n; };
    const gain = (v) => { const n = c.createGain(); n.gain.value = v; nodes.push(n); return n; };
    if (tipo === 'normal') { bq('lowpass', 320); bq('lowpass', 320); gain(1.6); }
    if (tipo === 'aumentada') { bq('highpass', 110); bq('peaking', 1900, 0.9, 7); bq('lowpass', 3600); gain(0.95); }
    if (tipo === 'diminuida') { bq('lowpass', 230); bq('lowpass', 230); gain(0.32); }
    if (tipo === 'egofonia') { bq('highpass', 450); bq('peaking', 1250, 3, 12); bq('lowpass', 2300); gain(0.7); }
    if (!nodes.length) gain(1);
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
    return [nodes[0], nodes[nodes.length - 1]];
  };
}

const FILTROS = {
  original: { nome: 'Voz original', txt: 'A voz como foi gravada, para comparação.' },
  normal: { nome: 'Pulmão normal', txt: 'Ressonância vocal normal: o pulmão aerado filtra as frequências altas e a voz chega como um som abafado, em que não se entendem as sílabas.' },
  aumentada: { nome: 'Consolidação', txt: 'Ressonância aumentada (broncofonia): o parênquima sólido transmite as frequências altas e a voz chega mais nítida. Quando as palavras ficam inteligíveis, é pectorilóquia fônica; se até o sussurro é entendido, pectorilóquia afônica, um sinal sensível de consolidação.' },
  egofonia: { nome: 'Borda superior do derrame', txt: 'Egofonia: a voz soa anasalada, como balido de cabra; o “i” chega soando como “ê”. Aparece na borda superior de derrames e em algumas consolidações.' },
  diminuida: { nome: 'Derrame ou pneumotórax', txt: 'Ressonância diminuída ou abolida: líquido ou ar entre o pulmão e a parede atenuam toda a transmissão. O mesmo sentido do frêmito toracovocal.' },
};

export function ressonancia(node) {
  node.classList.add('ressonancia');
  node.innerHTML = `
    <div class="rv-src">
      <h4>1 · Fonte</h4>
      <div class="rv-srcbtns"></div>
      <p class="rv-status" aria-live="polite">Grave 3 segundos dizendo “trinta e três”, depois repita sussurrando. Ou use a vogal sintetizada.</p>
      <p class="rv-priv">A gravação fica só na memória desta página e é descartada ao sair. Nada é enviado.</p>
    </div>
    <div class="rv-main">
      <div class="rv-filters" role="radiogroup" aria-label="Como o tórax transmite a voz"></div>
      <canvas class="rv-sig" aria-hidden="true"></canvas>
      <div class="rv-ctrl"></div>
    </div>
    <div class="rv-card" aria-live="polite"></div>`;
  const status = node.querySelector('.rv-status');
  const card = node.querySelector('.rv-card');
  const sv = new SignalView(node.querySelector('.rv-sig'), { fmax: 4000 });
  let fonte = null, fonteNome = '', filtro = 'normal', player = null;

  const src = node.querySelector('.rv-srcbtns');
  const bRec = button({ icon: 'sound', label: 'Gravar 3 segundos com o microfone', text: 'Gravar 3 s', cls: 'primary' });
  const bVog = button({ label: 'Usar vogal i sintetizada (esquemática)', text: 'Vogal “i” sintetizada', cls: 'ghost' });
  src.append(bRec, bVog);
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { bRec.disabled = true; status.textContent = 'Microfone indisponível neste navegador: use a vogal sintetizada.'; }

  const fb = node.querySelector('.rv-filters');
  const fB = Object.entries(FILTROS).map(([k, f]) => {
    const b = button({ label: f.nome, text: f.nome, cls: 'chip', pressed: k === filtro });
    b.addEventListener('click', () => { filtro = k; fB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); update(); });
    fb.appendChild(b); return b;
  });
  const bPlay = button({ icon: 'play', label: 'Ouvir com o filtro escolhido', text: 'Ouvir', cls: 'primary' });
  const bCmp = button({ icon: 'play', label: 'Ouvir a voz original e depois a filtrada', text: 'Original × filtrada', cls: 'ghost' });
  node.querySelector('.rv-ctrl').append(bPlay, bCmp);
  const badge = document.createElement('span'); badge.className = 'tag esq'; node.querySelector('.rv-ctrl').append(badge);

  async function render() {
    if (!fonte) return null;
    const off = new OfflineAudioContext(1, fonte.length, fonte.sampleRate);
    const s = off.createBufferSource(); s.buffer = fonte;
    const [i, o] = chain(filtro === 'original' ? 'x' : filtro)(off);
    s.connect(i); o.connect(off.destination); s.start();
    return off.startRendering();
  }
  async function update() {
    const f = FILTROS[filtro];
    card.innerHTML = `<h4>${f.nome}</h4><p>${f.txt}</p><p class="rv-tech"><b>Técnica:</b> estetoscópio nos mesmos pontos da ausculta, paciente dizendo “trinta e três” em voz normal e depois sussurrada; compare os lados.</p>`;
    badge.textContent = filtro === 'original' ? 'Voz sem filtro' : 'Filtro aproximado: não reproduz exatamente o tórax';
    bPlay.disabled = bCmp.disabled = !fonte;
    const r = await render();
    if (r) sv.set({ data: r.getChannelData(0), sr: r.sampleRate, range: 60 });
  }
  function stop() { const p = player; player = null; p?.stop(); setIcon(bPlay, 'play'); }
  bPlay.addEventListener('click', () => {
    if (player) { stop(); return; }
    player = playBuffer(fonte, { chain: filtro === 'original' ? null : chain(filtro), onEnd: () => { player = null; setIcon(bPlay, 'play'); }, onStop: () => setIcon(bPlay, 'play') });
    setIcon(bPlay, 'pause');
  });
  bCmp.addEventListener('click', () => {
    stop();
    player = playBuffer(fonte, { onEnd: () => { player = playBuffer(fonte, { chain: filtro === 'original' ? null : chain(filtro), onEnd: () => { player = null; } }); } });
  });
  bVog.addEventListener('click', () => {
    const v = renderVogal('i', 1.8);
    fonte = toBuffer(v.data, v.sr); fonteNome = 'vogal “i” sintetizada';
    status.textContent = 'Fonte: vogal “i” sintetizada (esquemática). Compare “Pulmão normal” com “Borda superior do derrame”.';
    update();
  });
  bRec.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
      const rec = new MediaRecorder(stream); const parts = [];
      rec.ondataavailable = (e) => parts.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const ab = await new Blob(parts).arrayBuffer();
        const decoded = await getContext().decodeAudioData(ab);
        const d = decoded.getChannelData(0);
        let pk = 1e-4; for (const x of d) pk = Math.max(pk, Math.abs(x));
        const n = new Float32Array(d.length); for (let i = 0; i < d.length; i++) n[i] = (d[i] / pk) * 0.85;
        fonte = toBuffer(n, decoded.sampleRate); fonteNome = 'sua voz';
        status.textContent = 'Fonte: sua voz (3 s). Escolha como o tórax a transmite e ouça.';
        bRec.disabled = false; bRec.querySelector('span').textContent = 'Gravar de novo';
        update();
      };
      rec.start(); bRec.disabled = true; bRec.querySelector('span').textContent = 'Gravando…';
      status.textContent = 'Gravando: diga “trinta e três”…';
      setTimeout(() => rec.state === 'recording' && rec.stop(), 3000);
    } catch {
      status.textContent = 'Não foi possível usar o microfone (permissão negada ou ausente). Use a vogal sintetizada.';
    }
  });
  captureKeys(node, () => false);
  { const v = renderVogal('i', 1.8); fonte = toBuffer(v.data, v.sr); fonteNome = 'vogal “i” sintetizada'; }
  update();
  return { deactivate: stop, pause: stop };
}

