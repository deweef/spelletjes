# Een ChatGPT-vel (felgroen, rij 1 onderdelen, rij 2 vier keer rug, rij 3 vier keer van voren, rij 4 zitten) naar bezoekers.png en portretten.png.
# Gebruik: python3 extra/bezoeker_knip.py <vel> <bezoekersrij> <portretvak> [rug=8,9,10,11] [voor=12,13,14,15] [portret=19] [flood=1]
# (nummers = vormen zoals `python3 extra/groen_vormen.py <vel>` ze telt; het portret = bovenlijf van dat zittende plaatje)
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__)); from groen_vormen import vormen, vormen_flood, knip
FLOOD = False  # flood=1: figuur is zelf groen (pakken): alleen de achtergrond vanaf de rand weghalen, niets ontgroenen
def ontgroen(im):
    if FLOOD: return im
    a = np.array(im).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]; m = (g > r + 30) & (g > b + 30); a[m, 3] = 0; return Image.fromarray(a.astype(np.uint8))
def vak(im, w, h, hoogte, voet):
    im = ontgroen(im); s = hoogte / im.size[1]; im = im.resize((round(im.size[0] * s), hoogte), Image.LANCZOS)
    if im.size[0] > w - 2: im = im.resize((w - 2, round(im.size[1] * (w - 2) / im.size[0])), Image.LANCZOS)
    o = Image.new('RGBA', (w, h)); o.alpha_composite(im, ((w - im.size[0]) // 2, voet - im.size[1])); return o
vel, rij, pv = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); opt = dict(x.split('=') for x in sys.argv[4:])
rug = [int(x) for x in opt.get('rug', '8,9,10,11').split(',')]; voor = [int(x) for x in opt.get('voor', '12,13,14,15').split(',')]; pi = int(opt.get('portret', '19'))
FLOOD = opt.get('flood') == '1'
if FLOOD:
    a, g, v = vormen_flood(vel)
    def F(i):
        from scipy import ndimage
        y0, y1, x0, x1 = v[i]; m = ~g[y0:y1, x0:x1]; m = ndimage.binary_erosion(m, iterations=1)  # 1 pixel van de rand af: geen groene waas
        im = Image.fromarray(np.dstack([a[y0:y1, x0:x1], m * 255]).astype(np.uint8)); return im.crop(im.getbbox())
else:
    a, g, v = vormen(vel); F = lambda i: knip(a, g, v[i])
bz = Image.open('pizza/bezoekers.png').convert('RGBA'); n = max(bz.size[1] // 192, rij + 1); nw = Image.new('RGBA', (bz.size[0], n * 192)); nw.alpha_composite(bz)
nw.paste(Image.new('RGBA', (bz.size[0], 192)), (0, rij * 192))
for c, i in enumerate(rug): nw.alpha_composite(vak(F(i), 113, 192, 172, 189), (c * 113, rij * 192))
for c, i in enumerate(voor): nw.alpha_composite(vak(F(i), 113, 192, 176, 189), ((4 + c) * 113, rij * 192))
nw.save('pizza/bezoekers.png')
pt = Image.open('pizza/portretten.png').convert('RGBA'); m = max(pt.size[0] // 170, pv + 1); pn = Image.new('RGBA', (m * 170, 310)); pn.alpha_composite(pt)
pn.paste(Image.new('RGBA', (170, 310)), (pv * 170, 0))
im = ontgroen(F(pi)); boven = im.crop((0, 0, im.size[0], round(im.size[1] * 0.62))); s = 168 / boven.size[0]; boven = boven.resize((168, round(boven.size[1] * s)), Image.LANCZOS)
if boven.size[1] > 250: boven = boven.crop((0, 0, 168, 250))
pn.alpha_composite(boven, (pv * 170 + 1, 310 - boven.size[1])); pn.save('pizza/portretten.png')
print('bezoekers', nw.size, 'portretten', pn.size, '-> css-breedte portret:', pn.size[0] // 2, 'px')
