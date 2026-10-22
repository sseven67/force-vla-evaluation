"""Paper-level objectives, kept distinct from evaluation purposes and settings."""
import json
from pathlib import Path


def apply_research_objectives(works):
    source = Path(__file__).parent / 'research' / 'research_objectives.json'
    records = json.loads(source.read_text(encoding='utf-8'))
    goals = records['objectives']
    assert set(goals) == {w['id'] for w in works}, 'Research objectives must cover every work exactly'
    for w in works:
        url = 'https://arxiv.org/abs/' + w['arxiv'] if w.get('arxiv') else w['source']
        w['researchObjective'] = dict(
            text=goals[w['id']], source=url,
            locator='论文摘要' if w.get('arxiv') else '作者项目页 Abstract',
            checked=records['checked'],
        )
