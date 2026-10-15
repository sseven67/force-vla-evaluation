import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={window:{}};
vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),context);
const d=context.window.RESEARCH_DATA;
assert.equal(d.works.length,32);
assert.equal(new Set(d.works.map(w=>w.id)).size,32);
assert.equal(d.works.filter(w=>w.scope==='核心相关').length,8);
const benches=new Set(d.benchmarks.map(b=>b.id));
for(const w of d.works){
  for(const k of ['tasks','purpose','metrics','trials','baseline','openness','source'])assert.ok(w[k],`${w.id}: ${k}`);
  assert.ok(w.notes.length>20,`${w.id}: source notes`);
  for(const r of w.relations)assert.ok(benches.has(r.benchmark),`${w.id}: broken benchmark ${r.benchmark}`);
  assert.ok(!JSON.stringify(w).includes('\ufffd'),`${w.id}: corrupted unicode`);
}
const uni=d.works.filter(w=>w.relations.some(r=>r.benchmark==='univtac'));
assert.equal(uni.length,3);
assert.equal(uni.find(w=>w.id==='E03').relations.find(r=>r.benchmark==='univtac').label,'采用6任务子集');
assert.equal(uni.find(w=>w.id==='E04').relations.find(r=>r.benchmark==='univtac').label,'采用8个任务');
assert.ok(d.extraRelations.some(r=>r.fromWork==='W01'&&r.toBenchmark==='forcebench'&&r.type==='later'));
assert.ok(!d.works.find(w=>w.id==='W01').relations.some(r=>r.benchmark==='forcebench'));
for(const doc of d.documents)assert.ok(fs.existsSync('dist/'+doc.url));
for(const file of ['dist/app.js','dist/data.js','dist/styles.css','dist/index.html'])assert.ok(!fs.readFileSync(file,'utf8').includes('\ufffd'),file);
console.log(`PASS: ${d.works.length} entries, six review dimensions, ${d.benchmarks.length} benchmark references, source documents, directional provenance.`);
