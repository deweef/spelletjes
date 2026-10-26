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
- Elk spel heeft een eigen uitlegbestand met de details. **Lees dat eerst als je aan dat spel werkt** (en werk het bij):
  | Spel | Uitleg | Plan / open punten |
  |---|---|---|
  | Fladderfeest | `uitleg/fladderfeest.md` | |
  | Fotopuzzel | `uitleg/fotopuzzel.md` | |
  | Zoekplaatje | `zoek/CLAUDE.md` | `zoek/IDEEEN.md` |
  | Pizzabaas | `pizza/CLAUDE.md` | `pizza/PLAN.md` |
  | Songfestival-hits | `songfestival/CLAUDE.md` | `songfestival/PLAN.md` |
  | Koekjesschuiver 3D | `koekjesschuiver3d/CLAUDE.md` | |
  | Orkenstorm 3D | `orkenstorm3d/CLAUDE.md` | `orkenstorm3d/PLAN.md` |
  | Keukenplanner (geen spel, niet op de startpagina) | `keuken/LEESMIJ.md` | |
  Plaatjes maken met Gemini (opdrachten, uitknippen met `extra/knip_figuren.py`, bewaren): `uitleg/gemini-en-plaatjes.md`.
  De oude 2D-spellen (kasteelsprong, koekjesschuiver, kikkersprong, skirun, piratenbluf, orkenstorm) hebben geen uitlegbestand.
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

## Online scorebord (voor alle spellen)
Google Spreadsheet van Marcel met het Apps Script uit `extra/scorebord.gs` (web-app, voor alle spellen;
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

## Kenney-modellen (CC0)
De Kenney-pakketten (CC0) staan als zip in de centrale map `bronnen/` (zie `bronnen/LEESMIJ.md` voor welk
pakket bij welk spel hoort; zips die in de hoofdmap geüpload worden, daarheen verplaatsen). kenney.nl is
vanuit de cloudomgeving niet bereikbaar. Gebruik de bestanden uit `Models/GLB format/` en kopieer alleen
wat het spel echt gebruikt naar `orkenstorm3d/assets/<pakket>/`, samen met `Textures/colormap.png` van dat
pakket (elk pakket heeft een eigen colormap met dezelfde naam). Zet nieuwe modellen ook in `LIJST` in
`js/kenney.js`.

## Werkwijze
- **Elke sessie moet deweef/spelletjes als repository hebben** (niet alleen Muziek), anders kan er niet gepusht worden en is
  er alleen een kopie zonder schrijfrechten. Zie `NIEUW-GESPREK.md`. Merk je dat de repo ontbreekt of pushen een 403 geeft:
  meld het meteen aan Marcel en werk niet stilletjes op een kopie verder.
- Er kunnen meerdere sessies tegelijk werken (één per spel). Altijd `git pull --rebase origin main` vóór het pushen, en
  alleen de bestanden van je eigen spel aanpassen (plus `spellen.json`/`index.html` als dat echt moet).
- Andere gesprekken van Marcel kun je inzien met `list_sessions`/`list_events` (claude-code-remote), bijvoorbeeld om een
  plaatje of afspraak terug te vinden; zet wat je vindt daarna in de repo.
- Afspraken die in een gesprek gemaakt worden, horen in het uitleg- of planbestand van dat spel (zie de tabel hierboven):
  een volgend gesprek kan oude gesprekken niet teruglezen.
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

## Gedeeld met de Leerhoek (deweef/leren)
Het scorebord-script (`extra/scorebord.gs`) en de Scores-app (`scores/`) worden ook gebruikt door de Leerhoek,
de oefensite van Ben en Dana (https://deweef.github.io/leren/, eigen `CLAUDE.md` in die repo). Daar stuurt
`leerlog.js` per bezoek een regel naar `doPost` (`actie=leer`, tabblad 'Leerhoek'); dat logboek is geheim voor de
kinderen en alleen te zien in de spreadsheet en de Scores-app (tab Leren). Pas bij een wijziging aan het script of
de app dus op dat de Leerhoek blijft werken (namen ben/dana/marcel/anja; oude regels heten 'Ouder' en tellen in de app als Marcel; velden vak/min/wat/stand, `VAK` voor de
vaknamen in `scores/index.html`). Het script bewaart ook de voortgang van de Leerhoek per persoon, zodat die op elk apparaat gelijk is
(`actie=bewaar` via POST, `?actie=stand&naam=..` via GET, tabblad 'Leerhoek opslag', JSON in stukken van 40.000 tekens). Na een wijziging aan het script plakt Marcel de code zelf in Apps Script en kiest
Implementaties beheren → potlood → Nieuwe versie (dan blijft de URL gelijk); zet de volledige code in de chat.
