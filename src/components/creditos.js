/**
 * Créditos das gravações: gerados a partir das fichas (clips.json), para que
 * a atribuição exigida pela licença acompanhe sempre os arquivos em uso.
 */
import { CLIPS, TERMO } from '../core/clips.js';

export function creditos(node) {
  const rows = Object.values(CLIPS).map((f) => `<tr>
      <td>${f.id}</td><td>${TERMO[f.rotulo_original] || f.rotulo_original} <span class="cr-orig">(${f.rotulo_original})</span></td>
      <td class="mono">${f.fonte.sha256_original.slice(0, 16)}…</td><td>${f.fonte.ponto}</td>
      <td class="mono">${f.trecho_original_s.map((x) => String(x).replace('.', ',')).join('–')} s</td></tr>`).join('');
  node.innerHTML = `
    <p class="cr-lead">Gravações clínicas: trechos do <b>SPRSound</b> (Shanghai Jiao Tong University e hospitais afiliados),
      licença <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.
      Zhang Q. et al., <i>IEEE Transactions on Biomedical Circuits and Systems</i>, 2022.
      <a href="https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound" target="_blank" rel="noopener">Repositório</a>.
      Modificações: corte do trecho, rampas de 30 ms, ganho único sem filtragem, cabeçalho WAV regravado. Rótulos clínicos mantidos como no acervo.</p>
    <div class="cr-scroll"><table class="cr-tab">
      <thead><tr><th>Trecho</th><th>Rótulo</th><th>SHA-256 original</th><th>Ponto</th><th>Trecho original</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <p><a href="./licencas/CREDITOS_E_LICENCAS.md" target="_blank" rel="noopener">Créditos completos</a> ·
    <a href="./licencas/LICENSE-SPRSound-CC-BY-4.0.txt" target="_blank" rel="noopener">Licença SPRSound</a> ·
    <a href="./licencas/LICENSE-reveal-MIT.txt" target="_blank" rel="noopener">reveal.js — MIT</a> ·
    <a href="./licencas/LICENSE-Inter-OFL.txt" target="_blank" rel="noopener">Inter — OFL</a> ·
    <a href="./licencas/LICENSE-IBMPlexMono-OFL.txt" target="_blank" rel="noopener">IBM Plex Mono — OFL</a></p>`;
  return {};
}

