# zit_opzij.py: zittend van opzij (vel met 4 houdingen op groen) in klanten.png zetten: plaatje 1 = vakje 16 (zitten), plaatje 2 = vakje 17 (eten).
# Gebruik: python3 extra/zit_opzij.py pizza/student-opzij-chatgpt.png 1   (rij in klanten.png)
import sys, numpy as np
from collections import deque
from PIL import Image
pad, rij = sys.argv[1], int(sys.argv[2])
a = np.array(Image.open(pad).convert('RGB')).astype(int); H, W, _ = a.shape; bg = np.median(a[2:8, 2:8].reshape(-1, 3), 0)
weg = np.sqrt(((a - bg) ** 2).sum(-1)) < 80; m = np.zeros_like(weg); q = deque([(y, x) for y in range(H) for x in (0, W - 1)] + [(y, x) for x in range(W) for y in (0, H - 1)])
while q:
    y, x = q.popleft()
    if 0 <= y < H and 0 <= x < W and weg[y, x] and not m[y, x]: m[y, x] = True; q.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])
g = a[..., 1]; mx = np.maximum(a[..., 0], a[..., 2]); b = a.copy(); b[..., 1] = np.where(g > mx + 40, mx + 40, g)  # groene rand dempen
kol = (~m).sum(0) > 3; st = []; x = 0
while x < W:
    if kol[x]:
        s = x
        while x < W and kol[x]: x += 1
        if x - s > 60: st.append((s, x))
    x += 1
assert len(st) >= 2, st
im = Image.open('pizza/klanten.png').convert('RGBA'); Wc, Hc = 113, 192
for doel, (s, e) in zip((16, 17), st[:2]):
    f = Image.fromarray(np.dstack([b[:, s:e], np.where(m[:, s:e], 0, 255)]).astype(np.uint8)); f = f.crop(f.getbbox())
    hh = 172; f = f.resize((round(f.size[0] * hh / f.size[1]), hh), Image.LANCZOS)
    if f.size[0] > 111: f = f.resize((111, round(f.size[1] * 111 / f.size[0])), Image.LANCZOS)
    vak = Image.new('RGBA', (Wc, Hc)); vak.alpha_composite(f, ((Wc - f.size[0]) // 2, 188 - f.size[1])); im.paste(vak, (doel * Wc, rij * Hc))
im.save('pizza/klanten.png', optimize=True); print('ok', st)
