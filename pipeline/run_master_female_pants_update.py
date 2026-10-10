import sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
import shutil
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from scipy.interpolate import PchipInterpolator
from scipy.ndimage import map_coordinates

ROOT = Path('.')
PROTO = ROOT / 'reports/p3a-prototype-B'
FEMALE_LAYERS = PROTO / 'female_layers_final'
ARTIFACTS_DIR = Path(r'C:\Users\Admin\.gemini\antigravity\brain\81e2d9d9-3534-437e-acac-d0e98bf9b1ea')

# 1. LOAD AND PREPARE ASSETS
raw_f = Image.open('reports/p3a/extracted/F_COMMON_BOTTOM_quan_lua_trang.png').convert('RGBA')
arr_f = np.array(raw_f).astype(float)
H_f, W_f = arr_f.shape[:2]

for x in range(0, W_f):
    if x < 45 or x > 325:
        arr_f[:50, x, 3] = 0
    else:
        dx = (x - 185.0) / 140.0
        rim_y = int(round(25.0 - 18.0 * (dx ** 2)))
        arr_f[:max(0, rim_y), x, 3] = 0

bw = Image.open('reports/p3a-prototype-B/layers/bottom_white.png').convert('RGBA')
bw_arr = np.array(bw).astype(float)
H, W = bw_arr.shape[:2]

# 2. SPLINES
pts_y = [748, 785, 830, 890, 950, 1010, 1040, 1150, 1250, 1380, 1500, 1600, 1700, 1755]

s_l_out = [410.0, 404.0, 396.0, 385.0, 372.0, 364.0, 362.0, 355.0, 350.0, 358.0, 364.0, 368.0, 370.0, 371.0]
s_l_in  = [540.0, 540.0, 540.0, 540.0, 540.0, 540.0, 536.0, 528.0, 514.0, 508.0, 510.0, 516.0, 520.0, 522.0]
s_r_in  = [540.0, 540.0, 540.0, 540.0, 540.0, 540.0, 546.0, 556.0, 570.0, 578.0, 574.0, 568.0, 566.0, 564.0]
s_r_out = [670.0, 680.0, 688.0, 700.0, 712.0, 718.0, 720.0, 728.0, 734.0, 732.0, 724.0, 716.0, 710.0, 708.0]

spl_s_l_out = PchipInterpolator(pts_y, s_l_out)
spl_s_l_in  = PchipInterpolator(pts_y, s_l_in)
spl_s_r_in  = PchipInterpolator(pts_y, s_r_in)
spl_s_r_out = PchipInterpolator(pts_y, s_r_out)

base_t_l_out = [414.0, 396.0, 384.0, 382.0, 386.0, 394.0, 400.0, 412.0, 418.0, 424.0, 430.0, 436.0, 440.0, 442.0]
base_t_l_in  = [540.0, 540.0, 540.0, 540.0, 540.0, 540.0, 534.0, 532.0, 531.0, 530.0, 530.0, 531.0, 532.0, 532.0]

# Nhích ống quần khép vào trong 5px (từ đũng y=1010 xuống gấu y=1755)
delta = 5.0
def ramp(y):
    if y <= 1010: return 0.0
    return delta * (y - 1010.0) / (1755.0 - 1010.0)

t_l_out = [base_t_l_out[i] + ramp(pts_y[i]) for i in range(len(pts_y))]
t_l_in  = [base_t_l_in[i] + ramp(pts_y[i]) for i in range(len(pts_y))]
t_r_in  = [540.5 + (540.5 - x) for x in t_l_in]
t_r_out = [540.5 + (540.5 - x) for x in t_l_out]

spl_t_l_out = PchipInterpolator(pts_y, t_l_out)
spl_t_l_in  = PchipInterpolator(pts_y, t_l_in)
spl_t_r_in  = PchipInterpolator(pts_y, t_r_in)
spl_t_r_out = PchipInterpolator(pts_y, t_r_out)

cuff_l_x = (t_l_out[-1] + t_l_in[-1]) / 2.0
cuff_r_x = (t_r_in[-1] + t_r_out[-1]) / 2.0

def y_bot_l(x):
    u = (x - cuff_l_x) / 45.0
    return 1762.0 - 7.0 * (u ** 2)

def y_bot_r(x):
    u = (x - cuff_r_x) / 45.0
    return 1762.0 - 7.0 * (u ** 2)

def y_top_rim(x):
    u = (x - 540.5) / 126.5
    return 748.0 + 4.0 * (1.0 - u ** 2)

# 3. WARP LOWER TAILORED LEGS (y from 1010 to 1765)
Y_src_bw = np.zeros((H, W), dtype=np.float32)
X_src_bw = np.zeros((H, W), dtype=np.float32)
Y_src_bw.fill(-1.0)
X_src_bw.fill(-1.0)

for y in range(1010, 1765):
    y_spline = np.clip(y, 1010, 1755)
    tl_out, tl_in = float(spl_t_l_out(y_spline)), float(spl_t_l_in(y_spline))
    tr_in, tr_out = float(spl_t_r_in(y_spline)), float(spl_t_r_out(y_spline))
    sl_out, sl_in = float(spl_s_l_out(y_spline)), float(spl_s_l_in(y_spline))
    sr_in, sr_out = float(spl_s_r_in(y_spline)), float(spl_s_r_out(y_spline))
    
    pad = 8.0
    for x in range(int(np.floor(tl_out - pad)), int(np.ceil(tl_in + pad)) + 1):
        if x < 0 or x >= W: continue
        if y > y_bot_l(x): continue
        u = (x - tl_out) / max(1.0, tl_in - tl_out)
        xs = sl_out + u * (sl_in - sl_out)
        X_src_bw[y, x] = xs
        if y <= 1600:
            ys = float(y)
        else:
            yb = y_bot_l(x)
            v = (y - 1600.0) / max(1.0, yb - 1600.0)
            ys = 1600.0 + v * (1748.0 - 1600.0)
        Y_src_bw[y, x] = ys
        
    for x in range(int(np.floor(tr_in - pad)), int(np.ceil(tr_out + pad)) + 1):
        if x < 0 or x >= W: continue
        if y > y_bot_r(x): continue
        u = (x - tr_in) / max(1.0, tr_out - tr_in)
        xs = sr_in + u * (sr_out - sr_in)
        X_src_bw[y, x] = xs
        if y <= 1600:
            ys = float(y)
        else:
            yb = y_bot_r(x)
            v = (y - 1600.0) / max(1.0, yb - 1600.0)
            ys = 1600.0 + v * (1748.0 - 1600.0)
        Y_src_bw[y, x] = ys

coords_bw = [Y_src_bw, X_src_bw]
canvas_bw = np.zeros((H, W, 4), dtype=np.uint8)
for c in range(4):
    ch = map_coordinates(bw_arr[:, :, c], coords_bw, order=1, mode='constant', cval=0.0)
    canvas_bw[:, :, c] = np.clip(ch, 0, 255).astype(np.uint8)

# 4. WARP UPPER PELVIS from F_COMMON (y from 748 to 1040)
Y_src_f = np.zeros((H, W), dtype=np.float32)
X_src_f = np.zeros((H, W), dtype=np.float32)
Y_src_f.fill(-1.0)
X_src_f.fill(-1.0)

for y in range(748, 1041):
    y_spline = float(y)
    tl_out = float(spl_t_l_out(y_spline))
    tr_out = float(spl_t_r_out(y_spline))
    
    v_f = (y - 748.0) / (1040.0 - 748.0)
    yf = 20.0 + v_f * (240.0 - 20.0)
    
    xf_min = 50.0 - v_f * (50.0 - 20.0)
    xf_max = 318.0 + v_f * (346.0 - 318.0)
    
    pad = 8.0
    for x in range(int(np.floor(tl_out - pad)), int(np.ceil(tr_out + pad)) + 1):
        if x < 0 or x >= W: continue
        if y < y_top_rim(x): continue
        u = (x - tl_out) / max(1.0, tr_out - tl_out)
        xf = xf_min + u * (xf_max - xf_min)
        X_src_f[y, x] = xf
        Y_src_f[y, x] = yf

coords_f = [Y_src_f, X_src_f]
canvas_f = np.zeros((H, W, 4), dtype=np.uint8)
for c in range(4):
    ch = map_coordinates(arr_f[:, :, c], coords_f, order=1, mode='constant', cval=0.0)
    canvas_f[:, :, c] = np.clip(ch, 0, 255).astype(np.uint8)

# In crotch gap between legs, clear canvas_f
for y in range(1030, 1041):
    tl_in = float(spl_t_l_in(y))
    tr_in = float(spl_t_r_in(y))
    for x in range(int(np.ceil(tl_in)), int(np.floor(tr_in)) + 1):
        if 0 <= x < W:
            canvas_f[y, x, 3] = 0

# 5. FUSION: 100% canvas_f down to y=1010, smooth blend at crotch split [1010..1040], then 100% canvas_bw
canvas_merged = canvas_bw.copy()
for y in range(748, 1041):
    if y <= 1010:
        canvas_merged[y] = canvas_f[y]
    else:
        t = (y - 1010.0) / 30.0
        w_f = 0.5 + 0.5 * np.cos(t * np.pi)
        row_f = canvas_f[y].astype(float)
        row_bw = canvas_bw[y].astype(float)
        for x in range(W):
            if row_f[x, 3] > 10 and row_bw[x, 3] > 10:
                canvas_merged[y, x] = np.clip(row_f[x] * w_f + row_bw[x] * (1.0 - w_f), 0, 255).astype(np.uint8)
            elif row_f[x, 3] > 10:
                canvas_merged[y, x] = np.clip(row_f[x], 0, 255).astype(np.uint8)

for y in range(1030, 1765):
    tl_in = float(spl_t_l_in(min(y, 1755)))
    tr_in = float(spl_t_r_in(min(y, 1755)))
    for x in range(int(np.ceil(tl_in)), int(np.floor(tr_in)) + 1):
        if 0 <= x < W:
            canvas_merged[y, x, 3] = 0

# 6. ANIME VECTOR LINEART AT 4X SUPERSAMPLING
ss = 4
stroke_layer = Image.new('RGBA', (W * ss, H * ss), (0, 0, 0, 0))
draw = ImageDraw.Draw(stroke_layer)

stroke_color = (42, 42, 44, 255)
stitch_color = (190, 194, 200, 190)

pts_top = [(x * ss, y_top_rim(x) * ss) for x in np.linspace(414, 667, 181)]
draw.line(pts_top, fill=stroke_color, width=int(1.6 * ss), joint='round')

l_start_x = t_l_out[-1]
l_end_x = t_l_in[-1]
pts_l = [(l_start_x * ss, 1753.0 * ss)]
for x in np.linspace(l_start_x, l_end_x, 91):
    pts_l.append((x * ss, y_bot_l(x) * ss))
pts_l.append((l_end_x * ss, 1753.0 * ss))
draw.line(pts_l, fill=stroke_color, width=int(1.6 * ss), joint='round')
pts_l_stitch = [(x * ss, (y_bot_l(x) - 7.0) * ss) for x in np.linspace(l_start_x + 2, l_end_x - 2, 87)]
draw.line(pts_l_stitch, fill=stitch_color, width=int(1.0 * ss), joint='round')

r_start_x = t_r_in[-1]
r_end_x = t_r_out[-1]
pts_r = [(r_start_x * ss, 1753.0 * ss)]
for x in np.linspace(r_start_x, r_end_x, 91):
    pts_r.append((x * ss, y_bot_r(x) * ss))
pts_r.append((r_end_x * ss, 1753.0 * ss))
draw.line(pts_r, fill=stroke_color, width=int(1.6 * ss), joint='round')
pts_r_stitch = [(x * ss, (y_bot_r(x) - 7.0) * ss) for x in np.linspace(r_start_x + 2, r_end_x - 2, 87)]
draw.line(pts_r_stitch, fill=stitch_color, width=int(1.0 * ss), joint='round')

stroke_downscaled = stroke_layer.resize((W, H), Image.Resampling.LANCZOS)
final_pants = Image.alpha_composite(Image.fromarray(canvas_merged), stroke_downscaled)

# SAVE DEFINITIVE bottom.png
final_pants.save(FEMALE_LAYERS / 'bottom.png')
print('Overwritten female_layers_final/bottom.png with definitive seamless pants!')

# 7. GENERATE ALL REVIEWS
base_img = Image.open('reports/p3a/extracted/female_base.png').convert('RGBA')
base_ws = Image.open(FEMALE_LAYERS / 'base-with-shoes.png').convert('RGBA')
bottom_img = final_pants
shoes_img = Image.open(FEMALE_LAYERS / 'shoes.png').convert('RGBA')
hands_bare = Image.open(FEMALE_LAYERS / 'hands_bare.png').convert('RGBA')
top_ngu_than = Image.open(FEMALE_LAYERS / 'top_ao_ngu_than.png').convert('RGBA')
hands_ngu_than = Image.open(FEMALE_LAYERS / 'hands_set1.png').convert('RGBA')
top_nhat_binh = Image.open(FEMALE_LAYERS / 'top_ao_nhat_binh.png').convert('RGBA')

bg_color = (238, 230, 218, 255)

# Full pants barefoot (user inspection mode)
comp_pants_only = Image.alpha_composite(base_img, bottom_img)
bg_1 = Image.new('RGBA', (1080, 1920), bg_color)
full_pants_only = Image.alpha_composite(bg_1, comp_pants_only).convert('RGB')
crop_pants_only = full_pants_only.crop((260, 600, 820, 1850))
crop_pants_only.save(PROTO / 'test_female_pants_only_full.jpg', quality=95)

# Bare legs with shoes
comp_bare_shoes = Image.alpha_composite(base_ws, shoes_img)
crop_shoes_only = Image.alpha_composite(bg_1, comp_bare_shoes).convert('RGB').crop((320, 1500, 760, 1860))
crop_shoes_only.save(PROTO / 'review_shoes_only.jpg', quality=95)

# Pants + Shoes
comp_pants_shoes = Image.alpha_composite(comp_bare_shoes, bottom_img)
full_pants_shoes = Image.alpha_composite(bg_1, comp_pants_shoes).convert('RGB')
crop_pants_shoes = full_pants_shoes.crop((320, 1500, 760, 1860))
crop_pants_shoes.save(PROTO / 'review_pants_shoes.jpg', quality=95)

# Set 1: Áo Ngũ Thân
comp_set1 = Image.alpha_composite(comp_pants_shoes, top_ngu_than)
comp_set1 = Image.alpha_composite(comp_set1, hands_ngu_than)
bg_2 = Image.new('RGBA', (1080, 1920), bg_color)
full_set1 = Image.alpha_composite(bg_2, comp_set1).convert('RGB')
crop_set1 = full_set1.crop((200, 100, 880, 1860))
crop_set1.save(PROTO / 'Set1_AoNguThan_QuanTrang.jpg', quality=95)

# Set 2: Áo Nhật Bình
comp_set2 = Image.alpha_composite(comp_pants_shoes, top_nhat_binh)
bg_3 = Image.new('RGBA', (1080, 1920), bg_color)
full_set2 = Image.alpha_composite(bg_3, comp_set2).convert('RGB')
crop_set2 = full_set2.crop((200, 100, 880, 1860))
crop_set2.save(PROTO / 'Set2_AoNhatBinh_QuanTrang.jpg', quality=95)

# Side-by-side comparison
W_c, H_c = crop_set1.size
compare_img = Image.new('RGB', (W_c * 2 + 30, H_c), (230, 222, 210))
compare_img.paste(crop_set1, (0, 0))
compare_img.paste(crop_set2, (W_c + 30, 0))
compare_img.save(PROTO / 'female_Set1_Set2_compare.jpg', quality=95)

# Detail Zooms
zoom_hands = full_set1.crop((300, 910, 780, 1120))
zoom_hands.save(PROTO / 'review_hands.jpg', quality=95)

zoom_collars = full_set1.crop((400, 360, 680, 680))
zoom_collars.save(PROTO / 'review_collars.jpg', quality=95)

# Before/After comparison for Thumbs
try:
    user_before = Image.open(ARTIFACTS_DIR / '.user_uploaded/media_1791445269836_fcf534a6.png').convert('RGB')
    # In user screenshot, hands are roughly around y=550..750 of the user image
    # Let's crop hands from user screenshot or use our saved previous hands
    # Crop hands from full_set1:
    h_curr = full_set1.crop((300, 910, 780, 1120))
    # We also have test_hands_layer.png or previous hands_set1_flawless.png
    # Let's composite previous hands to get exact before:
    prev_hands = Image.open(FEMALE_LAYERS / 'hands_set1_flawless.png').convert('RGBA')
    comp_prev = Image.alpha_composite(comp_pants_shoes, top_ngu_than)
    comp_prev = Image.alpha_composite(comp_prev, prev_hands)
    full_prev = Image.alpha_composite(bg_2, comp_prev).convert('RGB')
    h_prev = full_prev.crop((300, 910, 780, 1120))
    
    W_h, H_h = h_curr.size
    comp_thumbs = Image.new('RGB', (W_h * 2 + 30, H_h + 50), (245, 240, 235))
    draw_t = ImageDraw.Draw(comp_thumbs)
    comp_thumbs.paste(h_prev, (0, 45))
    comp_thumbs.paste(h_curr, (W_h + 30, 45))
    try:
        font_lbl = ImageFont.truetype('C:/Windows/Fonts/calibri.ttf', 20)
    except:
        font_lbl = None
    draw_t.text((20, 10), "TRƯỚC: Ngón cái bị khuất sau vạt áo", fill=(180, 40, 40), font=font_lbl)
    draw_t.text((W_h + 50, 10), "SAU: Đầy đủ 5 ngón, ngón cái lộ rõ tự nhiên", fill=(20, 120, 50), font=font_lbl)
    comp_thumbs.save(PROTO / 'compare_hands_thumbs_before_after.jpg', quality=95)
    comp_thumbs.save(ARTIFACTS_DIR / 'compare_hands_thumbs_before_after.jpg', quality=95)
    print('Generated compare_hands_thumbs_before_after.jpg')
except Exception as e:
    print('Could not generate compare_thumbs:', e)

# Sync to artifacts
files_to_sync = [
    'test_female_pants_only_full.jpg',
    'Set1_AoNguThan_QuanTrang.jpg',
    'Set2_AoNhatBinh_QuanTrang.jpg',
    'female_Set1_Set2_compare.jpg',
    'review_pants_shoes.jpg',
    'review_shoes_only.jpg',
    'review_hands.jpg',
    'review_collars.jpg'
]

for fname in files_to_sync:
    src_file = PROTO / fname
    dst_file = ARTIFACTS_DIR / fname
    if src_file.exists():
        shutil.copy2(src_file, dst_file)
        print(f'Synced {fname} to artifacts')

print('All reviews and artifacts updated successfully!')
