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
  basis=('首次公开 '+first) if first else ('首次公开年份 '+str(year)+'（具体日期未抽取）')
  if pub:basis+='；正式发表 '+pub['venue']
  a=w['attention'];stars=None if w.get('repoNote') else a['stars'];cites=a['citations']
  triggers=[]
  if stars is not None and stars>=100:triggers.append('官方仓库 '+str(stars)+' Stars ≥100')
  if cites is not None and cites>=20:triggers.append('OpenAlex收录引用 '+str(cites)+' ≥20')
  if not triggers and stars is not None and stars>=50 and cites is not None and cites>=10:triggers.append(str(stars)+' Stars 且 '+str(cites)+' 收录引用，满足双证据门槛')
  if not recent:
   grade,label,reason='H','前序参考','按当前已核实日期列为前序；后续补核实正式发表日期可能调整。'+basis
  elif triggers:
   grade,label,reason='A','优先考察','；'.join(triggers)
  elif pub or (stars is not None and stars>=50) or (cites is not None and cites>=10):
   grade,label='B','补充参考'
   reason=('已核实 '+pub['venue']+'；' if pub else '')+'当前关注证据未达到优先考察门槛，保留定向阅读。'
  else:
   grade,label,reason='C','待观察','现有关注数值不足或缺失，尚未达到本轮筛选门槛；不据此判为不可靠。'
  w['screening']=dict(grade=grade,label=label,reason=reason,inWindow=recent,timeBasis=basis,firstPublicDate=first,dateSource=date.get('source') or ('https://arxiv.org/abs/'+w['arxiv'] if w.get('arxiv') else w['source']),publication=pub,asOf=p['updated'])
 data['selectionPolicy']=p
 return data
