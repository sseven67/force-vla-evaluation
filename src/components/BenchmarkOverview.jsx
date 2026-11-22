import React from "react";
import { useCatalogue } from "../data/catalogue.js";
import { PageIntro } from "./ui.jsx";
import { benchmarkOverview, benchmarkSectionHref } from "../data/benchmarkOverview.js";

function DetailLink({ id, section, children }) {
  return <a className="benchmark-overview-detail" href={benchmarkSectionHref(id, section)}>{Array.isArray(children) ? children.map((line, i) => <span key={i}>{line}</span>) : children}</a>;
}

function simulationPlatform(benchmark) {
  const facts = benchmark.reading.simulationDetail?.facts || benchmark.reading.detailPage?.basicInfo || [];
  return facts.find(([label]) => label === "仿真平台")?.[1] || "尚未核实";
}

export default function BenchmarkOverview({ goto }) {
  const { bmById } = useCatalogue();
  return <>
    <button className="back-link" onClick={() => goto("benchmarks", "resource-list")}>查看全部资源 ↗</button>
    <PageIntro eyebrow="BENCHMARKS / 对比总览" title={`${benchmarkOverview.length} 项主流 Benchmark 总览`}>
      点击各项内容可跳转到对应详情章节。数量区分任务、环境和实例；仿真与真机分别标注。
    </PageIntro>
    <p className="benchmark-overview-note">泛化与传感器／硬件扰动仅统计仿真。后续力觉／触觉 VLA 的改造见对应详情。表格可横向滚动。</p>
    <div className="benchmark-overview-scroll" tabIndex={0} role="region" aria-label={`${benchmarkOverview.length} 项主流基准对比表，可横向滚动`}>
      <table className="benchmark-overview-table">
        <caption className="sr-only">{benchmarkOverview.length} 项主流 Benchmark：仿真平台、本体与力触觉、任务与演示、评价指标、泛化及鲁棒性对比</caption>
        <thead><tr>{["Benchmark", "仿真平台", "机器人本体及力／触觉表示", "任务数量及专家演示", "怎么评分", "场景随机化", "物理 OOD", "相机／机器人受干扰怎么测"].map(label => <th key={label} scope="col">{label}{label === "场景随机化" && <small>仅统计针对场景变化的仿真专项评测</small>}{label === "物理 OOD" && <small>仅仿真：测试训练范围外的物理参数</small>}{label === "相机／机器人受干扰怎么测" && <small>仅统计仿真扰动</small>}</th>)}</tr></thead>
        <tbody>{benchmarkOverview.map(row => <tr key={row.id}>
          <th scope="row"><a href={benchmarkSectionHref(row.id)}>{bmById.get(row.id).name} ↗</a></th>
          <td><DetailLink id={row.id} section={0}>{simulationPlatform(bmById.get(row.id))}</DetailLink></td>
          <td><DetailLink id={row.id} section={0}>{row.robot}</DetailLink></td>
          <td><DetailLink id={row.id} section={1}>{`任务：${row.tasks}`}</DetailLink><DetailLink id={row.id} section={4}>{`演示：${row.demos}`}</DetailLink></td>
          <td><DetailLink id={row.id} section={1}>{row.metrics}</DetailLink></td>
          <td>{row.generalization.scene.length > 0 && <DetailLink id={row.id} section={2}>{row.generalization.scene}</DetailLink>}</td>
          <td>{row.generalization.physics.length > 0 && <DetailLink id={row.id} section={2}>{row.generalization.physics}</DetailLink>}</td>
          <td><DetailLink id={row.id} section={3}>{row.robustness}</DetailLink></td>
        </tr>)}</tbody>
      </table>
    </div>
  </>;
}
