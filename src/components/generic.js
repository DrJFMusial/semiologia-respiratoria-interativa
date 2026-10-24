/**
 * Componentes genéricos, configurados pelo próprio HTML do slide.
 *
 * revelar   itens .rv-item que se abrem por clique (apresentação) ou já
 *           abertos (estudo). Botão opcional "Revelar tudo".
 * hotspots  figura com marcadores numerados (data-x, data-y em %) ligados a
 *           itens de lista .hs-item[data-k]; clicar em um destaca o outro.
 * checklist caixas de seleção com contagem; nada é armazenado.
 */
import { button, captureKeys } from '../core/ui.js';

const estudo = () => document.body.classList.contains('modo-estudo');

export function revelar(node) {
  const items = [...node.querySelectorAll('.rv-item')];
  items.forEach((it, i) => {
    it.tabIndex = 0;
    it.setAttribute('role', 'button');
    it.setAttribute('aria-expanded', 'false');
    const toggle = () => {
      const on = !it.classList.contains('open');
      it.classList.toggle('open', on);
      it.setAttribute('aria-expanded', String(on));
    };
    it.addEventListener('click', (e) => { if (!e.target.closest('a, button:not(.rv-item)')) toggle(); });
    it.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(); }
    });
    it.style.setProperty('--i', i);
  });
  const all = (on) => items.forEach((it) => { it.classList.toggle('open', on); it.setAttribute('aria-expanded', String(on)); });
  if (node.dataset.botao !== 'nao' && !estudo()) {
    const b = button({ label: 'Revelar todos', text: 'Revelar todos', cls: 'chip rv-all' });
    b.addEventListener('click', () => all(!items.every((x) => x.classList.contains('open'))));
    (node.querySelector('.rv-tools') || node).appendChild(b);
  }
  if (estudo()) all(true);
  return { activate() { if (estudo()) all(true); } };
}

export function hotspots(node) {
  const fig = node.querySelector('.hs-fig');
  const items = [...node.querySelectorAll('.hs-item')];
  const marks = [...fig.querySelectorAll('[data-k]')].map((m) => {
    m.classList.add('hs-mark');
    m.style.left = `${m.dataset.x}%`;
    m.style.top = `${m.dataset.y}%`;
    m.tabIndex = 0;
    m.setAttribute('role', 'button');
    m.setAttribute('aria-label', items.find((it) => it.dataset.k === m.dataset.k)?.querySelector('b')?.textContent || m.textContent);
    return m;
  });
  let sel = null;
  const pick = (k) => {
    sel = sel === k ? null : k;
    node.classList.toggle('has-sel', !!sel);
    marks.forEach((m) => m.classList.toggle('sel', m.dataset.k === sel));
    items.forEach((it) => it.classList.toggle('sel', it.dataset.k === sel));
  };
  [...marks, ...items].forEach((el) => {
    el.addEventListener('click', () => pick(el.dataset.k));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(el.dataset.k); } });
  });
  items.forEach((it) => { it.tabIndex = 0; it.setAttribute('role', 'button'); });
  captureKeys(node, (e) => { if (e.key === 'Escape' && sel) { pick(sel); return true; } return false; });
  return {};
}

export function checklist(node) {
  const boxes = [...node.querySelectorAll('input[type="checkbox"]')];
  const out = node.querySelector('.ck-count');
  const upd = () => {
    const n = boxes.filter((b) => b.checked).length;
    if (out) out.textContent = `${n} de ${boxes.length}`;
    node.style.setProperty('--prog', boxes.length ? n / boxes.length : 0);
  };
  boxes.forEach((b) => b.addEventListener('change', upd));
  const reset = node.querySelector('.ck-reset');
  reset?.addEventListener('click', () => { boxes.forEach((b) => { b.checked = false; }); upd(); });
  upd();
  return {};
}

