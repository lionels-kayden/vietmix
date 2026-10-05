"""Deterministic image operations. Never redraw garment pixels or overwrite sources."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

CANVAS = (1080, 1920)


def remove_border_background(image, threshold=233):
    """Remove only bright pixels connected to the border; enclosed whites survive.

    Existing useful alpha is preserved exactly (including generated shoe feathering).
    No blanket white-keying, morphology or hole fill that could destroy garment detail.
    """
    rgba = np.array(image.convert('RGBA'))
    if (rgba[:, :, 3] == 0).mean() > .01:
        return Image.fromarray(rgba)
    bright = rgba[:, :, :3].min(axis=2) >= threshold
    seed = np.zeros_like(bright)
    seed[0, :] = bright[0, :]; seed[-1, :] = bright[-1, :]
    seed[:, 0] = bright[:, 0]; seed[:, -1] = bright[:, -1]
    outside = ndi.binary_propagation(seed, mask=bright)
    rgba[outside, 3] = 0
    return Image.fromarray(rgba)


def components(image, minimum_area=64):
    mask = np.asarray(image.getchannel('A')) > 127
    labels, count = ndi.label(mask)
    sizes = np.bincount(labels.ravel()); sizes[0] = 0
    result = []
    for label, sl in enumerate(ndi.find_objects(labels), 1):
        if sl is None or sizes[label] < minimum_area:
            continue
        y, x = sl
        result.append({'label': label, 'area': int(sizes[label]),
                       'box': (x.start, y.start, x.stop, y.stop)})
    return sorted(result, key=lambda x: x['area'], reverse=True), labels


def keep_components(image, min_fraction=.001):
    parts, labels = components(image)
    if not parts:
        raise ValueError('No foreground components detected')
    keep = [p['label'] for p in parts if p['area'] >= parts[0]['area'] * min_fraction]
    # Preserve antialias/alpha feathering immediately around the solid component.
    mask = ndi.binary_dilation(np.isin(labels, keep), iterations=2)
    rgba = np.array(image)
    rgba[~mask, 3] = 0
    return Image.fromarray(rgba)


def split_sheet(image):
    """Return reference character and garment region separated by an empty column gap.

    Left/right convention is explicitly supplied by the user. Does not guess item kind.
    """
    cutout = remove_border_background(image)
    a = np.asarray(cutout.getchannel('A')) > 127
    # Ignore isolated corner marks for gap detection by retaining significant components.
    parts, labels = components(cutout)
    if len(parts) < 2:
        raise ValueError('No separate reference and garment; manual crop required')
    substantial = [p['label'] for p in parts if p['area'] >= parts[0]['area'] * .02]
    occupied = np.isin(labels, substantial).any(axis=0)
    active = np.flatnonzero(occupied)
    gaps, n = ndi.label(~occupied)
    candidates = []
    for sl in ndi.find_objects(gaps):
        start, stop = sl[0].start, sl[0].stop
        if start > active[0] and stop < active[-1] and stop-start >= 3:
            candidates.append((stop-start, (start+stop)//2))
    if not candidates:
        # Projections may overlap although the silhouettes do not touch (a hand next
        # to a skirt). Split disconnected components using the declared left/right
        # sheet convention rather than cutting through either silhouette.
        major = sorted([p for p in parts if p['label'] in substantial], key=lambda p: p['box'][0])
        if len(major) != 2:
            raise ValueError('Ambiguous overlapping sheet; manual component selection required')
        outputs = []
        for part in major:
            mask = ndi.binary_dilation(labels == part['label'], iterations=2)
            rgba = np.array(cutout); rgba[~mask, 3] = 0
            outputs.append(Image.fromarray(rgba))
        return outputs[0], outputs[1], None
    divider = max(candidates)[1]
    left = keep_components(cutout.crop((0, 0, divider, image.height)))
    right = keep_components(cutout.crop((divider, 0, image.width, image.height)))
    return left, right, divider


def bbox(image):
    box = image.getchannel('A').point(lambda v: 255 if v > 127 else 0).getbbox()
    if box is None:
        raise ValueError('Empty foreground')
    return box


def normalize_base(image):
    cutout = keep_components(remove_border_background(image))
    box = bbox(cutout)
    crop = cutout.crop(box)
    # Presentation margins, NOT anatomy: detected head/foot extent fills 1760px.
    scale = min(1760 / crop.height, 920 / crop.width)
    size = (round(crop.width*scale), round(crop.height*scale))
    canvas = Image.new('RGBA', CANVAS)
    position = ((CANVAS[0]-size[0])//2, (CANVAS[1]-size[1])//2)
    canvas.alpha_composite(crop.resize(size, Image.Resampling.LANCZOS), position)
    return canvas, {'source_bbox': list(box), 'scale': scale, 'position': list(position)}


def extract_all(root, output):
    import json
    root, output = Path(root), Path(output)
    output.mkdir(parents=True, exist_ok=True)
    metadata = {'bases': {}, 'items': []}
    for gender in ('male', 'female'):
        image = Image.open(root/'image-input'/'bases'/f'{gender}_base.png')
        base, info = normalize_base(image)
        base.save(output/f'{gender}_base.png')
        info['source_format'] = image.format
        metadata['bases'][gender] = info
    mappings = json.loads((root/'pipeline/source_map.json').read_text(encoding='utf-8'))
    for entry in mappings:
        image = Image.open(root/entry['source']).convert('RGBA')
        record = dict(entry)
        try:
            if '/common/' in entry['source']:
                garment = keep_components(remove_border_background(image), .01)
                record['reference_height'] = None
            else:
                ref, garment, divider = split_sheet(image)
                b = bbox(ref)
                record['reference_height'] = b[3]-b[1]
                record['divider_x'] = divider
            box = bbox(garment)
            garment = garment.crop(box)
            garment.save(output/entry['target'])
            record.update(crop_box=list(box), size=list(garment.size), extraction='OK')
        except ValueError as error:
            record.update(extraction='FAIL', reason=str(error))
        metadata['items'].append(record)
    (output/'extraction.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return metadata


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='reports/p3a/extracted')
    args = parser.parse_args()
    result = extract_all(Path(__file__).resolve().parents[1], args.output)
    print(f"Extracted {sum(i['extraction']=='OK' for i in result['items'])}/{len(result['items'])} mapped layers")
