# Instrumentgeluiden voor de muziek in de spellen (js/muziek.js)

Uit de **FluidR3 GM**-soundfont van Frank Wen, als mp3 per noot van https://github.com/gleitz/midi-js-soundfonts.
Licentie: Creative Commons Naamsvermelding 3.0 (https://creativecommons.org/licenses/by/3.0/). De naamsvermelding staat in de aftiteling van het spel.

Per instrument om de 3 halve tonen een noot (`extra/klank_knip.py`); het spel verschuift de toonhoogte voor de noten ertussen.
Bestanden: `<instrument>.json` = { midi-nummer: base64-mp3 }. Welke instrumenten en noten: `BEREIK` in `extra/klank_knip.py`, welke stijl welke
instrumenten gebruikt: `STIJL` in `js/muziek.js`. De naamsvermelding staat in Pizzabaas 2 in de aftiteling; zet hem ook in andere spellen die dit gebruiken.
