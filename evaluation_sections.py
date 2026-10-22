"""Separate scored tasks from diagnostic, hardware and repeat-test comparisons."""
import json
from pathlib import Path

ROOT = Path(__file__).parent / 'research'


def apply_evaluation_sections(data):
    moves = json.loads((ROOT / 'evaluation_sections.json').read_text(encoding='utf-8-sig'))
    additions = {
        'C01': dict(id='C01-comparison-2', question='哪种方式更容易采集完整削皮示教？', objects='手持工具直接示教／带力反馈的遥操作', tasks='人工完成整根西葫芦削皮', controlled='按原文完整采集流程比较', evaluation='完成用时和操作中断次数', lesson='比较的是采集示教是否方便，不是自主削皮策略的成绩。', note='自主削皮的完成标准和评分保留在评测任务中。'),
        'C11': dict(id='C11-comparison-2', question='仿真触觉画面与真实传感器画面相差多少？', objects='仿真触觉／真实触觉', tasks='球、灯泡、齿轮的接触图像', controlled='比较两类图像提取出的信息', evaluation='FID、KID，数值越小表示两类图像越接近', lesson='用来判断触觉仿真的差距，不代表机器人完成任务的成功率。', note='操作任务的成功率单独比较。'),
        'C15': dict(id='C15-comparison-3', question='力反馈遥操作是否更好用？', objects='论文比较的不同示教遥操作方式', tasks='人工遥控操作', controlled='按原文用户实验设置比较', evaluation='人工完成率、用时，以及操作者认为有多难', lesson='反映示教工具的使用体验，不计入自主操作成功率。', note='人工遥控与机器人自主执行分别统计。'),
    }
    all_records = {}
    for work in data['works']:
        cards = {c['id']: c for c in work['comparisonMethods']}
        records = {e['id']: e for e in work['experiments']}
        for card in cards.values():
            records.update({e['id']: e for e in card.get('checks', [])})
            card['checks'] = []
        work['experiments'] = [e for eid, e in records.items() if eid not in moves]
        work['tasks'] = '；'.join(e['task'] for e in work['experiments'])
        for eid, e in records.items():
            if eid not in moves:
                continue
            target = moves[eid]
            if target['comparison'] not in cards:
                new = dict(additions[work['id']], source=e['source'], locator=e['locator'], checks=[])
                work['comparisonMethods'].append(new)
                cards[new['id']] = new
            e['task'] = target['name']
            e['section'] = 'comparison'
            cards[target['comparison']]['checks'].append(e)
        for h in work['evaluationHighlights']:
            h['section'] = 'comparison' if all(eid in moves for eid in h['taskIds']) else 'tasks'
        all_records.update(records)
        # Work-level environment filters include the separately displayed comparisons.
        work['domains'] = list(dict.fromkeys(mode for e in records.values() for mode in e['evaluationModes']))
    remaining = {e['id']: e for w in data['works'] for e in w['experiments']}
    instances = []
    for instance in data['taskInstances']:
        instance['protocols'] = [remaining[e['id']] for e in instance['protocols'] if e['id'] in remaining]
        if instance['protocols']:
            instances.append(instance)
    data['taskInstances'] = instances
    by_id = {w['id']: w for w in data['works']}
    for resource in data['benchmarks']:
        owner = by_id.get(resource['id'].removeprefix('suite-').upper())
        if owner and resource['resourceType'] == 'paper_protocol':
            resource['tasks'] = [e['task'] for e in owner['experiments']]
    assert set(moves) <= set(all_records), 'Every reclassified experiment must be preserved'
    return data
