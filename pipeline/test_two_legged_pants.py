import sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path('.')
OUT = ROOT / 'reports/p3a-prototype-B'

# Load base and shoes
base = Image.open('reports/p3a/extracted/female_base.png').convert('RGBA')
shoes = Image.open(OUT / 'female_layers/shoes.png').convert('RGBA')
base_with_shoes = Image.open(OUT / 'female_layers/base-with-shoes.png').convert('RGBA')
b_arr = np.array(base)

# Load raw female pants
raw_p = Image.open('reports/p3a/extracted/F_COMMON_BOTTOM_quan_lua_trang.png').convert('RGBA')
arr_p = np.array(raw_p).astype(float)

# 1. Clean mannequin opening at top of waistband
for x in range(0, arr_p.shape[1]):
    if x < 53 or x > 314:
        arr_p[:50, x, 3] = 0
    else:
        dx = (x - 183.5) / 130.0
        rim_y = int(round(25.0 - 18.0 * (dx ** 2)))
        arr_p[:rim_y, x, 3] = 0

H_raw, W_raw = arr_p.shape[:2]

# Create output canvas
out_arr = np.zeros((1920, 1080, 4), dtype=float)

# Function to sample raw_p at fractional (y_raw, x_raw)
def sample_raw(y_r, x_r):
    y0 = np.clip(np.floor(y_r).astype(int), 0, H_raw - 1)
    y1 = np.clip(y0 + 1, 0, H_raw - 1)
    x0 = np.clip(np.floor(x_r).astype(int), 0, W_raw - 1)
    x1 = np.clip(x0 + 1, 0, W_raw - 1)
    wy = (y_r - y0)[:, :, np.newaxis]
    wx = (x_r - x0)[:, :, np.newaxis]
    
    top = arr_p[y0, x0] * (1.0 - wx) + arr_p[y0, x1] * wx
    bot = arr_p[y1, x0] * (1.0 - wx) + arr_p[y1, x1] * wx
    return top * (1.0 - wy) + bot * wy

# -------------------------------------------------------------------------
# A. PELVIS REGION (canvas y in [745, 1065])
# -------------------------------------------------------------------------
# Waistband at y=745: x in [435, 645] (width 210)
# Hips at y=930: x in [398, 682] (width 284)
# Crotch at y=1060: x in [408, 672] (width 264)
# Maps to raw_p y in [25, 310]
y_p_start, y_p_end = 745, 1065
raw_p_start, raw_p_end = 25.0, 310.0

for y_c in range(y_p_start, y_p_end + 1):
    t = (y_c - y_p_start) / float(y_p_end - y_p_start)
    y_raw = raw_p_start + t * (raw_p_end - raw_p_start)
    
    # Left hip curve (smooth S-curve):
    # at t=0: x=435; at t=0.6 (y=930): x=398; at t=1.0: x=408
    if t <= 0.6:
        x_left = 435.0 - (435.0 - 398.0) * np.sin(t / 0.6 * np.pi / 2.0)
        x_right = 645.0 + (682.0 - 645.0) * np.sin(t / 0.6 * np.pi / 2.0)
    else:
        u = (t - 0.6) / 0.4
        x_left = 398.0 + (408.0 - 398.0) * (u ** 2)
        x_right = 682.0 - (682.0 - 672.0) * (u ** 2)
        
    # In raw_p at y_raw, find content width
    row_cloth = np.where(arr_p[int(round(y_raw)), :, 3] > 20)[0]
    if len(row_cloth) == 0:
        continue
    raw_x_min, raw_x_max = row_cloth.min(), row_cloth.max()
    
    # Crotch arch at bottom (t > 0.85): split between legs
    # If y_c >= 1050, carve out smooth crotch arch in center (x around 540)
    for x_c in range(int(np.floor(x_left)), int(np.ceil(x_right)) + 1):
        if y_c >= 1050:
            dx_mid = abs(x_c - 540)
            arch_dy = (y_c - 1050) / 15.0 # 0 to 1
            if dx_mid < 12.0 * arch_dy:
                continue # crotch opening
                
        frac = (x_c - x_left) / max(1.0, x_right - x_left)
        x_raw = raw_x_min + frac * (raw_x_max - raw_x_min)
        
        # sample
        y0 = int(np.clip(np.floor(y_raw), 0, H_raw - 1))
        x0 = int(np.clip(np.floor(x_raw), 0, W_raw - 1))
        out_arr[y_c, x_c] = arr_p[y0, x0]

# -------------------------------------------------------------------------
# B. TWO SEPARATE LEGS (canvas y in [1060, 1795])
# -------------------------------------------------------------------------
# Left leg in raw_p: x in [raw_cloth.min(), 175]
# Right leg in raw_p: x in [175, raw_cloth.max()]
# Left leg on canvas:
# y=1060: [408, 528] (w=120)
# y=1380 (knee): [428, 532] (w=104)
# y=1795 (hem): [425, 535] (w=110)
# Right leg on canvas:
# y=1060: [552, 672] (w=120)
# y=1380 (knee): [548, 652] (w=104)
# y=1795 (hem): [545, 655] (w=110)

y_leg_start, y_leg_end = 1060, 1795
raw_leg_start, raw_leg_end = 310.0, 916.0

for y_c in range(y_leg_start, y_leg_end + 1):
    t = (y_c - y_leg_start) / float(y_leg_end - y_leg_start)
    y_raw = raw_leg_start + t * (raw_leg_end - raw_leg_start)
    
    # Left leg boundaries:
    # Outer: 408 at t=0 -> 428 at t=0.45 -> 425 at t=1.0
    if t <= 0.45:
        l_outer = 408.0 + (428.0 - 408.0) * (t / 0.45)
    else:
        l_outer = 428.0 - (428.0 - 425.0) * ((t - 0.45) / 0.55)
    l_inner = 528.0 + (535.0 - 528.0) * t
    
    # Right leg boundaries:
    r_inner = 552.0 - (552.0 - 545.0) * t
    if t <= 0.45:
        r_outer = 672.0 - (672.0 - 652.0) * (t / 0.45)
    else:
        r_outer = 652.0 + (655.0 - 652.0) * ((t - 0.45) / 0.55)
        
    row_cloth = np.where(arr_p[int(round(y_raw)), :, 3] > 20)[0]
    if len(row_cloth) == 0: continue
    raw_x_min, raw_x_max = row_cloth.min(), row_cloth.max()
    raw_mid = 175.0
    
    # Left leg sampling:
    for x_c in range(int(np.floor(l_outer)), int(np.ceil(l_inner)) + 1):
        frac = (x_c - l_outer) / max(1.0, l_inner - l_outer)
        x_raw = raw_x_min + frac * (raw_mid - raw_x_min)
        y0 = int(np.clip(np.floor(y_raw), 0, H_raw - 1))
        x0 = int(np.clip(np.floor(x_raw), 0, W_raw - 1))
        out_arr[y_c, x_c] = arr_p[y0, x0]
        
    # Right leg sampling:
    for x_c in range(int(np.floor(r_inner)), int(np.ceil(r_outer)) + 1):
        frac = (x_c - r_inner) / max(1.0, r_outer - r_inner)
        x_raw = raw_mid + frac * (raw_x_max - raw_mid)
        y0 = int(np.clip(np.floor(y_raw), 0, H_raw - 1))
        x0 = int(np.clip(np.floor(x_raw), 0, W_raw - 1))
        out_arr[y_c, x_c] = arr_p[y0, x0]

# Add dark outline strokes to inner and outer leg seams for vector crispness
tailored_pants = Image.fromarray(np.clip(out_arr, 0, 255).astype(np.uint8))
tailored_pants.save(OUT / 'test_tailored_pants_two_legs.png')

# Composite onto base:
comp = Image.alpha_composite(base_with_shoes, shoes)
comp = Image.alpha_composite(comp, tailored_pants)

bg = Image.new('RGBA', (1080, 1920), (238, 230, 218, 255))
full = Image.alpha_composite(bg, comp).convert('RGB')
crop = full.crop((250, 550, 830, 1860))
crop.save(OUT / 'test_tailored_pants_preview.jpg', quality=95)
print('Generated test_tailored_pants_preview.jpg successfully!')
