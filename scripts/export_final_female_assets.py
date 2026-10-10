import os
import sys
import shutil
import numpy as np
from PIL import Image, ImageFilter

sys.stdout.reconfigure(encoding="utf-8")

DEST_DIR = "assets/female"
os.makedirs(DEST_DIR, exist_ok=True)

# 1. Base image (ensure exact match with female_layers_final/base.png)
base = Image.open("reports/p3a-prototype-B/female_layers_final/base.png").convert("RGBA")
base.save(os.path.join(DEST_DIR, "female_base.png"))
print("1. female_base.png exported")

# 2. Traditional Cloth Shoes (F_COMMON_SHOES_giay_vai_den.png)
# Using p3a-review base, dilating bottom-most pixels to eliminate any 1px fringe at floor
s_raw = Image.open("reports/p3a-review/layers/F_COMMON_SHOES_giay_vai_den.png").convert("RGBA")
b_arr = np.array(base)
sr_arr = np.array(s_raw)

# Ensure 100% coverage of base feet (y >= 1750)
base_feet_mask = (b_arr[:, :, 3] > 30) & (np.arange(1920)[:, None] >= 1750)
shoe_mask = sr_arr[:, :, 3] > 30
missing_mask = base_feet_mask & (~shoe_mask)

# For missing boundary pixels, fill with sole color (white/cream: 240, 240, 235, 255)
sr_arr[missing_mask] = [235, 235, 230, 255]
s_clean = Image.fromarray(sr_arr)
s_clean.save(os.path.join(DEST_DIR, "F_COMMON_SHOES_giay_vai_den.png"))
print("2. F_COMMON_SHOES_giay_vai_den.png exported (100% coverage)")

# 3. Modern Sneakers (F_MIX_SHOES_giay_sneaker.png & F_MIX_SHOES_sneakers.png)
sn_raw = Image.open("reports/p3a-review/layers/F_MIX_SHOES_giay_sneaker.png").convert("RGBA")
sn_arr = np.array(sn_raw)
sn_shoe_mask = sn_arr[:, :, 3] > 30
sn_missing = base_feet_mask & (~sn_shoe_mask)
sn_arr[sn_missing] = [245, 245, 245, 255]
sn_clean = Image.fromarray(sn_arr)
sn_clean.save(os.path.join(DEST_DIR, "F_MIX_SHOES_giay_sneaker.png"))
sn_clean.save(os.path.join(DEST_DIR, "F_MIX_SHOES_sneakers.png"))
print("3. F_MIX_SHOES_giay_sneaker.png & F_MIX_SHOES_sneakers.png exported (100% coverage)")

# 4. White Silk Pants (F_COMMON_BOTTOM_quan_lua_trang.png)
shutil.copyfile("reports/p3a-review/layers/F_COMMON_BOTTOM_quan_lua_trang.png", os.path.join(DEST_DIR, "F_COMMON_BOTTOM_quan_lua_trang.png"))
print("4. F_COMMON_BOTTOM_quan_lua_trang.png exported")

# 5. Black Pleated Skirt with Bow (F_B_BOTTOM_vay_dai.png)
shutil.copyfile("reports/p3a-prototype-B/female_layers_final/bottom_vay_dai.png", os.path.join(DEST_DIR, "F_B_BOTTOM_vay_dai.png"))
print("5. F_B_BOTTOM_vay_dai.png exported")

# 6. Modern Beige Pants (F_MIX_BOTTOM_quan_hien_dai.png)
p_mod = Image.open("assets/female/F_MIX_BOTTOM_quan_hien_dai.png").convert("RGBA")
p_arr = np.array(p_mod)
# Extend top waistband from y=745 up to y=724 so that it meets the tucked top with zero bare skin gap
top_row = p_arr[748, :, :].copy()
for y in range(724, 748):
    p_arr[y, :, :] = top_row
p_mod_high = Image.fromarray(p_arr)
p_mod_high.save(os.path.join(DEST_DIR, "F_MIX_BOTTOM_quan_hien_dai.png"))
print("6. F_MIX_BOTTOM_quan_hien_dai.png exported (waistband extended to y=724)")

# 7. Set 1: Áo Ngũ Thân xanh ngọc (F_A_TOP_ao_ngu_than.png)
# Pre-composite with hands_set1_flawless.png
top_a_raw = Image.open("reports/p3a-prototype-B/female_layers_final/top_ao_ngu_than.png").convert("RGBA")
hands1 = Image.open("reports/p3a-prototype-B/female_layers_final/hands_set1_flawless.png").convert("RGBA")
top_a = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
top_a.alpha_composite(top_a_raw)
top_a.alpha_composite(hands1)
top_a.save(os.path.join(DEST_DIR, "F_A_TOP_ao_ngu_than.png"))
print("7. F_A_TOP_ao_ngu_than.png exported (pre-composited with hands)")

# 8. Set 3B: Áo Giao Lĩnh hồng (F_B_TOP_ao_giao_linh.png)
# Pre-composite tucked torso + hands3 + sleeves3, masked so skirt waistband and bow sit in front
torso3 = Image.open("reports/p3a-prototype-B/female_layers_final/top_ao_giao_linh_in_skirt.png").convert("RGBA")
sleeves3 = Image.open("reports/p3a-prototype-B/female_layers_final/top_ao_giao_linh_sleeves.png").convert("RGBA")
hands3 = Image.open("reports/p3a-prototype-B/female_layers_final/hands_set3.png").convert("RGBA")
skirt = Image.open("reports/p3a-prototype-B/female_layers_final/bottom_vay_dai.png").convert("RGBA")

sk_arr = np.array(skirt)
t3_arr = np.array(torso3)
# Where skirt is opaque, mask torso3 so it's tucked behind skirt
alpha_factor = 1.0 - (sk_arr[:, :, 3].astype(float) / 255.0)
t3_clean = t3_arr.copy()
t3_clean[:, :, 3] = np.clip(t3_clean[:, :, 3].astype(float) * alpha_factor, 0, 255).astype(np.uint8)

top_b = Image.fromarray(t3_clean)
top_b.alpha_composite(hands3)
top_b.alpha_composite(sleeves3)
top_b.save(os.path.join(DEST_DIR, "F_B_TOP_ao_giao_linh.png"))
print("8. F_B_TOP_ao_giao_linh.png exported (pre-composited with hands, sleeves, tucked torso)")

# 9. Set 2: Áo Nhật Bình đỏ hoàng gia ngũ sắc (F_C_TOP_ao_nhat_binh.png)
# Pre-composite body + under + hands2 + over
nb_body = Image.open("reports/p3a-prototype-B/female_layers_final/top_ao_nhat_binh_body.png").convert("RGBA")
nb_under = Image.open("reports/p3a-prototype-B/female_layers_final/top_ao_nhat_binh_under_sleeves.png").convert("RGBA")
nb_hands = Image.open("reports/p3a-prototype-B/female_layers_final/hands_set2.png").convert("RGBA")
nb_over = Image.open("reports/p3a-prototype-B/female_layers_final/top_ao_nhat_binh_over_sleeves.png").convert("RGBA")

top_c = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
top_c.alpha_composite(nb_body)
top_c.alpha_composite(nb_under)
top_c.alpha_composite(nb_hands)
top_c.alpha_composite(nb_over)
top_c.save(os.path.join(DEST_DIR, "F_C_TOP_ao_nhat_binh.png"))
print("9. F_C_TOP_ao_nhat_binh.png exported (pre-composited with 5-layer rigging: body, under, hands, over)")

# 10. Trâm cài tóc Kiểu 2 (F_COMMON_HEAD_tram_cai.png)
shutil.copyfile("reports/p3a-prototype-B/female_layers_final/head_tram_cai_kieu2.png", os.path.join(DEST_DIR, "F_COMMON_HEAD_tram_cai.png"))
print("10. F_COMMON_HEAD_tram_cai.png exported (Kiểu 2 đã chốt)")

# 11. Nón lá (F_COMMON_HEAD_non_la.png)
if not os.path.exists(os.path.join(DEST_DIR, "F_COMMON_HEAD_non_la.png")):
    shutil.copyfile("assets/male/M_COMMON_HEAD_non_la.png", os.path.join(DEST_DIR, "F_COMMON_HEAD_non_la.png"))
print("11. F_COMMON_HEAD_non_la.png verified")

# 12. Vòng cổ kiềng bạc (F_COMMON_NECK_vong_co_bac.png)
shutil.copyfile("scratch/test_silver_torque.png", os.path.join(DEST_DIR, "F_COMMON_NECK_vong_co_bac.png"))
print("12. F_COMMON_NECK_vong_co_bac.png exported (Kiềng bạc truyền thống)")

print("\n--- ALL FEMALE ASSETS SUCCESSFULLY CREATED ---")
