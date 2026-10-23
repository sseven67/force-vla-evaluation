import React from "react";
import { External } from "./ui.jsx";
import TaskProtocol from "./TaskProtocol.jsx";

export default function ComparisonMethods({ w }) {
  return <div className="comparison-methods">
    {w.comparisonMethods.map((card) => <article className="comparison-method-card" key={card.id}>
      <h4>{card.question}</h4>
      <table aria-label={card.question}>
        <tbody>{[
          ["比较对象", card.objects],
          ["测试任务", card.tasks],
          ["相同条件", card.controlled],
          ["怎样比较", card.evaluation],
        ].map(([label, text]) => <tr key={label}><th scope="row">{label}</th><td>{text}</td></tr>)}</tbody>
      </table>
      <p className="comparison-lesson"><strong>比较重点</strong><span>{card.lesson}</span></p>
      {card.checks?.length > 0 && <details className="comparison-method-note">
        <summary>具体测试设置与计分（{card.checks.length}项）</summary>
        <div className="experiment-cards">
          {card.checks.map(e => <TaskProtocol key={e.id} e={e} comparison />)}
        </div>
      </details>}
      <details className="comparison-method-note">
        <summary>补充说明与原文</summary>
        <p>{card.note}</p>
        <External href={card.source}>{card.locator} 原文 ↗</External>
      </details>
    </article>)}
  </div>;
}
