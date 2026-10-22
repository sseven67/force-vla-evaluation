import React from "react";
import { useCatalogue, isVLA, inCategory, isBench } from "../data/catalogue.js";
import { PageIntro } from "../components/ui.jsx";

function Overview({ ...p }) {
  const { D, PAPERS, byId } = useCatalogue();
  return (
    <>
      <PageIntro eyebrow="RESEARCH MAP / 研究路线" title="力与触觉，怎样进入机器人策略？">
        按夹爪、灵巧手等类别整理工作，查看使用什么力或触觉信息，以及怎样控制动作。
      </PageIntro>
      <div className="overview-summary">
        <strong>{PAPERS.length} 项论文 · 四类</strong>
        <span>{PAPERS.filter(isVLA).length} 项VLA/VTLA相关</span>
        <button
          className="subtle-link"
          onClick={() => p.goto("benchmarks")}
        >
          {D.benchmarks.filter(isBench).length} 项评测基准 ↗
        </button>
        <span>{D.taskTypes.length} 个任务主题</span>
        <span>从六个方面了解评测</span>
      </div>
      <p className="mini-note">
        按机器人类型和力觉形式分类；同一论文可以属于多类。Benchmark单独整理。
      </p>
      <div className="diagram-panel">
        {D.groups.map((g) => (
          <div className="map-lane" style={{ "--color": g.color }} key={g.id}>
            <div className="lane-label">
              <h3>{g.name}</h3>
              <p>{g.subtitle}</p>
            </div>
            <div className="lane-works">
              {PAPERS.filter((w) => inCategory(w, g.id)).map((w) => (
                <button
                  className="work-node"
                  key={w.id}
                  onClick={() => p.showPaper(w.id)}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="explain-note">
        <strong>同名方法要区分。</strong>
        FACT（接触诊断）和FACT（人机灵巧迁移）不同；OmniVTLA和OmniVTA不同；VITaL
        Pretraining、ViTaL Local与ViTaL Steering也分别记录。
      </div>
      <div className="feature-grid">
        {D.features.map((f) => (
          <button
            className="feature-item"
            key={f.work}
            onClick={() => p.showPaper(f.work)}
          >
            <h3>{f.title}</h3>
            <p>{f.text}</p>
            <small>{byId.get(f.work)?.name}</small>
          </button>
        ))}
      </div>
    </>
  );
}

export default Overview;
