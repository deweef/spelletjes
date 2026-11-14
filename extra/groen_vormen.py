# losse figuren op een groen vel: componenten (met een beetje dilatie zodat losse pixels bij hun figuur horen), gesorteerd in rijen
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
def vormen(pad, min_opp=3000):
    a = np.array(Image.open(pad).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    groen = (g > 140) & (g > r + 50) & (g > b + 50); vol = ~groen
    vol = ndimage.binary_opening(vol, iterations=1); lab, n = ndimage.label(ndimage.binary_dilation(vol, iterations=4))
    uit = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        m = (lab[sl] == i) & vol[sl]
        if m.sum() < min_opp: continue
        uit.append((sl[0].start, sl[0].stop, sl[1].start, sl[1].stop))
    uit.sort(key=lambda v: (v[0] // 120, v[2]))
    return a, groen, uit
def knip(a, groen, box):
    y0, y1, x0, x1 = box; s = a[y0:y1, x0:x1].copy(); gm = groen[y0:y1, x0:x1]
    r, g, b = s[..., 0], s[..., 1], s[..., 2]; rand = (g > r + 20) & (g > b + 20) & ~gm; s[..., 1] = np.where(rand, np.maximum(r, b), g)
    alfa = np.where(gm, 0, 255).astype(np.uint8); im = Image.fromarray(np.dstack([s, alfa]).astype(np.uint8))
    return im.crop(im.getbbox())
if __name__ == '__main__':
    a, gm, v = vormen(sys.argv[1])
    for i, b in enumerate(v): print(i, b, 'h', b[1] - b[0], 'w', b[3] - b[2])

# Voor figuren die zelf groen zijn (Luigi, de crew): achtergrond = wat vanaf de rand bereikbaar is en dicht bij de achtergrondkleur ligt.
def vormen_flood(pad, min_opp=3000, afstand=80):
    from scipy import ndimage
    a = np.array(Image.open(pad).convert('RGB')).astype(int); bg = np.median(a[2:8, 2:8].reshape(-1, 3), 0)
    dicht = np.sqrt(((a - bg) ** 2).sum(-1)) < afstand; lab, n = ndimage.label(dicht)
    rand = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    groen = np.isin(lab, list(rand)) | (np.sqrt(((a - bg) ** 2).sum(-1)) < 40)  # ook ingesloten stukjes pure achtergrond (tussen haar en oor)
    vol = ndimage.binary_opening(~groen, iterations=1)
    lab2, n2 = ndimage.label(ndimage.binary_dilation(vol, iterations=4)); uit = []
    for i, sl in enumerate(ndimage.find_objects(lab2), 1):
        if ((lab2[sl] == i) & vol[sl]).sum() < min_opp: continue
        uit.append((sl[0].start, sl[0].stop, sl[1].start, sl[1].stop))
    uit.sort(key=lambda v: (v[0] // 120, v[2])); return a, groen, uit
