"""Attach reviewed, benchmark-specific six-field usage records."""
import copy
import json
from pathlib import Path

USAGE_FIELDS = ['研究目标', '本体及力觉／触觉表示形式', '复用内容', '改动方式', '评测指标', '其他仿真评测']


def apply_benchmark_usage(data):
    records = json.loads((Path(__file__).parent / 'research' / 'benchmark_usage.json').read_text(encoding='utf-8'))['records']
    works = {w['id']: w for w in data['works']}
    for benchmark in data['benchmarks']:
        if benchmark['id'] not in records:
            continue
        studies = {s['id']: s for s in benchmark.get('externalUsers', [])}
        usage = []
        for record in records[benchmark['id']]:
            entry = copy.deepcopy(record)
            if 'workId' in entry:
                wid = entry.pop('workId')
                work = works[wid]
                entry.update(id=wid, name=work['name'], source=work['source'],
                             metadata=copy.deepcopy(data['resourceWorkMetadata'].get(wid)))
            else:
                sid = entry.pop('studyId')
                study = studies[sid]
                entry.update(id=sid, name=study['name'], source=study['source'], metadata=copy.deepcopy(study.get('metadata')))
            assert [row['label'] for row in entry['fields']] == USAGE_FIELDS, benchmark['id']
            assert all(row['text'] for row in entry['fields'])
            usage.append(entry)
        benchmark['usageWorks'] = usage
    return data
