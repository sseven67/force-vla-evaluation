# coding: utf-8
"""Apply explicit source-reviewed, task-scoped force evaluation decisions."""
import json
from pathlib import Path

ROOT = Path(__file__).parent / 'research'
LABELS = {'reported': '有', 'not_reported': '原文未说明', 'pending': '是否报告尚不明确'}


def append_setting(e, text):
    e['setting'] += ' ' + text


def replace_method(e, old, new):
    assert old in e['method'], (e['id'], 'reviewed safety text changed', old)
    e['method'] = e['method'].replace(old, new)


def apply_force_evaluation(works):
    reviews = {}
    for line in (ROOT / 'force_evaluation_work_review.tsv').read_text(encoding='utf-8').splitlines():
        if not line or line.startswith('#'):continue
        wid, status, locator, note = line.split('\t')
        assert wid not in reviews
        reviews[wid] = dict(status=status, locator=locator, note=note, metrics=[])
    assert set(reviews) == {w['id'] for w in works}, 'Every work needs a force-specific source review'
    doc = json.loads((ROOT / 'force_evaluation_tasks.json').read_text(encoding='utf-8'))
    overrides = {}
    tasks = {e['id']: e for w in works for e in w['experiments']}
    for group in doc['groups']:
        for eid in group['tasks']:
            assert eid in tasks and eid not in overrides, ('Unknown/duplicate force review', eid)
            overrides[eid] = {k: v for k, v in group.items() if k != 'tasks'}
    for w in works:
        for e in w['experiments']:
            r = {**reviews[w['id']], **overrides.get(e['id'], {})}
            assert r['status'] in LABELS and r['locator'] and r['note']
            assert bool(r['metrics']) == (r['status'] == 'reported'), e['id']
            if r['status'] == 'reported':
                assert r.get('evaluatesAutonomousExecution') is True, e['id']
                assert r.get('summary') and all(r.get('explanation', {}).get(k) for k in ('method', 'comparison')), e['id']
            e['forceEvaluation'] = {
                **r, 'label': LABELS[r['status']], 'checked': w['evaluationReview'].get('checked', doc['checked']),
                'source': w['evaluationReview']['checkedSource'],
            }

        # Safety conditions remain settings; they do not create force indicators.
        if w['id'] == 'W02':
            for e in w['experiments']:e['metric'] = '成功率（完成／失败）'
        if w['id'] == 'W05':
            e = tasks['W05-e03']
            replace_method(e, '触发保护停机判失败；', '')
            append_setting(e, '保护停止规则：触发保护停机则该次测试判失败。')
            e = tasks['W05-e04']
            e['metric'] = '成功率（完成／失败）；实际用力与40 N目标相差的百分比（取平均）'
            replace_method(e, '目标垂直接触表面的力40 N，瞬时力超过75 N触发停止。', '目标垂直接触表面的力为40 N。')
            replace_method(e, '；另记录是否触发保护停机。', '。')
            append_setting(e, '保护停止规则：瞬时接触力超过75 N时停止；这是测试设置，不是力评测指标。')
            e['method'] = '判定与任务要求：完成擦拭，目标接触力40 N；分别测试正常摆放和白板降低6 cm的情况。\n计算与计分：记录是否完成擦拭；力的评分方式见下方。'
        if w['id'] in ('W03', 'W17'):
            for e in w['experiments']:
                if e['forceEvaluation']['status'] == 'reported':
                    e['method'] = e['method'].split('\n')[0] + '\n计算与计分：成功次数除以测试总次数；力另行比较。'
        if w['id'] == 'W07':
            for e in w['experiments']:
                e['metric'] = '成功率（完成／失败）；最大接触力的平均值及波动（多个任务合在一起算）；成功测试的平均完成时间（多个任务合在一起算）'
                e['method'] = e['method'].split('\n')[0] + '\n计算与计分：每个任务各算成功率；完成时间只统计成功的尝试，单臂、双臂分别合并多个任务，没有每个任务单独的用时结果。'
        if w['id'] == 'W09':
            for e in w['experiments'][:2]:
                e['method'] = e['method'].split('\n')[0] + '\n计算与计分：按任务是否完成统计成功率。'
        if w['id'] == 'W11':
            for e in w['experiments']:
                e['metric'] = '成功率（完成／失败）；夹爪和机械臂的平均用力；用力最大的5%读数的平均值（多个物体按轻／重指令合在一起算）'
                e['method'] = '判定与任务要求：把指定物体正确放入篮筐；另测轻／重指令及训练没见过的词语。\n计算与计分：完成次数除以测试次数得到成功率。附录另测的动作重放结果，不是机器人自主完成任务的成功率。'
        if w['id'] == 'W16':
            for e in w['experiments']:
                text = '超过任务时限或触发FR3安全停止记失败；具体秒数原文未说明。'
                replace_method(e, text, '')
                append_setting(e, text)
        if w['id'] == 'E10':
            for e in w['experiments']:
                if e['id'] == 'E10-e02':
                    e['metric'] = '指定超声图像获取成功率；扫描步数；探头接触力变化（仅第2项任务示例）'
                    e['method'] = '判定与任务要求：获取本任务指定的超声图像；另测不同躺卧位置。\n计算与计分：记录图像获取是否成功，以及用了多少扫描步数。'
                else:
                    e['metric'] = '标准切面获取成功率；扫描步数'
                    replace_method(e, '力曲线评价稳定性，不把示例7.5 N当作所有任务统一成功标准。', '')
                    e['method'] = e['method'].split('\n')[0] + '\n计算与计分：判断是否获得要求的超声图像，另记用了多少扫描步数；本任务是否单独报告力结果，见力相关评测说明。'
        if w['id'] == 'C01':
            e = tasks['C01-e01']
            e['metric'] += '；示例操作的平均接触力（N）'
            e['method'] = '判定与任务要求：工具从人工示范时相同的稍后上方位置开始；削下任意长度的皮且不损伤物体算基本成功，连续皮长超过10 cm算严格成功。\n计算与计分：基本、严格两种成功率分别统计。'
        if w['id'] == 'C03':
            e = tasks['C03-e03']
            replace_method(e, '；末端扭矩过大时安全停止。', '。')
            append_setting(e, '保护停止规则：末端扭矩过大时安全停止；原文未给数字上限。')
            e['method'] = e['method'].split('\n')[0] + '\n计算与计分：成功次数除以测试总次数；用力情况另外比较。'
        if w['id'] == 'C16':
            for e in w['experiments'][:6]:
                text = '力超过40 N或最近1秒平均力超过30 N时停止；最多200次决策（行为克隆对照250次）。'
                replace_method(e, text, '')
                append_setting(e, '保护停止与时长设置：' + text)
                e['metric'] = '成功率（完成／失败）；各方向推拉力和扭转力的平均大小；用力变化的大小（方差；最终给出六个任务的平均结果）'
                e['method'] = '判定与任务要求：完成至少80%的目标操作才算任务成功。\n计算与计分：成功次数除以测试次数；接触力另外比较。'
        if w['id'] == 'C18':
            for eid in ['C18-e01', 'C18-e03']:
                e = tasks[eid]
                e['metric'] += '；受力惩罚发生比例（训练阶段）；平均受力惩罚'
                e['method'] += '\n力安全性评分：统计训练过程中受力惩罚的发生比例，及每次训练尝试的平均惩罚；惩罚随超过上限的力大小增加，不是只列力上限参数。'
            tasks['C18-e04']['method'] = '判定与任务要求：靠近污点、接触表面，用到10 N后开始画圆擦拭。\n计算与计分：比较各方法耗能多少，以及实际运动与目标位置、方向的差距。'
        if w['id'] == 'E09':
            for e in w['experiments']:
                if e['forceEvaluation']['status'] == 'reported':
                    e['method'] = e['method'].split('\n')[0] + '\n计算与计分：任务完成率单独统计；综合通过率同时考虑用力要求，规则见下方。'
        if w['id'] == 'C20':
            e = tasks['C20-e05']
            e['metric'] += '；微小载荷响应（倒水灵敏度演示）'
            e['method'] += '\n力灵敏度演示：杯中加水时观察读数随重量增加；原文示例说明可辨认小于0.2 N的载荷变化，不是重复测试的力误差或检出率。'
