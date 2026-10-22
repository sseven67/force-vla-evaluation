import React from "react";
import { External } from "./ui.jsx";

export function EvaluationReferenceTag({ w }) {
  return w.evaluationHighlights.length > 0 ? (
    <span className="evaluation-reference-tag">值得参考</span>
  ) : null;
}

export default function EvaluationHighlights({ w, section }) {
  if (!w?.evaluationHighlights.length) return null;
  const highlights = w.evaluationHighlights.filter(h => !section || (h.section || "tasks") === section);
  if (!highlights.length) return null;
  return (
    <aside className="evaluation-highlights" aria-label="值得参考的评测设计">
      <h4>值得参考的评测设计</h4>
      {highlights.map((h, i) => (
        <article key={i}>
          <h5>{h.title}</h5>
          <p className="highlight-tasks">对应任务：{h.tasks}</p>
          <dl>
            <dt>具体设计</dt>
            <dd style={{ whiteSpace: "pre-line" }}>{h.design}</dd>
            <dt>参考价值</dt>
            <dd>{h.why}</dd>
            <dt>适用边界</dt>
            <dd>{h.boundary}</dd>
          </dl>
          <External href={h.source}>{h.locator} ↗</External>
        </article>
      ))}
    </aside>
  );
}
