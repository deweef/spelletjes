# Marco en Valentina (verhaallijn verliefd koppel, 14 nov): uit de ChatGPT-vellen naar bezoekers.png (rij 12/13), portretten.png (19/20) en koppel.png.
# Gebruik: python3 extra/koppel_knip.py   (Valentina van voren lopen komt uit: python3 extra/poppetjes_voor.py valentina /tmp -> lopen-voor-valentina.png)
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__)); from groen_vormen import vormen, knip
VOOR = sys.argv[1] if len(sys.argv) > 1 else '/tmp/lopen-voor-valentina.png'
ma, mg, mv = vormen('pizza/marco-chatgpt.png'); va, vg, vv = vormen('pizza/valentina-chatgpt.png')
M = lambda i: knip(ma, mg, mv[i]); V = lambda i: knip(va, vg, vv[i])
def ontgroen(im):  # groene randjes en vlekjes (haar) weg
    a = np.array(im).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]; m = (g > r + 30) & (g > b + 30); a[m, 3] = 0; return Image.fromarray(a.astype(np.uint8))
def vak(im, w, h, hoogte, voet):
    im = ontgroen(im); s = hoogte / im.size[1]; im = im.resize((round(im.size[0] * s), hoogte), Image.LANCZOS)
    if im.size[0] > w - 2: im = im.resize((w - 2, round(im.size[1] * (w - 2) / im.size[0])), Image.LANCZOS)
    o = Image.new('RGBA', (w, h)); o.alpha_composite(im, ((w - im.size[0]) // 2, voet - im.size[1])); return o
# bezoekers.png: 0-3 rug (naar binnen), 4-7 van voren
bz = Image.open('pizza/bezoekers.png').convert('RGBA'); rijen = bz.size[1] // 192
nieuw = Image.new('RGBA', (bz.size[0], max(rijen, 14) * 192)); nieuw.alpha_composite(bz.crop((0, 0, bz.size[0], 12 * 192)))
for c, i in enumerate([8, 9, 10, 11]): nieuw.alpha_composite(vak(M(i), 113, 192, 172, 189), (c * 113, 12 * 192))
for c, i in enumerate([12, 14, 16, 18]): nieuw.alpha_composite(vak(M(i), 113, 192, 176, 189), ((4 + c) * 113, 12 * 192))
for c, i in enumerate([6, 7, 8, 9]): nieuw.alpha_composite(vak(V(i), 113, 192, 168, 189), (c * 113, 13 * 192))
lv = Image.open(VOOR).convert('RGBA')
for c in range(4): nieuw.alpha_composite(vak(lv.crop((c * 113, 0, (c + 1) * 113, 192)).crop(lv.crop((c * 113, 0, (c + 1) * 113, 192)).getbbox()), 113, 192, 168, 189), ((4 + c) * 113, 13 * 192))
nieuw.save('pizza/bezoekers.png')
# portretten.png: bovenlijf van het zittende plaatje met het wijnglas
pt = Image.open('pizza/portretten.png').convert('RGBA'); n = pt.size[0] // 170; pn = Image.new('RGBA', (max(n, 21) * 170, 310)); pn.alpha_composite(pt.crop((0, 0, 19 * 170, 310)))
for j, im in ((19, M(22)), (20, V(13))):
    im = ontgroen(im); boven = im.crop((0, 0, im.size[0], round(im.size[1] * 0.62))); s = 168 / boven.size[0]
    boven = boven.resize((168, round(boven.size[1] * s)), Image.LANCZOS)
    if boven.size[1] > 250: boven = boven.crop((0, 0, 168, 250))
    pn.alpha_composite(boven, (j * 170 + 1, 310 - boven.size[1]))
pn.save('pizza/portretten.png')
# koppel.png (vakjes 200 x 260): rij 0 Marco zitten (0 zit, 1 pizza, 2 benen over elkaar, 3 wijn), rij 1 Valentina idem, rij 2 Valentina opzij lopen (0-5)
kp = Image.new('RGBA', (200 * 6, 260 * 3))
for c, i in enumerate([19, 20, 21, 22]): kp.alpha_composite(vak(M(i), 200, 260, 240, 256), (c * 200, 0))
for c, i in enumerate([10, 11, 12, 13]): kp.alpha_composite(vak(V(i), 200, 260, 230, 256), (c * 200, 260))
for c, i in enumerate([0, 1, 2, 3, 4, 5]): kp.alpha_composite(vak(V(i), 200, 260, 250, 256), (c * 200, 520))
kp.save('pizza/koppel.png'); print('klaar', nieuw.size, pn.size, kp.size)
