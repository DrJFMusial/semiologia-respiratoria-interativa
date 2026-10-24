/**
 * "Escute e identifique": cinco gravações clínicas sorteadas entre os
 * trechos aprovados. Depois da resposta aparecem o espectrograma, os
 * eventos anotados pelo acervo e uma pista sobre a confusão mais provável.
 * Sem nota, sem armazenamento.
 */
import { CLIPS, TERMO, TIPO, loadClip, procedencia } from '../../core/clips.js';
import { SignalView } from '../../core/spectro.js';
import { toBuffer, playBuffer } from '../../core/audio.js';
import { button, setIcon } from '../../core/ui.js';

const OPCOES = [
  ['Normal', 'Murmúrio vesicular, sem ruído adventício'], ['Wheeze', 'Sibilos'], ['Rhonchi', 'Roncos'],
  ['Fine Crackle', 'Estertores finos'], ['Coarse Crackle', 'Estertores grossos'],
];
const PISTA = {
  Normal: 'Sem ruídos adventícios, o que se ouve é só o fluxo de ar: um sopro suave que cresce na inspiração.',
  Wheeze: 'Sibilo é contínuo e agudo: no espectrograma, traços horizontais finos, mais altos na escala de frequência.',
  Rhonchi: 'Ronco é contínuo e grave: traços horizontais na parte baixa do espectrograma, muitas vezes com harmônicos empilhados.',
  'Fine Crackle': 'Estertores finos são estalidos curtos e numerosos, como cabelo atritado perto do ouvido: riscos verticais estreitos.',
  'Coarse Crackle': 'Estertores grossos são estalidos mais longos, graves e em menor número, como bolhas: riscos verticais mais largos.',
};
const COR = { normal: '--ink-3', continuo: '--cont', descontinuo: '--desc' };

export function escuta(node) {
  node.classList.add('quiz-escuta', 'qe-resp');
  node.innerHTML = `
    <div class="qe-top"><p class="qe-kicker">Atividade · <span class="qe-n">1</span>/5</p><span class="tag clin">Gravações clínicas · pediátricas</span></div>
    <h4 class="qe-q">Ouça e identifique o achado principal.</h4>
    <div class="qe-play"></div>
    <div class="qe-opts" role="group" aria-label="Respostas"></div>
    <div class="qe-fb" aria-live="polite"></div>
    <canvas class="qe-sig" aria-hidden="true"></canvas>
    <p class="qe-proc"></p>
    <div class="qe-next"></div>`;
  const opts = node.querySelector('.qe-opts');
  const fb = node.querySelector('.qe-fb');
  const canvas = node.querySelector('.qe-sig');
  const proc = node.querySelector('.qe-proc');
  const nEl = node.querySelector('.qe-n');
  const sv = new SignalView(canvas, { fmax: 1000 });
  const bPlay = button({ icon: 'play', label: 'Ouvir a gravação', text: 'Ouvir', cls: 'primary' });
  node.querySelector('.qe-play').appendChild(bPlay);
  const bNext = button({ icon: 'next', label: 'Próxima gravação', text: 'Próxima', cls: 'ghost' });
  node.querySelector('.qe-next').appendChild(bNext);
  let fila = [], atual = null, clip = null, player = null, n = 0, acertos = 0, respondido = false, raf = 0;
  const css = getComputedStyle(document.documentElement);

  function sortear() {
    // uma gravação de cada classe, em ordem aleatória (principal ou alternativa)
    const porClasse = {};
    for (const f of Object.values(CLIPS)) (porClasse[f.rotulo_original] ||= []).push(f.id);
    return Object.values(porClasse).map((l) => l[Math.floor(Math.random() * l.length)]).sort(() => Math.random() - 0.5);
  }
  function stop() { const p = player; player = null; p?.stop(); cancelAnimationFrame(raf); setIcon(bPlay, 'play'); bPlay.querySelector('span').textContent = 'Ouvir'; sv.setCursor(-1); }
  async function nova() {
    stop();
    if (!fila.length) { fila = sortear(); n = 0; acertos = 0; }
    atual = CLIPS[fila.shift()]; n++;
    nEl.textContent = n;
    respondido = false;
    fb.innerHTML = ''; proc.textContent = '';
    canvas.classList.remove('show');
    bNext.style.visibility = 'hidden';
    opts.innerHTML = '';
    for (const [k, l] of OPCOES) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'qe-opt'; b.textContent = l; b.dataset.k = k;
      b.addEventListener('click', () => responder(k, b));
      opts.appendChild(b);
    }
    bPlay.disabled = true;
    clip = await loadClip(atual.id);
    bPlay.disabled = false;
  }
  function responder(k, b) {
    if (respondido) return;
    respondido = true;
    const certo = atual.rotulo_original;
    const ok = k === certo;
    if (ok) acertos++;
    opts.querySelectorAll('.qe-opt').forEach((x) => { x.disabled = true; if (x.dataset.k === certo) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    fb.innerHTML = ok
      ? `<div class="fb ok"><p><b>Correto: ${TERMO[certo]}.</b> ${PISTA[certo]}</p></div>`
      : `<div class="fb no"><p><b>O acervo rotulou como ${TERMO[certo]} (${certo}).</b> ${PISTA[certo]}</p><p>Sobre a sua escolha: ${PISTA[k]}</p></div>`;
    canvas.classList.add('show');
    proc.textContent = `${procedencia(atual)}${atual.nota ? ` · ${atual.nota}` : ''}`;
    requestAnimationFrame(() => sv.set({ data: clip.data, sr: clip.sr, events: atual.eventos.map((e) => ({ ...e, cor: css.getPropertyValue(COR[TIPO[e.rotulo] || 'normal']).trim() })) }));
    bNext.style.visibility = 'visible';
    bNext.querySelector('span').textContent = fila.length ? 'Próxima' : `Recomeçar (acertos: ${acertos}/5)`;
  }
  function tick() {
    if (!player) return;
    sv.setCursor(player.ctx.currentTime - player.startedAt);
    raf = requestAnimationFrame(tick);
  }
  bPlay.addEventListener('click', () => {
    if (player) { stop(); return; }
    player = playBuffer(toBuffer(clip.data, clip.sr), { onEnd: () => stop(), onStop: () => { if (player) stop(); } });
    setIcon(bPlay, 'pause'); bPlay.querySelector('span').textContent = 'Parar';
    if (respondido) raf = requestAnimationFrame(tick);
  });
  bNext.addEventListener('click', nova);
  nova();
  return { deactivate: stop, pause: stop };
}

