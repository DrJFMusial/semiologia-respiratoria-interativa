/**
 * Construtor de registro do exame do tórax: cada linha do prontuário tem
 * opções; o texto final segue a ordem do exame e o que difere do normal
 * fica destacado. Atalhos: "Exame normal" e "Caso didático".
 */
import { button } from '../core/ui.js';

const LINHAS = [
  { id: 'insp', rot: 'Inspeção', ops: [
    ['Tórax simétrico, sem abaulamentos ou retrações. Eupneico, FR 16 irpm, sem tiragem ou uso de musculatura acessória.', 'normal'],
    ['Tórax simétrico. Taquipneico, FR 26 irpm, sem tiragem; respiração superficial, limitada pela dor à direita.', 'taquipneia com dor'],
    ['Tórax em tonel. FR 24 irpm, uso de musculatura acessória, expiração prolongada com lábios semicerrados.', 'tonel e esforço'],
  ] },
  { id: 'exp', rot: 'Expansibilidade', ops: [
    ['Expansibilidade preservada e simétrica em ápices e bases.', 'simétrica'],
    ['Expansibilidade diminuída na base direita.', 'reduzida à direita'],
    ['Expansibilidade diminuída bilateralmente.', 'reduzida bilateral'],
  ] },
  { id: 'ftv', rot: 'Frêmito toracovocal', ops: [
    ['FTV presente e simétrico.', 'normal'],
    ['FTV aumentado na base direita (região infraescapular).', 'aumentado à direita'],
    ['FTV diminuído na base direita.', 'diminuído à direita'],
  ] },
  { id: 'perc', rot: 'Percussão', ops: [
    ['Som claro pulmonar em todo o tórax.', 'claro pulmonar'],
    ['Macicez na base direita, a partir do ângulo inferior da escápula; som claro pulmonar no restante.', 'macicez à direita'],
    ['Hipersonoridade difusa.', 'hipersonoridade'],
  ] },
  { id: 'ausc', rot: 'Ausculta', ops: [
    ['MV presente e simétrico, sem RA.', 'normal'],
    ['Som brônquico na base direita, com estertores finos no fim da inspiração, que não se modificam com a tosse. MV presente no restante, sem outros RA.', 'brônquico e finos à direita'],
    ['MV diminuído na base direita, sem RA.', 'MV diminuído à direita'],
    ['MV diminuído difusamente, com expiração prolongada e sibilos expiratórios difusos.', 'sibilos difusos'],
  ] },
  { id: 'voz', rot: 'Ressonância vocal', ops: [
    ['Ressonância vocal normal e simétrica.', 'normal'],
    ['Broncofonia e pectorilóquia afônica na base direita.', 'aumentada à direita'],
    ['Ressonância vocal diminuída na base direita.', 'diminuída à direita'],
  ] },
];
const PRESETS = {
  normal: { insp: 0, exp: 0, ftv: 0, perc: 0, ausc: 0, voz: 0 },
  paulo: { insp: 1, exp: 1, ftv: 1, perc: 1, ausc: 1, voz: 1 },
};

export function registro(node) {
  node.classList.add('registro');
  node.innerHTML = `
    <div class="rg-left"><div class="rg-presets"></div><div class="rg-rows"></div></div>
    <div class="rg-right">
      <div class="rg-sheet mono" aria-live="polite"></div>
      <div class="rg-check" aria-live="polite"></div>
      <details class="rg-siglas"><summary>Siglas</summary>
        <dl><div><dt>FR</dt><dd>frequência respiratória</dd></div><div><dt>irpm</dt><dd>incursões respiratórias por minuto</dd></div>
          <div><dt>FTV</dt><dd>frêmito toracovocal</dd></div><div><dt>MV</dt><dd>murmúrio vesicular</dd></div>
          <div><dt>RA</dt><dd>ruídos adventícios</dd></div></dl></details>
    </div>`;
  const st = { ...PRESETS.normal };
  const rows = node.querySelector('.rg-rows');
  const sheet = node.querySelector('.rg-sheet');
  const check = node.querySelector('.rg-check');
  const btns = {};
  for (const l of LINHAS) {
    const r = document.createElement('div'); r.className = 'rg-row';
    r.innerHTML = `<p class="rg-l">${l.rot}</p><div class="rg-ops" role="radiogroup" aria-label="${l.rot}"></div>`;
    btns[l.id] = l.ops.map(([, lab], i) => {
      const b = button({ label: `${l.rot}: ${lab}`, text: lab, cls: 'chip' });
      b.setAttribute('role', 'radio');
      b.addEventListener('click', () => { st[l.id] = i; render(); });
      r.querySelector('.rg-ops').appendChild(b); return b;
    });
    rows.appendChild(r);
  }
  function coerencia() {
    // incoerências didáticas entre técnicas (achados que não combinam)
    const m = [];
    if (st.ftv === 1 && st.perc === 0) m.push('FTV aumentado costuma vir com macicez ou submacicez no mesmo local.');
    if (st.ftv === 1 && st.ausc === 2) m.push('FTV aumentado com MV diminuído é combinação incomum: na consolidação com brônquio pérvio espera-se som brônquico.');
    if (st.ftv === 2 && st.voz === 1) m.push('Frêmito e ressonância vocal dependem do mesmo mecanismo e costumam mudar no mesmo sentido.');
    if (st.ftv === 1 && st.voz === 2) m.push('Frêmito e ressonância vocal dependem do mesmo mecanismo e costumam mudar no mesmo sentido.');
    if (st.perc === 2 && st.ftv === 1) m.push('Hipersonoridade com FTV aumentado não combina: excesso de ar atenua o frêmito.');
    return m;
  }
  function render() {
    for (const l of LINHAS) btns[l.id].forEach((b, i) => { b.setAttribute('aria-pressed', String(st[l.id] === i)); b.setAttribute('aria-checked', String(st[l.id] === i)); });
    sheet.innerHTML = `<p class="rg-h">Aparelho respiratório</p>${LINHAS.map((l) => `<p class="${st[l.id] ? 'alt' : ''}">${l.ops[st[l.id]][0]}</p>`).join('')}`;
    const c = coerencia();
    check.innerHTML = c.length ? `<div class="fb no">${c.map((x) => `<p>${x}</p>`).join('')}</div>` : '';
  }
  const pr = node.querySelector('.rg-presets');
  [['normal', 'Exame normal'], ['paulo', 'Caso didático']].forEach(([k, l]) => {
    const b = button({ label: `Preencher: ${l}`, text: l, cls: 'ghost' });
    b.addEventListener('click', () => { Object.assign(st, PRESETS[k]); render(); });
    pr.appendChild(b);
  });
  render();
  return {};
}

