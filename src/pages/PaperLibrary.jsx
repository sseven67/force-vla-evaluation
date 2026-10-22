import React, { useMemo, useState } from "react";
import { useCatalogue, isResearchFocus, isBench, num } from "../data/catalogue.js";
import {
  PageIntro,
  Filter,
  External,
  Domains,
  Icon,
} from "../components/ui.jsx";
import { selectPapers } from "../data/selectors.js";
import { EvaluationReferenceTag } from "../components/EvaluationHighlights.jsx";
import {
  SelectionPolicy,
  PaperCard,
  CompareButton,
  BimanualTaskNote,
} from "../components/papers.jsx";

function PaperLibrary({
  q,
  setQ,
  filters: f,
  fp,
  reset,
  sort,
  setSort,
  layout,
  setLayout,
  ...p
}) {
  const catalogue = useCatalogue();
  const { D, PAPERS } = catalogue;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = [
    q && { label: `搜索：${q}`, clear: () => setQ("") },
    f.category && {
      label: D.groups.find((g) => g.id === f.category)?.name,
      clear: () => fp("category", ""),
    },
    f.kind && {
      label: f.kind === "VLA" ? "VLA / VTLA" : "相邻控制策略",
      clear: () => fp("kind", ""),
    },
    f.domain && { label: `${f.domain}评测`, clear: () => fp("domain", "") },
    f.task && {
      label: D.taskTypes.find((t) => t.id === f.task)?.name,
      clear: () => fp("task", ""),
    },
    f.reference && { label: "值得参考", clear: () => fp("reference", false) },
    f.forceEvaluation && {
      label: "力相关评测",
      clear: () => fp("forceEvaluation", false),
    },
    f.bimanualCooperation && {
      label: "双臂协作任务",
      clear: () => fp("bimanualCooperation", false),
    },
    f.bookmarks && { label: "我的收藏", clear: () => fp("bookmarks", false) },
  ].filter(Boolean);

  const savedForFilters = f.bookmarks ? p.saved : null;
  const ws = useMemo(
    () =>
      selectPapers(catalogue, {
        query: q,
        filters: f,
        sort,
        saved: savedForFilters,
      }),
    [catalogue, q, f, sort, savedForFilters],
  );
  return (
    <>
      <PageIntro
        eyebrow="RESEARCH LIBRARY / 论文与评测"
        title="从一篇论文，读懂它怎样评测。"
        aside={
          <div className="library-stats" aria-label="研究目录概况">
            <div>
              <strong>{PAPERS.length}</strong>
              <span>方法论文</span>
            </div>
            <div>
              <strong>{D.taskTypes.length}</strong>
              <span>任务主题</span>
            </div>
            <button onClick={() => p.goto("benchmarks")}>
              <strong>{D.benchmarks.filter(isBench).length}</strong>
              <span>
                评测基准 <Icon type="arrow" />
              </span>
            </button>
          </div>
        }
      >
        聚焦力觉与触觉机器人研究，查找论文、阅读评测，横向比较任务、指标与实验设置。
      </PageIntro>
      <section className="library-panel" aria-label="论文搜索与筛选">
        <div className="library-overline">
          <div className="scope-pills" role="group" aria-label="论文范围">
            <button
              className={f.scope === "priority" ? "active" : ""}
              aria-pressed={f.scope === "priority"}
              onClick={() => fp("scope", "priority")}
            >
              优先考察{" "}
              <b>
                {
                  PAPERS.filter(
                    (w) =>
                      w.screening.grade === "A" &&
                      (f.period !== "recent" || w.screening.inWindow),
                  ).length
                }
              </b>
            </button>
            <button
              className={f.scope === "focus" ? "active" : ""}
              aria-pressed={f.scope === "focus"}
              onClick={() => fp("scope", "focus")}
            >
              ① 研究重点优先{" "}
              <b>
                {
                  PAPERS.filter(
                    (w) =>
                      isResearchFocus(w) &&
                      w.screening.grade === "A" &&
                      (f.period !== "recent" || w.screening.inWindow),
                  ).length
                }
              </b>
            </button>
            <button
              className={f.scope === "all" ? "active" : ""}
              aria-pressed={f.scope === "all"}
              onClick={() => {
                fp({ scope: "all", period: "all" });
              }}
            >
              全部论文 <b>{PAPERS.length}</b>
            </button>
          </div>
          <span className="scope-tally">按阅读优先级浏览</span>
        </div>
        <div className="toolbar">
          <div className="search-field">
            <Icon type="search" />
            <input
              id="work-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="论文名、USB、擦白板、峰值力、去力消融…"
              aria-label="搜索论文"
            />
            {q ? (
              <button aria-label="清空搜索" onClick={() => setQ("")}>
                <Icon type="close" />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </div>
          <button
            className="mobile-filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="paper-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <span>
              筛选条件
              {activeFilters.length > 0
                ? ` · ${activeFilters.length} 项已选`
                : " · 时间、方向、环境"}
            </span>
            <span>{filtersOpen ? "收起 −" : "展开 ＋"}</span>
          </button>
          <div
            id="paper-filters"
            className={
              "filters paper-filters " + (filtersOpen ? "" : "mobile-collapsed")
            }
          >
            <Filter
              label="时间范围"
              value={f.period}
              onChange={(v) => fp("period", v || "all")}
              options={[
                ["recent", "近两年（含正式发表）"],
                ["all", "全部年份 / 前序"],
              ]}
            />
            <Filter
              label="本体与力觉分类"
              value={f.category}
              onChange={(v) => fp("category", v)}
              options={D.groups.map((g) => [g.id, g.name])}
            />
            <Filter
              label="研究层级"
              value={f.kind}
              onChange={(v) => fp("kind", v)}
              options={[
                ["VLA", "VLA / VTLA"],
                ["policy", "相邻控制策略"],
              ]}
            />
            <Filter
              label="环境"
              value={f.domain}
              onChange={(v) => {
                fp(
                  v
                    ? { domain: v, scope: "all", period: "all" }
                    : { domain: v },
                );
              }}
              options={["真机", "仿真", "离线"].map((x) => [x, x])}
            />
            <Filter
              label="任务"
              value={f.task}
              onChange={(v) => fp("task", v)}
              options={D.taskTypes.map((t) => [t.id, t.name])}
            />
            <div className="filter-toggles">
              <label className="check-filter">
                <input
                  type="checkbox"
                  checked={f.reference}
                  onChange={(e) => fp("reference", e.target.checked)}
                />
                值得参考
              </label>
              <label className="check-filter">
                <input
                  type="checkbox"
                  checked={f.forceEvaluation}
                  onChange={(e) => fp("forceEvaluation", e.target.checked)}
                />
                力相关评测
              </label>
              <label className="check-filter">
                <input
                  type="checkbox"
                  checked={f.bookmarks}
                  onChange={(e) => fp("bookmarks", e.target.checked)}
                />
                收藏
              </label>
              <label
                className="check-filter"
                title="实际评测过两条机械臂配合完成的任务；不限力觉形式，包含一臂固定物体、另一臂操作。"
              >
                <input
                  type="checkbox"
                  checked={f.bimanualCooperation}
                  onChange={(e) => fp("bimanualCooperation", e.target.checked)}
                />
                双臂协作任务
              </label>
              <button className="reset" onClick={() => reset()}>
                重置
              </button>
            </div>
          </div>
        </div>
        <SelectionPolicy>
          <p>
            环境按各任务的评测方式筛选：包含离线实验即可匹配“离线”，同一论文可同时包含真机、仿真与离线评测。一篇论文可归入多类，各类数量不相加。
          </p>
          <p>
            默认按 GitHub Stars 排序，也可切换 Google Scholar 引用、OpenAlex 收录引用或
            Forks。未取得的数值以“—”表示，0 只表示平台返回
            0；关注度不代表论文质量。
          </p>
        </SelectionPolicy>
      </section>
      {activeFilters.length > 0 && (
        <div className="active-filters" aria-label="当前筛选条件">
          <span>已筛选</span>
          {activeFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={filter.clear}
              aria-label={`移除筛选：${filter.label}`}
            >
              {filter.label}
              <Icon type="close" />
            </button>
          ))}
        </div>
      )}
      {f.domain && (
        <div className="resource-shortcut">
          <span>当前查看含{f.domain}评测的论文。</span>
          <button
            className="reset"
            onClick={() => {
              reset({ scope: "all", period: "all", domain: f.domain });
            }}
          >
            显示全部含{f.domain}评测的论文
          </button>
          <button
            onClick={() =>
              p.goto(
                "benchmarks",
                f.domain === "离线"
                  ? "offline"
                  : f.domain === "仿真"
                    ? "sim"
                    : "real",
              )
            }
          >
            含{f.domain}评测的基准{" "}
            {
              D.benchmarks.filter(
                (b) => isBench(b) && b.domain.includes(f.domain),
              ).length
            }{" "}
            项 ↗
          </button>
        </div>
      )}
      {f.reference && (
        <p className="reference-filter-note">
          只标出少量有具体理由的评测设计，详情中列出任务、做法和参考价值。此项与其他筛选条件叠加。
        </p>
      )}
      {f.bimanualCooperation && (
        <p className="reference-filter-note">
          纳入标准：两条机器人臂配合完成同一任务；排除仅使用双臂平台或两臂各自独立操作。不要求查清左右臂的详细分工，也不要求两臂同时运动、都由学习策略控制或读取双侧六维力。人手辅助及示教主从臂不计入双臂执行。
        </p>
      )}
      <div className="results-head">
        <div className="results-summary">
          <h2>
            论文目录 <span>{ws.length}</span>
          </h2>
          <p role="status" aria-live="polite">
            找到 {ws.length} 篇{f.period === "recent" ? "近两年" : "全部年份"}
            论文 ·{" "}
            {f.scope === "all"
              ? "全部优先级"
              : f.scope === "focus"
                ? "研究重点优先"
                : "优先考察"}
          </p>
        </div>
        <div className="results-actions">
          <label>
            排序{" "}
            <select
              aria-label="论文排序"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="stars">GitHub Stars ↓</option>
              <option value="googleScholar">Google Scholar 引用 ↓</option>
              <option value="citations">OpenAlex收录引用 ↓</option>
              <option value="forks">GitHub Forks ↓</option>
              <option value="year">年份 ↓</option>
              <option value="name">名称</option>
            </select>
          </label>
          <div className="segmented">
            <button
              className={layout === "cards" ? "active" : ""}
              aria-pressed={layout === "cards"}
              onClick={() => setLayout("cards")}
            >
              <Icon type="grid" />
              卡片
            </button>
            <button
              className={layout === "table" ? "active" : ""}
              aria-pressed={layout === "table"}
              onClick={() => setLayout("table")}
            >
              <Icon type="list" />
              紧凑对照
            </button>
          </div>
        </div>
      </div>
      {ws.length ? (
        layout === "cards" ? (
          <div className="work-grid">
            {ws.map((w) => (
              <PaperCard key={w.id} w={w} {...p} showBimanualTasks={f.bimanualCooperation} />
            ))}
          </div>
        ) : (
          <>
            <p className="compact-table-note" id="compact-table-note">
              任务先展示前 2 项，点击论文名查看完整评测。
              <span>表格可左右滚动</span>
            </p>
            <div
              className="table-wrap work-table-wrap"
              tabIndex={0}
              role="region"
              aria-label="论文紧凑对照表"
              aria-describedby="compact-table-note"
            >
              <table className="work-table" aria-label="论文紧凑对照">
                <colgroup>
                  <col className="table-col-paper" />
                  <col className="table-col-tasks" />
                  <col className="table-col-signal" />
                  <col className="table-col-attention" />
                  <col className="table-col-compare" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">论文</th>
                    <th scope="col">评测任务</th>
                    <th scope="col">力 / 触觉输入</th>
                    <th scope="col">关注度</th>
                    <th scope="col">比较</th>
                  </tr>
                </thead>
                <tbody>
                  {ws.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <button
                          className="work-name"
                          onClick={() => p.showPaper(w.id)}
                        >
                          {w.name}
                        </button>
                        <div className="table-paper-meta">
                          <span>
                            {w.year} · {w.kind}
                          </span>
                          <EvaluationReferenceTag w={w} />
                        </div>
                      </td>
                      <td>
                        {f.bimanualCooperation ? <BimanualTaskNote w={w} /> : <>
                        <ul className="table-task-list">
                          {w.experiments.slice(0, 2).map((e) => (
                            <li key={e.id}>{e.task}</li>
                          ))}
                        </ul>
                        {w.experiments.length > 2 && (
                          <button
                            className="table-task-more"
                            onClick={() => p.showPaper(w.id)}
                          >
                            另 {w.experiments.length - 2} 项任务 ↗
                          </button>
                        )}
                        </>}
                      </td>
                      <td>
                        <p className="table-signal">
                          {w.physicalProfile.forceBrief}
                        </p>
                        <div className="pill-row table-domains">
                          <Domains w={w} />
                        </div>
                      </td>
                      <td>
                        <div className="table-metrics">
                          {[
                            [
                              "Scholar",
                              "Google Scholar 引用",
                              w.attention.googleScholar,
                              w.attention.googleScholarSource,
                            ],
                            [
                              "Stars",
                              "GitHub Stars",
                              w.attention.stars,
                              w.github,
                            ],
                            [
                              "引用",
                              "OpenAlex 收录引用",
                              w.attention.citations,
                              w.attention.citationRecord ||
                                w.attention.citationSource,
                            ],
                          ].map(([label, name, value, href]) =>
                            href ? (
                              <External
                                key={label}
                                className="table-metric"
                                href={href}
                                aria-label={`${name}：${num(value)}`}
                              >
                                <span>{label}</span>
                                <strong>{num(value)}</strong>
                              </External>
                            ) : (
                              <span
                                key={label}
                                className="table-metric"
                                aria-label={`${name}：${num(value)}`}
                              >
                                <span>{label}</span>
                                <strong>{num(value)}</strong>
                              </span>
                            ),
                          )}
                        </div>
                      </td>
                      <td>
                        <CompareButton w={w} {...p} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        <div className="empty">
          <h2>没有符合条件的论文</h2>
          <p>当前按优先条件及年份筛选；可切换全部论文或全部年份。</p>
          <button
            className="primary-button"
            onClick={() => {
              reset({ scope: "all", period: "all" });
            }}
          >
            查看全部论文
          </button>
        </div>
      )}
    </>
  );
}

export default PaperLibrary;
