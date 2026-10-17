# Spelletjes – instructies voor Claude Code

## Wat dit is
Een familie-app met browserspelletjes, gehost via GitHub Pages op https://deweef.github.io/spelletjes/.
Alles in het Nederlands (teksten, knoppen, uitleg). De spelers zijn een gezin met tieners (14+): vrolijk en
eerlijk, en de humor mag best stout (knipogen naar bier, blowen, plassen in het bos). Niet grof of gemeen, en
bedenk dat de site openbaar is.

## Hoe de site werkt (niet kapotmaken)
- `index.html` is de startpagina. Hij leest `spellen.json` en toont per spel een tegel. Onderaan staat
  een reservelijst (`RESERVE`) voor als `spellen.json` niet laadt: houd die gelijk aan `spellen.json`.
- `sw.js` is een service worker die alles offline bewaart. Hij bewaart vooraf het `bestand` en `plaatje`
  uit `spellen.json`; alle andere bestanden (zoals de JS en modellen van Orkenstorm 3D) worden bewaard
  zodra ze een keer met internet geladen zijn. Niet aanpassen tenzij nodig.
- Elk 2D-spel is één los HTML-bestand in de hoofdmap (kasteelsprong, koekjesschuiver, kikkersprong,
  skirun, piratenbluf, orkenstorm, fladderfeest). Laat die ongemoeid tenzij erom gevraagd wordt.
- Fladderfeest (`fladderfeest.html`, in de stijl van Flappy Bird, met eigen naam en plaatjes): beginscherm met
  de dieren in twee kolommen, elk een eigen wereld en record per speler (`fladderfeest_<figuur>:<naam>`). Patatmeeuw (strand) en
  Fladderkip (boerderij, zwaar: valt snel, fladdert krachtig; legt een ei als ze af is) en Rockkraai
  (rockfestival bij nacht, versterkers en truss met spots, plectrums, rockmuziek met vervormde gitaar en drums)
  en Hommelbrom (bollenveld, licht, windvlagen vanaf 3 punten, reuzentulpen en molenwieken, nectar, draaiorgelwals
  in 3/4 met `maat: 6`) en Roodborstje
  (wintertuin met sneeuw, vogelhuisjes en ijspegels, besjes, speeldoosmuziek, iets ruimere gaten via `ruimer`), Piratenpapegaai
  (piratenzee bij zonsondergang, masten met zeil en rumtonnen, goudstukken, accordeon in 6/8, krappere gaten) en
  Jetpackpinguïn (Zuidpool met zuiderlicht, ijsbergen, visjes, synthmuziek; een tik geeft een korte raketduw via
  `stuw`/`stuwKracht`) zijn klaar. Volgorde in `FIGUREN` = van makkelijk naar
  moeilijk (roodborstje, meeuw, hommel, kip, kraai, papegaai, pinguïn); elk dier speel je vrij met 20, 25, 30, ...
  punten met het dier ervoor (`nodig`/`open`; wie al een record heeft met een dier houdt het open).
  Grote tocht (knop bovenaan, `tocht`): alle dieren achter elkaar vanaf het Roodborstje; finishvlag bij 20, 25, 30, ...
  punten (`doelTocht`, pinguïn heeft geen finish), punten tellen op (`totaal`), elke 25 punten een extra vogeltje
  (`geraakt`: leven eraf, 100 beelden onkwetsbaar), beste tocht in `fladderfeest_tocht:<naam>`; een finish telt ook als
  record van dat dier en speelt het volgende vrij.
  Met streken (links, standaard) / Gewoon (rechts) op het beginscherm (`streken`, onthouden in `fladderfeest_streken`): records per modus
  (`fladderfeest_<dier>_streken:<naam>`, ook de tocht), vrijspelen telt beide modi. Streken vanaf 3 punten (`strekenStap`,
  `tekenStreken`): roodborst sneeuwbui (`bui`), meeuw patatdieven en papegaai kanonskogels (`gevaren`, zonder waarschuwing; het kanon knalt
  hoorbaar), papegaai ook een magneetpiraat op de tonnen die het goudstuk wegtrekt (`p.piraat`, `magneet`, `piraat`; duikt
  in de ton als je over hem heen vliegt), hommel windvlagen (alleen met streken), kip schuivende hooibalen en kraai dansende versterkers (`p.amp`),
  pinguïn brandstof (`brandstof`, flap kost 7, visjes +40, meter links). Moeilijkheid: gat en snelheid tot ~40 punten (`gat`,
  `tempo`), na 50 punten nog heel langzaam wat krapper en sneller. Elk dier roept tijdens het spelen om de 8-16 seconden
  iets met een geluidje en een tekstwolkje (`ROEP`, `roepT`, `roepBel`).
  Online scorebord: Google Spreadsheet van Marcel met het Apps Script uit `extra/scorebord.gs` (web-app, voor alle spellen;
  `BORD_URL`). GET zonder parameters = top 10 per onderdeel en modus (JSON), `?actie=opslaan&naam&onderdeel&modus&score`
  = insturen. Knop 🏆 Scorebord op het beginscherm (`scorebordScherm`), insturen gaat automatisch op het eindscherm (`autoInsturen`: alleen met een gekozen naam en alleen een persoonlijk record dat beter is dan wat al ingestuurd is, bijgehouden in `fladderfeest_ingestuurd:<naam>`); laatste lijst
  in `fladderfeest_bord` voor offline. script.google.com is vanuit de cloudomgeving niet bereikbaar: test met
  Playwright `route` en een nagemaakt antwoord.
  Een nieuw dier = regel in `FIGUREN`, deuntje in `MUZIEK`, wereld in `WERELDEN`, plaatje in `tekenDier()`. Elke wereld staat in `WERELDEN` (achtergrond,
  grond, hindernis, bonus, wat er valt, het figuur). `fladderfeest.html#tegel` tekent het plaatje voor de startpagina.
  Muziek: per figuur een eigen deuntje in `MUZIEK` (zelf gecomponeerd, Web Audio, geen bestanden), knopje
  rechtsboven of toets M, onthouden in `fladderfeest_muziek`. Meeuw = zeemansliedje met hoempa; kip = boerendeuntje
  met getokkel; kraai = rock (`stijl: 'rock'`); roodborstje = speeldoos; hommel = draaiorgelwals;
  papegaai = accordeon; pinguïn = synth.
- Een nieuw spel toevoegen = bestand(en) neerzetten + een regel in `spellen.json` (naam, omschrijving,
  bestand, plaatje, stand) + een plaatje van 640x400 (jpg).
- Een spel dat nog niet af is krijgt `"concept": true` in `spellen.json`; de startpagina zet er dan een
  rood label "Concept, nog in de maak" bij. Haal het weg als het spel af is.
- De startpagina vraagt "Wie speelt er?". Namen staan in localStorage `spelers` (JSON-lijst), de huidige
  speler in `speler`. Spellen bewaren voortgang per naam als `<sleutel>:<naam>` (Orkenstorm 3D:
  `orkenstorm3d_lvl:Sanne`), met de oude sleutel zonder naam als beginwaarde. Verwijder je een speler, dan
  verdwijnen alle sleutels die op `:<naam>` eindigen.
- De spellen staan in twee blokken: 2D (telefoon en tablet) en 3D (pc, `"soort": "3d"` in spellen.json).
  Op een aanraakscherm of smal scherm staat 2D bovenaan, anders 3D.
- Elk spel heeft linksboven een terugknop `<a class="terug" href="./">‹</a>` (in een submap: `href="../"`).
  In Fladderfeest en Orkenstorm 3D gaat die knop tijdens het spelen eerst terug naar het menu van het spel; alleen
  vanuit dat menu naar de startpagina.

## Werkwijze
- De familie mag meespelen met concept-versies. Zet wijzigingen daarom direct op `main` (dan publiceert
  GitHub Pages ze binnen een minuut), maar alleen nadat het getest is.
- Werk in kleine stappen en vertel per stap wat er te zien en te testen is.
- Test in een browser voordat je klaar meldt, en let op fouten in de console. In de cloudomgeving:
  start een webserver in de hoofdmap. Gebruik niet de kale `python3 -m http.server`: die kan maar een paar
  verbindingen tegelijk aan, waardoor Kenney-modellen of hun colormap soms niet laden. Neem een
  `http.server.ThreadingHTTPServer` met `request_queue_size = 128`. Herlaad een pagina in een test pas als
  hij klaar is met laden, anders geven afgebroken downloads valse waarschuwingen en gebruik Playwright met Chromium
  (`chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })`
  zodat WebGL werkt). Orkenstorm 3D zet `window.__test = { G, update, camera, controls, uMesh, kies }` klaar om
  de spelstatus te lezen en de tijd vooruit te spoelen. Wacht na het starten van een level een paar seconden
  voordat je schermposities uitrekent: de camera schuift in de trage testbrowser nog even na.

## Koekjesschuiver 3D (`koekjesschuiver3d/`, concept)
De pc-versie van koekjesschuiver.html met echte 3D-natuurkunde, zodat koekjes op elkaar stapelen; minder en grotere
koekjes dan in 2D (rustiger). Alles in `js/spel.js`; `lib/` heeft three.js r160 en cannon-es 0.20 (MIT, npm
`cannon-es`). Zelfde spelregels en codes als 2D (0-3 koekjes, 10+k traktaties, 20+k koekjesfiguren, krachten,
badges); de schuif is een kinematisch blok onder een vaste achterwand, koekjes die over de voorrand vallen zijn
gewonnen, over de zijkant (na `ZIJ_EIND`) weg. Koekjes op hun kant krijgen een zetje (`omvalT`). Gewonnen figuren
springen omhoog (`springers`), het likkoekje extra groot met "Likkie-likkie!" hardop. Opslag in `koekjesschuiver3d`.
`#tegel` verbergt de knoppen voor het plaatje. Tafel smal en lang (`HB`, `VOOR`); de camera zoekt bij elk schermformaat
de dichtstbijzijnde stand waarbij de tafel tussen bovenbalk en krachtknoppen past (`pasAan`). Gewone koekjes en figuren
hebben een bolle, aflopende rand (`bolKoek`, alleen het beeld; de natuurkunde blijft een cilinder). Opslag per speler
(`koekjesschuiver3d:<naam>`). Munten (🪙): gouden koekje en gebakje 1, figuur 3, badge 10, dubbele figuren ruilen 5
(knop bij de badges). Winkel (`#winkel`): achtergronden in `THEMAS` (bakkerij gratis, mint met roze; halloween, kermis, strand,
winternacht met sneeuw, ruimte), elk met lucht, kastkleuren, tafeltint (`tafel`), lampjes (`lamp`) en een plaatje op de
achterwand (`zetThema`). Gewonnen koekjes vallen in een opvangbak (`BAK`, met natuurkunde) en verdwijnen na 2,5 s.
Hoofdscherm (`#menu`, `modus`: menu/vrij/wedstrijd/einde): Verder met je tafel (vrij spelen), Wedstrijd, Scorebord,
Winkel, Badges en je tafels (alleen de gekochte, `tekenMenu`). De natuurkunde staat stil in het menu. Natuurkunde in vaste stapjes van 1/60 s (`tijdOver`), zodat het op elk apparaat
gelijk werkt. Spraak (Likkie-likkie, ook in 2D) wordt bij de eerste tik gewekt (`stemWakker`, `nlStem`). De terugknop gaat
altijd eerst naar het hoofdscherm, vanuit het hoofdscherm naar alle spellen. "Nieuwe tafel" (bij de badges) wist alleen
tafel, punten en gebakjes. Wedstrijd (`startWedstrijd`): nieuwe volle tafel, 50 koekjes, geen aanvulling en geen koekjes
terug bij winst; klaar als de koekjes op zijn en er 7 s niets valt (25 s als er nog een Koekjesregen/Bakplaat klaarstaat).
Je eigen tafel blijft intussen in de opslag (`bewaar` schrijft dan alleen munten, badges e.d.). Beste wedstrijd in
`wedBest`. Online scorebord (zelfde Apps Script, geen aanpassing nodig: de lijst zonder `spel` bevat alles behalve
ork3d): alleen `koek3d_wedstrijd`, modus `gewoon`, automatisch ingestuurd na een wedstrijd (met naam, alleen
verbeteringen). Tafel-items (`ITEMS`, code 100+i): vallen alleen op hun eigen tafel (kans `ITEM_KANS` = 1/25 per koekje, niet in een
wedstrijd), winnen geeft 25 punten, 5 munten, een grap en een effect (`doe`, animaties in `effecten`), en tafelbadges
`it_<id>` (eerste keer) en `it5_<id>` (5 keer), geteld in `itemsGewonnen`; tafelbadges staan apart in het badgescherm
(`#tafelbadges`) en tellen niet mee in de 15. Halloween: pompoen (vleermuizen jagen de koekjes naar voren) en spookje
(zweeft over de tafel en laat 5 halloweenkoekjes vallen, code 4, 5 punten). Een nieuw item = regel in `ITEMS` met
`maak()` (3D-model, origin in het midden) en `doe()`. Plannen: tafels (ook kerst), extra krachten, badges met niveaus.

## Orkenstorm 3D (`orkenstorm3d/`)
Wat er hierna gebouwd wordt (namen per speler, tussenstukjes tussen levels, twee blokken op de
startpagina, level 5 en 6) staat in `orkenstorm3d/PLAN.md`. Lees dat eerst.

De pc-versie van Orkenstorm, in 3D. Level 1 (Het nieuwe dorp), 2 (De orks komen eraan), 3 (De gevangen
werkers), 4 (De Donkere Mijnen) en 5 (Het Woud van Wilgendaal) zijn speelbaar; level 6 uit `orkenstorm.html` moet nog
(naam in `BINNENKORT` in `js/data.js`).
Een level gaat pas open als het vorige gewonnen is (`orkenstorm3d_lvl` in localStorage). Elk level in
`LEVELS` heeft een `voortgang(S)` voor de doeltekst in de bovenbalk.

Opbouw:
- `index.html`: de pagina, opmaak en menu's (titel, uitleg per level, einde, pauze).
- `js/data.js`: eenheden, gebouwen, moeilijkheden en levels (overgenomen uit `orkenstorm.html`).
- `js/spel.js`: de spelregels (paden, werkers, bouwen, trainen, vechten, golven, winnen/verliezen).
  Posities van mannetjes in pixels (32 per tegel), net als in 2D, zodat regels makkelijk over te nemen zijn.
- `js/modellen.js`: de 3D-modellen. Gebruikt de Kenney-modellen als die geladen zijn, anders de eigen
  blokjesmodellen (reserve). Gebouwen worden in elkaar gezet uit losse Kenney-stukken (`BOUW` in
  modellen.js: kasteel, boerderij, kazerne; plus `kenneyMijn`, steigers en pijlen).
- `js/kenney.js`: laadt de Kenney-modellen uit `assets/` (lijst `LIJST`) en maakt mannetjes met botten
  en animaties (idle, walk, attack-melee-right, interact-right, holding-left, emote-yes, die,
  wheelchair-sit, wheelchair-move-forward, ...). Spullen hangen aan de botten `arm-left`/`arm-right`/`head`/`torso`.
- `assets/<pakket>/`: alleen de Kenney-modellen die het spel gebruikt, met per pakket `Textures/colormap.png`.
- `js/geluid.js`: geluidjes en stemmen. Elk mannetje komt uit Nederland, Engeland, Duitsland, Italië of Frankrijk
  (om de beurt uit een geschudde zak, dus eerlijk verdeeld) en praat altijd zijn eigen taal.
- `js/main.js`: 3D-weergave, camera, muis/toetsen, bovenbalk en paneel.
- `js/tussen.js`: tussenstukjes na het winnen ("Verder met het verhaal"). Gegevens per level in data.js als
  `tussen: { uitgang, begin, eind, kaart }`. Een groepje eigen mannetjes loopt naar `uitgang`; onderweg
  krijgen een paar van hen een grap uit `GRAPPEN` (enkel, plassen, eekhoorn, en per land voor werkers),
  elke grap hooguit één keer en er komt altijd minstens één aan. Tekstwolkjes in de eigen taal, verteller
  in het Nederlands, knop Overslaan, daarna een tekstkaart en de uitleg van het volgende level. Mannetjes
  krijgen daarvoor `u.pose` (animatie), `u.tempo` (snelheid), `u.zigzag` (dronken) en `u.hidden` (weg).
  Extra velden: `spreker` (een werker vertelt eerst iets), `grappen` (deze grappen eerst), `duur` (seconden).
  `soort: 'overval'` (2 → 3) is anders: feest bij het kasteel, nacht (`api.nacht(f)`), orks komen (via
  `plaats` in spel.js) en sleuren de werkers mee. Tijdens een filmpje (`G.tussen`) vallen orks niet aan.
  Beginfilmpje: `intro: { van, naar, begin, orks, bouw, eind }` bij een level (nu level 1: aankomst, kasteel
  bouwen, grapje per land in `BOUWGRAP`). Speelt vanzelf alleen de eerste keer per speler
  (`orkenstorm3d_intro<level>`), daarna via de knop "Filmpje nog eens zien" in de uitleg. Tests die level 1
  starten zetten eerst `localStorage.orkenstorm3d_intro0 = '1'`.
- Online scorebord (zelfde Google Spreadsheet en Apps Script als Fladderfeest, `extra/scorebord.gs`, `BORD_URL` in
  main.js; opvragen met `?spel=ork3d`): `ork3d_ver_<moeilijkheid>` = verst gekomen ((level-1)*100 + procent, of level*100
  bij winst; `procent(S)` per level in data.js, beste waarde in `G.beste`) en `ork3d_tijd_l<n>_<moeilijkheid>` (kleine letters: het script accepteert alleen a-z, 0-9 en _) = snelste
  overwinning in seconden (`G.t / 60`, filmpjes en pauze tellen niet). Insturen gaat automatisch op het eindscherm (`autoInsturen`, alleen met naam en alleen verbeteringen, `orkenstorm3d_ingestuurd:<naam>`), 🏆 Scorebord in het
  titelmenu (`#bord`).
- `lib/`: three.js r160 (`three.module.js`) en `OrbitControls.js`, lokaal (geen CDN) zodat het offline
  werkt. Blijf bij deze versie; nieuwe three-onderdelen ook uit r160 halen (npm: `three@0.160.0`).
- Kleuren: r160 doet het kleurbeheer zelf (sRGB). Geef kleuren gewoon als hex op; alleen
  canvas-texturen krijgen `texture.colorSpace = THREE.SRGBColorSpace`.

Landen (eigen aan de 3D-versie, zie `LAND` in `js/data.js`): werkers houden iets uit hun land vast en
kunnen iets extra's:
- Nederlander, kaasje: zuinig, brengt 2 goud extra mee per vracht.
- Engelsman, kopje thee: hakt sneller hout, maar houdt af en toe theepauze.
- Duitser, pul: grondig, bouwt sneller.
- Italiaan, pizza: deelt pizza uit en geneest gewonde mannetjes vlakbij.
- Fransman, stokbrood: is maar kort in de goudmijn.
Af en toe (1 op 6) rijdt een mannetje in een rolstoel; dat is alleen voor de lol. Idee voor later: de
genezer op krukken (`aid-crutch` uit mini-characters).

Spelregels: neem ze over uit `orkenstorm.html`: werkers hakken hout en halen goud, boerderijen geven
voedsel, kasteel/kazerne/stal trainen eenheden met een wachtrij, torens schieten, orks vallen in golven
aan, moeilijkheid Makkelijk/Normaal/Moeilijk, de levels en hun doelen, wolken over onontdekt gebied.
Stemmen zijn wel anders dan in 2D: daar Nederlands/Engels/Duits, hier ook Italiaans en Frans (zie hierboven).
Nieuwe mannetjes verschijnen op het vrijste vakje naast het gebouw, en mannetjes die niets doen schuiven
uit elkaar (`vrijePlek` en `uitElkaar` in `spel.js`).

Besturing:
- Laptop eerst (dit is de pc-versie), maar het moet op een telefoon niet crashen.
- Linkermuis: kiezen en opdrachten geven. Ctrl/Shift-klik: meer kiezen of weer weghalen. Shift + slepen:
  rechthoek om mannetjes trekken. Knoppen in het paneel: Alle werkers, Alle soldaten, Meer kiezen
  (voor aanraken), Loslaten, en per soort ✕ om ze uit de keuze te halen. Links slepen: camera draaien.
  Rechts slepen: schuiven. Scrollen: zoomen. Pijltjes/WASD: schuiven.
- Het laden van de Kenney-modellen gaat in groepjes van 6 met tot 3 pogingen per bestand (`laad` in kenney.js).
- Toetsen: P = pauze, Escape = selectie loslaten. Rechts klikken tijdens bouwen = stoppen met bouwen.
- Bouwen met de muis gebeurt precies waar de schaduw staat (ook als de camera nog naschuift).

### Kenney-modellen
De Kenney-pakketten (CC0) staan als zip in de centrale map `bronnen/` (zie `bronnen/LEESMIJ.md` voor welk
pakket bij welk spel hoort; zips die in de hoofdmap geüpload worden, daarheen verplaatsen). kenney.nl is
vanuit de cloudomgeving niet bereikbaar. Gebruik de bestanden uit `Models/GLB format/` en kopieer alleen
wat het spel echt gebruikt naar `orkenstorm3d/assets/<pakket>/`, samen met `Textures/colormap.png` van dat
pakket (elk pakket heeft een eigen colormap met dezelfde naam). Zet nieuwe modellen ook in `LIJST` in
`js/kenney.js`.
- Stijl: houd het bij de vrolijke, effen gekleurde pakketten (castle-kit, mini-forest, mini-dungeon,
  survival-kit, ...). De retro-fantasy-kit heeft fotoachtige stenen en donkere daken en past daar niet bij.
- Al gebruikt: mannetjes (dungeon: mens, ork; forest: boogschutter), wapens, bijl (survival), rolstoel
  (characters), bomen (forest, castle), kasteel (castle-kit), boerderij (forest: schuurtje, akkers, hek),
  kazerne (castle-kit toren, houten muur, ballista, banier; forest tent en schietschijf), goudmijn
  (dungeon rotsen, stut, kist, munt; survival rotsen), steigers (dungeon wood-support), pijlen (forest),
  wachttoren (castle-kit zeshoekige toren), orkenhut (survival tentdoek, kampvuur, palissade),
  bruggen (castle-kit bridge-straight, met een pijler in het midden; het wegdek ligt gelijk met de oever),
  wachttoren met boogschutter onder een dak op palen, muur (castle wall), smederij (forest schuurtje,
  survival aambeeld, tonnen, schoorsteen), houtzagerij (forest schuurtje, survival slijpsteen, planken,
  boomstammen), katapult (castle siege-catapult; een voertuig zonder botten, `voertuig: true`).
- Muur, smederij, houtzagerij en katapult (vanaf level 2, net als 2D): muurstukken plaats je achter elkaar
  tot Escape; orks zonder weg slaan de dichtstbijzijnde muur kapot; de katapult (kazerne) vraagt eerst een
  smederij én houtzagerij, schiet stenen met spatschade (gebouwen x1.8) en zoekt zelf vijandelijke gebouwen.
- Goudmijnen: bordje met het resterende goud (rood knipperend als bijna leeg), werkers lopen vanzelf naar de
  volgende mijn, `mineCap` per level.
- Het uitlegvakje rechtsonder laat klikken door (`pointer-events: none`).
- Gevangenis (level 3): dungeon wood-structure met castle metal-gate als tralies; de gevangen werkers zijn
  echte Kenney-mannetjes in het model (hun mixers staan in `model.userData.mixers`).
- De Donkere Mijnen (level 4, `dungeon: 1`): dungeon wall op `#`/`t`, graveyard lantern-candle met
  PointLight op fakkels `t`, dungeon stairs op de uitgang `E`, tonnen en banieren als versiering, donkere
  rook in plaats van wolken, warm schemerlicht (`bouwKerker` in main.js). Skelet = graveyard
  character-skeleton; genezer = mens op krukken (characters aid-crutch) met witte kap; Sir Lodewijk =
  mens met gouden helm en rode pluim (`held`, zit gevangen met de animatie `sit` tot je bij hem bent).
  Genezer en Sir Lodewijk rijden nooit in een rolstoel. Sir Lodewijk hoeft naast de trap te staan om te winnen.
- Het Woud van Wilgendaal (level 5, kaart 36x40): ridder = mens met zilveren helm en blauwe pluim op een
  zelfgemaakt blokjespaard (`maakPaard`/`opPaard` in modellen.js, er zit geen paard in de Kenney-pakketten;
  de ruiter speelt `wheelchair-sit`, de paardenbenen galopperen in main.js). Rijdt nooit in een rolstoel.
  Stal = forest schuurtje, graveyard hooibalen, hek, emmer en een paard. Orkentoren = forest building-structure
  en building-platform met ladder en een speerwerper bovenop; schiet net als de wachttoren (`otowers`).
  Orkenbaas = grote ork met hoornhelm. Orkenhutten hebben hier meer levens (`hutHp`).
- Tussenstukje 4 → 5: Sir Lodewijk bedankt de groep (`held: 1`), grappen `schat` (schatkist) en `krukken`
  (genezer raakt achter), `vertrek` = pas later weglopen omdat de trap vlakbij is, `zonder` = geen plassen
  of eekhoorn onder de grond.
- Nog te doen (voor latere levels): rovers, roverkamp en de abdij.
- Level 5 heet in 2D "Het Woud van Elwynn"; Elwynn is een Warcraft-naam. In 3D heet het "Het Woud van Wilgendaal".
  Gebruik eigen namen en teksten, geen namen of verhaalteksten uit Warcraft (auteurs- en merkrecht).
- Blocky Characters en animated-characters-protagonists: moderne figuurtjes, passen niet.
- "Modellen: Kenney.nl" staat op het titelscherm.
