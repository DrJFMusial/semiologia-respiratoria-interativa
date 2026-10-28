import url from '../assets/audio-lab/sibilo-professor.mp3?url';
import { SR } from './synth.js';
import { selectWheezeExcerpt } from './wheeze-excerpt.js';
let pending;
/** Decodifica o novo MP3 em 16 kHz, sem mudar sua velocidade ou altura. */
export function loadLabWheeze() {
  if (!pending) {
    pending = fetch(url).then(async response => {
      if (!response.ok) throw new Error(`Falha ao carregar os sibilos (${response.status})`);
      const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const decoder = new Offline(1, 1, SR);
      const buffer = await decoder.decodeAudioData(await response.arrayBuffer());
      const mono = new Float32Array(buffer.length);
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const samples = buffer.getChannelData(ch);
        for (let i = 0; i < mono.length; i++) mono[i] += samples[i] / buffer.numberOfChannels;
      }
      const excerpt = selectWheezeExcerpt(mono, buffer.sampleRate);
      return { ...excerpt, ficha: { origem: 'sibilo.mp3 fornecido pelo professor' } };
    }).catch(error => { pending = null; throw error; });
  }
  return pending;
}