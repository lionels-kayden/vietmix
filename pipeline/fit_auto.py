"""Review-only measured fitting. No redraw, anisotropic warp, or automatic approval."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from image_core import bbox, CANVAS, components

ROOT=Path(__file__).resolve().parents[1]


def row_span(mask, y, center_only=False):
    row=mask[int(np.clip(y,0,len(mask)-1))]
    if center_only:
        labels,n=ndi.label(row)
        # Torso is the component nearest the canvas center; arm components excluded.
        choices=[]
        for sl in ndi.find_objects(labels):
            l,r=sl[0].start,sl[0].stop
            choices.append((abs((l+r)/2-len(row)/2),l,r))
        if choices:
            _,l,r=min(choices); return l,r
    xs=np.flatnonzero(row)
    return (int(xs[0]),int(xs[-1])+1) if len(xs) else (0,0)


def measure_base(image):
    """Contour extrema inside broad search windows, not preset anatomical ratios.

    Search windows constrain anatomy heuristics; selected coordinates are measured
    pixel rows and explicitly unverified. Waist is NOT claimed to locate the navel.
    """
    m=np.array(image.getchannel('A'))>127
    x0,y0,x1,y1=bbox(image); h=y1-y0
    def find(lo,hi,mode,central=False):
        rows=range(round(y0+lo*h),round(y0+hi*h))
        vals=[(row_span(m,y,central)[1]-row_span(m,y,central)[0],y) for y in rows]
        vals=[v for v in vals if v[0]>0]
        return (min(vals) if mode=='min' else max(vals))[1]
    neck=find(.09,.21,'min',True)
    shoulder=find(.16,.27,'max')
    waist=find(.29,.44,'min',True)
    ankle=find(.88,.975,'min')
    sl,sr=row_span(m,shoulder); wl,wr=row_span(m,waist,True)
    return {'bbox':[x0,y0,x1,y1], 'height':h, 'center_x':(x0+x1)/2,
            'neck_y':neck,'shoulder_y':shoulder,'shoulder_width':sr-sl,
            'waist_y':waist,'waist_width':wr-wl,'ankle_y':ankle,
            'method':'contour-extrema heuristic; not verified anatomical landmarks',
            'needs_review':True,'navel_y':None}


def assess_mismatch(mismatch):
    return 'PASS' if mismatch < .10 else 'WARN' if mismatch <= .20 else 'FAIL'


def scale_disagreement(sx,sy):
    if min(sx,sy)<=0: raise ValueError('Scales must be positive')
    return abs(sx/sy-1)


def fit_item(garment, info, base):
    w,h=garment.size; slot=info['slot']; a=base
    ruler=a['height']/info['reference_height'] if info.get('reference_height') else None
    reason=[]; mismatch=0
    if slot=='top':
        scale=ruler
        if scale is None: raise ValueError('Top needs sheet reference height')
        mask=np.array(garment.getchannel('A'))>127
        # Measure width at the base's shoulder distance below neck in source pixels.
        row=max(1,round((a['shoulder_y']-a['neck_y'])/scale))
        l,r=row_span(mask,row)
        observed=max(r-l,1)*scale
        desired=a['shoulder_width']*1.03  # small garment ease, not a body landmark
        correction=desired/observed
        mismatch=abs(correction-1)
        # Uniform only: rejected cases still have a clearly labeled diagnostic preview.
        scale*=correction
        x=a['center_x']-w*scale/2; y=a['neck_y']
        reason.append('Shoulder/neck contour estimates require visual confirmation; cuffs and underwear coverage unverified.')
    elif slot=='bottom':
        mask=np.array(garment.getchannel('A'))>127
        # Median width of the top 5% handles curved waistband contours.
        spans=[row_span(mask,r)[1]-row_span(mask,r)[0] for r in range(max(2,round(h*.05)))]
        width=float(np.median([s for s in spans if s>0]))
        sx=a['waist_width']*1.05/width
        sy=(a['ankle_y']-a['waist_y'])/h
        mismatch=scale_disagreement(sx,sy)
        scale=sy  # Match measured hem length uniformly; report waist disagreement.
        x=a['center_x']-w*scale/2;y=a['waist_y']
        reason.append(f'Waist-vs-length scales {sx:.4f}/{sy:.4f}; uniform length fit used. Navel not detected.')
    elif slot=='shoes':
        # Output is a baked canvas with independently positioned pair components.
        x=0;y=0;scale=1
        reason.append('Separate measured foot placement; perspective requires review.')
        mismatch=.15
    else:
        x0,y0,x1,y1=a['bbox']
        if info['kind']=='non_la':
            scale=a['shoulder_width']*1.1/w;x=a['center_x']-w*scale/2;y=y0-h*scale*.22
        else:
            scale=a['height']*.09/h;x=a['center_x']+a['shoulder_width']*.06;y=y0+a['height']*.04
        reason.append('Accessory placement is a draft composition, not anatomical detection.')
        mismatch=.15
    numeric=assess_mismatch(mismatch)
    return {'x':x,'y':y,'scale':scale,'ruler_scale':ruler,'mismatch':round(mismatch,4),
            'numeric_status':numeric,'status':'FAIL' if numeric=='FAIL' else 'WARN',
            'approved':False,'needs_review':True,'reasons':reason}


def place(image,fit):
    canvas=Image.new('RGBA',CANVAS)
    size=(max(1,round(image.width*fit['scale'])),max(1,round(image.height*fit['scale'])))
    if max(size)>10000: raise ValueError('Unsafe draft scale')
    canvas.alpha_composite(image.resize(size,Image.Resampling.LANCZOS),(round(fit['x']),round(fit['y'])))
    return canvas


def place_shoes(image, base, anchors):
    """Split a pair and align each silhouette to one measured foot; uniform scale."""
    parts, labels = components(image)
    parts = sorted(parts[:2], key=lambda p:p['box'][0])
    foot_region = base.crop((0, anchors['ankle_y'], base.width, base.height))
    feet, _ = components(foot_region)
    feet = sorted(feet[:2], key=lambda p:p['box'][0])
    if len(parts)!=2 or len(feet)!=2:
        raise ValueError('Cannot resolve two shoes and two feet; manual review required')
    canvas=Image.new('RGBA',CANVAS); transforms=[]
    for part, foot in zip(parts,feet):
        rgba=np.array(image)
        rgba[~ndi.binary_dilation(labels==part['label'],iterations=2),3]=0
        shoe=Image.fromarray(rgba).crop(part['box'])
        l,t,r,b=foot['box']; t+=anchors['ankle_y']; b+=anchors['ankle_y']
        scale=max((r-l)/shoe.width,(b-t)/shoe.height)
        fit={'x':(l+r-shoe.width*scale)/2,'y':b-shoe.height*scale,'scale':scale}
        canvas.alpha_composite(place(shoe,fit))
        transforms.append({**fit,'source_box':list(part['box']),'foot_box':[l,t,r,b]})
    return canvas,transforms


def run(root=ROOT):
    folder=root/'reports/p3a'; extracted=folder/'extracted'
    rows=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
    bases={g:Image.open(extracted/f'{g}_base.png').convert('RGBA') for g in ['male','female']}
    anchors={g:measure_base(im) for g,im in bases.items()}
    layers=folder/'layers';layers.mkdir(exist_ok=True)
    previews=folder/'previews';previews.mkdir(exist_ok=True)
    fitted={}
    for row in rows:
        g='male' if row['gender']=='M' else 'female'
        im=Image.open(extracted/row['target']).convert('RGBA')
        fit=fit_item(im,row,anchors[g]); fitted[row['id']]={**fit,'slot':row['slot'],'gender':g}
        if row['slot']=='shoes':
            layer,parts=place_shoes(im,bases[g],anchors[g])
            fitted[row['id']].update(x=0,y=0,scale=1,part_transforms=parts,
                reasons=['Each shoe uniformly fitted to a measured foot. Perspective and toe coverage need visual review.'])
        else:
            layer=place(im,fit)
        fitted[row['id']]['layer_transform']={'x':0,'y':0,'scale':1}
        fitted[row['id']]['transform_space']='extracted source; layers output is already baked to canvas'
        layer.save(layers/row['target'])
        preview=Image.new('RGBA',CANVAS,'#eee6da');preview.alpha_composite(bases[g]);preview.alpha_composite(layer)
        d=ImageDraw.Draw(preview);d.text((20,20),row['id']+' '+fit['status']+' (DRAFT)',fill='black')
        preview.convert('RGB').resize((540,960)).save(previews/(row['id']+'.jpg'),quality=90)
    # Compose the six named sets from real layers where available, with explicit drafts.
    set_files=[]
    for g,p in [('male','M'),('female','F')]:
        for code,kind in [('A','ao_ngu_than'),('B','ao_giao_linh'),('C','ao_tac' if g=='male' else 'ao_nhat_binh')]:
            ids=[f'{p}_COMMON_SHOES_giay_vai_den',f'{p}_B_BOTTOM_vay_dai' if g=='female' and code=='B' else f'{p}_COMMON_BOTTOM_quan_lua_trang',f'{p}_{code}_TOP_{kind}']
            preview=Image.new('RGBA',CANVAS,'#eee6da');preview.alpha_composite(bases[g])
            statuses=[]
            for i in ids:
                path=layers/(i+'.png')
                if path.exists(): preview.alpha_composite(Image.open(path));statuses.append(fitted[i]['status'])
            name=f'{p}-set-{code}'
            ImageDraw.Draw(preview).text((25,20),name+' DRAFT '+('/'.join(statuses)),fill='black')
            path=previews/(name+'.jpg');preview.convert('RGB').resize((540,960)).save(path,quality=92);set_files.append(path)
    sheet=Image.new('RGB',(1620,1920),'#eee6da')
    for n,p in enumerate(set_files): sheet.paste(Image.open(p),(n%3*540,n//3*960))
    sheet.save(folder/'outfits-draft.jpg',quality=92)
    (folder/'anchors-draft.json').write_text(json.dumps(anchors,indent=2)+'\n',encoding='utf-8')
    (folder/'fit-report.json').write_text(json.dumps(fitted,indent=2)+'\n',encoding='utf-8')
    print('Draft fit report:',{s:sum(v['status']==s for v in fitted.values()) for s in ['PASS','WARN','FAIL']})


if __name__=='__main__': run()
