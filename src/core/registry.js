/**
 * Registro de componentes interativos.
 * Cada elemento com data-component="nome" recebe a instância criada pela
 * fábrica correspondente. As instâncias podem expor:
 *   activate()   slide ficou visível
 *   deactivate() slide saiu de cena (pausar animações, parar áudio)
 *   pause()      pausa global solicitada pela barra
 */
const factories = new Map();
const instances = [];

export function register(name, factory) { factories.set(name, factory); }

export function mountAll(root = document) {
  root.querySelectorAll('[data-component]').forEach((node) => {
    if (node.__mounted) return;
    const f = factories.get(node.dataset.component);
    if (!f) { console.warn('Componente não registrado:', node.dataset.component); return; }
    const inst = f(node, { ...node.dataset }) || {};
    node.__mounted = inst;
    instances.push({ node, inst });
    io.observe(node);
  });
}

/* Ativação por visibilidade real: funciona no modo apresentação (um slide
   visível) e no modo estudo (rolagem contínua). */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const inst = e.target.__mounted;
    if (!inst) continue;
    if (e.isIntersecting && e.intersectionRatio > 0.25) inst.activate?.();
    else inst.deactivate?.();
  }
}, { threshold: [0, 0.25, 0.6] });

export function onSlideChange(current) {
  for (const { node, inst } of instances) {
    const inside = current && current.contains(node);
    if (inside) inst.activate?.(); else inst.deactivate?.();
  }
}

export function pauseAll() { instances.forEach(({ inst }) => inst.pause?.()); }

