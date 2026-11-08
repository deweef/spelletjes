# Zet schilderijen om naar pixeldata voor Pixelpikkers (KUNST in pixelpikkers.html).
# Gebruik: python3 extra/pixelkunst.py extra/pixelkunst-lijst.json uit.json voorbeeld.png
# De bronplaatjes (Wikimedia Commons, publiek domein) staan niet in de repo; zie uitleg/pixelpikkers.md.
import sys,json
from PIL import Image,ImageEnhance
def rm(a,b):
    r=(a[0]+b[0])/2;dr,dg,db=a[0]-b[0],a[1]-b[1],a[2]-b[2]
    return (2+r/256)*dr*dr+4*dg*dg+(2+(255-r)/256)*db*db
def maak(pad,N=34,k=10,drempel=2600,crop=None):
    im=Image.open(pad).convert('RGB')
    if crop: w,h=im.size;im=im.crop((int(crop[0]*w),int(crop[1]*h),int(crop[2]*w),int(crop[3]*h)))
    im=ImageEnhance.Color(im).enhance(1.25);im=ImageEnhance.Contrast(im).enhance(1.1)
    w,h=im.size;s=N/max(w,h);W,H=max(1,round(w*s)),max(1,round(h*s))
    klein=im.resize((W,H),Image.LANCZOS)
    q=klein.quantize(colors=k,method=Image.Quantize.MEDIANCUT,kmeans=3)
    pal=q.getpalette()[:3*k];pal=[tuple(pal[i*3:i*3+3]) for i in range(k)]
    idx=list(q.getdata())
    # samenvoegen: te veel op elkaar lijkende of te kleine kleuren
    while True:
        tel={}
        for i in idx:tel[i]=tel.get(i,0)+1
        act=sorted(tel,key=lambda c:tel[c])
        best=None
        for a in act:
            for b in act:
                if a!=b:
                    d=rm(pal[a],pal[b])
                    if d<drempel and (best is None or d<best[0]):best=(d,a,b)
        if best is None and tel[act[0]]>=6:break
        if best is None:
            a=act[0];b=min((c for c in act if c!=a),key=lambda c:rm(pal[a],pal[c]))
        else:
            _,a,b=best
            if tel[a]>tel[b]:a,b=b,a
        idx=[b if i==a else i for i in idx]
    gebruikt=sorted(set(idx),key=lambda c:sum(pal[c]))
    kaart={c:n for n,c in enumerate(gebruikt)}
    tekens='0123456789abcdefghij'
    rijen=[''.join(tekens[kaart[idx[y*W+x]]] for x in range(W)) for y in range(H)]
    return {'pal':['#%02x%02x%02x'%pal[c] for c in gebruikt],'rijen':rijen}
if __name__=='__main__':
    lijst=json.load(open(sys.argv[1]));uit=[]
    for d in lijst:
        r=maak(d['bestand'],d.get('N',34),d.get('k',10),d.get('drempel',2600),d.get('crop'))
        uit.append({**{k:v for k,v in d.items() if k in('t','m','g')},**r})
        print(d['t'],len(r['pal']),len(r['rijen'][0]),'x',len(r['rijen']),file=sys.stderr)
    json.dump(uit,open(sys.argv[2],'w'),ensure_ascii=False)
    # voorbeeldvel
    W=5;vel=Image.new('RGB',(W*230,((len(uit)+W-1)//W)*230),'white')
    for n,d in enumerate(uit):
        h=len(d['rijen']);w=len(d['rijen'][0]);im=Image.new('RGB',(w,h))
        for y,r in enumerate(d['rijen']):
            for x,ch in enumerate(r):
                c=d['pal']['0123456789abcdefghij'.index(ch)];im.putpixel((x,y),tuple(int(c[i:i+2],16) for i in (1,3,5)))
        im=im.resize((w*6,h*6),Image.NEAREST);vel.paste(im,((n%W)*230,(n//W)*230))
    vel.save(sys.argv[3])
