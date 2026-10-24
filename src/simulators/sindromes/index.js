/**
 * Síndromes pleuropulmonares: matriz em que as linhas são síndromes e as
 * colunas, os achados de cada técnica. Funciona nos dois sentidos:
 *  Explorar     escolhe a síndrome; o tórax e a linha se acendem; cada
 *               célula explica o MECANISMO do achado.
 *  Do achado    o estudante marca o que encontrou e vê quais síndromes
 *               são compatíveis, e o que desempata.
 *  Exercício    um conjunto de achados sem nome; escolher a síndrome.
 * Nenhum sinal isolado define uma síndrome: o que decide é o conjunto.
 */
import { createThorax } from '../../core/thorax.js';
import { button } from '../../core/ui.js';

const COLS = [
  ['insp', 'Inspeção'], ['exp', 'Expansibilidade'], ['fre', 'Frêmito'], ['perc', 'Percussão'],
  ['som', 'Murmúrio / som'], ['adv', 'Adventícios'], ['voz', 'Ressonância vocal'], ['traq', 'Traqueia'],
];
// cada célula: [texto, nível (up/down/abol/var/normal/hiper/mac), mecanismo]
const S = {
  consolidacao: {
    nome: 'Consolidação', ex: 'pneumonia', th: { D: { consol: 1, expande: 0.6 } },
    tags: { fre: ['up'], perc: ['mac'], som: ['bronq'], traq: ['central'], lat: ['uni'] },
    c: {
      insp: ['Menor movimento do lado afetado, se extensa', 'var', 'A dor pleurítica e a perda de complacência limitam a expansão daquele lado.'],
      exp: ['Diminuída no lado afetado', 'down', 'O lobo consolidado não se insufla e a dor restringe o movimento.'],
      fre: ['Aumentado', 'up', 'Alvéolos cheios de exsudato formam um meio sólido que conduz a vibração da voz melhor que o ar, se o brônquio estiver pérvio.'],
      perc: ['Submaciça ou maciça', 'mac', 'Há tecido sem ar sob a parede.'],
      som: ['Som brônquico no lugar do murmúrio', 'up', 'O som gerado nos brônquios chega à parede sem o filtro do pulmão aerado: a base soa como a traqueia.'],
      adv: ['Estertores finos', 'desc', 'Pequenas vias aéreas com exsudato se abrem de forma súbita na inspiração.'],
      voz: ['Aumentada: broncofonia, pectorilóquia', 'up', 'Mesmo mecanismo do frêmito: o meio sólido transmite as frequências altas da voz.'],
      traq: ['Central', 'normal', 'Não há perda nem ganho de volume do hemitórax.'],
    },
  },
  atelectasia: {
    nome: 'Atelectasia', ex: 'obstrução brônquica', th: { D: { atelect: 1, expande: 0.4 }, desvio: -12 },
    tags: { fre: ['down'], perc: ['mac'], som: ['down'], traq: ['para'], lat: ['uni'] },
    c: {
      insp: ['Retração do hemitórax, tiragem', 'var', 'O lobo colabado perde volume e puxa as estruturas vizinhas.'],
      exp: ['Diminuída no lado afetado', 'down', 'O lobo sem ar não se expande.'],
      fre: ['Diminuído ou abolido', 'down', 'Com o brônquio fechado, a vibração não chega ao lobo, mesmo com o parênquima denso.'],
      perc: ['Maciça ou submaciça', 'mac', 'O lobo colabado não tem ar.'],
      som: ['Murmúrio diminuído ou abolido', 'down', 'Sem fluxo de ar naquele lobo, não há som.'],
      adv: ['Em geral ausentes', 'normal', 'Sem fluxo, não há geração de ruídos naquele território.'],
      voz: ['Diminuída', 'down', 'O brônquio obstruído interrompe a transmissão.'],
      traq: ['Desviada PARA o lado afetado', 'para', 'A perda de volume puxa o mediastino em direção ao lado doente.'],
    },
  },
  derrame: {
    nome: 'Derrame pleural', ex: 'líquido na pleura', th: { D: { liquido: 0.6, expande: 0.3 } },
    tags: { fre: ['down'], perc: ['mac'], som: ['down'], traq: ['central', 'oposto'], lat: ['uni'] },
    c: {
      insp: ['Abaulamento dos espaços, se volumoso', 'var', 'O líquido ocupa volume dentro do hemitórax.'],
      exp: ['Diminuída no lado afetado', 'down', 'O pulmão comprimido expande pouco naquela base.'],
      fre: ['Diminuído ou abolido', 'down', 'O líquido entre pulmão e parede reflete e dispersa a vibração.'],
      perc: ['Maciça na base; submaciça na borda', 'mac', 'Líquido sob a parede; o limite superior sobe na lateral.'],
      som: ['Murmúrio diminuído ou abolido', 'down', 'O som do pulmão é atenuado pela camada de líquido.'],
      adv: ['Atrito pleural possível no início ou na resolução', 'desc', 'Com pouco líquido, os folhetos inflamados ainda se tocam e rangem.'],
      voz: ['Diminuída; egofonia na borda superior', 'down', 'A camada de líquido atenua; na borda, o pulmão comprimido modifica o timbre da voz.'],
      traq: ['Central; desviada para o lado OPOSTO se volumoso', 'oposto', 'Grande volume de líquido empurra o mediastino.'],
    },
  },
  pneumotorax: {
    nome: 'Pneumotórax', ex: 'ar na pleura', th: { D: { colapso: 0.85, expande: 0 } },
    tags: { fre: ['down'], perc: ['hiper'], som: ['down'], traq: ['central', 'oposto'], lat: ['uni'] },
    c: {
      insp: ['Hemitórax imóvel ou abaulado', 'var', 'O pulmão retraído não acompanha a parede.'],
      exp: ['Diminuída no lado afetado', 'down', 'Sem acoplamento pleural, a parede se move sem expandir o pulmão.'],
      fre: ['Diminuído ou abolido', 'down', 'Ar na pleura transmite mal a vibração.'],
      perc: ['Hipersonora ou timpânica', 'hiper', 'Ar livre sob a parede.'],
      som: ['Murmúrio diminuído ou abolido', 'down', 'O pulmão retraído está longe da parede, separado por ar.'],
      adv: ['Ausentes', 'normal', 'Não há fluxo junto à parede.'],
      voz: ['Diminuída', 'down', 'Mesma barreira de ar.'],
      traq: ['Desviada para o lado OPOSTO no hipertensivo', 'oposto', 'O ar sob pressão empurra o mediastino: emergência.'],
    },
  },
  hiper: {
    nome: 'Hiperinsuflação', ex: 'enfisema', th: { hiper: 1, bronco: 0.4 },
    tags: { fre: ['down'], perc: ['hiper'], som: ['down', 'prolong'], traq: ['central'], lat: ['bi'] },
    c: {
      insp: ['Tórax em tonel; musculatura acessória; expiração com lábios semicerrados', 'var', 'O ar aprisionado mantém o tórax insuflado; o esforço respiratório aumenta.'],
      exp: ['Diminuída dos dois lados', 'down', 'O tórax já trabalha perto do volume máximo.'],
      fre: ['Diminuído dos dois lados', 'down', 'Excesso de ar no parênquima atenua a vibração.'],
      perc: ['Hipersonora; macicez hepática rebaixada', 'hiper', 'Alvéolos distendidos e diafragmas baixos.'],
      som: ['Murmúrio diminuído; expiração prolongada', 'down', 'Menor fluxo e parênquima hiperaerado; o esvaziamento é lento.'],
      adv: ['Sibilos ou roncos possíveis', 'cont', 'Quando há componente brônquico associado.'],
      voz: ['Diminuída', 'down', 'Mesmo mecanismo do frêmito.'],
      traq: ['Central', 'normal', 'Processo bilateral, sem assimetria de volume.'],
    },
  },
  broncoespasmo: {
    nome: 'Broncoespasmo', ex: 'crise de asma', th: { bronco: 1, hiper: 0.35 },
    tags: { fre: ['normal', 'down'], perc: ['normal', 'hiper'], som: ['prolong', 'down'], traq: ['central'], lat: ['bi'] },
    c: {
      insp: ['Taquipneia, tiragem, musculatura acessória', 'var', 'O estreitamento aumenta o trabalho respiratório.'],
      exp: ['Diminuída dos dois lados', 'down', 'O ar aprisionado limita a expansão.'],
      fre: ['Normal ou diminuído', 'var', 'Depende do grau de aprisionamento de ar.'],
      perc: ['Normal ou hipersonora', 'var', 'Hipersonora quando há aprisionamento.'],
      som: ['Expiração prolongada; murmúrio diminuído nas crises graves', 'down', 'Com fluxo muito baixo, pode não haver som: o "tórax silencioso" é sinal de gravidade.'],
      adv: ['Sibilos difusos, predominantes na expiração', 'cont', 'As paredes estreitadas vibram com a passagem do ar.'],
      voz: ['Normal ou diminuída', 'var', 'Depende do aprisionamento.'],
      traq: ['Central', 'normal', 'Processo difuso, bilateral.'],
    },
  },
};
const CRIT = {
  fre: ['Frêmito', [['up', 'aumentado'], ['down', 'diminuído'], ['normal', 'normal']]],
  perc: ['Percussão', [['mac', 'maciça'], ['hiper', 'hipersonora'], ['normal', 'normal']]],
  som: ['Ausculta', [['bronq', 'som brônquico'], ['down', 'murmúrio diminuído'], ['prolong', 'expiração prolongada']]],
  traq: ['Traqueia', [['central', 'central'], ['para', 'para o lado'], ['oposto', 'para o oposto']]],
  lat: ['Distribuição', [['uni', 'unilateral'], ['bi', 'bilateral']]],
};

export function sindromes(node) {
  node.classList.add('sindromes');
  node.innerHTML = `
    <div class="sd-left">
      <div class="sd-modes" role="radiogroup" aria-label="Modo"></div>
      <div class="sd-fig"></div>
      <div class="sd-card" aria-live="polite"></div>
    </div>
    <div class="sd-right">
      <div class="sd-crit" hidden></div>
      <div class="sd-scroll"><table class="sd-tab"><thead><tr><th>Síndrome</th>${COLS.map(([, l]) => `<th>${l}</th>`).join('')}</tr></thead><tbody></tbody></table></div>
      <div class="sd-ex" hidden></div>
    </div>`;
  const th = createThorax(node.querySelector('.sd-fig'));
  const tbody = node.querySelector('tbody');
  const card = node.querySelector('.sd-card');
  const crit = node.querySelector('.sd-crit');
  const exBox = node.querySelector('.sd-ex');
  let modo = 'explorar', sel = 'consolidacao', cel = null, filtro = {}, ex = null;

  const mB = [['explorar', 'Explorar'], ['achado', 'Do achado à síndrome'], ['exercicio', 'Exercício']].map(([k, l]) => {
    const b = button({ label: `Modo ${l}`, text: l, cls: 'seg', pressed: k === modo });
    b.addEventListener('click', () => { modo = k; mB.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); cel = null; if (k === 'exercicio') novoEx(); draw(); });
    node.querySelector('.sd-modes').appendChild(b); return b;
  });

  function setThorax(k) { th.reset(); th.set({ vol: 0.55, ...(k ? S[k].th : {}) }); }

  function compat(k) {
    return Object.entries(filtro).every(([c, v]) => !v || S[k].tags[c].includes(v));
  }
  function draw() {
    node.dataset.modo = modo;
    crit.hidden = modo !== 'achado';
    exBox.hidden = modo !== 'exercicio';
    const ocultar = modo === 'exercicio' && ex && !ex.respondido;
    tbody.innerHTML = Object.entries(S).map(([k, s]) => {
      const on = modo === 'explorar' ? k === sel : modo === 'achado' ? compat(k) : (ex?.respondido && k === ex.k);
      const dim = modo === 'achado' && !compat(k);
      return `<tr class="${on ? 'on' : ''}${dim ? ' dim' : ''}${ocultar ? ' hide' : ''}" data-k="${k}">
        <th scope="row"><button type="button" class="sd-name">${s.nome}<span>${s.ex}</span></button></th>
        ${COLS.map(([c]) => `<td class="lv-${s.c[c][1]}${cel && cel[0] === k && cel[1] === c ? ' cel' : ''}"><button type="button" class="sd-cell" data-c="${c}">${s.c[c][0]}</button></td>`).join('')}</tr>`;
    }).join('');
    tbody.querySelectorAll('tr').forEach((tr) => {
      tr.querySelector('.sd-name').addEventListener('click', () => { if (modo === 'exercicio' && !ex?.respondido) return; sel = tr.dataset.k; cel = null; if (modo !== 'explorar') { modo = 'explorar'; mB.forEach((x, i) => x.setAttribute('aria-pressed', String(i === 0))); } draw(); });
      tr.querySelectorAll('.sd-cell').forEach((b) => b.addEventListener('click', () => { if (modo === 'exercicio' && !ex?.respondido) return; sel = tr.dataset.k; cel = [tr.dataset.k, b.dataset.c]; draw(); }));
    });
    if (modo === 'explorar') {
      setThorax(sel);
      const s = S[sel];
      if (cel) {
        const [t, , m] = S[cel[0]].c[cel[1]];
        card.innerHTML = `<p class="sd-k">${s.nome} · ${COLS.find((x) => x[0] === cel[1])[1]}</p><h4>${t}</h4><p>${m}</p>`;
      } else card.innerHTML = `<p class="sd-k">${s.nome} · ${s.ex}</p><h4>Toque numa célula</h4><p>Cada achado tem um mecanismo. Compare as linhas: a percussão aproxima, o frêmito e a traqueia separam.</p>`;
    }
    if (modo === 'achado') drawCrit();
    if (modo === 'exercicio') drawEx();
  }
  function drawCrit() {
    crit.innerHTML = Object.entries(CRIT).map(([c, [l, ops]]) => `<div class="sd-cr"><span>${l}</span>${ops.map(([v, t]) => `<button type="button" class="btn chip" aria-pressed="${filtro[c] === v}" data-c="${c}" data-v="${v}">${t}</button>`).join('')}</div>`).join('');
    crit.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { filtro[b.dataset.c] = filtro[b.dataset.c] === b.dataset.v ? null : b.dataset.v; draw(); }));
    const ok = Object.keys(S).filter(compat);
    setThorax(ok.length === 1 ? ok[0] : null);
    const n = Object.values(filtro).filter(Boolean).length;
    let dica = '';
    if (filtro.perc === 'mac' && filtro.fre !== 'up' && !filtro.traq) dica = 'Macicez com frêmito diminuído: derrame ou atelectasia. A posição da traqueia desempata.';
    else if (filtro.perc === 'mac' && !filtro.fre) dica = 'Macicez sozinha não separa consolidação de derrame: veja o frêmito.';
    else if (filtro.perc === 'hiper' && !filtro.lat) dica = 'Hipersonoridade unilateral sugere pneumotórax; bilateral, hiperinsuflação.';
    card.innerHTML = `<p class="sd-k">Do achado à síndrome</p><h4>${n ? `${ok.length} compatíve${ok.length === 1 ? 'l' : 'is'}` : 'Marque o que encontrou'}</h4>
      <p>${n ? (ok.length ? ok.map((k) => S[k].nome).join(', ') + '.' : 'Nenhuma síndrome clássica combina com esse conjunto: reveja o exame ou pense em associação de processos.') : 'Cada achado reduz as possibilidades; nenhum, sozinho, define a síndrome.'}</p>${dica ? `<p class="sd-dica">${dica}</p>` : ''}`;
  }
  function novoEx() {
    const ks = Object.keys(S);
    let k; do { k = ks[Math.floor(Math.random() * ks.length)]; } while (ex && k === ex.k && ks.length > 1);
    ex = { k, respondido: false };
  }
  function drawEx() {
    const s = S[ex.k];
    setThorax(ex.respondido ? ex.k : null);
    exBox.innerHTML = `<p class="sd-k">Achados de um paciente${s.tags.lat[0] === 'uni' ? ' (lado direito)' : ''}</p>
      <ul class="sd-exl">${COLS.map(([c, l]) => `<li><b>${l}:</b> ${s.c[c][0]}</li>`).join('')}</ul>
      <div class="sd-exo">${Object.entries(S).map(([k, x]) => `<button type="button" class="qe-opt" data-k="${k}" ${ex.respondido ? 'disabled' : ''}>${x.nome}</button>`).join('')}</div>`;
    exBox.querySelectorAll('.qe-opt').forEach((b) => {
      if (ex.respondido) { if (b.dataset.k === ex.k) b.classList.add('right'); if (b.dataset.k === ex.escolha && ex.escolha !== ex.k) b.classList.add('wrong'); }
      b.addEventListener('click', () => { ex.respondido = true; ex.escolha = b.dataset.k; draw(); });
    });
    if (!ex.respondido) card.innerHTML = '<p class="sd-k">Exercício</p><h4>Qual síndrome explica o conjunto?</h4><p>Leia todos os achados antes de escolher. O tórax e a matriz aparecem depois da resposta.</p>';
    else {
      const ok = ex.escolha === ex.k;
      const chave = { consolidacao: 'frêmito aumentado com macicez e som brônquico', atelectasia: 'macicez com frêmito diminuído e traqueia desviada para o lado afetado', derrame: 'macicez com frêmito diminuído, sem retração', pneumotorax: 'hipersonoridade unilateral com murmúrio abolido', hiper: 'hipersonoridade bilateral e tórax em tonel', broncoespasmo: 'sibilos difusos com expiração prolongada' }[ex.k];
      card.innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><p><b>${ok ? 'Correto' : `Era ${S[ex.k].nome.toLowerCase()}`}.</b> O que decide: ${chave}.</p></div>`;
      const bN = button({ icon: 'next', label: 'Outro paciente', text: 'Outro paciente', cls: 'ghost' });
      bN.addEventListener('click', () => { novoEx(); draw(); });
      card.appendChild(bN);
    }
  }
  draw();
  return {};
}

