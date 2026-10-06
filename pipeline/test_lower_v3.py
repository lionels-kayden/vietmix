from pathlib import Path
import numpy as np
import pytest
from PIL import Image
from scipy import ndimage as ndi
from lower_v3 import compose

ROOT=Path(__file__).resolve().parents[1]
F=ROOT/'reports/p3a-lower-v3'

def read_layers():
    return {name:Image.open(F/'layers'/f'{name}.png').convert('RGBA') for name in ('base','base-with-shoes','bottom','shoes')}

def test_independent_garments_have_no_full_frame_background_or_other_slots():
    pants=np.array(Image.open(F/'layers/bottom.png'))
    shoes=np.array(Image.open(F/'layers/shoes.png'))
    assert pants[:740,:,3].max()==0 and pants[1790:,:,3].max()==0
    assert shoes[:1680,:,3].max()==0
    for image in (pants,shoes):
        assert image[:,:250,3].max()==0 and image[:,850:,3].max()==0
    # Old shoe layer retained pale trouser scraps. Full uppers must be dark cloth.
    upper=(shoes[:,:,3]>240);upper[1780:]=False
    assert upper.sum()>3000
    assert (shoes[:,:,:3].min(axis=2)[upper]>210).sum()==0
    # White trousers remain opaque and continuous through the former splice level.
    for y in (950,1200,1445,1450,1455,1620):
        assert pants[y,440,3]>240 and pants[y,640,3]>240

def test_inner_legs_and_underwear_are_covered_without_hiding_body():
    layers=read_layers();base=np.array(layers['base']);pants=np.array(layers['bottom'])
    assert layers['base'].tobytes()==Image.open(ROOT/'reports/p3a/extracted/male_base.png').convert('RGBA').tobytes()
    solid=ndi.binary_erosion(base[:,:,3]>240,iterations=2)
    missing=solid&(pants[:,:,3]<240)
    assert missing[1130:1700].sum()<100
    assert missing[850:1030,385:695].sum()<100

@pytest.mark.parametrize('pants,shoes',[(False,False),(True,False),(False,True),(True,True)])
def test_layer_switching_and_pants_cover_shoes(pants,shoes):
    layers=read_layers();result=compose(layers,pants,shoes)
    if not pants and not shoes:assert result.tobytes()==layers['base'].tobytes()
    if pants and shoes:
        p=np.array(layers['bottom']);s=np.array(layers['shoes']);r=np.array(result)
        overlap=(p[:,:,3]>240)&(s[:,:,3]>240)
        assert overlap.sum()>1000
        expected=Image.alpha_composite(compose(layers,False,True),layers['bottom'])
        assert result.tobytes()==expected.tobytes()
        reversed_order=Image.alpha_composite(compose(layers,True,False),layers['shoes'])
        assert result.tobytes()!=reversed_order.tobytes()
    if shoes and not pants:
        assert result.tobytes()==Image.open(F/'shoes-only.png').convert('RGBA').tobytes()
