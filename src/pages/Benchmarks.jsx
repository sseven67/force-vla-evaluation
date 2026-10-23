import React, { useEffect, useState } from "react";
import { useCatalogue, isBench, benchmarkAdoptionCount } from "../data/catalogue.js";
import { PageIntro, Tag, External, SaveControls, Filter } from "../components/ui.jsx";
import EvaluationHighlights from "../components/EvaluationHighlights.jsx";
import BenchmarkReading from "../components/BenchmarkReading.jsx";
import ResourceMetrics from "../components/ResourceMetrics.jsx";
import BenchmarkNavigation from "../components/BenchmarkNavigation.jsx";
import ResourceUsage from "../components/ResourceUsage.jsx";

const ENVIRONMENTS = {
  "offline": "离线", "sim": "仿真", "real": "真机",
  "resources-offline": "离线", "resources-sim": "仿真", "resources-real": "真机",
};
const RESOURCE_TYPES = [
  ["benchmark", "评测基准"], ["platform", "仿真平台"],
];

function Benchmarks({ item, ...p }) {
  const { D, bmById, getBenchmarkUsers } = useCatalogue();
  const [query, setQuery] = useState("");
  const [environment, setEnvironment] = useState(ENVIRONMENTS[item] || "");
  const [resourceType, setResourceType] = useState("");
  const [sort, setSort] = useState("scholar");
  useEffect(() => setEnvironment(ENVIRONMENTS[item] || ""), [item]);
  const b = bmById.get(item);
  if (b) return <BenchmarkDetail b={b} {...p} />;
  const benchmarks = D.benchmarks;
  const adopters = (id) => getBenchmarkUsers(id).filter(({ r }) => r.type === "adopts");
  const usageCount = (b) => benchmarkAdoptionCount(b, getBenchmarkUsers(b.id));
  const visible = benchmarks.filter((b) =>
    (!resourceType || b.resourceType === resourceType) &&
    (!environment || b.domain.includes(environment)) &&
    (!query || [b.name, b.focus, b.detail, b.introducedBy.title, b.typeLabel, ...(b.tasks || []),
      ...(b.reading?.taskGroups.flatMap(g => g.items.flatMap(t => [t.name, t.goal, t.scoring])) || []),
      ...adopters(b.id).map(({ w }) => w.name), ...(b.externalUsers || []).map(u => u.name)].join(" ").toLowerCase().includes(query.toLowerCase()))
  ).sort((a, b) => {
    const value = (b) => sort === "usage" ? usageCount(b) : sort === "stars" ? b.metadata?.stars ?? -1 : sort === "scholar" ? b.metadata?.scholar ?? -1 : b.metadata?.firstPublicDate || "";
    const av = value(a), bv = value(b);
    return (sort === "date" ? bv.localeCompare(av) : bv - av) || a.name.localeCompare(b.name, "zh-CN");
  });
  return (
    <>
      <PageIntro eyebrow="BENCHMARKS / 基准与资源" title="Benchmark 与评测资源" aside={<>更新于<br /><strong>{D.resourceUpdated}</strong></>}>
        仅收录评测基准和仿真平台。查看测哪些任务、怎样评分，以及哪些论文采用或扩展了它。
      </PageIntro>
      <section className="toolbar resource-filter-bar" aria-label="资源搜索与筛选">
        <label className="resource-search-control">搜索资源
        <input aria-label="搜索Benchmark"
          placeholder="搜索基准、任务或使用它的论文…" value={query}
          onChange={(e) => setQuery(e.target.value)} /></label>
        <div className="resource-filter-fields">
          <Filter label="资源类型" value={resourceType} onChange={setResourceType} options={RESOURCE_TYPES} />
          <Filter label="评测方式" value={environment} onChange={setEnvironment}
            options={["真机", "仿真", "离线"].map((x) => [x, x])} />
          <button className="reset" onClick={() => { setQuery(""); setEnvironment(""); setResourceType(""); setSort("scholar"); }}>重置</button>
        </div>
      </section>
      <div className="results-head resource-results-head"><div><strong>找到 {visible.length} 项{RESOURCE_TYPES.find(([id]) => id === resourceType)?.[1] || "资源"}</strong><p className="resource-count-note">已收录的采用工作数，含衍生评测，不含提出者。</p></div>
        <label className="resource-sort">排序<select aria-label="评测资源排序" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="usage">使用工作数 ↓</option><option value="stars">GitHub Stars ↓</option><option value="scholar">Google Scholar 引用 ↓</option><option value="date">首次公开时间 ↓</option>
        </select></label>
      </div>
      <div className="bench-grid">
        {visible.map((b) => {
          const users = adopters(b.id);
          return (
            <article className="benchmark-card" key={b.id}>
              <div className="pill-row"><Tag>{b.typeLabel}</Tag><Tag>{b.domain}</Tag><Tag>使用工作 {usageCount(b)}</Tag>{b.newlyCollected && <Tag>本次补充</Tag>}</div>
              <h2><button onClick={() => p.goto("benchmarks", b.id)}>{b.name}</button></h2>
              <p>{b.reading?.summary || b.focus}</p>
              {b.reading && <div className="benchmark-card-task-preview">{b.tasks.slice(0, 3).map(t => <span key={t}>{t}</span>)}{b.tasks.length > 3 && <span>另 {b.tasks.length - 3} 项</span>}</div>}
              <p className="benchmark-proposer"><strong>提出工作</strong><External href={b.introducedBy.source}>{b.introducedBy.title}</External></p>
              <ResourceMetrics metadata={b.metadata} />
              <p className="benchmark-verdict">{b.verdict}</p>
              <small>{users.length || b.externalUsers?.length ? "使用／对应工作：" + [...users.map(({ w }) => w.name), ...(b.externalUsers || []).map(u => u.name)].join("、") : "当前目录尚无其他论文采用记录"}</small>
              <div className="card-bottom">
                <button onClick={() => p.goto("benchmarks", b.id)}>任务、评分与使用论文 ↗</button>
                <button className={"bookmark " + (p.saved["bm-" + b.id]?.bookmark ? "selected" : "")}
                  aria-label={"收藏" + b.name} onClick={() => p.save("bm-" + b.id, { bookmark: !p.saved["bm-" + b.id]?.bookmark })}>
                  {p.saved["bm-" + b.id]?.bookmark ? "★" : "☆"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && <p className="empty">没有符合条件的资源，可调整筛选条件。</p>}
    </>
  );
}

function BenchmarkDetail({ b, ...p }) {
  const { D, byId, bmById, getBenchmarkUsers } = useCatalogue();
  const users = getBenchmarkUsers(b.id),
    extras = D.extraRelations.filter(
      (r) => r.toBenchmark === b.id || r.fromBenchmark === b.id,
    );
  const referenceOwner = users.find(({ w, r }) => w.resourceOnly && r.type === "proposes" && w.evaluationHighlights.length > 0)?.w;
  return (
    <>
      <button className="back-link" onClick={() => p.goto("benchmarks")}>
        ← 返回 Benchmark 与资源
      </button>
      <PageIntro title={b.name} aside={<>更新于<br /><strong>{D.resourceUpdated}</strong></>}>{b.focus}</PageIntro>
      <div className="pill-row">
        <Tag>{b.typeLabel}</Tag>
        <Tag>{b.domain}</Tag>
        <Tag>{b.verdict}</Tag>
      </div>
      <BenchmarkNavigation resourceId={b.id} />
      <section id="benchmark-section-0" className="benchmark-reader-section" tabIndex={-1} aria-label="资源概况">
      <section className="benchmark-origin">
        <h2>提出这项资源的工作</h2>
        <External href={b.introducedBy.source}>{b.introducedBy.title}</External>
        {b.introducedBy.workId && <button className="subtle-link" onClick={() => p.showPaper(b.introducedBy.workId)}>查看该工作的评测详情 ↗</button>}
        <ResourceMetrics metadata={b.metadata} details subject={b.metadataSubject} />
      </section>
      <div className="bench-description">
        <h2>它主要用来做什么？</h2>
        {b.reading ? b.reading.introduction.map((text, i) => <p key={i}>{text}</p>) : <p>{b.detail}</p>}
        <External href={b.source}>原始论文／报告</External>
      </div>
      </section>
      <section id="benchmark-section-1" className="benchmark-reader-section" tabIndex={-1} aria-label="任务与评分">
      <BenchmarkReading b={b} />
      <section className="benchmark-assessment">
        <h2>{isBench(b) ? "为何列为评测基准？" : "分类依据与评测边界"}</h2>
        <dl>{[["判断依据", b.reason], ["怎样测试和评分", b.protocol], ["公开情况", b.release], ["适用范围", b.scope]].map(([label, value]) => <React.Fragment key={label}><dt>{label}</dt><dd>{value}</dd></React.Fragment>)}</dl>
        <div className="source-links">{b.evidence.map((e, i) => <External key={i} href={e.url}>{e.locator}</External>)}</div>
      </section>
      {referenceOwner && <EvaluationHighlights w={referenceOwner} />}
      {!b.reading && b.tasks?.length > 0 && (
        <section className="section-spacer">
          <h2>任务组成与评测范围</h2>
          <div className="task-chips large">
            {b.tasks.map((t, i) => (
              <span key={i}>
                {typeof t === "string" ? t : JSON.stringify(t)}
              </span>
            ))}
          </div>
        </section>
      )}
      </section>
      <section id="benchmark-section-2" className="section-spacer benchmark-reader-section" tabIndex={-1} aria-label="使用工作">
        <h2>使用与对应工作</h2>
        <div className="resource-user-list">
          {users.filter(({ r }) => r.type === "adopts").map(({ w, r }) => (
            <article key={w.id}>
              <div className="resource-user-heading"><h3><button className="work-name" onClick={() => p.showPaper(w.id)}>
                {w.name}
              </button></h3><Tag>{r.label}</Tag></div>
              <ResourceMetrics metadata={D.resourceWorkMetadata?.[w.id]} details />
              <ResourceUsage fields={r.usageDetails} fallback={b.reading?.using.find(item => item.work === w.id)?.text || r.note} />
              <div className="resource-use-links"><small>{r.domain}</small><External href={w.source}>使用方式原文</External></div>
            </article>
          ))}
          {(b.externalUsers || []).map(study => <article key={study.id}>
            <div className="resource-user-heading"><h3><External href={study.source}>{study.name}</External></h3><Tag>{study.resourceId === b.id ? "对应评测工作" : "采用并适配"}</Tag></div>
            <ResourceMetrics metadata={study.metadata} details />
            <ResourceUsage fields={study.usageDetails} fallback={study.usage} />
            <External href={study.source}>查看原文评测说明</External>
          </article>)}
        </div>
        {!users.some(({ r }) => r.type === "adopts") && !b.externalUsers?.length && (
          <p>当前目录尚无其他论文采用记录。</p>
        )}
      </section>
      <section id="benchmark-section-3" className="benchmark-reader-section" tabIndex={-1} aria-label="相关资料">
      {b.relatedResources?.length > 0 && <section className="section-spacer resource-related">
        <h2>复用的基准与环境</h2>
        <div className="task-chips">{b.relatedResources.map(id => <button key={id} onClick={() => p.goto("benchmarks", id)}>{bmById.get(id)?.name || id} ↗</button>)}</div>
      </section>}
      {b.id === "univtac" && (
        <div className="proof-grid">
          <div className="proof-card">
            <h3>UniVTAC提供了什么？</h3>
            <p>
              提供触觉仿真、数据生成、模型训练及8项自主操作测试。
            </p>
          </div>
          <div className="proof-card">
            <h3>FTP-1 的真实实验另建</h3>
            <p>
              FTP-1采用6项，真机任务另设；N₀-VTLA采用8项，两篇均分不宜直接比较。
            </p>
            <External href="https://arxiv.org/html/2606.13102v1#A5.SS2">
              FTP-1 附录E.2
            </External>
          </div>
        </div>
      )}
      {extras.length > 0 && (
        <section className="section-spacer">
          <h2>与其他基准和论文的关系</h2>
          {extras.map((r, i) => (
            <div className="extra-relation" key={i}>
              <Tag>{r.label}</Tag>
              {r.fromWork ? (
                <button onClick={() => p.showPaper(r.fromWork)}>
                  {byId.get(r.fromWork)?.name}
                </button>
              ) : (
                <button
                  onClick={() =>
                    p.goto(
                      "benchmarks",
                      r.toBenchmark === b.id ? r.fromBenchmark : r.toBenchmark,
                    )
                  }
                >
                  {
                    bmById.get(
                      r.toBenchmark === b.id ? r.fromBenchmark : r.toBenchmark,
                    )?.name
                  }
                </button>
              )}
              <p>{r.note}</p>
              <External href={r.source}>原文依据</External>
            </div>
          ))}
        </section>
      )}
      <section className="section-spacer">
        <h2>论文与评测代码</h2>
        <div className="release-block"><p>{b.release}</p><External href={b.resourceUrl}>官方资源入口</External></div>
        {users.map(({ w }) => (
          <div className="release-block" key={w.id}>
            <strong>{w.name}</strong>
            <Tag>{w.openness.status}</Tag>
            <p>{w.openness.note}</p>
            <External href={w.openness.url}>查看资源</External>
          </div>
        ))}
      </section>
      </section>
      <section id="benchmark-section-4" className="personal-section benchmark-reader-section" tabIndex={-1} aria-label="研究记录">
        <h2>收藏与研究记录</h2>
        <SaveControls id={"bm-" + b.id} saved={p.saved} onSave={p.save} notes />
      </section>
    </>
  );
}

export default Benchmarks;
