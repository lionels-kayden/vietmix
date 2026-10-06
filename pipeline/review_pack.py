"""Reproducible candidate layers and exhaustive available-art review, not promotion."""
import hashlib
import itertools
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from scipy import ndimage as ndi
from image_core import CANVAS, bbox, components
from fit_auto import place, place_shoes, measure_base

ROOT=Path(__file__).resolve().parents[1]

# Explicit art-direction placements, not automatically detected anatomical facts.
# Kept separate from the original heuristic report and production assets.
TOPS={
 'M_A_TOP_ao_ngu_than':(560,330),
 'M_B_TOP_ao_giao_linh':(570,330),
 'M_C_TOP_ao_tac':(640,330),
 'F_A_TOP_ao_ngu_than':(450,300),
 'F_B_TOP_ao_giao_linh':(570,305),
 'F_C_TOP_ao_nhat_binh':(530,305),
}
LABELS={
 'M_A_TOP_ao_ngu_than':'Áo xanh chàm · A', 'M_B_TOP_ao_giao_linh':'Áo xanh viền đỏ · B',
 'M_C_TOP_ao_tac':'Áo đen tay rộng · C', 'F_A_TOP_ao_ngu_than':'Áo xanh lá · A',
 'F_B_TOP_ao_giao_linh':'Áo hồng · B', 'F_C_TOP_ao_nhat_binh':'Áo Nhật Bình đỏ · C',
 'quan_lua_trang':'Quần trắng', 'quan_lua_trang_v02':'Quần đen', 'vay_dai':'Váy đen',
 'giay_vai_den':'Giày vải đen', 'giay_vai_den_v02':'Giày vải trắng',
 'giay_sneaker':'Giày sneaker trắng', 'non_la':'Nón lá', 'tram_cai':'Trâm cài',
}


def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()


def combinations(rows, gender):
    groups=[[r for r in rows if r['gender']==gender and r['slot']==slot]
            for slot in ('top','bottom','shoes')]
    return list(itertools.product(*groups))


def compose(base,layers):
    result=base.copy()
    for layer in layers:
        if layer.size!=CANVAS: raise ValueError('Every layer must share canvas dimensions')
        result.alpha_composite(layer)
    return result


def neckline_mask(layer,base,gender):
    """Head/upper neck is in front of rear collar; remove occluded garment only.

    Explicit per-base art annotation. Never bake skin into a garment.
    """
    a=np.array(layer);body=np.array(base)
    stop=335
    mask=np.zeros(a.shape[:2],dtype=np.uint8)
    mask[:stop]=body[:stop,:,3]
    a[:,:,3]=(a[:,:,3].astype(float)*(1-mask/255)).round().astype(np.uint8)
    return Image.fromarray(a),Image.fromarray(mask)


def aperture_masks(source,fit,base,id):
    """Inspected openings only; mask the portion occupied by actual base pixels."""
    mask=Image.new('RGBA',source.size);d=ImageDraw.Draw(mask)
    w,h=source.size
    if id=='M_A_TOP_ao_ngu_than':
        d.ellipse((5,642,76,656),fill='white');d.ellipse((w-76,642,w-5,656),fill='white')
    elif id=='M_B_TOP_ao_giao_linh':
        points=[(12,1055),(40,1029),(92,1005),(133,1007),(143,1016),(122,1040),(80,1062),(32,1070)]
        d.polygon(points,fill='white');d.polygon([(w-x,y) for x,y in points],fill='white')
    elif id=='F_C_TOP_ao_nhat_binh':
        d.ellipse((7,428,76,444),fill='white');d.ellipse((w-76,428,w-7,444),fill='white')
        d.polygon([(149,5),(191,5),(186,68),(155,68)],fill='white')
    elif id=='F_B_TOP_ao_giao_linh':
        d.polygon([(183,5),(238,5),(234,31),(212,79),(190,33)],fill='white')
    projected=np.array(place(mask,fit).getchannel('A')).astype(float)/255
    body=np.array(base.getchannel('A')).astype(float)/255
    return Image.fromarray((projected*body*255).round().astype(np.uint8))


def hand_overlay(base,id):
    overlay=Image.new('RGBA',CANVAS)
    if id=='M_C_TOP_ao_tac':
        # Generated cuff aperture was inspected at y~936..984 in this base's canvas.
        # Reveal only fingers/hand continuing below the opening, not the whole arm.
        points=[(260,1040),(293,987),(354,943),(380,1000),(380,1125),(260,1125)]
        mask=Image.new('L',CANVAS);d=ImageDraw.Draw(mask)
        d.polygon(points,fill=255);d.polygon([(1080-x,y) for x,y in points],fill=255)
        a=np.array(base);a[:,:,3]=np.minimum(a[:,:,3],np.array(mask));overlay=Image.fromarray(a)
    elif id=='F_C_TOP_ao_nhat_binh':
        for box in [(320,998,402,1085),(678,998,760,1085)]:
            overlay.paste(base.crop(box),box[:2])
    return overlay


def sleeve_ease(layer,base):
    """At most 15% lateral sleeve ease, preserving detached arm gaps and source RGB."""
    src=np.array(layer).astype(float)/255;body=np.array(base.getchannel('A'))>127
    ygrid,xgrid=np.mgrid[:CANVAS[1],:CANVAS[0]];inverse=xgrid.astype(float)
    def spans(row):
        labels,_=ndi.label(row)
        return [(s[0].start,s[0].stop) for s in ndi.find_objects(labels) if s[0].stop-s[0].start>10]
    for y in range(540,940):
        cloth=spans(src[y,:,3]>.5);skin=spans(body[y])
        if len(cloth)!=3 or len(skin)!=3: continue
        blend=min(1,(y-540)/50,(940-y)/35)
        for idx in (0,2):
            l,r=cloth[idx];bl,br=skin[idx];allow=(r-l)*.15*blend
            dl=max(0,l-bl+2);dr=max(0,br-r+2);total=dl+dr
            if total>allow: dl*=allow/total;dr*=allow/total
            nl,nr=l-dl,r+dr
            xs=np.arange(max(0,int(np.ceil(nl))),min(CANVAS[0],int(nr)))
            inverse[y,xs]=l+(xs-nl)*(r-l)/(nr-nl)
    coords=np.array([ygrid,inverse]);alpha=ndi.map_coordinates(src[:,:,3],coords,order=1,mode='constant')
    rgb=np.stack([ndi.map_coordinates(src[:,:,c]*src[:,:,3],coords,order=1,mode='constant') for c in range(3)],axis=2)
    rgb=np.divide(rgb,alpha[:,:,None],out=np.zeros_like(rgb),where=alpha[:,:,None]>0)
    return Image.fromarray((np.clip(np.dstack((rgb,alpha)),0,1)*255).round().astype(np.uint8))


def shoulder_adjust(layer,gender):
    """Small smooth shoulder lift; reversible source mapping, no painted pixels."""
    a=np.array(layer).astype(float)/255
    y,x=np.mgrid[:CANVAS[1],:CANVAS[0]]
    centers=(370,710) if gender=='M' else (415,665)
    amplitude=40 if gender=='M' else 12
    offset=amplitude*sum(np.exp(-((x-c)/95)**2) for c in centers)*np.exp(-((y-435)/145)**2)
    coords=np.array([y+offset,x])
    premult=a[:,:,:3]*a[:,:,3,None]
    alpha=ndi.map_coordinates(a[:,:,3],coords,order=1,mode='constant',cval=0)
    rgb=np.stack([ndi.map_coordinates(premult[:,:,c],coords,order=1,mode='constant',cval=0) for c in range(3)],axis=2)
    rgb=np.divide(rgb,alpha[:,:,None],out=np.zeros_like(rgb),where=alpha[:,:,None]>0)
    return Image.fromarray((np.clip(np.dstack((rgb,alpha)),0,1)*255).round().astype(np.uint8))


def opaque_preview(image, size=(360,640)):
    background=Image.new('RGBA',CANVAS,'#eee6da')
    background.alpha_composite(image)
    return background.convert('RGB').resize(size,Image.Resampling.LANCZOS)


def write_gallery(folder, report):
    data=json.dumps(report,ensure_ascii=False).replace('<','\\u003c')
    html='''<!doctype html><html lang="vi"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Việt Mix · Duyệt lớp ảnh</title><style>
*{box-sizing:border-box}body{margin:0;background:#f3ecdf;color:#302b29;font:16px system-ui}
header,main{max-width:1200px;margin:auto;padding:20px}h1{font-family:Georgia,serif}
.layout{display:grid;grid-template-columns:minmax(240px,420px) 1fr;gap:24px}
.stage{position:relative;aspect-ratio:9/16;background:#eee6da;border:1px solid #bdb2a2;border-radius:18px;overflow:hidden}
.stage img{position:absolute;width:100%;height:100%;inset:0;object-fit:contain}
label{display:block;margin:12px 0}select,button{padding:12px;border-radius:10px;border:1px solid #bdb2a2;background:#fff9f0;max-width:100%;font:inherit}
select{width:100%}button{cursor:pointer}aside{background:#fff9f0;padding:20px;border-radius:18px}
.notice{color:#8b332e}#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.card{padding:8px;border:1px solid #bdb2a2;background:#fff9f0;border-radius:12px;text-align:left}
.card img{width:100%;border-radius:8px}.card small{display:block}a{color:#803127}
@media(max-width:700px){.layout{grid-template-columns:1fr}.stage{max-height:75vh;margin:auto;width:min(100%,400px)}}
</style><header><h1>Duyệt lớp ảnh · Việt Mix</h1>
<p>Bản ghép từ PNG độc lập, giữ nguyên hai nhân vật gốc. Đây là ứng viên để kiểm tra, chưa phải bộ ảnh đạt.</p>
<p class="notice">Ứng viên đang thẩm định: kiểm kỹ vai, cửa tay và tỷ lệ. Phối được bằng ảnh không đồng nghĩa phù hợp văn hóa.</p>
</header><main><div class="layout"><div id="stage" class="stage"></div><aside>
<label>Nhân vật<select id="gender"><option value="M">Nam</option><option value="F">Nữ</option></select></label>
<div id="controls"></div><label>Nền kiểm tra<select id="bg"><option value="#eee6da">Kem</option><option value="#303a48">Tối</option><option value="#ffffff">Trắng</option></select></label>
<button id="download">Tải bản ghép PNG</button><p id="detail"></p>
<p>Thử tháo từng món; quan sát vai, cổ, bàn tay, đồ lót, gấu quần và mép giày. Phụ kiện cũng có thể bật riêng.</p>
<a href="report.json">Báo cáo kỹ thuật</a> · <a href="references/approved-style.png">Mẫu thẩm mỹ đã duyệt</a>
</aside></div><h2>Toàn bộ tổ hợp chính</h2><div id="grid"></div></main><script>
const data=__DATA__; const slots=['shoes','bottom','top','head'];
const names={top:'Áo',bottom:'Quần / váy',shoes:'Giày',head:'Phụ kiện đầu'};
let chosen={};const $=id=>document.getElementById(id);
function render(){const g=$('gender').value;const stage=$('stage');stage.replaceChildren();
 const base=document.createElement('img');base.src=`layers/${g}_base.png`;base.alt='Nhân vật gốc';stage.append(base);
 for(const slot of slots){const id=chosen[slot];if(!id)continue;const im=document.createElement('img');im.src=`layers/${id}.png`;im.alt=id;stage.append(im);
 const item=data.items.find(i=>i.id===id);if(item.foreground){const fg=document.createElement('img');fg.src=item.foreground;fg.alt='Phần bàn tay phía trước cửa tay';stage.append(fg)}}
 $('detail').textContent=slots.filter(s=>chosen[s]).map(s=>data.items.find(i=>i.id===chosen[s]).review_note).join(' ');
}
function setup(){chosen={};$('controls').replaceChildren();const g=$('gender').value;
 for(const slot of slots){const label=document.createElement('label');label.textContent=names[slot];const select=document.createElement('select');select.id='pick-'+slot;
 const empty=document.createElement('option');empty.value='';empty.textContent='Không mặc';select.append(empty);
 select.setAttribute('aria-label',names[slot]);const rows=data.items.filter(i=>i.gender===g&&i.slot===slot);for(const r of rows){const o=document.createElement('option');o.value=r.id;o.textContent=r.label;select.append(o)}
 chosen[slot]=slot==='head'?'':rows[0]?.id||'';select.value=chosen[slot];select.onchange=()=>{chosen[slot]=select.value;render()};label.append(select);$('controls').append(label)}
 $('grid').replaceChildren();for(const combo of data.combinations.filter(c=>c.gender===g)){const b=document.createElement('button');b.className='card';
 const im=document.createElement('img');im.src=combo.preview;im.loading='lazy';im.alt=combo.id;const text=document.createElement('small');text.textContent=combo.id+' · CẦN DUYỆT';b.append(im,text);
 b.onclick=()=>{for(const slot of slots){chosen[slot]=combo[slot]||'';$('pick-'+slot).value=chosen[slot]}render();$('stage').scrollIntoView({behavior:'smooth'})};$('grid').append(b)}render();}
 $('gender').onchange=setup;$('bg').onchange=()=>{$('stage').style.background=$('bg').value};
 $('download').onclick=async()=>{try{const c=document.createElement('canvas');c.width=1080;c.height=1920;const ctx=c.getContext('2d');
 for(const im of $('stage').querySelectorAll('img')){await im.decode();ctx.drawImage(im,0,0,1080,1920)}
 c.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='vietmix-candidate.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)})
 }catch(e){$('detail').textContent='Không xuất được ảnh. Mở trang qua máy chủ local và kiểm tra các lớp ảnh.'}};setup();
</script></html>'''.replace('__DATA__',data)
    (folder/'index.html').write_text(html,encoding='utf-8')


def run(root=ROOT):
    folder=root/'reports/p3a-review';(folder/'layers').mkdir(parents=True,exist_ok=True)
    (folder/'masks').mkdir(exist_ok=True)
    (folder/'foreground').mkdir(exist_ok=True)
    (folder/'combinations').mkdir(exist_ok=True)
    extracted=root/'reports/p3a/extracted'
    rows=json.loads((root/'reports/p3a/manifest.json').read_text(encoding='utf-8'))
    base={g:Image.open(extracted/f'{name}_base.png').convert('RGBA') for g,name in [('M','male'),('F','female')]}
    for g,im in base.items(): im.save(folder/'layers'/f'{g}_base.png')
    report={'status':'REVIEW_REQUIRED','method':'Versioned original and AI-assisted candidates; provenance per item',
            'base_hashes':{g:sha(extracted/f'{name}_base.png') for g,name in [('M','male'),('F','female')]},
            'items':[],'combinations':[],
            'missing':['male modern trousers','female modern trousers','male necklace','female necklace','female conical hat'],
            'approval':{'style_reference':True,'layers':False,'phase':False}}
    layers={};foreground={}
    for row in rows:
        source=folder/'generated'/row['target']
        generated=source.exists()
        if not generated: source=extracted/row['target']
        im=Image.open(source).convert('RGBA');g=row['gender'];slot=row['slot'];id=row['id']
        if generated: im=im.crop(bbox(im))
        if id=='F_B_BOTTOM_vay_dai':
            # Actual source has a disconnected hand fragment joined only by faint
            # opaque background. Restrict to inspected skirt polygon, preserving hem.
            mask=Image.new('L',im.size);d=ImageDraw.Draw(mask)
            d.polygon([(125,0),(300,0),(418,675),(300,705),(80,705),(0,675),(95,90)],fill=255)
            rgba=np.array(im);rgba[:,:,3]=np.minimum(rgba[:,:,3],np.array(mask));im=Image.fromarray(rgba)
        fit=None;parts=None
        if slot=='top':
            width,y=TOPS[id];scale=width/im.width
            fit={'x':(1080-width)/2,'y':y,'scale':scale}
            note='Áo: kiểm vai, cổ và cửa tay; chưa duyệt phom.'
        elif slot=='bottom':
            waist,hem=(750,1775) if g=='M' else (735,1775)
            scale=(hem-waist)/im.height
            fit={'x':(1080-im.width*scale)/2,'y':waist,'scale':scale}
            note=('Quần nữ: ứng viên AI sửa phom; cần duyệt chất vải và độ rộng.' if generated else
                  'Váy: giữ phom xòe gốc, kiểm bề ngang eo khi tháo áo.' if id=='F_B_BOTTOM_vay_dai' else
                  'Quần: căn dài tới giày, kiểm độ rộng gấu và độ phủ chân.')
        elif slot=='shoes':
            layer,parts=place_shoes(im,base[g],measure_base(base[g]));note='Giày: kiểm mép chân và cổ giày.'
        else:
            width=460 if g=='M' else 16;scale=width/im.width
            fit={'x':(1080-width)/2 if g=='M' else 448,'y':70 if g=='M' else 190,'scale':scale}
            note='Phụ kiện: vị trí nháp; cần kiểm độ sâu và tóc.'
        if fit: layer=place(im,fit)
        if slot=='head' and g=='M':
            rgba=np.array(layer);body=np.array(base[g].getchannel('A'))
            rgba[170:,:,3]=(rgba[170:,:,3].astype(float)*(1-body[170:]/255)).round().astype(np.uint8)
            layer=Image.fromarray(rgba)
        if slot=='top':
            layer=shoulder_adjust(layer,g)
            if g=='M' and id!='M_C_TOP_ao_tac': layer=sleeve_ease(layer,base[g])
            layer,mask=neckline_mask(layer,base[g],g)
            mask.save(folder/'masks'/f'{id}-rear-collar.png')
            aperture=aperture_masks(im,fit,base[g],id)
            rgba=np.array(layer);rgba[:,:,3]=(rgba[:,:,3].astype(float)*(1-np.array(aperture)/255)).round().astype(np.uint8)
            layer=Image.fromarray(rgba);aperture.save(folder/'masks'/f'{id}-apertures.png')
            fg=hand_overlay(base[g],id)
            if fg.getbbox():
                fg.save(folder/'foreground'/f'{id}.png');foreground[id]=fg
        layer.save(folder/'layers'/row['target']);layers[id]=layer
        short=id.split('_'+slot.upper()+'_',1)[-1]
        report['items'].append({'id':id,'gender':g,'slot':slot,'label':LABELS.get(id,LABELS.get(short,id)),
            'source_sha256':sha(source),'provenance':'AI-assisted redraw' if generated else 'original',
            'source':str(source.relative_to(root)).replace('\\','/'),'transform':fit,'part_transforms':parts,
            'shoulder_lift_px':(40 if g=='M' else 12) if slot=='top' else 0,
            'sleeve_width_adjustment_limit':.15 if slot=='top' and g=='M' and id!='M_C_TOP_ao_tac' else 0,
            'occlusion_mask':f'masks/{id}-rear-collar.png' if slot=='top' else None,
            'foreground':f'foreground/{id}.png' if id in foreground else None,
            'bbox':list(bbox(layer)),'review_note':note,'status':'REVIEW_REQUIRED'})
    for g in ('M','F'):
        combos=combinations(rows,g)
        sheet=Image.new('RGB',(6*270,3*510),'#eee6da')
        for n,(top,bottom,shoes) in enumerate(combos,1):
            id=f'{g}-{n:02d}'; ids=[shoes['id'],bottom['id'],top['id']]
            result=compose(base[g],[layers[i] for i in ids]+([foreground[top['id']]] if top['id'] in foreground else []))
            relative=f'combinations/{id}.jpg';opaque_preview(result,(540,960)).save(folder/relative,quality=92)
            thumb=opaque_preview(result,(270,480)); x=(n-1)%6*270;y=(n-1)//6*510
            sheet.paste(thumb,(x,y));ImageDraw.Draw(sheet).text((x+10,y+483),id+' REVIEW',fill='#302b29')
            report['combinations'].append({'id':id,'gender':g,'top':top['id'],'bottom':bottom['id'],
                'shoes':shoes['id'],'preview':relative,'visual_status':'UNREVIEWED','cultural_status':'UNVERIFIED'})
        sheet.save(folder/f'{g}-all-combinations.jpg',quality=92)
        head=next(r['id'] for r in rows if r['gender']==g and r['slot']=='head')
        first=combinations(rows,g)[0];top,bottom,shoes=first
        accessory=compose(base[g],[layers[shoes['id']],layers[bottom['id']],layers[top['id']],layers[head]])
        opaque_preview(accessory,(540,960)).save(folder/f'{g}-accessory.jpg',quality=92)
    (folder/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    write_gallery(folder,report)
    print(f"Prepared {len(layers)} layers and {len(report['combinations'])} candidate combinations; no promotion")


if __name__=='__main__': run()
