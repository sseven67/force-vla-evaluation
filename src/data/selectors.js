import { inCategory, isVLA } from "./catalogue.js";

export const DEFAULT_WORK_FILTERS = Object.freeze({
  scope: "all",
  period: "all",
  category: "",
  kind: "",
  domain: "",
  reference: false,
  forceEvaluation: false,
  bookmarks: false,
  bimanualCooperation: false,
});

export const DEFAULT_PAPER_FILTERS = Object.freeze({
  ...DEFAULT_WORK_FILTERS,
  task: "",
});

export const YEAR_OPTIONS = ["2024", "2025", "2026"].map(year => [year, year]);
export const matchesPublicationYear = (work, period) =>
  !period || period === "all" || String(work.screening.publicYear) === period;

// Work-level criteria are shared; environment and force criteria remain
// protocol-level in the task library and work-level in the paper library.
export function matchesWorkFilters(work, filters, saved) {
  return (
    matchesPublicationYear(work, filters.period) &&
    (filters.scope !== "high" || work.screening.highAttention) &&
    (!filters.category || inCategory(work, filters.category)) &&
    (!filters.kind || (filters.kind === "VLA" ? isVLA(work) : !isVLA(work))) &&
    (!filters.reference || work.evaluationHighlights.length > 0) &&
    (!filters.bookmarks || saved?.[work.id]?.bookmark)
  );
}

export function selectPapers(catalogue, { query, filters, sort, saved }) {
  const search = query.toLowerCase();
  return catalogue.PAPERS.filter(
    (work) =>
      matchesWorkFilters(work, filters, saved) &&
      (!filters.domain || work.domains.includes(filters.domain)) &&
      (!filters.task || catalogue.hasTask(work.id, filters.task)) &&
      (!filters.bimanualCooperation || work.bimanualEvaluation?.type === "cooperative") &&
      (!filters.forceEvaluation ||
        work.experiments.some(
          (e) => e.forceEvaluation?.status === "reported",
        )) &&
      (!search || catalogue.searchByWork.get(work.id).includes(search)),
  ).sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name)
      : sort === "year"
        ? b.year - a.year
        : (b.attention[sort] ?? -1) - (a.attention[sort] ?? -1) ||
          b.year - a.year,
  );
}

export function filterTaskInstances(
  catalogue,
  records,
  { query, filters, saved },
) {
  const search = query.trim().toLowerCase();
  return records.flatMap((record) => {
    const work = catalogue.byId.get(record.work);
    if (
      work.resourceOnly ||
      !matchesWorkFilters(work, filters, saved)
    )
      return [];
    const workMatches =
      !search ||
      [
        work.name,
        work.fullTitle,
        work.baseline,
        catalogue.taskById.get(record.task)?.name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    const protocols = record.protocols.filter(
      (protocol) =>
        (!filters.bimanualCooperation ||
          (work.bimanualEvaluation?.type === "cooperative" &&
            work.bimanualEvaluation.taskIds.includes(protocol.id))) &&
        (!filters.domain ||
          protocol.evaluationModes.includes(filters.domain)) &&
        (!filters.forceEvaluation ||
          protocol.forceEvaluation?.status === "reported") &&
        (workMatches ||
          [
            protocol.task,
            protocol.originalTask,
            protocol.purpose,
            protocol.metric,
            protocol.method,
            protocol.setting,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search)),
    );
    return protocols.length ? [{ ...record, protocols }] : [];
  });
}

export function getTaskTopicName(topic) {
  return topic?.name || "";
}

export function getTaskKindOptions(topic, records) {
  const protocols = records.flatMap(record => record.protocols);
  const kinds = topic?.taskKinds || [...new Set(protocols.map(e => e.task))].map(name => ({ id: name, name }));
  return kinds.map(kind => ({ ...kind, count: protocols.filter(e => (e.taskKind || e.task) === kind.id).length }));
}

export function filterTaskKindInstances(records, kind) {
  if (!kind) return records;
  return records.flatMap(record => {
    const protocols = record.protocols.filter(e => (e.taskKind || e.task) === kind);
    return protocols.length ? [{ ...record, protocols }] : [];
  });
}

export function createTaskView(
  catalogue,
  records,
  { category, task, selectedProtocol },
) {
  const { D, PAPERS } = catalogue;
  const byTask = new Map();
  for (const record of records) {
    if (!byTask.has(record.task)) byTask.set(record.task, []);
    byTask.get(record.task).push(record);
  }
  const visibleTypes = D.taskTypes.filter((type) => byTask.has(type.id));
  const withVisibleName = (type, group = category) => {
    const relevant = (byTask.get(type.id) || []).map(record => ({
      ...record, protocols: record.protocols.filter(e => !group || e.taskGroups.includes(group)),
    }));
    return { ...type, name: getTaskTopicName(type, relevant) };
  };
  const groups = D.taskGroups.flatMap((group) => {
    const topics = visibleTypes.filter((type) => byTask.get(type.id).some(r => r.protocols.some(e => e.taskGroups.includes(group.id)))).map(type => withVisibleName(type, group.id));
    if (!topics.length) return [];
    const workIds = new Set(
      topics.flatMap((type) =>
        byTask.get(type.id).filter(r => r.protocols.some(e => e.taskGroups.includes(group.id))).map((record) => record.work),
      ),
    );
    return [{ group, topics, workCount: workIds.size }];
  });
  // Evaluation mode never changes capability membership.
  const types = visibleTypes.filter((type) =>
    !category || byTask.get(type.id).some(record =>
      record.protocols.some(protocol => protocol.taskGroups.includes(category)),
    ),
  ).map(type => withVisibleName(type));
  const matrixTypes = D.taskTypes.filter(
    (type) =>
      (!task || selectedProtocol || type.id === task.id) &&
      (!category || type.groups.includes(category)),
  ).map(type => withVisibleName(type));
  const matrixIds = new Set(matrixTypes.map((type) => type.id));
  const matrixMembership = new Map();
  for (const record of records) {
    if (!matrixIds.has(record.task)) continue;
    if (category && !record.protocols.some(e => e.taskGroups.includes(category))) continue;
    if (!matrixMembership.has(record.work))
      matrixMembership.set(record.work, new Set());
    matrixMembership.get(record.work).add(record.task);
  }
  return {
    types,
    groups,
    matrixTypes,
    getVisibleInstances: (id, group = category) => (byTask.get(id) || []).flatMap(record => {
      const protocols = record.protocols.filter(e => !group || e.taskGroups.includes(group));
      return protocols.length ? [{ ...record, protocols }] : [];
    }),
    matrixRows: PAPERS.filter((work) => matrixMembership.has(work.id)),
    hasMatrixTask: (work, topic) =>
      matrixMembership.get(work)?.has(topic) || false,
  };
}
