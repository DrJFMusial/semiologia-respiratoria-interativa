import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=process.argv[2];
if(!manifest)throw Error('Informe o manifesto original preservado localmente para conferir os hashes de origem.');
const fichas=JSON.parse(fs.readFileSync(manifest,'utf8').replace(/^\uFEFF/,''));
const report=[];
for(const f of fichas){
 const url=`https://raw.githubusercontent.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound/main/${f.fonte.conjunto}/${f.fonte.registro_original}.wav`;
 const r=await fetch(url);if(!r.ok)throw Error(`${r.status} ${url}`);
 const original=Buffer.from(await r.arrayBuffer());
 const sha=crypto.createHash('sha256').update(original).digest('hex');
 const local=fs.readFileSync('src/assets/audio/'+f.arquivo);
 const chunks=[];for(let o=12;o+8<=local.length;){const n=local.readUInt32LE(o+4);chunks.push(local.toString('ascii',o,o+4));o+=8+n+(n%2);}
 report.push({id:f.id,source:url,sha256:sha,matches:sha===f.fonte.sha256_original,localSha256:crypto.createHash('sha256').update(local).digest('hex'),chunks,license:f.licenca});
}
fs.writeFileSync('evidencias/audio-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report.map(({id,matches,chunks})=>({id,matches,chunks}))));
if(report.some(x=>!x.matches))process.exit(1);

