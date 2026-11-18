"""Apply the user-selected catalogue scope and the reviewed task inventories."""
import copy
import json
from pathlib import Path


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
        if b['id'] == 'forcebench':
            page = reading['detailPage']
            page['overviewFigure'] = page.pop('figure', None)
            for group in page['categories']:
                group.pop('figure', None)
        elif 'simulationDetail' in reading:
            page = reading['simulationDetail']
            page.update(copy.deepcopy(record.get('page', {})))
            page['overviewFigure'] = page.pop('figure', None)
            for group in page['taskGroups']:
                group.pop('figure', None)
            if page.get('real'):
                page['real'].pop('figure', None)
                page['real'].pop('figures', None)
                for group in page['real']['groups']:
                    group.pop('figure', None)
            for comparison in page['comparisons']:
                comparison.pop('figure', None)
            # Search and previews use the same reviewed names as the detail page.
            reading['taskGroups'] = [dict(title=g['title'], domain='仿真', source=g['sources'][0]['url'] if g.get('sources') else reading['source'], locator='官方任务目录',
                items=[dict(name=s['name'], goal=s.get('goal') or t['goal'], scoring=t['scoring']) for t in g['tasks'] for s in (t.get('subtasks') or [t])]) for g in page['taskGroups']]
        else:
            reading.update(copy.deepcopy(record.get('reading', {})))
        b['tasks'] = [t['name'] for g in reading['taskGroups'] for t in g['items']]
    data['resourceUpdated'] = review['checked']
    from benchmark_metric_copy import apply_benchmark_metric_copy
    return apply_benchmark_metric_copy(data)
