from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage as ndi

ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/'reports/p3a-single-A'


def test_single_outfit_preserves_base_and_can_recompose_exactly():
    base=Image.open(FOLDER/'layers/base.png').convert('RGBA')
    original=Image.open(ROOT/'reports/p3a/extracted/male_base.png').convert('RGBA')
    assert base.tobytes()==original.tobytes()
    result=base.copy()
    for name in ('shoes','bottom','top'):
        layer=Image.open(FOLDER/f'layers/{name}.png').convert('RGBA')
        assert layer.size==base.size
        assert layer.getchannel('A').getextrema()[0]==0
        result.alpha_composite(layer)
    assert result.tobytes()==Image.open(FOLDER/'composite.png').convert('RGBA').tobytes()
    # The original face, rather than a generated replacement, remains visible.
    assert result.crop((450,170,630,310)).tobytes()==base.crop((450,170,630,310)).tobytes()


def test_single_outfit_covers_shoulders_and_arms_without_covering_hands():
    body=np.array(Image.open(FOLDER/'layers/base.png'))[:,:,3]>240
    top=np.array(Image.open(FOLDER/'layers/top.png'))[:,:,3]
    missing=ndi.binary_erosion(body,iterations=2)&(top<240)
    # Regression: old overlay exposed thousands of body pixels in this inspected ROI.
    assert missing[420:925].sum()<100
    assert top[1030,300]==0
    assert top[1030,780]==0
