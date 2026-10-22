import React from "react";
import { External, Domains } from "./ui.jsx";

function TaskProtocol({ e, comparison = false }) {
  return (
    <article className="task-protocol" id={"protocol-" + e.id} tabIndex={-1}>
      <header className="protocol-heading">
        <h4>{e.task}</h4>
        <div className="pill-row task-evaluation-modes" aria-label="任务评测方式">
          <Domains w={{ domains: e.evaluationModes || [] }} />
        </div>
      </header>
      <dl>
        <dt>1. {comparison ? "检查什么" : "评测目的"}</dt>
        <dd>{e.purpose}</dd>
        <dt>2. 指标</dt>
        <dd>
          <ul className="task-metrics" aria-label="指标列表">
            {e.metric.split("；").map((metric) => (
              <li key={metric}>{metric}</li>
            ))}
          </ul>
        </dd>
        <dt>3. 设置</dt>
        <dd>{e.setting}</dd>
        <dt>4. 具体方法</dt>
        <dd className="task-method">
          {e.method.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </dd>
      </dl>
      {(!comparison || e.forceEvaluation.status === "reported") && <div className={"force-evaluation " + e.forceEvaluation.status}>
        <strong title="机器人自主执行时，是否用力数据评价执行效果">力相关评测</strong>
        <div>
          <span className="force-status">{e.forceEvaluation.label}</span>
          {e.forceEvaluation.summary && (
            <span>：{e.forceEvaluation.summary}</span>
          )}
          {e.forceEvaluation.scopeNote && <p>{e.forceEvaluation.scopeNote}</p>}
          {e.forceEvaluation.explanation && (
            <div className="force-explanation">
              <p><b>怎么评：</b>{e.forceEvaluation.explanation.method}</p>
              <p><b>比较作用：</b>{e.forceEvaluation.explanation.comparison}</p>
            </div>
          )}
        </div>
      </div>}
      <footer className="protocol-footer">
        <div className="task-source">
          <External href={e.source}>{e.locator}</External>
          {e.coordinationReview && <External href={e.coordinationReview.source}>任务分工依据：{e.coordinationReview.locator}</External>}
        </div>
        {!comparison && <a className="task-peer-link" href={"#tasks/protocol-" + e.id}>
          比较此任务的其他论文 ↗
        </a>}
      </footer>
    </article>
  );
}

export default TaskProtocol;
