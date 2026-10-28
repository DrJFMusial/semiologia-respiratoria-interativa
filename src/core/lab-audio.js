import url from '../assets/audio-lab/sibilos-autor.wav?url';
import ficha from '../assets/audio-lab/sibilos-autor.json';
import { parseWav } from './clips.js';

let pending;
/** O WAV já contém o trecho do autor preparado sem mudança de velocidade. */
export function loadLabWheeze() {
  if (!pending) {
    pending = fetch(url).then(async response => {
      if (!response.ok) throw new Error(`Falha ao carregar os sibilos (${response.status})`);
      const audio = parseWav(await response.arrayBuffer());
      if (!audio.data.length || audio.sr !== ficha.amostragem_hz) throw new Error('Trecho de sibilos inválido');
      return { ...audio, ficha };
    }).catch(error => { pending = null; throw error; });
  }
  return pending;
}
