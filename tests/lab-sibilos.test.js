import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderLab, SR } from '../src/core/synth.js';
const bytes=fs.readFileSync(new URL('../src/assets/audio-lab/sibilos-autor.wav',import.meta.url));
const sr=bytes.readUInt32LE(24), data=new Float32Array((bytes.length-44)/2);
for(let i=0;i<data.length;i++)data[i]=bytes.readInt16LE(44+i*2)/32768;
const wheeze={data,sr};
test('trecho próprio mantém 1,4 s, mono PCM e a amostragem do laboratório',()=>{assert.equal(bytes.readUInt16LE(22),1);assert.equal(bytes.readUInt16LE(34),16);assert.equal(sr,SR);assert.equal(data.length/sr,1.4);assert(data.some(v=>Math.abs(v)>.1));});
for(const point of ['base','traqueia'])test(`sibilos do autor substituem o tom e ficam dentro da expiração: ${point}`,()=>{const r=renderLab(point,'sibilos',{wheeze}),silent=renderLab(point,'sibilos',{wheeze:{data:new Float32Array(0),sr}}),old=renderLab(point,'sibilos');assert.equal(r.data.length,SR*5);assert.equal(r.eventos.length,1);const ev=r.eventos[0];assert(ev.inicio>r.tab.ti);assert(ev.fim<=r.tab.fimExp);assert(Math.abs(ev.fim-ev.inicio-1.4)<1/SR);assert.equal(silent.eventos.length,0);assert(r.data.some((v,i)=>Math.abs(v-old.data[i])>.05));assert(r.data.every(Number.isFinite));assert(Math.max(...r.data.map(Math.abs))<=.851);const start=Math.round(ev.inicio*SR);let reference=0;for(let i=1;i<start;i++)if(Math.abs(silent.data[i])>Math.abs(silent.data[reference]))reference=i;const gain=r.data[reference]/silent.data[reference];let xy=0,xx=0,yy=0;for(let i=0;i<data.length;i++){const v=r.data[start+i]-silent.data[start+i]*gain;xy+=v*data[i];xx+=v*v;yy+=data[i]*data[i];}assert(xy/Math.sqrt(xx*yy)>.99,'o trecho é reconhecível no sinal final, sem mudança de velocidade');});
test('amostragem incompatível é rejeitada em vez de alterar a altura do áudio',()=>assert.throws(()=>renderLab('base','sibilos',{wheeze:{data,sr:8000}}),/amostragem/));

