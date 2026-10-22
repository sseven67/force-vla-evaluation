import React, { useEffect, useRef, useState } from "react";
import { useCatalogue, isVLA } from "../data/catalogue.js";
import {
  Tag,
  Domains,
  External,
  Attention,
  SaveControls,
} from "./ui.jsx";
import { CompareButton, CategoryTags, ScreeningInfo } from "./papers.jsx";
import { Figure } from "./Figures.jsx";
import TaskProtocol from "./TaskProtocol.jsx";
import ComparisonMethods from "./ComparisonMethods.jsx";
import EvaluationHighlights, { EvaluationReferenceTag } from "./EvaluationHighlights.jsx";

function PaperDetail({ w, ...p }) {
  const { colour, taskById, bmById, getWorkInstances } = useCatalogue();
  const reader = useRef(null);
  const [activeSection, setActiveSection] = useState(0);
  const physical = w.physicalProfile;
  const instances = getWorkInstances(w.id),
    sections = ["论文概况", "评测任务", "对比实验", "结果与局限", "相关资料"];

  useEffect(() => {
    const root = reader.current.closest("dialog");
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActiveSection(Number(visible.target.dataset.section));
    }, { root, rootMargin: "-160px 0px -45% 0px", threshold: 0 });
    reader.current.querySelectorAll("[data-section]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [w.id]);

  function scrollToContent(id) {
    const target = reader.current.querySelector("#" + CSS.escape(id));
    const dialog = reader.current.closest("dialog");
    if (!target || !dialog) return;
    const offset = dialog.querySelector(".dialog-header").offsetHeight
      + reader.current.querySelector(".detail-nav").offsetHeight + 20;
    const top = dialog.scrollTop + target.getBoundingClientRect().top
      - dialog.getBoundingClientRect().top - offset;
    dialog.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    target.focus({ preventScroll: true });
  }

  return (
    <div ref={reader} className="detail-body" style={{ "--color": colour(w) }}>
      <div className="detail-identity">
        <div>
          <div className="pill-row">
            <Tag type={isVLA(w) ? "vla" : "boundary"}>{w.kind}</Tag>
            <Domains w={w} />
            <Tag>{w.year}</Tag>
            <EvaluationReferenceTag w={w} />
          </div>
          <h2>{w.name}</h2>
          <p className="full-title">{w.fullTitle}</p>
          <ScreeningInfo w={w} />
        </div>
        <div className="detail-header-actions">
          <CompareButton w={w} {...p} />
          <External href={w.source}>论文原文</External>
        </div>
      </div>
      <div className="detail-counters"><Attention w={w} full /></div>
      <nav className="detail-nav" aria-label="论文详情章节">
        {sections.map((s, i) => (
          <button
            key={s}
            className={activeSection === i ? "active" : ""}
            aria-current={activeSection === i ? "location" : undefined}
            onClick={() => {
              setActiveSection(i);
              scrollToContent("paper-section-" + i);
            }}
          >
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{s}
          </button>
        ))}
      </nav>
      <section id="paper-section-0" data-section="0" tabIndex={-1}>
        <h3 className="detail-subhead">论文概况</h3>
        <div className="reader-goal">
          <h4>研究目标</h4>
          <ResearchObjective objective={w.researchObjective} />
        </div>
        <dl className="reader-configuration">
          <div>
            <dt>机器人与执行器</dt>
            <dd>
              <strong className="physical-type">{physical.embodimentBrief}</strong>
              {physical.robotModel && <span className="physical-model">机器人：{physical.robotModel}</span>}
              {physical.effectorModel && <span className="physical-model">执行器：{physical.effectorModel}</span>}
            </dd>
          </div>
          <div>
            <dt>力 / 触觉输入</dt>
            <dd>
              <strong className="physical-type">{physical.forceBrief}</strong>
              <span className="physical-model">信号来源：{w.sensorOrigin}</span>
            </dd>
          </div>
          <div className="reader-action">
            <dt>动作输出</dt>
            <dd>{w.actionOutput}</dd>
          </div>
        </dl>
        <div className="reader-taxonomy">
          <span>研究分类</span><CategoryTags w={w} />
        </div>
        <details className="reader-config-notes">
          <summary>版本、信号与分类依据</summary>
          <p>{physical.forceDetail}</p>
          {w.classificationNote && w.classificationNote !== physical.forceDetail && <p>{w.classificationNote}</p>}
          <div className="physical-source">
            <External href={physical.source.url}>本体与信号原文</External>
            <span>{physical.source.locator}</span>
          </div>
        </details>
      </section>
      <section id="paper-section-1" data-section="1" tabIndex={-1}>
        <div className="reader-section-header">
          <h3 className="detail-subhead">评测任务</h3>
          <span className="task-count">{w.experiments.length} 项任务</span>
        </div>
        <details className="reader-task-directory" open={w.experiments.length <= 6}>
          <summary>任务目录<span>点击名称跳转</span></summary>
          <ol className="task-name-list" aria-label="全部评测任务名称">
            {w.experiments.map((e) => (
              <li key={e.id}><button onClick={() => scrollToContent("protocol-" + e.id)}>{e.task}</button></li>
            ))}
          </ol>
        </details>
        {instances.length > 0 && <details className="reader-related-tasks">
          <summary>查找相同任务主题的其他论文</summary>
          <div className="task-chips task-comparison-links">
            {instances.map((i) => (
              <button key={i.id} onClick={() => p.goto("tasks", i.task)}>
                {taskById.get(i.task)?.name} ↗
              </button>
            ))}
          </div>
        </details>}
        <EvaluationHighlights w={w} section="tasks" />
        <div className="experiment-cards">
          {w.experiments.map((e) => (
            <TaskProtocol key={e.id} e={e} />
          ))}
        </div>
        <Figure figure={w.image} />
      </section>
      <section id="paper-section-2" data-section="2" tabIndex={-1}>
        <h3 className="detail-subhead">对比实验</h3>
        <EvaluationHighlights w={w} section="comparison" />
        <ComparisonMethods w={w} />
      </section>
      <section id="paper-section-3" data-section="3" tabIndex={-1}>
        <h3 className="detail-subhead">结果与局限</h3>
        <div className="result-summary">
          <h4>主要结果</h4>
          <p>{w.resultSummary.result}</p>
          <h4>结果的限制</h4>
          <p>{w.resultSummary.limitation}</p>
          <div className="source-links">
            <External href={w.resultSummary.source}>查看论文结果</External>
            <External href={w.resultSummary.limitationSource}>查看实验设置</External>
          </div>
        </div>
      </section>
      <section id="paper-section-4" data-section="4" tabIndex={-1}>
        <h3 className="detail-subhead">Benchmark 来源与公开情况</h3>
        {w.relations.map((r, i) => (
          <div className="related-bench" key={i}>
            <Tag>{r.label}</Tag>
            {bmById.has(r.benchmark) ? <button onClick={() => p.goto("benchmarks", r.benchmark)}>
              {bmById.get(r.benchmark).name} ↗
            </button> : <span>{r.resourceName}</span>}
            <p>{r.note}</p>
          </div>
        ))}
        <div className="release-block">
          {!/待核|未核|尚未/.test(w.openness.status) && <Tag>{w.openness.status}</Tag>}
          {!/待核|未核|尚未|未逐项/.test(w.openness.note) && <p>{w.openness.note}</p>}
          <External href={w.openness.url}>资源入口</External>
        </div>
        <div className="source-links">
          <button
            className="subtle-link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(w.name + "\n" + w.source);
                p.setToast("已复制论文名称与来源链接。");
              } catch {
                p.setToast("浏览器未开放剪贴板，可直接使用原文链接。");
              }
            }}
          >
            复制来源链接
          </button>
          <External href={w.source}>论文原文</External>
          <External href={w.github}>官方代码</External>
          <External href={w.project}>官方项目 / 演示</External>
          {w.arxiv && (
            <External href={"https://arxiv.org/abs/" + w.arxiv}>
              arXiv 元信息
            </External>
          )}
        </div>
        <div className="personal-section">
          <h4>我的阅读记录</h4>
          <SaveControls id={w.id} saved={p.saved} onSave={p.save} notes />
        </div>
      </section>
    </div>
  );
}

function ResearchObjective({ objective }) {
  return (
    <div className="research-objective">
      <p>{objective.text}</p>
      <External href={objective.source}>{objective.locator}依据</External>
    </div>
  );
}

export default PaperDetail;
