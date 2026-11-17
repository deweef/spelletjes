# Afrikaanse man zittend (rij 3, vakjes 12-17, uit pizza/afrikaan-zit-chatgpt.png): groen shirt -> crème, zoals zijn looppoppetjes (extra/kleur_voor.py).
# Draai één keer na extra/zit_vel.py: python3 extra/kleur_zit.py
import numpy as np, colorsys
from PIL import Image
k = np.array(Image.open('pizza/klanten.png').convert('RGBA')).astype(float)
def hsv(a): f = np.vectorize(lambda r, g, b: colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)); return f(a[..., 0], a[..., 1], a[..., 2])
for v in range(12, 18):
    a = k[3 * 192:4 * 192, v * 113:(v + 1) * 113]; h, s, l = hsv(a); m = (a[..., 3] > 0) & (h > 0.2) & (h < 0.47) & (s > 0.25)
    lum = a[..., :3].max(-1); w = np.clip(255 * (lum / max(1, lum[m].max() if m.any() else 1)) ** 0.35, 110, 250)
    for c, f in enumerate((1.0, 0.97, 0.88)): a[..., c] = np.where(m, w * f, a[..., c])
Image.fromarray(np.clip(k, 0, 255).astype(np.uint8)).save('pizza/klanten.png', optimize=True)
