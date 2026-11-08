# Pixelpikkers (`pixelpikkers.html`, concept)

Gemaakt voor Anja. Een eigen spel in het genre "kleuren wegtikken uit een pixelplaatje" (idee van een reclame voor zo'n spel,
maar met eigen naam, plaatjes en uiterlijk).

## Hoe het werkt
- Bovenaan een pixelschilderijtje, in het midden **5 sporen**, onderin kolommen met gekleurde blokken met een getal.
- Alleen het bovenste blok van een kolom is te tikken (witte rand). Het blok gaat naar een vrij spoor; daar lopen
  pikkertjes (vogeltjes in die kleur) één voor één het bord op en pikken een hokje van die kleur weg. Het getal telt af.
- **Lopen, niet vliegen** (wens van Marcel/Anja): de pikkertjes komen via de onderkant het bord op en lopen over lege
  plekken (en over de lege rand om het plaatje) naar hun hokje; ze kunnen niet over hokjes heen (`looppad`, `looprooster`).
  Een hokje is te pakken als het aan de buitenrand of naast een lege plek ligt; een gat in het plaatje geeft dus toegang
  naar binnen. Ingesloten gaatjes worden bij het maken opgevuld (`vulGaatjes`), zodat elke lege plek bereikbaar is.
  Welke hokjes te pakken zijn wordt per kleur bijgehouden in `bord.rand` (`nieuwBord`, `haalWeg`, `telVrij`).
- Ze kiezen altijd het **dichtstbijzijnde** hokje vanaf hun ingang (spoor j van n komt op x = (j+0.5)/n van de
  onderrand binnen; `kiesHokje`).
- Kan een spoor niet verder, dan blijft het staan met een 💤 en gaat vanzelf verder zodra er iets vrijkomt.
- Alle 5 sporen bezet en niemand kan pikken (of geen blokken meer) = **Vast!** Eén keer per level kan er een
  **hulpspoor** (6e spoor) bij, of opnieuw beginnen.
- Knoppen bovenaan: ▶▶ 1x/2x snelheid, 🔊 geluid (`pixelpikkers_geluid`), ↻ opnieuw. De kop schuift onder de
  iPhone-klok vandaan (`veilig()`, env(safe-area-inset-top)).
- Terugknop: in het spel eerst naar het menu, vanuit het menu naar de startpagina.

## Levels
- `PLAATJES`: 46 emoji, vooral **eten en beestjes** (wens van Anja), om en om: aardbei, lieveheersbeestje, banaan, bij,
  hamburger, rups, ... met daarna nog paddenstoel, octopus, cactus, eenhoorn. Elk met een naam en een grapje.
  Na de laatste begint de lijst opnieuw. Voortgang (hoogste vrijgespeelde level) in `pixelpikkers_lvl:<naam>`.
  Nieuwere emoji (🪲🪳🪰) ontbreken op oude toestellen; dan komt er een reserve-hartje (`RESERVEPLAATJE`).
- Het pixelplaatje wordt in de browser gemaakt van de emoji (`maakPlaatje`): groot tekenen, bijsnijden, per hokje de
  meest voorkomende kleur uit de vaste lijst `KLEUREN` (21 kleuren), kleine/te veel kleuren samenvoegen (`beperk`).
  Het plaatje ziet er dus per toestel iets anders uit (Apple/Android/Windows-emoji).
- Vanaf level 2 zit het plaatje in een **lijst** van ringen in achtergrondkleuren (`inlijsten`, `achtergrond`; elk 5e
  level blokjes in plaats van ringen). Aantal lijstkleuren: 3 (level 2-4), 4 (5-14), 5 (15+). Meer kleuren = moeilijker.
- `instelling(lvl)`: grootte (16 tot 32 hokjes), blokgroottes (`min`/`max`), `vast` (hoeveel sporen de maker zelf
  laat wachten), `lastig`, `spreiding` (blokken 'van later' bovenop), `lijst`, kolommen (3-5), `toets` en `doel`.
  Om te testen kan `window.__afstel = {...}` instellingen overschrijven.

## Schilderijen (wens van Marcel; Anja is dol op Van Gogh)
- Tweede reeks in het menu: 🖼️ Schilderijen, eigen voortgang in `pixelpikkers_kunst:<naam>`. `startLevel(n,'kunst')`.
- `KUNST` in `pixelpikkers.html`: 15 schilderijen als pixeldata (titel `t`, maker `m`, grapje `g`, kleuren `pal`,
  `rijen` met per hokje een teken 0-9/a-j). 13 van Van Gogh (Sterrennacht, Zonnebloemen, Amandelbloesem, Slaapkamer,
  Caféterras, Zelfportret 1889, Irissen, Sterrennacht boven de Rhône, Korenveld met cipressen, De oogst, Camille
  Roulin, Armand Roulin, La Mousmé), plus De schreeuw (Munch) en De grote golf (Hokusai). Allemaal publiek domein.
- Gemaakt met `extra/pixelkunst.py` (lijst in `extra/pixelkunst-lijst.json`): verkleinen tot max 34 hokjes, iets
  feller, kleuren terugbrengen (mediancut, max 10, te gelijke en te kleine kleuren samenvoegen).
  Bronplaatjes: Wikimedia is vanuit de cloud niet bereikbaar; ze kwamen via raw.githubusercontent.com uit
  giatin110406-pixel/MobileDev (`Neo-Brutalism Locket/server/styles/van_gogh/`, kopieën van Commons op 1280 px) en
  jcjohnson/neural-style (`examples/inputs/the_scream.jpg`), lengstrom/fast-style-transfer (`examples/style/wave.jpg`).
  Nieuwe schilderijen zoeken: `gh api -X GET search/code -f q='"bestandsnaam.jpg"'` en dan via raw ophalen.
- Het schilderij komt midden op een bord van 40x40 met een lijst van 3 ringen (goud, hout, zwart, zilver of wijnrood:
  de kleuren die het minst op het schilderij lijken; `LIJST`). De eigen kleuren worden achter `KLEUREN` gezet
  (`kunstPlaatje`). Moeilijkheid als eten-level 8 tot 20, maar de maker laat zelf maar 2 sporen wachten (`vast=2`).

## Wereldwonderen (wens van Marcel)
- Derde reeks: 🌍 Wereldwonderen, eigen voortgang in `pixelpikkers_wonder:<naam>`, `startLevel(n,'wonder')`.
  Schilderijen en wereldwonderen delen dezelfde code via `REEKS` (data, sleutel, woorden, emoji, knop en rooster in het menu).
- `WONDEREN`: 15 foto's: de zeven nieuwe wereldwonderen (Chinese Muur, Petra, Christus de Verlosser, Machu Picchu,
  Chichén Itzá, Colosseum, Taj Mahal), de piramides van Gizeh, Eiffeltoren, Vrijheidsbeeld, Big Ben, Operagebouw van
  Sydney, Moai van Paaseiland, Akropolis en Uluru. Veld `f` = maker en licentie van de foto (meest CC BY-SA); dat
  staat op het eindscherm, want bij CC BY(-SA) hoort naamsvermelding.
- Bronnen (via raw.githubusercontent.com, kopieën van Commons met bronvermelding): mojeebahmed/triventurex
  (`game_editions/world-tour/images/landmarks/`, CREDITS.md daar) en blayckik/-----------2
  (`apps/web/public/images/guess/`, CREDITS.md daar; Chinese Muur, Taj Mahal, Colosseum, Eiffeltoren, Vrijheidsbeeld).
  Lijst met uitsneden: `extra/pixelkunst-wonderen.json`. Afgevallen omdat ze als pixelplaatje onherkenbaar werden:
  Sagrada Família, Angkor Wat, Neuschwanstein.

## Altijd oplosbaar, maar niet met wild tikken
- `maakBlokkenEen` speelt het level zelf en onthoudt de blokken in volgorde (`o`); de kolommen houden die volgorde aan.
- `maakBlokken` maakt tot 30 puzzels (vast zaadje per level, dus elke keer dezelfde puzzel). Alleen puzzels die
  `proef` in de goede volgorde haalt (meteen doortikken zodra er een spoor vrij is, met maar **4** sporen tegelijk en met
  looptijd per pikkertje zoals in het echte spel, ook nog eens 0,4 en 2,5 keer zo snel) tellen. Zonder die speling liep het echte spel soms
  vast doordat de pikkertjes onderweg zijn en dus later pikken dan de proef. Daarvan wordt de puzzel
  gekozen waarbij **wild tikken** (`proef` met toeval, `toets` = 10 keer) het vaakst vastloopt, tot het `doel` gehaald is
  (level 2-4: hooguit de helft lukt, 5-9: een derde, 10+: een zesde). Kost ongeveer 0,2 seconde.
- Gemeten in het echte spel (wild tikken, 8 keer): level 2-3 lukt bijna altijd, level 5 de helft, level 8+ meestal
  vast (0-3 van de 8). In de goede volgorde lukken alle 46 levels, 15 schilderijen en 15 wereldwonderen.
- Eerder waren er twee versies: pikkertjes die over de hokjes heen vlogen en alleen in een rechte lijn konden pakken
  (gaf "ruimte maar hij pakt ze niet"), en zonder lijst (veel te makkelijk: wild tikken won altijd).

## Test
`window.__test = { G, update, startLevel, kiesBlok, L }`: `startLevel(n)`, dan `kiesBlok(kolom)` en `update(0.05)` in een lus.
`G.wildWint` = hoe vaak wild tikken lukte bij het maken (van de 10).
