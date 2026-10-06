"""Complete independent trousers and shoes, with source-specific ankle occlusion."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage as ndi
from image_core import keep_components,bbox,components,CANVAS
from fit_auto import place

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'reports/p3a-lower-v3'

def compose(layers,pants=True,shoes=True):
    im=Image.new('RGBA',CANVAS)
    im.alpha_composite(layers['base-with-shoes' if shoes else 'base'])
    if shoes:im.alpha_composite(layers['shoes'])
    if pants:im.alpha_composite(layers['bottom'])
    return im

def cover_inner_legs(bottom,base):
    """Extend only the inner leg contour to the measured body, keeping outer seam fixed."""
    a=np.array(bottom).astype(float)/255;body=np.array(base.getchannel('A'))>240
    alpha=a[:,:,3]>.95
    yy,xx=np.mgrid[:1920,:1080];sx=xx.astype(float)
    maximum=0.0
    for side,(lo,hi) in enumerate(((300,540),(540,780))):
        edges=[]
        for y in range(1920):
            cloth=np.flatnonzero(alpha[y,lo:hi])+lo
            skin=np.flatnonzero(body[y,lo:hi])+lo
            if 960<=y<1710 and len(cloth)>30 and len(skin)>10:
                outer=cloth[0] if side==0 else cloth[-1]
                inner=cloth[-1] if side==0 else cloth[0]
                target=min(539,skin[-1]+4) if side==0 else max(540,skin[0]-4)
                change=max(0,target-inner) if side==0 else min(0,target-inner)
                edges.append((outer,inner,change))
            else:edges.append((0,0,0))
        delta=ndi.gaussian_filter1d(np.array(edges)[:,2].astype(float),5)
        for y,(outer,inner,_) in enumerate(edges):
            if outer==inner:continue
            end=inner+delta[y]
            low,high=sorted((outer,end));region=(xx[y]>=low)&(xx[y]<=high)
            sx[y,region]=outer+(xx[y,region]-outer)*(inner-outer)/(end-outer)
            maximum=max(maximum,abs(delta[y]))
    coords=np.array([yy,sx]);out_alpha=ndi.map_coordinates(a[:,:,3],coords,order=1)
    rgb=np.stack([ndi.map_coordinates(a[:,:,c]*a[:,:,3],coords,order=1) for c in range(3)],axis=2)
    rgb=np.divide(rgb,out_alpha[:,:,None],out=np.zeros_like(rgb),where=out_alpha[:,:,None]>0)
    return Image.fromarray((np.clip(np.dstack((rgb,out_alpha)),0,1)*255).round().astype(np.uint8)),maximum

def run():
    (OUT/'layers').mkdir(exist_ok=True)
    expected={'pants.png':'35ad5e2d3accb56c61bd7420ba7b662bea4220ecd753f9eaf775dbb15c5034aa',
              'shoes.png':'ba0b13eed7bef9bb39e51c383ef607dd05cb065634b09f45f1c17d596334808a'}
    for name,digest in expected.items():
        if hashlib.sha256((OUT/'source'/name).read_bytes()).hexdigest()!=digest:
            raise ValueError('Artwork changed; re-inspect source-specific shoe openings and fit.')
    base=Image.open(ROOT/'reports/p3a/extracted/male_base.png').convert('RGBA')
    pants=keep_components(Image.open(OUT/'source/pants.png').convert('RGBA'),.01)
    pants=pants.crop(bbox(pants));scale=1025/pants.height
    bottom=place(pants,{'x':(1080-pants.width*scale)/2,'y':750,'scale':scale})
    bottom,inner_adjustment=cover_inner_legs(bottom,base)
    source=keep_components(Image.open(OUT/'source/shoes.png').convert('RGBA'),.01)
    parts,_=components(source,1000);parts=sorted(parts,key=lambda p:p['box'][0])
    shoes=Image.new('RGBA',CANVAS);opening=Image.new('L',CANVAS)
    # Annotated back opening centers and front rims on the actual source artwork.
    outline=[(540,275),(579,200),(675,145),(755,170),(775,230),(748,290),(650,272)]
    for i,part in enumerate(parts):
        box=part['box'];piece=source.crop(box);s=180/piece.width
        center=650 if i==0 else 1124
        ankle=450 if i==0 else 630
        x=ankle-(center-box[0])*s;y=1690
        fit={'x':x,'y':y,'scale':s}
        shoes.alpha_composite(place(piece,fit))
        poly=outline if i==0 else [(1774-px,py) for px,py in outline]
        mapped=[(x+(px-box[0])*s,y+(py-box[1])*s) for px,py in poly]
        ImageDraw.Draw(opening).polygon(mapped,fill=255)
    original=np.array(base)
    # Preserve bare legs down into the collar; hide only feet below the shoe vamp.
    visibility=np.full((1920,1080),255,np.uint8);visibility[1733:]=0
    visible=original.copy();visible[:,:,3]=np.minimum(visible[:,:,3],visibility)
    shoe_pixels=np.array(shoes)
    reveal=(np.array(opening)>0)&(visible[:,:,3]>0)
    shoe_pixels[reveal,3]=0
    shoes=Image.fromarray(shoe_pixels)
    Image.fromarray(visibility).save(OUT/'shoe-body-visibility.png')
    opening.save(OUT/'shoe-opening-mask.png')
    layers={'base':base,'base-with-shoes':Image.fromarray(visible),'bottom':bottom,'shoes':shoes}
    for name,im in layers.items():im.save(OUT/'layers'/f'{name}.png')
    sheet=Image.new('RGB',(1080,800),'#eee6da');draw=ImageDraw.Draw(sheet)
    for i,(name,p,s) in enumerate([('pants-only',True,False),('shoes-only',False,True),('pants-and-shoes',True,True)]):
        im=compose(layers,p,s);im.save(OUT/f'{name}.png')
        bg=Image.new('RGBA',CANVAS,'#eee6da');bg.alpha_composite(im)
        bg.convert('RGB').save(OUT/f'{name}.jpg',quality=95)
        sheet.paste(bg.convert('RGB').crop((210,690,870,1900)).resize((360,660)),(360*i,55))
        draw.text((360*i+15,20),name.upper(),fill='#302b29')
    sheet.save(OUT/'independent-review.jpg',quality=95)
    (OUT/'report.json').write_text(json.dumps({'status':'REVIEW_REQUIRED',
       'source_hashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (OUT/'source').glob('*.png')},
       'pants_fit':{'y':750,'scale':scale,'hem':1775},
       'inner_leg_max_adjustment_px':inner_adjustment,
       'shoe_placement':'Per-shoe uniform width 180px; source opening anchors annotated manually',
       'body_visibility':'Original unchanged; source-specific shoe mask below y=1733; collar openings reveal original ankle',
       'layer_order':['body','shoes','bottom','top'],'independent_layers':True},indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':run()
