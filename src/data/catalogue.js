import { createContext, useContext } from "react";

export const CatalogueContext = createContext(null);
export const isVLA = (w) => /VLA|VTLA/.test(w.kind) && !w.kind.includes("非");
export const inCategory = (w, id) => w.categories.includes(id);
// Protocol classification is evidence-backed data, not a hard-coded name allowlist.
export const isBench = (b) => b.resourceType === "benchmark";
export const num = (n) => (n == null ? "—" : n.toLocaleString("en-US"));
export const unique = (a) => [...new Set(a)];
export function robotDescription(profile) {
  const type = profile.robotConfiguration || profile.embodimentBrief;
  if (!profile.robotModel) return type;
  const qualifier = type.match(/（([^（）]+)）$/);
  return qualifier
    ? `${type.slice(0, qualifier.index)}（${profile.robotModel}；${qualifier[1]}）`
    : `${type}（${profile.robotModel}）`;
}
// Count independent recorded adopters; proposing a resource is not adopting it.
export function benchmarkAdoptionCount(benchmark, users) {
  const identity = (paper) => {
    const source = paper.source || "";
    const arxiv = source.match(/arxiv\.org\/(?:abs|html)\/(\d{4}\.\d+)/);
    return arxiv?.[1] || (paper.fullTitle || paper.title || paper.name).toLowerCase().replace(/\s+/g, " ");
  };
  return new Set([
    ...users.filter(({ w, r }) => r.type === "adopts" && w.id !== benchmark.introducedBy.workId).map(({ w }) => identity(w)),
    ...(benchmark.externalUsers || []).filter(s => s.resourceId !== benchmark.id).map(identity),
  ]).size;
}
const EMPTY = Object.freeze([]);

function append(index, key, value) {
  if (!index.has(key)) index.set(key, []);
  index.get(key).push(value);
}

export function createCatalogue(D) {
  for (const key of [
    "works",
    "benchmarks",
    "groups",
    "taskTypes",
    "taskGroups",
    "taskInstances",
    "extraRelations",
    "features",
    "documents",
  ]) {
    if (!Array.isArray(D?.[key])) throw new Error(`研究目录缺少有效的 ${key}`);
  }

  const PAPERS = D.works.filter((w) => !w.resourceOnly);
  const byId = new Map(D.works.map((w) => [w.id, w]));
  const bmById = new Map(D.benchmarks.map((b) => [b.id, b]));
  const groupById = new Map(D.groups.map((g) => [g.id, g]));
  const taskById = new Map(D.taskTypes.map((t) => [t.id, t]));
  for (const [oldId, topicId] of Object.entries(D.taskTopicAliases || {})) {
    if (!taskById.has(oldId)) taskById.set(oldId, taskById.get(topicId));
  }
  const instancesByWork = new Map();
  const instancesByTask = new Map();
  const instancesByProtocol = new Map();
  const tasksByWork = new Map();
  const protocolsById = new Map();
  const usersByBenchmark = new Map();
  const searchByWork = new Map();

  for (const w of D.works) {
    if (!w.resourceOnly)
      for (const e of w.experiments) protocolsById.set(e.id, e);
    for (const r of w.relations)
      append(usersByBenchmark, r.benchmark, { w, r });
    searchByWork.set(
      w.id,
      [
        w.name,
        w.fullTitle,
        w.tasks,
        w.metrics,
        w.platform,
        w.signal,
        ...Object.values(w.physicalProfile || {}).filter(v => typeof v === 'string'),
        w.baseline,
        ...w.domains,
        ...w.experiments.flatMap((e) => [e.task, e.originalTask, e.metric, e.setting, ...(e.evaluationModes || [])]),
        ...w.comparisonMethods.flatMap(c => [c.question, c.objects, c.tasks, c.evaluation, ...(c.checks || []).flatMap(e => [e.task, e.metric, e.setting])]),
        ...w.relations.map((r) => bmById.get(r.benchmark)?.name || r.resourceName),
      ]
        .join(" ")
        .toLowerCase(),
    );
  }
  for (const i of D.taskInstances) {
    append(instancesByWork, i.work, i);
    append(instancesByTask, i.task, i);
    if (!tasksByWork.has(i.work)) tasksByWork.set(i.work, new Set());
    tasksByWork.get(i.work).add(i.task);
    for (const e of i.protocols) append(instancesByProtocol, e.id, i);
  }

  const getWorkInstances = (id) => instancesByWork.get(id) || EMPTY;
  const getTaskInstances = (id) => instancesByTask.get(id) || EMPTY;
  const getBenchmarkUsers = (id) => usersByBenchmark.get(id) || EMPTY;
  const hasTask = (work, task) => tasksByWork.get(work)?.has(task) || false;
  const relatedProtocolCache = new Map();

  function getRelatedProtocols(id) {
    if (relatedProtocolCache.has(id)) return relatedProtocolCache.get(id);
    const selected = protocolsById.get(id);
    if (!selected) return EMPTY;
    const topics = new Set(
      (instancesByProtocol.get(id) || EMPTY).map((i) => i.task),
    );
    const matches = PAPERS.flatMap((w) => {
      const linked = new Set(
        getWorkInstances(w.id)
          .filter((i) => topics.has(i.task))
          .flatMap((i) => i.protocols.map((e) => e.id)),
      );
      const protocols = w.experiments.filter(
        (e) => (e.originalTask || e.task) === (selected.originalTask || selected.task) || linked.has(e.id),
      );
      return protocols.length
        ? [{ id: `${w.id}-protocol-${id}`, work: w.id, protocols }]
        : [];
    });
    relatedProtocolCache.set(id, matches);
    return matches;
  }

  return {
    D,
    byId,
    bmById,
    groupById,
    taskById,
    protocolsById,
    searchByWork,
    PAPERS,
    RESOURCE_WORKS: D.works.filter((w) => w.resourceOnly),
    colour: (w) => groupById.get(w.categories[0])?.color || "#63738a",
    getWorkInstances,
    getTaskInstances,
    getBenchmarkUsers,
    hasTask,
    getRelatedProtocols,
  };
}

export function useCatalogue() {
  const catalogue = useContext(CatalogueContext);
  if (!catalogue) throw new Error("研究目录尚未载入");
  return catalogue;
}
