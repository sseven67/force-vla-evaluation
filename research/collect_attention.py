# coding: utf-8
"""Refresh verified identifiers in attention.json; never guess a paper/repository match.

Usage: python research/collect_attention.py
Network failures retain the old observation and report an error, never convert it to 0.
Google Scholar is not scraped and OpenAlex counts are not labelled Google citations.
"""
import concurrent.futures
import datetime
import json
import re
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATE = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).date().isoformat()


def request(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ForceVLA-Evaluation-Atlas/1.0"})
    with urllib.request.urlopen(req, timeout=25) as response:
        return json.load(response)


def normalized(text):
    text = unicodedata.normalize('NFKC', text).lower()
    return re.sub(r'[^a-z0-9]', '', text)


def refresh(row):
    row = dict(row)
    errors = []
    if row.get('arxiv'):
        url = 'https://api.openalex.org/works/https://doi.org/10.48550/arXiv.' + row['arxiv']
        try:
            result = request(url)
            # One paper adopted its acronym as a title prefix in the published index.
            expected, actual = normalized(row['title']), normalized(result.get('title', ''))
            if expected != actual and not (expected.endswith(actual) or actual.endswith(expected)):
                raise ValueError('Title mismatch; manual confirmation is required')
            row.update(citations=result.get('cited_by_count'), provider='OpenAlex',
                       citationSource=url, citationRecord=result.get('id'), citationDate=DATE,
                       matchStatus='arXiv DOI + 标题一致')
        except Exception as error:
            errors.append('OpenAlex: ' + str(error))
    if row.get('github'):
        repo = row['github'].rstrip('/').removeprefix('https://github.com/')
        url = 'https://api.github.com/repos/' + repo
        try:
            result = request(url)
            row.update(stars=result.get('stargazers_count'), forks=result.get('forks_count'),
                       githubSource=url, githubDate=DATE)
        except Exception as error:
            errors.append('GitHub: ' + str(error))
    row['refreshErrors'] = errors
    row['lastAttemptDate'] = DATE
    return row


if __name__ == '__main__':
    path = ROOT / 'attention.json'
    payload = json.loads(path.read_text(encoding='utf-8'))
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        payload['works'] = list(pool.map(refresh, payload['works']))
    payload['updated'] = DATE
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'rows': len(payload['works']), 'failedRows': sum(bool(x['refreshErrors']) for x in payload['works'])}))
