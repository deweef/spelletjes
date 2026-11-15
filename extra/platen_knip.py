# Pizzabaas 2: logo, dartpijltje en verhaalplaten van ChatGPT (15 nov) klaarmaken voor het spel
# pizza/logo-chatgpt.png -> pizza/logo.png (groen weg, 900 breed); pizza/doel-chatgpt.png -> pizza/doel.png (96 x 96)
# pizza/plaatN-chatgpt.png -> pizza/plaatN.jpg (1280 breed, jpg)
import sys, glob, os; sys.path.insert(0, 'extra')
from groen_vormen import knip
import numpy as np
from PIL import Image
def zonder_groen(pad):
    # achtergrond = groen dat vanaf de rand bereikbaar is, plus ingesloten stukjes pure achtergrond (het gat in de A);
    # de blaadjes op de pizza en de groene veer van het pijltje zijn donkerder en blijven staan
    from scipy import ndimage
    a = np.array(Image.open(pad).convert('RGB')).astype(int); bg = np.median(a[2:8, 2:8].reshape(-1, 3), 0); afst = np.sqrt(((a - bg) ** 2).sum(-1))
    lab, n = ndimage.label(afst < 90); rand = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    groen = np.isin(lab, list(rand)) | (afst < 35)
    buur = ndimage.binary_dilation(groen, iterations=2) & ~groen; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    rand = buur & (g > r + 60) & (g > b + 60) & (g > 180); s = a.copy(); s[..., 1] = np.where(rand, np.maximum(r, b), g) # alleen de groene rand ontgroenen
    im = Image.fromarray(np.dstack([s, np.where(groen, 0, 255)]).astype(np.uint8)); return im.crop(im.getbbox())
im = zonder_groen('pizza/logo-chatgpt.png'); im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS); im.save('pizza/logo.png', optimize=True); print('logo', im.size)
im = zonder_groen('pizza/doel-chatgpt.png'); k = 96 / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS); im.save('pizza/doel.png', optimize=True); print('doel', im.size)
for p in sorted(glob.glob('pizza/plaat[0-9]-chatgpt.png')):
    im = Image.open(p).convert('RGB'); im = im.resize((1280, round(im.height * 1280 / im.width)), Image.LANCZOS); uit = p.replace('-chatgpt.png', '.jpg'); im.save(uit, quality=84); print(uit, im.size, os.path.getsize(uit))
