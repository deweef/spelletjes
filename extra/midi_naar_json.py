# MIDI-bestand -> klank/liedjes/<naam>.json voor js/muziek.js (Muziek.speelMidi). Alleen vrije MIDI's (CC0 / publiek domein / CC BY met naamsvermelding).
# Gebruik: python3 extra/midi_naar_json.py <bestand.mid> <naam> [van=sec] [tot=sec] [sporen=1,2,4]
# JSON: { duur, sporen: [{ naam, prog, drum, hoog (gemiddelde toonhoogte), noten: [[start, duur, midi, sterkte 0-1], …] }] } (tijden in seconden)
import sys, struct, json
pad, naam = sys.argv[1], sys.argv[2]; opt = dict(a.split('=') for a in sys.argv[3:])
van, tot = float(opt.get('van', 0)), float(opt.get('tot', 1e9)); kies = [int(x) for x in opt['sporen'].split(',')] if 'sporen' in opt else None
d = open(pad, 'rb').read(); assert d[:4] == b'MThd'
fmt, ntr, div = struct.unpack('>HHH', d[8:14]); i = 8 + struct.unpack('>I', d[4:8])[0]
def vlq(b, j):
    v = 0
    while True:
        c = b[j]; j += 1; v = (v << 7) | (c & 127)
        if c < 128: return v, j
sporen, tempos = [], [(0, 500000)]
for t in range(ntr):
    assert d[i:i + 4] == b'MTrk'; L = struct.unpack('>I', d[i + 4:i + 8])[0]; b = d[i + 8:i + 8 + L]; i += 8 + L
    j = tik = 0; run = None; aan = {}; noten = []; tn = ''; prog = {}; kanalen = set()
    while j < len(b):
        dt, j = vlq(b, j); tik += dt; s = b[j]
        if s == 0xFF:
            ty = b[j + 1]; l, j = vlq(b, j + 2); dat = b[j:j + l]; j += l
            if ty == 0x51: tempos.append((tik, int.from_bytes(dat, 'big')))
            if ty == 3: tn = dat.decode('latin1')
            continue
        if s in (0xF0, 0xF7): l, j = vlq(b, j + 1); j += l; continue
        if s & 0x80: run = s; j += 1
        ty, k = run & 0xF0, run & 15
        if ty in (0x80, 0x90, 0xA0, 0xB0, 0xE0): n, v = b[j], b[j + 1]; j += 2
        else: n = b[j]; j += 1; v = 0
        if ty == 0xC0: prog[k] = n
        if ty == 0x90 and v > 0: aan[(k, n)] = (tik, v); kanalen.add(k)
        elif ty in (0x80, 0x90) and (k, n) in aan: a, vel = aan.pop((k, n)); noten.append((a, tik, n, vel, k))
    if noten: sporen.append({ 'naam': tn, 'noten': noten, 'prog': prog.get(min(kanalen), 0), 'drum': 9 in kanalen })
tempos.sort()
def sec(tik):  # ticks -> seconden, met tempowissels
    s = 0.0; vt, us = 0, 500000
    for tt, u in tempos:
        if tt >= tik: break
        s += (tt - vt) * us / div / 1e6; vt, us = tt, u
    return s + (tik - vt) * us / div / 1e6
uit = []
for nr, sp in enumerate(sporen, 1):
    if kies and nr not in kies: continue
    nn = [[round(sec(a) - van, 3), round(sec(e) - sec(a), 3), n, round(v / 127, 2)] for a, e, n, v, k in sp['noten'] if van <= sec(a) < tot]
    if nn: uit.append({ 'naam': sp['naam'] or f'spoor {nr}', 'prog': sp['prog'], 'drum': sp['drum'], 'hoog': round(sum(x[2] for x in nn) / len(nn), 1), 'noten': nn })
duur = round(max(x[0] + x[1] for s in uit for x in s['noten']), 2)
json.dump({ 'duur': duur, 'sporen': uit }, open(f'klank/liedjes/{naam}.json', 'w'), separators=(',', ':'))
print(naam, 'duur', duur, 's;', [(s['naam'], s['prog'], s['hoog'], len(s['noten'])) for s in uit])
