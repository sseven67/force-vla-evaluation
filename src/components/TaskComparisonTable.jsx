import React from "react";
import { useCatalogue, num } from "../data/catalogue.js";
import { Domains, External } from "./ui.jsx";
import { CompareButton, ScreeningTag } from "./papers.jsx";
import { EvaluationReferenceTag } from "./EvaluationHighlights.jsx";
import TaskProtocol from "./TaskProtocol.jsx";

export default function TaskComparisonTable({ instances, ...p }) {
  const { byId } = useCatalogue();
  return <>
    <p className="compact-table-note" id="task-table-note">
      展开查看设置、评分与原文。
    </p>
    <div className="table-wrap work-table-wrap" role="region" tabIndex={0}
      aria-label="同任务论文紧凑对照表" aria-describedby="task-table-note">
      <table className="work-table task-comparison-table" aria-label="同任务论文紧凑对照">
        <colgroup>{[25, 37, 26, 12].map((width, i) => <col key={i} style={{ width: width + "%" }} />)}</colgroup>
        <thead><tr>{["论文", "任务与评分", "力 / 触觉", "比较"].map(name => <th scope="col" key={name}>{name}</th>)}</tr></thead>
        <tbody>{instances.map(instance => {
          const w = byId.get(instance.work);
          return <tr key={instance.id}>
            <td data-label="论文">
              <button className="work-name" onClick={() => p.showPaper(w.id)}>{w.name}</button>
              <div className="table-paper-meta"><span>{w.year} · {w.kind}</span><ScreeningTag w={w} /><EvaluationReferenceTag w={w} /></div>
              <div className="task-table-attention">{[
                ["Scholar", w.attention.googleScholar, w.attention.googleScholarSource],
                ["Stars", w.attention.stars, w.github],
              ].map(([label, value, href]) => href ?
                <External key={label} href={href}>{label} {num(value)}</External> :
                <span key={label}>{label} {num(value)}</span>)}</div>
              <button className="table-task-more" onClick={() => p.showPaper(w.id)}>完整论文评测 ↗</button>
            </td>
            <td data-label="任务与评分">{instance.protocols.map(e => <div className="task-table-entry" key={e.id}>
              <strong>{e.task}</strong>
              <div className="pill-row table-domains"><Domains w={{ domains: e.evaluationModes }} /></div>
              <ul className="table-task-list">{e.metric.split("；").map(metric => <li key={metric}>{metric}</li>)}</ul>
              <details className="task-table-details"><summary>设置、具体方法与原文</summary><TaskProtocol e={e} comparison /></details>
            </div>)}</td>
            <td data-label="力 / 触觉">
              <p className="table-signal">{w.physicalProfile.forceBrief}</p>
              {instance.protocols.map(e => <div className="task-table-force" key={e.id}>
                {instance.protocols.length > 1 && <strong>{e.task}</strong>}
                <span className={e.forceEvaluation.status === "reported" ? "task-force-reported" : ""}>
                  力相关评测：{e.forceEvaluation.label}
                </span>
                {e.forceEvaluation.summary && <p>{e.forceEvaluation.summary}</p>}
              </div>)}
            </td>
            <td data-label="比较"><CompareButton w={w} {...p} /></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </>;
}
