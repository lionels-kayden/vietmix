import sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.interpolate import PchipInterpolator

# Load files
bw = Image.open('reports/p3a-prototype-B/layers/bottom_white.png').convert('RGBA')
bw_arr = np.array(bw).astype(float)
H, W = bw_arr.shape[:2]
alpha_src = bw_arr[:, :, 3]

raw_f = Image.open('reports/p3a/extracted/F_COMMON_BOTTOM_quan_lua_trang.png').convert('RGBA')
arr_f = np.array(raw_f).astype(float)

# 1. Clean mannequin opening at top of female waistband
for x in range(0, arr_f.shape[1]):
    if x < 53 or x > 314:
        arr_f[:50, x, 3] = 0
    else:
        dx = (x - 183.5) / 130.0
        rim_y = int(round(25.0 - 18.0 * (dx ** 2)))
        arr_f[:rim_y, x, 3] = 0

# 2. Extract source bounds row by row
src_data = {}
for y in range(768, 1776):
    row_a = alpha_src[y, :]
    xs = np.where(row_a > 20)[0]
    if len(xs) == 0:
        continue
    
    # Check if this row is split into two legs
    # Look for gap between 520 and 560
    left_xs = xs[xs <= 540]
    right_xs = xs[xs >= 540]
    if y >= 1030 and len(left_xs) > 0 and len(right_xs) > 0 and left_xs.max() < right_xs.min():
        src_data[y] = {
            'is_split': True,
            'l_min': float(left_xs.min()),
            'l_max': float(left_xs.max()),
            'r_min': float(right_xs.min()),
            'r_max': float(right_xs.max())
        }
    else:
        src_data[y] = {
            'is_split': False,
            'min': float(xs.min()),
            'max': float(xs.max()),
            'mid': 540.0
        }

print(f'Extracted source data for {len(src_data)} rows.')

# 3. Define target splines
# Pelvis outer curves (y from 755 to 1030)
pts_y_pelvis = [755, 800, 850, 900, 940, 980, 1010, 1030]
pts_tgt_l_pelvis = [436.0, 424.0, 414.0, 408.0, 406.0, 408.0, 410.0, 412.0]
pts_tgt_r_pelvis = [644.0, 656.0, 666.0, 672.0, 674.0, 672.0, 670.0, 668.0]

spline_l_pelvis = PchipInterpolator(pts_y_pelvis, pts_tgt_l_pelvis)
spline_r_pelvis = PchipInterpolator(pts_y_pelvis, pts_tgt_r_pelvis)

# Legs curves (y from 1030 to 1775)
pts_y_legs = [1030, 1080, 1150, 1250, 1380, 1500, 1600, 1700, 1750, 1775]
# Left leg
pts_tgt_l_out = [412.0, 414.0, 418.0, 422.0, 424.0, 426.0, 428.0, 426.0, 424.0, 426.0]
pts_tgt_l_in  = [536.0, 535.0, 534.0, 532.0, 530.0, 531.0, 532.0, 533.0, 534.0, 535.0]

# Right leg
pts_tgt_r_in  = [544.0, 545.0, 546.0, 548.0, 550.0, 549.0, 548.0, 547.0, 546.0, 545.0]
pts_tgt_r_out = [668.0, 666.0, 662.0, 658.0, 656.0, 654.0, 652.0, 654.0, 656.0, 654.0]

spline_l_out = PchipInterpolator(pts_y_legs, pts_tgt_l_out)
spline_l_in  = PchipInterpolator(pts_y_legs, pts_tgt_l_in)
spline_r_in  = PchipInterpolator(pts_y_legs, pts_tgt_r_in)
spline_r_out = PchipInterpolator(pts_y_legs, pts_tgt_r_out)

# Function to sample bw_arr with bilinear interpolation
def sample_bw_subpixel(y_float, x_float):
    y0 = int(np.clip(np.floor(y_float), 0, H - 1))
    y1 = int(np.clip(y0 + 1, 0, H - 1))
    x0 = int(np.clip(np.floor(x_float), 0, W - 1))
    x1 = int(np.clip(x0 + 1, 0, W - 1))
    
    wx = x_float - x0
    wy = y_float - y0
    
    top = bw_arr[y0, x0] * (1.0 - wx) + bw_arr[y0, x1] * wx
    bot = bw_arr[y1, x0] * (1.0 - wx) + bw_arr[y1, x1] * wx
    return top * (1.0 - wy) + bot * wy

# Create output canvas
out_canvas = np.zeros((1920, 1080, 4), dtype=float)

# A. RENDER TWO LEGS (y from 1030 to 1775)
for y in range(1030, 1776):
    src_row_y = y
    if src_row_y not in src_data or not src_data[src_row_y]['is_split']:
        # fallback to nearby row if needed
        continue
    
    s = src_data[src_row_y]
    s_l_min, s_l_max = s['l_min'], s['l_max']
    s_r_min, s_r_max = s['r_min'], s['r_max']
    
    t_l_out = float(spline_l_out(y))
    t_l_in  = float(spline_l_in(y))
    t_r_in  = float(spline_r_in(y))
    t_r_out = float(spline_r_out(y))
    
    # Render left leg
    for x in range(int(np.floor(t_l_out)), int(np.ceil(t_l_in)) + 1):
        frac = (x - t_l_out) / max(1.0, t_l_in - t_l_out)
        frac = np.clip(frac, 0.0, 1.0)
        x_src = s_l_min + frac * (s_l_max - s_l_min)
        out_canvas[y, x] = sample_bw_subpixel(src_row_y, x_src)
        
    # Render right leg
    for x in range(int(np.floor(t_r_in)), int(np.ceil(t_r_out)) + 1):
        frac = (x - t_r_in) / max(1.0, t_r_out - t_r_in)
        frac = np.clip(frac, 0.0, 1.0)
        x_src = s_r_min + frac * (s_r_max - s_r_min)
        out_canvas[y, x] = sample_bw_subpixel(src_row_y, x_src)

# B. RENDER PELVIS (y from 785 to 1029)
# In source, male fly is at x around 536..544
for y in range(785, 1030):
    src_row_y = y
    if src_row_y not in src_data:
        continue
    s = src_data[src_row_y]
    s_min, s_max = s['min'], s['max']
    s_mid = 540.0
    
    t_min = float(spline_l_pelvis(y))
    t_max = float(spline_r_pelvis(y))
    t_mid = 540.0
    
    # Left half: exclude fly line (map to s_min..534)
    for x in range(int(np.floor(t_min)), int(np.ceil(t_mid))):
        frac = (x - t_min) / max(1.0, t_mid - t_min)
        frac = np.clip(frac, 0.0, 1.0)
        x_src = s_min + frac * (534.0 - s_min)
        out_canvas[y, x] = sample_bw_subpixel(src_row_y, x_src)
        
    # Right half: exclude fly line (map to 546..s_max)
    for x in range(int(np.floor(t_mid)), int(np.ceil(t_max)) + 1):
        frac = (x - t_mid) / max(1.0, t_max - t_mid)
        frac = np.clip(frac, 0.0, 1.0)
        x_src = 546.0 + frac * (s_max - 546.0)
        out_canvas[y, x] = sample_bw_subpixel(src_row_y, x_src)

    # In center seam (x in [537, 543]), smooth horizontal gradient to blend
    for x in range(537, 544):
        w = (x - 537) / 6.0
        out_canvas[y, x] = out_canvas[y, 536] * (1.0 - w) + out_canvas[y, 544] * w

# C. GRAFT FEMALE GATHERED WAISTBAND (y from 755 to 810)
# Female waistband in arr_f: y in [25, 95], x in [45, 320]
H_f, W_f = arr_f.shape[:2]
wb_f_y_start, wb_f_y_end = 25.0, 95.0
c_y_start, c_y_end = 755, 810

for y in range(c_y_start, c_y_end + 1):
    t_y = (y - c_y_start) / float(c_y_end - c_y_start)
    y_f = wb_f_y_start + t_y * (wb_f_y_end - wb_f_y_start)
    
    # Width on canvas at y
    t_min = float(spline_l_pelvis(min(y, 800))) if y >= 755 else 436.0
    t_max = float(spline_r_pelvis(min(y, 800))) if y >= 755 else 644.0
    
    # Alpha blend weight: 1.0 at y=755..785, tapering to 0.0 at y=810
    blend_w = 1.0 if y <= 785 else (810 - y) / 25.0
    
    # Row in arr_f
    row_f_cloth = np.where(arr_f[int(round(y_f)), :, 3] > 20)[0]
    if len(row_f_cloth) == 0:
        continue
    f_x_min, f_x_max = row_f_cloth.min(), row_f_cloth.max()
    
    for x in range(int(np.floor(t_min)), int(np.ceil(t_max)) + 1):
        frac = (x - t_min) / max(1.0, t_max - t_min)
        frac = np.clip(frac, 0.0, 1.0)
        x_f = f_x_min + frac * (f_x_max - f_x_min)
        
        # sample arr_f
        x0 = int(np.clip(np.floor(x_f), 0, W_f - 1))
        x1 = int(np.clip(x0 + 1, 0, W_f - 1))
        y0 = int(np.clip(np.floor(y_f), 0, H_f - 1))
        y1 = int(np.clip(y0 + 1, 0, H_f - 1))
        wx = x_f - x0
        wy = y_f - y0
        top = arr_f[y0, x0] * (1.0 - wx) + arr_f[y0, x1] * wx
        bot = arr_f[y1, x0] * (1.0 - wx) + arr_f[y1, x1] * wx
        pix_f = top * (1.0 - wy) + bot * wy
        
        if blend_w >= 0.99:
            out_canvas[y, x] = pix_f
        else:
            out_canvas[y, x] = pix_f * blend_w + out_canvas[y, x] * (1.0 - blend_w)

# Clean alpha and save
out_img = Image.fromarray(np.clip(out_canvas, 0, 255).astype(np.uint8))
out_img.save('reports/p3a-prototype-B/test_refined_female_pants.png')
print('Generated test_refined_female_pants.png successfully!')

# Composite onto base and shoes
base = Image.open('reports/p3a/extracted/female_base.png').convert('RGBA')
shoes = Image.open('reports/p3a-prototype-B/female_layers_final/shoes.png').convert('RGBA')

comp = Image.alpha_composite(base, shoes)
comp = Image.alpha_composite(comp, out_img)

bg = Image.new('RGBA', (1080, 1920), (238, 230, 218, 255))
full = Image.alpha_composite(bg, comp).convert('RGB')
crop = full.crop((260, 600, 820, 1850))
crop.save('reports/p3a-prototype-B/test_refined_female_pants_crop.jpg', quality=95)
print('Generated test_refined_female_pants_crop.jpg successfully!')
