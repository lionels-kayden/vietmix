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

# 2. Extract source bounds row by row with true stroke centers (where alpha reaches ~128)
src_data = {}
for y in range(768, 1776):
    row_a = alpha_src[y, :]
    xs_all = np.where(row_a > 10)[0]
    if len(xs_all) == 0:
        continue
    
    left_xs = np.where((row_a > 10) & (np.arange(W) <= 540))[0]
    right_xs = np.where((row_a > 10) & (np.arange(W) >= 540))[0]
    
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
            'min': float(xs_all.min()),
            'max': float(xs_all.max()),
            'mid': 540.0
        }

# 3. Define target splines with feminine anime proportions:
# Pelvis outer curves (y from 755 to 1030)
# Covers the female hips completely (curves out smoothly around hip level, then tapers into thighs)
pts_y_pelvis = [755, 785, 840, 900, 940, 980, 1010, 1030]
pts_tgt_l_pelvis = [435.0, 420.0, 395.0, 385.0, 382.0, 388.0, 394.0, 400.0]
pts_tgt_r_pelvis = [645.0, 660.0, 685.0, 695.0, 698.0, 692.0, 686.0, 680.0]

spline_l_pelvis = PchipInterpolator(pts_y_pelvis, pts_tgt_l_pelvis)
spline_r_pelvis = PchipInterpolator(pts_y_pelvis, pts_tgt_r_pelvis)

# Legs curves (y from 1030 to 1775)
# Slender, graceful straight-leg drape: ~108-112px per leg with 14-20px negative space between legs
pts_y_legs = [1030, 1080, 1150, 1250, 1380, 1500, 1600, 1700, 1750, 1775]

# Left leg:
# Width starts at 135px at crotch, tapers to 118px at thigh, 108px at knee, 106px at calf, 112px at hem
pts_tgt_l_out = [400.0, 406.0, 414.0, 418.0, 422.0, 425.0, 426.0, 424.0, 422.0, 424.0]
pts_tgt_l_in  = [535.0, 534.0, 533.0, 532.0, 530.0, 531.0, 532.0, 533.0, 534.0, 535.0]

# Right leg:
pts_tgt_r_in  = [545.0, 546.0, 547.0, 548.0, 550.0, 549.0, 548.0, 547.0, 546.0, 545.0]
pts_tgt_r_out = [680.0, 674.0, 666.0, 662.0, 658.0, 655.0, 654.0, 656.0, 658.0, 656.0]

spline_l_out = PchipInterpolator(pts_y_legs, pts_tgt_l_out)
spline_l_in  = PchipInterpolator(pts_y_legs, pts_tgt_l_in)
spline_r_in  = PchipInterpolator(pts_y_legs, pts_tgt_r_in)
spline_r_out = PchipInterpolator(pts_y_legs, pts_tgt_r_out)

# Bilinear sampling with smooth clamping
def sample_bw_subpixel(y_float, x_float):
    if y_float < 0 or y_float >= H - 1 or x_float < 0 or x_float >= W - 1:
        return np.zeros(4, dtype=float)
    x0 = int(np.floor(x_float))
    x1 = x0 + 1
    y0 = int(np.floor(y_float))
    y1 = y0 + 1
    wx = x_float - x0
    wy = y_float - y0
    top = bw_arr[y0, x0] * (1.0 - wx) + bw_arr[y0, x1] * wx
    bot = bw_arr[y1, x0] * (1.0 - wx) + bw_arr[y1, x1] * wx
    return top * (1.0 - wy) + bot * wy

out_canvas = np.zeros((1920, 1080, 4), dtype=float)

# A. RENDER TWO LEGS (y from 1030 to 1775)
# Map including padding so source antialiasing is naturally preserved
pad = 8.0
for y in range(1030, 1776):
    src_row_y = y
    if src_row_y not in src_data or not src_data[src_row_y]['is_split']:
        continue
    s = src_data[src_row_y]
    s_l_min, s_l_max = s['l_min'], s['l_max']
    s_r_min, s_r_max = s['r_min'], s['r_max']
    
    t_l_out = float(spline_l_out(y))
    t_l_in  = float(spline_l_in(y))
    t_r_in  = float(spline_r_in(y))
    t_r_out = float(spline_r_out(y))
    
    # Left leg: scan with margin
    for x in range(int(np.floor(t_l_out - pad)), int(np.ceil(t_l_in + pad)) + 1):
        frac = (x - t_l_out) / max(1.0, t_l_in - t_l_out)
        # frac < 0 or frac > 1 maps smoothly into source margin
        x_src = s_l_min + frac * (s_l_max - s_l_min)
        pix = sample_bw_subpixel(src_row_y, x_src)
        if pix[3] > 0:
            out_canvas[y, x] = pix
            
    # Right leg: scan with margin
    for x in range(int(np.floor(t_r_in - pad)), int(np.ceil(t_r_out + pad)) + 1):
        frac = (x - t_r_in) / max(1.0, t_r_out - t_r_in)
        x_src = s_r_min + frac * (s_r_max - s_r_min)
        pix = sample_bw_subpixel(src_row_y, x_src)
        if pix[3] > 0:
            out_canvas[y, x] = pix

# B. RENDER PELVIS (y from 780 to 1029)
# Smooth female pelvis, mapping left half and right half to eliminate male fly zipper
for y in range(780, 1030):
    src_row_y = y
    if src_row_y not in src_data:
        continue
    s = src_data[src_row_y]
    s_min, s_max = s['min'], s['max']
    
    t_min = float(spline_l_pelvis(y))
    t_max = float(spline_r_pelvis(y))
    t_mid = 540.0
    
    # Left half: scan with pad
    for x in range(int(np.floor(t_min - pad)), int(np.ceil(t_mid)) + 1):
        frac = (x - t_min) / max(1.0, t_mid - t_min)
        x_src = s_min + frac * (534.0 - s_min)
        pix = sample_bw_subpixel(src_row_y, x_src)
        if pix[3] > 0:
            out_canvas[y, x] = pix
            
    # Right half: scan with pad
    for x in range(int(np.floor(t_mid)), int(np.ceil(t_max + pad)) + 1):
        frac = (x - t_mid) / max(1.0, t_max - t_mid)
        x_src = 546.0 + frac * (s_max - 546.0)
        pix = sample_bw_subpixel(src_row_y, x_src)
        if pix[3] > 0:
            out_canvas[y, x] = pix

    # Smooth horizontal seam across center (x in [536, 544])
    for x in range(536, 545):
        w = (x - 536) / 8.0
        out_canvas[y, x] = out_canvas[y, 535] * (1.0 - w) + out_canvas[y, 545] * w

# C. GRAFT FEMALE GATHERED WAISTBAND (y from 755 to 815)
H_f, W_f = arr_f.shape[:2]
wb_f_y_start, wb_f_y_end = 25.0, 105.0
c_y_start, c_y_end = 755, 815

for y in range(c_y_start, c_y_end + 1):
    t_y = (y - c_y_start) / float(c_y_end - c_y_start)
    y_f = wb_f_y_start + t_y * (wb_f_y_end - wb_f_y_start)
    
    t_min = float(spline_l_pelvis(min(y, 800))) if y >= 755 else 435.0
    t_max = float(spline_r_pelvis(min(y, 800))) if y >= 755 else 645.0
    
    # Weight: 1.0 at y=755..785, smoothly tapering to 0.0 at y=815
    blend_w = 1.0 if y <= 785 else (815 - y) / 30.0
    
    row_f_cloth = np.where(arr_f[int(round(y_f)), :, 3] > 20)[0]
    if len(row_f_cloth) == 0:
        continue
    f_x_min, f_x_max = row_f_cloth.min(), row_f_cloth.max()
    
    for x in range(int(np.floor(t_min - pad)), int(np.ceil(t_max + pad)) + 1):
        frac = (x - t_min) / max(1.0, t_max - t_min)
        x_f = f_x_min + frac * (f_x_max - f_x_min)
        if x_f < 0 or x_f >= W_f - 1:
            continue
        x0 = int(np.floor(x_f))
        x1 = x0 + 1
        y0 = int(np.clip(np.floor(y_f), 0, H_f - 1))
        y1 = int(np.clip(y0 + 1, 0, H_f - 1))
        wx = x_f - x0
        wy = y_f - y0
        top = arr_f[y0, x0] * (1.0 - wx) + arr_f[y0, x1] * wx
        bot = arr_f[y1, x0] * (1.0 - wx) + arr_f[y1, x1] * wx
        pix_f = top * (1.0 - wy) + bot * wy
        
        if pix_f[3] > 0:
            if blend_w >= 0.99:
                out_canvas[y, x] = pix_f
            else:
                out_canvas[y, x] = pix_f * blend_w + out_canvas[y, x] * (1.0 - blend_w)

# Clean alpha
final_pants = Image.fromarray(np.clip(out_canvas, 0, 255).astype(np.uint8))
final_pants.save('reports/p3a-prototype-B/female_layers_final/bottom.png')
print('Saved final bottom.png to female_layers_final/bottom.png')

# 4. EXTRACT BARE HANDS LAYER FROM FEMALE BASE
# Left hand: x in [328..396], y in [750..1075]
# Right hand: x in [684..752], y in [750..1075]
base_img = Image.open('reports/p3a/extracted/female_base.png').convert('RGBA')
base_arr = np.array(base_img)

hands_bare_arr = np.zeros_like(base_arr)

# Left arm / hand:
# At y in [750, 930], arm inner edge follows line from (750, 414) -> (850, 380) -> (930, 362)
# At y in [930, 1075], hand inner edge is x <= 396
for y in range(750, 1075):
    if y < 850:
        max_x = 414.0 - (414.0 - 380.0) * ((y - 750) / 100.0)
    elif y < 930:
        max_x = 380.0 - (380.0 - 362.0) * ((y - 850) / 80.0)
    else:
        max_x = 396.0
    for x in range(328, int(np.ceil(max_x)) + 1):
        hands_bare_arr[y, x] = base_arr[y, x]

# Right arm / hand:
# At y in [750, 930], arm inner edge follows line from (750, 666) -> (850, 700) -> (930, 718)
# At y in [930, 1075], hand inner edge is x >= 684
for y in range(750, 1075):
    if y < 850:
        min_x = 666.0 + (700.0 - 666.0) * ((y - 750) / 100.0)
    elif y < 930:
        min_x = 700.0 + (718.0 - 700.0) * ((y - 850) / 80.0)
    else:
        min_x = 684.0
    for x in range(int(np.floor(min_x)), 753):
        hands_bare_arr[y, x] = base_arr[y, x]

hands_bare_img = Image.fromarray(hands_bare_arr)
hands_bare_img.save('reports/p3a-prototype-B/female_layers_final/hands_bare.png')
print('Saved hands_bare.png to female_layers_final/hands_bare.png')

# 5. GENERATE HIGH RES REVIEW PREVIEWS
shoes = Image.open('reports/p3a-prototype-B/female_layers_final/shoes.png').convert('RGBA')
top_ngu_than = Image.open('reports/p3a-prototype-B/female_layers_final/top_ao_ngu_than.png').convert('RGBA')
hands_ngu_than = Image.open('reports/p3a-prototype-B/female_layers_final/hands_set1.png').convert('RGBA')
top_nhat_binh = Image.open('reports/p3a-prototype-B/female_layers_final/top_ao_nhat_binh.png').convert('RGBA')

# Preview 1: Pants only (Pants + Bare Hands)
comp_pants_only = Image.alpha_composite(base_img, shoes)
comp_pants_only = Image.alpha_composite(comp_pants_only, final_pants)
comp_pants_only = Image.alpha_composite(comp_pants_only, hands_bare_img)

bg_color = (238, 230, 218, 255)
bg1 = Image.new('RGBA', (1080, 1920), bg_color)
full_pants_only = Image.alpha_composite(bg1, comp_pants_only).convert('RGB')
crop_pants_only = full_pants_only.crop((260, 600, 820, 1850))
crop_pants_only.save('reports/p3a-prototype-B/test_female_pants_only_full.jpg', quality=95)
print('Saved test_female_pants_only_full.jpg')

# Preview 2: Set 1 (Áo Ngũ Thân)
comp_set1 = Image.alpha_composite(base_img, shoes)
comp_set1 = Image.alpha_composite(comp_set1, final_pants)
comp_set1 = Image.alpha_composite(comp_set1, top_ngu_than)
comp_set1 = Image.alpha_composite(comp_set1, hands_ngu_than)

bg2 = Image.new('RGBA', (1080, 1920), bg_color)
full_set1 = Image.alpha_composite(bg2, comp_set1).convert('RGB')
crop_set1 = full_set1.crop((200, 100, 880, 1860))
crop_set1.save('reports/p3a-prototype-B/Set1_AoNguThan_QuanTrang.jpg', quality=95)
print('Saved Set1_AoNguThan_QuanTrang.jpg')

# Preview 3: Set 2 (Áo Nhật Bình)
comp_set2 = Image.alpha_composite(base_img, shoes)
comp_set2 = Image.alpha_composite(comp_set2, final_pants)
comp_set2 = Image.alpha_composite(comp_set2, top_nhat_binh)

bg3 = Image.new('RGBA', (1080, 1920), bg_color)
full_set2 = Image.alpha_composite(bg3, comp_set2).convert('RGB')
crop_set2 = full_set2.crop((200, 100, 880, 1860))
crop_set2.save('reports/p3a-prototype-B/Set2_AoNhatBinh_QuanTrang.jpg', quality=95)
print('Saved Set2_AoNhatBinh_QuanTrang.jpg')

# Preview 4: Side by Side Comparison
W_c, H_c = crop_set1.size
compare_img = Image.new('RGB', (W_c * 2 + 30, H_c), (230, 222, 210))
compare_img.paste(crop_set1, (0, 0))
compare_img.paste(crop_set2, (W_c + 30, 0))
compare_img.save('reports/p3a-prototype-B/female_Set1_Set2_compare.jpg', quality=95)
print('Saved female_Set1_Set2_compare.jpg')

# Zooms
zoom_hands = full_pants_only.crop((300, 800, 780, 1150))
zoom_hands.save('reports/p3a-prototype-B/review_hands.jpg', quality=95)

zoom_pants_shoes = full_pants_only.crop((350, 1450, 730, 1850))
zoom_pants_shoes.save('reports/p3a-prototype-B/review_pants_shoes.jpg', quality=95)
print('Saved detail zoom crops')
