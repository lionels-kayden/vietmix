from PIL import Image
import pytest
from review_pack import combinations, compose, CANVAS, neckline_mask, hand_overlay


def test_combinations_cover_product_without_cross_gender():
    rows=[{'id':f'{g}-{s}-{i}','gender':g,'slot':s} for g in ('M','F')
          for s,count in [('top',3),('bottom',2),('shoes',3)] for i in range(count)]
    out=combinations(rows,'M')
    assert len(out)==18
    assert len({tuple(r['id'] for r in c) for c in out})==18
    assert all(r['gender']=='M' for c in out for r in c)


def test_composition_does_not_mutate_base_and_respects_slot_order():
    base=Image.new('RGBA',CANVAS,(100,50,0,255));before=base.tobytes()
    lower=Image.new('RGBA',CANVAS);lower.putpixel((10,10),(0,255,0,255))
    upper=Image.new('RGBA',CANVAS);upper.putpixel((10,10),(255,0,0,255))
    out=compose(base,[lower,upper])
    assert out.getpixel((10,10))==(255,0,0,255)
    assert out.getpixel((100,100))==base.getpixel((100,100))
    assert base.tobytes()==before
    assert compose(base,[]).tobytes()==before
    with pytest.raises(ValueError): compose(base,[Image.new('RGBA',(10,10))])


def test_collar_mask_reveals_existing_head_without_baking_skin():
    base=Image.new('RGBA',CANVAS);base.putpixel((540,330),(180,130,100,255))
    cloth=Image.new('RGBA',CANVAS,(20,40,80,255))
    layer,mask=neckline_mask(cloth,base,'M')
    assert layer.getpixel((540,330))[3]==0
    assert mask.getpixel((540,330))==255
    assert layer.getpixel((540,500))==(20,40,80,255)
    assert compose(base,[layer]).getpixel((540,330))==base.getpixel((540,330))
    assert cloth.getpixel((540,330))==(20,40,80,255)


def test_foreground_hands_are_source_pixels_scoped_to_specific_tops():
    base=Image.new('RGBA',CANVAS,(150,120,100,255))
    assert hand_overlay(base,'M_A_TOP_ao_ngu_than').getbbox() is None
    layer=hand_overlay(base,'M_C_TOP_ao_tac')
    assert layer.getpixel((310,1080))==base.getpixel((310,1080))
    assert layer.getpixel((540,1000))[3]==0
    assert layer.getpixel((310,700))[3]==0
    assert layer.getpixel((310,1200))[3]==0


def test_saved_review_pack_has_complete_layers_and_exact_original_bases():
    import json
    from pathlib import Path
    root=Path(__file__).resolve().parents[1];folder=root/'reports/p3a-review'
    data=json.loads((folder/'report.json').read_text(encoding='utf-8'))
    assert len(data['combinations'])==36
    assert not data['approval']['layers']
    for g,name in [('M','male'),('F','female')]:
        assert Image.open(folder/'layers'/f'{g}_base.png').tobytes()==Image.open(root/'reports/p3a/extracted'/f'{name}_base.png').tobytes()
    for item in data['items']:
        image=Image.open(folder/'layers'/f"{item['id']}.png")
        assert image.size==CANVAS and image.mode=='RGBA'
        low,high=image.getchannel('A').getextrema()
        assert low==0 and high>=240
        if item['foreground']: assert (folder/item['foreground']).exists()
    assert len({c['id'] for c in data['combinations']})==36
    assert all((folder/c['preview']).exists() for c in data['combinations'])
