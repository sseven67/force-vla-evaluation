import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createCatalogue, benchmarkAdoptionCount, robotDescription } from './src/data/catalogue.js';
import { parseHash } from './src/hooks/useHashRoute.js';
import { createTaskView, getTaskTopicName, filterTaskInstances, selectPapers, DEFAULT_PAPER_FILTERS, DEFAULT_WORK_FILTERS, matchesPublicationYear, getTaskKindOptions, filterTaskKindInstances } from './src/data/selectors.js';
const d=JSON.parse(fs.readFileSync('public/catalogue.json','utf8'));
const removedIds=new Set(['T15','T20','T21','C08','C09','C16','C17','C18','C19']);
// New papers keep source-specific scoring, force semantics and priority rules.
const recentIds=['N01','N02','N03','N04','N05'];
for(const id of recentIds)assert.ok(d.works.some(w=>w.id===id),id+': recent candidate registered');
const fm=d.works.find(w=>w.id==='N01');
assert.deepEqual(fm.bimanualEvaluation.taskIds,['N01-e01']);
assert.equal(fm.screening.highAttention,true,'FM-VLA meets the mainline Scholar threshold');
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
 if(removedIds.has(id.split('-')[0]))continue;
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
for(const id of ['W06','E02','E11'])assert.ok(d.works.find(w=>w.id===id).domains.includes('离线'),id+': offline prediction must be discoverable');
assert.deepEqual(allExperiments(d.works.find(w=>w.id==='W06')).find(e=>e.id==='W06-e06').evaluationModes,['离线']);
assert.deepEqual(d.works.find(w=>w.id==='W06').experiments.find(e=>e.id==='W06-e01').evaluationModes,['真机']);
const catalogue=createCatalogue(d);
// Official-source hardware review: distinguish policy input, collection and control.
const physicalReview=JSON.parse(fs.readFileSync('research/physical_profiles.json','utf8'));
assert.equal(Object.keys(physicalReview.works).length,58);
for(const w of catalogue.PAPERS){
 const p=w.physicalProfile;
 assert.ok(p.robotConfiguration&&p.effectorModel&&p.forceBrief&&p.source.url&&p.source.locator,w.id+': sourced configuration');
 assert.ok(!/未确认|未查清|待核实/.test([p.robotConfiguration,p.robotModel,p.effectorModel,p.forceBrief,p.forceDetail].join(' ')),w.id+': omit unknown particulars');
 assert.equal(p.verification.checked,'2026-10-23');
 assert.ok(w.actionOutput&&w.actionSource?.url&&w.actionSource?.locator,w.id+': source-linked action description');
}
assert.equal(robotDescription(catalogue.byId.get('W01').physicalProfile),'单臂（Flexiv Rizon）');
assert.equal(robotDescription(catalogue.byId.get('R01').physicalProfile),'单臂／双臂（Flexiv Rizon 4；不同任务）');
assert.ok(catalogue.byId.get('W04').actionOutput.includes('七个机械臂关节的目标角度'));
assert.ok(catalogue.byId.get('W17').actionOutput.includes('执行时只发送运动指令'));
assert.ok(catalogue.byId.get('W16').actionOutput.includes('目标偏移量'));
assert.ok(catalogue.byId.get('N05').actionOutput.includes('目标关节角度'));
assert.deepEqual(catalogue.byId.get('W17').categories,['gripper-wrench']);
assert.deepEqual(catalogue.byId.get('E12').categories,['gripper-touch']);
assert.deepEqual(catalogue.byId.get('W10').categories,['gripper-touch']);
assert.deepEqual(catalogue.byId.get('W16').categories,['gripper-wrench']);
assert.ok(catalogue.byId.get('W16').physicalProfile.forceBrief.includes('执行策略不额外输入实测力'));
assert.ok(catalogue.byId.get('P03').physicalProfile.forceBrief.includes('各100个'));
assert.ok(catalogue.byId.get('T18').physicalProfile.forceBrief.includes('六维力'));
assert.ok(!catalogue.byId.get('T18').physicalProfile.forceBrief.includes('触觉图像'));
assert.equal(catalogue.byId.get('P02').physicalProfile.robotModel,'YAM station');
assert.equal(catalogue.byId.get('W18').physicalProfile.effectorModel,'平行两指夹爪');
assert.equal(DEFAULT_PAPER_FILTERS.scope,'all');
assert.equal(DEFAULT_WORK_FILTERS.scope,'all');
const attentionPapers=selectPapers(catalogue,{query:'',filters:{...DEFAULT_PAPER_FILTERS,scope:'high'},sort:'googleScholar',saved:null});
assert.equal(attentionPapers.length,19);
assert.equal(attentionPapers.filter(w=>w.screening.attentionTier==='gripperWrench').length,9);
const allPapers=selectPapers(catalogue,{query:'',filters:DEFAULT_PAPER_FILTERS,sort:'googleScholar',saved:null});
assert.equal(allPapers.length,catalogue.PAPERS.length);
assert.ok(allPapers.every((w,i)=>i===0||(allPapers[i-1].attention.googleScholar??-1)>=(w.attention.googleScholar??-1)));
const highTasks=filterTaskInstances(catalogue,d.taskInstances,{query:'',filters:{...DEFAULT_WORK_FILTERS,scope:'high'},saved:null});
assert.ok(highTasks.length>0&&highTasks.every(r=>catalogue.byId.get(r.work).screening.highAttention));
assert.deepEqual(d.taskGroups.map(g=>g.name),['接触对准','持续接触','稳定夹持与保护','力觉感知、判断与决策','长程多步骤操作']);
const allProtocols=d.works.flatMap(w=>w.experiments);
const paperProtocols=catalogue.PAPERS.flatMap(w=>w.experiments);
assert.equal(d.taskTypes.length,97);
assert.equal(new Set(d.taskInstances.flatMap(r=>r.protocols.map(e=>e.id))).size,355);
assert.equal(d.taskInstances.flatMap(r=>r.protocols).length,357,'Compound records retain source IDs without inventing independent tests');
const plan=JSON.parse(fs.readFileSync('research/task_classification_plan.json','utf8'));
for(const topic of d.taskTypes){
 const planned=plan.topics.find(t=>t.id===topic.id);
 assert.ok(planned,topic.id+': reviewed topic');
 assert.deepEqual(topic.groups,[planned.group]);
 assert.equal(topic.name,planned.taskNames.length===1?planned.taskNames[0]:planned.name);
 if(topic.taskNames.length===1)assert.equal(topic.name,topic.taskNames[0],'Singleton topic uses its task name');
 else assert.ok(topic.description,'Multi-kind topic introduction');
 const records=d.taskInstances.filter(r=>r.task===topic.id);
 const options=getTaskKindOptions(topic,records);
 assert.equal(options.reduce((n,k)=>n+k.count,0),records.flatMap(r=>r.protocols).length);
 for(const option of options){
  const selected=filterTaskKindInstances(records,option.id);
  assert.equal(selected.flatMap(r=>r.protocols).length,option.count);
  assert.ok(selected.every(r=>r.protocols.every(e=>e.taskKind===option.id)),topic.id+': filter protocols, not whole papers');
 }
 assert.equal(getTaskTopicName(topic,records.slice(0,1)),topic.name,'Filters cannot rename the topic');
}
const jelly=d.taskTypes.find(t=>t.name==='气球上切果冻');
assert.ok(jelly);
assert.ok(d.taskInstances.find(r=>r.task===jelly.id).protocols.every(e=>e.task==='气球上切果冻'));
const whiteboard=d.taskTypes.find(t=>t.id==='whiteboard');
assert.deepEqual(whiteboard.taskNames,['擦白板'],'Arm configuration, directions and conditions do not create task kinds');
for(const e of paperProtocols)assert.equal(e.taskGroups.length,1,e.id+': unique content-based major category even offline');
assert.deepEqual(paperProtocols.find(e=>e.id==='C06-e03').taskGroups,['precision']);
assert.deepEqual(paperProtocols.find(e=>e.id==='W06-e07').taskGroups,['surface']);
assert.deepEqual(paperProtocols.find(e=>e.id==='T02-e07').taskGroups,['grasp']);
assert.deepEqual(paperProtocols.find(e=>e.id==='R02-e03').taskGroups,['long']);
assert.ok(d.taskInstances.every(r=>!catalogue.byId.get(r.work).resourceOnly));
for(const group of d.taskGroups){
 const view=createTaskView(catalogue,d.taskInstances,{category:group.id});
 assert.ok(view.types.length,group.id+': discoverable capability');
 for(const type of view.types)for(const r of view.getVisibleInstances(type.id))assert.ok(r.protocols.every(e=>e.taskGroups.includes(group.id)),r.id+': no unrelated protocol leaks across categories');
}
{
 const view=createTaskView(catalogue,d.taskInstances,{});
 const cardIds=new Set(view.groups.flatMap(g=>g.topics.map(t=>t.id)));
 assert.deepEqual(new Set(view.types.map(t=>t.id)),new Set(d.taskInstances.map(r=>r.task)),'Flat list includes every indexed topic, including ungrouped offline evaluations');
 assert.ok([...cardIds].every(id=>view.types.some(t=>t.id===id)),'Capability cards are included in the full task list');
 assert.ok(view.groups.every(({topics})=>topics.every(t=>t.groups.length)),'Offline-only topics do not enter robot-operation capability cards');
}
for(const period of ['2024','2025','2026','all']){
 const records=filterTaskInstances(catalogue,d.taskInstances,{query:'',filters:{...DEFAULT_WORK_FILTERS,period,domain:'离线'},saved:null});
 const expected=catalogue.PAPERS.filter(w=>matchesPublicationYear(w,period)).flatMap(w=>w.experiments.filter(e=>e.evaluationModes.includes('离线')));
 assert.deepEqual(new Set(records.flatMap(r=>r.protocols.map(e=>e.id))),new Set(expected.map(e=>e.id)),'Offline coverage matches paper-library evaluations for '+period);
 const view=createTaskView(catalogue,records,{});
 assert.deepEqual(new Set(view.types.map(t=>t.id)),new Set(records.map(r=>r.task)),'Offline topics stay discoverable for '+period);
 for(const record of records){
  assert.ok(view.getVisibleInstances(record.task).some(r=>r.id===record.id),'Offline record opens from its topic');
  if(catalogue.PAPERS.some(w=>w.id===record.work))assert.ok(view.hasMatrixTask(record.work,record.task),'Offline method paper retains matrix coverage');
 }
}
for(const w of d.works){
 assert.deepEqual(catalogue.getWorkInstances(w.id),d.taskInstances.filter(i=>i.work===w.id));
 for(const task of d.taskTypes)assert.equal(catalogue.hasTask(w.id,task.id),d.taskInstances.some(i=>i.work===w.id&&i.task===task.id));
 for(const protocol of w.experiments){
  const topics=d.taskInstances.filter(i=>i.protocols.some(e=>e.id===protocol.id)).map(i=>i.task);
  const expected=w.resourceOnly?[]:catalogue.PAPERS.flatMap(other=>{
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
assert.equal(d.works.filter(w=>!w.resourceOnly).length,58);
for(const id of removedIds){assert.ok(!d.works.some(w=>w.id===id));assert.ok(!d.taskInstances.some(i=>i.work===id));assert.ok(!d.resourceWorkMetadata[id]);}
for(const topic of d.taskTypes)assert.ok(d.taskInstances.some(i=>i.task===topic.id),topic.id+': no orphan topic');
assert.equal(DEFAULT_WORK_FILTERS.period,'all');
for(const year of ['2024','2025','2026'])for(const w of d.works)assert.equal(matchesPublicationYear(w,year),String(w.screening.publicYear)===year);
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
assert.ok(d.works.find(w=>w.id==='W14').classificationNote.includes('部署时不读取'));
assert.ok(d.works.find(w=>w.id==='T07').resourceOnly);
const benches=new Set(d.benchmarks.map(b=>b.id)), tasks=new Set(d.taskTypes.map(t=>t.id));
assert.ok(d.works.find(w=>w.id==='W03').experiments[1].method.includes('啮合'),'FAVLA gear completion must include engagement');
assert.ok(d.works.find(w=>w.id==='W05').experiments[3].setting.includes('75 N'),'Force stop threshold belongs to settings');
assert.ok(d.works.find(w=>w.id==='T01').experiments[1].task.includes('盘子'),'Correct wiping object');
assert.ok(d.works.find(w=>w.id==='T04').experiments[4].task.includes('粗糙度分拣'),'Correct real task identity');
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
for(const doc of d.documents)assert.ok(fs.existsSync('public/'+doc.url));
assert.ok(fs.readFileSync('src/main.jsx','utf8').includes('createRoot'));
assert.ok(d.works.every(w=>w.screening&&['A','B','C','H'].includes(w.screening.grade)));
assert.equal(d.works.find(w=>w.id==='W01').screening.grade,'A');
assert.equal(d.works.find(w=>w.id==='W02').screening.grade,'A');
assert.equal(d.works.find(w=>w.id==='P04').screening.highAttention,false);
assert.equal(d.works.find(w=>w.id==='C01').screening.publicYear,2024,'Year filter follows first publication');
assert.equal(d.works.find(w=>w.id==='C13').screening.grade,'H','Older DIGIT hardware must not dominate current priorities');
assert.equal(d.works.find(w=>w.id==='R01').screening.grade,'A');
const highIds=new Set(['W01','W02','W03','W14','W17','W18','C02','R01','N01','W09','W11','W13','E01','E02','E03','E04','E05','T01','T02']);
assert.equal(d.works.filter(w=>w.screening.highAttention).length,19,'ForceFlow now follows the gripper/wrist-wrench threshold');
for(const w of d.works){
 assert.equal(w.screening.highAttention,highIds.has(w.id),w.id+': reviewed attention membership');
 assert.equal(w.screening.label,w.screening.highAttention?'较高关注':'');
 if(w.screening.highAttention)assert.ok(w.screening.originalAvailable&&w.screening.relatedEvaluation);
}
assert.deepEqual(d.selectionPolicy.years,[2024,2025,2026]);
assert.equal('window' in d.selectionPolicy,false);
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
assert.equal(experiment('E04-e01').forceEvaluation.status,'not_reported');
assert.equal(experiment('E10-e01').forceEvaluation.status,'not_reported','Do not spread the Task2 force curve across all views');
assert.equal(experiment('E10-e02').forceEvaluation.kind,'case');
assert.equal(experiment('T08-e02').forceEvaluation.status,'not_reported','Slip F1 is not force estimation error');
assert.equal(experiment('C20-e05').forceEvaluation.kind,'case','Keep reported force sensitivity distinct from unscored application demonstrations');
assert.equal(experiment('R01-e01').forceEvaluation.kind,'collection','Keep demonstration quality separate from policy evaluation');
assert.ok(experiment('W07-e01').forceEvaluation.metrics.join(' ').includes('多个任务合在一起算'));
assert.ok(experiment('W11-e01').forceEvaluation.metrics.join(' ').includes('机械臂'));
for(const id of ['W05-e04']){
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
for (const id of ['W06-e07','E08-e04','T08-e01','T19-e08','T19-e09','T19-e10','C06-e01','C07-e05','C20-e01','C20-e02','C20-e03','C20-e04','C20-e05','C20-e10','R01-e01']) {
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
assert.ok(d.works.every(w=>metricSummaries.has(w.id)),'All retained works need a plain metric overview');
for(const w of d.works)assert.equal(w.metrics,metricSummaries.get(w.id),w.id+': metric overview');
assert.ok(experiment('T08-e02').method.includes('漏掉')&&experiment('T08-e02').method.includes('误报'),'F1 must explain both missed cases and false alarms');
assert.ok(!/20 N|7\.5 N|6 N/.test(JSON.stringify(experiment('C01-e01').forceEvaluation.explanation)),'Do not repeat optional numerical results in the force explanation');
assert.ok(!experiment('W09-e01').setting.includes('未说明'),'Omit minor missing trial-count notices from reader setup');
assert.ok(experiment('E04-e01').method.includes('各步骤的具体分值尚不明确'),'Retain uncertainty about the actual scoring rule');
assert.ok(experiment('W07-e01').method.includes('具体成功判定细则尚不明确'),'Retain uncertainty about task success criteria');
assert.equal(experiment('E10-e01').forceEvaluation.label,'无','Only task 2 has a sourced force curve');
assert.equal(experiment('W03-e01').forceEvaluation.label,'无');
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

// Arm coordination filters individual evaluations, independently of capability.
{
 const cooperativeIds=new Set(catalogue.PAPERS.filter(w=>w.bimanualEvaluation?.type==='cooperative').flatMap(w=>w.bimanualEvaluation.taskIds));
 const indexedIds=new Set(d.taskInstances.flatMap(r=>r.protocols.map(e=>e.id)));
 for(const id of cooperativeIds){
  const protocol=d.works.flatMap(w=>w.experiments).find(e=>e.id===id);
  assert.ok(protocol.taskGroups.length,id+': cooperative task has capability membership');
  assert.ok(indexedIds.has(id),id+': cooperative task is navigable');
 }
 const records=filterTaskInstances(catalogue,d.taskInstances,{query:'',filters:{...DEFAULT_WORK_FILTERS,period:'all',bimanualCooperation:true},saved:null});
 assert.deepEqual(new Set(records.flatMap(r=>r.protocols.map(e=>e.id))),cooperativeIds,'Bimanual filter retains all reviewed cooperative tasks and excludes same-paper single-arm tasks');
 const view=createTaskView(catalogue,records,{});
 assert.ok(view.groups.length===5,'Bimanual tasks use the existing five capability categories');
 assert.ok(!allProtocols.find(e=>e.id==='C15-e01').taskGroups.includes('long'),'Shared lifting is not automatically a long workflow');
 assert.deepEqual(allProtocols.find(e=>e.id==='R02-e03').taskGroups,['long'],'Full insertion workflow has one primary capability');
}

// Task coverage matches the paper library, including unfamiliar task names.
{
 const evaluations=catalogue.PAPERS.flatMap(w=>w.experiments);
 const indexed=new Set(d.taskInstances.flatMap(record=>record.protocols.map(e=>e.id)));
 assert.deepEqual(indexed,new Set(evaluations.map(e=>e.id)),'Every paper evaluation is indexed and no resource-only evaluation is included');
 assert.ok(d.taskInstances.every(record=>!catalogue.byId.get(record.work).resourceOnly),'Task records stay within the paper library');
 assert.deepEqual(new Set(catalogue.protocolsById.keys()),indexed,'Direct protocol links stay within task scope');
 for(const work of catalogue.RESOURCE_WORKS){
  assert.deepEqual(catalogue.getWorkInstances(work.id),[],work.id+': resource is not a task-library work');
  for(const e of work.experiments)assert.deepEqual(catalogue.getRelatedProtocols(e.id),[],e.id+': resource protocol cannot open task comparisons');
 }
 for(const e of evaluations){
  const review=e.taskClassification;
  assert.ok(review?.reason&&review.source&&review.locator,e.id+': sourced classification review');
  assert.equal(e.taskGroups.length,1,e.id+': classify by content, independently of evaluation mode');
 }
 const records=filterTaskInstances(catalogue,d.taskInstances,{query:'',filters:{...DEFAULT_WORK_FILTERS,period:'all'},saved:null});
 const view=createTaskView(catalogue,records,{});
 assert.deepEqual(new Set(view.types.map(t=>t.id)),new Set(d.taskTypes.map(t=>t.id)),'Every indexed task can be opened without filters');
 console.log('PASS: every paper-library evaluation indexed; resource-only tasks excluded; paper perception remains discoverable.');
}

// Official-source metric revisions preserve score type, units and case scope.
const metricReview=JSON.parse(fs.readFileSync('research/task_metric_review.json','utf8'));
assert.equal(Object.keys(metricReview.protocols).length,70);
for(const [id,r] of Object.entries(metricReview.protocols)){
 const e=experiment(id);assert.equal(e.metric,r.metric);assert.equal(e.forceEvaluation.checked,'2026-10-23');
 assert.ok(e.forceEvaluation.source&&e.forceEvaluation.locator&&e.forceEvaluation.note);
 assert.notEqual(e.forceEvaluation.status,'pending');
 for(const record of d.taskInstances)for(const view of record.protocols.filter(v=>v.id===id))assert.equal(view.metric,r.metric);
}
assert.ok(experiment('N05-e01').metric.includes('0–100%'));
assert.ok(!experiment('N05-e01').metric.includes('成功率'));
assert.ok(experiment('N02-e04').metric.includes('打开率'));
assert.ok(experiment('N02-e01').metric.includes('（N）'));
assert.ok(experiment('N01-e01').metric.includes('案例展示'));
for(const e of paperProtocols)assert.ok(['有','有（案例曲线）','无'].includes(e.forceEvaluation.label),e.id);
