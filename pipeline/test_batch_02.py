from pathlib import Path
import numpy as np
import pytest
from PIL import Image
from scipy import ndimage as ndi

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'reports/p3a-batch-02'
A=ROOT/'reports/p3a-single-A/v2'
LOWER=ROOT/'reports/p3a-lower-v3'

@pytest.mark.parametrize('code',['B','C'])
def test_fixed_character_and_complete_lower_layers_are_preserved(code):
    for name in ('base','base-with-shoes','bottom','shoes'):
        assert (OUT/code/'layers'/f'{name}.png').read_bytes()==(LOWER/'layers'/f'{name}.png').read_bytes()
    result=Image.new('RGBA',(1080,1920))
    for name in ('base-with-shoes','shoes','bottom','top'):
        result.alpha_composite(Image.open(OUT/code/'layers'/f'{name}.png').convert('RGBA'))
    assert result.tobytes()==Image.open(OUT/code/'composite.png').convert('RGBA').tobytes()
    base=Image.open(A/'layers/base.png').convert('RGBA')
    assert result.crop((430,80,650,310)).tobytes()==base.crop((430,80,650,310)).tobytes()
    # The generated skin is not used as a substitute for the original hands.
    for x,y in [(305,1020),(775,1020)]:
        assert result.getpixel((x,y))==base.getpixel((x,y))

@pytest.mark.parametrize('code',['B','C'])
def test_coverage_and_open_gaps_survive_extraction(code):
    top=np.array(Image.open(OUT/code/'layers/top.png'))
    base=np.array(Image.open(A/'layers/base.png'))[:,:,3]>240
    missing=ndi.binary_erosion(base,iterations=2)&(top[:,:,3]<240)
    assert missing[420:925].sum()<100
    assert top[:320,:,3].max()==0
    # Closed source-background gaps must not be baked into a reusable dark garment.
    assert top[790,380,3]==0
    assert top[1060,750,3]==0
    assert top[500,540,3]==255
