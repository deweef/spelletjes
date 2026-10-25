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
  `stuw`/`stuwKracht`) en Vuurdraak (drakenburcht bij nacht met vulkaan, kasteeltorens, edelstenen, doedelzakmuziek met bromtoon;
  elke edelsteen = een vuurbal (`spuw`, `vuurballen`) die de volgende toren wegbrandt: het gat wordt 60 groter, `p.brand`) en Koekoek
  (Zwarte Woud met bergen en dennen, koekoeksklokken op dennenstammen onder en klokgewichten boven, taartpuntjes, polka) en Spookuil
  (spookbos bij volle maan, grafstenen onder en kale takken met spinnenweb boven, snoepjes, orgel in mineur `stijl: 'orgel'`) en
  Discoflamingo (disco met spotlights en discobal, lichtgevende discozuilen, muzieknootjes, disco `stijl: 'disco'`) en Toekan
  (jungle met waterval en palmen, tempelzuilen onder en lianen boven, banaantjes, samba `stijl: 'samba'`) en Vreemde Vogel (lapjesvogel
  in het circus, circustrommels onder en tentdoek boven, ballonnetjes, circusmars met hoempa) zijn klaar.
  Menu: bovenaan 🛍️ Winkel en 🏆 Scorebord, dan de Grote tocht en Met streken/Gewoon, daaronder de dieren in 3 kolommen
  (past tot 15 dieren; een halve laatste rij staat in het midden).
  Geheim dier Gouden Arend (`geheim: true`, laatste in `FIGUREN`): in het menu een kaartje met "?" tot je met alle andere
  dieren goud (50) hebt; bergtoppen boven de wolken, onweerswolken boven, sterretjes, orkestmuziek (`stijl: 'orkest'`), sneller
  (`snel: 1.12`) en de krapste gaten; streek: bliksem (`flits`, 50 beelden waarschuwing met een stippellijn, dan inslag).
  De Grote tocht gaat langs `TOCHT` (alle dieren behalve het geheime); op het scorebord staat zijn tabblad pas als je hem zelf hebt. Kroontje (`kroon`) op een dier in het menu bij 100 punten.
  Winkel (knop 🛍️ Winkel bovenaan in het menu, `winkelScherm`, dieren zonder bonus getekend via `dierAlleen`): elke gepikte bonus = 1 muntje in de spaarpot (`spaar`, ook
  in de tocht per etappe); 20 muntjes cadeau om te beginnen. Per dier 4 spulletjes in `KLEDING` (de kraai 5, met een elektrische gitaar) (plek hoed/bril/lijf, prijs
  20-80), eerst passen (`pasKleding`), dan kopen en aan-/uittrekken. Opslag per speler in `fladderfeest_kast:<naam>`
  ({ munten, gekocht, aan: { dier: { hoed, bril, lijf } } }). Getekend via `metKleren`/`aankleden` aan het eind van elke
  dier-tekening, op de plekken uit `ANKER`; ingebouwde hoedjes en brillen (kraai, papegaai, pinguïn, koekoek) verdwijnen als
  je zelf iets op die plek draagt (`draagt`). Een nieuw dier = ook een regel in `ANKER` en 4 regels in `KLEDING`. Volgorde in `FIGUREN` = van makkelijk naar
  moeilijk (roodborstje, meeuw, hommel, kip, kraai, papegaai, pinguïn, draak, koekoek, uil, flamingo, toekan, vreemd; de geheime arend als laatste;
  nog plek voor 1 dier in het menu); elk dier speel je vrij met 20, 25, ... 45
  punten met het dier ervoor, nieuwere dieren (vanaf de draak) steeds met 30 (`nodig`/`open`; wie al een record heeft met een dier houdt het open).
  Grote tocht (knop bovenaan, `tocht`): alle dieren achter elkaar vanaf het Roodborstje; finishvlag bij 20, 25, 30, ...
  punten (`doelTocht`, pinguïn heeft geen finish), punten tellen op (`totaal`), elke 25 punten een extra vogeltje
  (`geraakt`: leven eraf, 100 beelden onkwetsbaar), beste tocht in `fladderfeest_tocht:<naam>`; een finish telt ook als
  record van dat dier en speelt het volgende vrij.
  Met streken (links, standaard) / Gewoon (rechts) op het beginscherm (`streken`, onthouden in `fladderfeest_streken`): records per modus
  (`fladderfeest_<dier>_streken:<naam>`, ook de tocht), vrijspelen telt beide modi. Streken vanaf 3 punten (`strekenStap`,
  `tekenStreken`): roodborst sneeuwbui (`bui`), meeuw patatdieven en papegaai kanonskogels (`gevaren`, zonder waarschuwing; het kanon knalt
  hoorbaar), papegaai ook een magneetpiraat op de tonnen die het goudstuk wegtrekt (`p.piraat`, `magneet`, `piraat`; duikt
  in de ton als je over hem heen vliegt), hommel windvlagen (alleen met streken), kip schuivende hooibalen en kraai dansende versterkers (`p.amp`),
  pinguïn brandstof (`brandstof`, flap kost 7, visjes +40, meter links), draak katapultstenen die in een boog omhoog komen (`steen`, `zw`), koekoek: bij de helft van de klokken springt een koekoekje omhoog het gat in (`p.klok`, eerst gaat het deurtje op een kier),
  uil: spookjes die tussen twee palen op en neer zweven (`spook`, `amp`), flamingo: discoballen die aan een ketting onder de bovenste
  zuil door het gat slingeren (`p.bal`, `discobalAanKetting`), toekan: kokosnoten die eerst wiebelen en dan uit de lianen
  vallen (`p.noot`, gevaar `kokos` met `g.p`), vreemde vogel: de hik (`hik`: 25 beelden 'h…', dan 'HIK!' en een sprongetje). Moeilijkheid: gat en snelheid tot ~40 punten (`gat`,
  `tempo`), na 50 punten nog heel langzaam wat krapper en sneller. Elk dier roept tijdens het spelen om de 8-16 seconden
  iets met een geluidje en een tekstwolkje (`ROEP`, `roepT`, `roepBel`).
  Online scorebord: Google Spreadsheet van Marcel met het Apps Script uit `extra/scorebord.gs` (web-app, voor alle spellen;
  `BORD_URL`). GET zonder parameters = top 10 per onderdeel en modus (JSON), `?actie=opslaan&naam&onderdeel&modus&score`
  = insturen. Knop 🏆 Scorebord bovenaan het beginscherm (`scorebordScherm`), insturen gaat automatisch op het eindscherm (`autoInsturen`: alleen met een gekozen naam en alleen een persoonlijk record dat beter is dan wat al ingestuurd is, bijgehouden in `fladderfeest_ingestuurd:<naam>`); laatste lijst
  in `fladderfeest_bord` voor offline. Bij het openen zet `herstelVanBord` records terug die met deze naam (hoofdletters maken niet uit) op het
  scorebord staan maar lokaal ontbreken of lager zijn (nieuwe telefoon, gewiste browser); alleen verhogen. De startpagina maakt van een naam met andere
  hoofdletters dezelfde speler (`kies`). Hetzelfde script heeft ook `doPost` met `actie=leer`: het geheime leerlogboek van de
  Leerhoek (deweef/leren, `leerlog.js`), tabbladen 'Leerhoek' en 'Leerhoek overzicht'; wordt nooit via GET teruggegeven, behalve
  aan de Scores-app (`scores/`, eigen manifest en icoon, niet gelinkt vanaf de startpagina): `?actie=ouder&sleutel=..` geeft
  alle scores (met rijnummer) en het leerlogboek, `?actie=wis&sleutel=..&rij&naam&score` wist één score. De eerste sleutel
  ooit wordt vast (Script-eigenschap `OUDER_SLEUTEL`). script.google.com is vanuit de cloudomgeving niet bereikbaar: test met
  Playwright `route` en een nagemaakt antwoord.
  Een nieuw dier = regel in `FIGUREN`, deuntje in `MUZIEK`, wereld in `WERELDEN`, plaatje in `tekenDier()`. Elke wereld staat in `WERELDEN` (achtergrond,
  grond, hindernis, bonus, wat er valt, het figuur). `fladderfeest.html#tegel` tekent het plaatje voor de startpagina.
  Muziek: per figuur een eigen deuntje in `MUZIEK` (zelf gecomponeerd, Web Audio, geen bestanden), knopje
  rechtsboven of toets M, onthouden in `fladderfeest_muziek`. Meeuw = zeemansliedje met hoempa; kip = boerendeuntje
  met getokkel; kraai = rock (`stijl: 'rock'`); roodborstje = speeldoos; hommel = draaiorgelwals;
  papegaai = accordeon; pinguïn = synth; draak = doedelzak (`stijl: 'doedelzak'`); koekoek = polka (`stijl: 'polka'`).
- Fotopuzzel (`fotopuzzel.html`, concept): legpuzzel van een foto uit `FOTOS` (foto's in `puzzel/`, ongeveer 2000 px breed;
  nu Athene) of een eigen foto van het toestel (wordt niet geüpload en niet bewaard). Aantal stukjes kiezen (`AANTALLEN`,
  12 t/m 500; `raster` kiest kolommen x rijen), keuze "Allemaal recht" of "Door elkaar gedraaid" (`#liggen`; tik = kwartslag, alleen rechte stukjes klikken vast).
  Stukjes met knobbels (`rand`/`vorm`, Path2D, elk stukje vooraf getekend in een eigen canvas), klikken aan buren vast
  (groepen) en op het bord vast (`vastklikken`). Hulpjes: Voorbeeld (klein rechtsboven `#mini`, tik = groot met zoomen/schuiven/dubbeltik `#groot`), Randjes, Sorteren op kleur, alles in beeld.
  Zoomen met twee vingers of muiswiel, schuiven door op een lege plek te slepen. Voortgang in `fotopuzzel:<naam>`
  (zaadje voor de vormen + posities), record per foto/aantal in `fotopuzzel_<foto>_<n>[d]:<naam>`.
- Zoekplaatje (`zoekplaatje.html`, concept): zoek de voorwerpen van een level (per potje willekeurig `PER_POTJE` = 25 uit alles wat in het plaatje staat, dus meer voorwerpen = meer afwisseling; teller "🔍 nog N" via `totaal`/`zetTeller`) in een druk
  stripplaatje in de stijl van een Van Haasteren-puzzel; bovenin staan er steeds 10 (`actief`). Tik op een voorwerp in het plaatje: staat het bovenin,
  dan zweeft het naar zijn vakje en verdwijnt (`vind`, `.vlieg`), daarna schuift het volgende uit `rij` in. Een voorwerp dat pas later komt geeft
  een melding (`meld`); `kiesVak` licht alleen een vakje op bij een hint. Zoomen met twee vingers/muiswiel, slepen = schuiven, tik = zoeken
  (marge 14 schermpixels), 💡 Hint (15 s wachten, telt als `HINT_STRAF` = 20 s extra). Levels in `LEVELS` met een `id`, tekening `achter`/`voor`,
  voorwerpen `items` ([naam, tekening uit `TEKEN`, x, y, schaal, draai, voorFlag]), `w`/`h` en `auto`. Elke laag wordt één keer vooraf op een eigen
  doek getekend (`vooraf(L, laag)`), dus zware tekeningen kunnen. 1 De rommelkamer (`kamerAchter`/`kamerVoor`/`kamerRommel`/`kruimel`, `STRIP`),
  2 Het postkantoor (2000x1300, `PW`/`PH`, `postAchter`/`postVoor`, `POST`; loketten, postvakjes, rij met klanten via `mens`, postbode met hond, slakkenpost),
  3 Het orkest (2000x1300, `OW`/`OH`; ruim 100 muzikanten via `muzikant(x, y, s, o)` met `INSTR` en grapjes `GAG`, `o.staat` = staand figuur, `o.pak`/`o.broek`/`o.arm`
  = kleuren, vaste willekeur via `rng(zaad)`; `ORKEST` = 35 voorwerpen), 4 Het strand (2000x1300, `SW`/`SH`, `strandAchter`/`strandVoor`, `STRAND`; badgasten
  via `badgast`, zonnebaders via `ligger`, parasols, windschermen, strandtent, ijskar, strandwacht). 5 Het piratenschip (2000x1300, `ZW`/`ZH`, `schipAchter`/`schipVoor`,
  `SCHIP`; opengewerkt schip `ROMP` met dek, kanonnendek en ruim, piraten via `piraat` (bandana `GAG.bandana`, streepjestrui `o.streep`), het water over
  de onderkant buiten de romp in `schipVoor`; de doodskopvlag hangt als voorwerp aan de waslijn, de mast heeft een rode wimpel). Voorwerpen passen bij het plaatje (orkest: instrumenten die
  niemand bespeelt, popcorn, operaglas; postkantoor: postzegel, ansichtkaart, plakband, nummertje; strand: schepje, snorkel, zwemband) en een
  voorwerp wordt nooit ook als afleider getekend (geen muzikant met hetzelfde instrument, geen tweede ijsje, telefoon of zonnebril bij de mensen:
  daarom laten de grapjeslijsten selfie/koffie/boterham weg), anders tikt iemand op de verkeerde. De rommelkamer mag allerlei spul hebben.
  Ideeën voor nieuwe levels (Marcel en Anja): supermarkt, winterkermis, onder water, Orkenstorm-dorp (rolstoel, helm, kaas, pizza, stokbrood, bier, ork), plaats delict (iemand onder een laken met een been eruit). Plus: per level een "stoute figuur" om te vinden
  (zoals de oldtimer) en een nachtlevel waarin je alleen ziet wat in de lichtbundel van je zaklamp valt. Voortgang per speler en per level-id: `zoek_tijd_<id>:<naam>` (snelste tijd incl. hintstraf; een level is
  open als het vorige een tijd heeft, `isOpen`), `zoek_auto_<id>:<naam>` en `zoek_sjaak_<id>:<naam>`. De vroegere fotolevel met wachtwoord is weg (oude sleutels met
  levelnummers worden bij het laden omgezet). Online scorebord (zelfde Apps Script, geen aanpassing nodig): onderdeel `zoek_tijd_<id>`, modus `gewoon`,
  automatisch ingestuurd op het eindscherm (`insturen`, alleen met naam en alleen verbeteringen, `zoek_ingestuurd:<naam>`), 🏆 Scorebord in de
  levelkeuze (`toonBord`, tabjes per level, laatste lijst in `zoek_bord`). `#tegel` tekent de rommelkamer voor de startpagina.
  Een level kan ook een plaatje zijn (bijv. gemaakt met Gemini): `beeld: 'zoek/<naam>.jpg'` in plaats van achter/voor, voorwerpen als
  [naam, x1, y1, x2, y2, (meer vakjes)] in pixels van het plaatje, `auto` = vakje [x1, y1, x2, y2] van de oldtimer in het plaatje; het plaatje wordt
  geladen bij het starten (`L.img`), de vakjes bovenin tonen een uitsnede uit het plaatje (achtergrond weggeknipt met `uitknippen`: overstromen vanaf de rand met de
  mediaan-randkleur; is het resultaat te rafelig of blijft er te weinig over, dan de gewone uitsnede) en gevonden voorwerpen krijgen een groen rondje.
  Gemini-plaatjes staan in `zoek/` (allemaal 1376x768, links en vaste prompt in `zoek/LEESMIJ.md`). Alle levels zijn nu plaatjes: 1 rommelkamer
  (`KAMER_BEELD`), 2 postkantoor (`POST_BEELD`), 3 orkest (`ORKEST_BEELD`), 4 strand (`STRAND_BEELD`), 5 piratenschip (`SCHIP_BEELD`), 6 restaurantkeuken
  (`keuken.jpg`, `KEUKEN_BEELD`), 7 kermis (`KERMIS_BEELD`), 8 serverruimte (id `server`, `SERVER_BEELD`), 9 camping (`CAMPING_BEELD`, Sjaak 3 vakjes),
  10 spookslot (id `spook`, `SPOOK_BEELD`, `zaklamp: 1`: alles donker behalve een lichtcirkel rond de muis of je vinger, `lamp`; bij het eindscherm
  gaat het licht aan), 11 ziekenhuis, 12 dierentuin (id `dieren`), 13 school, 14 vliegveld (id `vlieg`), 15 fotoshoot (id `foto`),
  16 Nachtwacht (Rembrandt op onze manier, mag: publiek domein), 17 onderwaterstadje (id `onderwater`), 18 supermarkt, 19 bruin café (id `cafe`),
  20 ruimtestation (id `ruimte`, `ruimte: 1`: het plaatje draait langzaam rond zijn midden, `draaiHoek`/`naarScherm`/`naarWereld`, en een
  zuurstofmeter linksboven `zuurstof` loopt in ~1 min leeg, elk gevonden voorwerp +14; leeg = level opnieuw). Na level 20 komt de aftakking
  naar Bruegel (spreekwoorden, wat hoort er niet bij, tellen, op volgorde) en later een Sjaak-plaat; nog te bouwen. De getekende versies van 1-5 staan als reserve in
  commentaarregels in `LEVELS` (de tekenfuncties zijn er nog; `#tegel` gebruikt nog de getekende rommelkamer). `orkest-gemini.jpg` is een eerdere versie.
  `auto` en `sjaak` mogen meer vakjes hebben (postkantoor: twee oldtimers), zie `inVak`. Een nieuw level = regel in `LEVELS` en naam in `ZOEK` in `scores/index.html`.
  Sluipende Sjaak (inbreker met streepjestrui, oogmasker, platte pet en geldzak met $; staat in de Gemini-prompt): `sjaak: [x1, y1, x2, y2]`, niet op het
  lijstje; gevonden = politiefluitje (`sSjaak`, `fluit`) + "Hé! Daar sluipt Sjaak weer rond!" en een 🦹 bij het level. Orkest en strand hebben (nog) geen Sjaak.
  Levelmenu en eindscherm scrollen (`.scherm` heeft `overflow-y:auto`, `.kaart` `margin:auto`).
  Level 4 Het strand gebruikt `zoek/strand.jpg` (Gemini, 1376x768) met `STRAND_BEELD` (36 voorwerpen); daar zat geen oldtimer in, dus
  `autoBeeld: 'zoek/oldtimer.png'` (uitgeknipt uit `orkest-gemini.jpg`, doorzichtige achtergrond) zet de Gemini-oldtimer in het vakje `auto` op het plaatje.
  Vakjes nalopen: geen twee voorwerpen mogen elkaars midden raken, en voorwerpen die vaker voorkomen (koffiemok, tamboerijn, pizza) krijgen meer vakjes.
  In elk level staat de zilveren oldtimer (eigen ontwerp zonder merk; geen Lucky Luke of Mercedes-logo, dat is beschermd):
  `auto: [x, y, schaal, draai]` per level, staat niet op het lijstje; gevonden = toeter + "Oh jee, daar is hij weer!" en een 🚗 bij het level.
- Pizzabaas (`pizzabaas.html`, concept, idee van Pizza Tycoon maar met eigen naam en grappen): eigen pizzeria van bovenaf op een raster
  van 12x9 (`W`, `H`, `T`; rij 0-1 keuken met ovens en kok, deur onderaan `DEUR`). Twee standen (`modus`): inrichten (spullen uit `SPUL`
  kopen en neerzetten: tafeltje voor 2, tafel voor 4, plant, jukebox; tik op een tafel = menu met kleedje/kaarsje (`EXTRA`), verplaatsen,
  verkopen; extra ovens en obers in `PERSONEEL`) en open (een werkdag van `DAG` = 120 s, 17:00-22:00). Klantengroepjes zoeken een vrije
  tafel (anders "vol", reputatie omlaag), bestellen, de oven bakt (`BAKTIJD`), een ober brengt de pizza, ze eten en betalen `PRIJS` plus fooi
  (`gezellig`: kleedje, kaarsje, planten dichtbij, jukebox); te lang wachten (`GEDULD`) = boos weg. Reputatie `S.rep` bepaalt hoe vaak er
  klanten komen. Aan het eind huur (`HUUR`) en loon, en een dagoverzicht. Opslag per speler in `pizzabaas:<naam>`. `#tegel` = plaatje.
  Plan: 2 pizza's verzinnen met smaken per buurt, 3 dubieuze klanten en pakketjes-ritjes (geen echte wapens of drugs), 4 sabotage door
  Luigi van de overkant, 5 meer buurten en filialen.
- Songfestival-hits (`songfestival/`, test, nog niet op de startpagina): zelfgeprinte kaartjes in Hitster-stijl (die naam niet op de site
  gebruiken, is een merk). De liedjes zijn geheim: `geheim.js` = `GEHEIM` met de lijst versleuteld (AES-GCM, `slot.js`) met een vaste
  sleutel die in elke QR-code achter het # staat (`?k=<id>#<sleutel>`), plus diezelfde sleutel versleuteld met het wachtwoord (PBKDF2) voor de
  printpagina. Het wachtwoord staat nergens in de repo; Marcel weet het. Lijst aanpassen: in `kaartjes.html` openen met het wachtwoord,
  of in Node met `SLOT.sleutel(ww)` + `SLOT.lijst(K)`; daarna opnieuw versleutelen met DEZELFDE sleutel (anders werken geprinte kaartjes niet
  meer): lijst-items { id, jaar, land, vlag, artiest, titel, spotify (track-id), won }, id's nooit hergebruiken.
  `index.html` = speler: grote ▶ (Spotify Embed IFrame API, `togglePlay`/`loadUri`), de Spotify-speler onder een afdekking behalve zijn
  play-knopje, "Laat zien" toont het antwoord, onderaan 📷 Volgende kaartje = scanner in de pagina (camera via getUserMedia, `lib/jsQR.js`,
  Apache-2.0). `kaartjes.html` = A4 printvellen (6,5 cm, 12 per vel; QR met `lib/qrcode.js`, MIT; achterkanten per rij gespiegeld voor
  dubbelzijdig printen). Spotify-id's zoeken met de Spotify-tool; YouTube en Wikipedia zijn vanuit de cloud niet bereikbaar.
- Een nieuw spel toevoegen = bestand(en) neerzetten + een regel in `spellen.json` (naam, omschrijving,
  bestand, plaatje, stand) + een plaatje van 640x400 (jpg).
- Een spel dat nog niet af is krijgt `"concept": true` in `spellen.json`; de startpagina zet er dan een
  rood label "Concept, nog in de maak" bij. Haal het weg als het spel af is.
- De startpagina vraagt "Wie speelt er?". Namen staan in localStorage `spelers` (JSON-lijst), de huidige
  speler in `speler`. Spellen bewaren voortgang per naam als `<sleutel>:<naam>` (Orkenstorm 3D:
  `orkenstorm3d_lvl:Sanne`), met de oude sleutel zonder naam als beginwaarde. Verwijder je een speler, dan
  verdwijnen alle sleutels die op `:<naam>` eindigen.
- De spellen staan in twee blokken: 3D (`"soort": "3d"` in spellen.json; mooist op de pc, maar werkt ook op een
  telefoon) en 2D. 3D staat altijd bovenaan, ook in het overzicht.
  Bovenaan staat een overzicht (`#overzicht`) met per blok de spellen als knopjes; een tik scrollt naar dat spel
  (anker `spel-<bestandsnaam>`, de tegel licht even op), en elk blok heeft een link "↑ overzicht".
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
gewonnen, over de zijkant (na `ZIJ_EIND`) weg. Koekjes op hun kant (ook bovenop andere of op de schuif) krijgen na 0,5 s een gericht zetje dat ze plat kantelt, steeds harder als ze blijven staan (`omvalT`, `kantT`, `kantN`). Gewonnen figuren
springen omhoog (`springers`), het likkoekje extra groot met "Likkie-likkie!" hardop. Opslag in `koekjesschuiver3d`.
`#tegel` verbergt de knoppen voor het plaatje. Tafel smal en lang (`HB`, `VOOR`); de camera zoekt bij elk schermformaat
de dichtstbijzijnde stand waarbij de tafel tussen bovenbalk en krachtknoppen past (`pasAan`). Gewone koekjes en figuren
hebben een bolle, aflopende rand (`bolKoek`, alleen het beeld; de natuurkunde blijft een cilinder). Lange vinger, knappertje (vierkant met gaatjes), likkoekje (café noir),
speculaasje en krakeling hebben hun echte vorm (`VORMEN`, `vormGeo`: uitgesneden vorm met afgeronde rand, natuurkunde
een platte doos). Opslag per speler
(`koekjesschuiver3d:<naam>`). Munten (🪙): gouden koekje en gebakje 1, figuur 3, badge 10, dubbele figuren ruilen 5
(knop bij de badges). Winkel (`#winkel`): achtergronden in `THEMAS` (bakkerij gratis, mint met roze; halloween, kermis, strand,
winternacht met sneeuw, ruimte), elk met lucht, kastkleuren, tafeltint (`tafel`), lampjes (`lamp`) en een plaatje op de
achterwand (`zetThema`). Gewonnen koekjes vallen in een opvangbak (`BAK`, met natuurkunde) en verdwijnen na 2,5 s.
Hoofdscherm (`#menu`, `modus`: menu/vrij/wedstrijd/einde): Verder met je tafel (vrij spelen), Wedstrijd, Scorebord,
Winkel, Badges en je tafels (alleen de gekochte, `tekenMenu`). De natuurkunde staat stil in het menu. Natuurkunde in vaste stapjes van 1/60 s (`tijdOver`), zodat het op elk apparaat
gelijk werkt. Spraak (Likkie-likkie, ook in 2D) wordt gewekt bij de eerste klik of het loslaten van een tik (`stemWakker` op click/touchend, niet pointerdown: dat telt op een iPhone niet; `nlStem`); start de stem niet binnen 1,5 s, dan piept een zelfgemaakt stemmetje (`nepStem`); testknop 🔊 in het badgescherm (`#stemtest`). De terugknop gaat
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
(zweeft over de tafel en laat 5 halloweenkoekjes vallen, code 4, 5 punten). Strand: kwal (15 s glibberig: minder wrijving via `glibber`,
`cmTafel`/`cmKoek`, tafel glimt blauw), roze flamingo (volgende 10 koekjes roze, code 5, 3 punten, `rozeQ`), parasol (20 s
muurtjes), krab (loopt zijwaarts over de tafel en duwt koekjes naar voren). Kermis: suikerspin (regen van 10 roze
koekjes), badeendje (onder het eendje 10-100 bonuspunten), dartpijl (ballon knapt, alle koekjes springen op), biertje
(10 s dronken camera `wiebelT`/`camBasis` en dubbele punten), P-knuffel (roze knuffel met lief snoetje, speels houden; een
grote stuitert over de tafel, +10 munten). Schatkamer (tafel van 1000 munten): diamant (100 punten, 25 munten, fonkeling), zilveren
ring (8 gouden koekjes), parelketting (10 parelkoekjes, code 6, 4 punten), gouden armband (rolt over de tafel), klomp goud
(30 munten). Winternacht: sneeuwpop (20 s muurtjes en ijsblauwe tafel, `vries`), cadeautje (15 munten, een
gebakje of een zak kolen), rendier (trekt een slee over de tafel, `sleeRit`; geen rode neus, "dat is zijn neef"), kerstbal
(8 kerstkoekjes, code 7, 5 punten); Bakkerij: taart (25 punten extra en een deuntje), deegroller (rolt over de hele breedte, `rolOver`), muisje
(pikt 3 koekjes, laat 10 munten achter, `muisRoof`). Ruimte: ufo (straalt 3 koekjes naar de opvangbak, `ufoStraal`),
meteoriet (inslag, `inslag`), alien (12 s lage zwaartekracht, `laagT`). Snoepland (10.000 munten, gebakjes vaker): gummibeer (stuitert, `stuiter`), chocoladefontein (14 chocoladekoekjes),
lolly (draaikolk), zuurstok (veegt de voorkant leeg). Dino-eiland (25.000, koekjesfiguren vaker): T-rex (aardbeving),
dino-ei (babydino waggelt over de tafel), vulkaan (15 koekjes uit de lucht), fossiel (45 munten). Onderwaterwereld (50.000,
bubbels, items geven 10 munten): octopus (zet 5 koekjes in de bak, `grijp`), haai (hapt 4 koekjes weg, laat 20 munten achter),
schelp (10 parelkoekjes), duikboot (sonar-golven). Drakenburcht (tafel van 100.000 munten, oranje
vonken die opstijgen `vonken`, items vaker `ITEM_KANS_DRAAK` en meer gouden koekjes): drakenei (babydraakje laat 6 gouden
koekjes vallen), draak (vliegt over en spuwt vuur: alle gewone koekjes op tafel worden goud, `drakenvuur`), schatkist (50
munten), toverkristal (20 s driedubbele punten, `driesT`); sieraden glanzen met een eigen omgevingskaart (`glans`, alleen op die materialen). De badgeteller telt de
15 gewone plus 2 per item van de tafels die je hebt (`badgeTotaal`). Eigen badgenamen met `b1`/`b5`. Een nieuw item = regel in `ITEMS` met
`maak()` (3D-model, origin in het midden) en `doe()`. Plannen: tafels (ook kerst), extra krachten, badges met niveaus.

## Orkenstorm 3D (`orkenstorm3d/`)
Wat er hierna gebouwd wordt (namen per speler, tussenstukjes tussen levels, twee blokken op de
startpagina, level 5 en 6) staat in `orkenstorm3d/PLAN.md`. Lees dat eerst.

De pc-versie van Orkenstorm, in 3D. Level 1 (Het nieuwe dorp), 2 (De orks komen eraan), 3 (De gevangen
werkers), 4 (De Donkere Mijnen), 5 (Het Woud van Wilgendaal), 6 (De belegerde abdij), 7 (De toren van Morvan), 8 (Het Zwarte Moeras), 9 (De Tempel der Verdoemden), 10 (De twee orkensteden) en 11 (De Zwarte Rots) zijn speelbaar: alle levels uit
`orkenstorm.html` zitten erin (`BINNENKORT` is leeg; na level 11 zegt het eindscherm dat je het spel hebt uitgespeeld).
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
  Extra velden: `spreker` (een werker vertelt eerst iets), `grappen` (deze grappen eerst; 7 s per grap, `STAP`, de lengte rekent zich zelf uit), `voorop` (deze soort gaat zeker mee, bv. de ridders in 5 → 6).
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
- Aanraakscherm tijdens het bouwen: vinger op de schaduw = schaduw verslepen (`neer.sleep`, de camera staat dan stil),
  loslaten bouwt nog niet; bouwen met ✔ Bouw hier (`#bouwbalk`, `bouwHier` in spel.js, grijs als het daar niet kan) of een
  tik op de schaduw; ✕ = stoppen. Muurstukken op een aanraakscherm ook met schaduw; daarna schuift de schaduw een vakje
  verder in dezelfde richting (`G.vorigeMuur`, `G.muurRichting`). Met de muis blijft het één klik per muurstuk.
- Gebouwen waar vanaf de camera een mannetje achter staat, worden half doorzichtig (`doorzichtig` in main.js, eigen kopie
  van de materialen per gebouw); keuzeringen hebben `depthTest: false` en zijn dus altijd zichtbaar.
- De muur is smal: castle `wall-narrow-corner` als paal in het midden met een half `wall-narrow` naar elke buurmuur
  (`muurVorm` in modellen.js, opnieuw opgebouwd als de buren veranderen; het blijft wel een heel vakje dat je blokkeert).

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
- De belegerde abdij (level 6, kaart 32x36, rivier van noord naar zuid met bruggen die van west naar oost lopen: `dwars` in main.js):
  `siege: 1`, `keep: 'abdij'` (valt de abdij, dan verloren), `camAt` (camera begint bij de ridders). Rovers met `'raid'` in `o` belegeren
  de abdij (`u.siege`); zijn ze weg, dan `G.saved` (400 goud en 100 hout, golven beginnen) en traint de abdij soldaten en genezers. Daarvoor
  knippert er "Help ons!" boven de abdij (`m.help`). Winnen: alle drie roverkampen (`camps`, BLD `roverkamp`) en alle rovers weg.
  Golven komen ook uit roverkampen (`waves.units`). Abdij = graveyard crypt-large met dak en kruis, castle-toren met puntdak, grafkruisjes,
  bankje en een zwaaiende monnik (`monnik`, bruine kap). Rover = mens met donkerrode kap, zwart maskertje, mes en buitzak; roverschutter =
  boogschutter met kap en maskertje. Roverkamp = forest tentjes, kampvuur, gestolen kisten en een zwarte vlag. Tussenstukje 5 → 6: een bode.
- De toren van Morvan (level 7, `dungeon: 1`, `tower: 1`, kaart 30x34): drie verdiepingen onder elkaar op één kaart (`floors` = bovenste
  rij van verdieping 1, 2, 3; `verdieping(o)` in spel.js). Mannetjes zien en vechten alleen op hun eigen verdieping (`zelfde`). Op een trap
  omhoog (`U`, `stairs: [{ from, to, naar }]`) sta je meteen op de volgende verdieping (`trap(u)`), de camera gaat mee (`G.trapSprong`);
  boven elke trap een geel ↑-pijltje (`trapPijlen`, pas te zien als ontdekt). Paarse sfeer (`toren` in main.js), hooguit 8 fakkellampen.
  Tovenaar (`magier`): mens met blauwe punthoed en staf, vuurballen (`fire`, fx `vuur`), toverkracht `u.mana` (0-100, +1 per 20 beelden);
  paneelknoppen 🔥 Vuurregen (80, daarna een plek kiezen, `G.cast`, `G.regens`, fx `meteoor`, max 9 vakjes ver) en 💧 Waterwezen (60,
  `watergeest` vecht 45 s mee, `u.ttl`). Vijanden: demon (`demoon`, rode ork met hoorntjes en fladderende vleugels), waterwezen (`water`,
  graveyard ghost, doorzichtig blauw, zweeft), Morvan (graveyard vampire, groot, paarse punthoed en staf; roept elke 15 s 2 demonen op
  als je dichtbij bent). Winnen: Morvan verslagen; verliezen: je hele groep weg. Kleur van een Kenney-figuur: `tint(model, kleur, doorzicht)`.
  Tussenstukje 6 → 7: een soldaat vertelt wat de monniken weten.
- Het Zwarte Moeras (level 8, `moeras: 1`, kaart 36x40): moerastegels `m` (half zo snel: x0.55 in `moveAlong`), wegtegels `r` (x1.45).
  Gebouw `weg` (5 goud): net als de muur stukje voor stukje (`reeks` in `klik`), alleen op `.`, `m` of `s`; andere gebouwen niet op `m`
  (`canPlace`). Een weg in aanbouw (planken, `MODEL.weg`, geen steigers) blokkeert niet en wordt niet aangevallen; klaar = de tegel wordt `r`
  en het gebouw verdwijnt (`G.mapVersie++`, de grond wordt opnieuw getekend). Moeras in 3D: donkere olijfgrond met plasjes, lisdodden
  (InstancedMesh), troebel groen water, grauwe nevel. Winnen: alle hutten, orkentorens en orks weg. Tussenstukje 7 → 8 (in de toren, `zonder`
  plassen/eekhoorn): een soldaat leest in de boeken van Morvan.
- De Tempel der Verdoemden (level 9, `army: 1`, `graves: 1`, kaart 32x34): geen gebouwen en geen grondstoffen, alleen een vast leger (ridders,
  soldaten, boogschutters, genezer, 2 tovenaars, katapult; knop Hele groep). Vijandelijke gebouwen staan in `ob` (BLD `tempel`, 1400 levens:
  graveyard crypt-small met dak, zuilen, obelisk, altaar en vuurmanden met groene vlammen, `kenneyTempel`). Graven `g` in de kaart
  (`maakGraf2`: aardehoop + grafsteen); elke 9 s laat elke orkpriester (`orkpriester`: ork met zwarte kap, groene oogjes, schedelstaf,
  vuurballen) 2 skeletten opstaan uit het dichtstbijzijnde graf als je leger binnen 13 vakjes is (max 20 skeletten; het graf schudt,
  `G.graafOpen`). Winnen: tempel weg, priesters weg en geen vijanden meer; verliezen: hele leger weg. Onweerslucht. Tussenstukje 8 → 9: een gevangen ork praat.
- De twee orkensteden (level 10, kaart 40x44): twee steden achter de rivier met palissaden (BLD `orkmuur` in `ob`, survival fence-fortified,
  gedraaid naar de buren, schuin bij diagonale stukken; je mannetjes slaan er vanzelf een gat in als er geen weg is). Magiërstoren (BLD
  `magiertoren`, 150/100: castle zeshoekige toren met paars dak, gloeiende bol en sterretjes) traint tovenaars (`magier` 120/20). Golven met
  `waves.units` en `cat: 1`: elke derde golf een orkenkatapult (`orkkatapult`, rood getinte castle-katapult met orkenvlag, schiet op gebouwen).
  Winnen: alle hutten, torens en orks weg. Tussenstukje 9 → 10.
- De Zwarte Rots (level 11, `heksen: 1`, kaart 40x44): zwarte rots `b` (lopen mag, bouwen niet) en lava `L` (blokkeert; gloeiend vlak dat
  pulseert, `lavaMesh`, plus wat oranje lampjes), rode lucht en donkere rookwolken. Orkenheksen (`orkheks`: groen getinte ork met groene
  punthoed en gifstaf, vuurballen) roepen elke 13 s een demon en elke 10 s een gifwolk op je mannetjes binnen 7 vakjes (`G.gif`, 3 s, 4 schade
  per halve seconde, groene bollen in `syncGif`). Opperork Zwartvuist (`zwartvuist`, 750 levens: grote ork met gouden hoornkroon, rode cape,
  reuzenbijl). Palissade rond zijn vesting (`ob`). Winnen: Zwartvuist verslagen en alle hutten weg. Tussenstukje 10 → 11.
- Repareren: werkers kiezen en op een beschadigd eigen gebouw klikken (`teDoen` in spel.js: niet af óf beschadigd). Half zo snel als
  bouwen, kost samen 40% van de bouwprijs (`HERSTEL`, betaald per stukje; kasteel en abdij zonder prijs: max/4 goud, max/8 hout).
  Geen geld meer = de werker stopt. Status "repareert", tip in het paneel bij een beschadigd gebouw.
- Plan deel 2 (nog niet bouwen, eerst deel 1 uitspelen): over zee met haven, scheepswerf, vis als grondstof, schepen, buskruit
  (kanontoren, springstof), vliegers, en uitgebreide upgrades (kasteel → burcht → vesting, smid in 3 stappen). Eigen namen gebruiken.
- Level 5 heet in 2D "Het Woud van Elwynn"; Elwynn is een Warcraft-naam. In 3D heet het "Het Woud van Wilgendaal".
  Gebruik eigen namen en teksten, geen namen of verhaalteksten uit Warcraft (auteurs- en merkrecht).
- Blocky Characters en animated-characters-protagonists: moderne figuurtjes, passen niet.
- "Modellen: Kenney.nl" staat op het titelscherm.

## Gedeeld met de Leerhoek (deweef/leren)
Het scorebord-script (`extra/scorebord.gs`) en de Scores-app (`scores/`) worden ook gebruikt door de Leerhoek,
de oefensite van Ben en Dana (https://deweef.github.io/leren/, eigen `CLAUDE.md` in die repo). Daar stuurt
`leerlog.js` per bezoek een regel naar `doPost` (`actie=leer`, tabblad 'Leerhoek'); dat logboek is geheim voor de
kinderen en alleen te zien in de spreadsheet en de Scores-app (tab Leren). Pas bij een wijziging aan het script of
de app dus op dat de Leerhoek blijft werken (namen ben/dana/marcel/anja; oude regels heten 'Ouder' en tellen in de app als Marcel; velden vak/min/wat/stand, `VAK` voor de
vaknamen in `scores/index.html`). Het script bewaart ook de voortgang van de Leerhoek per persoon, zodat die op elk apparaat gelijk is
(`actie=bewaar` via POST, `?actie=stand&naam=..` via GET, tabblad 'Leerhoek opslag', JSON in stukken van 40.000 tekens). Na een wijziging aan het script plakt Marcel de code zelf in Apps Script en kiest
Implementaties beheren → potlood → Nieuwe versie (dan blijft de URL gelijk); zet de volledige code in de chat.
