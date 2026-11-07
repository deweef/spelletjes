# Pixelpikkers (`pixelpikkers.html`, concept)

Gemaakt voor Anja. Een eigen spel in het genre "kleuren wegtikken uit een pixelplaatje" (idee van een reclame voor zo'n spel,
maar met eigen naam, plaatjes en uiterlijk).

## Hoe het werkt
- Bovenaan een pixelschilderijtje, in het midden **5 sporen**, onderin kolommen met gekleurde blokken met een getal.
- Alleen het bovenste blok van een kolom is te tikken (witte rand). Het blok gaat naar een vrij spoor; daar vliegen
  pikkertjes (vogeltjes in die kleur) één voor één naar een hokje van die kleur en pikken het weg. Het getal telt af.
- Een pikkertje kan alleen een hokje pakken waar het **in een rechte lijn** bij kan (van links, rechts, boven of onder
  is er niets tussen): `buiten()`. Kan een spoor niet verder, dan blijft het staan met een 💤 en gaat vanzelf verder
  zodra er iets vrijkomt.
- Alle 5 sporen bezet en niemand kan pikken (of geen blokken meer) = **Vast!** Eén keer per level kan er een
  **hulpspoor** (6e spoor) bij, of opnieuw beginnen.
- Knoppen bovenaan: ▶▶ 1x/2x snelheid, 🔊 geluid (`pixelpikkers_geluid`), ↻ opnieuw.
- Terugknop: in het spel eerst naar het menu, vanuit het menu naar de startpagina.

## Levels
- `PLAATJES`: 30 emoji met naam en grapje (Aardbei, Biertje, Wijntje voor Anja, Cactus "niet tegenaan plassen"...).
  Na level 30 begint de lijst opnieuw. Voortgang (hoogste vrijgespeelde level) in `pixelpikkers_lvl:<naam>`.
- Het pixelplaatje wordt in de browser gemaakt van de emoji (`maakPlaatje`): groot tekenen, bijsnijden, per hokje de
  meest voorkomende kleur uit de vaste lijst `KLEUREN` (21 kleuren), kleine/te veel kleuren samenvoegen (`beperk`).
  Het plaatje ziet er dus per toestel iets anders uit (Apple/Android/Windows-emoji). Heeft een toestel geen
  kleuren-emoji, dan komt er een reserve-hartje (`RESERVEPLAATJE`).
- Vanaf level 4 krijgt het plaatje een gekleurde achtergrond (`achtergrond`: banden, ringen, schuine strepen of
  blokjes; 1 kleur t/m level 7, 2 t/m 13, daarna 3). Daardoor zit het plaatje ingepakt en wordt het lastiger.
- `instelling(lvl)`: grootte (16 tot 32 hokjes), aantal kleuren, blokgroottes (`min`/`max`), aantal kolommen (3-5) en
  `vast`: hoeveel sporen de maker zelf maximaal laat wachten (1, 2 of 3).
- **Altijd oplosbaar**: `maakBlokken` speelt het level zelf (met het zaadje van het level, dus elke keer dezelfde puzzel)
  en onthoudt de blokken in volgorde (`o`). De kolommen houden die volgorde aan, dus wie in die volgorde tikt komt er
  altijd door. Maker en spel kiezen hetzelfde hokje (`kiesHokje`: eerst het dichtst bij de rand).
  Getest: alle levels 1-36 lukken in volgorde; willekeurig tikken wint vroege levels bijna altijd, level 25-30 nog maar
  2-3 van de 10 keer.

## Test
`window.__test = { G, update, startLevel, kiesBlok, L }`: `startLevel(n)`, dan `kiesBlok(kolom)` en `update(0.05)` in een lus.
