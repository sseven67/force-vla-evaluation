import fs from 'node:fs';
import assert from 'node:assert/strict';
const d=JSON.parse(fs.readFileSync('public/catalogue.json','utf8'));
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
for(const w of d.works){
 for(const k of ['tasks','purpose','metrics','trials','baseline','openness','source','kind','sensorOrigin','actionOutput','actionMode'])assert.ok(w[k],w.id+': '+k);
 assert.ok(w.notes.length>20,w.id+': notes');
 for(const r of w.relations)assert.ok(benches.has(r.benchmark),w.id+': benchmark '+r.benchmark);
 for(const k of ['citations','stars','forks']){const v=w.attention[k];assert.ok(v===null||Number.isInteger(v)&&v>=0,w.id+': invalid '+k);}
 if(w.attention.citations!==null)assert.ok(w.attention.citationSource,w.id+': citation provenance');
 if(w.attention.stars!==null)assert.ok(w.attention.githubSource,w.id+': GitHub provenance');
 assert.equal(w.attention.googleScholar,null,'Never mislabel OpenAlex as Google Scholar');
 assert.ok(!JSON.stringify(w).includes('\ufffd'),w.id+': corrupted Unicode');
}
for(const i of d.taskInstances){assert.ok(ids.has(i.work));assert.ok(tasks.has(i.task));assert.ok(i.success&&i.locator&&i.source);}
const uni=d.works.filter(w=>w.relations.some(r=>r.benchmark==='univtac'&&r.type==='adopts'));
assert.equal(uni.length,3);
assert.equal(uni.find(w=>w.id==='E03').relations.find(r=>r.benchmark==='univtac').label,'采用6任务子集');
assert.equal(uni.find(w=>w.id==='E04').relations.find(r=>r.benchmark==='univtac').label,'采用8个任务');
assert.ok(!d.works.find(w=>w.id==='W01').relations.some(r=>r.benchmark==='forcebench'));
assert.ok(d.extraRelations.some(r=>r.fromWork==='W01'&&r.toBenchmark==='forcebench'&&r.type==='later'));
assert.equal(d.works.find(w=>w.id==='C08').attention.stars,null);
for(const doc of d.documents)assert.ok(fs.existsSync('public/'+doc.url));
assert.ok(fs.readFileSync('src/main.jsx','utf8').includes('createRoot'));
assert.ok(d.works.every(w=>w.screening&&['A','B','C','H'].includes(w.screening.grade)));
assert.equal(d.works.find(w=>w.id==='W01').screening.grade,'A');
assert.equal(d.works.find(w=>w.id==='W02').screening.grade,'B');
assert.equal(d.works.find(w=>w.id==='P04').screening.grade,'C');
assert.equal(d.works.find(w=>w.id==='C01').screening.inWindow,true,'ForceMimic qualifies by ICRA2025 publication');
assert.equal(d.works.find(w=>w.id==='C13').screening.grade,'H','Older DIGIT hardware must not dominate current priorities');
assert.equal(d.works.find(w=>w.id==='R01').screening.grade,'A');
assert.ok(d.works.filter(w=>w.screening.grade==='A').every(w=>w.screening.inWindow));
assert.equal(d.selectionPolicy.window.start,'2024-10-16');
console.log(`PASS: ${d.works.length} records, ${d.taskInstances.length} task links, six dimensions, typed methods, attributable counters, directional provenance and documents.`);
