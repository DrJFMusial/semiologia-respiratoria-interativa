/**
 * Gravações clínicas da aula (trechos do SPRSound, CC BY 4.0).
 * Cada trecho tem uma ficha (clips.json) com o registro original, o rótulo
 * clínico original, os eventos anotados pelos autores do acervo, a licença e
 * as modificações feitas. Os arquivos são WAV PCM 16 bits, 8 kHz, mono:
 * são lidos aqui sem reamostragem, de modo que o espectrograma é calculado
 * sobre as mesmas amostras do arquivo.
 */
import FICHAS from '../assets/audio/clips.json';

const urls = import.meta.glob('../assets/audio/*.wav', { query: '?url', import: 'default', eager: true });
const URL_POR_ARQUIVO = Object.fromEntries(Object.entries(urls).map(([k, v]) => [k.split('/').pop(), v]));

export const CLIPS = Object.fromEntries(FICHAS.map((f) => [f.id, f]));

/** Termos usados na aula para os rótulos originais do acervo. */
export const TERMO = {
  Normal: 'murmúrio vesicular (sem ruído adventício)',
  Wheeze: 'sibilos',
  Rhonchi: 'roncos',
  'Fine Crackle': 'estertores finos',
  'Coarse Crackle': 'estertores grossos',
  Stridor: 'estridor',
  'Wheeze+Crackle': 'sibilos e estertores',
};
export const TIPO = {
  Normal: 'normal', Wheeze: 'continuo', Rhonchi: 'continuo', Stridor: 'continuo',
  'Fine Crackle': 'descontinuo', 'Coarse Crackle': 'descontinuo',
};

const cache = new Map();

/** Lê um WAV PCM 16 bits (mono) e devolve { data: Float32Array, sr }. */
export function parseWav(ab) {
  const v = new DataView(ab);
  const tag = (o) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('Arquivo WAV inválido');
  let o = 12, sr = 8000, ch = 1, bits = 16, dataOff = 0, dataLen = 0;
  while (o + 8 <= v.byteLength) {
    const id = tag(o), len = v.getUint32(o + 4, true);
    if (id === 'fmt ') { ch = v.getUint16(o + 10, true); sr = v.getUint32(o + 12, true); bits = v.getUint16(o + 22, true); }
    if (id === 'data') { dataOff = o + 8; dataLen = Math.min(len, v.byteLength - dataOff); break; }
    o += 8 + len + (len % 2);
  }
  if (bits !== 16) throw new Error('Somente PCM de 16 bits');
  const n = Math.floor(dataLen / (2 * ch));
  const data = new Float32Array(n);
  for (let i = 0; i < n; i++) data[i] = v.getInt16(dataOff + i * 2 * ch, true) / 32768;
  return { data, sr };
}

/** Carrega um trecho pelo id da ficha. */
export async function loadClip(id) {
  if (cache.has(id)) return cache.get(id);
  const f = CLIPS[id];
  if (!f) throw new Error(`Trecho desconhecido: ${id}`);
  const p = fetch(URL_POR_ARQUIVO[f.arquivo]).then((r) => r.arrayBuffer()).then((ab) => ({ ...parseWav(ab), ficha: f }));
  cache.set(id, p);
  return p;
}

/** Texto curto de procedência para a interface. */
export function procedencia(f) {
  const s = f.fonte;
  return `SPRSound · trecho ${f.id} · ponto ${s.ponto} · CC BY 4.0`;
}

