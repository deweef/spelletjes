# Zoekplaatje (`zoekplaatje.html`, plaatjes in `zoek/`)

Open ideeën: `zoek/IDEEEN.md`. Gemini-prompt en links: `zoek/LEESMIJ.md`.

Zoekplaatje (`zoekplaatje.html`, concept): zoek de voorwerpen van een level (per potje willekeurig `PER_POTJE` = 25 uit alles wat in het plaatje staat, dus meer voorwerpen = meer afwisseling; teller "🔍 nog N" via `totaal`/`zetTeller`) in een druk
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
