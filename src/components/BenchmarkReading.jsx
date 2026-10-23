import React from "react";
import { External, Tag } from "./ui.jsx";
import { useCatalogue } from "../data/catalogue.js";

export default function BenchmarkReading({ b }) {
  const { protocolsById } = useCatalogue();
  const reading = b.reading;
  if (!reading) return null;
  return <div className="benchmark-reading">
    <section className="benchmark-how">
      <h2>怎样测试模型？</h2>
      <dl><dt>输入什么</dt><dd>{reading.inputs}</dd><dt>如何比较</dt><dd><ul>{reading.evaluation.map((text, i) => <li key={i}>{text}</li>)}</ul></dd></dl>
    </section>
    <section className="benchmark-tasks-detail">
      <h2>{reading.taskTitle || "具体任务与评分"}</h2>
      {reading.taskNote && <details className="benchmark-task-note"><summary>任务说明</summary><p>{reading.taskNote}</p></details>}
      {reading.taskGroups.map((group, index) => <section className="benchmark-task-group" key={index}>
        <header><h3>{group.title}</h3><Tag>{group.domain}</Tag></header>
        <div className="benchmark-task-grid" role="table" aria-label={group.title}>
          <div className="benchmark-task-head" role="row"><span role="columnheader">任务</span><span role="columnheader">具体做什么</span><span role="columnheader">怎样判断／评分</span></div>
          {group.items.map((task, i) => <div className="benchmark-task-row" role="row" key={i}>
            <div role="rowheader"><h4>{task.name}</h4>{protocolsById.has(task.protocolId) && <a className="benchmark-task-more" href={'#tasks/protocol-' + task.protocolId}>详细评测与同任务比较 ↗</a>}</div>
            <div role="cell"><span className="benchmark-mobile-label">具体做什么</span><p>{task.goal}</p></div>
            <div role="cell"><span className="benchmark-mobile-label">怎样判断／评分</span><p>{task.scoring}</p></div>
          </div>)}
        </div>
        <div className="benchmark-group-source"><External href={group.source}>{group.locator}</External></div>
      </section>)}
    </section>
    <section className="benchmark-force-purpose"><h2>力在评测中起什么作用？</h2><p>{reading.force}</p><h3>与“夹爪＋末端六维力”的关系</h3><p>{reading.relevance}</p></section>
  </div>;
}
