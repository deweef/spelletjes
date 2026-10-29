# poppetjes-generator, van voren (29 okt): een figuur in broek laten lopen naar de kijker toe, uit een onderdelenvel van voren en een vel met benen.
# Gebruik: python3 extra/poppetjes_voor.py opa [uitmap]  -> lopen-voor-opa.png (4 vakjes van 113 x 192) en gen-voor-opa.png (voorbeeld)
import sys, os, math, numpy as np
from collections import deque
from PIL import Image, ImageFilter
FIG = {  # nummers = losse vormpjes op het vel (van boven naar beneden, links naar rechts); mouw = blote armen bruin kleuren tot de pols
  'opa': dict(voor='pizza/opa-onderdelen-voor-gemini.jpg', benen='pizza/opa-onderdelen-benen-gemini.jpg', hoofd=2, romp=1, arm=(6, 7), been=(1, 2),
              beenschaal=0.66, mouw=(118, 74, 44), pols=0.66),
  'werker': dict(voor='pizza/werker-onderdelen-chatgpt.png', benen='pizza/werker-onderdelen-chatgpt.png', hoofd=1, romp=2, arm=(3, 4), been=(5, 6),
                 beenschaal=0.95, achter=(7, 8), kapjes=(236, 120, 30)),  # bruine schouderkapjes op de romp oranje maken  # ChatGPT: alles op één vel (benen 5/6 voor, 7/8 achter)
  'student': dict(voor='pizza/student-onderdelen-chatgpt.png', benen='pizza/student-onderdelen-chatgpt.png', hoofd=1, romp=2, arm=(4, 3), been=(8, 9),
                  beenschaal=0.95, achter=(6, 7)),
  'villa': dict(voor='pizza/villa-onderdelen-chatgpt.png', benen='pizza/villa-onderdelen-chatgpt.png', hoofd=1, romp=2, arm=(4, 5), been=(7, 8),
                beenschaal=0.62, achter=(9, 10), jurk=True, vlak=True),
  'afrikaan': dict(voor='pizza/afrikaan-onderdelen-chatgpt.png', benen='pizza/afrikaan-onderdelen-chatgpt.png', hoofd=1, romp=2, arm=(4, 3), been=(5, 6),
                   beenschaal=0.95, achter=(7, 8)),  # groen shirt: alleen de rand ontgroenen  # de jurk (romp) loopt tot de knie; de benen zijn knie-tot-schoen
}
def lees(pad):
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
    return a, lab
def deel(vel, n, schaal=1):
    a, lab = vel; m = (lab == n).astype(np.uint8) * 255; m = np.array(Image.fromarray(m).filter(ImageFilter.MinFilter(3)))
    b = a.copy(); g = b[..., 1]; mx = np.maximum(b[..., 0], b[..., 2])
    rand = m.astype(bool) & ~np.array(Image.fromarray(m).filter(ImageFilter.MinFilter(5))).astype(bool)  # alleen de buitenrand ontgroenen (groene kleren blijven groen)
    b[..., 1] = np.where(rand & (g > mx + 10), mx + 10, g)
    im = Image.fromarray(np.dstack([b, m]).astype(np.uint8)); im = im.crop(im.getbbox())
    return im.resize((round(im.size[0] * schaal), round(im.size[1] * schaal)), Image.LANCZOS) if schaal != 1 else im
def mouw(im, kleur, pols):  # blote arm: alles boven de pols in de kleur van het jasje (met dezelfde schaduw)
    a = np.array(im).astype(float); h = a.shape[0]; rij = int(h * pols); s = a[:rij, :, :3]; l = s.mean(-1, keepdims=True) / max(1, np.percentile(s.mean(-1)[a[:rij, :, 3] > 0], 70))
    a[:rij, :, :3] = np.clip(np.array(kleur) * l * 1.05, 0, 255); return Image.fromarray(a.astype(np.uint8))
def houding(F, voor, benen, s):  # s = -1 … 1: welk been stapt naar voren
    doek = Image.new('RGBA', (900, 1400)); ox, oy = 450, 650 - abs(s) * 10
    def zet(im, cx, ty, hoek=0):
        if hoek: im = im.rotate(-hoek, center=(im.size[0] / 2, 0), resample=Image.BICUBIC)
        doek.alpha_composite(im, (round(ox + cx - im.size[0] / 2), round(oy + ty)))
    romp, hoofd = deel(voor, F['romp']), deel(voor, F['hoofd'])
    def kap(im, alleenRand):  # bruine schouderkapjes (ronde uiteinden) in de kleur van de mouw
        a = np.array(im).astype(int); W, H = a.shape[1], a.shape[0]; r, g, b = a[..., 0], a[..., 1], a[..., 2]; m = (r > 90) & (r < 200) & (g > 40) & (g < 115) & (b < 75) & (r - g > 40)
        if alleenRand: k_ = np.zeros(a.shape[:2], bool); k_[:, :int(W * 0.3)] = True; k_[:, int(W * 0.7):] = True; m &= k_
        else: m[int(H * 0.35):] = False
        l = a[..., :3].mean(-1) / 105; a[m, :3] = np.clip(np.array(F['kapjes']) * l[m][:, None], 0, 255); return Image.fromarray(a.astype(np.uint8))
    if F.get('kapjes'): romp = kap(romp, True)
    def vlak(im, bovenFr, randen):  # donkere ronde kapjes gelijkmaken aan de stof eromheen (mediaan van de stof)
        a = np.array(im).astype(int); H, W = a.shape[:2]; zone = np.zeros((H, W), bool); zone[:int(H * bovenFr)] = True
        if randen: zone[:, int(W * 0.28):int(W * 0.72)] = False
        stof = a[int(H * 0.3):int(H * 0.6)][a[int(H * 0.3):int(H * 0.6), :, 3] > 0][:, :3]; med = np.median(stof, 0)
        d = np.abs(a[..., :3] - med).sum(-1); m = zone & (a[..., 3] > 0) & (d > 25) & (d < 120) & (a[..., :3].sum(-1) > 120)
        a[m, :3] = med; return Image.fromarray(a.astype(np.uint8))
    if F.get('vlak'): romp = vlak(romp, 0.35, True)
    armen = [deel(voor, n) for n in F['arm']]
    if F.get('mouw'): armen = [mouw(a, F['mouw'], F['pols']) for a in armen]
    if F.get('kapjes'): armen = [kap(a, False) for a in armen]
    if F.get('vlak'): armen = [vlak(a, 0.3, False) for a in armen]
    bn = [deel(benen, n, F['beenschaal']) for n in F['been']]
    for i, b in enumerate(bn):  # het stappende been wordt iets korter (knie buigt naar de kijker toe)
        til = max(0, s if i == 0 else -s) * 26
        if til: b = b.resize((b.size[0], round(b.size[1] - til)), Image.LANCZOS)
        zet(b, (-1 if i == 0 else 1) * romp.size[0] * (0.17 if F.get('jurk') else 0.24), -12 - (22 if F.get('jurk') else 0))
    zet(romp, 0, -romp.size[1] + 10)
    for i, a in enumerate(armen): zet(a, (-1 if i == 0 else 1) * (romp.size[0] / 2 - 28), -romp.size[1] + 70, hoek=(6 if i == 0 else -6) * s)
    zet(hoofd, 0, -romp.size[1] - hoofd.size[1] + 42)
    return doek.crop(doek.getbbox())
if __name__ == '__main__':
    naam = sys.argv[1]; uit = sys.argv[2] if len(sys.argv) > 2 else '.'; F = FIG[naam]
    voor = lees(F['voor']); benen = voor if F['benen'] == F['voor'] else lees(F['benen']); strip = Image.new('RGBA', (113 * 4, 192)); toon = []
    for i in range(4):
        f = houding(F, voor, benen, math.sin(i / 4 * 2 * math.pi)); toon.append(f)
        hh = 166; f = f.resize((round(f.size[0] * hh / f.size[1]), hh), Image.LANCZOS)
        if f.size[0] > 111: f = f.resize((111, round(f.size[1] * 111 / f.size[0])), Image.LANCZOS)
        strip.alpha_composite(f, (i * 113 + (113 - f.size[0]) // 2, 188 - f.size[1]))
    strip.save(os.path.join(uit, f'lopen-voor-{naam}.png'))
    o = Image.new('RGB', (sum(t.size[0] + 30 for t in toon) + 30, max(t.size[1] for t in toon) + 20), (250, 240, 220)); x = 15
    for t in toon: o.paste(t, (x, 10), t); x += t.size[0] + 30
    o.save(os.path.join(uit, f'gen-voor-{naam}.png'))
