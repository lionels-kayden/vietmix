"""Build prototype for Nam B with separated layers."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/p3a-prototype-B'
(OUT / 'layers').mkdir(parents=True, exist_ok=True)

# 1. Base
base = Image.open(ROOT / 'reports/p3a/extracted/male_base.png').convert('RGBA')
base.save(OUT / 'layers/base.png')

# 2. Shoes and Foot Mask
shoes = Image.open(ROOT / 'reports/p3a-lower-v3/layers/shoes.png').convert('RGBA')
shoes.save(OUT / 'layers/shoes.png')

base_arr = np.array(base).copy()
# Hide bare toes below y=1710 only inside the shoe zone
base_arr[1710:, :, 3] = 0
base_with_shoes = Image.fromarray(base_arr)
base_with_shoes.save(OUT / 'layers/base-with-shoes.png')

# 3. Bottom (Pants)
bottom = Image.open(ROOT / 'reports/p3a-lower-v3/layers/bottom.png').convert('RGBA')
bottom.save(OUT / 'layers/bottom.png')

# 4. Top (Nam B Tunic from source.png without the holes!)
src_im = Image.open(ROOT / 'reports/p3a-batch-02/B/source.png').convert('RGB').resize((1080, 1920), Image.Resampling.LANCZOS)
rgb = np.array(src_im)
r, g, b = [rgb[:, :, i].astype(int) for i in range(3)]

area = np.zeros(r.shape, bool)
area[300:1540, 185:895] = True

# Blue cloth + red trim
blue_cloth = (b > r + 4) & (b > g + 2)
red_trim = (r > g * 1.3) & (r > b * 1.3) & (g < 120)
cloth = (blue_cloth | red_trim) & area

labels, _ = ndi.label(cloth)
counts = np.bincount(labels.ravel())
counts[0] = 0
mask = labels == counts.argmax()

# Dilate slightly and fill holes so gold medallions inside the cloth are completely included!
mask = ndi.binary_closing(mask, iterations=4)
mask = ndi.binary_fill_holes(mask)

# Exclude neck skin area to let base neck show through the collar opening
neck_zone = np.zeros(r.shape, bool)
neck_zone[280:385, 480:600] = True
# Exclude skin/background in neck zone
skin_like = (r > g) & (g > b) & (rgb.min(axis=2) > 130)
mask[neck_zone & skin_like] = False

# Exclude hands area to let original hands show through cuffs
hands_zone = np.zeros(r.shape, bool)
hands_zone[940:1140, 240:360] = True
hands_zone[940:1140, 720:840] = True
mask[hands_zone & skin_like] = False

# Remove small background gaps between arms and torso if any
# Keep only largest component
labels, _ = ndi.label(mask)
counts = np.bincount(labels.ravel())
counts[0] = 0
mask = labels == counts.argmax()

rgba_top = np.dstack((rgb, (mask.astype(np.uint8) * 255)))
top_img = Image.fromarray(rgba_top)
top_img.save(OUT / 'layers/top.png')

# 5. Composite: base_with_shoes -> shoes -> bottom -> top
composite = Image.alpha_composite(base_with_shoes, shoes)
composite = Image.alpha_composite(composite, bottom)
composite = Image.alpha_composite(composite, top_img)
composite.save(OUT / 'composite.png')

# Preview on cream background
bg = Image.new('RGBA', (1080, 1920), (238, 230, 218, 255))
preview = Image.alpha_composite(bg, composite).convert('RGB')
preview.save(OUT / 'preview.jpg', quality=95)

# 6. Interactive HTML
html = """<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Bộ nam B — thử fit từng lớp</title><style>body{font:17px system-ui;background:#eee6da;color:#302b29;margin:24px}main{max-width:900px;margin:auto}.stage{position:relative;width:min(100%,540px);aspect-ratio:1080/1920;margin:auto;box-shadow:0 8px 30px rgba(0,0,0,0.12);background:#fff;border-radius:12px;overflow:hidden}.stage img{position:absolute;width:100%;height:100%}label{display:inline-block;padding:12px;font-weight:600;cursor:pointer}input{margin-right:6px}a{color:#244778;text-decoration:none}a:hover{text-decoration:underline}.controls{background:#fff;padding:12px 20px;border-radius:8px;margin-bottom:20px;display:flex;gap:16px;justify-content:center}</style><main><h1>Bộ nam B (Áo Giao Lĩnh) — Mẫu thử phân tách Layer</h1><p>Nhân vật gốc + Giày + Quần + Áo là bốn lớp PNG riêng biệt (chuẩn 1080x1920). Bật/tắt các ô bên dưới để kiểm tra từng món độc lập.</p><div class="controls"><label><input type="checkbox" checked data-layer="top"> Áo Giao Lĩnh</label><label><input type="checkbox" checked data-layer="bottom"> Quần lụa trắng</label><label><input type="checkbox" checked data-layer="shoes"> Giày vải đen</label></div><div class="stage"><img id="base" src="layers/base-with-shoes.png" alt="Nhân vật gốc"><img id="shoes" src="layers/shoes.png" alt="Giày"><img id="bottom" src="layers/bottom.png" alt="Quần"><img id="top" src="layers/top.png" alt="Áo"></div><p style="text-align:center;margin-top:20px"><a href="preview.jpg" target="_blank">Xem ảnh Preview chất lượng cao</a> · <a href="composite.png" target="_blank">PNG ghép trong suốt</a></p></main><script>document.querySelectorAll('input').forEach(el=>el.onchange=()=>{document.getElementById(el.dataset.layer).hidden=!el.checked;if(el.dataset.layer==='shoes')document.getElementById('base').src=el.checked?'layers/base-with-shoes.png':'layers/base.png'})</script></html>"""
(OUT / 'index.html').write_text(html, encoding='utf-8')
print("Successfully generated prototype B!")
