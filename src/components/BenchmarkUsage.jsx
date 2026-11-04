import React from "react";
import { External, Tag } from "./ui.jsx";
import ResourceMetrics from "./ResourceMetrics.jsx";

export default function BenchmarkUsage({ b }) {
  const works = b.usageWorks || [];
  if (!works.length) return <p>暂无已核实的力觉／触觉 VLA 使用工作。</p>;
  return <div className="resource-user-list benchmark-usage-list">{works.map(work => <article key={work.id}>
    <div className="resource-user-heading"><h3><External href={work.source}>{work.name}</External></h3><Tag>{work.relationLabel}</Tag></div>
    <ResourceMetrics metadata={work.metadata} details />
    <div className="benchmark-usage-scroll"><table className="benchmark-usage-table" aria-label={`${work.name} 在 ${b.name} 上的使用方式`}>
      <thead><tr><th scope="col">字段</th><th scope="col">内容</th></tr></thead>
      <tbody>{work.fields.map(({ label, text }) => <tr key={label}><th scope="row">{label}</th><td>{(Array.isArray(text) ? text : [text]).map((line, i) => <p key={i}>{line}</p>)}</td></tr>)}</tbody>
    </table></div>
    <div className="source-links">{work.sources.map(source => <External key={source.url} href={source.url}>{source.label}</External>)}</div>
  </article>)}</div>;
}
