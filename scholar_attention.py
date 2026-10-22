"""Apply Google Scholar counts observed in the user's Edge browser."""
import json
from pathlib import Path
from urllib.parse import urlencode


def apply_scholar_attention(data):
    path = Path(__file__).parent / 'research/google_scholar.json'
    config = json.loads(path.read_text(encoding='utf-8'))
    records = config['works']
    for work in data['works']:
        record = records.get(work['id'], {})
        attention = work['attention']
        attention['googleScholar'] = record.get('count')
        attention['googleScholarSource'] = record.get('source') or (
            'https://scholar.google.com/scholar?' + urlencode({'q': work['fullTitle']})
        )
        attention['googleScholarDate'] = record.get('date')
        attention['googleScholarStatus'] = record.get('status', 'not-checked')
    data.setdefault('attentionMethodology', {})['googleScholar'] = config['methodology']
    return data
