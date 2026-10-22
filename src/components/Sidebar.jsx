import React from "react";
import { useCatalogue } from "../data/catalogue.js";
import { names } from "../hooks/useHashRoute.js";
import { Icon } from "./ui.jsx";

export default function Sidebar({
  route,
  filters,
  fp,
  goto,
  selectedCount,
  mobile,
  closeNavigation,
  navigationRef,
  openSources,
}) {
  const { D, PAPERS } = useCatalogue();
  const navigate = (view) => {
    closeNavigation();
    goto(view);
  };
  return (
    <aside
      ref={navigationRef}
      id="site-navigation"
      className={"sidebar " + (mobile ? "mobile-open" : "")}
      role={mobile ? "dialog" : undefined}
      aria-modal={mobile ? true : undefined}
      aria-label="研究工作台导航"
    >
      <button
        className="nav-close"
        aria-label="关闭导航"
        onClick={() => closeNavigation()}
      >
        <Icon type="close" />
      </button>
      <a className="brand" href="#works" onClick={closeNavigation}>
        <span className="brand-symbol">
          <Icon />
        </span>
        <span>
          Force-VLA<small>Evaluation Atlas</small>
        </span>
      </a>
      <p className="nav-caption">研究工作台</p>
      <nav aria-label="主导航">
        {[
          ["works", "papers"],
          ["tasks", "tasks"],
          ["benchmarks", "bench"],
          ["compare", "compare"],
        ].map(([v, i]) => (
          <button
            key={v}
            className={"nav-item " + (route.view === v ? "active" : "")}
            aria-current={route.view === v ? "page" : undefined}
            onClick={() => navigate(v)}
          >
            <Icon type={i} />
            {names[v]}
            {v === "works" && (
              <span className="nav-count">{PAPERS.length}</span>
            )}
            {v === "compare" && selectedCount > 0 && (
              <span className="nav-count">{selectedCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-divider" />
      <p className="nav-caption">辅助阅读</p>
      <button
        className={"aux-nav " + (route.view === "overview" ? "active" : "")}
        aria-current={route.view === "overview" ? "page" : undefined}
        onClick={() => navigate("overview")}
      >
        <Icon type="route" />
        研究路线与关系
      </button>
      <button
        className={"aux-nav " + (route.view === "guide" ? "active" : "")}
        aria-current={route.view === "guide" ? "page" : undefined}
        onClick={() => navigate("guide")}
      >
        <Icon type="guide" />
        怎样读懂评测
      </button>
      <p className="nav-caption family-caption">四类论文 · 可多选归属</p>
      {D.groups.map((g) => (
        <button
          className={
            "family-link " +
            (route.view === "works" && filters.category === g.id
              ? "active"
              : "")
          }
          aria-pressed={route.view === "works" && filters.category === g.id}
          key={g.id}
          onClick={() => {
            fp({ category: g.id, scope: "all", period: "all" });
            navigate("works");
          }}
        >
          <span className="dot" style={{ background: g.color }} />
          {g.name}
        </button>
      ))}
      <div className="sidebar-bottom">
        <button
          onClick={() => {
            closeNavigation();
            openSources();
          }}
        >
          来源、计数与文档 ↗
        </button>
        <p>
          更新 {D.updated}
          <br />
          论文、任务与评测方法
        </p>
      </div>
    </aside>
  );
}
