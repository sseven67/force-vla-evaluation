"""Method-focused comparison cards; keep uncertainty separate from experimental results."""
import json
from pathlib import Path


def apply_comparison_methods(data):
    records = json.loads((Path(__file__).parent / 'research' / 'comparison_methods.json').read_text(encoding='utf-8'))
    assert set(records['works']) == {w['id'] for w in data['works']}
    for w in data['works']:
        cards = []
        for index, row in enumerate(records['works'][w['id']]):
            assert len(row) == len(records['format']) and all(row), w['id']
            card = dict(zip(records['format'], row))
            card.update(id=f"{w['id']}-comparison-{index + 1}", source=w['source'])
            cards.append(card)
        w['comparisonMethods'] = cards
    return data
