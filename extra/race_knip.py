# Race-vel (pizza/race-chatgpt.png, ChatGPT 15 nov) -> pizza/race.png: 22 vakjes van 128 x 128 op een rij (transparant, onderaan uitgelijnd)
# 0-3 jij (voor, schuin, schuin, rug met stof), 4-7 Henk, 8-11 Luigi, 12 banaan, 13 kat, 14 plant, 15 wasmand, 16 winkelkar,
# 17 pizzapunt, 18 rozenstruik, 19 rozen in pot, 20 pizzapunt, 21 fontein
import sys; sys.path.insert(0, 'extra')
from groen_vormen import vormen_flood, knip
from PIL import Image
import numpy as np
from scipy import ndimage
def knip_groen(a, groen, box): # Luigi rijdt zelf groen: alleen de rand (vlak naast de achtergrond) ontgroenen
    y0, y1, x0, x1 = box; s = a[y0:y1, x0:x1].copy(); gm = groen[y0:y1, x0:x1]; buur = ndimage.binary_dilation(gm, iterations=2) & ~gm
    r, g, b = s[..., 0], s[..., 1], s[..., 2]; rand = buur & (g > r + 60) & (g > b + 60) & (g > 180); s[..., 1] = np.where(rand, np.maximum(r, b), g)
    im = Image.fromarray(np.dstack([s, np.where(gm, 0, 255)]).astype(np.uint8)); return im.crop(im.getbbox())
a, g, u = vormen_flood('pizza/race-chatgpt.png', 1500)
assert len(u) == 22, len(u)
racers, rij4, rij5 = u[:12], sorted(u[12:17], key=lambda b: b[2]), sorted(u[17:], key=lambda b: b[2])
# rij 4 op het vel: banaan, kat, plant, wasmand, winkelkar
volg = racers + rij4 + rij5
V = 128; uit = Image.new('RGBA', (V * len(volg), V), (0, 0, 0, 0))
for i, b in enumerate(volg):
    im = (knip_groen if 8 <= i <= 11 else knip)(a, g, b); k = min((V - 4) / im.width, (V - 4) / im.height); im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    uit.paste(im, (i * V + (V - im.width) // 2, V - 2 - im.height), im)
uit.save('pizza/race.png', optimize=True); print('pizza/race.png', uit.size)
