import React from "react";
import { useCatalogue } from "../data/catalogue.js";
import { Tag, Domains } from "./ui.jsx";
import { CompareButton, ScreeningTag, CategoryTags } from "./papers.jsx";
import TaskProtocol from "./TaskProtocol.jsx";

export default function TaskComparisonCards({ instances, ...p }) {
  const { byId } = useCatalogue();
  return <div className="task-protocols" aria-label="同任务论文卡片">
    {instances.map(instance => {
      const w = byId.get(instance.work);
      return <article className="protocol-card" key={instance.id}>
        <header>
          <div>
            <div className="paper-title-with-attention">
              <button className="work-name" onClick={() => p.showPaper(w.id)}>{w.name}</button>
              <ScreeningTag w={w} />
            </div>
            <CategoryTags w={w} />
            <div className="pill-row"><Tag>{w.kind}</Tag>
              <Domains w={{ domains: [...new Set(instance.protocols.flatMap(e => e.evaluationModes))] }} />
            </div>
          </div>
          <CompareButton w={w} {...p} />
        </header>
        <div className="experiment-cards linked-protocols">
          {instance.protocols.map(e => <TaskProtocol key={e.id} e={e} />)}
        </div>
        <div className="task-baseline comparison-method-overview">
          <strong>对比实验关注什么</strong>
          {w.comparisonMethods.map(c => <p key={c.id}>{c.question}</p>)}
        </div>
        <button className="subtle-link" onClick={() => p.showPaper(w.id)}>完整论文评测详情 ↗</button>
      </article>;
    })}
  </div>;
}
