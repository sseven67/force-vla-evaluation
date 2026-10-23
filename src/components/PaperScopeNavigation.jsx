import React from "react";
import { useCatalogue } from "../data/catalogue.js";
import { matchesPublicationYear } from "../data/selectors.js";

export default function PaperScopeNavigation({ value, onChange, period = "all" }) {
  const { PAPERS } = useCatalogue();
  const works = PAPERS.filter(w => matchesPublicationYear(w, period));
  return <div className="library-overline">
    <div className="scope-pills" role="group" aria-label="论文范围">
      {[["all", "全部论文", works.length],
        ["high", "较高关注", works.filter(w => w.screening.highAttention).length]].map(([id, label, count]) =>
        <button key={id} className={value === id ? "active" : ""} aria-pressed={value === id} onClick={() => onChange(id)}>
          {label} <b>{count}</b>
        </button>)}
    </div>
  </div>;
}
