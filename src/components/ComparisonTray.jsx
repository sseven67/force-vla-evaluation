import React from "react";
import { useCatalogue } from "../data/catalogue.js";

export default function ComparisonTray({ selected, compare, clear, goto }) {
  const { byId } = useCatalogue();
  return (
    <div className="compare-tray">
      <div className="tray-items">
        <span>已选 {selected.length}/3</span>
        {selected.map((id) => (
          <span className="tray-chip" key={id}>
            {byId.get(id).name}
            <button
              aria-label={"移除" + byId.get(id).name}
              onClick={() => compare(id)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="tray-actions">
        <button onClick={() => clear()}>清空</button>
        <button className="primary-button" onClick={() => goto("compare")}>
          进入横向比较
        </button>
      </div>
    </div>
  );
}
