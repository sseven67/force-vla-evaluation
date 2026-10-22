import React, { useEffect, useMemo, useState } from "react";
import { useCatalogue } from "../data/catalogue.js";
import {
  PageIntro,
  Tag,
  Domains,
  External,
  Filter,
  Icon,
} from "../components/ui.jsx";
import { CompareButton, ScreeningTag, CategoryTags } from "../components/papers.jsx";
import { CategoryVisual, TaskSketch } from "../components/Figures.jsx";
import {
  DEFAULT_WORK_FILTERS,
  filterTaskInstances,
  createTaskView,
} from "../data/selectors.js";
import CoverageMatrix from "../components/CoverageMatrix.jsx";
import TaskProtocol from "../components/TaskProtocol.jsx";

function TaskLibrary({ item, ...p }) {
  const catalogue = useCatalogue();
  const { D, byId, taskById, protocolsById, getRelatedProtocols } = catalogue;

  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [matrix, setMatrix] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [onlyPriority, setOnlyPriority] = useState(
    !item?.startsWith("protocol-"),
  );
  const [f, setFilters] = useState(() => ({
    ...DEFAULT_WORK_FILTERS,
    period: item?.startsWith("protocol-") ? "all" : "recent",
  }));
  const setFilter = (key, value) =>
    setFilters((previous) => ({ ...previous, [key]: value }));
  const reset = () => {
    setFilters(DEFAULT_WORK_FILTERS);
    setQuery("");
    setCategory("");
    setOnlyPriority(true);
    p.goto("tasks");
  };
  const selectedProtocol = item?.startsWith("protocol-")
    ? protocolsById.get(item.slice(9))
    : null;
  const task = selectedProtocol
    ? { id: item, name: selectedProtocol.task }
    : taskById.get(item);
  useEffect(() => {
    if (item?.startsWith("protocol-")) {
      setOnlyPriority(false);
      setFilters((previous) => ({ ...previous, period: "all", kind: "" }));
      setMatrix(false);
    }
  }, [item]);
  const savedForFilters = f.bookmarks ? p.saved : null;
  const selection = useMemo(
    () => ({ query, filters: f, onlyPriority, saved: savedForFilters }),
    [query, f, onlyPriority, savedForFilters],
  );
  const visibleInstances = useMemo(
    () => filterTaskInstances(catalogue, D.taskInstances, selection),
    [catalogue, D.taskInstances, selection],
  );
  const {
    types,
    groups,
    getVisibleInstances,
    matrixTypes,
    matrixRows,
    hasMatrixTask,
  } = useMemo(
    () =>
      createTaskView(catalogue, visibleInstances, {
        category,
        task,
        selectedProtocol,
      }),
    [catalogue, visibleInstances, category, task?.id, selectedProtocol],
  );
  const instances = useMemo(
    () =>
      selectedProtocol
        ? filterTaskInstances(
            catalogue,
            getRelatedProtocols(selectedProtocol.id),
            selection,
          )
        : task
          ? getVisibleInstances(task.id)
          : [],
    [
      catalogue,
      getRelatedProtocols,
      selectedProtocol,
      selection,
      task?.id,
      getVisibleInstances,
    ],
  );
  return (
    <>
      <PageIntro
        eyebrow="EVALUATION TASKS / 按任务交叉阅读"
        title="围绕同一个任务，比较不同评测。"
      >
        选择任务，查看哪些论文做过，以及各自怎样测试和评分。同名任务的成功标准和测试条件可能不同。
      </PageIntro>
      <div className="toolbar">
        <div className="search-field">
          <Icon type="search" />
          <input
            id="task-work-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="任务名、擦白板、USB、力指标、论文名…"
            aria-label="搜索评测任务与论文"
          />
          <button aria-label="清空搜索" onClick={() => setQuery("")}>
            <Icon type="close" />
          </button>
        </div>
        <button
          className="mobile-filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="task-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <span>筛选条件 · 时间、方向、环境</span>
          <span>{filtersOpen ? "收起 −" : "展开 ＋"}</span>
        </button>
        <div
          id="task-filters"
          className={
            "filters paper-filters " + (filtersOpen ? "" : "mobile-collapsed")
          }
        >
          <Filter
            label="时间范围"
            value={f.period}
            onChange={(v) => setFilter("period", v || "all")}
            options={[
              ["recent", "近两年（含正式发表）"],
              ["all", "全部年份 / 前序"],
            ]}
          />
          <Filter
            label="本体与力觉分类"
            value={f.category}
            onChange={(v) => setFilter("category", v)}
            options={D.groups.map((g) => [g.id, g.name])}
          />
          <Filter
            label="研究层级"
            value={f.kind}
            onChange={(v) => setFilter("kind", v)}
            options={[
              ["VLA", "VLA / VTLA"],
              ["policy", "相邻控制策略"],
            ]}
          />
          <Filter
            label="环境"
            value={f.domain}
            onChange={(v) => setFilter("domain", v)}
            options={["真机", "仿真", "离线"].map((x) => [x, x])}
          />
          <Filter
            label="任务主题"
            value={!selectedProtocol && task ? task.id : ""}
            onChange={(v) => p.goto("tasks", v || undefined)}
            options={D.taskTypes.map((t) => [t.id, t.name])}
          />
          <div className="filter-toggles">
            <label className="check-filter">
              <input
                type="checkbox"
                checked={onlyPriority}
                onChange={(e) => setOnlyPriority(e.target.checked)}
              />
              优先考察
            </label>
            <label className="check-filter">
              <input
                type="checkbox"
                checked={f.reference}
                onChange={(e) => setFilter("reference", e.target.checked)}
              />
              值得参考
            </label>
            <label className="check-filter">
              <input
                type="checkbox"
                checked={f.forceEvaluation}
                onChange={(e) => setFilter("forceEvaluation", e.target.checked)}
              />
              力相关评测
            </label>
            <label className="check-filter">
              <input
                type="checkbox"
                checked={f.bookmarks}
                onChange={(e) => setFilter("bookmarks", e.target.checked)}
              />
              收藏
            </label>
            <button className="reset" onClick={reset}>
              重置
            </button>
          </div>
        </div>
      </div>
      <p className="mini-note">
        环境和力相关评测按具体任务筛选；时间范围、值得参考和收藏按所属论文筛选。所有条件同时生效。
      </p>
      <div className="tasks-controls">
        <button
          className={!matrix ? "active" : ""}
          aria-pressed={!matrix}
          onClick={() => setMatrix(false)}
        >
          任务分类
        </button>
        <button
          className={matrix ? "active" : ""}
          aria-pressed={matrix}
          onClick={() => setMatrix(true)}
        >
          论文 × 任务覆盖矩阵
        </button>
      </div>
      {matrix ? (
        <CoverageMatrix
          {...p}
          rows={matrixRows}
          taskTypes={matrixTypes}
          hasTask={hasMatrixTask}
        />
      ) : task ? (
        <>
          <button className="back-link" onClick={() => p.goto("tasks")}>
            ← 返回任务类型
          </button>
          <div className="task-detail-heading">
            <div>
              <h2>{task.name}</h2>
              <p>
                {instances.length} 项论文记录 · 逐篇保留指标、测试次数与原文位置
              </p>
            </div>
            <Tag>同任务主题 ≠ 同 Benchmark</Tag>
          </div>
          <div className="metric-disclaimer">
            指标列出评分项目，具体方法说明怎样判断、测量和计分。
          </div>
          <>
            {selectedProtocol && instances.length === 1 && (
              <p className="mini-note">
                当前目录尚未收录可对照的其他论文；以下保留此任务原始评测信息。
              </p>
            )}
          </>
          {instances.length === 0 && (
            <div className="empty">
              <h2>没有符合条件的论文记录</h2>
              <p>请调整本体与力觉分类或上方筛选条件。</p>
            </div>
          )}
          <div className="task-protocols">
            {instances.map((i) => {
              const w = byId.get(i.work);
              return (
                <article className="protocol-card" key={i.id}>
                  <header>
                    <div>
                      <button
                        className="work-name"
                        onClick={() => p.showPaper(w.id)}
                      >
                        {w.name}
                      </button>
                      <CategoryTags w={w} />
                      <div className="pill-row">
                        <Tag>{w.kind}</Tag>
                        <ScreeningTag w={w} />
                        <Domains w={w} />
                      </div>
                    </div>
                    <CompareButton w={w} {...p} />
                  </header>
                  <div className="experiment-cards linked-protocols">
                    {i.protocols.map((e) => (
                      <TaskProtocol key={e.id} e={e} />
                    ))}
                  </div>
                  <div className="task-baseline comparison-method-overview">
                    <strong>对比实验关注什么</strong>
                    {w.comparisonMethods.map((c) => (
                      <p key={c.id}>{c.question}</p>
                    ))}
                  </div>
                  <button
                    className="subtle-link"
                    onClick={() => p.showPaper(w.id)}
                  >
                    完整论文评测详情 ↗
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="task-category-grid">
            {groups.map(({ group: g, topics: ts, workCount }) => {
              return (
                <article
                  className={
                    "task-category " + (category === g.id ? "chosen" : "")
                  }
                  key={g.id}
                  style={{ "--color": g.color }}
                >
                  <button
                    className="category-image"
                    aria-label={"筛选" + g.name}
                    onClick={() => setCategory(category === g.id ? "" : g.id)}
                  >
                    {g.image ? (
                      <CategoryVisual group={g} />
                    ) : (
                      <TaskSketch type={g.icon} />
                    )}
                  </button>
                  {g.image && (
                    <div className="image-credit">
                      <External href={g.image.source}>
                        {g.image.caption}
                      </External>
                    </div>
                  )}
                  <div className="category-content">
                    <button
                      onClick={() => setCategory(category === g.id ? "" : g.id)}
                    >
                      <h2>{g.name}</h2>
                    </button>
                    <p>{g.description}</p>
                    <small>
                      {ts.length} 个任务主题 · {workCount} 项相关工作
                    </small>
                    <div className="task-chips">
                      {ts.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => p.goto("tasks", t.id)}
                        >
                          {t.name}{" "}
                          <span>{getVisibleInstances(t.id).length}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="task-search-row">
            <h2>
              {category
                ? D.taskGroups.find((g) => g.id === category)?.name
                : "全部任务主题"}
            </h2>
            {category && (
              <button onClick={() => setCategory("")}>清除分类</button>
            )}
          </div>
          {types.length === 0 && (
            <div className="empty">
              <h2>没有符合条件的评测任务</h2>
              <p>请调整搜索或筛选条件。</p>
            </div>
          )}
          <div className="task-topic-list">
            {types.map((t) => (
              <button key={t.id} onClick={() => p.goto("tasks", t.id)}>
                <span>{t.name}</span>
                <small>{getVisibleInstances(t.id).length} 项论文记录</small>
                <span>↗</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default TaskLibrary;
