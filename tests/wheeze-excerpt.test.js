import test from 'node:test';
import assert from 'node:assert/strict';
import { selectWheezeExcerpt } from '../src/core/wheeze-excerpt.js';
import { renderLab } from '../src/core/synth.js';
test('seleciona janela contínua de energia, sem alterar velocidade, e aplica rampas',()=>{
 const sr=16000, signal=new Float32Array(sr*5);
 for(let i=sr*2;i<sr*3.4;i++)signal[i]=Math.sin(2*Math.PI*510*i/sr)*.5;
 const r=selectWheezeExcerpt(signal,sr);
 assert.equal(r.data.length,22400);assert(Math.abs(r.start-2)<1/sr);assert.equal(r.end-r.start,1.4);
 assert.equal(Math.abs(r.data[0]),0);assert.equal(Math.abs(r.data.at(-1)),0);
 for(let i=160;i<r.data.length-160;i++)assert.equal(r.data[i],signal[Math.round(r.start*sr)+i]);
 const lab=renderLab('base','sibilos',{wheeze:r});assert.equal(lab.eventos.length,1);
 assert(lab.eventos[0].inicio>=lab.tab.ti);assert(lab.eventos[0].fim<=lab.tab.fimExp);
});
test('áudio curto não é esticado e dados vazios são rejeitados',()=>{
 const r=selectWheezeExcerpt(new Float32Array(8000).fill(.2),16000);
 assert.equal(r.data.length,8000);assert.equal(r.end,.5);
 assert.throws(()=>selectWheezeExcerpt(new Float32Array(),16000),/inválido/);
});