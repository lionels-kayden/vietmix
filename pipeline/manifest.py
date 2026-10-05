"""Canonical filename parsing and image-derived colors, independent of art appearance."""
import hashlib
import json
from pathlib import Path
import re
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
KINDS = {i['kind'] for i in json.loads((ROOT/'data/items.json').read_text(encoding='utf-8'))}


def parse_name(filename):
    match = re.fullmatch(r'([MF])_(A|B|C|MIX|COMMON)_(TOP|BOTTOM|SHOES|NECK|HEAD)_(.+)\.png', filename)
    if not match:
        raise ValueError(f'Invalid canonical filename: {filename}')
    gender, set_code, slot, suffix = match.groups()
    for kind in sorted(KINDS, key=len, reverse=True):
        if suffix == kind:
            return dict(gender=gender, set=set_code, slot=slot.lower(), kind=kind, variant='default')
        if suffix.startswith(kind+'_'):
            variant = suffix[len(kind)+1:]
            if re.fullmatch(r'v[0-9]{2,}', variant):
                return dict(gender=gender, set=set_code, slot=slot.lower(), kind=kind, variant=variant)
    raise ValueError(f'Unknown kind or ambiguous variant: {filename}')


def dominant_color(image):
    a = np.array(image.convert('RGBA'))
    pixels = a[:, :, :3][a[:, :, 3] >= 200]
    if not len(pixels):
        raise ValueError('No opaque pixels for color scan')
    bins = pixels//24
    colors, counts = np.unique(bins, axis=0, return_counts=True)
    best = colors[counts.argmax()]
    chosen = pixels[(bins == best).all(axis=1)]
    rgb = np.median(chosen, axis=0).astype(int).tolist()
    return {'rgb': rgb, 'hex': '#'+''.join(f'{v:02x}' for v in rgb),
            'method': '24-step RGB modal bin, median opaque pixels',
            'bin_fraction': round(float(counts.max()/counts.sum()),4)}


def build_manifest(extracted, root=ROOT):
    extracted = Path(extracted)
    metadata = json.loads((extracted/'extraction.json').read_text(encoding='utf-8'))
    rows = []
    for entry in metadata['items']:
        if entry['extraction'] != 'OK':
            continue
        p = extracted/entry['target']
        row = {**entry, **parse_name(p.name), 'id': p.stem,
               'source_sha256': hashlib.sha256((root/entry['source']).read_bytes()).hexdigest(),
               'color': dominant_color(Image.open(p)), 'approved': False}
        rows.append(row)
    (extracted.parent/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return rows


if __name__ == '__main__':
    rows=build_manifest(ROOT/'reports/p3a/extracted')
    print(f'Manifest: {len(rows)} review-only layers; no runtime promotion')
