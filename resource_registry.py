"""Source-linked resource metrics and external evaluation studies (local snapshots)."""
import copy
import json
import re
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).parent / 'research'


def apply_resource_registry(data):
    snapshot = json.loads((ROOT / 'resource_metadata.json').read_text(encoding='utf-8'))
    expansion = json.loads((ROOT / 'resource_expansion.json').read_text(encoding='utf-8'))
    usage = json.loads((ROOT / 'resource_usage.json').read_text(encoding='utf-8'))['records']
    works = {w['id']: w for w in data['works']}
    scholar = snapshot['scholar']

    def metadata(key, title, source, repository=None, owner=None):
        observed = scholar.get(key)
        attention = (owner or {}).get('attention', {})
        if observed is None:
            observed = dict(count=attention.get('googleScholar'), source=attention.get('googleScholarSource'),
                            status=attention.get('googleScholarStatus', 'not-checked'), date=attention.get('googleScholarDate'))
        screening = (owner or {}).get('screening', {})
        publication = snapshot['dates'].get(key, {})
        first_date = publication.get('date') or screening.get('firstPublicDate')
        repo_match = re.search(r'github.com/([\w.-]+/[\w.-]+)', repository or '')
        repo = snapshot['repositories'].get(repo_match[1], {}) if repo_match else {}
        stars = repo.get('stars')
        stars_date = repo.get('checked')
        stars_status = 'verified' if stars is not None else ('unavailable' if repo_match else 'no-repository')
        # An older, verified count remains usable only for the same repository.
        old_url = attention.get('githubSource') or ''
        if stars is None and repo_match and old_url.lower().endswith(repo_match[1].lower()) and attention.get('stars') is not None:
            stars, stars_date, stars_status = attention['stars'], attention.get('date'), 'verified'
        return dict(
            scholar=observed.get('count'), scholarStatus=observed.get('status'),
            scholarSource=observed.get('source') or 'https://scholar.google.com/scholar?' + urlencode({'q': title}),
            scholarDate=observed.get('date'), stars=stars, starsStatus=stars_status,
            starsSource=(repo.get('source') or repository) if repo_match else None,
            repository=(repo.get('url') or repository) if repo_match else None,
            starsDate=stars_date, repositoryScope='仓库总 Stars；共用仓库或子目录不单独计数' if repo_match else None,
            firstPublicDate=first_date, publicYear=publication.get('year') or (owner or {}).get('year'),
            dateSource=publication.get('source') or screening.get('dateSource') or source,
            dateBasis=publication.get('basis') or ('提出论文首次公开时间' if first_date else '首次公开日期未核实'),
            dateStatus='verified' if first_date else ('not-reported' if publication.get('year') else 'not-checked'),
        )

    studies = copy.deepcopy(expansion['studies'])
    for study in studies:
        study['metadata'] = metadata(study['id'], study['title'], study['source'], study.get('repository'))
    study_by_id = {s['id']: s for s in studies}
    data['resourceStudies'] = studies
    data['resourceUpdated'] = snapshot['checked']
    data['resourceWorkMetadata'] = {w['id']: metadata(w['id'], w['fullTitle'], w['source'], w.get('github') or w.get('openness', {}).get('url'), w) for w in works.values()}
    # LIBERO is the upstream source of Tabero, not a second, unchanged test suite.
    if not any(r['benchmark'] == 'libero' for r in works['W11']['relations']):
        works['W11']['relations'].append(dict(benchmark='libero', type='adopts', label='迁移并扩展（衍生评测）', domain='仿真',
            note='复用 LIBERO 任务场景和轨迹，迁移到 Isaac Lab 并加入触觉与力控制；不作为原版 LIBERO 分数。'))
    for work in works.values():
        for relation in work['relations']:
            fields = usage.get(relation['benchmark'], {}).get(work['id'])
            if fields:
                relation['usageDetails'] = copy.deepcopy(fields)
    for record in expansion['resources']:
        assert not any(b['id'] == record['id'] for b in data['benchmarks']), record['id']
        data['benchmarks'].append(copy.deepcopy(record))
    for benchmark in data['benchmarks']:
        bid = benchmark['id']
        owner_id = benchmark['introducedBy'].get('workId')
        # UniVTAC's audit intentionally keeps a separate resource proposer record.
        metric_key = benchmark.get('metricKey') or {'univtac': 'T07', 'neoreal': 'n0-foundation', 'neosim': 'n0-foundation'}.get(bid, owner_id or bid)
        owner = works.get(owner_id or ('T07' if bid == 'univtac' else ''))
        benchmark['metadata'] = metadata(metric_key, benchmark['introducedBy']['title'], benchmark['introducedBy']['source'], benchmark.get('resourceUrl'), owner)
        benchmark['metadataSubject'] = '对应论文与官方仓库' if benchmark['resourceType'] == 'paper_protocol' else '提出资源的论文与官方仓库'
        benchmark['externalUsers'] = [copy.deepcopy(study_by_id[key]) for key in expansion['adoptions'].get(bid, [])]
        for study in benchmark['externalUsers']:
            study['usageDetails'] = copy.deepcopy(usage.get(bid, {}).get(study['id'], []))
        if bid in expansion.get('readingOverrides', {}):
            benchmark['reading'] = copy.deepcopy(expansion['readingOverrides'][bid])
        if bid in expansion.get('resourceNotes', {}):
            benchmark.update(expansion['resourceNotes'][bid])
        if benchmark.get('reading'):
            benchmark['tasks'] = [t['name'] for g in benchmark['reading']['taskGroups'] for t in g['items']]
        benchmark.setdefault('newlyCollected', False)
    # Only benchmarks and simulation platforms appear as independent resources.
    resource_names = {b['id']: b['name'] for b in data['benchmarks']}
    for work in works.values():
        for relation in work['relations']:
            relation['resourceName'] = resource_names[relation['benchmark']]
    for benchmark in data['benchmarks']:
        if benchmark['resourceType'] == 'upstream':
            benchmark['resourceType'] = 'benchmark'
            benchmark['typeLabel'] = '评测基准'
    data['benchmarks'] = [b for b in data['benchmarks'] if b['resourceType'] in ('benchmark', 'platform')]
    retained_ids = {b['id'] for b in data['benchmarks']}
    data['extraRelations'] = [r for r in data['extraRelations']
        if all(r.get(key) is None or r[key] in retained_ids for key in ('fromBenchmark', 'toBenchmark'))]
    for benchmark in data['benchmarks']:
        if 'relatedResources' in benchmark:
            benchmark['relatedResources'] = [bid for bid in benchmark['relatedResources'] if bid in retained_ids]
    return data
