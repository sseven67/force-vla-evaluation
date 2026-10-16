# coding: utf-8
"""Read public GitHub counters; no credentials, no inferred usage numbers."""
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'public/catalogue.json').read_text(encoding='utf-8'))
todo=[w for w in data['works'] if w.get('github') and w['attention']['stars'] is None and w['id'] not in ['C08','C10']]
def fetch(w):
    repo='/'.join(w['github'].removeprefix('https://github.com/').split('/')[:2])
    url='https://api.github.com/repos/'+repo
    try:
        r=requests.get(url,headers={'User-Agent':'ForceVLA-Research-Atlas','Accept':'application/vnd.github+json'},timeout=25)
        if r.status_code!=200:return {'workId':w['id'],'error':'HTTP '+str(r.status_code)}
        j=r.json();a=w['attention']
        return dict(workId=w['id'],title=w['fullTitle'],arxiv=w['arxiv'],github=j['html_url'],citations=a['citations'],citationSource=a['citationSource'],citationRecord=a['citationRecord'],provider='OpenAlex',stars=j['stargazers_count'],forks=j['forks_count'],githubSource=url,date='2026-10-16',matchStatus='沿已核实官方链接抓取GitHub API')
    except Exception as e:return {'workId':w['id'],'error':type(e).__name__}
with ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(fetch,todo))
(root/'research/attention_new.json').write_text(json.dumps({'works':[r for r in rows if 'error' not in r],'unavailable':[r for r in rows if 'error' in r]},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'queried':len(rows),'available':sum('error' not in r for r in rows)},ensure_ascii=False))
