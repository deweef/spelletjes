# Instrumentgeluiden voor de muziek in Pizzabaas 2 (16 nov): uit de FluidR3-soundfont (Creative Commons Naamsvermelding 3.0,
# via github.com/gleitz/midi-js-soundfonts) een handvol noten per instrument, om de 3 halve tonen (de rest = toonhoogte verschuiven).
# Gebruik: python3 extra/klank_knip.py <map met de gedownloade <instrument>-mp3.js> -> pizza/klank/<instrument>.json = { midi: base64-mp3 }
import sys, re, json, os
NOOT = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
BEREIK = { 'accordion': (48, 86), 'acoustic_bass': (28, 55), 'acoustic_guitar_nylon': (45, 76), 'string_ensemble_1': (45, 79) }
map_ = sys.argv[1]
for ins, (lo, hi) in BEREIK.items():
    t = open(os.path.join(map_, ins + '-mp3.js')).read(); uit = {}
    for naam, data in re.findall(r'"([A-G]b?\d)":\s*"data:audio/mp3;base64,([^"]+)"', t):
        m = re.match(r'([A-G]b?)(\d)', naam); midi = NOOT[m[1]] + (int(m[2]) + 1) * 12
        if lo <= midi <= hi and (midi - lo) % 3 == 0: uit[midi] = data
    json.dump(uit, open(f'pizza/klank/{ins}.json', 'w'), separators=(',', ':')); print(ins, len(uit), os.path.getsize(f'pizza/klank/{ins}.json'))
