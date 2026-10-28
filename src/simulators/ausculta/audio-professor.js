import { loadStridor } from '../../core/estridor-audio.js';
import { toBuffer, playBuffer } from '../../core/audio.js';
import { button } from '../../core/ui.js';
export function audioProfessor(node) {
  node.classList.add('audio-professor');
  node.innerHTML='<p><b>Estridor — arquivo selecionado pelo professor</b></p><p>Reprodução integral em velocidade original. A fase respiratória não foi anotada neste arquivo.</p>';
  const b=button({label:'Ouvir estridor — arquivo do professor',text:'Ouvir estridor',cls:'chip'});
  const status=document.createElement('p');status.setAttribute('role','status');node.append(b,status);
  let player=null,revision=0;
  const idle=()=>{player=null;b.setAttribute('aria-pressed','false');b.querySelector('span').textContent='Ouvir estridor';};
  const stop=()=>{revision++;player?.stop();idle();};
  b.addEventListener('click',async()=>{
    if(player){stop();return;}
    const token=++revision;b.disabled=true;status.textContent='Carregando estridor…';
    try{const r=await loadStridor();if(token!==revision)return;
      player=playBuffer(toBuffer(r.data,r.sr),{onStop:idle,onEnd:idle});
      b.setAttribute('aria-pressed','true');b.querySelector('span').textContent='Parar estridor';
      status.textContent='Arquivo do professor · '+(r.data.length/r.sr).toFixed(1)+' s';
    }catch{status.textContent='Não foi possível carregar o estridor. Tente novamente.';}finally{b.disabled=false;}
  });
  return {deactivate:stop,pause:stop};
}
