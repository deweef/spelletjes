# Kleuren van de "lopen naar voren"-plaatjes (vakjes 18-25, uit de ChatGPT-vellen) gelijk trekken met de oude Gemini-plaatjes (16 nov):
# Afrikaanse man (rij 3) groen shirt -> wit/crème, studente (rij 7) paars haar -> grijsgroen, Chinese dame (rij 4) rood iets donkerder.
# Draai één keer: python3 extra/kleur_voor.py (werkt in pizza/klanten.png zelf).
import numpy as np, colorsys
from PIL import Image
k = np.array(Image.open('pizza/klanten.png').convert('RGBA')).astype(float)
def vak(r, v): return k[r * 192:(r + 1) * 192, v * 113:(v + 1) * 113]
def hsv(a): f = np.vectorize(lambda r, g, b: colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)); return f(a[..., 0], a[..., 1], a[..., 2])
for v in range(18, 22):  # Afrikaanse man: groen -> crème (helderheid blijft), oranje rand blijft
    a = vak(3, v); h, s, l = hsv(a); m = (a[..., 3] > 0) & (h > 0.2) & (h < 0.47) & (s > 0.25)
    lum = a[..., :3].max(-1); w = np.clip(255 * (lum / max(1, lum[m].max() if m.any() else 1)) ** 0.35 * 1.0, 110, 250)  # relatief: het lichtste groen wordt bijna wit
    for c, f in enumerate((1.0, 0.97, 0.88)): a[..., c] = np.where(m, w * f, a[..., c])
for v in range(18, 22):  # studente: paars haar (bovenste 45%) -> grijsgroen
    a = vak(7, v); h, s, l = hsv(a); m = (a[..., 3] > 0) & (h > 0.68) & (h < 0.92) & (s > 0.2); m[int(192 * 0.45):] = False
    lum = a[..., :3].mean(-1) / 75
    for c, kl in enumerate((70, 102, 92)): a[..., c] = np.where(m, np.clip(kl * lum, 0, 255), a[..., c])
for v in range(18, 26):  # Chinese dame (beide versies): het felle rood iets donkerder en minder fel
    a = vak(4, v); m = (a[..., 3] > 0) & (a[..., 0] > a[..., 1] + 60) & (a[..., 0] > a[..., 2] + 50)
    a[..., 0] = np.where(m, a[..., 0] * 0.78, a[..., 0]); a[..., 1] = np.where(m, a[..., 1] * 0.85, a[..., 1])
Image.fromarray(np.clip(k, 0, 255).astype(np.uint8)).save('pizza/klanten.png')
