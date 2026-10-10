# Spelletjes – instructies voor Claude Code

## Wat dit is
Een familie-app met browserspelletjes, gehost via GitHub Pages op https://deweef.github.io/spelletjes/.
Alles in het Nederlands (teksten, knoppen, uitleg). De spelers zijn een gezin met kinderen: houd het
vrolijk, eerlijk en niet eng.

## Hoe de site werkt (niet kapotmaken)
- `index.html` is de startpagina. Hij leest `spellen.json` en toont per spel een tegel. Onderaan staat
  een reservelijst (`RESERVE`) voor als `spellen.json` niet laadt: houd die gelijk aan `spellen.json`.
- `sw.js` is een service worker die alles offline bewaart. Hij bewaart vooraf het `bestand` en `plaatje`
  uit `spellen.json`; alle andere bestanden (zoals de JS en modellen van Orkenstorm 3D) worden bewaard
  zodra ze een keer met internet geladen zijn. Niet aanpassen tenzij nodig.
- Elk 2D-spel is één los HTML-bestand in de hoofdmap (kasteelsprong, koekjesschuiver, kikkersprong,
  skirun, piratenbluf, orkenstorm). Laat die ongemoeid tenzij erom gevraagd wordt.
- Een nieuw spel toevoegen = bestand(en) neerzetten + een regel in `spellen.json` (naam, omschrijving,
  bestand, plaatje, stand) + een plaatje van 640x400 (jpg).
- Een spel dat nog niet af is krijgt `"concept": true` in `spellen.json`; de startpagina zet er dan een
  rood label "Concept, nog in de maak" bij. Haal het weg als het spel af is.
- Elk spel heeft linksboven een terugknop `<a class="terug" href="./">‹</a>` (in een submap: `href="../"`).

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

## Orkenstorm 3D (`orkenstorm3d/`)
Wat er hierna gebouwd wordt (namen per speler, tussenstukjes tussen levels, twee blokken op de
startpagina, level 5 en 6) staat in `orkenstorm3d/PLAN.md`. Lees dat eerst.

De pc-versie van Orkenstorm, in 3D. Level 1 (Het nieuwe dorp), 2 (De orks komen eraan), 3 (De gevangen
werkers) en 4 (De Donkere Mijnen) zijn speelbaar; levels 5 en 6 uit `orkenstorm.html` moeten nog (namen in `BINNENKORT` in `js/data.js`).
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
  bruggen (forest bridge, op tegels `=`).
- Gevangenis (level 3): dungeon wood-structure met castle metal-gate als tralies; de gevangen werkers zijn
  echte Kenney-mannetjes in het model (hun mixers staan in `model.userData.mixers`).
- De Donkere Mijnen (level 4, `dungeon: 1`): dungeon wall op `#`/`t`, graveyard lantern-candle met
  PointLight op fakkels `t`, dungeon stairs op de uitgang `E`, tonnen en banieren als versiering, donkere
  rook in plaats van wolken, warm schemerlicht (`bouwKerker` in main.js). Skelet = graveyard
  character-skeleton; genezer = mens op krukken (characters aid-crutch) met witte kap; Sir Lodewijk =
  mens met gouden helm en rode pluim (`held`, zit gevangen met de animatie `sit` tot je bij hem bent).
  Genezer en Sir Lodewijk rijden nooit in een rolstoel. Sir Lodewijk hoeft naast de trap te staan om te winnen.
- Nog te doen (voor latere levels): orkentoren, stal, ridder, rovers, roverkamp en de abdij.
- Level 5 heet in 2D "Het Woud van Elwynn"; Elwynn is een Warcraft-naam. Geef het in 3D een eigen naam.
  Gebruik eigen namen en teksten, geen namen of verhaalteksten uit Warcraft (auteurs- en merkrecht).
- Blocky Characters en animated-characters-protagonists: moderne figuurtjes, passen niet.
- "Modellen: Kenney.nl" staat op het titelscherm.
