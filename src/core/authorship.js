/** Aviso autoral acessível a partir do encerramento da aula. */
export function buildAuthorship() {
  const footer = document.querySelector('.author-footer');
  const dialog = document.getElementById('author-rights');
  const open = document.getElementById('author-rights-open');
  const close = document.getElementById('author-rights-close');
  if (!footer || !dialog || !open || !close) return;

  // O diálogo nativo mantém o foco dentro do modal e torna o fundo inerte.
  open.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.getElementById('author-rights-title').focus({ preventScroll: true });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => open.focus({ preventScroll: true }));
  // Evita que atalhos da aula reajam às teclas usadas no aviso ou no rodapé.
  // Mantém o comportamento nativo de Tab, Shift+Tab, Espaço, Enter e Escape.
  dialog.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    const current = document.activeElement;
    if (!first) { event.preventDefault(); return; }
    if (!focusable.includes(current) || (event.shiftKey ? current === first : current === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });
  footer.addEventListener('keydown', (event) => event.stopPropagation());

}
