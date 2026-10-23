import React from "react";
import { useCatalogue, num } from "../data/catalogue.js";

export function Icon({ type = "force", ...props }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === "search" ? (
          <><circle cx="14" cy="14" r="8" /><path d="m20 20 7 7" /></>
        ) : type === "menu" ? (
          <path d="M5 8h22M5 16h22M5 24h22" />
        ) : type === "close" ? (
          <path d="m8 8 16 16M24 8 8 24" />
        ) : type === "arrow" ? (
          <path d="M5 16h22m-8-8 8 8-8 8" />
        ) : type === "bookmark" ? (
          <path d="M9 5h14v23l-7-5-7 5z" />
        ) : type === "grid" ? (
          <><rect x="5" y="5" width="8" height="8" rx="1" /><rect x="19" y="5" width="8" height="8" rx="1" /><rect x="5" y="19" width="8" height="8" rx="1" /><rect x="19" y="19" width="8" height="8" rx="1" /></>
        ) : type === "list" ? (
          <path d="M5 8h22M5 16h22M5 24h22" />
        ) : type === "route" ? (
          <><circle cx="7" cy="7" r="3" /><circle cx="25" cy="25" r="3" /><path d="M10 7h11a5 5 0 0 1 0 10H11a5 5 0 0 0 0 10h11" /></>
        ) : type === "guide" ? (
          <><path d="M16 8c-4-3-8-3-12-2v20c4-1 8-1 12 2 4-3 8-3 12-2V6c-4-1-8-1-12 2zM16 8v20" /></>
        ) : type === "papers" ? (
          <>
            <path d="M9 5h12l4 5v17H9zM21 5v6h4M13 16h8M13 20h8" />
            <path d="M5 9v19h15" />
          </>
        ) : type === "tasks" ? (
          <>
            <rect x="4" y="5" width="9" height="9" rx="2" />
            <rect x="19" y="5" width="9" height="9" rx="2" />
            <rect x="4" y="20" width="9" height="9" rx="2" />
            <rect x="19" y="20" width="9" height="9" rx="2" />
          </>
        ) : type === "compare" ? (
          <>
            <path d="M6 5v23M16 5v23M26 5v23M3 10h6M13 20h6M23 14h6" />
          </>
        ) : type === "bench" ? (
          <>
            <rect x="11" y="3" width="10" height="7" rx="1" />
            <rect x="3" y="22" width="9" height="7" rx="1" />
            <rect x="20" y="22" width="9" height="7" rx="1" />
            <path d="M16 10v6M7 22v-6h18v6" />
          </>
        ) : (
          <>
            <path d="M6 25V8h14M6 17h20M16 4v25" />
            <circle cx="25" cy="17" r="4" />
          </>
        )}
      </g>
    </svg>
  );
}

export function Tag({ children, type = "" }) {
  return <span className={"tag " + type}>{children}</span>;
}

export function Domains({ w }) {
  return w.domains.map((d) => (
    <Tag
      key={d}
      type={d === "真机" ? "real" : d === "仿真" ? "sim" : "offline"}
    >
      {d}
    </Tag>
  ));
}

export function External({ href, children, ...rest }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  ) : null;
}

export function PageIntro({ title, children, aside, eyebrow }) {
  const { D } = useCatalogue();
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      <div className="intro-note">
        {aside || (
          <>
            更新于
            <br />
            <strong>{D.updated}</strong>
          </>
        )}
      </div>
    </div>
  );
}

export function Attention({ w, full = false }) {
  const a = w.attention;
  return (
    <div className={"attention " + (full ? "full" : "")}>
      <External href={a.googleScholarSource} title={a.googleScholarDate ? `查询于 ${a.googleScholarDate}` : "Google Scholar 引用"}>
        <b>{num(a.googleScholar)}</b> Google Scholar引用
      </External>
      <External href={a.citationRecord || a.citationSource}>
        <b>{num(a.citations)}</b> OpenAlex收录引用
      </External>
      {a.citations == null && <span>未取得</span>}
      <External href={w.github}>
        <b>{num(a.stars)}</b> GitHub Stars
      </External>
      {!w.github && <span>Stars —</span>}
      {full && (
        <>
          <span>Forks {num(a.forks)}</span>
          <span>查询 {a.date}</span>
          {a.googleScholarDate && <span>学术引用查询 {a.googleScholarDate}</span>}
        </>
      )}
    </div>
  );
}

export function SaveControls({ id, saved, onSave, notes = false }) {
  const s = saved[id] || {};
  return (
    <div className="save-controls">
      <button
        className={"bookmark " + (s.bookmark ? "selected" : "")}
        onClick={() => onSave(id, { bookmark: !s.bookmark })}
      >
        {s.bookmark ? "★ 已收藏" : "☆ 收藏"}
      </button>
      <select
        aria-label="研究阅读状态"
        value={s.status || ""}
        onChange={(e) => onSave(id, { status: e.target.value })}
      >
        <option value="">阅读状态</option>
        <option>待深入核验</option>
        <option>待精读</option>
        <option>已阅读</option>
      </select>
      {notes && (
        <label className="personal-note">
          我的问题与发现
          <textarea
            placeholder="记录自己的发现，仅保存在当前浏览器…"
            value={s.note || ""}
            onChange={(e) => onSave(id, { note: e.target.value })}
          />
          <small>收藏与笔记仅保存在当前浏览器。</small>
        </label>
      )}
    </div>
  );
}

export function Filter({ label, value, onChange, options, allValue = "" }) {
  return (
    <label className="filter-control">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
          <option value={allValue}>全部</option>
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
