# coding: utf-8
"""Task-level evaluation modes, independently of data collection and training."""
import json
from pathlib import Path

MODES=('真机','仿真','离线')


def apply_evaluation_modes(works):
    config=json.loads((Path(__file__).parent/'research/evaluation_modes.json').read_text(encoding='utf-8'))
    assert set(config['works'])=={w['id'] for w in works}
    for w in works:
        assignments=config['works'][w['id']]['tasks']
        assert set(assignments)=={e['id'] for e in w['experiments']}, w['id']+': review modes for new tasks'
        for e in w['experiments']:
            assignment=assignments[e['id']]
            assert assignment['name']==e['task'], e['id']+': review modes after task renaming'
            modes=assignment['modes']
            assert modes and len(modes)==len(set(modes)) and set(modes)<=set(MODES)
            e['evaluationModes']=modes
            e['evaluationModeSource']={k:assignment[k] for k in ('source','locator')}
        # Includes a mode whenever at least one evaluated task uses it.
        w['domains']=[m for m in MODES if any(m in e['evaluationModes'] for e in w['experiments'])]
