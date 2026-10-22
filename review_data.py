# coding: utf-8
"""Apply manually checked source evidence and readable display text."""
import json
import re
from pathlib import Path

ROOT=Path(__file__).parent/'research'
REVIEW_FILES=('force_core','force_later','other_primary','other_resources')
STATUS_LABELS={'verified':'已核对','not_reported':'原文未说明部分细节','pending':'尚未核实'}

def readable(text):
    if not isinstance(text,str):return text
    for original,plain in [
        ('角度容差','允许偏离目标角度的范围'),('位置容差','允许偏离目标位置的范围'),
        ('终态角度','完成时的角度'),('终态','完成时的状态'),('姿态','位置和朝向'),
        ('测试分母','测试总次数'),('分母','统计所用样本数'),('位姿','位置和朝向'),
        ('阈值','数字判定标准'),('二元成功率','按成功／失败计算的成功率'),
        ('二元','成功／失败两种结果'),('episode时长','单次测试耗时'),
        ('rollouts','次完整测试'),('rollout','完整测试'),('episodes','次完整测试'),('episode','完整测试'),
        ('trials','次测试'),('trial','测试'),('rubric','评分规则'),('taxels','压力测点'),('taxel','压力测点'),
        ('wrench','力／力矩'),('扰动','外部干扰'),('重规划','重新规划动作'),
        ('held-out','未参与训练的'),('probe','表示能力测试'),('残差','纠偏量'),
        ('峰值力','最大接触力'),('法向力','垂直接触表面的力'),('剪切力','沿接触表面方向的力'),
        ('力跟踪误差','实际用力与目标用力的差距'),('域内','与训练相似的条件'),
        ('零样本','没有针对该项任务训练'),('ASR','动作完成率'),('MAE','平均绝对偏差')
    ]:text=text.replace(original,plain)
    return re.sub(r'\bOOD\b','未见过的条件',text)

def apply_reviews(works):
    reviews={}
    for name in REVIEW_FILES:
        doc=json.loads((ROOT/f'verification_{name}.json').read_text(encoding='utf-8'))
        assert not reviews.keys() & doc['works'].keys(), 'Duplicate review ownership'
        reviews.update(doc['works'])
    assert set(reviews)=={w['id'] for w in works}, 'Every work needs a source review'
    for w in works:
        review=reviews[w['id']]
        w['evaluationReview']={k:v for k,v in review.items() if k not in ('taskUpdates','metaUpdates')}
        w['evaluationReview']['summary']=readable(review['summary'])
        corrections=review.get('metaUpdates',{})
        assert set(corrections)<=set(('trials','metrics','warning','notes'))
        w.update(corrections)
        updated=review['taskUpdates']
        assert set(updated)=={e['id'] for e in w['experiments']}, w['id']+': all tasks require a review'
        for e in w['experiments']:
            correction=updated[e['id']]
            assert set(correction)<=set(('task','purpose','metric','setting','conditions','review','locator','source'))
            e.update(correction)
            assert e['review']['status'] in STATUS_LABELS
            assert e['review'].get('source') and e['review'].get('locator') and e['review'].get('note')
            e['review']['label']=STATUS_LABELS[e['review']['status']]
            e['review']['note']=readable(e['review']['note'])
            for key in ('purpose','metric','setting','conditions'):e[key]=readable(e[key])
        for extra in review.get('additionalTasks',[]):
            assert all(extra.get(k) for k in ('task','purpose','metric','setting','conditions','source','locator','review'))
            e=dict(extra,id=f"{w['id']}-e{len(w['experiments'])+1:02d}")
            assert e['review']['status'] in STATUS_LABELS
            e['review']['label']=STATUS_LABELS[e['review']['status']]
            e['review']['note']=readable(e['review']['note'])
            for key in ('purpose','metric','setting','conditions'):e[key]=readable(e[key])
            w['experiments'].append(e)
        w['tasks']='；'.join(e['task'] for e in w['experiments'])
        for key in ('purpose','summary','metrics','trials','baseline','warning','actionOutput','signal'):w[key]=readable(w[key])
        for key in list(w['attention']):
            if key.lower().startswith('googlescholar'):w['attention'].pop(key)
