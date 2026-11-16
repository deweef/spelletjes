# zit_vel.py (16 nov): een vel met 6 zithoudingen op groen (ChatGPT, opdracht "recht zitten" in pizza/PLAN.md) in pizza/klanten.png zetten:
# 1 voor zitten -> vakje 12, 2 voor eten -> 13, 3 achter zitten -> 14, 4 achter eten -> 15, 5 opzij zitten -> 16, 6 opzij eten -> 17.
# Alle zes met dezelfde schaal (de hoogste wordt HOOG px), voeten op y = 188 in het vakje van 113 x 192, zoals de oude plaatjes.
# Gebruik: python3 extra/zit_vel.py pizza/werker-zit-chatgpt.png 0 [alleen=12,13,14,15]   (rij in klanten.png; alleen = alleen deze vakjes vervangen)
import sys, numpy as np
from collections import deque
from PIL import Image
pad, rij = sys.argv[1], int(sys.argv[2]); opt = dict(a.split('=') for a in sys.argv[3:])
alleen = [int(x) for x in opt['alleen'].split(',')] if 'alleen' in opt else list(range(12, 18)); HOOG = int(opt.get('hoog', 176))
a = np.array(Image.open(pad).convert('RGB')).astype(int); H, W, _ = a.shape; bg = np.median(a[2:8, 2:8].reshape(-1, 3), 0)
weg = np.sqrt(((a - bg) ** 2).sum(-1)) < 80; m = np.zeros_like(weg); q = deque([(y, x) for y in range(H) for x in (0, W - 1)] + [(y, x) for x in range(W) for y in (0, H - 1)])
while q:  # achtergrond = groen dat vanaf de rand bereikbaar is
    y, x = q.popleft()
    if 0 <= y < H and 0 <= x < W and weg[y, x] and not m[y, x]: m[y, x] = True; q.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])
m |= np.sqrt(((a - bg) ** 2).sum(-1)) < 35  # ingesloten stukjes pure achtergrond (tussen arm en lijf)
g = a[..., 1]; mx = np.maximum(a[..., 0], a[..., 2]); b = a.copy(); b[..., 1] = np.where(g > mx + 40, mx + 40, g)  # groene rand dempen
kol = (~m).sum(0) > 3; st = []; x = 0
while x < W:
    if kol[x]:
        s = x
        while x < W and kol[x]: x += 1
        if x - s > 40: st.append((s, x))
    x += 1
assert len(st) == 6, ('verwacht 6 figuren, gevonden', st)
fig = []
for s, e in st:
    f = Image.fromarray(np.dstack([b[:, s:e], np.where(m[:, s:e], 0, 255)]).astype(np.uint8)); fig.append(f.crop(f.getbbox()))
k = HOOG / max(f.size[1] for f in fig); k = min(k, 111 / max(f.size[0] for f in fig))
im = Image.open('pizza/klanten.png').convert('RGBA'); Wc, Hc = 113, 192
for doel, f in zip(range(12, 18), fig):
    if doel not in alleen: continue
    f = f.resize((max(1, round(f.size[0] * k)), max(1, round(f.size[1] * k))), Image.LANCZOS)
    vak = Image.new('RGBA', (Wc, Hc)); vak.alpha_composite(f, ((Wc - f.size[0]) // 2, 188 - f.size[1])); im.paste(vak, (doel * Wc, rij * Hc))
im.save('pizza/klanten.png', optimize=True); print('ok', st, 'schaal', round(k, 3))
