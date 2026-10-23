# coding: utf-8
"""Transparent reading-priority rules, separate from topic relevance and reliability."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
def apply_selection(data):
 p=json.loads((ROOT/'research/selection_policy.json').read_text(encoding='utf-8'))
 dates=json.loads((ROOT/'research/publication_dates.json').read_text(encoding='utf-8'))
 years=p['years']
 scholar=json.loads((ROOT/'research/google_scholar.json').read_text(encoding='utf-8'))['works']
 for w in data['works']:
  pub=p['publicationEvidence'].get(w['id']);date=dates.get(w['id'],{})
  first=date.get('firstPublicDate');year=w['year']
  public_year=int(first[:4]) if first else year
  included_year=public_year in years
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
  a=w['attention']; stars=a['stars']; cites=scholar.get(w['id'],{}).get('count')
  review=w.get('evaluationReview',{})
  original_available=bool(review.get('checkedSource') and review.get('checkedSections'))
  related_evaluation=bool(w.get('experiments') and all(e.get('metric') and e.get('setting') and e.get('review') for e in w['experiments']))
  mainline='gripper-wrench' in w['categories'] and w.get('researchFocus') is not False
  vla=('VLA' in w['kind'] or 'VTLA' in w['kind']) and '非' not in w['kind']
  tier='gripperWrench' if mainline else 'otherVla' if vla else 'otherPolicy'
  thresholds=p['attentionThresholds'][tier]
  attention_pass=(cites is not None and cites>=thresholds['scholar']) or (stars is not None and stars>=thresholds['stars'])
  high=not w['resourceOnly'] and included_year and original_available and related_evaluation and attention_pass
  grade='A' if high else 'C' if not original_available or not related_evaluation else 'B' if included_year else 'H'
  label='较高关注' if high else ''
  reason='六维力＋夹爪采用较低关注门槛。' if mainline else '其他VLA采用较高关注门槛。' if vla else '非VLA仅选高关注代表。'
  w['screening']=dict(grade=grade,label=label,reason=reason,highAttention=high,attentionTier=tier,publicYear=public_year,originalAvailable=original_available,relatedEvaluation=related_evaluation,timeBasis=basis,firstPublicDate=first,dateSource=date.get('source') or ('https://arxiv.org/abs/'+w['arxiv'] if w.get('arxiv') else w['source']),publication=pub,asOf=p['updated'])
 data['selectionPolicy']=p
 return data
