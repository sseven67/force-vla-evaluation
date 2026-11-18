"""Apply the source-reviewed simulation benchmark pages after resource registration."""
import copy
import json
from pathlib import Path
from urllib.parse import urlencode


def apply_simulation_details(data):
    doc = json.loads((Path(__file__).parent / 'research' / 'simulation_details.json').read_text(encoding='utf-8'))
    additions = json.loads((Path(__file__).parent / 'research' / 'benchmark_additions.json').read_text(encoding='utf-8'))
    doc['records'].update(additions['records'])
    doc['checked'] = max(doc['checked'], additions['checked'])
    for bid, overrides in additions.get('pageOverrides', {}).items():
        doc['records'][bid]['page'].update(copy.deepcopy(overrides))
    data['resourceUpdated'] = max(data.get('resourceUpdated', ''), additions['checked'])
    by_id = {b['id']: b for b in data['benchmarks']}
    for bid, record in doc['records'].items():
        page = copy.deepcopy(record['page'])
        facts = {row[0]: row[1] for row in page['facts']}
        if bid not in by_id:
            source = page['sources'][0]['url']
            repository = record.get('repository')
            b = dict(id=bid, name=record['name'], resourceType='benchmark', typeLabel='评测基准', kind='评测基准',
                     domain=record.get('domain', '仿真'), source=source, resourceUrl=repository or source,
                     introducedBy=dict(title=record['paperTitle'], source=source),
                     focus=page['introduction'], detail=page['introduction'], verdict='任务、评分与评测边界见详情',
                     reason=page['introduction'], protocol=page['evaluation'], release='论文与官方资源见详情页。',
                     scope=record['focus'], evidence=[dict(url=s['url'], locator=s['label']) for s in page['sources']],
                     auditChecked=record.get('checked', doc['checked']), newlyCollected=True, externalUsers=[],
                     metadata=dict(scholar=None, scholarStatus='not-checked',
                                   scholarSource='https://scholar.google.com/scholar?' + urlencode({'q':record['paperTitle']}),
                                   stars=None, starsStatus='unavailable' if repository else 'no-repository', repository=repository,
                                   dateSource=source, dateStatus='not-checked', dateBasis='见原始论文'))
            data['benchmarks'].append(b)
            by_id[bid] = b
        b = by_id[bid]
        if record.get('metadata'):
            b['metadata'].update(copy.deepcopy(record['metadata']))
        b['name'] = record['name']
        b['domain'] = record.get('domain', b['domain'])
        if bid == 'libero-plus':
            b['source'] = page['sources'][0]['url']
            b['introducedBy'].update(title=record['paperTitle'], source=b['source'])
        if 'reading' not in b:
            b['reading'] = dict(inputs=facts['输入'], evaluation=[page['evaluation'], record['focus']],
                                force=record['force'], relevance=record['focus'], using=[], source=b['source'],
                                taskGroups=[dict(title=g['title'], domain='仿真', source=page['sources'][0]['url'],
                                                 locator='任务定义与评测协议', items=[dict(name=t['name'], goal=t['goal'], scoring=t['scoring']) for t in g['tasks']]) for g in page['taskGroups']])
            b['tasks'] = [t['name'] for g in page['taskGroups'] for t in g['tasks']]
        b['reading'].update(simulationDetail=page, summary=page['introduction'], introduction=[page['introduction']])
        for item in record.get('usageStudies', []):
            study = copy.deepcopy(item)
            work_id = study.pop('metadataWorkId', None)
            if work_id:
                work = next(w for w in data['works'] if w['id'] == work_id)
                study.update(source=work['source'], title=work['fullTitle'], resourceId=bid,
                             metadata=copy.deepcopy(data['resourceWorkMetadata'][work_id]),
                             usage=study['usageDetails'][0]['text'])
            b['externalUsers'] = [s for s in b.get('externalUsers', []) if s['id'] != study['id']] + [study]
        # LIBERO's old upstream-only introduction is replaced by its original benchmark protocol.
        if bid == 'libero':
            b['reading']['inputs'] = facts['输入']
            b['reading']['evaluation'] = [page['evaluation'], '按任务序列回测已学任务，分别衡量前向迁移、负向迁移与长期保留。']
    from benchmark_usage import apply_benchmark_usage
    from benchmark_catalogue_review import apply_benchmark_catalogue_review
    return apply_benchmark_catalogue_review(apply_benchmark_usage(data))
