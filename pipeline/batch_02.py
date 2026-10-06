"""Recover fitted B/C garment layers; keep accepted base and lower outfit exact."""
from pathlib import Path
import hashlib,json,shutil
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage as ndi

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'reports/p3a-batch-02'
ACCEPTED=ROOT/'reports/p3a-single-A/v2'
LOWER=ROOT/'reports/p3a-lower-v3'
HASHES={
 'B/source.png':'a318c2e7d51be03d4ca2b51a912e1977ab09bce042384e98aa1b2c17acd7591e',
 'C/source.png':'6adccb3a26528f141de1921aa89dc37b050b19a2ec8074229a2ddca6c4f9e9e6',
 'B/button-edit.png':'b3a178bd63b9c0b8a1e3a6d7b4d5b19346a3be62668b7cc2c45a0cdb639d8853'}

def largest(mask):
    labels,_=ndi.label(mask);counts=np.bincount(labels.ravel());counts[0]=0
    if counts.max()==0:raise ValueError('No garment component')
    return labels==counts.argmax()

def recover(code):
    folder=OUT/code;(folder/'layers').mkdir(exist_ok=True)
    for relative,expected in HASHES.items():
        if relative.startswith(code+'/') and hashlib.sha256((OUT/relative).read_bytes()).hexdigest()!=expected:
            raise ValueError('Source changed: re-inspect manual garment regions')
    im=Image.open(folder/'source.png').convert('RGB')
    if code=='B':
        edited=Image.open(folder/'button-edit.png').convert('RGB').resize(im.size)
        yy,xx=np.mgrid[:im.height,:im.width]
        mix=np.clip((13-np.hypot(xx-350,yy-658))/3,0,1)[:,:,None]
        im=Image.fromarray((np.array(im)*(1-mix)+np.array(edited)*mix).round().astype(np.uint8))
    rgb=np.array(im.resize((1080,1920),Image.Resampling.LANCZOS))
    r,g,b=[rgb[:,:,i].astype(int) for i in range(3)]
    area=np.zeros(r.shape,bool);area[320:1540,195:885]=True
    cloth=((b>r+8)&(b>g+2)) if code=='B' else ((r<155)&(g<155)&(b<155))
    if code=='B':
        red=(r>g*1.4)&(r>b*1.4)&(g<110)
        cloth|=red
    mask=largest(cloth&area)
    mask=ndi.binary_fill_holes(ndi.binary_closing(mask,iterations=2))
    # Preserve small edge trim and gold details adjacent to the cloth, not background.
    warm=(r>g+20)&(g>b+10)&(r>100)
    adjacent=ndi.binary_dilation(mask,iterations=2)
    foreground=rgb.min(axis=2)<190
    mask|=adjacent&foreground&~warm
    if code=='B':
        red=(r>g*1.4)&(r>b*1.4)&(g<110)
        mask|=red&ndi.binary_dilation(mask,iterations=8)&area
    # Open the collar and cuffs; no generated skin is adopted into a garment.
    skin_zone=np.zeros(r.shape,bool);skin_zone[300:392,450:630]=True
    skin_zone[945:1130,250:370]=True;skin_zone[945:1130,710:830]=True
    mask[(warm|(rgb.min(axis=2)>190))&skin_zone]=False
    # Closed arm/torso gaps must remain holes, not cream pixels baked into the robe.
    light=(rgb.min(axis=2)>205)&area
    labels,_=ndi.label(light);counts=np.bincount(labels.ravel());counts[0]=0
    mask[np.isin(labels,np.flatnonzero(counts>500))]=False
    mask=largest(mask&area)
    rgba=np.dstack((rgb,mask.astype(np.uint8)*255))
    top=Image.fromarray(rgba);top.save(folder/'layers/top.png')
    Image.fromarray(mask.astype(np.uint8)*255).save(folder/'top-mask.png')
    for name in ('base','base-with-shoes','bottom','shoes'):
        shutil.copyfile(LOWER/'layers'/f'{name}.png',folder/'layers'/f'{name}.png')
    shutil.copyfile(LOWER/'shoe-body-visibility.png',folder/'shoe-body-visibility.png')
    composite=Image.new('RGBA',(1080,1920))
    for name in ('base-with-shoes','shoes','bottom','top'):
        composite.alpha_composite(Image.open(folder/'layers'/f'{name}.png').convert('RGBA'))
    composite.save(folder/'composite.png')
    for color,name in [('#eee6da','preview'),('#383a40','dark')]:
        bg=Image.new('RGBA',composite.size,color);bg.alpha_composite(composite)
        bg.convert('RGB').save(folder/f'{name}.jpg',quality=95)
    report={'status':'REVIEW_REQUIRED','code':code,
      'source_hashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.glob('*.png') if p.name in ('source.png','button-edit.png')},
      'lower_outfit':'Complete standalone pants/shoes from p3a-lower-v3; user review pending',
      'manual_regions':{'garment':[195,320,885,1540],'neck':[450,300,630,392],
                        'hands':[[250,945,370,1130],[710,945,830,1130]]},
      'kind_source':'User filename; visual/history validity unverified',
      'limitations':['Source-specific garment extraction','AI motifs/folds adapted; originals preserved','Not approved for arbitrary combinations']}
    (folder/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    return composite

def run():
    images=[recover(code) for code in ('B','C')]
    sheet=Image.new('RGB',(1080,1020),'#eee6da');draw=ImageDraw.Draw(sheet)
    for i,(code,im) in enumerate(zip(('B','C'),images)):
        bg=Image.new('RGBA',im.size,'#eee6da');bg.alpha_composite(im)
        sheet.paste(bg.convert('RGB').resize((540,960)),(540*i,40))
        draw.text((540*i+20,15),f'NAM {code} - REVIEW',fill='#302b29')
    sheet.save(OUT/'review-pair.jpg',quality=95)
    detail=Image.new('RGB',(1200,550),'#eee6da');draw=ImageDraw.Draw(detail)
    for i,(code,im) in enumerate(zip(('B','C'),images)):
        for j,(color,box) in enumerate([('#eee6da',(235,900,380,1140)),('#383a40',(700,900,850,1140))]):
            crop=im.crop(box);bg=Image.new('RGBA',crop.size,color);bg.alpha_composite(crop)
            detail.paste(bg.convert('RGB').resize((300,480)),(i*600+j*300,45))
            draw.text((i*600+j*300+12,15),f'{code} - '+('LEFT' if j==0 else 'RIGHT / DARK'),fill='#302b29')
    detail.save(OUT/'cuffs-review.jpg',quality=95)
    shutil.copyfile(LOWER/'independent-review.jpg',OUT/'independent-review.jpg')

if __name__=='__main__':run()
