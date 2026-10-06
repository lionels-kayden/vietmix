"""One-outfit fitting study. Do not propagate to catalog before visual acceptance."""
from pathlib import Path
import json
import hashlib
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
from image_core import CANVAS,bbox,keep_components
from fit_auto import place,place_shoes,measure_base

ROOT=Path(__file__).resolve().parents[1]


def fit_shoulders(top,base):
    """Fit actual garment shoulder contour to the actual fixed body contour."""
    a=np.array(top).astype(float)/255;b=np.array(base.getchannel('A'))>240
    delta=np.zeros(CANVAS[0])
    for x in range(300,781):
        if 485<=x<=595: continue  # retain the collar, fit the shoulder slopes only
        skin=np.flatnonzero(b[350:550,x]);cloth=np.flatnonzero(a[350:550,x,3]>.95)
        if len(skin) and len(cloth): delta[x]=max(0,cloth[0]-skin[0]+7)
    delta=np.minimum(ndi.gaussian_filter1d(delta,6),58)
    y,x=np.mgrid[:CANVAS[1],:CANVAS[0]]
    fade=np.clip((740-y)/210,0,1)
    coords=np.array([y+delta[x]*fade,x])
    alpha=ndi.map_coordinates(a[:,:,3],coords,order=1,mode='constant')
    rgb=np.stack([ndi.map_coordinates(a[:,:,c]*a[:,:,3],coords,order=1,mode='constant') for c in range(3)],axis=2)
    rgb=np.divide(rgb,alpha[:,:,None],out=np.zeros_like(rgb),where=alpha[:,:,None]>0)
    result=Image.fromarray((np.clip(np.dstack((rgb,alpha)),0,1)*255).round().astype(np.uint8))
    return result,delta


def run(root=ROOT):
    folder=root/'reports/p3a-single-A';(folder/'layers').mkdir(exist_ok=True)
    source=folder/'source/top-ai-v1.png'
    base=Image.open(root/'reports/p3a/extracted/male_base.png').convert('RGBA')
    top=keep_components(Image.open(source).convert('RGBA'),.01)
    crop=bbox(top);top=top.crop(crop)
    fit={'x':260,'y':350,'scale':560/top.width}
    top=place(top,fit)
    top,shoulder_delta=fit_shoulders(top,base)
    polish=folder/'source/registered-cloth-v2.png'
    if polish.exists():
        # Recover only garment pixels; generated face/body/pants are NEVER adopted.
        registered=Image.open(polish).convert('RGB')
        button_edit=folder/'source/buttons-edit-v3.png'
        if button_edit.exists():
            edited=Image.open(button_edit).convert('RGB').resize(registered.size,Image.Resampling.LANCZOS)
            yy,xx=np.mgrid[:registered.height,:registered.width]
            blend=np.zeros(yy.shape)
            for cx,cy in [(397,388),(349,688)]:
                distance=np.sqrt((xx-cx)**2+(yy-cy)**2)
                blend=np.maximum(blend,np.clip((14-distance)/3,0,1))
            original=np.array(registered).astype(float);replacement=np.array(edited).astype(float)
            registered=Image.fromarray((original*(1-blend[:,:,None])+replacement*blend[:,:,None]).round().astype(np.uint8))
        registered=registered.resize(CANVAS,Image.Resampling.LANCZOS)
        rgb=np.array(registered).astype(int)
        blue=(rgb[:,:,2]>rgb[:,:,0]+12)&(rgb[:,:,2]>rgb[:,:,1]+3)
        blue[:300]=False;blue[1550:]=False
        labels,_=ndi.label(blue);counts=np.bincount(labels.ravel());counts[0]=0
        solid=labels==counts.argmax()
        solid=ndi.binary_fill_holes(ndi.binary_closing(solid,iterations=2))
        # Gold motifs on the OUTER contour are not blue and are not enclosed holes.
        # Use the registered transparent draft silhouette as an explicit shape prior.
        prior=np.array(top.getchannel('A'))>127
        solid|=prior
        background=(rgb[:,:,0]>230)&(rgb[:,:,1]>220)&(rgb[:,:,2]>205)
        solid[background]=False
        neck_skin=(rgb[:,:,0]>rgb[:,:,2]*1.3)&(rgb[:,:,0]>rgb[:,:,1]+25)
        neck_skin[420:]=False
        solid[neck_skin]=False
        red=(rgb[:,:,0]>rgb[:,:,2]*1.6)&(rgb[:,:,1]<70)
        red[:920]=False;red[985:]=False
        solid|=red&ndi.binary_dilation(solid,iterations=20)
        solid=ndi.binary_dilation(solid,iterations=1)
        alpha=solid.astype(np.uint8)*255
        top=Image.fromarray(np.dstack((rgb.astype(np.uint8),alpha)))
        source=polish
    pants_source=Image.open(root/'reports/p3a/extracted/M_COMMON_BOTTOM_quan_lua_trang.png').convert('RGBA')
    pants_scale=(1775-750)/pants_source.height
    pants=place(pants_source,{'x':(1080-pants_source.width*pants_scale)/2,'y':750,'scale':pants_scale})
    shoe_source=Image.open(root/'reports/p3a/extracted/M_COMMON_SHOES_giay_vai_den.png').convert('RGBA')
    _,shoe_parts=place_shoes(shoe_source,base,measure_base(base))
    shoes=Image.new('RGBA',CANVAS)
    for part in shoe_parts:
        piece=shoe_source.crop(part['source_box']);s=part['scale']*1.14
        shoe_fit={'x':part['x']-piece.width*(s-part['scale'])/2,
                  'y':part['y']+piece.height*part['scale']+4-piece.height*s,'scale':s}
        shoes.alpha_composite(place(piece,shoe_fit))
    layers={'base':base,'shoes':shoes,'bottom':pants,'top':top}
    result=Image.new('RGBA',CANVAS)
    for name,im in layers.items():
        im.save(folder/'layers'/f'{name}.png');result.alpha_composite(im)
    result.save(folder/'composite.png')
    bg=Image.new('RGBA',CANVAS,'#eee6da');bg.alpha_composite(result)
    bg.convert('RGB').save(folder/'preview.jpg',quality=95)
    body=ndi.binary_erosion(np.array(base.getchannel('A'))>240,iterations=2)
    missing=body & (np.array(top.getchannel('A'))<240)
    missing[:420]=False;missing[925:]=False
    report={'status':'SINGLE_OUTFIT_REVIEW','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
            'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (folder/'source').glob('*.png')},
            'geometry_prior_crop':crop,'geometry_prior_fit':fit,'output_transform':{'x':0,'y':0,'scale':1},
            'method':'AI garment draft, body-contour fit, localized AI polish, garment-only extraction; original base retained',
            'uncovered_body_pixels_in_arm_torso_roi':int(missing.sum()),
            'shoulder_lift_max_px':float(shoulder_delta.max()),
            'shoulder_lift_per_column':shoulder_delta.round(3).tolist(),
            'roi':[0,420,1080,925],'base_unchanged':True,'user_approved':False,
            'note':'ROI is a manually chosen diagnostic, not automatic aesthetic approval.'}
    (folder/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print({k:v for k,v in report.items() if k!='shoulder_lift_per_column'})


if __name__=='__main__':run()
