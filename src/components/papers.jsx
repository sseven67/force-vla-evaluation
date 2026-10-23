import React from "react";
import { useCatalogue } from "../data/catalogue.js";
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
  if (!w.screening.highAttention) return null;
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

export function SelectionPolicy() {
  return (
    <details className="selection-policy">
      <summary>
        <strong>筛选规则</strong>
      </summary>
      <div>
        <ul>
          <li>较高关注：原文和评测可查；六维力＋夹爪采用较低热度门槛，其他VLA要求更高，非VLA仅保留高关注代表。</li>
          <li>默认显示全部论文，按 Google Scholar 引用降序；Stars 作为补充，“—”表示缺失。关注度不代表实验可靠性。</li>
        </ul>
      </div>
    </details>
  );
}

export function CompareButton({ w, selected, compare }) {
  if (w.resourceOnly) return null;
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
      <div className="card-title paper-title-with-attention">
        <h3>
        <button className="work-name" onClick={() => p.showPaper(w.id)}>
          {w.name}
        </button>
        </h3>
        <ScreeningTag w={w} />
      </div>
      <p className="card-summary">{w.summary}</p>
      <div className="card-title-badges">
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
