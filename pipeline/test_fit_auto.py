from PIL import Image, ImageDraw
from fit_auto import assess_mismatch, scale_disagreement, place, measure_base
from learn_defaults import learn_defaults
from fit_auto import place_shoes, fit_item


def test_shoes_follow_two_separate_feet_not_pair_center():
    base=Image.new('RGBA',(1080,1920)); d=ImageDraw.Draw(base)
    d.rectangle((350,1700,420,1840),fill='black')
    d.rectangle((650,1700,720,1840),fill='black')
    shoes=Image.new('RGBA',(100,100)); d=ImageDraw.Draw(shoes)
    d.rectangle((0,0,29,99),fill='red');d.rectangle((70,0,99,99),fill='red')
    layer,parts=place_shoes(shoes,base,{'ankle_y':1700})
    assert len(parts)==2
    assert layer.getpixel((385,1800))[3]==255
    assert layer.getpixel((685,1800))[3]==255
    assert layer.getpixel((535,1800))[3]==0


def test_bottom_hem_matches_measured_ankle_and_flags_width_failure():
    im=Image.new('RGBA',(200,1000),'black')
    fit=fit_item(im,{'slot':'bottom'}, {'height':1760,'waist_width':400,
                 'waist_y':700,'ankle_y':1700,'center_x':540})
    assert fit['y']+im.height*fit['scale']==1700
    assert fit['status']=='FAIL' and not fit['approved']


def test_fit_thresholds_and_excessive_distortion():
    assert assess_mismatch(.099)=='PASS'
    assert assess_mismatch(.1)=='WARN'
    assert assess_mismatch(.2)=='WARN'
    assert assess_mismatch(.201)=='FAIL'
    assert assess_mismatch(scale_disagreement(.86,.63))=='FAIL'


def test_uniform_transform_positions_without_recolor():
    im=Image.new('RGBA',(10,20),(200,50,30,255))
    out=place(im,{'x':40,'y':80,'scale':2})
    assert out.getbbox()==(40,80,60,120)
    assert out.getpixel((50,100))==(200,50,30,255)


def test_contour_measurement_changes_with_image_not_fixed_landmarks():
    im=Image.new('RGBA',(1080,1920))
    d=ImageDraw.Draw(im);d.ellipse((460,80,620,300),fill='black')
    d.rectangle((500,280,580,360),fill='black');d.rectangle((350,360,730,1000),fill='black')
    d.rectangle((400,1000,680,1820),fill='black')
    a=measure_base(im)
    shifted=Image.new('RGBA',im.size);shifted.alpha_composite(im,(0,20))
    b=measure_base(shifted)
    assert b['neck_y']==a['neck_y']+20
    assert a['needs_review'] and a['navel_y'] is None


def test_defaults_ignore_unreviewed_and_preserve_user_values():
    good={'gender':'male','slot':'top','approved':True,'needs_review':False,'status':'PASS','x':10,'y':20,'scale':1.2}
    bad={**good,'approved':False,'scale':99}
    existing={'male:top':{'x':777}}
    out=learn_defaults({'good':good,'bad':bad},existing)
    assert out['male:top']=={'x':777,'y':20,'scale':1.2}
    assert existing=={'male:top':{'x':777}}
