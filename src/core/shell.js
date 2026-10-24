/**
 * Barra da aplicação: menu de seções, início, modo (apresentação/estudo),
 * pausa global, redução de movimento, volume, notas do apresentador e tela cheia.
 */
import { button, ICON } from './ui.js';
import { setVolume, setMuted, audioState, onAudioChange } from './audio.js';
import { pauseAll } from './registry.js';

export function buildShell(deck, { modo }) {
  const bar = document.createElement('nav');
  bar.className = 'appbar';
  bar.setAttribute('aria-label', 'Controles da aula');
  bar.innerHTML = `
    <div class="ab-left">
      <span class="ab-brand"><b>Semiologia Respiratória</b><span>E2M08 · 2026/2</span></span>
    </div>
    <div class="ab-right"></div>`;
  const right = bar.querySelector('.ab-right');

  const bMenu = button({ icon: 'menu', label: 'Seções da aula (M)', text: 'Seções' });
  const bHome = button({ icon: 'home', label: 'Voltar ao início (Home)' });
  const bModo = button({
    icon: modo === 'estudo' ? 'screen' : 'book',
    label: modo === 'estudo' ? 'Mudar para o modo apresentação' : 'Mudar para o modo estudo',
    text: modo === 'estudo' ? 'Apresentação' : 'Estudo',
  });
  const bPause = button({ icon: 'pauseAll', label: 'Pausar todas as animações e sons (X)' });
  const bMotion = button({ icon: 'motion', label: 'Reduzir movimento', pressed: document.documentElement.classList.contains('reduce-motion') });
  const vol = document.createElement('div');
  vol.className = 'ab-vol';
  vol.innerHTML = `<button type="button" class="btn" aria-label="Silenciar"></button>
    <input type="range" min="0" max="1" step="0.05" aria-label="Volume" />`;
  const bMute = vol.querySelector('button');
  const range = vol.querySelector('input');
  const bNotes = button({ icon: 'notes', label: 'Notas do apresentador (S)' });
  const bFull = button({ icon: 'full', label: 'Tela cheia (F)' });
  right.append(bMenu, bHome, bModo, bPause, bMotion, vol);
  const bTheme = document.createElement('button');
  bTheme.type = 'button';
  bTheme.className = 'btn theme-toggle';
  const paintTheme = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    bTheme.textContent = dark ? '☀' : '☾';
    bTheme.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    bTheme.setAttribute('title', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    bTheme.setAttribute('aria-pressed', String(dark));
  };
  paintTheme();
  bTheme.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    window.dispatchEvent(new Event('e2m08-theme-change'));
    try { localStorage.setItem('e2m08-theme', theme); } catch { /* preferência opcional */ }
    paintTheme();
  });
  right.append(bTheme);
  if (modo !== 'estudo') right.append(bNotes);
  right.append(bFull);
  document.body.appendChild(bar);

  // ---- volume ----
  const paint = ({ volume, muted }) => {
    range.value = String(volume);
    bMute.innerHTML = muted || volume === 0 ? ICON.mute : ICON.sound;
    bMute.setAttribute('aria-pressed', String(muted));
  };
  paint(audioState());
  onAudioChange(paint);
  range.addEventListener('input', () => { setVolume(parseFloat(range.value)); if (audioState().muted) setMuted(false); });
  bMute.addEventListener('click', () => setMuted(!audioState().muted));
  range.addEventListener('keydown', (e) => e.stopPropagation());

  // ---- menu de seções ----
  const menu = document.createElement('div');
  menu.className = 'sections-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-label', 'Seções da aula');
  menu.hidden = true;
  const slides = deck.getSlides();
  const groups = [];
  slides.forEach((s, i) => {
    const sec = s.dataset.section || 'Aula';
    let g = groups.find((x) => x.nome === sec);
    if (!g) { g = { nome: sec, itens: [] }; groups.push(g); }
    g.itens.push({ i, titulo: s.dataset.menuTitle || `Slide ${i + 1}` });
  });
  menu.innerHTML = `<div class="sm-inner">${groups.map((g) => `
      <div class="sm-group"><h6>${g.nome}</h6>
        <ol>${g.itens.map((it) => `<li><button type="button" data-i="${it.i}"><span>${it.i + 1}</span>${it.titulo}</button></li>`).join('')}</ol>
      </div>`).join('')}</div>`;
  document.body.appendChild(menu);
  const toggleMenu = (on = menu.hidden) => {
    menu.hidden = !on;
    bMenu.setAttribute('aria-expanded', String(on));
    if (on) menu.querySelector(`[data-i="${deck.getIndices().h}"]`)?.focus();
  };
  bMenu.addEventListener('click', () => toggleMenu());
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) { deck.slide(Number(b.dataset.i)); toggleMenu(false); }
    else if (e.target === menu) toggleMenu(false);
  });
  menu.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') toggleMenu(false); });

  // ---- demais ----
  bHome.addEventListener('click', () => deck.slide(0));
  bModo.addEventListener('click', () => {
    const u = new URL(location.href);
    if (modo === 'estudo') u.searchParams.set('modo', 'apresentacao'); else u.searchParams.set('modo', 'estudo');
    location.href = u.toString();
  });
  bPause.addEventListener('click', pauseAll);
  bMotion.addEventListener('click', () => {
    const on = !document.documentElement.classList.contains('reduce-motion');
    document.documentElement.classList.toggle('reduce-motion', on);
    bMotion.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem('reduce-motion', on ? '1' : '0'); } catch { /* armazenamento indisponível */ }
  });
  bNotes.addEventListener('click', () => deck.getPlugin('notes')?.open());
  const fsTarget = document.documentElement;
  bFull.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else fsTarget.requestFullscreen?.();
  });

  // no modo apresentação a barra some após alguns segundos sem uso do mouse
  if (modo !== 'estudo') {
    let idle = 0;
    const wake = () => {
      document.body.classList.remove('idle');
      clearTimeout(idle);
      idle = setTimeout(() => { if (menu.hidden) document.body.classList.add('idle'); }, 2600);
    };
    ['pointermove', 'pointerdown', 'focusin'].forEach((ev) => document.addEventListener(ev, wake, { passive: true }));
    wake();
  }

  // atalhos globais adicionais (quando o foco não está num componente)
  document.addEventListener('keydown', (e) => {
    if (e.target.closest?.('[data-component], input, select, textarea')) return;
    if (e.key === 'm' || e.key === 'M') { toggleMenu(); e.preventDefault(); }
    if (e.key === 'x' || e.key === 'X') { pauseAll(); }
    if (e.key === 'Home') { deck.slide(0); }
  });
}

