# coding: utf-8
"""Reader-facing copy; source review records remain available in research data."""
import re

UNCERTAIN = re.compile(r'尚未|未核实|待核实|待核验|尚待核实|未说明|未确认|未查完|未抽取|没查清')
COUNT_DETAIL = re.compile(r'次数|重复|数量|总数|组数|人数|参与人数|分配|测试划分|测试点|测试预算|测试轨迹|样本数|具体秒数')


def concise_setup(text):
    parts = []
    for part in re.split(r'[；。]', text):
        part = part.strip()
        if not part:
            continue
        if UNCERTAIN.search(part) and COUNT_DETAIL.search(part):
            # Retain the confirmed setup before a missing minor detail.
            prefix = re.split(r'，(?:但|具体)|，?但§', part, maxsplit=1)[0]
            if prefix != part and not UNCERTAIN.search(prefix):
                parts.append(prefix)
            continue
        parts.append(part)
    return '；'.join(parts) + ('。' if parts else '')


def hardware_name(text):
    parts = []
    for part in re.split(r'[；，]', text):
        if not UNCERTAIN.search(part):
            parts.append(part.strip())
    return '；'.join(p for p in parts if p)


def apply_reader_copy(works):
    for w in works:
        if w['id'] == 'X01':
            w['warning'] = '引用的基线成绩与本文重新测试的结果需分开比较。'
        for e in w['experiments']:
            e['setting'] = concise_setup(e['setting'])
            if w['id'] == 'W07':
                e['method'] = '判定与任务要求：原文按任务完成情况报告成功率，具体成功判定细则尚不明确。\n' + e['method'].split('\n', 1)[1]
            if w['id'] == 'W18':
                e['method'] = e['method'].replace(
                    '原文以任务成功／失败计分，但正文和附录没有完整说明该任务的判分步骤；不自行补出清洁比例、削皮长度或翻转角度。',
                    '按任务是否完成计成功率，原文未列出完整判定细则。')
            e['method'] = e['method'].replace(
                '各步骤分值还没查清的地方仍标为尚未核实，不自行平均分配。',
                '各步骤的具体分值尚不明确。')
            for text in (
                '泛化测试次数在所查§5.3及Table2未说明。',
                '正文未说明取出后需保持多久等数字要求。',
            ):
                e['method'] = e['method'].replace(text, '')
            if e['id'] == 'W01-e01':
                e['method'] = e['method'].replace('所查实验正文与附录未说明按到多深或挤出多少液体才算成功。', '')
            if e['id'] == 'W10-e09':
                e['method'] = e['method'].split('\n')[0] + '\n计算与计分：附录提供完成条件，与正文八项任务的成绩分开阅读。'


def clean_physical_profile(profile):
    for key in ('robotModel', 'effectorModel'):
        profile[key] = hardware_name(profile[key])
    replacements = {
        '触觉观测（原始形式待核实）': '触觉观测',
        '各指通道数未核实，不按腕部六维 F/T 计。': '指尖力测量，与腕部六维力传感器不同。',
        '具体力通道维数待核实。': '具体力信号维数未明确。',
        '各测点的物理通道和维度尚待核实，不按腕部六维力计。': '分布式触觉测量，与腕部六维力不同。',
        '具体维数待核实，不直接标成实测末端六维力。': '来自机器人内部估计，不是直接实测的末端六维力。',
        '具体传感器、信号通道尚未逐项核实。': '具体传感器和信号形式未明确。',
        '派生力的具体维数待核实。': '派生力的具体维数未明确。',
        '具体触觉通道数待核实。': '',
        '触觉原始通道形式仍待核实。': '触觉原始信号形式未明确。',
        '具体力向量维数待核实。': '力信号的具体维数未明确。',
    }
    for key in ('forceBrief', 'forceDetail'):
        for old, new in replacements.items():
            profile[key] = profile[key].replace(old, new)
