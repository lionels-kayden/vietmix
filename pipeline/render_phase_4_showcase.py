import os
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\81e2d9d9-3534-437e-acac-d0e98bf9b1ea"
OUT_SHEET = os.path.join(ARTIFACT_DIR, "phase_4_scenes_and_remix_showcase.jpg")
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# 4 scenes and outfits to showcase:
# 1. Tet - Cap 1 - Level 0 (Ao Ngu Than + Quan Lua + Giay Vai) -> Trong cap
# 2. Le Hoi - Cap 1 - Level 1 (Ao Giao Linh + Quan Lua + Sneakers) -> Trong cap
# 3. Ky Yeu - Cap 2 - Level 2 (Ao Nhat Binh + Quan Au + Sneakers) -> Trong cap
# 4. Tet - Cap 1 - Level 2 (Ao Ngu Than + Quan Au + Sneakers) -> Vuot cap (Goi y van hoa)

SCENARIOS = [
    {
        "title": "1. Bối cảnh TẾT (Cap: 1) - Mốc 0: Cổ điển",
        "scene": "tet.jpg",
        "gender": "female",
        "layers": [
            "female_base.png",
            "F_COMMON_SHOES_giay_vai_den.png",
            "F_COMMON_BOTTOM_quan_lua_trang.png",
            "F_A_TOP_ao_ngu_than.png",
            "F_COMMON_HEAD_tram_cai.png"
        ],
        "cap_status": "within",
        "cap_text": "🌿 Hòa hợp bối cảnh Tết (0/1 món cách tân)",
        "remix_text": "Mốc 0: Cổ điển (100% Cổ phục truyền thống)"
    },
    {
        "title": "2. Bối cảnh LỄ HỘI (Cap: 1) - Mốc 1: Cách tân nhẹ",
        "scene": "le-hoi.jpg",
        "gender": "female",
        "layers": [
            "female_base.png",
            "F_MIX_SHOES_giay_sneaker.png",
            "F_COMMON_BOTTOM_quan_lua_trang.png",
            "F_B_TOP_ao_giao_linh.png",
            "F_COMMON_HEAD_non_la.png"
        ],
        "cap_status": "within",
        "cap_text": "🌿 Hòa hợp bối cảnh Lễ hội (1/1 món: Sneaker)",
        "remix_text": "Mốc 1: Cách tân nhẹ (Giao thoa thanh lịch)"
    },
    {
        "title": "3. Bối cảnh KỶ YẾU (Cap: 2) - Mốc 2: Đột phá",
        "scene": "ky-yeu.jpg",
        "gender": "female",
        "layers": [
            "female_base.png",
            "F_MIX_SHOES_giay_sneaker.png",
            "F_MIX_BOTTOM_quan_hien_dai.png",
            "F_C_TOP_ao_nhat_binh.png",
            "F_COMMON_HEAD_tram_cai.png"
        ],
        "cap_status": "within",
        "cap_text": "🌿 Hòa hợp bối cảnh Kỷ yếu (2/2 món: Quần âu + Sneaker)",
        "remix_text": "Mốc 2: Đột phá (Sáng tạo trẻ trung Gen Z)"
    },
    {
        "title": "4. Bối cảnh TẾT (Cap: 1) - Mốc 2: Đột phá (Vượt Cap)",
        "scene": "tet.jpg",
        "gender": "female",
        "layers": [
            "female_base.png",
            "F_MIX_SHOES_giay_sneaker.png",
            "F_MIX_BOTTOM_quan_hien_dai.png",
            "F_A_TOP_ao_ngu_than.png",
            "F_COMMON_NECK_vong_co_bac.png"
        ],
        "cap_status": "exceeding",
        "cap_text": "💡 Gợi ý văn hóa: Tết chuộng trang nghiêm (max 1 món). Không bắt buộc!",
        "remix_text": "Mốc 2: Đột phá (2/1 món hiện đại - Tự do sáng tạo)"
    }
]

CANVAS_W, CANVAS_H = 540, 960

def render_canvas(scenario):
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (247, 243, 233, 255))
    
    # 1. Background scene (object-cover)
    scene_path = os.path.join("public", "assets", "scenes", scenario["scene"])
    if os.path.exists(scene_path):
        scene_img = Image.open(scene_path).convert("RGBA")
        # Cover 540x960
        sw, sh = scene_img.size
        scale = max(CANVAS_W / sw, CANVAS_H / sh)
        new_sw, new_sh = int(sw * scale), int(sh * scale)
        scene_resized = scene_img.resize((new_sw, new_sh), Image.Resampling.LANCZOS)
        # Center crop
        left = (new_sw - CANVAS_W) // 2
        top = (new_sh - CANVAS_H) // 2
        scene_cropped = scene_resized.crop((left, top, left + CANVAS_W, top + CANVAS_H))
        canvas.paste(scene_cropped, (0, 0), scene_cropped)
    
    # 2. Character composite: 85% scale, centered bottom
    # Character box: width = 85% of 540 = 459, height = 85% of 960 = 816
    char_w = int(CANVAS_W * 0.85)
    char_h = int(CANVAS_H * 0.85)
    char_x = (CANVAS_W - char_w) // 2
    char_y = CANVAS_H - char_h  # Anchored to bottom
    
    char_canvas = Image.new("RGBA", (char_w, char_h), (0, 0, 0, 0))
    gender = scenario["gender"]
    
    for layer_name in scenario["layers"]:
        layer_path = os.path.join("public", "assets", gender, layer_name)
        if os.path.exists(layer_path):
            layer_img = Image.open(layer_path).convert("RGBA")
            # Resize layer to char_w x char_h maintaining aspect
            lw, lh = layer_img.size
            l_scale = min(char_w / lw, char_h / lh)
            new_lw, new_lh = int(lw * l_scale), int(lh * l_scale)
            layer_resized = layer_img.resize((new_lw, new_lh), Image.Resampling.LANCZOS)
            
            # Position centered in char_canvas
            lx = (char_w - new_lw) // 2
            ly = char_h - new_lh # grounded at bottom
            char_canvas.paste(layer_resized, (lx, ly), layer_resized)
    
    # Paste character on canvas
    canvas.paste(char_canvas, (char_x, char_y), char_canvas)
    return canvas.convert("RGB")

def build_showcase_sheet():
    card_w, card_h = 540, 960
    header_h = 140
    footer_h = 140
    total_w = card_w * 4 + 50 * 5
    total_h = header_h + card_h + footer_h + 80
    
    sheet = Image.new("RGB", (total_w, total_h), (242, 238, 227))
    draw = ImageDraw.Draw(sheet)
    
    try:
        font_title = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 22)
        font_card_title = ImageFont.truetype("arial.ttf", 20)
        font_badge = ImageFont.truetype("arial.ttf", 16)
    except:
        font_title = font_sub = font_card_title = font_badge = ImageFont.load_default()
        
    # Header
    draw.text((50, 30), "VIỆT PHỤC REMIX - GIAI ĐOẠN 4: BỐI CẢNH (SCENES) & THANH TRƯỢT REMIX (0/1/2)", fill=(138, 26, 16), font=font_title)
    draw.text((50, 80), "Tỉ lệ nhân vật chuẩn 85% căn giữa đáy | Scene Caps (1/1/2/2) | Gợi ý văn hóa phi cưỡng chế", fill=(60, 60, 60), font=font_sub)
    
    for i, scen in enumerate(SCENARIOS):
        cx = 50 + i * (card_w + 50)
        cy = header_h + 30
        
        # Render canvas
        canvas_img = render_canvas(scen)
        sheet.paste(canvas_img, (cx, cy))
        
        # Border around canvas
        draw.rectangle([cx, cy, cx + card_w, cy + card_h], outline=(180, 160, 140), width=3)
        
        # Title above/below
        draw.rectangle([cx, cy - 28, cx + card_w, cy], fill=(30, 30, 40))
        draw.text((cx + 12, cy - 24), scen["title"], fill=(255, 255, 255), font=font_card_title)
        
        # Footer info box
        fy = cy + card_h + 10
        status_bg = (230, 245, 235) if scen["cap_status"] == "within" else (255, 243, 220)
        status_border = (120, 200, 140) if scen["cap_status"] == "within" else (240, 170, 80)
        status_fg = (20, 90, 40) if scen["cap_status"] == "within" else (140, 70, 10)
        
        draw.rounded_rectangle([cx, fy, cx + card_w, fy + 80], radius=8, fill=status_bg, outline=status_border, width=2)
        draw.text((cx + 12, fy + 12), scen["remix_text"], fill=(30, 30, 50), font=font_badge)
        draw.text((cx + 12, fy + 42), scen["cap_text"], fill=status_fg, font=font_badge)
        
    sheet.save(OUT_SHEET, quality=95)
    print(f"Showcase sheet saved successfully: {OUT_SHEET}")

if __name__ == "__main__":
    build_showcase_sheet()
