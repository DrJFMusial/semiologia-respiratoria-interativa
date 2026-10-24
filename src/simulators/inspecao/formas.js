/**
 * Forma do tórax: ilustrações do autor (perfil e oblíquas) com um corte
 * axial esquemático que mostra o que muda em cada forma. Modo comparação
 * coloca duas imagens lado a lado na mesma altura.
 */
import { button } from '../../core/ui.js';

const FORMAS = {
  normal: {
    nome: 'Normal', img: 'torax-normal.webp', vista: 'perfil',
    secao: 'M150 60 C230 60 290 80 290 120 C290 160 230 180 150 180 C70 180 10 160 10 120 C10 80 70 60 150 60 Z',
    texto: 'Diâmetro anteroposterior menor que o laterolateral, em torno da metade. Esterno plano, sem abaulamentos ou retrações, os dois lados simétricos.',
  },
  tonel: {
    nome: 'Em tonel', img: 'torax-tonel.webp', vista: 'perfil',
    secao: 'M150 40 C226 40 282 72 282 120 C282 168 226 200 150 200 C74 200 18 168 18 120 C18 72 74 40 150 40 Z',
    texto: 'Diâmetro anteroposterior aumentado, aproximando-se do laterolateral; costelas mais horizontais. Acompanha a hiperinsuflação crônica (enfisema), mas também aparece com o envelhecimento: sozinho não faz diagnóstico.',
    cuidado: 'Compare com a imagem normal na mesma escala: a diferença é a profundidade do tórax visto de perfil.',
  },
  excavatum: {
    nome: 'Pectus excavatum', img: 'pectus-excavatum.webp', vista: 'oblíqua',
    secao: 'M150 92 C170 70 230 62 270 84 C296 100 296 152 262 170 C220 190 80 190 38 170 C4 152 4 100 30 84 C70 62 130 70 150 92 Z',
    texto: 'Tórax infundibuliforme: depressão da parte inferior do esterno e das cartilagens vizinhas. Em geral é congênito. Formas acentuadas podem reduzir o espaço do coração e dos pulmões; a maioria não tem repercussão.',
    cuidado: 'Na vista oblíqua a depressão aparece como sombra logo acima do apêndice xifoide.',
  },
  carinatum: {
    nome: 'Pectus carinatum', img: 'pectus-carinatum.webp', vista: 'perfil',
    secao: 'M150 34 C170 50 236 70 276 96 C298 116 290 160 250 176 C200 192 100 192 50 176 C10 160 2 116 24 96 C64 70 130 50 150 34 Z',
    texto: 'Tórax cariniforme: o esterno se projeta para a frente, como a quilha de um barco, com as cartilagens vizinhas inclinadas para trás. Em geral é congênito.',
    cuidado: 'Em perfil, a projeção anterior do esterno inferior fica evidente.',
  },
};

export function formas(node) {
  node.classList.add('formas');
  node.innerHTML = `
    <div class="fm-stage"></div>
    <div class="fm-panel">
      <div class="fm-tabs" role="radiogroup" aria-label="Forma do tórax"></div>
      <div class="fm-cmp"></div>
      <div class="fm-card" aria-live="polite"></div>
      <figure class="fm-secao"><svg viewBox="0 0 300 230" aria-hidden="true"><path class="fm-ref" d="${FORMAS.normal.secao}"/><path class="fm-cur"/>
        <path class="fm-ap" d="M150 20V210"/><text x="158" y="28">anteroposterior</text><path class="fm-ll" d="M4 120H296"/><text x="190" y="114">laterolateral</text>
        <text class="fm-fr" x="150" y="226">frente</text></svg>
        <figcaption>Corte axial esquemático: tracejado = normal.</figcaption></figure>
      <p class="fm-outros"><b>Outras formas:</b> tórax chato, em sino, cifótico e cifoescoliótico. A cifoescoliose acentuada pode restringir a ventilação.</p>
    </div>`;
  const stage = node.querySelector('.fm-stage');
  const card = node.querySelector('.fm-card');
  const cur = node.querySelector('.fm-cur');
  let sel = 'normal', cmp = false;
  const tabs = Object.entries(FORMAS).map(([k, f]) => {
    const b = button({ label: f.nome, text: f.nome, cls: 'seg', pressed: k === sel });
    b.addEventListener('click', () => { sel = k; tabs.forEach((x, i) => x.setAttribute('aria-pressed', String(Object.keys(FORMAS)[i] === k))); draw(); });
    node.querySelector('.fm-tabs').appendChild(b); return b;
  });
  const bCmp = button({ label: 'Comparar com a forma normal, lado a lado', text: 'Comparar com o normal', cls: 'chip', pressed: false });
  bCmp.addEventListener('click', () => { cmp = !cmp; bCmp.setAttribute('aria-pressed', String(cmp)); draw(); });
  node.querySelector('.fm-cmp').appendChild(bCmp);
  const src = (n) => window.__img?.[n] || '';
  function draw() {
    const f = FORMAS[sel];
    const show = cmp && sel !== 'normal' ? ['normal', sel] : [sel];
    stage.className = `fm-stage n${show.length}`;
    stage.innerHTML = show.map((k) => `<figure><img src="${src(FORMAS[k].img)}" alt="Tórax ${FORMAS[k].nome.toLowerCase()}, vista ${FORMAS[k].vista}"><figcaption>${FORMAS[k].nome} · ${FORMAS[k].vista}</figcaption></figure>`).join('');
    card.innerHTML = `<h4>${f.nome}</h4><p>${f.texto}</p>${f.cuidado ? `<p class="fm-tip">${f.cuidado}</p>` : ''}`;
    cur.setAttribute('d', f.secao);
  }
  draw();
  return {};
}

