import React from "react";
import { names } from "../hooks/useHashRoute.js";
import { Icon } from "./ui.jsx";

export default function Topbar({
  view,
  query,
  search,
  mobile,
  toggleNavigation,
}) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span className="breadcrumb-home">Force-VLA Evaluation Platform</span> <span>/</span>
        <strong>{names[view]}</strong>
      </div>
      <label className="global-search">
        <Icon type="search" />
        <input
          aria-label="全站搜索论文、任务、指标"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="搜索论文、任务、指标…"
        />
        <kbd>/</kbd>
      </label>
      <button
        className="mobile-menu"
        aria-label={mobile ? "关闭导航" : "展开导航"}
        aria-expanded={mobile}
        aria-controls="site-navigation"
        onClick={toggleNavigation}
      >
        <Icon type="menu" />
      </button>
    </header>
  );
}
