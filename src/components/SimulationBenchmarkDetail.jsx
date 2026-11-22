import React from "react";
import { PageIntro, External, SaveControls } from "./ui.jsx";
import BenchmarkNavigation from "./BenchmarkNavigation.jsx";
import BenchmarkUsage from "./BenchmarkUsage.jsx";
import TaskScoring from "./TaskScoring.jsx";

const SECTIONS = ["基本信息", "任务体系与评价标准", "泛化评测（仿真）", "传感器与硬件鲁棒性（仿真）", "专家演示生成", "值得关注的设计", "局限性", "使用工作"];
function Sources({ items }) {
  return items?.length ? <div className="source-links">{items.map(({ url, label }) => <External key={url + label} href={url}>{label}</External>)}</div> : null;
}
function Facts({ rows, label }) {
  return <div className="benchmark-table-scroll"><table className="forcebench-facts" aria-label={label}><thead><tr><th scope="col">项目</th><th scope="col">内容</th></tr></thead><tbody>{rows.map(([name, value, source]) => <tr key={name}><th scope="row">{name}</th><td>{(Array.isArray(value) ? value : [value]).map((line, i) => <div key={i}>{line}</div>)}{source && <Sources items={[source]} />}</td></tr>)}</tbody></table></div>;
}
function TaskCard({ task }) {
  const subtasks = task.subtasks || [];
  const showAll = subtasks.length <= 20;
  const visibleSubtasks = showAll ? subtasks : subtasks.slice(0, 4);
  return <article className="forcebench-task"><h4>{task.englishName}<span>{task.name}</span></h4><dl>{[["任务", task.goal], ["评测重点", task.focus]].map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}<div><dt>成功判定</dt><dd><TaskScoring task={task} /></dd></div></dl>
    {subtasks.length > 0 && <div className="benchmark-subtasks"><h5>{task.subtasksLabel || (showAll && task.subtasksComplete ? `全部 ${subtasks.length} 项任务` : `任务示例（该组共 ${subtasks.length} 项）`)}</h5><ul>{visibleSubtasks.map(item => <li key={item.name}><strong><External href={item.successSource} title="查看来源">{item.displayName || item.name}</External></strong><span>{item.success}</span></li>)}</ul></div>}
    {task.examples?.length > 0 && <div className="benchmark-task-examples">{task.examples.map(example => <p key={example}>{example}</p>)}</div>}
    {task.criteria?.length > 0 && <details className="forcebench-criteria"><summary>评价细则<span className="forcebench-disclosure-state" aria-hidden="true" /></summary><div className="forcebench-criteria-content"><ul>{task.criteria.map(text => <li key={text}>{text}</li>)}</ul><Sources items={task.sources} /></div></details>}<Sources items={task.parameterSources} /></article>;
}
function Groups({ groups }) {
  return groups.map(group => <section className="forcebench-category" key={group.title}><header><h3>{group.title}<span>{group.english}</span></h3>{group.count && <span className="forcebench-task-count">{group.count}</span>}</header>{group.note && <p className="forcebench-category-description">{group.note}</p>}<div className="forcebench-task-list">{group.tasks.map(task => <TaskCard key={task.englishName} task={task} />)}</div><Sources items={group.sources} /></section>);
}
function Study({ title, study }) {
  const verified = study;
  return <section className="forcebench-evaluation"><h3>{title}</h3>{verified.rows ? <Facts rows={verified.rows} label={title} /> : <p>{verified.status}</p>}{verified.note && <p className="forcebench-note">{verified.note}</p>}<Sources items={verified.sources} /></section>;
}
function GeneralizationSupport({ support }) {
  return <section className="forcebench-evaluation"><h3>{support.title}</h3><p>{support.introduction}</p><div className="benchmark-table-scroll"><table className="forcebench-facts benchmark-support-table" aria-label={support.title}><thead><tr>{support.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{support.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>{support.note && <p className="forcebench-note">{support.note}</p>}<Sources items={support.sources} /></section>;
}
function TaskEvaluation({ page }) {
  return <>
    <section className="benchmark-domain-section" data-evaluation-domain="sim" aria-label="仿真任务">
      <h3 className="benchmark-domain-title">{page.simulationTitle || "2.1 仿真任务"}</h3>
      {page.taskNote && <p>{page.taskNote}</p>}
      <Groups groups={page.taskGroups} />
    </section>
    {page.real && <section className="benchmark-domain-section benchmark-real" data-evaluation-domain="real" aria-label="真机验证">
      <h3 className="benchmark-domain-title">2.2 真机验证</h3>
      {page.real.correspondence && <p className="benchmark-domain-correspondence">{page.real.correspondence}</p>}
      <p>{page.real.protocol}</p>
      <Groups groups={page.real.groups} /><Sources items={page.real.sources} />
    </section>}
  </>;
}
export default function SimulationBenchmarkDetail({ b, goto, saved, save, showPaper, section }) {
  const page = b.reading.simulationDetail;
  const sections = page.sections || SECTIONS;
  const simulationRobustness = (page.robustness.studies || []).filter(study => study.domain === "仿真");
  const content = [
    <><Facts rows={page.facts} label={`${b.name} 基本信息`} />{page.inputNote && <p className="forcebench-note">{page.inputNote}</p>}<Sources items={page.basicSources} /></>,
    <TaskEvaluation page={page} />,
    <>{page.generalization.support && <GeneralizationSupport support={page.generalization.support} />}<Study title={page.generalization.scene.title || "3.1 场景随机化"} study={page.generalization.scene} />{!page.generalization.support && <Study title={page.generalization.physics.title || "3.2 物理 OOD"} study={page.generalization.physics} />}{page.generalization.other?.filter(study => study.domain === "仿真" || (page.includeRealStudies && study.domain === "真机")).map(study => <Study key={study.title} title={study.title} study={study} />)}</>,
    simulationRobustness.length === 0 ? <p>无</p> : <>{simulationRobustness.map(study => <Study key={study.title} title={study.title} study={study} />)}</>,
    <><p>{page.expert.introduction}</p><ol className="forcebench-expert-steps">{page.expert.steps.map(step => <li key={step}>{step}</li>)}</ol><Sources items={page.expert.sources} /></>,
    <><div className="forcebench-designs">{page.designs.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><Sources items={page.designSources} />{page.adoptions?.length > 0 && <div className="section-spacer"><h3>采用这项评测的工作</h3>{page.adoptions.map(item => <p key={item.url}><External href={item.url}>{item.name}</External>：{item.text}</p>)}</div>}</>,
    <><ul className="forcebench-limitations">{page.limitations.map(item => <li key={item.title}><strong>{item.title}：</strong>{item.text}</li>)}</ul><Sources items={page.limitationSources} /></>,
    <BenchmarkUsage b={b} />,
  ];
  return <><button className="back-link" onClick={() => goto("benchmarks")}>← 返回 Benchmark 与资源</button><PageIntro title={b.name}>{page.introduction}</PageIntro><BenchmarkNavigation resourceId={b.id} sections={sections} initialSection={section} /><div className="forcebench-reading simulation-reading">{sections.map((title, index) => <section key={title} id={`benchmark-section-${index}`} className="benchmark-reader-section forcebench-section" tabIndex={-1} aria-labelledby={`simulation-heading-${index}`}><h2 id={`simulation-heading-${index}`}>{String(index + 1).padStart(2, "0")}. {title}</h2>{content[index]}</section>)}</div><footer className="forcebench-references"><Sources items={page.sources} /></footer>
    <div className="personal-section"><h3>收藏与研究记录</h3><SaveControls id={`bm-${b.id}`} saved={saved} onSave={save} notes /></div></>;
}
