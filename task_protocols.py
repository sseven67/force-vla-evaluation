# coding: utf-8
"""Load explicit, source-linked task protocols without paper-level fallbacks."""
import json
from pathlib import Path


def apply_task_protocols(works):
    root=Path(__file__).parent/'research'
    protocols={}
    updates={}
    for name in ('primary','tactile','contact'):
        document=json.loads((root/f'task_protocols_{name}.json').read_text(encoding='utf-8'))
        rows=document['works']
        assert not protocols.keys() & rows.keys(), 'Overlapping protocol source ownership'
        protocols.update(rows)
        updates.update(document.get('workUpdates',{}))
    assert set(protocols)=={w['id'] for w in works}, 'Every work must have task-level protocols'
    required=('task','purpose','metric','setting','conditions','source','locator')
    for w in works:
        correction=updates.get(w['id'],{})
        assert set(correction)<=set(('tasks','trials','metrics','source','arxiv','locators','notes','warning'))
        w.update(correction)
        assert protocols[w['id']], w['id']+': missing tasks'
        entries=[]
        for index,raw in enumerate(protocols[w['id']],1):
            assert all(isinstance(raw.get(k),str) and raw[k].strip() for k in required), (w['id'],index)
            assert raw['source'].startswith('https://'), (w['id'],index,'source')
            entries.append(dict(raw,id=f"{w['id']}-e{index:02d}"))
        w['experiments']=entries
        # The short task index now follows the explicit tasks rather than old grouped summaries.
        w['tasks']='；'.join(e['task'] for e in entries)
