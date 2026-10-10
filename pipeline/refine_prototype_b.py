"""Refine Prototype B: Fix waistband, trouser taper, and shoe collar."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/p3a-prototype-B'

# Load original layers
base = Image.open(ROOT / 'reports/p3a/extracted/male_base.png').convert('RGBA')
bottom_orig = Image.open(ROOT / 'reports/p3a-lower-v3/layers/bottom.png').convert('RGBA')
shoes_orig = Image.open(ROOT / 'reports/p3a-lower-v3/layers/shoes.png').convert('RGBA')
top = Image.open(OUT / 'layers/top.png').convert('RGBA')

# -------------------------------------------------------------------------
# FIX 1: Waistband (Image 3) - Flatten the duplicate rear hollow crescent
# -------------------------------------------------------------------------
pants_arr = np.array(bottom_orig).copy()
alpha = pants_arr[:, :, 3] > 200

for y in range(760, 788):
    pixels = np.flatnonzero(alpha[y, 350:730]) + 350
    if len(pixels) < 16:
        continue
    left, right = pixels[0], pixels[-1]
    # Keep 4px outer border, flatten the shaded interior
    interior = slice(left + 5, right - 4)
    before = pants_arr[y, interior, :3].astype(np.float32)
    target = np.array([249, 249, 246], dtype=np.float32)
    # Brighten grey shaded rim
    pants_arr[y, interior, :3] = np.round(before * 0.12 + target * 0.88)

# -------------------------------------------------------------------------
# FIX 2: Taper Trouser Legs (Image 2) - Narrower calves and cleaner hem
# -------------------------------------------------------------------------
# Left leg center ~415, Right leg center ~665
pants_tapered = np.zeros_like(pants_arr)
# Copy upper part verbatim (y < 1100)
pants_tapered[:1100] = pants_arr[:1100]

for y in range(1100, 1920):
    # progress from 0 at y=1100 to 1 at y=1700
    t = np.clip((y - 1100) / 600.0, 0.0, 1.0)
    # Smoothstep
    s = t * t * (3 - 2 * t)
    # Scale width down by ~18% at hem
    factor = 1.0 - 0.18 * s
    
    # Process left leg (x: 250..540)
    center_l = 415.0
    for x in range(250, 540):
        if pants_arr[y, x, 3] > 0:
            new_x = int(round(center_l + (x - center_l) * factor))
            if 0 <= new_x < 1080:
                pants_tapered[y, new_x] = pants_arr[y, x]
                
    # Process right leg (x: 540..830)
    center_r = 665.0
    for x in range(540, 830):
        if pants_arr[y, x, 3] > 0:
            new_x = int(round(center_r + (x - center_r) * factor))
            if 0 <= new_x < 1080:
                pants_tapered[y, new_x] = pants_arr[y, x]

# Fill any single-pixel interpolation gaps in alpha
alpha_tapered = pants_tapered[:, :, 3] > 0
for y in range(1100, 1920):
    for center, x_min, x_max in [(415, 250, 540), (665, 540, 830)]:
        xs = np.flatnonzero(alpha_tapered[y, x_min:x_max]) + x_min
        if len(xs) > 10:
            for x in range(xs[0], xs[-1] + 1):
                if pants_tapered[y, x, 3] == 0:
                    # fill with neighbor
                    pants_tapered[y, x] = pants_tapered[y, x - 1]

bottom_fixed = Image.fromarray(pants_tapered)
bottom_fixed.save(OUT / 'layers/bottom.png')

# -------------------------------------------------------------------------
# FIX 3: Shoes & Ankle Gap (Image 1) - Low collar slip-ons, NO white hole
# -------------------------------------------------------------------------
shoe_arr = np.array(shoes_orig).copy()
# Remove the awkward high rear ankle loop above y=1734
for y in range(1680, 1734):
    shoe_arr[y, :, 3] = 0

shoes_fixed = Image.fromarray(shoe_arr)
shoes_fixed.save(OUT / 'layers/shoes.png')

# Base with shoes: DO NOT cut ankles!
# Keep ankles 100% intact. Only hide the toes below y=1755 that fall inside the shoe silhouette.
base_arr = np.array(base).copy()
# Only mask the toes at the very bottom (y >= 1755)
# Check where shoe is solid:
shoe_solid = shoe_arr[:, :, 3] > 180
# Mask base skin only where shoe actually covers it at the bottom:
for y in range(1755, 1920):
    mask_zone = shoe_solid[y]
    base_arr[y, mask_zone, 3] = 0

base_with_shoes = Image.fromarray(base_arr)
base_with_shoes.save(OUT / 'layers/base-with-shoes.png')

# -------------------------------------------------------------------------
# COMPOSITE & PREVIEWS
# -------------------------------------------------------------------------
# Composite with shoes: base_with_shoes -> shoes -> bottom -> top
comp_shoes = Image.alpha_composite(base_with_shoes, shoes_fixed)
comp_pants = Image.alpha_composite(comp_shoes, bottom_fixed)
composite = Image.alpha_composite(comp_pants, top)
composite.save(OUT / 'composite.png')

# Also save standalone views for checking:
# 1. Shoes only
bg = Image.new('RGBA', (1080, 1920), (238, 230, 218, 255))
preview_shoes = Image.alpha_composite(bg, comp_shoes).convert('RGB')
preview_shoes.crop((280, 1600, 800, 1900)).save(OUT / 'shoes_only_fixed.jpg', quality=95)

# 2. Pants only
comp_pants_only = Image.alpha_composite(base, bottom_fixed)
preview_pants = Image.alpha_composite(bg, comp_pants_only).convert('RGB')
preview_pants.crop((280, 720, 800, 1900)).save(OUT / 'pants_only_fixed.jpg', quality=95)

# 3. Full preview
preview_full = Image.alpha_composite(bg, composite).convert('RGB')
preview_full.save(OUT / 'preview.jpg', quality=95)

print("Refinement completed successfully!")
