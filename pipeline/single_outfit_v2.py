"""Source-specific garment recovery from the inspected second fit study."""
from pathlib import Path
import json, hashlib
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/'reports/p3a-single-A'

def run():
    out=FOLDER/'v2';(out/'layers').mkdir(exist_ok=True)
    if hashlib.sha256((out/'ai-edit.png').read_bytes()).hexdigest()!='b35f0d31293a5c098faeebd7a9a2ae860976e60e602c3fa5da868328745f8da4':
        raise ValueError('Source changed: re-inspect manual cuff and lower-garment regions.')
    base=Image.open(FOLDER/'layers/base.png').convert('RGBA')
    top=np.array(Image.open(FOLDER/'layers/top.png').convert('RGBA'))
    edited=Image.open(out/'ai-edit.png').convert('RGB').resize(base.size,Image.Resampling.LANCZOS)
    rgb=np.array(edited);r,g,b=[rgb[:,:,i].astype(int) for i in range(3)]
    # Cuff artwork only. Generated skin is excluded; underlying wrist/hand is original.
    navy=(b>r+8)&(b>g+2)
    red=(r>b*1.5)&(g<95)
    for x0,x1 in [(250,355),(720,830)]:
        region=np.zeros(r.shape,bool);region[920:990,x0:x1]=True
        cloth=(navy|red)&region
        cloth=ndi.binary_fill_holes(cloth)
        top[region]=0
        top[cloth,:3]=rgb[cloth];top[cloth,3]=255
    # Isolate the lower clothes using border-connected cream background, preserving
    # enclosed white cloth and beige soles. These inspected coordinates are not anatomy.
    y0=1450
    local=rgb[y0:];lr,lg,lb=[local[:,:,i].astype(int) for i in range(3)]
    cream=(lr>205)&(lg>195)&(lb>175)&(lr-lb>9)&(lg-lb>4)
    seed=np.zeros(cream.shape,bool);seed[0]=cream[0];seed[-1]=cream[-1]
    seed[:,0]=cream[:,0];seed[:,-1]=cream[:,-1]
    background=ndi.binary_propagation(seed,mask=cream)
    fg=~background
    # Restrict to the inspected lower garment silhouette; remove blue tunic pixels.
    fg[(lb>lr+8)&(lb>lg+2)]=False
    labels,_=ndi.label(fg);counts=np.bincount(labels.ravel());counts[0]=0
    keep=np.flatnonzero(counts>1000);fg=np.isin(labels,keep)
    white=(lr>135)&(lg>135)&(lb>125)&fg
    # Filled bright components form the trousers; black outlines retained by expansion.
    labels,_=ndi.label(white);counts=np.bincount(labels.ravel());counts[0]=0
    pants=np.isin(labels,np.flatnonzero(counts>3000))
    pants=ndi.binary_dilation(ndi.binary_fill_holes(pants),iterations=2)&fg
    shoes=fg&~pants
    shoes[:260]=False
    layers={'base':base,'shoes':None,'bottom':None,'top':Image.fromarray(top)}
    for name,mask in [('bottom',pants),('shoes',shoes)]:
        a=np.zeros((*r.shape,4),np.uint8);a[y0:,:,:3]=local
        a[y0:,:,3]=mask.astype(np.uint8)*255
        if name=='bottom':
            original=np.array(Image.open(FOLDER/'layers/bottom.png').convert('RGBA'))
            a[:y0]=original[:y0]
        layers[name]=Image.fromarray(a)
    # Shoe-specific occlusion: the illustrated shoe replaces the visible bare foot.
    # Keep original base intact; apply this reversible mask only while shoes are worn.
    visibility=np.full(r.shape,255,np.uint8);visibility[1710:]=0
    Image.fromarray(visibility).save(out/'shoe-body-visibility.png')
    visible_base=np.array(base);visible_base[:,:,3]=np.minimum(visible_base[:,:,3],visibility)
    Image.fromarray(visible_base).save(out/'layers/base-with-shoes.png')
    composite=Image.new('RGBA',base.size)
    for name,im in layers.items():
        im.save(out/'layers'/f'{name}.png')
        composite.alpha_composite(Image.fromarray(visible_base) if name=='base' else im)
    composite.save(out/'composite.png')
    bg=Image.new('RGBA',base.size,'#eee6da');bg.alpha_composite(composite)
    bg.convert('RGB').save(out/'preview.jpg',quality=95)
    report={'status':'REVIEW_REQUIRED','source_sha256':hashlib.sha256((out/'ai-edit.png').read_bytes()).hexdigest(),
            'base_pixel_identical':base.tobytes()==Image.open(FOLDER/'layers/base.png').convert('RGBA').tobytes(),
            'collar_and_face_unchanged':composite.crop((400,80,680,450)).tobytes()==Image.open(FOLDER/'composite.png').convert('RGBA').crop((400,80,680,450)).tobytes(),
            'manual_cuff_regions':[[250,920,355,990],[720,920,830,990]],
            'shoe_body_visibility_mask':'shoe-body-visibility.png; applies only with shoes, below y=1710',
            'note':'Source-specific recovery; original base preserved, bare feet masked while shoes active. No generated hand/face pixels adopted. Visual acceptance pending.'}
    (out/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(report)

if __name__=='__main__':run()
