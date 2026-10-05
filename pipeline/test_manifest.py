import pytest
from PIL import Image
from manifest import parse_name, dominant_color


def test_kind_not_color_or_variant_suffix():
    a=parse_name('F_COMMON_SHOES_giay_vai_den_v02.png')
    assert a['kind']=='giay_vai_den' and a['variant']=='v02'
    assert parse_name('M_A_TOP_ao_ngu_than.png')['variant']=='default'


@pytest.mark.parametrize('name',['M_A_TOP_unknown.png','M_COMMON_SHOES_giay_vai_den_red.png','X_A_TOP_ao_ngu_than.png'])
def test_unknown_names_fail(name):
    with pytest.raises(ValueError): parse_name(name)


def test_transparent_background_does_not_dominate_color():
    im=Image.new('RGBA',(100,100),(255,255,255,0))
    im.paste((20,50,90,255),(20,20,60,60))
    assert dominant_color(im)['rgb']==[20,50,90]


def test_white_pixels_are_valid_color():
    assert dominant_color(Image.new('RGBA',(20,20),(250,250,245,255)))['rgb']==[250,250,245]
