"""Figuren uitknippen uit een Gemini-vel met een felgroene achtergrond.

Gebruik:  python3 extra/knip_figuren.py <vel.jpg> <uit.png> [--hoogte 192] [--rijen 15-289,289-515] [--max-x 1150]

- Groen (g>140, g>r+60, g>b+60) wordt doorzichtig, groenige randpixels worden ontgroend.
- Rijen: automatisch (op lege horizontale stroken), of zelf opgeven met --rijen y1-y2,y1-y2 als figuren elkaar raken.
- Per rij worden de figuren op lege kolommen gesplitst (smaller dan 25 px = ruis, genegeerd); --max-x laat alles rechts
  daarvan weg (bijvoorbeeld een grote losse figuur).
- Alle figuren komen op één rij in even grote vakjes, voeten onderaan, geschaald naar --hoogte. Rijen die kleiner getekend
  zijn dan de eerste rij (zoals de rugrij), worden even groot gemaakt.
- Schrijft ook <uit>-controle.png op een donkere achtergrond om te bekijken, en print de breedte per vakje.
"""
import argparse
import numpy as np
from PIL import Image

a = argparse.ArgumentParser()
a.add_argument('vel'); a.add_argument('uit')
a.add_argument('--hoogte', type=int, default=192)
a.add_argument('--rijen', default='')
a.add_argument('--max-x', type=int, default=10**9)
o = a.parse_args()

im = np.array(Image.open(o.vel).convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
groen = (g > 140) & (g > r + 60) & (g > b + 60)
alfa = np.where(groen, 0, 255).astype(np.uint8)
rand = (g > r + 25) & (g > b + 25) & ~groen
im[..., 1] = np.where(rand, np.maximum(r, b), g)
rgba = np.dstack([im, alfa]).astype(np.uint8)

def stroken(vol, min_lengte):
    uit, i = [], 0
    while i < len(vol):
        if vol[i]:
            s = i
            while i < len(vol) and vol[i]: i += 1
            if i - s >= min_lengte: uit.append((s, i))
        i += 1
    return uit

rijen = [tuple(map(int, d.split('-'))) for d in o.rijen.split(',')] if o.rijen else stroken((alfa > 0).sum(1) > 3, 40)
alle = []
for y0, y1 in rijen:
    figs = []
    for x0, x1 in stroken((alfa[y0:y1] > 0).sum(0) > 2, 25):
        if x0 >= o.max_x: continue
        sub = rgba[y0:y1, x0:x1]
        rows = np.where((sub[..., 3] > 0).sum(1) > 2)[0]
        figs.append(Image.fromarray(sub[rows[0]:rows[-1] + 1]))
    if figs: alle.append(figs)
print('rijen:', [len(f) for f in alle])
basis = np.mean([f.height for f in alle[0]])
frames = []
for figs in alle:
    s = basis / np.mean([f.height for f in figs])
    frames += [f.resize((round(f.width * s), round(f.height * s)), Image.LANCZOS) if abs(s - 1) > 0.03 else f for f in figs]
CW = max(f.width for f in frames) + 8; CH = max(f.height for f in frames) + 6
vel = Image.new('RGBA', (CW * len(frames), CH), (0, 0, 0, 0))
for i, f in enumerate(frames): vel.paste(f, (i * CW + (CW - f.width) // 2, CH - f.height - 3), f)
w = round(CW * o.hoogte / CH)
vel = vel.resize((w * len(frames), o.hoogte), Image.LANCZOS)
vel.save(o.uit, optimize=True)
c = Image.new('RGBA', vel.size, (60, 40, 30, 255)); c.alpha_composite(vel); c.save(o.uit.rsplit('.', 1)[0] + '-controle.png')
print(f'{len(frames)} plaatjes van {w}x{o.hoogte} in {o.uit}')
