"""Separate benchmark protocols, provisional suites, platforms, and paper experiments."""
import json
from pathlib import Path


def apply_benchmark_audit(data):
    audit = json.loads((Path(__file__).parent / 'research' / 'benchmark_audit.json').read_text(encoding='utf-8'))
    works = data['works']
    by_id = {w['id']: w for w in works}
    by_resource = {b['id']: b for b in data['benchmarks']}
    assert set(audit['records']) <= set(by_resource)
    for b in data['benchmarks']:
        owner = next((w for w in works if any(r['benchmark'] == b['id'] and r['type'] in ('self', 'proposes') for r in w['relations'])), None)
        if owner:
            b['introducedBy'] = dict(title=owner['fullTitle'], source=owner['source'], workId=owner['id'])
        b.update(audit['records'].get(b['id'], {}))
        if 'resourceType' not in b:
            assert owner, b['id'] + ': missing source work'
            b.update(
                resourceType='paper_protocol', typeLabel='论文评测方案', verdict='不列为独立基准',
                reason='当前条目整理该论文的实验；没有据此确认作者发布了独立、可复用的同名基准。',
                protocol='任务、指标、测试设置和对比方法见该论文详情。',
                release='公开情况见对应论文的资源入口。', resourceUrl=owner.get('github') or owner['source'],
                scope='可以参考评测设计；同名任务不代表不同论文采用同一协议。',
                evidence=[dict(url=owner['source'], locator='对应工作实验及评测说明')],
            )
        assert b.get('introducedBy'), b['id'] + ': missing proposer'
        b['auditChecked'] = audit['checked']
        b['kind'] = b['typeLabel']
    for b in audit['additions']:
        assert b['id'] not in by_resource
        data['benchmarks'].append(dict(b, kind=b['typeLabel'], auditChecked=audit['checked'], newlyCollected=True))
    # Keep the original proposer distinct from users or simulator providers.
    for bid, wid in [('suite-t04', 'T04'), ('suite-t08', 'T08'), ('suite-c11', 'C11'), ('suite-c12', 'C12')]:
        r = next(r for r in by_id[wid]['relations'] if r['benchmark'] == bid)
        r.update(type='proposes', label='提出并评测')
    for bid in ['suite-c10', 'suite-c14']:
        for w in works:
            for r in w['relations']:
                if r['benchmark'] == bid:
                    r.update(type='provides', label='提供平台与示例')
    for r in by_id['E04']['relations']:
        if r['benchmark'] == 'neoreal':
            r.update(label='采用9项任务', note='套件由N₀-Foundation提出；原始范围10项，本论文评测9项。')
        if r['benchmark'] == 'neosim':
            r.update(label='采用12项任务', note='采用N₀-Foundation的NeoSim；与UniVTAC八任务分开统计。')
    data['benchmarkAudit'] = dict(checked=audit['checked'], criteria=audit['criteria'])
    return data
