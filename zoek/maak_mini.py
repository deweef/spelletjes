"""Maakt de rondjes voor de levelkaart: zoek/mini/<id>.jpg (128x128, het midden van het plaatje).
Draaien vanuit de hoofdmap na het toevoegen van een level: python3 zoek/maak_mini.py"""
import re
from PIL import Image
s = open('zoekplaatje.html', encoding='utf-8').read()
for id_, beeld in re.findall(r"\{ id: '(\w+)'.*?beeld: '(zoek/[\w.]+)'", s):
    im = Image.open(beeld).convert('RGB'); W, H = im.size; z = min(520, W, H)
    im.crop(((W - z) // 2, (H - z) // 2, (W + z) // 2, (H + z) // 2)).resize((128, 128), Image.LANCZOS).save(f'zoek/mini/{id_}.jpg', quality=78)
    print(id_)
