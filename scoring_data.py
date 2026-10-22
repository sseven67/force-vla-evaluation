# coding: utf-8
"""Separate short scoring labels from task-specific judging and calculation methods.

The TSV reorganizes existing reviewed facts; it is not another source verification.
Raw evidence keeps its original fields. Generated protocols expose `method` only.
"""
from pathlib import Path

ROOT = Path(__file__).parent / 'research'


def apply_scoring(works):
    tasks = {e['id']: e for w in works for e in w['experiments']}
    presentations = {}
    for line in (ROOT / 'scoring_presentation.tsv').read_text(encoding='utf-8').splitlines():
        if not line or line.startswith('#'):
            continue
        example, labels, explanation = line.split('\t')
        original = tasks[example]['metric']
        assert original not in presentations, f'Duplicate metric presentation: {example}'
        presentations[original] = (labels, explanation)
    assert set(presentations) == {e['metric'] for e in tasks.values()}, (
        'Every existing metric needs an explicit scoring presentation',
        [(e['id'], e['metric']) for e in tasks.values() if e['metric'] not in presentations],
    )
    for e in tasks.values():
        labels, explanation = presentations[e['metric']]
        e['metric'] = labels
        # Identical metric labels can still use different task-specific scores.
        scoring = e.pop('scoringExplanation', explanation)
        e['method'] = '判定与任务要求：' + e.pop('conditions') + '\n计算与计分：' + scoring


def apply_metric_summaries(works):
    summaries = {}
    for line in (ROOT / 'work_metric_summaries.tsv').read_text(encoding='utf-8').splitlines():
        if not line or line.startswith('#'):
            continue
        wid, text = line.split('\t')
        assert wid not in summaries and text.strip(), wid
        summaries[wid] = text
    assert set(summaries) == {w['id'] for w in works}, 'Every work needs a readable metric summary'
    for w in works:
        w['metrics'] = summaries[w['id']]
