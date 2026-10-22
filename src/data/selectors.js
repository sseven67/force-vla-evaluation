import { inCategory, isResearchFocus, isVLA } from "./catalogue.js";

export const DEFAULT_WORK_FILTERS = Object.freeze({
  period: "recent",
  category: "",
  kind: "",
  domain: "",
  reference: false,
  forceEvaluation: false,
  bookmarks: false,
});

export const DEFAULT_PAPER_FILTERS = Object.freeze({
  ...DEFAULT_WORK_FILTERS,
  scope: "priority",
  task: "",
  bimanualCooperation: false,
});

// Work-level criteria are shared; environment and force criteria remain
// protocol-level in the task library and work-level in the paper library.
export function matchesWorkFilters(work, filters, saved) {
  return (
    (!filters.period ||
      filters.period !== "recent" ||
      work.screening.inWindow) &&
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
      (filters.scope === "all" ||
        (work.screening.grade === "A" &&
          (filters.scope !== "focus" || isResearchFocus(work)))) &&
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
  { query, filters, onlyPriority, saved },
) {
  const search = query.trim().toLowerCase();
  return records.flatMap((record) => {
    const work = catalogue.byId.get(record.work);
    if (
      (onlyPriority && work.screening.grade !== "A") ||
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
  const types = visibleTypes.filter(
    (type) => !category || type.group === category,
  );
  const groups = D.taskGroups.flatMap((group) => {
    const topics = visibleTypes.filter((type) => type.group === group.id);
    if (!topics.length) return [];
    const workIds = new Set(
      topics.flatMap((type) =>
        byTask.get(type.id).map((record) => record.work),
      ),
    );
    return [{ group, topics, workCount: workIds.size }];
  });
  const matrixTypes = D.taskTypes.filter(
    (type) =>
      (!task || selectedProtocol || type.id === task.id) &&
      (!category || type.group === category),
  );
  const matrixIds = new Set(matrixTypes.map((type) => type.id));
  const matrixMembership = new Map();
  for (const record of records) {
    if (!matrixIds.has(record.task)) continue;
    if (!matrixMembership.has(record.work))
      matrixMembership.set(record.work, new Set());
    matrixMembership.get(record.work).add(record.task);
  }
  return {
    types,
    groups,
    matrixTypes,
    getVisibleInstances: (id) => byTask.get(id) || [],
    matrixRows: PAPERS.filter((work) => matrixMembership.has(work.id)),
    hasMatrixTask: (work, topic) =>
      matrixMembership.get(work)?.has(topic) || false,
  };
}
