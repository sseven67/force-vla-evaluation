const split = text => (text || '').split(/[；。\n]/).map(s => s.trim()).filter(Boolean);
const stripLabel = text => text.replace(/^(完成要求|判定与任务要求|计分|计算与计分)：/, '');

export function comparisonTopics(catalogue, works) {
  return catalogue.D.taskTypes.flatMap(type => {
    const entries = works.map(work => {
      const ids = new Set(catalogue.getWorkInstances(work.id).filter(i => i.task === type.id).flatMap(i => i.protocols.map(e => e.id)));
      return { work, experiments: work.experiments.filter(e => ids.has(e.id)) };
    });
    const coverage = entries.filter(e => e.experiments.length).length;
    return coverage ? [{ ...type, entries, coverage }] : [];
  }).sort((a, b) => b.coverage - a.coverage);
}

export function settingSections(experiment) {
  if (!experiment) return { trials: [], training: [], changes: [], stops: [] };
  const settings = split(experiment.setting).flatMap(s => s.split('，').map(s => s.trim()).filter(Boolean));
  const requirements = split(stripLabel(experiment.method.split('\n')[0]));
  return {
    trials: settings.filter(s => /\d/.test(s) && /次|样本|评估/.test(s) && !/示教|训练|每秒|Hz/.test(s)),
    training: settings.filter(s => /\d/.test(s) && /示教|训练样本|训练数据|条示范/.test(s)),
    changes: [...new Set([...settings, ...requirements].filter(s => /改变|随机|变化|未见|没见|更换|换成|另换|遮挡|干扰|移动物体|固定|模糊|暗光|低光|降低|升高|分别测试|另测试|额外/.test(s)))],
    stops: settings.filter(s => /停止|停机|超时|时限|最多|上限|超过/.test(s)),
  };
}

export function scoringParts(experiment) {
  if (!experiment) return { requirement: '', calculation: '', metrics: [] };
  const paragraphs = experiment.method.split('\n').map(stripLabel);
  return { requirement: paragraphs[0], calculation: paragraphs.slice(1).join('\n'), metrics: experiment.metric.split('；') };
}

export function forceComparison(experiment) {
  if (!experiment) return '没有该任务记录';
  const f = experiment.forceEvaluation;
  if (f.status !== 'reported') return f.label;
  return f.explanation?.comparison || f.summary;
}

export function rowDifference(values) {
  if (values.some(value => value == null)) return '覆盖不同';
  if (values.some(value => value === '' || (Array.isArray(value) && !value.length))) return '需看完整设置';
  const present = values;
  return new Set(present.map(value => JSON.stringify(value))).size === 1 ? '所列内容一致' : '内容有差异';
}
