"""Apply the user's exclusions before rebuilding task navigation."""

REMOVED_WORKS = {'T15', 'T20', 'T21', 'C08', 'C09', 'C16', 'C17', 'C18', 'C19'}


def apply_catalogue_scope(data):
    data['works'] = [w for w in data['works'] if w['id'] not in REMOVED_WORKS]
    data['taskInstances'] = [r for r in data['taskInstances'] if r['work'] not in REMOVED_WORKS]
    used_topics = {r['task'] for r in data['taskInstances']}
    data['taskTypes'] = [t for t in data['taskTypes'] if t['id'] in used_topics]
    data['features'] = [f for f in data['features'] if f['work'] not in REMOVED_WORKS]
    data['extraRelations'] = [r for r in data['extraRelations']
        if r.get('fromWork') not in REMOVED_WORKS and r.get('toWork') not in REMOVED_WORKS]
    data['resourceWorkMetadata'] = {key: value for key, value in data['resourceWorkMetadata'].items()
        if key not in REMOVED_WORKS}
    data['selectionPolicy'].pop('window', None)
    data['selectionPolicy']['years'] = [2024, 2025, 2026]
    for key in ('publicationEvidence',):
        data['selectionPolicy'][key] = {wid: record for wid, record in data['selectionPolicy'].get(key, {}).items()
            if wid not in REMOVED_WORKS}
    return data
