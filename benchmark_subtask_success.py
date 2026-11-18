"""Attach source-checked completion summaries to the displayed task examples."""
import copy
import json
from pathlib import Path


def apply_benchmark_subtask_success(data):
    review = json.loads((Path(__file__).parent / 'research' / 'benchmark_subtask_success.json').read_text(encoding='utf-8'))
    for benchmark in data['benchmarks']:
        page = benchmark.get('reading', {}).get('simulationDetail')
        if not page:
            continue
        rule = review['records'].get(benchmark['id'], {})
        for domain, groups in [('sim', page['taskGroups']), ('real', page.get('real', {}).get('groups', []))]:
            for group in groups:
                for task in group['tasks']:
                    parent = task['englishName']
                    extra = rule.get('groups', {}).get(parent)
                    if extra:
                        task['subtasks'] = copy.deepcopy(extra)
                        task['subtasksLabel'] = '任务示例'
                        task.pop('examples', None)
                    subtasks = task.get('subtasks', [])
                    shown = subtasks if len(subtasks) <= 20 else subtasks[:4]
                    for item in shown:
                        key = domain + '/' + item.get('englishName', item['name'])
                        source = rule.get('tasks', {}).get(key)
                        if not source and rule.get('reuse'):
                            source = review['records'][rule['reuse']].get('tasks', {}).get(key)
                        assert source and source.get('success') and source.get('successSource'), (benchmark['id'], key)
                        item.update(copy.deepcopy(source))
    return data
