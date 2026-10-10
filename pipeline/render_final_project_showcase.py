import os
from PIL import Image, ImageDraw, ImageFont

def render_outfit(gender, item_filenames, scene_filename):
    scene_path = os.path.join("assets", "scenes", scene_filename)
    if os.path.exists(scene_path):
        bg = Image.open(scene_path).convert("RGBA").resize((540, 960))
    else:
        bg = Image.new("RGBA", (540, 960), (242, 236, 225, 255))

    char_canvas = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
    base_path = os.path.join("assets", gender, f"{gender}_base.png")
    if os.path.exists(base_path):
        base_img = Image.open(base_path).convert("RGBA")
        char_canvas.alpha_composite(base_img)

    for item_fn in item_filenames:
        item_path = os.path.join("assets", gender, item_fn)
        if os.path.exists(item_path):
            item_img = Image.open(item_path).convert("RGBA")
            char_canvas.alpha_composite(item_img)

    # 85% scale, grounded at bottom
    target_w = int(540 * 0.85)
    target_h = int(960 * 0.85)
    scaled_char = char_canvas.resize((target_w, target_h), Image.Resampling.LANCZOS)

    pos_x = (540 - target_w) // 2
    pos_y = 960 - target_h
    bg.alpha_composite(scaled_char, (pos_x, pos_y))

    return bg.convert("RGB")

def build_showcase():
    # 1. Male - Set A (Tet)
    outfit1 = render_outfit(
        "male",
        ["M_COMMON_SHOES_giay_vai_den.png", "M_COMMON_BOTTOM_quan_lua_trang.png", "M_A_TOP_ao_ngu_than.png"],
        "tet.jpg"
    )

    # 2. Female - RX-01 Remix (Doi-thuong Hoi An)
    outfit2 = render_outfit(
        "female",
        ["F_MIX_SHOES_giay_sneaker.png", "F_MIX_BOTTOM_quan_hien_dai.png", "F_B_TOP_ao_giao_linh.png"],
        "doi-thuong.jpg"
    )

    # 3. Male - RX-02 Remix (Ky-yeu)
    outfit3 = render_outfit(
        "male",
        ["M_MIX_SHOES_giay_sneaker.png", "M_MIX_BOTTOM_quan_hien_dai.png", "M_B_TOP_ao_giao_linh.png"],
        "ky-yeu.jpg"
    )

    # Composite board: 1800 x 1150
    board = Image.new("RGB", (1800, 1150), (250, 247, 240))
    draw = ImageDraw.Draw(board)

    # Border
    draw.rectangle([(20, 20), (1780, 1130)], outline=(222, 211, 196), width=3)
    draw.rectangle([(28, 28), (1772, 1122)], outline=(184, 58, 44), width=2)

    # Fonts
    try:
        f_title = ImageFont.truetype("arial.ttf", 38)
        f_sub = ImageFont.truetype("arial.ttf", 20)
        f_card_title = ImageFont.truetype("arial.ttf", 22)
        f_tag = ImageFont.truetype("arial.ttf", 16)
    except:
        f_title = ImageFont.load_default()
        f_sub = ImageFont.load_default()
        f_card_title = ImageFont.load_default()
        f_tag = ImageFont.load_default()

    # Header
    draw.text((900, 60), "VIỆT PHỤC REMIX - TỔNG QUAN DỰ ÁN HOÀN THIỆN", fill=(184, 58, 44), font=f_title, anchor="mm")
    draw.text((900, 105), "Ứng dụng phối đồ 2D Việt phục • Tư liệu văn hóa lật 3D • Đánh giá hòa hợp • Tủ đồ Lookbook & Chia sẻ", fill=(30, 46, 66), font=f_sub, anchor="mm")

    # Paste outfits
    # Card 1: Set A Tet
    thumb1 = outfit1.resize((360, 640), Image.Resampling.LANCZOS)
    board.paste(thumb1, (120, 180))
    draw.rectangle([(120, 180), (480, 820)], outline=(184, 58, 44), width=2)
    draw.rectangle([(120, 830), (480, 960)], fill=(255, 255, 255), outline=(222, 211, 196), width=1)
    draw.text((300, 860), "1. Cổ điển thuần khiết (Set A)", fill=(184, 58, 44), font=f_card_title, anchor="mm")
    draw.text((300, 895), "Áo ngũ thân • Quần lụa • Giày vải", fill=(94, 89, 83), font=f_tag, anchor="mm")
    draw.text((300, 925), "Bối cảnh: Tết Hoàng Cung (Cap 1)", fill=(30, 46, 66), font=f_tag, anchor="mm")

    # Card 2: Female RX-01 Hoi An
    thumb2 = outfit2.resize((360, 640), Image.Resampling.LANCZOS)
    board.paste(thumb2, (720, 180))
    draw.rectangle([(720, 180), (1080, 820)], outline=(30, 46, 66), width=2)
    draw.rectangle([(720, 830), (1080, 960)], fill=(255, 255, 255), outline=(222, 211, 196), width=1)
    draw.text((900, 860), "2. Cách tân nhẹ (Remix RX-01)", fill=(30, 46, 66), font=f_card_title, anchor="mm")
    draw.text((900, 895), "Áo giao lĩnh • Quần âu • Sneaker", fill=(94, 89, 83), font=f_tag, anchor="mm")
    draw.text((900, 925), "Bối cảnh: Dạo phố Hội An (Cap 2)", fill=(184, 58, 44), font=f_tag, anchor="mm")

    # Card 3: Male RX-02 Ky yeu
    thumb3 = outfit3.resize((360, 640), Image.Resampling.LANCZOS)
    board.paste(thumb3, (1320, 180))
    draw.rectangle([(1320, 180), (1680, 820)], outline=(196, 154, 56), width=2)
    draw.rectangle([(1320, 830), (1680, 960)], fill=(255, 255, 255), outline=(222, 211, 196), width=1)
    draw.text((1500, 860), "3. Đột phá hiện đại (Remix RX-02)", fill=(196, 154, 56), font=f_card_title, anchor="mm")
    draw.text((1500, 895), "Áo giao lĩnh • Quần âu • Sneaker", fill=(94, 89, 83), font=f_tag, anchor="mm")
    draw.text((1500, 925), "Bối cảnh: Kỷ yếu học đường (Cap 2)", fill=(30, 46, 66), font=f_tag, anchor="mm")

    # Footer feature highlights
    draw.rounded_rectangle([(120, 990), (1680, 1080)], radius=15, fill=(244, 238, 226), outline=(222, 211, 196))
    features_text = "✨ ĐẦY ĐỦ TÍNH NĂNG: Thanh trượt Remix (0-1-2) | Thẻ lật 3D tư liệu | Chốt bộ & Lời bình văn hóa | Xuất Canvas 1080x1350 PNG | Tủ đồ Lookbook | Chia sẻ Facebook/Threads/Zalo"
    draw.text((900, 1035), features_text, fill=(30, 46, 66), font=f_tag, anchor="mm")

    os.makedirs("reports", exist_ok=True)
    out_path = os.path.join("reports", "final_project_showcase.jpg")
    board.save(out_path, quality=95)
    print(f"Saved showcase to {out_path}")

if __name__ == "__main__":
    build_showcase()
