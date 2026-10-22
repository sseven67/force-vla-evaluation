# coding: utf-8
"""Transparent reading-priority rules, separate from topic relevance and reliability."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
def apply_selection(data):
 p=json.loads((ROOT/'research/selection_policy.json').read_text(encoding='utf-8'))
 dates=json.loads((ROOT/'research/publication_dates.json').read_text(encoding='utf-8'))
 start,end=p['window']['start'],p['window']['end']
 for w in data['works']:
  pub=p['publicationEvidence'].get(w['id']);date=dates.get(w['id'],{})
  first=date.get('firstPublicDate');year=w['year']
  recent=(start<=first<=end) if first else year in [2025,2026]
  if pub and pub['year'] in [2025,2026]:recent=True
  basis=('首次公开 '+first[:7]) if first else '首次公开月份待核实'
  if pub:
   basis+='；正式发表 '+pub['venue']
   month=pub.get('month') or (pub.get('date','')[:7])
   if month:
    qualifier={'online':'在线 ','proceedings':'论文集 '}.get(pub.get('monthType'),'')
    basis+='（'+qualifier+month+'）'
   elif pub.get('conferenceMonthRange'):
    basis+='（会议 '+'～'.join(pub['conferenceMonthRange'])+'；出版月份未确认）'
   else:basis+='（月份待核实）'
  a=w['attention'];stars=a['stars'];cites=a['citations']
  review=w.get('evaluationReview',{})
  original_available=bool(review.get('checkedSource') and review.get('checkedSections'))
  related_evaluation=bool(w.get('experiments') and all(e.get('metric') and e.get('setting') and e.get('review') for e in w['experiments']))
  mainline='gripper-wrench' in w['categories']
  triggers=[]
  if stars is not None and stars>=30:triggers.append(('共享官方仓库 ' if w.get('repoNote') else '官方仓库 ')+str(stars)+' Stars ≥30')
  if cites is not None and cites>=5:triggers.append('OpenAlex引用 '+str(cites)+' ≥5')
  if w['resourceOnly']:
   grade,label,reason=('B','资源参考','独立资源另列，不占四类论文的优先考察名额。') if recent else ('H','前序资源','较早的独立资源，不占四类论文的优先考察名额。')
  elif not original_available or not related_evaluation:
   grade,label,reason='C','待观察','原文是否可查或是否有相关评测尚未确认。'
  elif mainline:
   grade,label,reason='A','优先考察','①夹爪＋末端六维力：原文可查，且有相关评测；不设引用或Stars门槛。'
  elif triggers:
   grade,label,reason='A','优先考察','原文可查，且有相关评测；'+'；'.join(triggers)
  elif recent:
   grade,label,reason='B','补充参考','原文可查且有相关评测；当前官方仓库Stars未达30、OpenAlex引用未达5或数值缺失。'
  else:
   grade,label,reason='H','前序参考','原文可查且有相关评测；关注数值未达其余方向门槛，保留为较早参考。'
  w['screening']=dict(grade=grade,label=label,reason=reason,inWindow=recent,originalAvailable=original_available,relatedEvaluation=related_evaluation,timeBasis=basis,firstPublicDate=first,dateSource=date.get('source') or ('https://arxiv.org/abs/'+w['arxiv'] if w.get('arxiv') else w['source']),publication=pub,asOf=p['updated'])
 data['selectionPolicy']=p
 return data
