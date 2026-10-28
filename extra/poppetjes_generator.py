# poppetjes-generator (proef, 28 okt): onderdelen van één Gemini-vel aan een skelet, en daarmee elke houding tekenen
from PIL import Image, ImageDraw
import numpy as np, math
import sys, os
from collections import deque
BRON = sys.argv[1] if len(sys.argv) > 1 else 'pizza/oma-onderdelen-gemini.jpg'; UIT = sys.argv[2] if len(sys.argv) > 2 else '.'
def lees(pad):  # het vel inlezen, groen weg, en elk los vormpje een nummer geven (op volgorde van boven naar beneden, links naar rechts)
    a = np.array(Image.open(pad).convert('RGB')).astype(int); H, W, _ = a.shape; bg = np.median(a[2:8, 2:8].reshape(-1, 3), 0)
    vol = np.sqrt(((a - bg) ** 2).sum(-1)) > 70; lab = np.zeros((H, W), int); n = 0
    for y in range(H):
        for x in range(W):
            if vol[y, x] and not lab[y, x]:
                n += 1; q = deque([(y, x)]); lab[y, x] = n
                while q:
                    cy, cx = q.popleft()
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < H and 0 <= nx < W and vol[ny, nx] and not lab[ny, nx]: lab[ny, nx] = n; q.append((ny, nx))
    return Image.fromarray(np.dstack([a, np.where(vol, 255, 0)]).astype(np.uint8)), lab
vel, lab = lees(BRON)
def deel(n, box=None):  # onderdeel n (los vormpje) uit het vel, eventueel alleen binnen box
    m = (lab == n).astype(np.uint8) * 255
    if box: z = np.zeros_like(m); x0, y0, x1, y1 = box; z[y0:y1, x0:x1] = m[y0:y1, x0:x1]; m = z
    m = np.array(Image.fromarray(m).filter(__import__('PIL.ImageFilter', fromlist=['x']).MinFilter(3)))  # 1 pixel van de groene rand af
    a = np.array(vel).copy(); g = a[..., 1].astype(int); mx = np.maximum(a[..., 0], a[..., 2]).astype(int); a[..., 1] = np.where(g > mx + 10, mx + 10, g)  # groen wegpoetsen
    a[..., 3] = m; s = Image.new('RGBA', (1400, 1500)); s.paste(Image.fromarray(a), (0, 0)); return s
def rok_kort(im):  # de rok van Gemini komt tot de enkels: in de hoogte inkrimpen tot over de knie (zoals op het voorbeeld)
    b = im.crop((369, 415, 616, 709)); b = b.resize((b.size[0], int(b.size[1] * 0.72)), Image.LANCZOS); s = Image.new('RGBA', im.size); s.paste(b, (369, 415)); return s
# De nummers hieronder (1 hoofd, 2 romp, 3 gebogen arm, 4 bovenarm, 5 stok, 6 achterste been, 7 voorste been, 8 rok) en de scharnierpunten
# horen bij pizza/oma-onderdelen-gemini.jpg. Gebruik: python3 extra/poppetjes_generator.py [vel] [uitmap]
# onderdeel: (plaatje, scharnier in velcoördinaten, hoek waarin het getekend is: 0 = recht naar beneden)
D = {
  'hoofd': (deel(1), (190, 330), 0),
  'romp': (deel(2), (492, 380), 0),
  'rok': (rok_kort(deel(8)), (492, 430), 0),
  'bovenarm': (deel(4), (728, 118), 8),
  'onderarm': (deel(3, (930, 205, 1160, 310)), (952, 252), -90),   # uit de gebogen arm: de onderarm wijst naar voren
  'dij1': (deel(7, (740, 390, 940, 560)), (792, 415), -22), 'scheen1': (deel(7, (740, 530, 940, 745)), (845, 545), 0),
  'dij2': (deel(6, (990, 390, 1180, 560)), (1040, 415), -22), 'scheen2': (deel(6, (990, 530, 1180, 745)), (1092, 545), 0),
  'stok': (deel(5), (1258, 330), 0),
}
LEN = {'romp': 300, 'dij': 135, 'bovenarm': 185}
def rot(v, h): a = math.radians(h); return (v[0] * math.cos(a) - v[1] * math.sin(a), v[0] * math.sin(a) + v[1] * math.cos(a))
def plak(doek, naam, hoek, waar, ox, oy):  # hoek = richting van het onderdeel (0 = recht naar beneden, + = met de klok mee)
    im, (px, py), h0 = D[naam]; h = hoek - h0
    doek.alpha_composite(im.rotate(-h, center=(px, py), resample=Image.BICUBIC, translate=(waar[0] + ox - px, waar[1] + oy - py)))
def punt(p, hoek, lengte): v = rot((0, lengte), hoek); return (p[0] + v[0], p[1] + v[1])
def houding(romp=0, nek=0, dij1=0, knie1=0, dij2=0, knie2=0, schouder=10, elleboog=0, stok=None, rok=0, zak=0):
    """hoeken in graden t.o.v. recht naar beneden (+ = naar achteren draaien, - = naar voren)"""
    W, H = 1400, 1500; doek = Image.new('RGBA', (W, H)); ox, oy = 600, 700 + zak; heup = (0, 0)
    nekp = punt(heup, 180 + romp, LEN['romp'] - 35); schp = punt(heup, 180 + romp, LEN['romp'] - 40)
    sch = (schp[0] - 8, schp[1])
    k1 = punt((0, 30), dij1, LEN['dij']); k2 = punt((-6, 30), dij2, LEN['dij'])
    plak(doek, 'dij2', dij2, (-6, 30), ox, oy); plak(doek, 'scheen2', dij2 + knie2, k2, ox, oy)
    plak(doek, 'dij1', dij1, (0, 30), ox, oy); plak(doek, 'scheen1', dij1 + knie1, k1, ox, oy)
    plak(doek, 'rok', rok, (0, 5), ox, oy)  # rok iets onder het vest, zodat er geen kier is
    plak(doek, 'romp', romp, heup, ox, oy)
    if stok: plak(doek, 'stok', stok[0], (stok[1], stok[2]), ox, oy)
    el = punt(sch, schouder, LEN['bovenarm'])
    plak(doek, 'bovenarm', schouder, sch, ox, oy); plak(doek, 'onderarm', schouder + elleboog, el, ox, oy)
    plak(doek, 'hoofd', romp + nek, nekp, ox, oy)
    return doek.crop(doek.getbbox())
fr = [('staan', houding(stok=(0, 150, -40), schouder=-15, elleboog=-40))]
for i in range(6):
    s = math.sin(i / 6 * 2 * math.pi); c = math.cos(i / 6 * 2 * math.pi)
    fr.append((f'lopen {i + 1}', houding(romp=-3, dij1=-22 * s, knie1=max(0, 30 * c) if s < 0 else 8, dij2=22 * s, knie2=max(0, -30 * c) if s > 0 else 8, schouder=14 * s, elleboog=-25, zak=-abs(s) * 8, rok=-4 * s)))
fr2 = list(fr)
fr.append(('zitten', houding(dij1=-90, knie1=90, dij2=-88, knie2=88, rok=-75, schouder=-35, elleboog=-55, stok=(0, 230, -20))))
fr.append(('hap', houding(dij1=-90, knie1=90, dij2=-88, knie2=88, rok=-75, schouder=-60, elleboog=-120, stok=(0, 230, -20))))
Hm = max(f.size[1] for _, f in fr); o = Image.new('RGB', (sum(f.size[0] + 40 for _, f in fr) + 20, Hm + 40), (250, 240, 220)); d = ImageDraw.Draw(o); x = 20
for n, f in fr: o.paste(f, (x, Hm - f.size[1]), f); d.text((x, Hm + 12), n, fill=(60, 30, 10)); x += f.size[0] + 40
o.save(os.path.join(UIT, 'gen.png')); print(o.size)

# loopfilmpje op spelgrootte (oma is in het spel ~90 px hoog, hier 2x zo groot), naast de huidige Gemini-loopplaatjes
kl = Image.open('pizza/klanten.png').convert('RGBA'); beelden = []
loop = [f for n, f in fr2[1:]]; hh = 180
for k in range(12):
    f = loop[k % 6]; f = f.resize((round(f.size[0] * hh / f.size[1]), hh), Image.LANCZOS)
    g = kl.crop(((k % 7) * 113, 10 * 192, (k % 7 + 1) * 113, 11 * 192)); g = g.crop(g.getbbox()); g = g.resize((round(g.size[0] * hh / g.size[1]), hh), Image.LANCZOS)
    b = Image.new('RGB', (420, 240), (232, 190, 120)); d = ImageDraw.Draw(b); d.text((20, 8), 'nu (Gemini)', fill=(60, 30, 10)); d.text((230, 8), 'generator', fill=(60, 30, 10))
    b.paste(g, (40, 30), g); b.paste(f, (250, 30), f); beelden.append(b)
beelden[0].save(os.path.join(UIT, 'loop.gif'), save_all=True, append_images=beelden[1:], duration=140, loop=0)
# vakjes voor pizza/klanten.png: 7 loopstappen van opzij, 113 x 192, 166 px hoog, voeten op y = 187
strip = Image.new('RGBA', (113 * 7, 192))
for i in range(7):
    s = math.sin(i / 7 * 2 * math.pi); c = math.cos(i / 7 * 2 * math.pi)
    f = houding(romp=-3, dij1=-22 * s, knie1=max(0, 30 * c) if s < 0 else 8, dij2=22 * s, knie2=max(0, -30 * c) if s > 0 else 8, schouder=14 * s, elleboog=-25, zak=-abs(s) * 8, rok=-4 * s)
    hh = 166; f = f.resize((round(f.size[0] * hh / f.size[1]), hh), Image.LANCZOS)
    if f.size[0] > 111: f = f.resize((111, round(f.size[1] * 111 / f.size[0])), Image.LANCZOS)
    strip.alpha_composite(f, (i * 113 + (113 - f.size[0]) // 2, 188 - f.size[1]))
strip.save(os.path.join(UIT, 'lopen-opzij.png'))
