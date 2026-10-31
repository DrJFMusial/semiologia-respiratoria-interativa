/**
 * Descritor do ruído adventício: tipo, fase, localização, lateralidade,
 * extensão e efeito da tosse. Monta a frase de registro e avisa quando a
 * combinação contradiz a definição do som.
 */
import { button } from '../core/ui.js';

const CAMPOS = [
  ['tipo', 'Tipo', [['finos', 'estertores finos'], ['grossos', 'estertores grossos'], ['sibilos', 'sibilos'], ['roncos', 'roncos'], ['atrito', 'atrito pleural'], ['estridor', 'estridor']]],
  ['fase', 'Fase', [['finsp', 'no fim da inspiração'], ['iinsp', 'no início da inspiração'], ['exp', 'na expiração'], ['ambas', 'nas duas fases']]],
  ['regiao', 'Região', [['apice', 'no ápice'], ['medio', 'no terço médio'], ['base', 'na base'], ['difuso', 'difusos']]],
  ['face', 'Face', [['post', 'posterior'], ['lat', 'lateral (axilar)'], ['ant', 'anterior']]],
  ['lado', 'Lado', [['D', 'direito'], ['E', 'esquerdo'], ['bi', 'bilateral']]],
  ['tosse', 'Com a tosse', [['nao', 'não se modificam'], ['sim', 'modificam-se'], ['nt', 'não testado']]],
];
const PRESET = { tipo: 'finos', fase: 'finsp', regiao: 'base', face: 'post', lado: 'D', tosse: 'nao' };

function avisos(s) {
  const a = [];
  if (s.tipo === 'finos' && s.fase !== 'finsp' && s.fase !== 'ambas') a.push('Estertores finos são típicos do meio para o fim da inspiração.');
  if (s.tipo === 'finos' && s.tosse === 'sim') a.push('Estertores finos em geral não mudam com a tosse; se mudaram, reconsidere estertores grossos (secreção).');
  if (s.tipo === 'grossos' && s.fase === 'finsp') a.push('Estertores grossos costumam ocorrer no início da inspiração e na expiração.');
  if (s.tipo === 'sibilos' && (s.fase === 'iinsp' || s.fase === 'finsp')) a.push('Sibilos predominam na expiração; sibilo só inspiratório e localizado merece atenção (obstrução focal).');
  if (s.tipo === 'atrito' && s.tosse === 'sim') a.push('O atrito pleural não muda com a tosse: se mudou, pense em estertor grosso.');
  if (s.tipo === 'atrito' && s.regiao === 'difuso') a.push('O atrito costuma ser localizado, onde a pleura está inflamada (frequentemente nas bases e nas regiões laterais).');
  if (s.tipo === 'estridor' && s.fase !== 'iinsp' && s.fase !== 'finsp' && s.fase !== 'ambas') a.push('O estridor é tipicamente inspiratório e mais intenso no pescoço.');
  if (s.regiao === 'difuso' && s.lado !== 'bi') a.push('“Difusos” combina melhor com bilateral; se é de um lado só, diga a região.');
  return a;
}

export function descritor(node) {
  node.classList.add('descritor');
  node.innerHTML = `<div class="ds-rows"></div><div class="ds-out"><p class="ds-k">Registro</p><p class="ds-frase mono" aria-live="polite"></p><div class="ds-av"></div><div class="ds-pre"></div></div>`;
  const st = { ...PRESET };
  const btns = {};
  const rows = node.querySelector('.ds-rows');
  for (const [k, l, ops] of CAMPOS) {
    const r = document.createElement('div'); r.className = 'ds-row';
    r.innerHTML = `<p class="ds-l">${l}</p><div class="ds-ops" role="radiogroup" aria-label="${l}"></div>`;
    btns[k] = ops.map(([v, t]) => {
      const b = button({ label: `${l}: ${t}`, text: t, cls: 'chip' });
      b.setAttribute('role', 'radio');
      b.addEventListener('click', () => { st[k] = v; render(); });
      r.querySelector('.ds-ops').appendChild(b); return [v, b];
    });
    rows.appendChild(r);
  }
  const pre = node.querySelector('.ds-pre');
  [['Caso clínico', PRESET], ['Crise de asma', { tipo: 'sibilos', fase: 'exp', regiao: 'difuso', face: 'post', lado: 'bi', tosse: 'nt' }]].forEach(([l, p]) => {
    const b = button({ label: `Preencher: ${l}`, text: l, cls: 'ghost' });
    b.addEventListener('click', () => { Object.assign(st, p); render(); });
    pre.appendChild(b);
  });
  const T = Object.fromEntries(CAMPOS.map(([k, , ops]) => [k, Object.fromEntries(ops)]));
  function render() {
    for (const k in btns) btns[k].forEach(([v, b]) => { b.setAttribute('aria-pressed', String(st[k] === v)); b.setAttribute('aria-checked', String(st[k] === v)); });
    const tipo = T.tipo[st.tipo];
    const plural = !['atrito', 'estridor'].includes(st.tipo);
    const verbo = st.tosse === 'nt' ? '' : plural ? `, que ${T.tosse[st.tosse]} com a tosse` : `, que ${st.tosse === 'nao' ? 'não se modifica' : 'se modifica'} com a tosse`;
    let onde;
    if (st.regiao === 'difuso') onde = st.lado === 'bi' ? (plural ? 'difusos, bilaterais' : 'difuso, bilateral') : `${plural ? 'difusos' : 'difuso'} no hemitórax ${T.lado[st.lado]}`;
    else onde = `${T.regiao[st.regiao]} ${st.lado === 'bi' ? 'dos dois hemitórax' : `do hemitórax ${T.lado[st.lado]}`}, face ${T.face[st.face]}`;
    const frase = `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${onde}, ${T.fase[st.fase]}${verbo}.`;
    node.querySelector('.ds-frase').textContent = frase;
    const av = avisos(st);
    node.querySelector('.ds-av').innerHTML = av.length ? `<div class="fb no">${av.map((x) => `<p>${x}</p>`).join('')}</div>` : '<div class="fb ok"><p>Descrição coerente com a definição do som.</p></div>';
  }
  render();
  return {};
}

