from PIL import Image, ImageDraw
import numpy as np
from image_core import remove_border_background, split_sheet, normalize_base, bbox


def test_enclosed_white_trousers_stay_opaque():
    im = Image.new('RGB', (80, 100), (245,245,240))
    ImageDraw.Draw(im).rectangle((20,10,60,90), fill='white', outline='black', width=2)
    out = np.array(remove_border_background(im))
    assert out[0,0,3] == 0
    assert out[50,40,3] == 255
    assert tuple(out[50,40,:3]) == (255,255,255)


def test_existing_alpha_and_rgb_unchanged():
    a = np.zeros((20,20,4), dtype=np.uint8)
    a[3:17,3:17] = [230,220,210,180]
    assert np.array_equal(np.array(remove_border_background(Image.fromarray(a))), a)


def test_gap_split_preserves_both_subjects_and_excludes_noise():
    im=Image.new('RGB',(200,200),'white'); d=ImageDraw.Draw(im)
    d.rectangle((20,10,70,190),fill='red'); d.rectangle((120,30,180,170),fill='blue')
    d.rectangle((195,195,196,196),fill='black')
    left,right,gap=split_sheet(im)
    assert 70 < gap < 120
    assert bbox(left) == (20,10,71,191)
    assert bbox(right)[2]-bbox(right)[0] == 61


def test_normalize_preserves_aspect_and_transparency():
    im=Image.new('RGB',(100,200),'white')
    ImageDraw.Draw(im).rectangle((30,10,69,189),fill='blue')
    out, info=normalize_base(im)
    assert out.size == (1080,1920)
    b=bbox(out)
    assert abs((b[2]-b[0])/(b[3]-b[1])-40/180) < .005
    assert out.getpixel((0,0))[3] == 0


def test_disconnected_subjects_with_overlapping_column_projections():
    im=Image.new('RGB',(150,160),'white');d=ImageDraw.Draw(im)
    d.rectangle((10,10,90,60),fill='red')
    d.rectangle((70,80,140,150),fill='blue')
    left,right,divider=split_sheet(im)
    assert divider is None
    assert bbox(left)==(10,10,91,61)
    assert bbox(right)==(70,80,141,151)
