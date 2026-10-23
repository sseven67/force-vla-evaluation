"""Apply the approved, uniquely assigned task categories to paper-library tasks."""
import json
from pathlib import Path
from task_topics import rebuild_task_topics


def apply_task_taxonomy(data):
    review = json.loads((Path(__file__).parent / 'research/task_metric_review.json').read_text(encoding='utf-8'))
    experiments = {e['id']: e for w in data['works'] for e in w['experiments']}
    for pid, entry in review['protocols'].items():
        e = experiments[pid]
        e['metric'] = entry['metric']
        e['metricReview'] = {k: entry[k] for k in ('source', 'locator', 'checked')}
        e['forceEvaluation'] = entry['force']
    plan = json.loads((Path(__file__).parent / 'research/task_classification_plan.json').read_text(encoding='utf-8'))
    known = {g['id']: g for g in data['taskGroups']}
    data['taskGroups'] = [dict(known[g['id']], name=g['name']) for g in plan['groups']]
    rebuild_task_topics(data, plan)
    data['taskClassificationNote'] = '每项具体任务仅归入一个大类和小类；离线、仿真、真机仅表示评测方式，双臂仅表示执行配置。'
    data['taskPlan'] = dict(checked=plan['checked'], sourceRecordCount=plan['sourceRecordCount'],
                            taskContentCount=plan['taskContentCount'], smallCategoryCount=len(plan['topics']))
    return data
