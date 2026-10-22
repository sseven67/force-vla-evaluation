import React from "react";

export default function ResourceUsage({ fields, fallback }) {
  const rows = fields?.length ? fields : [{ label: "使用方式", text: fallback || "具体使用方式尚未核实。" }];
  return <dl className="resource-usage">{rows.map(({ label, text }) => <div key={label}>
    <dt>{label}</dt><dd>{text}</dd>
  </div>)}</dl>;
}
