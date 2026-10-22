"""Attach source-linked benchmark introductions and concrete task descriptions."""
import copy
import json
from pathlib import Path


def apply_benchmark_details(data):
    doc = json.loads((Path(__file__).parent / 'research' / 'benchmark_details.json').read_text(encoding='utf-8'))
    records = doc['records']
    assert set(records) == {b['id'] for b in data['benchmarks'] if b['resourceType'] == 'benchmark'}
    protocols = {e['id']: e for w in data['works'] for e in w['experiments']}
    for benchmark in data['benchmarks']:
        if benchmark['id'] not in records:
            continue
        reading = copy.deepcopy(records[benchmark['id']])
        assert all(reading.get(k) for k in ('summary', 'introduction', 'inputs', 'evaluation', 'force', 'relevance', 'taskGroups', 'source'))
        for group in reading['taskGroups']:
            group.setdefault('source', reading['source'])
            for task in group['items']:
                assert task['name'] and task['goal'] and task['scoring']
                if task.get('protocolId'):
                    assert task['protocolId'] in protocols, task['protocolId']
        if benchmark['id'] == 'tacverse':
            for group in reading['taskGroups']:
                group['source'] = 'https://github.com/LannWei/Tactile_Database'
        benchmark['reading'] = reading
        benchmark['detail'] = reading['introduction'][0]
        benchmark['tasks'] = [task['name'] for group in reading['taskGroups'] for task in group['items']]
    return data
