"""Keep metric overviews short and task criteria specific, after page overrides."""
import json
from pathlib import Path


def apply_benchmark_metric_copy(data):
    records = json.loads((Path(__file__).parent / 'research' / 'benchmark_metric_copy.json').read_text(encoding='utf-8'))['records']
    for benchmark in data['benchmarks']:
        if benchmark['id'] not in records:
            continue
        rule = records[benchmark['id']]
        reading = benchmark['reading']
        if benchmark['id'] == 'forcebench':
            reading['detailPage']['metricSummary'] = rule['basic']
            tasks = [task for group in reading['taskGroups'] for task in group['items']]
        else:
            page = reading['simulationDetail']
            for row in page['facts']:
                if row[0] == '主要评价指标':
                    row[1] = rule['basic']
            groups = page['taskGroups'] + page.get('real', {}).get('groups', [])
            tasks = [task for group in groups for task in group['tasks']]
        for task in tasks:
            task['metricSummary'] = rule['taskMetric']
            specific = rule.get('tasks', {}).get(task.get('englishName'), {})
            task.update(specific)
            task['metricLabel'] = task['metricSummary'].split('：', 1)[0]
            focus_key = task['protocolId'] if benchmark['id'] == 'forcebench' else task['englishName']
            task['focus'] = task.get('focus') or rule['taskFocus'][focus_key]
            task.pop('mechanism', None)
    from benchmark_subtask_success import apply_benchmark_subtask_success
    return apply_benchmark_subtask_success(data)
