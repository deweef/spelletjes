# Instrumentgeluiden voor muziek in de spellen (16 nov): uit de FluidR3 GM-soundfont van Frank Wen (Creative Commons Naamsvermelding 3.0,
# als mp3 per noot via github.com/gleitz/midi-js-soundfonts). Per instrument een handvol noten (om de 3 halve tonen; de speler js/muziek.js
# verschuift de toonhoogte voor de noten ertussen), effecten alleen de noten die we gebruiken.
# Gebruik: download https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/<instrument>-mp3.js naar een map, dan
#   python3 extra/klank_knip.py <die map>   -> klank/<instrument>.json = { midi: base64-mp3 }
import sys, re, json, os
NOOT = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
# instrument: (laagste, hoogste, stap) of een lijst met precies deze midi-noten
BEREIK = {
    'accordion': (48, 86, 3), 'acoustic_bass': (28, 55, 3), 'acoustic_guitar_nylon': (45, 76, 3), 'string_ensemble_1': (45, 79, 3),   # italiaans
    'overdriven_guitar': (52, 88, 3), 'distortion_guitar': (40, 67, 3), 'electric_bass_pick': (28, 55, 3),                            # rock
    'clarinet': (50, 86, 3), 'tuba': (28, 58, 3),                                                                                      # volks
    'violin': (55, 91, 3), 'cello': (36, 66, 3), 'acoustic_grand_piano': (36, 87, 3),                                                  # klassiek
    'tubular_bells': [72, 76], 'glockenspiel': [84, 91, 96], 'applause': [60], 'telephone_ring': [60],                                 # effecten
}
map_ = sys.argv[1]; os.makedirs('klank', exist_ok=True)
for ins, b in BEREIK.items():
    pad = os.path.join(map_, ins + '-mp3.js')
    if not os.path.exists(pad): print('ontbreekt:', pad); continue
    t = open(pad).read(); uit = {}
    for naam, data in re.findall(r'"([A-G]b?\d)":\s*"data:audio/mp3;base64,([^"]+)"', t):
        m = re.match(r'([A-G]b?)(\d)', naam); midi = NOOT[m[1]] + (int(m[2]) + 1) * 12
        if (midi in b) if isinstance(b, list) else (b[0] <= midi <= b[1] and (midi - b[0]) % b[2] == 0): uit[midi] = data
    json.dump(uit, open(f'klank/{ins}.json', 'w'), separators=(',', ':')); print(ins, len(uit), os.path.getsize(f'klank/{ins}.json'))
