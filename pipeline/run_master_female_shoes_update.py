import sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
import shutil
from PIL import Image
import numpy as np

ROOT = Path('.')
PROTO = ROOT / 'reports/p3a-prototype-B'
FEMALE_LAYERS = PROTO / 'female_layers_final'
ARTIFACTS_DIR = Path(r'C:\Users\Admin\.gemini\antigravity\brain\81e2d9d9-3534-437e-acac-d0e98bf9b1ea')

# 1. LOAD ASSETS
base_f = Image.open('reports/p3a/extracted/female_base.png').convert('RGBA')
pants_f = Image.open(FEMALE_LAYERS / 'bottom.png').convert('RGBA')
top_ngu_than = Image.open(FEMALE_LAYERS / 'top_ao_ngu_than.png').convert('RGBA')
hands_set1 = Image.open(FEMALE_LAYERS / 'hands_set1.png').convert('RGBA')
top_nhat_binh = Image.open(FEMALE_LAYERS / 'top_ao_nhat_binh.png').convert('RGBA')

l_shoe_art = Image.open(PROTO / 'shoe_left_final.png')
r_shoe_art = Image.open(PROTO / 'shoe_right_final.png')

# 2. SCALE TO FEMALE PROPORTIONS (Vòng 1.4.1 - Phóng to vừa vặn, liền nét với chân)
w = 126
s_l = w / float(l_shoe_art.width)
h_l = int(round(l_shoe_art.height * s_l))
l_scaled = l_shoe_art.resize((w, h_l), Image.Resampling.LANCZOS)

s_r = w / float(r_shoe_art.width)
h_r = int(round(r_shoe_art.height * s_r))
r_scaled = r_shoe_art.resize((w, h_r), Image.Resampling.LANCZOS)

# Position: Căn chuẩn cổ giày ôm trọn mắt cá và liền nét viền chân (x1=415, x2=544, đế y=1842)
x1 = 415
y1 = 1842 - h_l

x2 = 544
y2 = 1842 - h_r

canvas_shoes = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0))
canvas_shoes.paste(l_scaled, (x1, y1), l_scaled)
canvas_shoes.paste(r_scaled, (x2, y2), r_scaled)

# Save female shoes layer
canvas_shoes.save(FEMALE_LAYERS / 'shoes.png')
print('Saved female_layers_final/shoes.png')

# 3. CREATE BASE-WITH-SHOES
base_arr = np.array(base_f).copy()
shoes_arr = np.array(canvas_shoes)

# Mask bare toes below 1785 (sạch sẽ bên trong thân giày, giữ 100% bắp chân và mắt cá)
base_arr[1785:, :, 3] = 0
# Mask skin covered by opaque shoe body between 1730 and 1785
for y in range(1730, 1785):
    covered = shoes_arr[y, :, 3] > 180
    base_arr[y, covered, 3] = 0

base_ws = Image.fromarray(base_arr)
base_ws.save(FEMALE_LAYERS / 'base-with-shoes.png')
print('Saved female_layers_final/base-with-shoes.png')

# 4. GENERATE REVIEWS & COMPOSITES
bg_color = (238, 230, 218, 255)
bg = Image.new('RGBA', (1080, 1920), bg_color)

# Pants only (base + bottom)
comp_pants_only = Image.alpha_composite(base_f, pants_f)
full_pants_only = Image.alpha_composite(bg, comp_pants_only).convert('RGB')
crop_pants_only = full_pants_only.crop((260, 600, 820, 1850))
crop_pants_only.save(PROTO / 'test_female_pants_only_full.jpg', quality=95)

# Bare legs with shoes
comp_bare_shoes = Image.alpha_composite(base_ws, canvas_shoes)
crop_shoes_only = Image.alpha_composite(bg, comp_bare_shoes).convert('RGB').crop((320, 1500, 760, 1860))
crop_shoes_only.save(PROTO / 'review_shoes_only.jpg', quality=95)

# Pants + Shoes
comp_pants_shoes = Image.alpha_composite(comp_bare_shoes, pants_f)
full_pants_shoes = Image.alpha_composite(bg, comp_pants_shoes).convert('RGB')
crop_pants_shoes = full_pants_shoes.crop((320, 1500, 760, 1860))
crop_pants_shoes.save(PROTO / 'review_pants_shoes.jpg', quality=95)

# Set 1: Áo Ngũ Thân
comp_set1 = Image.alpha_composite(comp_pants_shoes, top_ngu_than)
comp_set1 = Image.alpha_composite(comp_set1, hands_set1)
full_set1 = Image.alpha_composite(bg, comp_set1).convert('RGB')
crop_set1 = full_set1.crop((200, 100, 880, 1860))
crop_set1.save(PROTO / 'Set1_AoNguThan_QuanTrang.jpg', quality=95)

# Set 2: Áo Nhật Bình
comp_set2 = Image.alpha_composite(comp_pants_shoes, top_nhat_binh)
full_set2 = Image.alpha_composite(bg, comp_set2).convert('RGB')
crop_set2 = full_set2.crop((200, 100, 880, 1860))
crop_set2.save(PROTO / 'Set2_AoNhatBinh_QuanTrang.jpg', quality=95)

# Side-by-side comparison
W_c, H_c = crop_set1.size
compare_img = Image.new('RGB', (W_c * 2 + 30, H_c), (230, 222, 210))
compare_img.paste(crop_set1, (0, 0))
compare_img.paste(crop_set2, (W_c + 30, 0))
compare_img.save(PROTO / 'female_Set1_Set2_compare.jpg', quality=95)

# Hands review
zoom_hands = full_pants_only.crop((300, 800, 780, 1150))
zoom_hands.save(PROTO / 'review_hands.jpg', quality=95)

# Collars review
zoom_collars = full_set1.crop((400, 360, 680, 680))
zoom_collars.save(PROTO / 'review_collars.jpg', quality=95)

# Sync all to artifacts
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

print('Master female shoes update complete!')
