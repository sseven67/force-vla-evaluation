# coding: utf-8
"""Source-reviewed robot, end-effector and contact-signal presentation."""
import json
from pathlib import Path


def apply_physical_profiles(data):
    review = json.loads((Path(__file__).parent / 'research/physical_profiles.json').read_text(encoding='utf-8'))
    for work in data['works']:
        record = review['works'].get(work['id'])
        if not record:
            continue
        work['physicalProfile'] = {
            key: record[key] for key in (
                'robotConfiguration', 'robotModel', 'effectorModel',
                'forceBrief', 'forceDetail', 'source', 'verification',
            )
        }
        work['signal'] = record['forceBrief']
        work['sensorOrigin'] = record['sensorOrigin']
        work['actionOutput'] = record['actionOutput']
        work['actionSource'] = record['actionSource']
        work['platform'] = '；'.join(filter(None, [
            record['robotConfiguration'], record['robotModel'], record['effectorModel'],
        ]))
        if record['categoryNote']:
            work['classificationNote'] = record['categoryNote']
    return data
