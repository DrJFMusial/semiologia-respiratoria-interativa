/**
 * Baqueteamento digital: ilustrações do autor (perfil normal e comparação)
 * e dois esquemas desenhados para esta aula: o ângulo do leito ungueal
 * (Lovibond) e o sinal de Schamroth. O sinal de Schamroth é desenhado em
 * vetor porque as ilustrações geradas para ele mostravam a técnica errada.
 */
import { button } from '../../core/ui.js';

function lovibond(baq) {
  // perfil da falange distal; ângulo entre o dorso do dedo e a lâmina ungueal, medido na prega ungueal proximal
  if (!baq) {
    return `<path class="bq-dedo" d="M14 120 L190 112 C228 110 260 118 280 136 C294 154 282 178 252 182 C200 188 100 186 14 184 Z"/>
      <path class="bq-unha" d="M190 112 C220 112 248 120 268 132"/>
      <path class="bq-ang" d="M96 116 L190 112 L276 140"/><circle class="bq-v" cx="190" cy="112" r="5"/>
      <text class="bq-t" x="176" y="92">≈ 160°</text><text class="bq-s" x="20" y="230">dorso do dedo</text><text class="bq-s" x="210" y="230">unha</text>`;
  }
  return `<path class="bq-dedo" d="M14 122 C110 118 160 110 190 96 C226 82 258 80 278 96 C300 118 300 162 276 184 C250 206 200 198 160 192 C110 188 60 188 14 188 Z"/>
    <path class="bq-unha" d="M190 96 C220 86 248 82 266 86 C280 92 288 104 290 118"/>
    <path class="bq-ang" d="M96 115 L190 96 L270 81"/><circle class="bq-v" cx="190" cy="96" r="5"/>
    <text class="bq-t" x="160" y="70">≥ 180°</text><text class="bq-s" x="20" y="230">dorso do dedo</text><text class="bq-s" x="132" y="230">unha em vidro de relógio</text>`;
}

function schamroth(baq) {
  // dois dedos de perfil, pontas para cima, faces dorsais (unhas) encostadas no centro (x = 150)
  const espelho = (d) => d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => `${300 - x} ${y}`);
  let dedo, unha, janela = '';
  if (!baq) {
    // borda dorsal: ponta da unha toca o centro, a base da unha se afasta (janela), a pele volta a encostar
    dedo = 'M60 250 L60 120 C60 84 82 62 112 58 C128 56 140 60 148 70 L139 112 L148 158 L148 250 Z';
    unha = 'M148 70 L139 112';
    janela = '<path class="sc-win" d="M150 72 L141 113 L150 156 L159 113 Z"/>';
  } else {
    // baqueteamento: polpa bulbosa, unha convexa, borda dorsal reta: sem janela
    dedo = 'M60 250 L62 168 C40 150 34 104 52 78 C70 52 108 44 132 52 C142 56 148 64 150 74 L150 250 Z';
    unha = 'M150 74 C146 62 136 54 122 50';
  }
  return `<path class="bq-dedo" d="${dedo}"/><path class="bq-dedo" d="${espelho(dedo)}"/>${janela}
    <path class="bq-unha" d="${unha}"/><path class="bq-unha" d="${espelho(unha)}"/>
    <path class="sc-dip" d="M60 190 C80 184 120 184 146 190 M240 190 C220 184 180 184 154 190"/>
    <text class="bq-t" x="150" y="28" text-anchor="middle">${baq ? 'sem janela: sinal positivo' : 'janela em losango: normal'}</text>`;
}

export function baqueteamento(node) {
  node.classList.add('baqueteamento');
  node.innerHTML = `
    <div class="bq-imgs">
      <figure><img src="${window.__img?.['dedo-normal.webp'] || ''}" alt="Dedo normal em perfil"><figcaption>Normal, em perfil</figcaption></figure>
      <figure><img src="${window.__img?.['baqueteamento.webp'] || ''}" alt="Dedo normal (acima) e dedo com baqueteamento (abaixo), em perfil"><figcaption>Normal (acima) e baqueteamento (abaixo)</figcaption></figure>
    </div>
    <div class="bq-panel">
      <div class="bq-tabs" role="radiogroup" aria-label="Esquema"></div>
      <svg class="bq-svg" viewBox="0 0 300 250" role="img"></svg>
      <div class="bq-state"></div>
      <p class="bq-txt"></p>
    </div>`;
  const svg = node.querySelector('.bq-svg');
  const txt = node.querySelector('.bq-txt');
  let esquema = 'lovibond', baq = false;
  const T = {
    lovibond: 'Ângulo do leito ungueal (de Lovibond), visto de perfil: normal em torno de 160°; no baqueteamento chega a 180° ou mais, porque o tecido sob a base da unha aumenta e a unha fica convexa, em vidro de relógio.',
    schamroth: 'Sinal de Schamroth: o paciente encosta as faces dorsais das falanges distais de dedos correspondentes. Normalmente aparece uma pequena janela em losango entre as bases das unhas; no baqueteamento a janela desaparece.',
  };
  const tabs = [['lovibond', 'Ângulo ungueal'], ['schamroth', 'Sinal de Schamroth']].map(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'seg', pressed: k === esquema });
    b.addEventListener('click', () => { esquema = k; tabs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    node.querySelector('.bq-tabs').appendChild(b); return b;
  });
  const st = [['n', 'Normal'], ['b', 'Baqueteamento']].map(([k, l]) => {
    const b = button({ label: l, text: l, cls: 'chip', pressed: (k === 'b') === baq });
    b.addEventListener('click', () => { baq = k === 'b'; st.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
    node.querySelector('.bq-state').appendChild(b); return b;
  });
  function draw() {
    svg.innerHTML = esquema === 'lovibond' ? lovibond(baq) : schamroth(baq);
    svg.setAttribute('aria-label', `${esquema === 'lovibond' ? 'Ângulo ungueal' : 'Sinal de Schamroth'}, ${baq ? 'baqueteamento' : 'normal'}`);
    txt.textContent = T[esquema];
  }
  draw();
  return {};
}

