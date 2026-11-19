# Zittende plaatjes (vakjes 12-17) dezelfde kleuren geven als de looppoppetjes (extra/kleur_voor.py). Draai na extra/zit_vel.py:
#   python3 extra/kleur_zit.py afrikaan   (rij 3: groen shirt -> crème)
#   python3 extra/kleur_zit.py studente   (rij 7: paars haar -> grijsgroen; alleen het hoofd, de rugzak blijft paars)
import sys
import numpy as np, colorsys
from PIL import Image
k = np.array(Image.open('pizza/klanten.png').convert('RGBA')).astype(float)
def hsv(a): f = np.vectorize(lambda r, g, b: colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)); return f(a[..., 0], a[..., 1], a[..., 2])
wat = sys.argv[1] if len(sys.argv) > 1 else 'afrikaan'
for v in range(12, 18) if wat == 'afrikaan' else []:
    a = k[3 * 192:4 * 192, v * 113:(v + 1) * 113]; h, s, l = hsv(a); m = (a[..., 3] > 0) & (h > 0.2) & (h < 0.47) & (s > 0.25)
    lum = a[..., :3].max(-1); w = np.clip(255 * (lum / max(1, lum[m].max() if m.any() else 1)) ** 0.35, 110, 250)
    for c, f in enumerate((1.0, 0.97, 0.88)): a[..., c] = np.where(m, w * f, a[..., c])
for v in range(12, 18) if wat == 'studente' else []:
    a = k[7 * 192:8 * 192, v * 113:(v + 1) * 113]; h, s, l = hsv(a); ys = np.where(a[..., 3].max(1) > 0)[0]; top = ys.min()
    m = (a[..., 3] > 0) & (h > 0.68) & (h < 0.92) & (s > 0.2); m[top + int((188 - top) * 0.33):] = False  # alleen het hoofd
    lum = a[..., :3].mean(-1) / 75
    for c, kl in enumerate((70, 102, 92)): a[..., c] = np.where(m, np.clip(kl * lum, 0, 255), a[..., c])
Image.fromarray(np.clip(k, 0, 255).astype(np.uint8)).save('pizza/klanten.png', optimize=True)
