import React, { useState } from "react";
import { useCatalogue, robotDescription } from "../data/catalogue.js";
import { comparisonTopics, settingSections, scoringParts, forceComparison, rowDifference } from "../data/comparison.js";
import { PageIntro, External } from "../components/ui.jsx";

function TextList({ items, fallback = "见下方完整设置" }) {
  return items.length ? <ul className="compare-facts">{items.map((item, i) => <li key={i}>{item}</li>)}</ul> : <span className="compare-muted">{fallback}</span>;
}
function ExpandText({ text, label = "展开说明" }) {
  return text && text.length > 150 ? <details className="compare-expansion"><summary>{label}</summary><p>{text}</p></details> : <p>{text}</p>;
}

export default function ComparePage({ selected, compare, clear, ...p }) {
  const catalogue = useCatalogue();
  const { byId, bmById, PAPERS, colour } = catalogue;
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("tasks");
  const [topicId, setTopicId] = useState("");
  const [variants, setVariants] = useState({});
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const works = selected.map(id => byId.get(id)).filter(w => w && !w.resourceOnly);
  const topics = comparisonTopics(catalogue, works);
  const topic = topics.find(t => t.id === topicId) || topics[0];
  const common = topics.filter(t => t.coverage === works.length);
  const entries = (topic?.entries || []).map(entry => ({ ...entry,
    experiment: entry.experiments.find(e => e.id === variants[topic.id + entry.work.id]) || entry.experiments[0],
  }));
  const choices = PAPERS.filter(w => !selected.includes(w.id) && (!query || (w.name + ' ' + w.tasks).toLowerCase().includes(query.toLowerCase()))).sort((a, b) => (b.attention.googleScholar ?? -1) - (a.attention.googleScholar ?? -1)).slice(0, query ? 12 : 6);
  const forceCount = entries.filter(e => e.experiment?.forceEvaluation.status === 'reported').length;
  const missingForce = entries.filter(e => e.experiment?.forceEvaluation.status === 'not_reported').length;
  const pendingForce = entries.filter(e => e.experiment?.forceEvaluation.status === 'pending').length;
  const value = (fn) => entries.map(({ work, experiment }) => experiment ? fn(experiment, work) : null);
  const row = (id, label, values, render, note) => ({ id, label, values, render, note, difference: rowDifference(values) });
  const rows = theme === 'tasks' ? [
    row('purpose', '检查什么能力', value(e => e.purpose)),
    row('metric', '用什么指标评分', value(e => scoringParts(e).metrics), v => <TextList items={v} />, '注意完成标准的差异。'),
    row('success', '怎样才算完成', value(e => scoringParts(e).requirement), v => <ExpandText text={v} label="展开完成要求" />),
    row('calculation', '怎样计算分数', value(e => scoringParts(e).calculation), v => <ExpandText text={v} label="展开计分方法" />),
    row('force-use', '力是否参与评价', value(e => forceComparison(e)), v => <ExpandText text={v} label="展开力的比较作用" />),
  ] : theme === 'design' ? [
    row('environment', '在哪里测试', value(e => e.evaluationModes.join('、'))),
    row('robot', '机器人', value((e, w) => robotDescription(w.physicalProfile))),
    row('effector', '操作末端', value((e, w) => w.physicalProfile.effectorModel || '类型／型号未确认')),
    row('signal', '力／触觉信号', value((e, w) => w.physicalProfile.forceBrief)),
    row('trials', '测了多少次', value(e => settingSections(e).trials), v => <TextList items={v} />, '按方法、条件区分次数。'),
    row('training', '用了多少训练示教', value(e => settingSections(e).training), v => <TextList items={v} />),
    row('changes', '改变了哪些条件', value(e => settingSections(e).changes), v => <TextList items={v} />),
    row('stops', '限时与停止规则', value(e => settingSections(e).stops), v => <TextList items={v} />, '停止阈值不等于评分指标。'),
  ] : theme === 'force' ? [
    row('signal', '力／触觉信号', value((e, w) => w.physicalProfile.forceBrief)),
    row('source', '信息从哪里来', value((e, w) => w.sensorOrigin)),
    row('output', '模型输出什么', value((e, w) => w.actionOutput)),
    row('reported', '自主执行的力评价', value(e => e.forceEvaluation.label + (e.forceEvaluation.summary ? '：' + e.forceEvaluation.summary : ''))),
    row('force-metric', '力指标怎样判断好坏', value(e => e.forceEvaluation.explanation?.method || e.forceEvaluation.label), v => <ExpandText text={v} label="展开力指标说明" />),
    row('ranking', '参与比较还是解释结果', value(e => forceComparison(e)), v => <ExpandText text={v} label="展开比较作用" />),
  ] : [
    row('benchmark', '论文的基准来源', value((e, w) => w.relations.map(r => (bmById.get(r.benchmark)?.name || r.resourceName) + '：' + r.label)), v => <TextList items={v} fallback="见论文评测来源" />, '整篇论文的资源关系。'),
    row('release', '公开资源入口', value((e, w) => w.openness.url), (v, index) => <External href={v}>{entries[index].work.name} 官方资源 ↗</External>),
    row('limits', '比较结果的限制', value((e, w) => w.resultSummary.limitation)),
  ];
  const visibleRows = differencesOnly ? rows.filter(r => r.difference !== '所列内容一致') : rows;
  return <>
    <PageIntro eyebrow="SIDE BY SIDE / 横向比较" title="对准同一个任务，再看差在哪里。">
      选择相近任务，对照评分、设置和力指标。
    </PageIntro>
    <section className="comparison-picker" aria-label="选择比较论文">
      <div className="selected-papers">{works.map(w => <span key={w.id}>{w.name}<button aria-label={'移除' + w.name} onClick={() => compare(w.id)}>×</button></span>)}{!works.length && <p>在论文库点击“＋ 对比”，或在这里添加论文。</p>}</div>
      <div className="picker-input"><label className="compare-search-label">添加论文<input aria-label="搜索并添加比较论文" placeholder="输入论文名或任务…" value={query} onChange={e => setQuery(e.target.value)} /></label><button onClick={clear}>清空</button></div>
      <div className="comparison-suggestions">{choices.map(w => <button key={w.id} disabled={selected.length >= 3} onClick={() => compare(w.id)}>＋ {w.name}</button>)}</div>
    </section>
    {works.length >= 2 ? <>
      <section className="compare-focus" aria-label="选择对照任务">
        <div className="compare-focus-heading"><div><span className="compare-kicker">先选任务</span><h2>{common.length ? `有 ${common.length} 个共同任务主题` : '这些论文没有共同的任务主题'}</h2></div><label>当前比较的任务<select aria-label="当前比较的任务" value={topic?.id || ''} onChange={e => setTopicId(e.target.value)}>{topics.map(t => <option key={t.id} value={t.id}>{t.name} · {t.coverage}/{works.length}篇涉及</option>)}</select></label></div>
        <p className="mini-note">{common.length ? '请核对各实验的对象与条件。' : '选择任务查看覆盖差异。'}</p>
        <div className="compare-task-choices">{entries.map(({ work, experiment, experiments }) => <div key={work.id} style={{ '--paper-color': colour(work) }}><strong>{work.name}</strong>{experiments.length > 1 ? <label>具体实验<select aria-label={work.name + '具体实验'} value={experiment.id} onChange={e => setVariants({ ...variants, [topic.id + work.id]: e.target.value })}>{experiments.map(e => <option key={e.id} value={e.id}>{e.task} · {e.evaluationModes.join('、')}</option>)}</select></label> : <p>{experiment ? experiment.task + ' · ' + experiment.evaluationModes.join('、') : '该论文没有此类任务记录'}</p>}</div>)}</div>
      </section>
      <div className="comparison-themes" aria-label="比较主题">{[['tasks', '任务与评分'], ['design', '实验设计'], ['force', '力如何评价'], ['sources', 'Benchmark与资源']].map(([id, label]) => <button key={id} className={theme === id ? 'active' : ''} aria-pressed={theme === id} onClick={() => setTheme(id)}>{label}</button>)}</div>
      <div className="compare-reading-line"><p>{`力指标：${forceCount}篇已报告`}{missingForce > 0 && ` · ${missingForce}篇未说明`}{pendingForce > 0 && ` · ${pendingForce}篇待核实`}</p><label><input type="checkbox" checked={differencesOnly} onChange={e => setDifferencesOnly(e.target.checked)} />只看有差异的项目</label></div>
      <div className="compare-aligned" style={{ '--compare-columns': works.length }} role="table" aria-label="同类任务逐项对照">
        <div className="compare-aligned-head" role="row"><div role="columnheader">比较项目</div>{entries.map(({ work, experiment }) => <div role="columnheader" key={work.id}><button className="work-name" onClick={() => p.showPaper(work.id)}>{work.name}</button><small>{experiment?.task || '没有该任务记录'}</small></div>)}</div>
        {visibleRows.map(r => <div className={'compare-aligned-row ' + (r.difference === '所列内容一致' ? 'is-same' : 'is-different')} role="row" key={r.id} data-comparison-row={r.id}><div className="compare-row-title" role="rowheader"><h3>{r.label}</h3><span className="compare-difference">{r.difference}</span>{r.note && <small>{r.note}</small>}</div>{r.values.map((v, i) => <div role="cell" className="compare-cell" key={works[i].id}><span className="compare-mobile-paper">{works[i].name}</span>{v === null ? <span className="compare-muted">没有该任务记录</span> : r.render ? r.render(v, i) : <p>{v}</p>}</div>)}</div>)}
        {!visibleRows.length && <p className="compare-empty-rows">当前显示项目的内容一致，可取消“只看有差异的项目”查看。</p>}
      </div>
      <details className="compare-originals"><summary>查看所选实验的完整设置、对照方法与原文</summary><div className="compare-original-grid">{entries.map(({ work, experiment }) => <article key={work.id}><h3>{work.name}</h3>{experiment ? <><h4>{experiment.task}</h4><p>{experiment.setting}</p><External href={experiment.source}>{experiment.locator} ↗</External></> : <p>没有该任务记录。</p>}<details><summary>论文中的方法对照</summary>{work.comparisonMethods.map(c => <div className="compare-method-mini" key={c.id}><strong>{c.question}</strong><p>{c.objects}</p><small>{c.evaluation}</small><External href={c.source}>{c.locator} ↗</External></div>)}</details><button className="subtle-link" onClick={() => p.showPaper(work.id)}>打开完整论文评测 ↗</button></article>)}</div></details>
      <details className="compare-coverage"><summary>查看全部任务覆盖情况 · {topics.length} 个主题</summary><div className="table-wrap"><table><thead><tr><th>任务主题</th>{works.map(w => <th key={w.id}>{w.name}</th>)}</tr></thead><tbody>{topics.map(t => <tr key={t.id}><th><button className="subtle-link" onClick={() => { setTopicId(t.id); window.scrollTo({ top: 0, behavior: 'instant' }); }}>{t.name}</button></th>{t.entries.map(e => <td key={e.work.id}>{e.experiments.length ? e.experiments.length + '项实验' : '—'}</td>)}</tr>)}</tbody></table></div></details>
    </> : <div className="empty"><h2>选择至少两篇论文开始比较</h2><p>最多选择三篇，之后可选择共同任务逐项对照。</p><button className="primary-button" onClick={() => p.goto('works')}>打开论文库</button></div>}
  </>;
}
