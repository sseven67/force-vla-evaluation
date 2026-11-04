import React from "react";
import { PageIntro, External, SaveControls } from "./ui.jsx";
import { Figure } from "./Figures.jsx";
import BenchmarkNavigation from "./BenchmarkNavigation.jsx";
import BenchmarkUsage from "./BenchmarkUsage.jsx";

const SECTIONS = ["基本信息", "任务体系与评价标准", "泛化评测（仿真）", "传感器与硬件鲁棒性（仿真）", "专家演示生成", "值得关注的设计", "局限性", "使用工作"];

function Section({ index, children }) {
  return <section id={`benchmark-section-${index}`} className="benchmark-reader-section forcebench-section" tabIndex={-1} aria-labelledby={`forcebench-heading-${index}`}>
    <h2 id={`forcebench-heading-${index}`}>{index + 1}. {SECTIONS[index]}</h2>
    {children}
  </section>;
}

function Vector({ items }) {
  return <span className="forcebench-vector">（{items.map((item, i) => <React.Fragment key={item}><span>{item}</span>{i < items.length - 1 && "，"}</React.Fragment>)}）</span>;
}

function EvaluationTable({ label, rows }) {
  return <table className="forcebench-facts forcebench-evaluation-table" aria-label={label}>
    <thead><tr><th scope="col">项目</th><th scope="col">内容</th></tr></thead>
    <tbody>{rows.map(([name, text]) => <tr key={name}><th scope="row">{name}</th><td>{text}</td></tr>)}</tbody>
  </table>;
}

export default function ForceBenchDetail({ b, goto, saved, save, section }) {
  const { reading } = b;
  const page = reading.detailPage;
  const tasks = reading.taskGroups.flatMap(group => group.items);
  return <>
    <button className="back-link" onClick={() => goto("benchmarks")}>← 返回 Benchmark 与资源</button>
    <PageIntro title="ForceBench">{page.introduction}</PageIntro>
    <BenchmarkNavigation resourceId={b.id} sections={SECTIONS} initialSection={section} />
    <div className="forcebench-reading">
      <Section index={0}>
        <table className="forcebench-facts" aria-label="ForceBench 基本信息">
          <thead><tr><th scope="col">项目</th><th scope="col">内容</th></tr></thead>
          <tbody>
            {page.basicInfo.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{Array.isArray(value) ? value.map(line => <div key={line}>{line}</div>) : value}</td></tr>)}
            <tr><th scope="row">输入</th><td><Vector items={page.input} /></td></tr>
            <tr><th scope="row">输出</th><td><Vector items={page.output} /><span className="forcebench-inline-note">共 7 维</span></td></tr>
            <tr><th scope="row">主要评价指标</th><td>Success Rate（任务成功率）；八项任务成功率的等权平均</td></tr>
          </tbody>
        </table>
        <p className="forcebench-note">无力觉基线省略腕部力觉输入。</p>
        <div className="source-links"><External href={`${reading.source}#A1`}>输入、动作与仿真协议 · 论文附录 A</External></div>
      </Section>

      <Section index={1}>
        <h3 className="benchmark-domain-title">仿真任务（8 项）</h3>
        <Figure figure={page.figure} />
        {page.categories.map((category, i) => <React.Fragment key={category.title}>
          {category.domain === "真机" && <><h3 className="benchmark-domain-title">真机任务（5 项）</h3><p className="benchmark-domain-correspondence">重量分类与仿真属于同类任务，但操作对象不同；泡沫中取盘、盖章、插头插入、积木插槽为另设的真机验证任务。</p></>}
          <section className="forcebench-category" data-evaluation-domain={category.domain === "真机" ? "real" : "sim"} aria-labelledby={`forcebench-category-${i}`}>
          <header><h3 id={`forcebench-category-${i}`}>2.{i + 1} {category.title}<span>{category.english}</span></h3><span className="forcebench-task-count">{category.tasks.length} 项任务</span></header>
          {category.description && <p className="forcebench-category-description">{category.description}</p>}
          {category.figure && <Figure figure={category.figure} />}
          <div className="forcebench-task-list">
            {category.tasks.map((index, taskIndex) => {
              const task = tasks[index];
              return <article className="forcebench-task" key={task.protocolId}>
                <h4>{category.domain === "真机" ? taskIndex + 1 : index + 1}. {task.englishName}<span>{task.name}</span></h4>
                <dl>
                  <div><dt>任务</dt><dd>{task.goal}</dd></div>
                  <div><dt>物理机制</dt><dd>{task.mechanism}</dd></div>
                  <div><dt>成功判定</dt><dd>{task.scoring}</dd></div>
                </dl>
                {task.parameterSource && <div className="forcebench-task-source"><External href={task.parameterSource}>质量设置 · 官方实现</External></div>}
                {task.criteria?.length > 0 && <details className="forcebench-criteria">
                  <summary>评价细则<span className="forcebench-disclosure-state" aria-hidden="true" /></summary>
                  <div className="forcebench-criteria-content">
                    <ul>{task.criteria.map(text => <li key={text}>{text}</li>)}</ul>
                    <External href={`${reading.source}#A1.SS2`}>判定依据 · 论文附录 A-B</External>
                  </div>
                </details>}
              </article>;
            })}
          </div>
          {category.source && <div className="source-links"><External href={category.source}>{category.locator}</External></div>}
        </section></React.Fragment>)}
        <div className="source-links"><External href={`${reading.source}#S3.SS2`}>任务定义 · 论文 §III-B</External><External href="https://forcebench-platform.github.io/tasks.html">官方任务介绍</External></div>
      </Section>

      <Section index={2}>
        {page.generalization.studies.map((study, index) => <section className="forcebench-evaluation" key={study.title} aria-labelledby={`forcebench-generalization-${index}`}>
          <h3 id={`forcebench-generalization-${index}`}>3.{index + 1} {study.title}</h3>
          {study.rows ? <>
            <EvaluationTable label={study.title} rows={study.rows} />
            <div className="source-links"><External href={study.source}>{study.locator}</External></div>
          </> : <>
            <p>{study.status}</p>
            {study.note && <p className="forcebench-note">{study.note}</p>}
          </>}
        </section>)}
      </Section>

      <Section index={3}>
        <p>{page.robustness.status}</p>
      </Section>

      <Section index={4}>
        <p>{page.expert.introduction}</p>
        <ol className="forcebench-expert-steps">{page.expert.steps.map(text => <li key={text}>{text}</li>)}</ol>
        <p className="forcebench-note">{page.expert.note}</p>
        <div className="source-links"><External href={`${reading.source}#S3.SS3`}>专家演示 · 论文 §III-C</External></div>
      </Section>

      <Section index={5}>
        <div className="forcebench-designs">{page.designs.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        <div className="source-links"><External href="https://forcebench-platform.github.io/">官方项目说明</External><External href={`${reading.source}#A3`}>评价范围 · 论文附录 C</External></div>
      </Section>

      <Section index={6}>
        <ul className="forcebench-limitations">{page.limitations.map(([label, text]) => <li key={label}><strong>{label}：</strong>{text}</li>)}</ul>
        <div className="source-links"><External href={`${reading.source}#A3.SS3`}>适用边界 · 论文附录 C-C</External></div>
      </Section>
      <Section index={7}>
        <BenchmarkUsage b={b} />
      </Section>
    </div>
    <footer className="forcebench-references">
      <External href={b.source}>ForceBench 原始论文</External>
      <External href={b.resourceUrl}>官方项目页</External>
    </footer>
    <section className="personal-section">
      <h2>收藏与研究记录</h2>
      <SaveControls id={`bm-${b.id}`} saved={saved} onSave={save} notes />
    </section>
  </>;
}
