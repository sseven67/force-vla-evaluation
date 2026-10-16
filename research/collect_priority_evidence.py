# coding: utf-8
"""Fetch provenance for the new screening policy; never infer missing counters."""
import concurrent.futures,json,re,unicodedata
from pathlib import Path
import requests
from html.parser import HTMLParser
class Metadata(HTMLParser):
 def __init__(self):super().__init__();self.date=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta' and a.get('name')=='citation_date':self.date=a.get('content')
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'public/catalogue.json').read_text(encoding='utf-8'))
new=json.loads((ROOT/'research/priority_additions.json').read_text(encoding='utf-8'))['works']
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKC',s).lower())
def metric(w):
 r=dict(workId=w['id'],title=w['fullTitle'],arxiv=w['arxiv'],github=w['github'],citations=None,stars=None,forks=None,date='2026-10-16',provider='OpenAlex',errors=[])
 u='https://api.openalex.org/works/https://doi.org/10.48550/arXiv.'+w['arxiv']
 try:
  response=requests.get(u,timeout=25);response.raise_for_status();j=response.json()
  if norm(j['title'])!=norm(w['fullTitle']):raise ValueError('Title mismatch')
  r.update(citations=j['cited_by_count'],citationSource=u,citationRecord=j['id'],matchStatus='arXiv DOI + title matched')
 except Exception as e:r['errors'].append('OpenAlex '+type(e).__name__)
 u='https://api.github.com/repos/'+w['github'].replace('https://github.com/','')
 try:
  response=requests.get(u,timeout=25);response.raise_for_status();j=response.json()
  r.update(stars=j['stargazers_count'],forks=j['forks_count'],githubSource=u)
 except Exception as e:r['errors'].append('GitHub '+type(e).__name__)
 return r
def date(w):
 u='https://arxiv.org/abs/'+w['arxiv']
 try:
  response=requests.get(u,timeout=25);response.raise_for_status();s=Metadata();s.feed(response.text)
  if not s.date:raise ValueError('Missing citation_date')
  value=s.date.replace('/','-')
  return w['id'],dict(firstPublicDate=value,source=u)
 except Exception as e:return w['id'],dict(firstPublicDate=None,source=u,error=type(e).__name__)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 metrics=list(pool.map(metric,new))
 dates=dict(pool.map(date,[w for w in D['works']+new if w.get('arxiv') and w['year']==2024]))
(ROOT/'research/priority_attention.json').write_text(json.dumps({'works':metrics},ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'research/publication_dates.json').write_text(json.dumps(dates,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'newMetrics':metrics,'dates':dates},ensure_ascii=False))
