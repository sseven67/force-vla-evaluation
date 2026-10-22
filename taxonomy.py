# coding: utf-8
"""Four embodiment-led, overlapping paper categories; resources remain separate."""
import json
from pathlib import Path


def apply_taxonomy(data):
    config=json.loads((Path(__file__).parent/'research/taxonomy.json').read_text(encoding='utf-8'))
    ids={w['id'] for w in data['works']}
    resources=set(config['resourceOnly'])
    focus_excluded=set(config.get('researchFocusExcluded', []))
    coordination=json.loads((Path(__file__).parent/'research/bimanual_evaluations.json').read_text(encoding='utf-8'))
    bimanual=coordination['works']
    assert set(bimanual) <= ids - resources, 'Bimanual evaluation records must belong to method papers'
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
        if w['id'] in focus_excluded:
            w['researchFocus']=False
        else:
            w.pop('researchFocus', None)
        w['classificationNote']=config['notes'].get(w['id'],'')
        if w['id'] in bimanual:
            evaluation=bimanual[w['id']]
            task_ids={e['id'] for e in w['experiments']}
            assert set(evaluation['taskIds']) <= task_ids, w['id']+': invalid bimanual task reference'
            assert evaluation['type'] != 'cooperative' or evaluation['taskIds'], w['id']+': cooperative evaluation needs a task'
            w['bimanualEvaluation']=evaluation
        else:
            w.pop('bimanualEvaluation', None)
    return data


def apply_task_coordination(data):
    """Append reviewed task roles after all task-copy transformations."""
    config=json.loads((Path(__file__).parent/'research/bimanual_evaluations.json').read_text(encoding='utf-8'))
    for work in data['works']:
        for e in work['experiments']:
            setup=config.get('taskSetups', {}).get(e['id'])
            if setup:
                e['coordinationReview']=setup
                note='任务分工：'+setup['description']
                if note not in e['setting']:
                    e['setting']+='\n'+note
    for instance in data['taskInstances']:
        instance['setting']='；'.join(e['task']+'：'+e['setting'] for e in instance['protocols'])
    return data
