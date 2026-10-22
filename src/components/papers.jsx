import React from "react";
import { useCatalogue, isResearchFocus } from "../data/catalogue.js";
import { Tag, Domains, Attention, Icon } from "./ui.jsx";
import { EvaluationReferenceTag } from "./EvaluationHighlights.jsx";

export function CategoryTags({ w }) {
  const { groupById } = useCatalogue();
  return (
    <div className="paper-categories" aria-label="论文分类">
      {w.resourceOnly ? (
        <Tag>独立资源</Tag>
      ) : (
        w.categories.map((id) => (
          <Tag key={id} type={id === "gripper-wrench" ? "priority" : ""}>
            {groupById.get(id)?.name}
          </Tag>
        ))
      )}
    </div>
  );
}

export function ScreeningTag({ w }) {
  return (
    <span className={"screening-tag grade-" + w.screening.grade}>
      {w.screening.label}
    </span>
  );
}

export function ForceEvaluationTag({ w }) {
  return w.experiments.some((e) => e.forceEvaluation?.status === "reported") ? (
    <span className="force-evaluation-tag">力相关评测</span>
  ) : null;
}

export function ScreeningInfo({ w }) {
  return <p className="publication-line">{w.screening.timeBasis}</p>;
}

export function SelectionPolicy({ children }) {
  const { D } = useCatalogue();
  const p = D.selectionPolicy;
  return (
    <details className="selection-policy">
      <summary>
        <strong>筛选与排序说明</strong>
        <span>{p.window.label}</span>
      </summary>
      <div>
        {children}
        <p>
          <b>优先考察：</b>
          {p.rules.A}
        </p>
        <p>
          <b>补充参考：</b>
          {p.rules.B}
        </p>
        <p>
          <b>待观察：</b>
          {p.rules.C}
        </p>
        <p>
          年份筛选与优先条件分开：当前可选择近两年或全部年份。较早工作只要符合上面的条件，也标为优先考察。
        </p>
        <ul>
          {p.limitations.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p>
          ①不受Stars或引用多少限制；同时属于①和其他类别的工作按①纳入。其他三个方向的两个热度条件满足任意一个即可。
        </p>
      </div>
    </details>
  );
}

export function CompareButton({ w, selected, compare }) {
  const yes = selected.includes(w.id);
  return (
    <button
      className={"compare-toggle " + (yes ? "selected" : "")}
      aria-pressed={yes}
      onClick={() => compare(w.id)}
    >
      {yes ? "✓ 已选" : "＋ 对比"}
    </button>
  );
}

export function BimanualTaskNote({ w }) {
  const evaluation = w.bimanualEvaluation;
  if (evaluation?.type !== "cooperative") return null;
  const tasks = w.experiments.filter((e) => evaluation.taskIds.includes(e.id));
  return (
    <div className="bimanual-task-note">
      <p><strong>双臂协作示例：</strong>{tasks.map((e) => e.task).join("、")}</p>
      <p>{evaluation.description}</p>
    </div>
  );
}

export function PaperCard({ w, showBimanualTasks = false, ...p }) {
  const { colour, taskById, getWorkInstances } = useCatalogue();
  const bimanualTaskIds = new Set(w.bimanualEvaluation?.taskIds || []);
  const tasks = getWorkInstances(w.id).filter(
    (i) => !showBimanualTasks || i.protocols.some((e) => bimanualTaskIds.has(e.id)),
  ).slice(0, 4);
  const bookmarked = Boolean(p.saved[w.id]?.bookmark);
  return (
    <article className="work-card" style={{ "--color": colour(w) }}>
      <div className="card-meta"><span>{w.year} <span aria-hidden="true">/</span> {w.kind}</span><button className={"card-bookmark " + (bookmarked ? "selected" : "")} aria-label={(bookmarked ? "取消收藏" : "收藏") + w.name} aria-pressed={bookmarked} onClick={() => p.save(w.id, { bookmark: !bookmarked })}><Icon type="bookmark" /></button></div>
      <div className="card-title">
        <h3>
        <button className="work-name" onClick={() => p.showPaper(w.id)}>
          {w.name}
        </button>
        </h3>
      </div>
      <p className="card-summary">{w.summary}</p>
      <div className="card-title-badges">
          {isResearchFocus(w) ? (
            <Tag type="priority">研究重点</Tag>
          ) : (
            <ScreeningTag w={w} />
          )}
          <ForceEvaluationTag w={w} />
          <EvaluationReferenceTag w={w} />
        </div>
      <CategoryTags w={w} />
      <div className="card-task-heading"><span>{showBimanualTasks ? "双臂协作任务" : "评测任务"}</span><div className="pill-row">
        <Domains w={w} />
      </div></div>
      <div className="task-chips">
        {tasks.map((i) => (
          <button key={i.id} onClick={() => p.goto("tasks", i.task)}>
            {taskById.get(i.task)?.name}
          </button>
        ))}
        {!tasks.length && <span>{showBimanualTasks
          ? w.experiments.filter((e) => bimanualTaskIds.has(e.id)).map((e) => e.task).join("、")
          : w.tasks}</span>}
      </div>
      <div className="card-attention">
        {showBimanualTasks && <BimanualTaskNote w={w} />}
        <Attention w={w} />
      </div>
      <div className="card-bottom">
        <button onClick={() => p.showPaper(w.id)}>查看论文与评测详情 <Icon type="arrow" /></button>
        <CompareButton w={w} {...p} />
      </div>
    </article>
  );
}
