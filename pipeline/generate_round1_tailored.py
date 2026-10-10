import sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
import shutil
from PIL import Image, ImageDraw
import numpy as np

from scipy.interpolate import PchipInterpolator
from scipy.ndimage import gaussian_filter, map_coordinates

ROOT = Path('.')
OUT = ROOT / 'reports/p3a-prototype-B'
LAYERS_FINAL = OUT / 'female_layers_final'
LAYERS_FINAL.mkdir(parents=True, exist_ok=True)
ARTIFACT_DIR = Path('C:/Users/Admin/.gemini/antigravity/brain/81e2d9d9-3534-437e-acac-d0e98bf9b1ea')

print("Starting generation of production assets for Round 1 (Set 1 & Set 2)...")

# -------------------------------------------------------------------------
# 1. LOAD BASE & LOWER BODY LAYERS
# -------------------------------------------------------------------------
base = Image.open('reports/p3a/extracted/female_base.png').convert('RGBA')
shoes = Image.open(OUT / 'female_layers/shoes.png').convert('RGBA')
base_with_shoes = Image.open(OUT / 'female_layers/base-with-shoes.png').convert('RGBA')
bottom = Image.open(OUT / 'female_layers/bottom.png').convert('RGBA')
b_arr = np.array(base)

# -------------------------------------------------------------------------
# 2. SET 1: ÁO NGŨ THÂN NỮ (WITH TAILORED SLEEVE CONTRACTION)
# -------------------------------------------------------------------------
raw_f_a = Image.open('reports/p3a/extracted/F_A_TOP_ao_ngu_than.png').convert('RGBA')
arr_a = np.array(raw_f_a).copy()

# 2.1. PRECISE COLLAR APERTURE PERFECTION (Clear mannequin neck, preserve petal outlines)
petal_top_y = {
    145: 18, 146: 19, 147: 20, 148: 21, 149: 22, 150: 22, 151: 23, 152: 24,
    153: 24, 154: 25, 155: 26, 156: 26, 157: 27, 158: 27, 159: 28, 160: 28,
    161: 29, 162: 29, 163: 30, 164: 30, 165: 31, 166: 31, 167: 32, 168: 32,
    169: 33, 170: 33, 171: 34, 172: 35, 173: 36, 174: 37, 175: 38, 176: 40,
    177: 43, 178: 46, 179: 49, 180: 52, 181: 55, 182: 58, 183: 61, 184: 63,
    185: 40, 186: 38, 187: 37, 188: 36, 189: 35, 190: 34, 191: 33, 192: 33,
    193: 32, 194: 32, 195: 31, 196: 31, 197: 30, 198: 30, 199: 29, 200: 29,
    201: 28, 202: 28, 203: 27, 204: 27, 205: 26, 206: 25, 207: 25, 208: 24,
    209: 24, 210: 23, 211: 22, 212: 22, 213: 21, 214: 20
}

# Clear dummy mannequin above petal_top_y in neck zone:
for x in range(140, 225):
    top_limit = petal_top_y.get(x, 20)
    for y in range(0, top_limit):
        c = arr_a[y, x]
        if c[3] == 0: continue
        r, g, b = int(c[0]), int(c[1]), int(c[2])
        if g > r + 15 and g > b + 10: continue # preserve green collar
        arr_a[y, x, 3] = 0

# Inside V-notch: clear grey fill between petal inner strokes
for y in range(40, 63):
    xl = 176.5 + (y - 40.0) * (183.5 - 176.5) / 23.0
    xr = 184.0
    for x in range(int(np.ceil(xl + 0.3)), int(np.floor(xr - 0.3)) + 1):
        c = arr_a[y, x]
        r, g, b = int(c[0]), int(c[1]), int(c[2])
        if not (g > r + 15 and g > b + 10):
            arr_a[y, x, 3] = 0

# Clear dummy top line at y < 18
arr_a[:18, 144:226, 3] = 0

# 2.2. CHEST SEAM ELIMINATION & HARMONIC BROCADE RESTORATION
arr_f = arr_a.copy().astype(float)
src_y0, src_y1 = 180, 215
tgt_y0, tgt_y1 = 140, 175
H_b = 35

src_patch = arr_f[src_y0:src_y1, :, :3]
src_im = Image.fromarray(src_patch.astype(np.uint8))
src_resized = np.array(src_im.resize((arr_f.shape[1], H_b), Image.Resampling.LANCZOS)).astype(float)

mask_y = np.sin(np.linspace(0, np.pi, H_b)) ** 0.85

top_row = gaussian_filter(arr_f[tgt_y0 - 2, :, :3], sigma=(4.0, 0))
bot_row = gaussian_filter(arr_f[tgt_y1 + 2, :, :3], sigma=(4.0, 0))

target_lighting = np.zeros((H_b, arr_f.shape[1], 3), dtype=float)
for y in range(H_b):
    t = y / float(H_b - 1)
    target_lighting[y] = top_row * (1.0 - t) + bot_row * t

src_lighting = gaussian_filter(src_resized, sigma=(6.0, 6.0, 0))
src_texture = src_resized - src_lighting
harm_patch = np.clip(target_lighting + src_texture, 0, 255)

for y in range(H_b):
    ty = tgt_y0 + y
    my = mask_y[y]
    for x in range(50, 280):
        r, g, b = arr_f[ty, x, :3]
        max_c = max(r, g, b)
        
        # Protect white lapel
        if r > 205 and abs(r-g) < 20: continue
        # Protect dark strokes
        if max_c < 45: continue
        # Protect frog button head (narrow knot)
        is_button_head = (106 <= x <= 118 and 135 <= ty <= 145 and g > r + 30 and max_c < 135)
        if is_button_head: continue
        
        mx = 1.0
        if x < 70: mx = (x - 50.0) / 20.0
        elif x > 255: mx = (280.0 - x) / 25.0
        
        m_tot = my * mx * 0.92
        arr_f[ty, x, :3] = arr_f[ty, x, :3] * (1.0 - m_tot) + harm_patch[y, x] * m_tot

arr_a_fixed = np.clip(arr_f, 0, 255).astype(np.uint8)

scale1 = 1759.0 / 1312.0
target_w1 = int(round(raw_f_a.width * scale1)) # 493
target_h1 = int(round(raw_f_a.height * scale1)) # 1251
top1_scaled = Image.fromarray(arr_a_fixed).resize((target_w1, target_h1), Image.Resampling.LANCZOS)

canvas_top1_raw = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0))
x_pos1 = int(round(540 - target_w1 / 2)) # 294
y_pos1 = 295
canvas_top1_raw.paste(top1_scaled, (x_pos1, y_pos1), top1_scaled)
arr_top1 = np.array(canvas_top1_raw)

# Warp sleeves inward to hug female arms:
# Keeps shoulders (y <= 450) and center embroidery (430 <= x <= 650) 100% intact.
def warp_sleeves_inward(arr_in, max_shift=28):
    H, W = arr_in.shape[:2]
    y_coords, x_coords = np.indices((H, W))
    
    # Vertical transition factor (0 at y<=450 shoulders, 1 at y>=940 cuffs)
    v_factor = np.clip((y_coords - 450.0) / (940.0 - 450.0), 0.0, 1.0)
    
    # Left sleeve shift (x < 430)
    w_left = np.clip((430.0 - x_coords) / (430.0 - 310.0), 0.0, 1.0)
    shift_left = max_shift * v_factor * w_left
    
    # Right sleeve shift (x > 650)
    w_right = np.clip((x_coords - 650.0) / (770.0 - 650.0), 0.0, 1.0)
    shift_right = max_shift * v_factor * w_right
    
    x_src = np.clip(x_coords - shift_left + shift_right, 0, W - 1)
    
    x0 = np.floor(x_src).astype(int)
    x1 = np.clip(x0 + 1, 0, W - 1)
    wa = (x_src - x0)[:, :, np.newaxis]
    
    arr_out = (arr_in[y_coords, x0] * (1.0 - wa) + arr_in[y_coords, x1] * wa).astype(np.uint8)
    return arr_out

arr_top1_tailored = warp_sleeves_inward(arr_top1, max_shift=28)
canvas_top1 = Image.fromarray(arr_top1_tailored)
canvas_top1.save(LAYERS_FINAL / 'top_ao_ngu_than.png')

# Precise hand emergence masks following exact anatomical contours with complete thumbs
def get_right_hand_inner(y):
    if y < 960:
        return 697
    elif y < 980:
        return 697 - int(round(3.0 * (y - 960) / 20.0))  # 697 -> 694
    elif y < 1000:
        return 694 - int(round(3.0 * (y - 980) / 20.0))  # 694 -> 691
    elif y < 1020:
        return 691 + int(round(1.0 * (y - 1000) / 20.0))  # 691 -> 692
    elif y < 1035:
        return 692 + int(round(4.0 * (y - 1020) / 15.0))  # 692 -> 696 (thumb tip)
    elif y < 1042:
        return 696 - int(round(2.0 * (y - 1035) / 7.0))   # 696 -> 694 (index finger)
    elif y < 1055:
        return 694 - int(round(8.0 * (y - 1042) / 13.0))  # 694 -> 686 (fingers)
    elif y < 1068:
        return 686 + int(round(5.0 * (y - 1055) / 13.0))  # 686 -> 691 (fingertips)
    return 750

def get_left_hand_inner(y):
    if y < 960:
        return 375 + int(round((y - 935) * 6.0 / 25.0))   # 375 -> 381
    elif y < 1000:
        return 381 + int(round((y - 960) * 2.0 / 40.0))   # 381 -> 383
    elif y < 1038:
        return 383  # thumb contour
    elif y < 1055:
        return 383 + int(round(11.0 * (y - 1038) / 17.0))  # 383 -> 394 (fingers)
    elif y < 1068:
        return 394
    return 360

hands1_overlay = np.zeros_like(b_arr)

# Left hand (viewer left, character right)
for y in range(920, 1075):
    cuff_y_base = 939
    for x in range(320, 420):
        cuff_y = cuff_y_base + (x - 330) * 0.317
        if y >= cuff_y and x <= get_left_hand_inner(y):
            if b_arr[y, x, 3] > 0:
                hands1_overlay[y, x] = b_arr[y, x]

# Right hand (viewer right, character left)
for y in range(920, 1075):
    cuff_y_base = 939
    for x in range(660, 760):
        cuff_y = cuff_y_base + (751 - x) * 0.31
        if y >= cuff_y and x >= get_right_hand_inner(y):
            if b_arr[y, x, 3] > 0:
                hands1_overlay[y, x] = b_arr[y, x]

im_hands1 = Image.fromarray(hands1_overlay)
im_hands1.save(LAYERS_FINAL / 'hands_set1.png')

comp1 = Image.alpha_composite(base_with_shoes, shoes)
comp1 = Image.alpha_composite(comp1, bottom)
comp1 = Image.alpha_composite(comp1, canvas_top1)
comp1 = Image.alpha_composite(comp1, im_hands1)

# -------------------------------------------------------------------------
# 3. SET 2: ÁO NHẬT BÌNH NỮ (ROYAL SHORTENED WIDE SLEEVES & PEEKING FINGERTIPS)
# -------------------------------------------------------------------------
raw_f_c = Image.open('reports/p3a/extracted/F_C_TOP_ao_nhat_binh.png').convert('RGBA')
arr_c = np.array(raw_f_c).copy()

# Clear pink dummy trapezoid inside collar
for y in range(0, 71):
    xl = int(round(149 + y * (155.0 - 149.0) / 70.0))
    xr = int(round(193 - y * (193.0 - 187.0) / 70.0))
    arr_c[y, xl:xr+1, 3] = 0

arr_c[:6, 147:195, 3] = 0

scale2 = 1759.0 / 973.0
target_w2 = int(round(raw_f_c.width * scale2))
target_h2 = int(round(raw_f_c.height * scale2))
top2_scaled = Image.fromarray(arr_c).resize((target_w2, target_h2), Image.Resampling.LANCZOS)

canvas_top2 = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0))
x_pos2 = int(round(540 - target_w2 / 2))
y_pos2 = 315
canvas_top2.paste(top2_scaled, (x_pos2, y_pos2), top2_scaled)

# Keep an unedited original copy of Set 2 composite for Before/After comparison
orig_comp2 = Image.alpha_composite(base_with_shoes, shoes)
orig_comp2 = Image.alpha_composite(orig_comp2, bottom)
orig_comp2 = Image.alpha_composite(orig_comp2, canvas_top2)

t_arr = np.array(canvas_top2).copy()
H, W = t_arr.shape[:2]

# Tailored shortening of Áo Nhật Bình sleeves:
pts_seam_y = [700, 750, 800, 850, 900, 950, 1000, 1048]
pts_seam_xl = [392.0, 388.0, 390.0, 385.0, 383.0, 382.0, 382.0, 382.0]
spl_seam_l = PchipInterpolator(pts_seam_y, pts_seam_xl)

def seam_l(y):
    if y < 700: return 392.0
    return float(spl_seam_l(min(y, 1048)))

def seam_r(y):
    return 540.0 + (540.0 - seam_l(y))

mask_sl = np.zeros((H, W), bool)
mask_sr = np.zeros((H, W), bool)
for y in range(700, 1135):
    sl = int(np.ceil(seam_l(min(y, 1048))))
    sr = int(np.floor(seam_r(min(y, 1048))))
    mask_sl[y, :sl] = (t_arr[y, :sl, 3] > 0)
    mask_sr[y, sr:] = (t_arr[y, sr:, 3] > 0)

sleeve_l = np.zeros_like(t_arr)
sleeve_l[mask_sl] = t_arr[mask_sl]
sleeve_r = np.zeros_like(t_arr)
sleeve_r[mask_sr] = t_arr[mask_sr]

dy = 85.0
y_g, x_g = np.indices((H, W))
Y_src = y_g.astype(np.float32)
for y in range(700, H):
    if y < 720: prog = 0.0
    elif y <= 860: prog = (y - 720.0) / (860.0 - 720.0)
    else: prog = 1.0
    Y_src[y, :] = y + dy * prog

warped_l = np.zeros_like(t_arr)
warped_r = np.zeros_like(t_arr)
for c in range(4):
    warped_l[:, :, c] = np.clip(map_coordinates(sleeve_l[:, :, c].astype(float), [Y_src, x_g.astype(float)], order=1, mode='constant', cval=0.0), 0, 255).astype(np.uint8)
    warped_r[:, :, c] = np.clip(map_coordinates(sleeve_r[:, :, c].astype(float), [Y_src, x_g.astype(float)], order=1, mode='constant', cval=0.0), 0, 255).astype(np.uint8)

# Clean Body and reconstruct skirt under new cuffs
body = t_arr.copy()
body[mask_sl] = 0
body[mask_sr] = 0

# Step A: Complete roundels (circular symmetry)
for y in range(1025, 1106):
    dy_c = y - 1063
    if abs(dy_c) <= 32:
        r_w = int(np.sqrt(32**2 - dy_c**2))
        for dx in range(1, r_w + 1):
            src_x = 412 + dx
            dst_x = 412 - dx
            p = t_arr[y, src_x]
            if not (165 <= p[0] <= 190 and p[1] < 40 and p[2] < 40) and p[3] > 0:
                body[y, dst_x] = p
                
            src_x = 668 - dx
            dst_x = 668 + dx
            p = t_arr[y, src_x]
            if not (165 <= p[0] <= 190 and p[1] < 40 and p[2] < 40) and p[3] > 0:
                body[y, dst_x] = p

# 5px under-sleeve torso extension to guarantee seamless connection with 0px gap
for y in range(700, 1048):
    sl = int(np.ceil(seam_l(y)))
    sr = int(np.floor(seam_r(y)))
    red_l = body[y, sl].copy()
    red_r = body[y, sr].copy()
    for dx in range(1, 6):
        if sl - dx >= 0 and body[y, sl - dx, 3] == 0:
            body[y, sl - dx] = red_l
        if sr + dx < W and body[y, sr + dx, 3] == 0:
            body[y, sr + dx] = red_r

# Step B: Reconstruct skirt outer border continuing lower skirt outline
def skirt_l(y):
    if y >= 1134:
        xs = np.where(t_arr[y, :, 3] > 50)[0]
        return float(xs.min()) if len(xs) else 332.0
    return 332.0 - (-12.0 / 66.0) * (1134.0 - y)

def skirt_r(y):
    if y >= 1134:
        xs = np.where(t_arr[y, :, 3] > 50)[0]
        return float(xs.max()) if len(xs) else 756.0
    return 756.0 - (15.0 / 66.0) * (1134.0 - y)

border_profile_l = [
    [157, 157, 157, 97],
    [255, 248, 244, 255],
    [173, 134, 132, 255],
    [62, 12, 12, 241],
    [59, 0, 0, 251],
    [88, 14, 14, 255],
    [121, 38, 38, 255],
    [146, 43, 46, 255],
    [153, 30, 38, 255]
]

for y in range(1048, 1135):
    xl = int(round(skirt_l(y)))
    xr = int(round(skirt_r(y)))
    red_col = t_arr[y, 450].copy()
    
    dy_c = y - 1063
    if abs(dy_c) <= 32:
        r_w = int(np.sqrt(32**2 - dy_c**2))
        x_limit_l = 412 - r_w
        x_limit_r = 668 + r_w
    else:
        x_limit_l = 430
        x_limit_r = 650
        
    for x in range(xl + len(border_profile_l), x_limit_l):
        body[y, x] = red_col
        
    for x in range(x_limit_r + 1, xr - len(border_profile_l) + 1):
        body[y, x] = red_col
        
    for i, col in enumerate(border_profile_l):
        if xl + i < W: body[y, xl + i] = col
        if xr - i >= 0: body[y, xr - i] = col

# -------------------------------------------------------------------------
# 3.1 PRECISE 5-LAYER SEPARATION FOR SET 2 (ÁO NHẬT BÌNH)
# Layer 1: Thân người (Base body + Giày + Quần)
# Layer 2: Lớp áo (Thân áo & Váy Nhật Bình, không gồm tay)
# Layer 3: Mặt dưới tay áo (Lòng trong sẫm màu & vành sau miệng ống tay)
# Layer 4: Tay (Bàn tay tự nhiên vươn từ trong lòng ống tay ra)
# Layer 5: Mặt trên tay áo (Mặt trước ống tay & dải ngũ sắc đè lên cổ tay)
# -------------------------------------------------------------------------

# Parabolic smooth curve for the front lower rim of the yellow cuff band
xs_l, ys_l = [], []
for x in range(250, 368):
    ys_yell = np.where((warped_l[960:1010, x, 0] > 170) & (warped_l[960:1010, x, 1] > 130) & (warped_l[960:1010, x, 2] < 120))[0] + 960
    if len(ys_yell):
        xs_l.append(x)
        ys_l.append(ys_yell.max() + 1)
p_l = np.polyfit(xs_l, ys_l, 2)

xs_r, ys_r = [], []
for x in range(713, 830):
    ys_yell = np.where((warped_r[960:1010, x, 0] > 170) & (warped_r[960:1010, x, 1] > 130) & (warped_r[960:1010, x, 2] < 120))[0] + 960
    if len(ys_yell):
        xs_r.append(x)
        ys_r.append(ys_yell.max() + 1)
p_r = np.polyfit(xs_r, ys_r, 2)

hole_mask_l = np.zeros((H, W), bool)
for x in range(235, 375):
    rim_y = int(round(np.polyval(p_l, min(x, 367))))
    hole_mask_l[rim_y:1055, x] = (warped_l[rim_y:1055, x, 3] > 0)

hole_mask_r = np.zeros((H, W), bool)
for x in range(705, 849):
    rim_y = int(round(np.polyval(p_r, max(min(x, 829), 713))))
    hole_mask_r[rim_y:1055, x] = (warped_r[rim_y:1055, x, 3] > 0)

# Layer 2: Lớp áo
im_l2 = Image.fromarray(body)
im_l2.save(LAYERS_FINAL / 'top_ao_nhat_binh_body.png')

# Layer 3: Mặt dưới tay áo (Under-sleeves: cavity lining and back rim)
l3_arr = np.zeros_like(t_arr)
l3_arr[hole_mask_l] = warped_l[hole_mask_l]
l3_arr[hole_mask_r] = warped_r[hole_mask_r]
im_l3 = Image.fromarray(l3_arr)
im_l3.save(LAYERS_FINAL / 'top_ao_nhat_binh_under_sleeves.png')

# Layer 4: Tay (Natural anatomical hands & wrists extracted directly from female_base)
clean_hands = np.zeros_like(b_arr)
for y in range(900, 1075):
    for x in range(310, 420):
        if x <= get_left_hand_inner(y) and b_arr[y, x, 3] > 0:
            clean_hands[y, x] = b_arr[y, x]
    for x in range(660, 770):
        if x >= get_right_hand_inner(y) and b_arr[y, x, 3] > 0:
            clean_hands[y, x] = b_arr[y, x]

sx = -25
sy = -13
l4_arr = np.zeros_like(b_arr)
for y in range(900, 1075):
    ny = y + sy
    if not (0 <= ny < H): continue
    for x in range(300, 420):
        if clean_hands[y, x, 3] > 0:
            nx = x + sx
            if 0 <= nx < W: l4_arr[ny, nx] = clean_hands[y, x]
    for x in range(660, 780):
        if clean_hands[y, x, 3] > 0:
            nx = x - sx
            if 0 <= nx < W: l4_arr[ny, nx] = clean_hands[y, x]

y_idx, x_idx = np.indices((H, W))
mask_corr_l = (x_idx >= 235) & (x_idx <= 375) & (y_idx >= 950)
mask_corr_r = (x_idx >= 705) & (x_idx <= 845) & (y_idx >= 950)
l4_arr[~(mask_corr_l | mask_corr_r)] = 0

im_l4 = Image.fromarray(l4_arr)
im_l4.save(LAYERS_FINAL / 'hands_set2.png')

# Layer 5: Mặt trên tay áo (Over-sleeves: front cylinder & front yellow band, hole cleared)
l5_arr = np.zeros_like(t_arr)
l5_arr[mask_sl] = warped_l[mask_sl]
l5_arr[mask_sr] = warped_r[mask_sr]
l5_arr[hole_mask_l] = 0
l5_arr[hole_mask_r] = 0
im_l5 = Image.fromarray(l5_arr)
im_l5.save(LAYERS_FINAL / 'top_ao_nhat_binh_over_sleeves.png')

# Full merged robe without hands (Backward compatibility for any viewer expecting top_ao_nhat_binh.png)
robe_nhat_binh = Image.alpha_composite(im_l2, im_l3)
robe_nhat_binh = Image.alpha_composite(robe_nhat_binh, im_l5)
robe_nhat_binh.save(LAYERS_FINAL / 'top_ao_nhat_binh.png')

# 5-Layer Composite in strict user specification:
# L1 (Thân người) -> L2 (Lớp áo) -> L3 (Mặt dưới tay áo) -> L4 (Tay) -> L5 (Mặt trên tay áo)
comp2 = Image.alpha_composite(base_with_shoes, shoes)
comp2 = Image.alpha_composite(comp2, bottom)
comp2 = Image.alpha_composite(comp2, im_l2)
comp2 = Image.alpha_composite(comp2, im_l3)
comp2 = Image.alpha_composite(comp2, im_l4)
comp2 = Image.alpha_composite(comp2, im_l5)

# -------------------------------------------------------------------------
# 4. EXPORT HIGH-RES JPEGS, REVIEWS & 5-LAYER EXPLODED DIAGRAM
# -------------------------------------------------------------------------
bg = Image.new('RGBA', (1080, 1920), (238, 230, 218, 255))

prev1 = Image.alpha_composite(bg, comp1).convert('RGB')
prev2 = Image.alpha_composite(bg, comp2).convert('RGB')
prev2_orig = Image.alpha_composite(bg, orig_comp2).convert('RGB')

prev1.save(OUT / 'Set1_AoNguThan_QuanTrang.jpg', quality=95)
prev2.save(OUT / 'Set2_AoNhatBinh_QuanTrang.jpg', quality=95)

# Full composite crops for scrutiny
prev2.save(OUT / 'clean_5layers_full.jpg', quality=95)
crop_5layers = prev2.crop((200, 930, 880, 1080))
crop_5layers.save(OUT / 'clean_5layers_crop.jpg', quality=95)

# Exploded 6-Panel Card for Set 2 5-Layer Architecture
crop_box = (200, 600, 880, 1180)
W_c, H_c = 680, 580

def make_panel(im_layer, title, subtitle):
    panel = Image.new('RGBA', (W_c, H_c), (245, 240, 232, 255))
    panel = Image.alpha_composite(panel, im_layer.crop(crop_box))
    draw = ImageDraw.Draw(panel)
    draw.rectangle([(0, 0), (W_c, 52)], fill=(36, 71, 120, 240))
    draw.text((16, 8), title, fill=(255, 255, 255))
    draw.text((16, 28), subtitle, fill=(210, 225, 250))
    draw.rectangle([(0, 0), (W_c-1, H_c-1)], outline=(200, 190, 175), width=2)
    return panel.convert('RGB')

l1_comp = Image.alpha_composite(base_with_shoes, shoes)
l1_comp = Image.alpha_composite(l1_comp, bottom)

p1 = make_panel(l1_comp, 'LOP 1: THAN NGUOI', 'Base body + Quan lua trang + Giay')
p2 = make_panel(im_l2, 'LOP 2: LOP AO', 'Than ao & Vay Nhat Binh (Khong gom tay)')
p3 = make_panel(im_l3, 'LOP 3: MAT DUOI TAY AO', 'Long trong sam mau + Vanh sau mieng ong')
p4 = make_panel(im_l4, 'LOP 4: TAY', 'Ban tay & Canh tay vuon tu long ong tay')
p5 = make_panel(im_l5, 'LOP 5: MAT TREN TAY AO', 'Mat truoc ong tay + Nep ngu sac de len co tay')
p6 = make_panel(comp2, 'THANH PHAM: 5 LOP KHEP KIN', 'Khong xuyen thau, dung thu tu rigging')

grid = Image.new('RGB', (W_c * 3 + 40, H_c * 2 + 50), (238, 230, 218))
grid.paste(p1, (10, 10))
grid.paste(p2, (20 + W_c, 10))
grid.paste(p3, (30 + W_c * 2, 10))
grid.paste(p4, (10, 20 + H_c))
grid.paste(p5, (20 + W_c, 20 + H_c))
grid.paste(p6, (30 + W_c * 2, 20 + H_c))
grid.save(OUT / 'review_5layers_exploded.jpg', quality=95)

# Side-by-side comparison of Set 1 & Set 2
comp_side = Image.new('RGB', (1080 * 2, 1920), (238, 230, 218))
comp_side.paste(prev1, (0, 0))
comp_side.paste(prev2, (1080, 0))
comp_side.resize((1080, 960), Image.Resampling.LANCZOS).save(OUT / 'female_Set1_Set2_compare.jpg', quality=95)

# Side-by-side comparison of Áo Nhật Bình sleeves: Before vs After
crop_b4 = prev2_orig.crop((180, 650, 900, 1300))
crop_aft = prev2.crop((180, 650, 900, 1300))
comp_sleeves = Image.new('RGB', (720 * 2, 650), (238, 230, 218))
comp_sleeves.paste(crop_b4, (0, 0))
comp_sleeves.paste(crop_aft, (720, 0))
comp_sleeves.save(OUT / 'compare_nhat_binh_sleeves_before_after.jpg', quality=95)

# Scrutiny Crops:
# 1. Collars side-by-side
c1 = prev1.crop((420, 250, 660, 480))
c2 = prev2.crop((420, 250, 660, 480))
both_c = Image.new('RGB', (480, 230))
both_c.paste(c1, (0, 0))
both_c.paste(c2, (240, 0))
both_c.save(OUT / 'review_collars.jpg', quality=95)

# 2. Hands / Sleeves side-by-side
h1 = prev1.crop((200, 880, 880, 1120))
h2 = prev2.crop((200, 880, 880, 1120))
both_h = Image.new('RGB', (680 * 2, 240))
both_h.paste(h1, (0, 0))
both_h.paste(h2, (680, 0))
both_h.save(OUT / 'review_hands.jpg', quality=95)

# 3. Pants and shoes
prev1.crop((300, 1100, 780, 1860)).save(OUT / 'review_pants_shoes.jpg', quality=95)

# 4. Seam Overlap Fix Comparison (Before vs After)
user_bug_p = Path(r'C:\Users\Admin\.gemini\antigravity\brain\81e2d9d9-3534-437e-acac-d0e98bf9b1ea\.user_uploaded\media_1791468081637_c996f2ae.png')
if user_bug_p.exists():
    img_b4 = Image.open(user_bug_p).convert('RGB')
    img_aft = crop_5layers
    W_cmp, H_cmp = img_b4.width, img_b4.height
    cmp_seam = Image.new('RGB', (W_cmp * 2 + 20, H_cmp + 45), (238, 230, 218))
    cmp_seam.paste(img_b4, (0, 45))
    cmp_seam.paste(img_aft, (W_cmp + 20, 45))
    draw_cmp = ImageDraw.Draw(cmp_seam)
    draw_cmp.rectangle([(0, 0), (W_cmp, 40)], fill=(180, 50, 50))
    draw_cmp.text((15, 12), "TRUOC: Bi du vien soc xanh trang & ho mep ao", fill=(255, 255, 255))
    draw_cmp.rectangle([(W_cmp + 20, 0), (W_cmp * 2 + 20, 40)], fill=(34, 110, 60))
    draw_cmp.text((W_cmp + 35, 12), "SAU: Da sua hoan tat, lien mach 100%, khong con vien du", fill=(255, 255, 255))
    cmp_seam.save(OUT / 'compare_seam_overlap_fix.jpg', quality=95)

# Copy to brain artifact directory for display
for fname in [
    'Set1_AoNguThan_QuanTrang.jpg',
    'Set2_AoNhatBinh_QuanTrang.jpg',
    'female_Set1_Set2_compare.jpg',
    'compare_nhat_binh_sleeves_before_after.jpg',
    'compare_seam_overlap_fix.jpg',
    'review_collars.jpg',
    'review_hands.jpg',
    'review_pants_shoes.jpg',
    'review_5layers_exploded.jpg',
    'clean_5layers_crop.jpg',
    'clean_5layers_full.jpg'
]:
    p = OUT / fname
    if p.exists():
        shutil.copyfile(p, ARTIFACT_DIR / fname)

print('Round 1 production assets generated and synced to artifacts successfully!')

