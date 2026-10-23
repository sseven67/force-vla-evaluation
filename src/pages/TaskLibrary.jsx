import React, { useEffect, useMemo, useState } from "react";
import { useCatalogue } from "../data/catalogue.js";
import {
  PageIntro,
  External,
  Filter,
  Icon,
} from "../components/ui.jsx";
import { CategoryVisual, TaskSketch } from "../components/Figures.jsx";
import {
  DEFAULT_WORK_FILTERS,
  filterTaskInstances,
  createTaskView,
  getTaskTopicName,
  getTaskKindOptions,
  filterTaskKindInstances,
  YEAR_OPTIONS,
} from "../data/selectors.js";
import PaperScopeNavigation from "../components/PaperScopeNavigation.jsx";
import CoverageMatrix from "../components/CoverageMatrix.jsx";
import TaskComparisonTable from "../components/TaskComparisonTable.jsx";
import TaskComparisonCards from "../components/TaskComparisonCards.jsx";
import TaskKindNavigation from "../components/TaskKindNavigation.jsx";

function TaskLibrary({ item, ...p }) {
  const catalogue = useCatalogue();
  const { D, byId, taskById, protocolsById, getRelatedProtocols } = catalogue;

  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [matrix, setMatrix] = useState(false);
  const [sort, setSort] = useState("googleScholar");
  const [taskLayout, setTaskLayout] = useState("cards");
  const [kindSelection, setKindSelection] = useState({ topic: item, kind: "" });
  const selectedKind = kindSelection.topic === item ? kindSelection.kind : "";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setFilters] = useState(() => ({
    ...DEFAULT_WORK_FILTERS,
    period: "all",
  }));
  const setFilter = (key, value) =>
    setFilters((previous) => ({ ...previous, [key]: value }));
  const reset = () => {
    setFilters(DEFAULT_WORK_FILTERS);
    setQuery("");
    setCategory("");
    setSort("googleScholar");
    p.goto("tasks");
  };
  const selectedProtocol = item?.startsWith("protocol-")
    ? protocolsById.get(item.slice(9))
    : null;
  const task = selectedProtocol
    ? { id: item, name: selectedProtocol.task }
    : taskById.get(item);
  useEffect(() => {
    if (category && task && !selectedProtocol && !task.groups?.includes(category)) {
      setCategory("");
    }
  }, [item, category, task, selectedProtocol]);
  useEffect(() => {
    setKindSelection({ topic: item, kind: "" });
    if (item) {
      setTaskLayout("cards");

      setMatrix(false);
    }
  }, [item]);
  const savedForFilters = f.bookmarks ? p.saved : null;
  const selection = useMemo(
    () => ({ query, filters: f, saved: savedForFilters }),
    [query, f, savedForFilters],
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
  const topicInstances = useMemo(
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
  const kindOptions = getTaskKindOptions(task, topicInstances);
  const hasKinds = kindOptions.length > 1;
  const instances = filterTaskKindInstances(topicInstances, selectedKind);
  const sortedInstances = [...instances].sort((a, b) => {
    const wa = byId.get(a.work), wb = byId.get(b.work);
    return sort === "name" ? wa.name.localeCompare(wb.name) :
      sort === "year" ? wb.year - wa.year :
      (wb.attention[sort] ?? -1) - (wa.attention[sort] ?? -1) || wb.year - wa.year;
  });
  return (
    <>
      <PageIntro
        eyebrow="EVALUATION TASKS / 按任务交叉阅读"
        title="围绕同一个任务，比较不同评测。"
      >
        选择任务，查看哪些论文做过，以及各自怎样测试和评分。同名任务的成功标准和测试条件可能不同。
      </PageIntro>
      <section className="library-panel" aria-label="任务搜索与筛选">
      <PaperScopeNavigation value={f.scope} onChange={value => setFilter("scope", value)} period={f.period} />
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
            allValue="all"
            options={YEAR_OPTIONS}
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
            label="小分类"
            value={!selectedProtocol && task ? task.id : ""}
            onChange={(v) => p.goto("tasks", v || undefined)}
            options={types.map((t) => [t.id, t.name])}
          />
          <div className="filter-toggles">
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
            <label className="check-filter">
              <input
                type="checkbox"
                checked={f.bimanualCooperation}
                onChange={(e) => setFilter("bimanualCooperation", e.target.checked)}
              />
              双臂协作任务
            </label>
            <button className="reset" onClick={reset}>
              重置
            </button>
          </div>
        </div>
      </div>
      </section>
      {!task && <div className="tasks-controls">
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
      </div>}
      {matrix && !task ? (
        <CoverageMatrix
          {...p}
          rows={[...matrixRows].sort((a, b) => (b.attention.googleScholar ?? -1) - (a.attention.googleScholar ?? -1))}
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
              <h2>{getTaskTopicName(task, instances)}</h2>
              <p>
                {instances.length} 项论文记录 · 逐篇保留指标、测试次数与原文位置
              </p>
            </div>
            <div className="task-view-controls"><label className="task-table-sort">排序
              <select aria-label="任务论文排序" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="stars">GitHub Stars ↓</option>
                <option value="googleScholar">Google Scholar 引用 ↓</option>
                <option value="citations">OpenAlex 引用 ↓</option>
                <option value="year">年份 ↓</option>
                <option value="name">名称</option>
              </select>
            </label>
              <div className="tasks-controls task-layout-toggle" role="group" aria-label="任务展示方式">
                <button className={taskLayout === "cards" ? "active" : ""} aria-pressed={taskLayout === "cards"} onClick={() => setTaskLayout("cards")}><Icon type="grid" />卡片</button>
                <button className={taskLayout === "compact" ? "active" : ""} aria-pressed={taskLayout === "compact"} onClick={() => setTaskLayout("compact")}><Icon type="list" />紧凑对照</button>
              </div>
            </div>
          </div>
          {hasKinds && task.description && <p className="task-topic-description">{task.description}</p>}
          <div className={"task-detail-layout" + (hasKinds ? " has-kinds" : "")}>
            {hasKinds && <TaskKindNavigation options={kindOptions} value={selectedKind}
              total={topicInstances.reduce((n, record) => n + record.protocols.length, 0)}
              onChange={kind => setKindSelection({ topic: item, kind })} />}
            <section className="task-detail-results" aria-label="筛选后的任务评测">
              {hasKinds && <p className="task-kind-result-count" role="status" aria-live="polite" aria-atomic="true">
                {selectedKind ? kindOptions.find(kind => kind.id === selectedKind)?.name : "全部任务"}
                <span>{instances.length} 项论文记录 · {instances.reduce((n, record) => n + record.protocols.length, 0)} 条评测</span>
              </p>}
          <>
            {selectedProtocol && instances.length === 1 && (
              <p className="mini-note">
                当前仅1篇匹配论文。
              </p>
            )}
          </>
          {instances.length === 0 && (
            <div className="empty">
              <h2>没有符合条件的论文记录</h2>
              <p>请调整本体与力觉分类或上方筛选条件。</p>
            </div>
          )}
          {instances.length > 0 && (taskLayout === "cards"
            ? <TaskComparisonCards instances={sortedInstances} {...p} />
            : <TaskComparisonTable instances={sortedInstances} {...p} />)}
            </section>
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
                      {ts.length} 个小分类 · {workCount} 项相关工作
                    </small>
                    <div className="task-chips">
                      {ts.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setCategory(g.id); p.goto("tasks", t.id); }}
                        >
                          {t.name}{" "}
                          <span>{getVisibleInstances(t.id, g.id).length}</span>
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
                : "全部小分类"}
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
