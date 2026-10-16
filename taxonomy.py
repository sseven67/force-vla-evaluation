# coding: utf-8
"""Four embodiment-led, overlapping paper categories; resources remain separate."""
import json
from pathlib import Path


def apply_taxonomy(data):
    config=json.loads((Path(__file__).parent/'research/taxonomy.json').read_text(encoding='utf-8'))
    ids={w['id'] for w in data['works']}
    resources=set(config['resourceOnly'])
    assigned=set().union(*(set(v) for v in config['members'].values()))
    assert not assigned & resources, 'Resource-only records must not occupy paper categories'
    assert assigned | resources == ids, 'Every record needs an explicit paper or resource assignment'
    assert len(config['groups']) == 4
    assert set(config['members']) == {g['id'] for g in config['groups']}
    data['groups']=config['groups']
    data['taxonomyNote']=config['resourceNote']
    for w in data['works']:
        w.pop('family',None)
        w['categories']=[g['id'] for g in config['groups'] if w['id'] in config['members'][g['id']]]
        w['resourceOnly']=w['id'] in resources
        w['classificationNote']=config['notes'].get(w['id'],'')
    return data
