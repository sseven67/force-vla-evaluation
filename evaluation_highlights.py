# coding: utf-8
"""Attach a small, explicitly justified selection of evaluation designs."""
import json
from pathlib import Path

ROOT = Path(__file__).parent / 'research'


def apply_evaluation_highlights(data):
    doc = json.loads((ROOT / 'evaluation_highlights.json').read_text(encoding='utf-8'))
    reviews = {}
    for line in (ROOT / 'evaluation_design_review.tsv').read_text(encoding='utf-8').splitlines():
        if not line or line.startswith('#'):continue
        wid, status, reason = line.split('\t')
        assert wid not in reviews and status in ('selected', 'not_selected', 'insufficient_evidence')
        reviews[wid] = dict(status=status, reason=reason, checked=doc['checked'])
    assert set(reviews) == {w['id'] for w in data['works']}, 'Every work needs a design screening decision'
    assert set(doc['works']) == {wid for wid, review in reviews.items() if review['status'] == 'selected'}
    for w in data['works']:
        w['evaluationDesignReview'] = {**reviews[w['id']], 'source': w['evaluationReview']['checkedSource'], 'sections': w['evaluationReview']['checkedSections']}
        w['evaluationHighlights'] = doc['works'].get(w['id'], [])
        task_ids = {e['id'] for e in w['experiments']}
        for h in w['evaluationHighlights']:
            assert all(h.get(k) for k in ('title', 'taskIds', 'tasks', 'design', 'why', 'boundary', 'source', 'locator')), w['id']
            assert set(h['taskIds']) <= task_ids, (w['id'], 'Unknown task in selected design')
    data['evaluationHighlightPolicy'] = doc['policy']
    return data
