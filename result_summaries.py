"""Concise paper findings, separated from limitations inferred from test scope."""
import json
from pathlib import Path


def apply_result_summaries(data):
    root = Path(__file__).parent / 'research'
    records = {}
    for line in (root / 'result_summaries.tsv').read_text(encoding='utf-8-sig').splitlines():
        if not line.strip():
            continue
        work_id, result, limitation = line.split('|')
        assert work_id not in records and result and limitation, work_id
        records[work_id] = (result, limitation)
    assert set(records) == {w['id'] for w in data['works']}
    evidence = json.loads((root / 'result_source_abstracts.json').read_text(encoding='utf-8'))
    for work in data['works']:
        result, limitation = records[work['id']]
        source = evidence[work['id']]
        work['resultSummary'] = dict(
            result=result,
            limitation=limitation,
            source=source['source'],
            locator='论文摘要与实验结果' if source['abstract'] else '官方项目评测结果',
            limitationSource=work['source'],
            limitationBasis='根据论文实验范围、评分和统计方式整理',
        )
        # Superseded by the consistent result/limitation presentation.
        work.pop('resultHighlights', None)
    return data
