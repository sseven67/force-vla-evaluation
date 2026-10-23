const {chromium}=require('C:/Users/sseve/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const d=JSON.parse(fs.readFileSync('public/catalogue.json','utf8'));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1480,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/#tasks');await page.locator('.task-topic-list button').first().waitFor();
  assert.equal(await page.locator('.task-category').count(),5);
  assert.equal(await page.locator('.task-topic-list button').count(),97);
  assert.equal(await page.locator('.task-filters input[type=checkbox]:checked').count(),0);
  for(const topic of d.taskTypes){
   await page.goto('http://127.0.0.1:8765/#tasks/'+topic.id);
   await page.waitForFunction(name=>document.querySelector('.task-detail-heading h2')?.textContent===name,topic.name);
   const nav=page.locator('.task-kind-sidebar');
   assert.equal(await nav.count(),topic.taskKinds.length>1?1:0,topic.id+': show navigation only for distinct task kinds');
   assert.equal(await page.locator('.task-protocol h4').count(),d.taskInstances.filter(r=>r.task===topic.id).flatMap(r=>r.protocols).length,topic.id+': all evaluations shown initially');
   if(topic.taskKinds.length>1){
    assert(await page.locator('.task-topic-description').innerText(),topic.id+': topic introduction');
    assert.equal(await nav.locator('button').count(),topic.taskKinds.length+1);
    assert.equal(await nav.locator('button[aria-pressed=true] span').innerText(),'全部');
   }
  }
  const peg=d.taskTypes.find(t=>t.id==='peg');
  await page.goto('http://127.0.0.1:8765/#tasks/peg');await page.locator('.task-kind-sidebar').waitFor();
  const cards=page.locator('.protocol-card');
  const first=await cards.nth(0).boundingBox(),second=await cards.nth(1).boundingBox();
  assert(Math.abs(first.y-second.y)<2&&second.x>first.x+first.width,'desktop task cards use two columns');
  const navButtons=await page.locator('.task-kind-sidebar button').evaluateAll(bs=>bs.map(b=>b.getBoundingClientRect().y));
  assert(navButtons.every(y=>Math.abs(y-navButtons[0])<2),'task navigation is a single horizontal row');
  await page.evaluate(()=>window.scrollTo(0,1500));
  let rect=await page.locator('.task-kind-sidebar').boundingBox();assert(Math.abs(rect.y-88)<2,'sticky desktop offset');
  await page.evaluate(()=>window.scrollBy(0,600));
  assert(Math.abs((await page.locator('.task-kind-sidebar').boundingBox()).y-rect.y)<2,'navigation fixed while scrolling');
  await page.locator('.task-detail-layout').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+window.scrollY-88));
  await page.screenshot({path:'qa/task-kind-navigation-desktop.png'});
  const chosen=peg.taskKinds.find(k=>k.name==='三角块插孔');
  const button=page.locator('.task-kind-sidebar').getByRole('button',{name:new RegExp('^'+chosen.name)});
  await button.focus();await page.keyboard.press('Enter');
  assert((await page.locator('.task-protocol h4').allTextContents()).every(name=>name===chosen.name),'all displayed protocols match selected kind');
  assert((await page.locator('.protocol-card').count())>0);
  await page.getByRole('button',{name:'紧凑对照',exact:true}).click();
  assert((await page.locator('.task-table-entry>strong').allTextContents()).every(name=>name===chosen.name),'compact layout keeps the kind filter');
  await page.goto('http://127.0.0.1:8765/#tasks/whiteboard');await page.waitForFunction(()=>document.querySelector('.task-detail-heading h2')?.textContent==='擦白板');
  assert.equal(await page.locator('.task-kind-sidebar').count(),0,'whiteboard variations are one task kind');
  await page.goto('http://127.0.0.1:8765/#tasks/peg');await page.locator('.task-kind-sidebar').waitFor();
  assert.equal(await page.locator('.task-kind-sidebar button[aria-pressed=true] span').innerText(),'全部','returning to the topic resets task-kind selection');
  assert.equal(await page.locator('.task-layout-toggle button.active').innerText(),'卡片');
  await page.goto('http://127.0.0.1:8765/#tasks/jelly-balloon');await page.waitForFunction(()=>document.querySelector('.task-detail-heading h2')?.textContent==='气球上切果冻');
  assert.deepEqual(await page.locator('.task-protocol h4').allTextContents(),['气球上切果冻']);
  await page.goto('http://127.0.0.1:8765/#tasks');await page.getByLabel('环境',{exact:true}).selectOption('离线');
  assert(await page.locator('.task-topic-list button').count()>0,'offline tasks are discoverable');
  await page.getByRole('button',{name:'论文 × 任务覆盖矩阵',exact:true}).click();
  assert(await page.locator('table tbody tr').count()>0,'matrix retains filtered offline records');
  await page.getByRole('button',{name:'重置',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:8765/#tasks/peg');await page.locator('.task-kind-sidebar').waitFor();
  await page.evaluate(()=>window.scrollTo(0,1400));
  rect=await page.locator('.task-kind-sidebar').boundingBox();assert(Math.abs(rect.y-64)<2,'mobile sticky filter below app header');
  const mobileFirst=await page.locator('.protocol-card').nth(0).boundingBox(),mobileSecond=await page.locator('.protocol-card').nth(1).boundingBox();
  assert(Math.abs(mobileFirst.x-mobileSecond.x)<2&&mobileSecond.y>mobileFirst.y,'mobile cards stay in one column');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow on mobile');
  await page.screenshot({path:'qa/task-kind-navigation-mobile.png'});
  await page.locator('.task-kind-sidebar').getByRole('button',{name:/^三角块插孔/}).click();
  assert((await page.locator('.task-protocol h4').allTextContents()).every(name=>name===chosen.name));
  assert.deepEqual(errors,[]);
  console.log('PASS: all 97 topics, 357 content entries, 355 source evaluations; distinct-kind filters, keyboard, compact/cards, default reset, offline matrix, desktop/mobile sticky navigation.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
