from pathlib import Path
import numpy as np
from PIL import Image

F=Path(__file__).resolve().parents[1]/'reports/p3a-single-A'

def test_v2_preserves_original_body_and_accepted_collar():
    base=Image.open(F/'v2/layers/base.png').convert('RGBA')
    assert base.tobytes()==Image.open(F/'layers/base.png').convert('RGBA').tobytes()
    a=np.array(Image.open(F/'v2/layers/top.png'))
    b=np.array(Image.open(F/'layers/top.png'))
    allowed=np.zeros(a.shape[:2],bool)
    allowed[920:990,250:355]=True;allowed[920:990,720:830]=True
    assert np.array_equal(a[~allowed],b[~allowed])

def test_v2_shoe_mask_is_reversible_and_composite_reproducible():
    base=Image.open(F/'v2/layers/base.png').convert('RGBA')
    masked=Image.open(F/'v2/layers/base-with-shoes.png').convert('RGBA')
    assert masked.crop((0,0,1080,1710)).tobytes()==base.crop((0,0,1080,1710)).tobytes()
    assert masked.getchannel('A').crop((0,1710,1080,1920)).getextrema()==(0,0)
    result=Image.new('RGBA',masked.size)
    result.alpha_composite(masked)
    for name in ('shoes','bottom','top'):
        result.alpha_composite(Image.open(F/f'v2/layers/{name}.png').convert('RGBA'))
    assert result.tobytes()==Image.open(F/'v2/composite.png').convert('RGBA').tobytes()
    # Original finger pixels are still original, rather than generated replacements.
    for box in ((280,995,330,1060),(750,995,790,1060)):
        assert result.crop(box).tobytes()==base.crop(box).tobytes()
