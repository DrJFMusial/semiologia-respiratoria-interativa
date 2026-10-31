import { ENCONTRO } from './config-aula.js';
import './styles/correcoes-conteudo.css';
/**
 * Semiologia Respiratória Interativa | E2M08 2026/2
 * Ponto de entrada: monta os slides, inicializa o Reveal no modo escolhido
 * (apresentação ou estudo) e registra os componentes interativos.
 * Arquitetura herdada da aula de Semiologia Cardiovascular Interativa.
 */
import Reveal from 'reveal.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';
import 'reveal.js/dist/reveal.css';

import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/slides.css';
import './styles/components.css';
import './styles/base-content.css';
import './styles/resp.css';
import './styles/artefato.css';
import './styles/theme.css';
import './styles/authorship.css';

try {
  const savedTheme = localStorage.getItem('e2m08-theme');
  document.documentElement.dataset.theme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch { document.documentElement.dataset.theme = 'light'; }

import { register, mountAll } from './core/registry.js';
import { buildShell } from './core/shell.js';
import { revelar, hotspots, checklist } from './components/generic.js';
import { roteiro } from './components/roteiro.js';
import { capa } from './components/capa.js';
import { creditos } from './components/creditos.js';
import { superficie } from './simulators/superficie/index.js';
import { mecanica } from './simulators/mecanica/index.js';
import { cicloResp } from './simulators/ciclo/index.js';
import { formas } from './simulators/inspecao/formas.js';
import { baqueteamento } from './simulators/inspecao/baqueteamento.js';
import { padroes } from './simulators/inspecao/padroes.js';
import { expansib } from './simulators/palpacao/expansib.js';
import { fremito } from './simulators/palpacao/fremito.js';
import { percussao } from './simulators/percussao/index.js';
import { mapaAusculta } from './simulators/ausculta/mapa.js';
import { gravacao, somEsquema, fasesNormais } from './simulators/ausculta/gravacao.js';
import { ressonancia } from './simulators/ausculta/ressonancia.js';
import { escuta } from './simulators/quiz/escuta.js';
import { artefato } from './simulators/ausculta/artefato.js';
import { audioProfessor } from './simulators/ausculta/audio-professor.js';
import { sindromes } from './simulators/sindromes/index.js';
import { descritor } from './components/descritor.js';
import { registro } from './components/registro.js';

// ---- conteúdo: um arquivo HTML por slide, em ordem alfabética ----------------
const files = import.meta.glob('./slides/*.html', { query: '?raw', import: 'default', eager: true });
// imagens: os slides citam "@img/nome.webp"; o Vite resolve o endereço final
// (arquivo com hash no site, data URI no pacote offline)
const imgs = import.meta.glob('./assets/images/*.webp', { query: '?url', import: 'default', eager: true });
export const imgUrl = Object.fromEntries(Object.entries(imgs).map(([k, v]) => [k.split('/').pop(), v]));
window.__img = imgUrl;
const html = Object.keys(files).sort().map((k) => files[k]).join('\n')
  .replace(/@img\/([\w.-]+)/g, (m, n) => imgUrl[n] || m);
document.querySelector('.reveal .slides').innerHTML = html;
const encontro = document.querySelector('.capa-encontro');
if (encontro && ENCONTRO != null) encontro.textContent += ' · ' + ENCONTRO + 'º encontro';

// ---- modo ------------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const estreito = window.matchMedia('(max-width: 820px), (max-height: 520px) and (max-width: 1000px)').matches;
const modo = params.get('modo') || (estreito ? 'estudo' : 'apresentacao');
document.body.classList.add(modo === 'estudo' ? 'modo-estudo' : 'modo-apresentacao');
try {
  if (localStorage.getItem('reduce-motion') === '1') document.documentElement.classList.add('reduce-motion');
} catch { /* armazenamento indisponível: segue sem preferência salva */ }

// ---- componentes ------------------------------------------------------------------
const C = {
  capa, roteiro, revelar, hotspots, checklist, creditos, artefato, 'audio-professor': audioProfessor,
  superficie, mecanica, 'ciclo-resp': cicloResp, formas, baqueteamento, padroes,
  expansib, fremito, percussao, 'mapa-ausculta': mapaAusculta, gravacao, 'som-esquema': somEsquema,
  'fases-normais': fasesNormais, ressonancia, escuta, sindromes, descritor, registro,
};
Object.entries(C).forEach(([k, f]) => register(k, f));

/* Modo apresentação: Reveal com tela fixa de 1600 × 900 escalada sem corte.
   Modo estudo: documento rolável e responsivo (sem escala), para leitura no
   celular; a barra usa o mesmo contrato mínimo do Reveal (adaptador abaixo). */
let deck;
if (modo === 'estudo') {
  deck = studyDeck();
  mountAll(document);
  buildShell(deck, { modo });
} else {
  deck = new Reveal(document.querySelector('.reveal'), {
    width: 1600,
    height: 900,
    scrollActivationWidth: 0,
    margin: 0.03,
    minScale: 0.2,
    maxScale: 2.5,
    hash: true,
    history: false,
    controls: true,
    controlsLayout: 'bottom-right',
    progress: true,
    slideNumber: 'c/t',
    center: false,
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'none',
    plugins: [Notes],
  });
  deck.initialize().then(() => {
    mountAll(document);
    buildShell(deck, { modo });
  });
}

function studyDeck() {
  const slides = [...document.querySelectorAll('.reveal .slides > section')];
  slides.forEach((s, i) => { s.id = s.id || `s${i + 1}`; });
  const go = (i) => slides[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const m = /^#\/?(\d+)/.exec(location.hash);
  if (m) requestAnimationFrame(() => go(Number(m[1])));
  return {
    getSlides: () => slides,
    slide: go,
    getIndices: () => {
      let h = 0;
      slides.forEach((s, i) => { if (s.getBoundingClientRect().top < 140) h = i; });
      return { h, v: 0 };
    },
    getPlugin: () => null,
  };
}

window.__deck = deck;

