"""Perfect all 3 fixes and resolve inner ankle exposure.

Fixes integrated:
1. Waistband: flat, natural waistband without rear bowl rim.
2. Outer trouser taper: 26px smooth Hermite taper below knee.
3. Inner trouser hem: extends naturally to y=1765 along inner leg contour so no heel skin leaks.
4. Clean stray line artifacts at hem bottom.
5. Shoes: shifted inward by 12px (dx=+12 on left, dx=-12 on right) to center directly under ankles.
6. Intact original shoe artwork seamlessly holding feet and heels.
7. Base-with-shoes only masks toes below y=1775.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / 'pipeline'))
from image_core import keep_components, bbox, components, CANVAS
from fit_auto import place

OUT = ROOT / 'reports/p3a-prototype-B'
(OUT / 'layers').mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------------------
# 1. LOAD BASE & SOURCES
# -------------------------------------------------------------------------
base = Image.open(ROOT / 'reports/p3a/extracted/male_base.png').convert('RGBA')
base.save(OUT / 'layers/base.png')

top = Image.open(OUT / 'layers/top.png').convert('RGBA')

# -------------------------------------------------------------------------
# 2. PANTS (BOTTOM) PROCESSING
# -------------------------------------------------------------------------
pants_src = keep_components(Image.open(ROOT / 'reports/p3a-lower-v3/source/pants.png').convert('RGBA'), 0.01)
pants_cropped = pants_src.crop(bbox(pants_src))
scale = 1025 / pants_cropped.height
bottom_initial = place(pants_cropped, {'x': (1080 - pants_cropped.width * scale) / 2, 'y': 750, 'scale': scale})

def cover_inner_legs_full(bottom_im, base_im, max_y=1765):
    """Extend inner leg contour all the way down to ankle/heel, eliminating skin gap."""
    a = np.array(bottom_im).astype(float) / 255
    body = np.array(base_im.getchannel('A')) > 240
    alpha = a[:, :, 3] > 0.95
    yy, xx = np.mgrid[:1920, :1080]
    sx = xx.astype(float)
    
    for side, (lo, hi) in enumerate(((300, 540), (540, 780))):
        edges = []
        for y in range(1920):
            cloth = np.flatnonzero(alpha[y, lo:hi]) + lo
            skin = np.flatnonzero(body[y, lo:hi]) + lo
            if 960 <= y < max_y and len(cloth) > 30 and len(skin) > 10:
                outer = cloth[0] if side == 0 else cloth[-1]
                inner = cloth[-1] if side == 0 else cloth[0]
                target = min(539, skin[-1] + 4) if side == 0 else max(540, skin[0] - 4)
                change = max(0, target - inner) if side == 0 else min(0, target - inner)
                edges.append((outer, inner, change))
            else:
                edges.append((0, 0, 0))
        delta = ndi.gaussian_filter1d(np.array(edges)[:, 2].astype(float), 5)
        for y, (outer, inner, _) in enumerate(edges):
            if outer == inner: continue
            end = inner + delta[y]
            low, high = sorted((outer, end))
            region = (xx[y] >= low) & (xx[y] <= high)
            sx[y, region] = outer + (xx[y, region] - outer) * (inner - outer) / (end - outer)
            
    coords = np.array([yy, sx])
    out_alpha = ndi.map_coordinates(a[:, :, 3], coords, order=1)
    rgb = np.stack([ndi.map_coordinates(a[:, :, c] * a[:, :, 3], coords, order=1) for c in range(3)], axis=2)
    rgb = np.divide(rgb, out_alpha[:, :, None], out=np.zeros_like(rgb), where=out_alpha[:, :, None] > 0)
    return Image.fromarray((np.clip(np.dstack((rgb, out_alpha)), 0, 1) * 255).round().astype(np.uint8))

bottom_extended = cover_inner_legs_full(bottom_initial, base, max_y=1765)
pants = np.array(bottom_extended).copy()

# A. Waistband fix: flat front edge, erase rear bowl rim
for x in range(340, 740):
    norm_x = (x - 540) / 200.0
    front_top_y = int(round(768 + 2.5 * (norm_x ** 2)))
    pants[:front_top_y, x, 3] = 0
    for y in range(front_top_y, 805):
        if pants[y, x, 3] > 100:
            val = pants[y, x, :3].astype(float)
            if val.mean() < 240:
                pants[y, x, :3] = np.clip(val * 0.12 + np.array([250, 250, 248]) * 0.88, 0, 255).astype(np.uint8)

for x in range(342, 738):
    norm_x = (x - 540) / 200.0
    top_y = int(round(768 + 2.5 * (norm_x ** 2)))
    if pants[top_y, x, 3] > 0:
        pants[top_y, x, :3] = [175, 175, 173]

# B. Outer trouser taper (26px smooth Hermite taper below knee)
alpha = pants[:, :, 3] > 50
for y in range(1120, 1850):
    t = np.clip((y - 1120) / 650.0, 0.0, 1.0)
    s = t * t * (3 - 2 * t)
    taper_px = int(round(26 * s))
    
    # Left leg outer edge (x < 420)
    left_pixels = np.flatnonzero(alpha[y, 250:420]) + 250
    if len(left_pixels) > taper_px + 10:
        x_start = left_pixels[0]
        x_mid = 420
        span = x_mid - x_start
        row_slice = pants[y, x_start:x_mid].copy()
        pants[y, x_start:x_start + taper_px] = 0
        new_span = span - taper_px
        indices = np.linspace(0, span - 1, new_span).astype(int)
        pants[y, x_start + taper_px:x_mid] = row_slice[indices]

    # Right leg outer edge (x > 660)
    right_pixels = np.flatnonzero(alpha[y, 660:830]) + 660
    if len(right_pixels) > taper_px + 10:
        x_end = right_pixels[-1]
        x_mid = 660
        span_r = x_end - x_mid
        row_slice_r = pants[y, x_mid:x_end + 1].copy()
        pants[y, x_end - taper_px + 1:x_end + 1] = 0
        new_span_r = span_r - taper_px
        indices_r = np.linspace(0, span_r, new_span_r).astype(int)
        pants[y, x_mid:x_mid + len(indices_r)] = row_slice_r[indices_r]

# C. Clean artifacts
pants[1825:, :, 3] = 0
# Clean left outer stray curl below y=1751, x < 342
for y in range(1751, 1775):
    pants[y, :342, 3] = 0
# Clean stray artifact at (y: 1780..1825, x: 270..305)
pants[1780:1825, 270:305, 3] = 0

bottom_fixed = Image.fromarray(pants)
bottom_fixed.save(OUT / 'layers/bottom.png')

# -------------------------------------------------------------------------
# 3. SHOES PROCESSING (CENTERED & INTACT ARTWORK)
# -------------------------------------------------------------------------
source_shoes = keep_components(Image.open(ROOT / 'reports/p3a-lower-v3/source/shoes.png').convert('RGBA'), 0.01)
parts, _ = components(source_shoes, 1000)
parts = sorted(parts, key=lambda p: p['box'][0])

dx = 12  # Shift left shoe +12 (rightwards), right shoe -12 (leftwards)
shoes = Image.new('RGBA', CANVAS)
for i, part in enumerate(parts):
    box = part['box']
    piece = source_shoes.crop(box)
    s = 180 / piece.width
    center = 650 if i == 0 else 1124
    ankle = (450 + dx) if i == 0 else (630 - dx)
    x = ankle - (center - box[0]) * s
    y = 1690
    shoes.alpha_composite(place(piece, {'x': x, 'y': y, 'scale': s}))

shoes.save(OUT / 'layers/shoes.png')

# -------------------------------------------------------------------------
# 4. BASE WITH SHOES (MASK TOES BELOW y=1775)
# -------------------------------------------------------------------------
base_arr = np.array(base).copy()
shoes_arr = np.array(shoes)
shoe_solid = shoes_arr[:, :, 3] > 200

for y in range(1775, 1920):
    mask_toes = shoe_solid[y]
    base_arr[y, mask_toes, 3] = 0

base_with_shoes = Image.fromarray(base_arr)
base_with_shoes.save(OUT / 'layers/base-with-shoes.png')

# -------------------------------------------------------------------------
# 5. COMPOSITES & USER INSPECTION REVIEWS
# -------------------------------------------------------------------------
bg = Image.new('RGBA', CANVAS, (238, 230, 218, 255))

# 1. Shoes only (Base-with-shoes + Shoes)
comp_shoes = Image.alpha_composite(base_with_shoes, shoes)
preview_shoes = Image.alpha_composite(bg, comp_shoes).convert('RGB')
preview_shoes.crop((280, 1630, 800, 1880)).save(OUT / 'review_shoes_only.jpg', quality=95)

# 2. Pants only (Base + Bottom)
comp_pants = Image.alpha_composite(base, bottom_fixed)
preview_pants = Image.alpha_composite(bg, comp_pants).convert('RGB')
preview_pants.crop((280, 1630, 800, 1880)).save(OUT / 'review_pants_only.jpg', quality=95)
preview_pants.crop((280, 1200, 800, 1880)).save(OUT / 'fix2_pants_legs.jpg', quality=95)
preview_pants.crop((320, 735, 760, 825)).save(OUT / 'fix3_waistband.jpg', quality=95)

# 3. Pants + Shoes (Base-with-shoes + Shoes + Bottom)
comp_pants_shoes = Image.alpha_composite(comp_shoes, bottom_fixed)
preview_pants_shoes = Image.alpha_composite(bg, comp_pants_shoes).convert('RGB')
preview_pants_shoes.crop((280, 1630, 800, 1880)).save(OUT / 'review_pants_and_shoes.jpg', quality=95)
preview_pants_shoes.crop((280, 1630, 800, 1880)).save(OUT / 'fix1_shoes_ankles.jpg', quality=95)

# 4. Full Outfit (Base-with-shoes + Shoes + Bottom + Top)
comp_full = Image.alpha_composite(comp_pants_shoes, top)
comp_full.save(OUT / 'composite.png')

preview_full = Image.alpha_composite(bg, comp_full).convert('RGB')
preview_full.save(OUT / 'preview.jpg', quality=95)

print("Pipeline execution completed successfully!")
