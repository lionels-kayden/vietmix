"""
Generate placeholder PNG images for Viet phuc Remix.
Creates 1080x1920 transparent RGBA PNGs with grey silhouette and text labels.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CANVAS_WIDTH = 1080
CANVAS_HEIGHT = 1920

# Root directory of the repository
ROOT_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT_DIR / "assets"
MALE_DIR = ASSETS_DIR / "male"
FEMALE_DIR = ASSETS_DIR / "female"

# Slot bounding boxes (x0, y0, x1, y1) for silhouette approximation on 1080x1920 canvas
SLOT_BOXES = {
    "BASE": (320, 260, 760, 1780),
    "HEAD": (380, 180, 700, 440),
    "NECK": (430, 460, 650, 640),
    "TOP": (290, 460, 790, 1260),
    "BOTTOM": (340, 960, 740, 1680),
    "SHOES": (370, 1650, 710, 1840),
}

SILHOUETTE_COLOR = (140, 140, 150, 200)
TEXT_COLOR = (255, 255, 255, 255)
OUTLINE_COLOR = (100, 100, 110, 220)


def create_placeholder(output_path: Path, label: str, slot: str):
    """Creates a 1080x1920 transparent RGBA PNG with a silhouette and text label."""
    img = Image.new("RGBA", (CANVAS_WIDTH, CANVAS_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    box = SLOT_BOXES.get(slot, (300, 300, 780, 1600))
    # Draw rounded silhouette area
    draw.rounded_rectangle(box, radius=24, fill=SILHOUETTE_COLOR, outline=OUTLINE_COLOR, width=3)

    # Load font
    try:
        font = ImageFont.load_default(size=36)
    except Exception:
        font = ImageFont.load_default()

    # Draw label centered within the box
    text_bbox = draw.textbbox((0, 0), label, font=font)
    text_w = text_bbox[2] - text_bbox[0]
    text_h = text_bbox[3] - text_bbox[1]

    cx = (box[0] + box[2]) / 2
    cy = (box[1] + box[3]) / 2
    tx = cx - text_w / 2
    ty = cy - text_h / 2

    draw.text((tx, ty), label, fill=TEXT_COLOR, font=font)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")


MALE_ITEMS = [
    ("M_A_TOP_ao_ngu_than.png", "Ao Ngu Than (M/A)", "TOP"),
    ("M_B_TOP_ao_giao_linh.png", "Ao Giao Linh (M/B)", "TOP"),
    ("M_C_TOP_ao_tac.png", "Ao Tac (M/C)", "TOP"),
    ("M_COMMON_BOTTOM_quan_lua_trang.png", "White Silk Trousers (M/A)", "BOTTOM"),
    ("M_MIX_BOTTOM_quan_hien_dai.png", "Beige Wide-Leg Trousers (M/MIX)", "BOTTOM"),
    ("M_COMMON_SHOES_giay_vai_den.png", "Cloth Shoes (M/A)", "SHOES"),
    ("M_MIX_SHOES_giay_sneaker.png", "White Sneakers (M/MIX)", "SHOES"),
    ("M_COMMON_HEAD_non_la.png", "Conical Hat (M/A)", "HEAD"),
    ("M_COMMON_NECK_vong_co_bac.png", "Silver Necklace (M/A)", "NECK"),
]

FEMALE_ITEMS = [
    ("F_A_TOP_ao_ngu_than.png", "Ao Ngu Than (F/A)", "TOP"),
    ("F_B_TOP_ao_giao_linh.png", "Ao Giao Linh (F/B)", "TOP"),
    ("F_C_TOP_ao_nhat_binh.png", "Ao Nhat Binh (F/C)", "TOP"),
    ("F_COMMON_BOTTOM_quan_lua_trang.png", "White Silk Trousers (F/A)", "BOTTOM"),
    ("F_B_BOTTOM_vay_dai.png", "Long Black Skirt (F/B)", "BOTTOM"),
    ("F_MIX_BOTTOM_quan_hien_dai.png", "Beige Wide-Leg Trousers (F/MIX)", "BOTTOM"),
    ("F_COMMON_SHOES_giay_vai_den.png", "Cloth Shoes (F/A)", "SHOES"),
    ("F_MIX_SHOES_giay_sneaker.png", "White Sneakers (F/MIX)", "SHOES"),
    ("F_COMMON_HEAD_non_la.png", "Conical Hat (F/A)", "HEAD"),
    ("F_COMMON_HEAD_tram_cai.png", "Silver Hairpin (F/A)", "HEAD"),
    ("F_COMMON_NECK_vong_co_bac.png", "Silver Necklace (F/A)", "NECK"),
]

BASE_CHARACTERS = [
    (MALE_DIR / "male_base.png", "Male Base Body", "BASE"),
    (FEMALE_DIR / "female_base.png", "Female Base Body", "BASE"),
]


def generate_all():
    print(f"Generating male items: {len(MALE_ITEMS)} items expected: 9")
    assert len(MALE_ITEMS) == 9, f"Expected 9 male items, got {len(MALE_ITEMS)}"

    print(f"Generating female items: {len(FEMALE_ITEMS)} items expected: 11")
    assert len(FEMALE_ITEMS) == 11, f"Expected 11 female items, got {len(FEMALE_ITEMS)}"

    print(f"Generating base characters: {len(BASE_CHARACTERS)} characters expected: 2")
    assert len(BASE_CHARACTERS) == 2, f"Expected 2 base characters, got {len(BASE_CHARACTERS)}"

    total_expected = len(MALE_ITEMS) + len(FEMALE_ITEMS) + len(BASE_CHARACTERS)
    print(f"Total placeholder files: {total_expected} (Expected: 22)")
    assert total_expected == 22, f"Expected 22 total files, got {total_expected}"

    # Generate base characters
    for path, label, slot in BASE_CHARACTERS:
        create_placeholder(path, label, slot)
        print(f"Created: {path.relative_to(ROOT_DIR)}")

    # Generate male items
    for filename, label, slot in MALE_ITEMS:
        create_placeholder(MALE_DIR / filename, label, slot)
        print(f"Created: assets/male/{filename}")

    # Generate female items
    for filename, label, slot in FEMALE_ITEMS:
        create_placeholder(FEMALE_DIR / filename, label, slot)
        print(f"Created: assets/female/{filename}")

    print("All placeholders successfully generated!")


if __name__ == "__main__":
    generate_all()
