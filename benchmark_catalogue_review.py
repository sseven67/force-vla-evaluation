"""Apply the user-selected catalogue scope and the reviewed task inventories."""
import copy
import json
from pathlib import Path


def reviewed_task_groups(page, source, previews):
    groups = []
    for group in page['taskGroups']:
        items = []
        for task in group['tasks']:
            for subtask in task.get('subtasks') or [task]:
                name = subtask['name']
                items.append({
                    'name': name,
                    'goal': subtask.get('goal') or task['goal'],
                    'scoring': task['scoring'],
                    **previews.get(name, {}),
                })
        groups.append(dict(title=group['title'], domain='仿真',
                           source=group['sources'][0]['url'] if group.get('sources') else source,
                           locator='官方任务目录', items=items))
    return groups


def apply_benchmark_catalogue_review(data):
    review = json.loads((Path(__file__).parent / 'research' / 'benchmark_catalogue_review.json').read_text(encoding='utf-8'))
    removed = set(review['removedIds'])
    data['benchmarks'] = [b for b in data['benchmarks'] if b['id'] not in removed]
    for work in data['works']:
        work['relations'] = [r for r in work['relations'] if r['benchmark'] not in removed]
    data['extraRelations'] = [r for r in data['extraRelations'] if not any(r.get(k) in removed for k in ('fromBenchmark', 'toBenchmark'))]
    for b in data['benchmarks']:
        b['relatedResources'] = [bid for bid in b.get('relatedResources', []) if bid not in removed]
        reading = b['reading']
        record = review['records'][b['id']]
        if 'simulationDetail' in reading:
            page = reading['simulationDetail']
            page.update(copy.deepcopy(record.get('page', {})))
            # Search and previews use the same reviewed names as the detail page.
            reading['taskGroups'] = reviewed_task_groups(page, reading['source'], record.get('taskPreviews', {}))
        elif b['id'] != 'forcebench':
            reading.update(copy.deepcopy(record.get('reading', {})))
        b['tasks'] = [t['name'] for g in reading['taskGroups'] for t in g['items']]
    data['resourceUpdated'] = review['checked']
    from benchmark_metric_copy import apply_benchmark_metric_copy
    return apply_benchmark_metric_copy(data)
