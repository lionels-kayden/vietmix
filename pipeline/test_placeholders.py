"""
Tests to verify generated placeholder images:
- File count matches expected (9 male + 11 female + 2 base = 22 PNGs)
- Every PNG is 1080x1920
- Every PNG has an alpha channel
"""

import sys
from pathlib import Path
from PIL import Image

ROOT_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT_DIR / "assets"
MALE_DIR = ASSETS_DIR / "male"
FEMALE_DIR = ASSETS_DIR / "female"

EXPECTED_MALE_ITEMS = 9
EXPECTED_FEMALE_ITEMS = 11
EXPECTED_BASE = 2
EXPECTED_TOTAL = EXPECTED_MALE_ITEMS + EXPECTED_FEMALE_ITEMS + EXPECTED_BASE  # 22


def test_placeholder_counts():
    male_pngs = list(MALE_DIR.glob("*.png"))
    female_pngs = list(FEMALE_DIR.glob("*.png"))

    assert len(male_pngs) == EXPECTED_MALE_ITEMS + 1, (
        f"Expected {EXPECTED_MALE_ITEMS + 1} PNGs in assets/male, found {len(male_pngs)}"
    )
    assert len(female_pngs) == EXPECTED_FEMALE_ITEMS + 1, (
        f"Expected {EXPECTED_FEMALE_ITEMS + 1} PNGs in assets/female, found {len(female_pngs)}"
    )

    total_pngs = len(male_pngs) + len(female_pngs)
    assert total_pngs == EXPECTED_TOTAL, (
        f"Expected total {EXPECTED_TOTAL} PNGs, found {total_pngs}"
    )

    assert (MALE_DIR / "male_base.png").exists(), "male_base.png does not exist"
    assert (FEMALE_DIR / "female_base.png").exists(), "female_base.png does not exist"


def test_placeholder_dimensions_and_alpha():
    all_pngs = list(MALE_DIR.glob("*.png")) + list(FEMALE_DIR.glob("*.png"))
    assert len(all_pngs) == EXPECTED_TOTAL, f"Expected {EXPECTED_TOTAL} PNG files"

    for png_path in all_pngs:
        with Image.open(png_path) as img:
            assert img.size == (1080, 1920), (
                f"{png_path.name} dimension is {img.size}, expected (1080, 1920)"
            )
            assert img.mode in ("RGBA", "LA") or "A" in img.getbands(), (
                f"{png_path.name} mode is {img.mode}, expected alpha channel"
            )


if __name__ == "__main__":
    try:
        test_placeholder_counts()
        print("PASS: test_placeholder_counts")
        test_placeholder_dimensions_and_alpha()
        print("PASS: test_placeholder_dimensions_and_alpha")
        print(f"All {EXPECTED_TOTAL} placeholder checks passed successfully!")
    except AssertionError as e:
        print(f"FAIL: {e}")
        sys.exit(1)
