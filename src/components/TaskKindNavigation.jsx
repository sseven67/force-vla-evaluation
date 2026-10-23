import React from "react";

export default function TaskKindNavigation({ options, value, onChange, total }) {
  return <aside className="task-kind-sidebar" aria-label="任务种类筛选">
    <div className="task-kind-heading">
      <h3>任务种类</h3>
      <span>{options.length} 种</span>
    </div>
    <div className="task-kind-options">
      {[{ id: "", name: "全部", count: total }, ...options].map(option =>
        <button key={option.id} type="button"
          className={value === option.id ? "active" : ""}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}>
          <span>{option.name}</span><small>{option.count}</small>
        </button>)}
    </div>
  </aside>;
}
