import url from '../assets/audio-lab/estridor-professor.mp3?url';
import { getContext } from './audio.js';
let pending;
/** Arquivo integral indicado pelo professor, sem normalização, corte ou mudança de velocidade. */
export function loadStridor() {
  if (!pending) {
    const context = getContext();
    pending = fetch(url).then(async response => {
      if (!response.ok) throw new Error('Falha ao carregar o arquivo de estridor');
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      const data = new Float32Array(buffer.length);
      for (let ch=0; ch<buffer.numberOfChannels; ch++) {
        const samples=buffer.getChannelData(ch);
        for(let i=0;i<data.length;i++) data[i]+=samples[i]/buffer.numberOfChannels;
      }
      if (!data.length) throw new Error('Arquivo de estridor vazio');
      return { data, sr: buffer.sampleRate };
    }).catch(error=>{pending=null;throw error;});
  }
  return pending;
}
