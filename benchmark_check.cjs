const {chromium}=require('C:/Users/sseve/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.ATLAS_BASE_URL||'http://127.0.0.1:8765';
(async()=>{
 const d=JSON.parse(fs.readFileSync('public/catalogue.json','utf8'));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
  const page=await browser.newPage({viewport:{width:1480,height:1000}});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#benchmarks');
  await page.getByLabel('资源类型',{exact:true}).waitFor();
  assert.equal(await page.getByLabel('资源类型',{exact:true}).inputValue(),'benchmark');
  assert.equal(await page.getByLabel('评测资源排序',{exact:true}).inputValue(),'usage');
  assert.equal(await page.locator('.benchmark-card h2').first().innerText(),'UniVTAC Benchmark');
  const benchmarkCount=d.benchmarks.filter(b=>b.resourceType==='benchmark').length;
  assert.equal(await page.locator('.benchmark-card').count(),benchmarkCount,'Do not count partially checked suites or simulators as confirmed benchmarks');
  assert.equal(await page.locator('.benchmark-card .benchmark-proposer a').count(),benchmarkCount,'Original paper is visible on each card');
  await page.locator('.benchmark-criteria summary').click();
  await page.screenshot({path:'qa/benchmark-audit-desktop.png'});
  for(const type of ['platform']){
   await page.getByLabel('资源类型',{exact:true}).selectOption(type);
   assert.equal(await page.locator('.benchmark-card').count(),d.benchmarks.filter(b=>b.resourceType===type).length,type);
  }
  for(const b of d.benchmarks){
   await page.goto(base+'/#benchmarks/'+b.id);
   await page.locator('.benchmark-origin').waitFor();
   assert.equal(await page.locator('.benchmark-origin>a').getAttribute('href'),b.introducedBy.source,b.id+': proposer source, not an adopter');
   assert.equal(await page.locator('.benchmark-origin>a').innerText(),b.introducedBy.title+' ↗',b.id);
   assert.equal(await page.locator('.benchmark-assessment dd').count(),4,b.id);
   assert.equal(await page.locator('.benchmark-origin .resource-metrics dd').count(),3,b.id+': Scholar, Stars and public date');
   assert.equal(await page.getByRole('navigation',{name:'评测资源章节'}).getByRole('button').count(),5,b.id+': fixed chapter navigation');
  }
  await page.goto(base+'/#benchmarks');
  await page.getByLabel('资源类型',{exact:true}).waitFor();
  assert.equal(await page.getByLabel('资源类型',{exact:true}).locator('option').count(),3);
  await page.goto(base+'/#benchmarks/robotwin');
  assert.ok((await page.locator('.resource-user-list').innerText()).includes('ME-Dex 1.0'));
  await page.goto(base+'/#benchmarks/libero');
  await page.locator('.resource-user-list').waitFor();
  assert.ok((await page.locator('.resource-user-list').innerText()).includes('Visible Touch'));
  assert.ok((await page.locator('.resource-user-list').innerText()).includes('Tabero'));
  await page.getByRole('navigation',{name:'评测资源章节'}).getByRole('button',{name:'使用工作',exact:true}).click();
  assert.ok(await page.locator('#benchmark-section-2').evaluate(el => el.getBoundingClientRect().top >= document.querySelector('.benchmark-nav').getBoundingClientRect().bottom - 2),'Jump target must not sit under fixed navigation');
  for(const card of await page.locator('.resource-user-list article').all()) {
   assert.equal(await card.evaluate(el => getComputedStyle(el).display),'block','Usage cards must not inherit old horizontal relation grids');
   assert.ok(await card.locator('.resource-metrics').evaluate(el => el.getBoundingClientRect().width > 350),'Metrics have usable width');
   assert.ok(await card.locator('.resource-usage>div').count() >= 3,'Usage is broken into readable facts');
   assert.ok(await card.locator('time').evaluate(el => el.getBoundingClientRect().height < 30),'Public date stays on one line');
  }
  await page.screenshot({path:'qa/resource-libero-usage-desktop.png'});
  await page.getByRole('navigation',{name:'评测资源章节'}).getByRole('button',{name:'研究记录',exact:true}).click();
  assert.equal(await page.locator('#benchmark-section-4').evaluate(el=>el===document.activeElement),true,'Navigation moves keyboard focus');
  await page.goto(base+'/#benchmarks');
  await page.getByLabel('资源类型',{exact:true}).selectOption('');
  assert.equal(await page.locator('.benchmark-card h2').nth(0).innerText(),'UniVTAC Benchmark');
  assert.equal(await page.locator('.benchmark-card h2').nth(1).innerText(),'LIBERO（上游资源）');
  await page.getByLabel('评测资源排序',{exact:true}).selectOption('stars');
  const maxStars = Math.max(...d.benchmarks.map(b=>b.metadata.stars??-1));
  assert.equal(await page.locator('.benchmark-card h2').first().innerText(),d.benchmarks.filter(b=>b.metadata.stars===maxStars).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))[0].name);
  await page.getByLabel('评测资源排序',{exact:true}).selectOption('usage');
  await page.screenshot({path:'qa/resource-usage-sort-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/#benchmarks/libero');
  await page.reload();
  await page.getByRole('navigation',{name:'评测资源章节'}).getByRole('button',{name:'使用工作',exact:true}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.ok(await page.locator('.resource-user-list .resource-metrics').first().evaluate(el=>el.getBoundingClientRect().width>280));
  await page.screenshot({path:'qa/resource-libero-usage-mobile.png'});
  await page.goto(base+'/#benchmarks/maniskill-vitac-2025');
  await page.reload();
  await page.locator('.benchmark-origin .resource-metrics').waitFor();
  assert.ok((await page.locator('.resource-user-list .resource-metrics').innerText()).includes('未找到条目'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa/resource-tactildm-mobile.png'});
  await page.setViewportSize({width:1480,height:1000});
  await page.goto(base+'/#benchmarks/tactidex');
  assert.ok((await page.locator('.benchmark-assessment').innerText()).includes('不根据新反馈调整动作'));
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa/benchmark-audit-detail-mobile.png',fullPage:true});
  await page.goto(base+'/#benchmarks');
  await page.getByLabel('资源类型',{exact:true}).selectOption('benchmark');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa/benchmark-audit-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${d.benchmarks.length} resource pages; ${benchmarkCount} benchmarks distinct from suites/platforms; original papers, metadata, disclosure and mobile layout.`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
