"""Materialise the reviewed paper-library task plan without keyword fallback."""
from collections import OrderedDict, Counter
from copy import deepcopy


def rebuild_task_topics(data, plan):
    papers = {w['id']: w for w in data['works'] if not w['resourceOnly']}
    originals = {e['id']: e for w in papers.values() for e in w['experiments']}
    entries = [e for topic in plan['topics'] for e in topic['entries']]
    assert {e['protocol'] for e in entries} == set(originals), 'Review each added or removed paper-library evaluation in the task plan'
    previous = {t['id']: {e['id'] for r in data['taskInstances'] if r['task'] == t['id'] for e in r['protocols']} for t in data['taskTypes']}
    grouped = OrderedDict()
    source_entries = {}
    topics = []
    for topic in plan['topics']:
        names = list(dict.fromkeys(e['task'] for e in topic['entries']))
        kinds = [dict(id=str(i + 1), name=name) for i, name in enumerate(names)]
        kind_by_name = {k['name']: k['id'] for k in kinds}
        label = names[0] if len(names) == 1 else topic['name']
        assert len(names) == 1 or topic['description'], topic['id'] + ': multi-task topic needs an introduction'
        topics.append(dict(id=topic['id'], name=label, groups=[topic['group']], taskNames=names,
                           taskKinds=kinds, description=topic['description']))
        for entry in topic['entries']:
            pid = entry['protocol']
            e = deepcopy(originals[pid])
            e.setdefault('originalTask', e['task'])
            e.update(task=entry['task'], taskKind=kind_by_name[entry['task']],
                     taskGroups=[topic['group']], taskEntryId=pid + '-' + topic['id'],
                     taskClassification=dict(groups=[topic['group']], reason=entry['reason'],
                                             source=entry['source'], locator=entry['locator'], checked=plan['checked']))
            e['taskObjects'] = entry.get('objects', '')
            e['sharedSource'] = entry.get('sharedSource', False)
            # A split is a view of a source record, never another trial or score.
            source_entries.setdefault(pid, []).append(dict(topic=topic['id'], task=e['task'],
                group=topic['group'], kind=e['taskKind'], objects=e['taskObjects'],
                reason=entry['reason'], source=entry['source'], locator=entry['locator']))
            wid = pid.split('-e')[0]
            assert wid in papers
            grouped.setdefault((wid, topic['id']), []).append(e)
    for pid, parts in source_entries.items():
        original = originals[pid]
        original.setdefault('originalTask', original['task'])
        original['task'] = parts[0]['task'] if len(parts) == 1 else '蔬果削皮' if pid == 'E12-e02' else '抓取物品'
        original['taskGroups'] = list(dict.fromkeys(p['group'] for p in parts))
        original['taskEntries'] = parts
        original['taskClassification'] = dict(groups=original['taskGroups'],
            reason='；'.join(dict.fromkeys(p['reason'] for p in parts)), source=parts[0]['source'],
            locator=parts[0]['locator'], checked=plan['checked'])
    topic_by_id = {t['id']: t for t in topics}
    records = []
    for (wid, tid), protocols in grouped.items():
        record = dict(id=wid+'-'+tid, work=wid, task=tid, label=topic_by_id[tid]['name'], protocols=protocols,
                      source=protocols[0]['source'], offline=all(e['evaluationModes'] == ['离线'] for e in protocols), level='逐任务已整理')
        for dest, src in [('purpose','purpose'), ('method','method'), ('metrics','metric'), ('setting','setting'), ('locator','locator')]:
            record[dest] = '；'.join(e['task']+'：'+e[src] for e in protocols)
        records.append(record)
    # Keep previous links useful; an old broad topic resolves to its largest retained subset.
    destinations = {}
    for old, ids in previous.items():
        if old in topic_by_id:
            continue
        hits = Counter(r['task'] for r in records for e in r['protocols'] if e['id'] in ids)
        if hits:
            destinations[old] = hits.most_common(1)[0][0]
    for old, target in data.get('taskTopicAliases', {}).items():
        target = destinations.get(target, target)
        if old not in topic_by_id and target in topic_by_id:
            destinations.setdefault(old, target)
    data.update(taskTypes=topics, taskInstances=records, taskTopicAliases=destinations)
    for work in papers.values():
        work['tasks'] = '；'.join(dict.fromkeys(e['task'] for r in records if r['work'] == work['id'] for e in r['protocols']))
    assert sum(len(r['protocols']) for r in records) == plan['taskContentCount']
    return data
