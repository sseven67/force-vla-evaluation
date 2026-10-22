import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createCatalogue, benchmarkAdoptionCount } from './src/data/catalogue.js';
import { parseHash } from './src/hooks/useHashRoute.js';
const d=JSON.parse(fs.readFileSync('public/catalogue.json','utf8'));
// New papers keep source-specific scoring, force semantics and priority rules.
const recentIds=['N01','N02','N03','N04','N05'];
for(const id of recentIds)assert.ok(d.works.some(w=>w.id===id),id+': recent candidate registered');
const fm=d.works.find(w=>w.id==='N01');
assert.deepEqual(fm.bimanualEvaluation.taskIds,['N01-e01']);
assert.equal(fm.screening.grade,'A','Wrist force mainline does not require popularity thresholds');
for(const id of recentIds.slice(1))assert.equal(d.works.find(w=>w.id===id).screening.grade,'B','Original popularity rules remain unchanged');
const retouch=d.works.find(w=>w.id==='N05');
assert.ok(retouch.experiments.find(e=>e.id==='N05-e02').method.includes('15 cm'));
assert.ok(retouch.experiments.find(e=>e.id==='N05-e04').method.includes('黑色痕迹'));
assert.ok(!retouch.experiments.find(e=>e.id==='N05-e04').method.includes('三分之一'));
assert.ok(retouch.domains.includes('离线'));
assert.ok(retouch.experiments.every(e=>e.forceEvaluation.status==='not_reported'),'Offline force reconstruction does not evaluate autonomous execution');
assert.equal(d.works.find(w=>w.id==='N02').experiments.length,9,'Keep nine real test conditions distinct from encoder diagnostics');
const allExperiments=w=>[...w.experiments,...w.comparisonMethods.flatMap(c=>c.checks||[])];
const sectionMoves=JSON.parse(fs.readFileSync('research/evaluation_sections.json','utf8').replace(/^\uFEFF/,''));
for(const [id, rule] of Object.entries(sectionMoves)){
 const work=d.works.find(w=>allExperiments(w).some(e=>e.id===id));
 assert.ok(work,id+': moved record retained');
 assert.ok(!work.experiments.some(e=>e.id===id),id+': comparison must not appear in the task list');
 const card=work.comparisonMethods.find(c=>c.id===rule.comparison);
 assert.equal(card?.checks.filter(e=>e.id===id).length,1,id+': exactly one comparison destination');
 assert.ok(!d.taskInstances.some(i=>i.protocols.some(e=>e.id===id)),id+': exclude comparison checks from task cross-comparisons');
 const check=card.checks.find(e=>e.id===id);
 for(const key of ['purpose','metric','setting','method','source','locator','evaluationModes'])assert.ok(check[key],id+': preserve '+key);
}
for(const w of d.works)assert.equal(new Set(allExperiments(w).map(e=>e.id)).size,allExperiments(w).length,w.id+': records displayed once');
for(const w of d.works){
 const modes=new Set(allExperiments(w).flatMap(e=>e.evaluationModes));
 assert.deepEqual([...w.domains].sort(),[...modes].sort(),w.id+': work modes must match evaluated tasks');
 for(const e of w.experiments){
  assert.ok(e.evaluationModes.length&&e.evaluationModes.every(m=>['真机','仿真','离线'].includes(m)),e.id);
  assert.ok(e.evaluationModeSource.source&&e.evaluationModeSource.locator,e.id+': mode source');
 }
}
for(const id of ['W06','E02','E11','C16'])assert.ok(d.works.find(w=>w.id===id).domains.includes('离线'),id+': offline prediction must be discoverable');
assert.deepEqual(allExperiments(d.works.find(w=>w.id==='W06')).find(e=>e.id==='W06-e06').evaluationModes,['离线']);
assert.deepEqual(d.works.find(w=>w.id==='W06').experiments.find(e=>e.id==='W06-e01').evaluationModes,['真机']);
const catalogue=createCatalogue(d);
for(const w of d.works){
 assert.deepEqual(catalogue.getWorkInstances(w.id),d.taskInstances.filter(i=>i.work===w.id));
 for(const task of d.taskTypes)assert.equal(catalogue.hasTask(w.id,task.id),d.taskInstances.some(i=>i.work===w.id&&i.task===task.id));
 for(const protocol of w.experiments){
  const topics=d.taskInstances.filter(i=>i.protocols.some(e=>e.id===protocol.id)).map(i=>i.task);
  const expected=d.works.flatMap(other=>{
   const protocols=other.experiments.filter(e=>(e.originalTask||e.task)===(protocol.originalTask||protocol.task)||d.taskInstances.some(i=>i.work===other.id&&topics.includes(i.task)&&i.protocols.some(p=>p.id===e.id)));
   return protocols.length?[{id:other.id+'-protocol-'+protocol.id,work:other.id,protocols}]:[];
  });
  assert.deepEqual(catalogue.getRelatedProtocols(protocol.id),expected,protocol.id+': indexed task comparison preserves original matches');
 }
}
for(const task of d.taskTypes)assert.deepEqual(catalogue.getTaskInstances(task.id),d.taskInstances.filter(i=>i.task===task.id));
for(const benchmark of d.benchmarks)assert.deepEqual(catalogue.getBenchmarkUsers(benchmark.id),d.works.flatMap(w=>w.relations.filter(r=>r.benchmark===benchmark.id).map(r=>({w,r}))));
assert.deepEqual(catalogue.getWorkInstances('missing'),[]);
assert.deepEqual(catalogue.getRelatedProtocols('missing'),[]);
assert.deepEqual(parseHash('#work=W01'),{view:'works',paper:'W01'});
assert.deepEqual(parseHash('#paper/W01'),{view:'works',paper:'W01'});
assert.deepEqual(parseHash('#tasks/protocol-W01-1'),{view:'tasks',item:'protocol-W01-1'});
assert.deepEqual(parseHash('#paper/%E0%A4%A'),{view:'works'});
assert.equal(parseHash('#toString').view,'works');
assert.ok(d.works.length>=75);
const ids=new Set(d.works.map(w=>w.id));assert.equal(ids.size,d.works.length);
const categories=new Set(d.groups.map(g=>g.id));
assert.equal(categories.size,4,'Exactly four paper categories');
for(const w of d.works){
 assert.equal('family' in w,false,'Remove legacy exclusive classification');
 assert.ok(w.categories.every(id=>categories.has(id)),w.id+': unknown category');
 assert.equal(w.categories.length===0,w.resourceOnly,w.id+': resources stay outside paper categories');
 assert.equal(w.categories.length,new Set(w.categories).size,w.id+': duplicate membership');
}
assert.deepEqual(d.works.find(w=>w.id==='E05').categories,['dexterous'],'Finger 6D force is not wrist 6D');
assert.deepEqual(d.works.find(w=>w.id==='W11').categories,['gripper-touch'],'Two 3D fingertip forces are not wrist 6D');
assert.deepEqual(d.works.find(w=>w.id==='R01').categories,['gripper-wrench','gripper-touch']);
assert.deepEqual(d.works.find(w=>w.id==='C16').categories,['gripper-wrench','other']);
assert.ok(d.works.find(w=>w.id==='W14').classificationNote.includes('部署时不读取'));
assert.ok(d.works.find(w=>w.id==='T07').resourceOnly);
const benches=new Set(d.benchmarks.map(b=>b.id)), tasks=new Set(d.taskTypes.map(t=>t.id));
assert.ok(d.works.find(w=>w.id==='W03').experiments[1].method.includes('啮合'),'FAVLA gear completion must include engagement');
assert.ok(d.works.find(w=>w.id==='W05').experiments[3].setting.includes('75 N'),'Force stop threshold belongs to settings');
assert.ok(d.works.find(w=>w.id==='T01').experiments[1].task.includes('盘子'),'Correct wiping object');
assert.ok(d.works.find(w=>w.id==='T04').experiments[4].task.includes('粗糙度分类'),'Correct real task identity');
for(const w of d.works){
 for(const k of ['tasks','purpose','metrics','trials','baseline','openness','source','kind','sensorOrigin','actionOutput','actionMode'])assert.ok(w[k],w.id+': '+k);
 assert.ok(w.notes.length>20,w.id+': notes');
 assert.ok(w.experiments.length>0,w.id+': no task protocols');
 for(const e of w.experiments)for(const k of ['id','task','purpose','metric','setting','method','source','locator'])assert.ok(e[k],w.id+': missing task '+k);
 assert.equal(new Set(w.experiments.map(e=>e.id)).size,w.experiments.length);
 for(const r of w.relations)assert.ok(benches.has(r.benchmark) || r.resourceName,w.id+': named paper evaluation source '+r.benchmark);
 for(const k of ['citations','stars','forks']){const v=w.attention[k];assert.ok(v===null||Number.isInteger(v)&&v>=0,w.id+': invalid '+k);}
 if(w.attention.citations!==null)assert.ok(w.attention.citationSource,w.id+': citation provenance');
 if(w.attention.stars!==null)assert.ok(w.attention.githubSource,w.id+': GitHub provenance');
 assert.ok(w.attention.googleScholar == null || (Number.isInteger(w.attention.googleScholar) && w.attention.googleScholar >= 0), 'Valid separate Google Scholar count');
 assert.ok(w.attention.googleScholarSource?.startsWith('https://scholar.google.com/'), 'Google Scholar source link');
 if(w.attention.googleScholar != null) assert.ok(w.attention.googleScholarDate && w.attention.googleScholarStatus === 'verified', 'Google Scholar count requires dated verification');
 assert.ok(w.evaluationReview?.checkedSource&&w.evaluationReview?.summary,w.id+': source review missing');
 assert.ok(Array.isArray(w.evaluationHighlights),w.id+': explicit design selection missing');
 assert.equal(w.evaluationHighlights.length>0,w.evaluationDesignReview.status==='selected',w.id+': selected tag requires a specific design');
 assert.ok(w.evaluationDesignReview.reason&&w.evaluationDesignReview.source&&w.evaluationDesignReview.checked);
 for(const h of w.evaluationHighlights){assert.ok(h.design&&h.why&&h.boundary&&h.source&&h.locator);assert.ok(h.taskIds.every(id=>allExperiments(w).some(e=>e.id===id)),w.id+': selected design must refer to actual task protocols');}
 for(const e of w.experiments){assert.ok(['verified','not_reported','pending'].includes(e.review?.status),e.id+': review status');assert.ok(e.review.note&&e.review.source&&e.review.locator);assert.ok(![e.metric,e.setting,e.method].join(' ').includes('角度容差'));assert.equal('conditions' in e,false);
  const f=e.forceEvaluation;assert.ok(['reported','not_reported','pending'].includes(f?.status),e.id+': force-specific review missing');assert.ok(f.source&&f.locator&&f.note&&f.checked);assert.equal(f.metrics.length>0,f.status==='reported',e.id+': a reported force evaluation must name actual metrics');
 }
 assert.ok(!JSON.stringify(w).includes('\ufffd'),w.id+': corrupted Unicode');
}
for(const i of d.taskInstances){assert.ok(ids.has(i.work));assert.ok(tasks.has(i.task));assert.ok(i.method&&i.locator&&i.source);assert.ok(i.protocols.length>0);for(const e of i.protocols)assert.ok(d.works.find(w=>w.id===i.work).experiments.some(p=>p.id===e.id));}
const uni=d.works.filter(w=>w.relations.some(r=>r.benchmark==='univtac'&&r.type==='adopts'));
assert.equal(uni.length,3);
assert.equal(uni.find(w=>w.id==='E03').relations.find(r=>r.benchmark==='univtac').label,'采用其中6项任务');
assert.equal(uni.find(w=>w.id==='E04').relations.find(r=>r.benchmark==='univtac').label,'采用8个任务');
assert.ok(!d.works.find(w=>w.id==='W01').relations.some(r=>r.benchmark==='forcebench'));
assert.ok(d.extraRelations.some(r=>r.fromWork==='W01'&&r.toBenchmark==='forcebench'&&r.type==='later'));
assert.equal(d.works.find(w=>w.id==='C08').attention.stars,null);
for(const doc of d.documents)assert.ok(fs.existsSync('public/'+doc.url));
assert.ok(fs.readFileSync('src/main.jsx','utf8').includes('createRoot'));
assert.ok(d.works.every(w=>w.screening&&['A','B','C','H'].includes(w.screening.grade)));
assert.equal(d.works.find(w=>w.id==='W01').screening.grade,'A');
assert.equal(d.works.find(w=>w.id==='W02').screening.grade,'A');
assert.equal(d.works.find(w=>w.id==='P04').screening.grade,'A');
assert.equal(d.works.find(w=>w.id==='C01').screening.inWindow,true,'ForceMimic qualifies by ICRA2025 publication');
assert.equal(d.works.find(w=>w.id==='C13').screening.grade,'H','Older DIGIT hardware must not dominate current priorities');
assert.equal(d.works.find(w=>w.id==='R01').screening.grade,'A');
for(const w of d.works){
 if(w.resourceOnly){assert.notEqual(w.screening.grade,'A');continue;}
 if(w.categories.includes('gripper-wrench'))assert.equal(w.screening.grade,'A',w.id+': no attention threshold for mainline');
 else if(w.screening.grade==='A')assert.ok((w.attention.stars!==null&&w.attention.stars>=30)||(w.attention.citations!==null&&w.attention.citations>=5),w.id+': other direction threshold');
 if(w.screening.grade==='A')assert.ok(w.screening.originalAvailable&&w.screening.relatedEvaluation);
}
assert.equal(d.works.find(w=>w.id==='C16').screening.grade,'A','Historical mainline still qualifies; year filter is separate');
assert.equal(d.selectionPolicy.window.start,'2024-10-16');
// Distinct scoring methods must stay distinct after presentation changes.
const experiment=id=>d.works.flatMap(allExperiments).find(e=>e.id===id);
assert.equal(experiment('W01-e04').metric.split('；').length,2);
assert.ok(experiment('W16-e01').metric.includes('擦除字母比例'));
assert.ok(!experiment('W16-e01').metric.includes('成功率'));
assert.ok(experiment('E05-e01').method.includes('0.3、挑起页0.3'));
assert.ok(experiment('R01-e01').method.includes('再除以示教平均比例'));
assert.ok(experiment('W07-e01').method.includes('只统计成功的尝试'));
assert.ok(experiment('W18-e01').method.includes('判定细则'));
assert.ok(experiment('T18-e05').method.includes('某阶段低于1分则整任务失败'));
assert.ok(!experiment('T18-e05').metric.includes('全程无干预成功率'),'Do not invent a separately tabulated intervention-free result');
for(const id of ['C01','C03','C04','T16','T17','C06','C07'])assert.equal(d.works.find(w=>w.id===id).evaluationHighlights.length,0,id+': do not automatically recommend every supplied example');
assert.equal(experiment('W03-e01').forceEvaluation.status,'not_reported');
assert.equal(experiment('W03-e02').forceEvaluation.status,'reported');
assert.equal(experiment('W06-e06').forceEvaluation.status,'not_reported','Force injection is an input ablation, not a force error metric');
assert.equal(experiment('W06-e07').forceEvaluation.kind,'offline');
assert.equal(experiment('E04-e01').forceEvaluation.status,'pending');
assert.equal(experiment('E10-e01').forceEvaluation.status,'pending','Do not spread the Task2 force curve across all views');
assert.equal(experiment('E10-e02').forceEvaluation.kind,'case');
assert.equal(experiment('T08-e02').forceEvaluation.status,'not_reported','Slip F1 is not force estimation error');
assert.equal(experiment('T15-e01').forceEvaluation.status,'not_reported','Strain is not measured force');
assert.equal(experiment('C18-e01').forceEvaluation.status,'not_reported','Training statistics do not evaluate autonomous deployment');
assert.equal(experiment('C20-e05').forceEvaluation.kind,'case','Keep reported force sensitivity distinct from unscored application demonstrations');
assert.equal(experiment('R01-e01').forceEvaluation.kind,'collection','Keep demonstration quality separate from policy evaluation');
assert.ok(experiment('W07-e01').forceEvaluation.metrics.join(' ').includes('多个任务合在一起算'));
assert.ok(experiment('W11-e01').forceEvaluation.metrics.join(' ').includes('机械臂'));
assert.ok(experiment('C16-e01').forceEvaluation.explanation.comparison.includes('六个任务的平均结果'));
for(const id of ['W05-e04','C16-e01','C16-e02','C16-e03','C16-e04','C16-e05','C16-e06']){
 assert.ok(!/75 N|40 N或最近/.test(experiment(id).method),id+': force stopping rules must move out of methods');
 assert.ok(!experiment(id).metric.includes('停机'),id+': a stop condition is not an outcome metric');
}
for(const w of d.works){
 assert.ok(w.researchObjective.text.length>20,w.id+': paper objective is required');
 assert.ok(w.researchObjective.source.startsWith('https://'),w.id+': objective primary source');
 assert.ok(['论文摘要','作者项目页 Abstract'].includes(w.researchObjective.locator));
 assert.equal(w.researchObjective.checked,'2026-10-17');
 assert.notEqual(w.researchObjective.text,w.purpose,w.id+': keep evaluation purpose distinct');
}
assert.ok(d.works.find(w=>w.id==='R01').researchObjective.text.includes('较慢的动作规划与快速力／触觉反馈'));
assert.ok(!d.works.find(w=>w.id==='R01').researchObjective.text.includes('接触前'));
console.log(`PASS: ${d.works.length} records, ${d.taskInstances.length} task links, distinct sourced paper objectives, task-level purposes/scoring labels/settings/methods, typed methods, attributable counters, directional provenance and documents.`);
// Force evaluation is restricted to autonomous execution outcomes.
for (const id of ['W06-e07','E08-e04','T08-e01','T19-e08','T19-e09','T19-e10','C06-e01','C07-e05','C16-e07','C18-e01','C18-e03','C20-e01','C20-e02','C20-e03','C20-e04','C20-e05','C20-e10','R01-e01']) {
  assert.equal(experiment(id).forceEvaluation.status,'not_reported',id);
  assert.ok(experiment(id).forceEvaluation.scopeNote,id);
}
assert.ok(!experiment('R01-e01').forceEvaluation.metrics.length);
for (const w of d.works) for (const e of w.experiments) {
  if(e.forceEvaluation.status==='reported') {
    assert.equal(e.forceEvaluation.evaluatesAutonomousExecution,true,e.id);
    assert.ok(e.forceEvaluation.summary,e.id+': force overview');
    assert.deepEqual(Object.keys(e.forceEvaluation.explanation).sort(),['comparison','method']);
    for(const key of ['method','comparison'])assert.ok(e.forceEvaluation.explanation[key],e.id+': force scoring '+key);
  }
}
const summaryLines=fs.readFileSync('research/work_metric_summaries.tsv','utf8').split(/\r?\n/).filter(s=>s&&!s.startsWith('#'));
const metricSummaries=new Map(summaryLines.map(s=>s.split('\t')));
assert.equal(metricSummaries.size,d.works.length,'All works need a plain metric overview');
for(const w of d.works)assert.equal(w.metrics,metricSummaries.get(w.id),w.id+': metric overview');
assert.ok(experiment('T08-e02').method.includes('漏掉')&&experiment('T08-e02').method.includes('误报'),'F1 must explain both missed cases and false alarms');
assert.ok(experiment('C17-e01').method.includes('中间值')&&experiment('C17-e01').method.includes('中间50%'),'Explain median and spread in plain words');
assert.ok(!/20 N|7\.5 N|6 N/.test(JSON.stringify(experiment('C01-e01').forceEvaluation.explanation)),'Do not repeat optional numerical results in the force explanation');
assert.ok(!experiment('W09-e01').setting.includes('未说明'),'Omit minor missing trial-count notices from reader setup');
assert.ok(experiment('E04-e01').method.includes('各步骤的具体分值尚不明确'),'Retain uncertainty about the actual scoring rule');
assert.ok(experiment('W07-e01').method.includes('具体成功判定细则尚不明确'),'Retain uncertainty about task success criteria');
assert.equal(experiment('E10-e01').forceEvaluation.label,'是否报告尚不明确','Unknown is not an assertion that the paper did not report force');
assert.equal(experiment('W03-e01').forceEvaluation.label,'原文未说明');
let comparisonCount=0;
for(const w of d.works){
 assert.ok(w.comparisonMethods.length>0,w.id+': comparison method cards required');
 for(const c of w.comparisonMethods){
  for(const key of ['question','objects','tasks','controlled','evaluation','lesson','note','locator'])assert.ok(typeof c[key]==='string'&&c[key].length>0,w.id+': '+key);
  assert.ok(c.source.startsWith('https://'),w.id+': primary source');
  assert.ok(!('results' in c),w.id+': no numerical results column');
  comparisonCount++;
 }
}
console.log(`PASS: ${d.works.length} works, ${comparisonCount} method-focused comparison cards.`);
// A source paper, public simulator, and benchmark protocol are different records.
assert.equal(new Set(d.benchmarks.map(b=>b.id)).size,d.benchmarks.length);
for(const b of d.benchmarks){
 assert.ok(['benchmark','platform'].includes(b.resourceType),b.id);
 for(const key of ['reason','protocol','release','scope','verdict','typeLabel','auditChecked'])assert.ok(b[key],b.id+': '+key);
 assert.ok(b.introducedBy.title&&b.introducedBy.source.startsWith('https://'),b.id+': original proposer');
 if(b.introducedBy.workId)assert.ok(ids.has(b.introducedBy.workId));
 assert.ok(b.evidence.length&&b.evidence.every(e=>e.url.startsWith('https://')&&e.locator),b.id+': classification evidence');
}
for(const id of ['neoreal','neosim']) assert.ok(!d.benchmarks.some(b=>b.id===id));
assert.equal(d.benchmarks.find(b=>b.id==='libero').source,'https://arxiv.org/abs/2306.03310');
for(const [id,work] of [['suite-t04','T04'],['suite-t08','T08'],['suite-c11','C11'],['suite-c12','C12']])assert.equal(d.works.find(w=>w.id===work).relations.find(r=>r.benchmark===id).type,'proposes');
for(const id of ['taco','bench2dex','tactidex','tacverse'])assert.equal(d.benchmarks.find(b=>b.id===id).resourceType,'benchmark');
assert.ok(d.benchmarks.find(b=>b.id==='tactidex').scope.includes('不根据新反馈调整动作'));
console.log(`PASS: ${d.benchmarks.length} classified resources with original source works and protocol evidence.`);

// Benchmark reading pages describe concrete tasks, scoring and force semantics.
const benchmarkReadings=d.benchmarks.filter(b=>b.resourceType==='benchmark');
assert.equal(benchmarkReadings.length,15);
for(const b of benchmarkReadings){
 assert.ok(b.reading.introduction.length>=1,b.id+': explain purpose and scope');
 assert.ok(b.reading.inputs&&b.reading.evaluation.length>=2&&b.reading.force&&b.reading.relevance,b.id+': explain how models are tested');
 for(const group of b.reading.taskGroups){
  assert.ok(group.source&&group.locator&&group.domain&&group.items.length,b.id+': attributable task group');
  for(const item of group.items){
   assert.ok(item.name&&item.goal&&item.scoring,b.id+': concrete task and score');
   if(item.protocolId)assert.ok(d.works.some(w=>w.experiments.some(e=>e.id===item.protocolId)),item.protocolId);
  }
 }
}
assert.equal(d.benchmarks.find(b=>b.id==='tabero').tasks.length,9,'Task names must not be replaced by force metric names');
assert.equal(d.benchmarks.find(b=>b.id==='forcebench').reading.taskGroups[0].items.length,8);
assert.equal(d.benchmarks.find(b=>b.id==='forcebench').reading.taskGroups[1].items.length,5);
assert.equal(d.benchmarks.find(b=>b.id==='bench2dex').tasks.length,26);
for (const b of d.benchmarks) {
 assert.ok(b.metadata && b.metadata.scholarSource && b.metadata.dateSource, b.id + ': resource metadata provenance');
 assert.ok(b.metadata.scholar == null || (Number.isInteger(b.metadata.scholar) && b.metadata.scholarStatus === 'verified'), b.id + ': verified Scholar counts');
 assert.ok(b.metadata.stars == null || (Number.isInteger(b.metadata.stars) && b.metadata.starsDate), b.id + ': dated GitHub counts');
 for (const u of b.externalUsers) assert.ok(u.metadata && u.source && u.usage, b.id + ': attributed external adopter');
}
for (const id of ['visible-touch-eval', 'me-dex-eval', 'tactildm-eval']) assert.ok(!d.benchmarks.some(b => b.id === id));
assert.equal(d.benchmarks.find(b => b.id === 'libero').externalUsers[0].id, 'visible-touch');
assert.equal(d.benchmarks.find(b => b.id === 'suite-c11').externalUsers[0].id, 'me-dex');
assert.equal(d.benchmarks.find(b => b.id === 'maniskill-vitac-2025').externalUsers[0].id, 'tactildm');
assert.equal(d.resourceStudies.find(s => s.id === 'tactildm').metadata.scholarStatus, 'not-found');
assert.equal(d.resourceStudies.find(s => s.id === 'visible-touch').metadata.scholarStatus, 'count-not-displayed');
console.log(`PASS: ${benchmarkReadings.length} expanded benchmarks, ${d.benchmarks.length} resources with attributable metrics and external adopters.`);
const liberoResource = d.benchmarks.find(b => b.id === 'libero');
assert.equal(benchmarkAdoptionCount(liberoResource, catalogue.getBenchmarkUsers('libero')), 2, 'LIBERO includes the derived Tabero evaluation and Visible Touch');
assert.equal(benchmarkAdoptionCount(d.benchmarks.find(b => b.id === 'univtac'), catalogue.getBenchmarkUsers('univtac')), 3);
assert.equal(benchmarkAdoptionCount({...liberoResource, externalUsers:[...liberoResource.externalUsers,...liberoResource.externalUsers]}, catalogue.getBenchmarkUsers('libero')), 2, 'Duplicate study records count once');
for (const w of d.works) for (const r of w.relations.filter(r => r.type === 'adopts')) assert.ok(r.usageDetails?.length >= 3, w.id + ': readable, structured resource usage');
