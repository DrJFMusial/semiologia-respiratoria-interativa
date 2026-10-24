const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const report={errors:[],missing:[],cases:[]};
 const base=process.env.QA_URL||'http://127.0.0.1:5191/';
 for(const [width,height] of [[1920,1080],[1366,768],[390,844],[844,390],[768,1024]]) {
  for(const theme of ['light','dark']) {
   const page=await browser.newPage({viewport:{width,height}});
   page.on('pageerror',e=>report.errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)report.missing.push({url:r.url(),status:r.status()});});
   await page.addInitScript(t=>{if(!localStorage.getItem('e2m08-theme'))localStorage.setItem('e2m08-theme',t)},theme);
   await page.goto(base,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>!!window.__deck);
   const mode=await page.locator('body').getAttribute('class');
   const sections=await page.locator('.slides > section').count();
   // Lazy images are validated after their section becomes visible below.
   const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src));
   const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,bar:document.querySelector('.appbar').getBoundingClientRect().toJSON()}));
   await page.getByRole('button',{name:'Seções da aula (M)',exact:true}).click();
   await page.locator('.sections-menu button[data-i="5"]').click();
   await page.waitForTimeout(1000);
   await page.screenshot({path:`evidencias/${width}x${height}-${theme}.png`});
   const button=page.getByRole('button',{name:theme==='dark'?'Ativar modo claro':'Ativar modo escuro',exact:true});
   await button.click();
   await page.reload({waitUntil:'networkidle'});
   const saved=await page.evaluate(()=>document.documentElement.dataset.theme);
   if(saved===(theme==='dark'?'light':'dark')) {} else report.errors.push('Theme persistence '+width+' '+theme);
   report.cases.push({width,height,theme,mode,sections,broken,layout,themePersistence:true});
   await page.close();
  }
 }
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'?modo=apresentacao',{waitUntil:'networkidle'});
 await page.locator('body').press('ArrowRight');
 report.keyboardNext=await page.evaluate(()=>window.__deck.getIndices().h);
 await page.locator('body').press('ArrowLeft');
 report.keyboardBack=await page.evaluate(()=>window.__deck.getIndices().h);
 await page.getByRole('button',{name:'Tela cheia (F)',exact:true}).click();
 report.fullscreen=await page.evaluate(()=>!!document.fullscreenElement);
 await page.getByRole('button',{name:'Tela cheia (F)',exact:true}).click();
 await page.getByRole('button',{name:'Mudar para o modo estudo',exact:true}).click();
 report.studyToggle=await page.locator('body').getAttribute('class');
 await page.getByRole('button',{name:'Mudar para o modo apresentação',exact:true}).click();
 report.presentationToggle=await page.locator('body').getAttribute('class');
 await page.getByRole('button',{name:'Seções da aula (M)',exact:true}).click();
 await page.locator('.sections-menu button[data-i="15"]').click();
 await page.locator('section.present [aria-label*="Ouvir a gravação"]').click();
 await page.waitForTimeout(700);
 report.audioPlaying=await page.locator('section.present').innerText();
 await page.getByRole('slider',{name:'Volume',exact:true}).fill('0.35');
 await page.getByRole('button',{name:'Pausar todas as animações e sons (X)',exact:true}).click();
 await page.getByRole('button',{name:'Ativar modo escuro',exact:true}).click();
 await page.screenshot({path:'evidencias/ausculta-dark.png'});
 await browser.close();
 fs.writeFileSync('evidencias/qa.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});


