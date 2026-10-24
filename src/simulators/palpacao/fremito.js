/**
 * Frêmito toracovocal: a vibração da voz percorre a via aérea, o parênquima
 * e a pleura até a mão. Meios sólidos transmitem melhor que o pulmão aerado;
 * líquido ou ar entre o pulmão e a parede, ou um brônquio obstruído,
 * atenuam a transmissão. Esquema didático; o frêmito real é tátil.
 */
import { button, captureKeys, prefersReducedMotion } from '../../core/ui.js';

const COND = {
  normal: { nome: 'Normal', meio: 'ar', espaco: null, bronco: true, ganho: [1, 0.55, 1, 1], resultado: 'presente e simétrico', nivel: 2,
    txt: 'O pulmão aerado transmite a vibração da voz com perdas: a mão sente uma vibração moderada, igual nos pontos simétricos. É mais nítido onde a parede é fina e perto dos brônquios maiores (região interescapular); diminui nas bases.' },
  consolidacao: { nome: 'Consolidação', meio: 'solido', espaco: null, bronco: true, ganho: [1, 1, 1, 1], resultado: 'aumentado', nivel: 3,
    txt: 'Alvéolos cheios de exsudato formam um meio sólido e contínuo, desde que o brônquio esteja pérvio: a vibração chega à parede com menos perda. Frêmito aumentado no lado e na região afetados.' },
  derrame: { nome: 'Derrame pleural', meio: 'ar', espaco: 'liquido', bronco: true, ganho: [1, 0.55, 0.22, 1], resultado: 'diminuído ou abolido', nivel: 0.6,
    txt: 'O líquido entre o pulmão e a parede reflete e dispersa a vibração. Frêmito diminuído ou abolido sobre o derrame. Contraste útil com a consolidação: os dois dão macicez, mas o frêmito vai em sentidos opostos.' },
  pneumotorax: { nome: 'Pneumotórax', meio: 'ar', espaco: 'ar', bronco: true, ganho: [1, 0.55, 0.12, 1], resultado: 'diminuído ou abolido', nivel: 0.4,
    txt: 'Ar entre as pleuras é péssimo condutor dessa vibração. Frêmito diminuído ou abolido, com hipersonoridade à percussão.' },
  atelectasia: { nome: 'Atelectasia obstrutiva', meio: 'solido', espaco: null, bronco: false, ganho: [0.12, 1, 1, 1], resultado: 'diminuído ou abolido', nivel: 0.4,
    txt: 'O brônquio fechado (tumor, secreção, corpo estranho) impede a vibração de chegar ao lobo, mesmo sem ar nos alvéolos. Frêmito diminuído, apesar de o parênquima estar denso: o caminho é tão importante quanto o meio.' },
  enfisema: { nome: 'Hiperinsuflação ou parede espessa', meio: 'hiper', espaco: null, bronco: true, ganho: [1, 0.3, 1, 0.7], resultado: 'diminuído, em geral bilateral', nivel: 0.9,
    txt: 'Excesso de ar no pulmão (enfisema) ou muito tecido na parede (obesidade, musculatura) atenuam a vibração dos dois lados. Por isso o achado tem mais valor quando é assimétrico.' },
};

export function fremito(node) {
  node.classList.add('fremito');
  node.tabIndex = 0;
  node.innerHTML = `
    <figure class="fr-photo"><img src="${window.__img?.['fremito.webp'] || ''}" alt="Examinadora com a mão espalmada sobre o tórax posterior superior do paciente"></figure>
    <div class="fr-sim">
      <svg class="fr-svg" viewBox="0 0 780 300" aria-hidden="true">
        <rect class="fr-z voz" x="0" y="40" width="110" height="220" rx="14"/>
        <rect class="fr-z bro" x="110" y="110" width="170" height="80"/>
        <rect class="fr-z par" x="280" y="40" width="270" height="220"/>
        <rect class="fr-z esp" x="550" y="40" width="40" height="220"/>
        <rect class="fr-z par2" x="590" y="40" width="60" height="220"/>
        <path class="fr-block" d="M262 112 V188"/>
        <path class="fr-wave"/>
        <g class="fr-hand"><path d="M664 92 C700 86 744 96 760 120 L760 200 C744 214 700 222 664 210 Z"/><text x="712" y="160">mão</text></g>
        <text class="fr-lab" x="55" y="282">voz</text><text class="fr-lab" x="195" y="282">brônquio</text>
        <text class="fr-lab" x="415" y="282">parênquima</text><text class="fr-lab" x="570" y="282">pleura</text><text class="fr-lab" x="620" y="282">parede</text>
        <text class="fr-voz" x="55" y="155">“33”</text>
      </svg>
      <div class="fr-meter"><span>Vibração na mão</span><div class="fr-bar"><i></i></div><b class="fr-res"></b></div>
    </div>
    <div class="fr-panel">
      <div class="fr-cond" role="radiogroup" aria-label="Situação"></div>
      <div class="fr-card" aria-live="polite"></div>
      <p class="fr-tip"><b>Técnica:</b> face palmar ou borda ulnar da mão, pontos simétricos de cima para baixo, paciente dizendo “trinta e três” sempre com a mesma intensidade.</p>
      <span class="tag sim">Esquema didático · o frêmito real é tátil</span>
    </div>`;
  const wave = node.querySelector('.fr-wave');
  const hand = node.querySelector('.fr-hand');
  const bar = node.querySelector('.fr-bar i');
  const res = node.querySelector('.fr-res');
  const card = node.querySelector('.fr-card');
  let cond = 'normal', raf = 0, active = false, t0 = 0;
  const cbs = Object.entries(COND).map(([k, c]) => {
    const b = button({ label: c.nome, text: c.nome, cls: 'chip', pressed: k === cond });
    b.addEventListener('click', () => { cond = k; cbs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); setCond(); });
    node.querySelector('.fr-cond').appendChild(b); return b;
  });
  function env(x, c) {
    // amplitude ao longo do caminho: perdas em cada meio
    const [gBro, gPar, gEsp, gParede] = c.ganho;
    let a = 1;
    if (x > 110) a *= x < 262 ? 1 : gBro;
    if (x > 280) a *= 1 - (1 - gPar) * Math.min(1, (x - 280) / 270);
    if (x > 550) a *= 1 - (1 - gEsp) * Math.min(1, (x - 550) / 40);
    if (x > 590) a *= gParede;
    return a;
  }
  function setCond() {
    const c = COND[cond];
    node.dataset.cond = cond;
    node.querySelector('.fr-z.par').setAttribute('class', `fr-z par ${c.meio}`);
    node.querySelector('.fr-z.esp').setAttribute('class', `fr-z esp ${c.espaco || ''}`);
    node.querySelector('.fr-block').style.display = c.bronco ? 'none' : '';
    const fim = env(660, c);
    bar.style.width = `${Math.min(100, fim * 100)}%`;
    res.textContent = c.resultado;
    card.innerHTML = `<h4>${c.nome}: frêmito ${c.resultado}</h4><p>${c.txt}</p>`;
    draw(0.6);
  }
  function draw(ph) {
    const c = COND[cond];
    let d = '';
    for (let x = 40; x <= 662; x += 3) {
      const y = 150 + Math.sin((x / 26) - ph * 9) * 46 * env(x, c);
      d += `${d ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
    }
    wave.setAttribute('d', d);
    const a = env(660, c);
    hand.setAttribute('transform', `translate(${(Math.sin(ph * 60) * a * 2.2).toFixed(2)} 0)`);
  }
  function frame(now) {
    if (!t0) t0 = now;
    draw((now - t0) / 1000);
    if (active) raf = requestAnimationFrame(frame);
  }
  captureKeys(node, () => false);
  setCond();
  return {
    activate() { if (active || prefersReducedMotion()) return; active = true; t0 = 0; raf = requestAnimationFrame(frame); },
    deactivate() { active = false; cancelAnimationFrame(raf); },
    pause() { active = false; cancelAnimationFrame(raf); },
  };
}

