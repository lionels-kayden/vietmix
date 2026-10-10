"""Apply precise fixes to the 3 visual issues reported by the user."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/p3a-prototype-B'

base = Image.open(ROOT / 'reports/p3a/extracted/male_base.png').convert('RGBA')
bottom_orig = Image.open(ROOT / 'reports/p3a-lower-v3/layers/bottom.png').convert('RGBA')
shoes_orig = Image.open(ROOT / 'reports/p3a-lower-v3/layers/shoes.png').convert('RGBA')
top = Image.open(OUT / 'layers/top.png').convert('RGBA')

# -------------------------------------------------------------------------
# FIX 1: Waistband (Image 3) - Flatten the duplicate rear hollow crescent
# -------------------------------------------------------------------------
pants = np.array(bottom_orig).copy()
alpha = pants[:, :, 3] > 200

for y in range(760, 788):
    pixels = np.flatnonzero(alpha[y, 350:730]) + 350
    if len(pixels) < 16:
        continue
    left, right = pixels[0], pixels[-1]
    # Keep 4px outer border, flatten the shaded interior
    interior = slice(left + 5, right - 4)
    before = pants[y, interior, :3].astype(np.float32)
    target = np.array([250, 250, 248], dtype=np.float32)
    # Brighten grey shaded rim completely
    pants[y, interior, :3] = np.round(before * 0.08 + target * 0.92)

# -------------------------------------------------------------------------
# FIX 2: Taper Trouser Outer Silhouette (Image 2)
# - Keep INNER contour untouched so inner knees and calves NEVER leak skin!
# - Taper only the OUTER contour inwards towards the leg from y=1150 to 1820.
# -------------------------------------------------------------------------
# Measure outer contours and compress only the outer halves of each leg
for y in range(1150, 1820):
    t = np.clip((y - 1150) / 600.0, 0.0, 1.0)
    s = t * t * (3 - 2 * t) # smoothstep
    shift_max = int(round(28 * s)) # pull outer edge in by up to 28px at hem

    # Left leg outer edge (left side, x < 415)
    row_l = np.flatnonzero(pants[y, 250:415, 3] > 200) + 250
    if len(row_l) > shift_max + 5:
        orig_left = row_l[0]
        # Shift the outer part inwards
        width_l = 415 - orig_left
        if width_l > shift_max + 10:
            # Compress x from orig_left..415 into orig_left+shift_max..415
            sub = pants[y, orig_left:415].copy()
            pants[y, orig_left:orig_left + shift_max] = 0 # clear outer void
            # re-sample
            indices = np.linspace(0, width_l - 1, width_l - shift_max).astype(int)
            pants[y, orig_left + shift_max:415] = sub[indices]

    # Right leg outer edge (right side, x > 665)
    row_r = np.flatnonzero(pants[y, 665:830, 3] > 200) + 665
    if len(row_r) > shift_max + 5:
        orig_right = row_r[-1]
        width_r = orig_right - 665
        if width_r > shift_max + 10:
            sub_r = pants[y, 665:orig_right + 1].copy()
            pants[y, orig_right - shift_max + 1:orig_right + 1] = 0
            indices_r = np.linspace(0, width_r, width_r - shift_max).astype(int)
            pants[y, 665:665 + len(indices_r)] = sub_r[indices_r]

bottom_fixed = Image.fromarray(pants)
bottom_fixed.save(OUT / 'layers/bottom.png')

# -------------------------------------------------------------------------
# FIX 3: Shoes & Ankle Gap (Image 1)
# - Remove rear ankle loop that created the white hollow hole!
# - Keep natural shoe collar line and let the base ankle connect smoothly into it.
# -------------------------------------------------------------------------
shoes = np.array(shoes_orig).copy()

# In left shoe (x: 300..500): the rear strap loop runs y=1690..1730, x=420..490
# The front collar begins around y=1738.
# Remove the isolated rear strap loop above the front collar:
for y in range(1685, 1735):
    # Left shoe rear loop
    shoes[y, 410:500, 3] = 0
    # Right shoe rear loop
    shoes[y, 600:700, 3] = 0

shoes_fixed = Image.fromarray(shoes)
shoes_fixed.save(OUT / 'layers/shoes.png')

# In base_with_shoes:
# DO NOT cut the ankles or heels!
# The ankles and heels must remain 100% visible skin down into the shoe collar!
# Only hide the bare toes below y=1775 that would stick out under the shoes:
base_arr = np.array(base).copy()
shoe_mask = shoes[:, :, 3] > 220
# For rows y >= 1775, mask base skin that is covered by the shoe body
for y in range(1775, 1920):
    mask_where = shoe_mask[y]
    base_arr[y, mask_where, 3] = 0

base_with_shoes = Image.fromarray(base_arr)
base_with_shoes.save(OUT / 'layers/base-with-shoes.png')

# -------------------------------------------------------------------------
# COMPOSITES & CROPS FOR USER REVIEW
# -------------------------------------------------------------------------
bg = Image.new('RGBA', (1080, 1920), (238, 230, 218, 255))

# 1. Shoes only composite
comp_shoes = Image.alpha_composite(base_with_shoes, shoes_fixed)
preview_shoes = Image.alpha_composite(bg, comp_shoes).convert('RGB')
preview_shoes.crop((280, 1600, 800, 1900)).save(OUT / 'shoes_only_fixed.jpg', quality=95)

# 2. Pants only composite
comp_pants = Image.alpha_composite(base, bottom_fixed)
preview_pants = Image.alpha_composite(bg, comp_pants).convert('RGB')
preview_pants.crop((280, 720, 800, 1900)).save(OUT / 'pants_only_fixed.jpg', quality=95)

# Crops for the 3 exact places the user pointed out:
# Crop 1: Shoes / Ankles
preview_shoes.crop((280, 1650, 800, 1880)).save(OUT / 'fix1_shoes_ankles.jpg', quality=95)

# Crop 2: Pants legs & hem
preview_pants.crop((280, 1250, 800, 1880)).save(OUT / 'fix2_pants_legs.jpg', quality=95)

# Crop 3: Waistband
preview_pants.crop((320, 740, 760, 825)).save(OUT / 'fix3_waistband.jpg', quality=95)

# Full composite: base_with_shoes -> shoes -> bottom -> top
comp_full = Image.alpha_composite(comp_shoes, bottom_fixed)
comp_full = Image.alpha_composite(comp_full, top)
comp_full.save(OUT / 'composite.png')

preview_full = Image.alpha_composite(bg, comp_full).convert('RGB')
preview_full.save(OUT / 'preview.jpg', quality=95)

print("Applied 3 fixes and generated inspection crops successfully!")
