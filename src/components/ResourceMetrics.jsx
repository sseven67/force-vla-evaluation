import React from "react";
import { num } from "../data/catalogue.js";

const SCHOLAR_STATUS = {
  "count-not-displayed": "未显示次数",
  "not-found": "未找到条目",
  "not-checked": "尚未核实",
};

function MetricValue({ href, children, title }) {
  return href ? <a href={href} target="_blank" rel="noreferrer" title={title}>{children}<span aria-hidden="true"> ↗</span></a> : <span title={title}>{children}</span>;
}

export default function ResourceMetrics({ metadata: m, details = false, subject }) {
  if (!m) return null;
  const scholar = m.scholar == null ? SCHOLAR_STATUS[m.scholarStatus] || "未取得计数" : num(m.scholar);
  const stars = m.stars == null ? (m.starsStatus === "no-repository" ? "未确认官方仓库" : "计数暂不可得") : num(m.stars);
  return <div className="resource-metrics-block">
    {subject && <p className="resource-metrics-subject">{subject}</p>}
    <dl className="resource-metrics" aria-label="引用、仓库关注度与首次公开时间">
      <div><dt>Google Scholar 引用</dt><dd><MetricValue href={m.scholarSource} title={m.scholarDate ? `查询于 ${m.scholarDate}` : "打开 Scholar 检索"}>{scholar}</MetricValue></dd></div>
      <div><dt>GitHub Stars</dt><dd><MetricValue href={m.repository} title={m.starsDate ? `查询于 ${m.starsDate}` : undefined}>{stars}</MetricValue></dd></div>
      <div><dt>首次公开</dt><dd><MetricValue href={m.dateSource} title={m.dateBasis}>{m.firstPublicDate ? <time dateTime={m.firstPublicDate}>{m.firstPublicDate}</time> : (m.dateStatus === "not-reported" ? "日期未提供" : m.publicYear ? `${m.publicYear} · 日期未核实` : "日期未核实")}</MetricValue></dd></div>
    </dl>
    {details && <details className="resource-metrics-evidence">
      <summary>数据来源</summary>
      <p>Scholar：{m.scholarDate || "尚未核实"}；GitHub：{m.starsDate || "未确认计数"}。{m.firstPublicDate ? `公开时间依据：${m.dateBasis}。` : m.dateBasis + "。"}</p>
      <p>引用对应论文，Stars 为整个仓库计数。</p>
      {m.starsSource && <a href={m.starsSource} target="_blank" rel="noreferrer">GitHub 数据来源 ↗</a>}
    </details>}
  </div>;
}
