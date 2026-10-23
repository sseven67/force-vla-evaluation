import React from "react";
import { useCatalogue } from "../data/catalogue.js";
import { ScreeningTag } from "./papers.jsx";

export default function CoverageMatrix({ rows, taskTypes, hasTask, ...p }) {
  const { colour } = useCatalogue();
  return (
    <div className="coverage">
      <p className="mini-note">
        点击 ● 查看具体评测。
      </p>
      <div className="table-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>论文 / 任务主题</th>
              {taskTypes.map((t) => (
                <th key={t.id}>
                  <button onClick={() => p.goto("tasks", t.id)}>
                    {t.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id}>
                <th>
                  <button onClick={() => p.showPaper(w.id)}>{w.name}</button>
                  <small>{w.kind}</small>
                  <ScreeningTag w={w} />
                </th>
                {taskTypes.map((t) => (
                  <td key={t.id}>
                    {hasTask(w.id, t.id) && (
                      <button
                        aria-label={w.name + "包含" + t.name}
                        style={{ color: colour(w) }}
                        onClick={() => p.goto("tasks", t.id)}
                      >
                        ●
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
